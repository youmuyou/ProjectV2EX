import { HttpRequest } from '../../core/net/httpRequest';
let httpRequest = new HttpRequest();

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
  signOut() {
    //清除个人信息
    wx.removeStorageSync("userInfo");
    //清除cookie
    wx.removeStorageSync("cookie");
  }
  /**
   * 请求当前用户用户名，用于判断是否登录
   */
  requestUserName(callback: any = null) {
    console.log("正在获取个人信息");
    httpRequest.getRequest("https://www.v2ex.com/settings", '', (e: any) => {
      let result=false;
      if (e.data.indexOf("你要查看的页面需要先登录") != -1) {
        wx.removeStorageSync("userInfo");
        console.log("未登录");
        
      } else if (e.data.indexOf("在短时间内的登录尝试次数太多，目前暂时不能继续尝试") != -1) {
        // wx.removeStorageSync("userInfo");
        console.log("登录受限");

      }
      else {
        //console.log(e.data);
        let formReg: any = /<form method="post" action="\/settings">([\s\S]*?)<\/form>/g;
        let formHtml = formReg.exec(e.data)[1];
        let trReg = /<tr>([\s\S]*?)<\/tr>/g;
        let trArray: string[] = formHtml.match(trReg);
        if (trArray.length > 0) {
          console.log("已匹配到了个人信息");
          //console.log(trArray);
          let usernameReg: any = /<td width="auto" align="left">(.*?)<\/td>/g;

          let member: IMember = {
            username: usernameReg.exec(trArray[0])[1],
            avatar_normal: ''
          }
          wx.setStorageSync("userInfo", member);
          console.log("获取一次验证码");
          let once = "";
          let reg: any = /<input(.*?)value="(.*?)" name="once"/g;
          let onceReg = reg.exec(e.data);
          if (onceReg) {
            once = onceReg[2];
          }
          if (once != "") {
            wx.setStorageSync("once", once);
            console.log("once:" + once);
          }
          result = true;
        }
        else {
          console.log("匹配失败");

        }

      }
      if(callback!=null){
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
      console.log("头像：" + avatar + ",节点收藏：" + nodes + ",主题收藏：" + topics + ",特别关注：" + following);
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
    let postdata = {
      content: content,
      once: once,
    };
    console.log(postdata);
    httpRequest.getRequest("https://www.v2ex.com/t/" + id, postdata, (e: any) => {
      callback(e);
    }, "POST", "application/x-www-form-urlencoded");
  }
}