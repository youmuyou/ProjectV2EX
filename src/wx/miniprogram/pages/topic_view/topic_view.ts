import { Cache } from '../../utils/cache';
import { TopicParser } from '../../utils/topicparser';
import { HttpRequest } from '../../core/net/httpRequest';
import { User } from '../../core/net/user';


let cache = new Cache();
let parser = new TopicParser();
let httpRequest = new HttpRequest();
let user = new User();

let sender: any;
let subtleList: ISubtle[] = [];
let once: number = 0;

interface ISubtle {
  title: string;
  content: string;
}


let isLoading = true;
function SetLoading(sw: boolean, title: string = "加载中") {
  isLoading = sw;
  if (sw) {
    wx.showLoading({
      title: title,
    });
  }
  else {
    wx.hideLoading();
  }
  return isLoading;
}

/**
 * 获取帖子HTML
 */
function GetTopicHtml(id: number) {
  SetLoading(true);

  httpRequest.getRequest('https://www.v2ex.com/t/' + id, null, (res: any) => {
    SetLoading(false);
    console.log("已加载html");
    //console.log(res.data);
    sender.setData({
      html: res.data
    });
    //读取附言
    requestSubtle(res.data.toString());
    //再次读取正文
    getContent();
    //获取一次验证
    // getOnce();
  }, "GET");
}


Page({

  data: {
    topic: null,
    html: '',
    subtle: [],
    isHasContent: true,
    discussAnimationData: {},
    inputAnimationData: {},
    discussText: ''
  },
  onLoad() {
    sender = this;
    subtleList = [];
    let topicData = cache.take("topic");
    //测试无正文
    //topicData.content_rendered = "";
    if (topicData.content_rendered == "") {
      sender.setData({
        isHasContent: false
      })
    }
    else {
      //console.log(topicData.content_rendered);
      topicData.content_rendered = parser.parse(topicData.content_rendered);
    }
    sender.setData({
      topic: topicData
    })
    //读取帖子html
    GetTopicHtml(topicData.id);
    //动画
    var openDiscussAnimation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })
    sender.openDiscussAnimation = openDiscussAnimation
    var closeDiscussAnimation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })
    sender.closeDiscussAnimation = closeDiscussAnimation
    var openDiscussInputAnimation = wx.createAnimation({
      duration: 100,
      timingFunction: 'ease',
    })
    sender.openDiscussInputAnimation = openDiscussInputAnimation
    var closeDiscussInputAnimation = wx.createAnimation({
      duration: 100,
      timingFunction: 'ease',
    })
    sender.closeDiscussInputAnimation = closeDiscussInputAnimation
    //读取暂存评论
    sender.setData({
      discussText: getDiscuss()
    })
  }, onDiscussFocus(value: any, height: any) {
    console.log(value, height);
    //sender.openDiscussAnimation.height((140 + value.detail.height) + "px").step()
    sender.openDiscussAnimation.height("140px").step()
    sender.openDiscussInputAnimation.height("68px").step()
    sender.setData({
      discussAnimationData: sender.openDiscussAnimation.export(),
      inputAnimationData: sender.openDiscussInputAnimation.export()
    })
  }, onDiscussLostFocus(value: any, curror: any) {
    saveDiscuss(value.detail.value);
    console.log(value, curror);
    sender.closeDiscussAnimation.height("40px").step();
    sender.closeDiscussInputAnimation.height("40px").step()
    sender.setData({
      discussAnimationData: sender.closeDiscussAnimation.export(),
      inputAnimationData: sender.closeDiscussInputAnimation.export()
    })
  }, onPostDiscuss() {
    once = wx.getStorageSync("once");
    console.log("评论:"+sender.data.discussText);
    console.log("once:"+once);
    SetLoading(true, "正在提交评论...");
    user.postDiscuss(sender.data.topic.id, sender.data.discussText, once, (res: any) => {

      console.log(res.data);
      if (res.data.indexOf("<title>V2EX</title>") != -1) {
        //没有成功，再来
        getOnce(res.data);
        console.log("再次重新提交");
        SetLoading(false);
        /*user.postDiscuss(sender.data.topic.id, sender.data.discussText, once, (res2: any) => {
          SetLoading(false);
          console.log(res2.data);
        });*/
      }
      else {
        SetLoading(false);
      }
    });
  }
})
/*获取附言 */
function requestSubtle(html: string) {
  let Reg: any = /<div class="subtle">([\s\S]*?)<\/div>\s<\/div>/g;
  //测试debug let Reg: any = /<div class="subtle">([\s\S]*?)<\/div><\/div>/g;

  let subtleArray: any[] | null = html.match(Reg);
  if (subtleArray != null) {
    subtleArray.forEach((item: any) => {
      //console.log(item);
      let contentReg: any = /<div class="topic_content">([\s\S]*?)<\/div>/g;
      let titleReg: any = /<span class="fade">(.*?)<\/span>/g;
      let subtleItem: ISubtle = {
        title: titleReg.exec(item)[1],
        content: parser.parse(contentReg.exec(item)[1])
      };
      subtleList.push(subtleItem);
      //console.log(subtleItem);
      //从html中删除
      sender.setData({
        html: sender.data.html.replace(item, "")
      });
    });
    sender.setData({
      subtle: subtleList
    });
  }

}

/**
 * 获取帖子正文
 */
function getContent() {
  if (sender.data.topic.content_rendered == "") {
    console.log("二次提取正文");
    let contentReg: any = /<div class="topic_content">([\s\S]*?)<\/div>/g;
    let content = contentReg.exec(sender.data.html);
    if (content) {

      let contentHtml = content[1];

      if (contentHtml.length > 0) {
        let topicData = sender.data.topic;
        contentHtml = contentHtml.replace("<div class=\"markdown_body\">", "");
        topicData.content_rendered = parser.parse(contentHtml);
        sender.setData({
          topic: topicData,
          isHasContent: true
        })
      }
    }

  }
}

/**
 * 获取一次验证码
 */
function getOnce(html: string = "") {
  console.log("获取一次验证码");
  if (html == "") {
    html = sender.data.html;
  }
  let reg: any = /<input(.*?)value="(.*?)" name="once"/g;
  let onceReg = reg.exec(html);
  if (onceReg) {
    once = onceReg[2];
  }
  console.log(once);
}
/**
 * 保存评论内容
 */
function saveDiscuss(value: string) {
  sender.setData({
    discussText: value
  })
  wx.setStorageSync("discuess_" + sender.data.topic.id, value);
}
function getDiscuss() {
  let d = wx.getStorageSync("discuess_" + sender.data.topic.id);
  return d ? d : "";
}