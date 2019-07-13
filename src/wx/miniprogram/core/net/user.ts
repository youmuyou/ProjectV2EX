import { HttpRequest } from '../../core/net/httpRequest';
import { TopicParser } from '../../utils/topicparser';

let httpRequest = new HttpRequest();
let parser = new TopicParser();

export class User {
  isLogin(): boolean {
    if (this.getInfo() == null) {
      return false;
    }
    else {
      return true;
    }
  }
  getInfo(): IMember | null {
    let userInfo = wx.getStorageSync("userInfo");
    console.log("正在读取当前用户信息");
    console.log(userInfo);
    if (userInfo) {
      return userInfo;
    }
    return null;
  }
  /**
   * 退出登录，目前只是清除本地cookie，并非请求v2ex登出
   */
  signOut(callback: any = null) {
    let once = wx.getStorageSync("once");
    httpRequest.getRequest("https://www.v2ex.com/signout?once=" + once, null, (res: any) => {
      let isSuccess: boolean = false;
      if (res.data.indexOf("你已经完全登出，没有任何个人信息留在这台电脑上。") != -1) {
        isSuccess = true;
        //清除个人信息
        wx.removeStorageSync("userInfo");
        //清除cookie
        wx.removeStorageSync("cookie");
      }
      if (callback != null) {
        callback(isSuccess);
      }

    }, "GET");

  }
  /**
   * 请求当前用户用户名，用于判断是否登录
   */
  requestUserName(callback: any = null) {
    httpRequest.getRequest("https://www.v2ex.com/settings", '', (e: any) => {
      let result = false;
      if (e.data.indexOf("你要查看的页面需要先登录") != -1) {
        //未登录
        wx.removeStorageSync("userInfo");
      } else if (e.data.indexOf("在短时间内的登录尝试次数太多，目前暂时不能继续尝试") != -1) {
        //登录受限
      }
      else {
        let formReg: any = /<form method="post" action="\/settings">([\s\S]*?)<\/form>/g;
        let formHtml = formReg.exec(e.data)[1];
        let trReg = /<tr>([\s\S]*?)<\/tr>/g;
        let trArray: string[] = formHtml.match(trReg);
        if (trArray.length > 0) {
          //已登录
          let usernameReg: any = /<td width="auto" align="left">(.*?)<\/td>/g;

          let member: IMember = {
            username: usernameReg.exec(trArray[0])[1],
            avatar_normal: ''
          }
          wx.setStorageSync("userInfo", member);
          //获取once
          let once = "";
          let reg: any = /<input(.*?)value="(.*?)" name="once"/g;
          let onceReg = reg.exec(e.data);
          if (onceReg) {
            once = onceReg[2];
          }
          if (once != "") {
            wx.setStorageSync("once", once);
          }
          result = true;
        }
        else {
          //获取个人信息失败，可能是网站发生了变化
        }

      }
      if (callback != null) {
        callback(result);
      }
    }, "GET");
  }

  /**
   * 请求当前用户信息
   */
  requestUserInfo(username: string, callback: any) {
    httpRequest.getRequest("https://www.v2ex.com/member/" + username, '', (e: any) => {
      let avatarReg: any = /<img loading="lazy" src="(.*?)"(.*?)>/g;
      let avatar = avatarReg.exec(e.data)[1];

      let biggerReg: any = /<span class="bigger">(.*?)<\/span>/g;
      //获取节点收藏数
      let nodesReg: any = /<a href="\/my\/nodes" class="dark" style="display: block;">([\s\S]*?)<\/a>/g;
      let nodesHtml = nodesReg.exec(e.data)[1];
      let nodes = biggerReg.exec(nodesHtml)[1];
      //获取主题收藏数
      biggerReg = /<span class="bigger">(.*?)<\/span>/g;
      let topicsReg: any = /<a href="\/my\/topics" class="dark" style="display: block;">([\s\S]*?)<\/a>/g;
      let topicsHtml = topicsReg.exec(e.data)[1];
      let topics = biggerReg.exec(topicsHtml)[1];
      //获取特别关注数
      biggerReg = /<span class="bigger">(.*?)<\/span>/g;
      let followingReg: any = /<a href="\/my\/following" class="dark" style="display: block;">([\s\S]*?)<\/a>/g;
      let followingHtml = followingReg.exec(e.data)[1];
      let following = biggerReg.exec(followingHtml)[1];
      //console.log("头像：" + avatar + ",节点收藏：" + nodes + ",主题收藏：" + topics + ",特别关注：" + following);
      let userInfo = this.getInfo();
      if (userInfo != null) {
        let member: IMember = {
          username: userInfo.username,
          avatar_normal: "https:" + avatar,
          mynodes: nodes,
          mytopics: topics,
          myfollowing: following
        }
        wx.setStorageSync("userInfo", member);
        callback(member);
      }
    }, "GET");
  }

  /**
   * 提交评论
   */
  postDiscuss(id: number, content: string, once: number, callback: any) {
    let postdata: any = {};
    postdata["content"] = content;
    postdata["once"] = once;
    console.log(postdata);
    httpRequest.getRequest("https://www.v2ex.com/t/" + id, postdata, (res: any) => {
      if (res.data.indexOf("<div class=\"problem\">创建新回复过程中遇到一些问题：<ul><li>你回复过于频繁了，请稍等") != -1) {
        callback(false, "回复过于频繁，已被限制");
      }
      else if (res.data.indexOf("type=\"submit\" value=\"回复主题\"") != -1) {
        //没有成功
        callback(false, "回复失败，请重试");
      }
      else {
        //评论成功
        callback(true, "回复成功");
      }

    }, "POST", "application/x-www-form-urlencoded");
  }

  sendLove(id: number, callback: any) {
    let once = wx.getStorageSync("once");
    let postdata: any = {};
    postdata["once"] = once;
    //console.log(postdata);
    httpRequest.getRequest("https://www.v2ex.com/thank/reply/" + id + "?once=" + once, postdata, (res: any) => {
      //console.log(res);
      callback(res.data.success);

    }, "POST", "application/x-www-form-urlencoded");
  }

  /**
   * 请求新的once
   */
  requestOnce() {
    this.requestUserName();
  }

  postTopic(callback: any, node: string, title: string, content: string = "") {
    let postdata: any = {};
    let once = wx.getStorageSync("once");
    postdata["content"] = content;
    postdata["title"] = title;
    postdata["once"] = once;
    console.log(postdata);
    httpRequest.getRequest("https://www.v2ex.com/new/" + node, postdata, () => {
      //没法测试是否成功，怕被ban。。。
      //console.log(res);
      //console.log(res.data);
      callback(true);

    }, "POST", "application/x-www-form-urlencoded");
  }
  /**
   * 获取我收藏的帖子
   */
  requestMyTopics(callback: any, page: number = 1) {
    httpRequest.getRequest("https://www.v2ex.com/my/topics?p=" + page, "", (e: any) => {
      let topics = parser.getMatchMarkTopics(e.data);
      //获取当前页和最大页
      let currentPageReg = /<a href=\"\/my\/topics\?p=([0-9]{1,10})\" class=\"page_current\">/g;
      let currentPageRegRes = currentPageReg.exec(e.data);
      let maxPageReg = /<input type=\"number\" class=\"page_input\"(.*?)max=\"(.*?)\"/g;
      let maxPageRegRes = maxPageReg.exec(e.data);
      let pageIndex: number = currentPageRegRes ? parseInt(currentPageRegRes[1]) : 1;
      let maxPage: number = maxPageRegRes ? parseInt(maxPageRegRes[2]) : 1;
      callback(topics, pageIndex, maxPage);
    }, "GET");
  }

  /**
   * 收藏主题
   */
  requestMarkTopic(token: string, isMark: boolean, callback: any) {
    let action = isMark ? "favorite" : "unfavorite";
    if (token != "") {
      httpRequest.getRequest("https://www.v2ex.com/" + action + "/topic/" + token, null, (res: any) => {
        callback(res);
      }, "GET");
    }
    else {
      callback(false);
    }
  }

  /**
   * 给主题发送爱心
   */
  sendTopicLove(token: string, callback: any) {
    let postdata: any = {};
    let start = token.indexOf("=") + 1;
    postdata["t"] = token.substr(start, (token.length - start));
    console.log(postdata);
    httpRequest.getRequest("https://www.v2ex.com/thank/topic/" + token, postdata, (res: any) => {
      //console.log(res);
      callback(res);
    }, "POST", "application/x-www-form-urlencoded");
  }

  /**
   * 获取未读提醒数
   */
  requestTips(callback: any) {
    httpRequest.getRequest("https://v2ex.com/more", null, (res: any) => {
      let msgReg = /<title>(.*?)\(([0-9]{1,20})\)(.*?)<\/title>/g;
      let msgRegRes = msgReg.exec(res.data);
      let tips: number = msgRegRes ? parseInt(msgRegRes[2]) : 0;
      callback(tips);
    }, "GET");
  }
}