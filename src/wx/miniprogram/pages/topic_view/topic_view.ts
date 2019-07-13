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
 * 请求主题的HTML内容
 */
function requestTopicHtml() {
  SetLoading(true);

  httpRequest.getRequest('https://www.v2ex.com/t/' + sender.data.topic.id + "?p=1", null, (res: any) => {
    SetLoading(false);
    sender.setData({
      html: res.data
    });
    //解析主题
    parseTopic();
    //获取附言
    getSubtle();
    //获取正文
    getContent();
    //获取状态
    getTopicState();
    //获取主题token
    getToken();
    //提取评论
    sender.setData({
      isLoadComments: true
    });
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
    discussText: '',
    isDiscussFocus: false,
    isLogin: false,
    isLoadComments: false
  },
  onLoad() {
    sender = this;
    subtleList = [];
    //设置登录状态
    sender.setData({
      isLogin: user.isLogin()
    });
    let topicData = cache.take("topic");
    //测试无正文
    //topicData.content_rendered = "";
    if (topicData.content_rendered == "") {
      sender.setData({
        isHasContent: false
      })
    }
    else {
      topicData.content_rendered = parser.parse(topicData.content_rendered);
    }
    sender.setData({
      topic: topicData
    })
    requestTopicHtml();
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
  },
  onDiscussFocus(value: any, height: any) {
    console.log(value, height);
    //sender.openDiscussAnimation.height((140 + value.detail.height) + "px").step()
    sender.openDiscussAnimation.height("140px").step()
    sender.openDiscussInputAnimation.height("68px").step()
    sender.setData({
      discussAnimationData: sender.openDiscussAnimation.export(),
      inputAnimationData: sender.openDiscussInputAnimation.export()
    })
  },
  onDiscussLostFocus(value: any, curror: any) {
    saveDiscuss(value.detail.value);
    console.log(value, curror);
    sender.closeDiscussAnimation.height("40px").step();
    sender.closeDiscussInputAnimation.height("40px").step()
    sender.setData({
      discussAnimationData: sender.closeDiscussAnimation.export(),
      inputAnimationData: sender.closeDiscussInputAnimation.export()
    })
  },
  onPostDiscuss: function (e: any) {
    let formData = e.detail.value;
    saveDiscuss(formData["content"]);
    once = wx.getStorageSync("once");

    SetLoading(true, "正在提交评论...");
    user.postDiscuss(sender.data.topic.id, sender.data.discussText, once, (issuccess: boolean, msg: any) => {
      if (!issuccess) {
        //失败了再次尝试
        user.postDiscuss(sender.data.topic.id, sender.data.discussText, once, (issuccess: boolean, msg: any) => {
          if (issuccess) {
            removeDiscuss();
            //尝试刷新评论
            requestTopicHtml();
          }
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          })
          SetLoading(false);
        });
      }
      else {
        //尝试刷新评论
        requestTopicHtml();
        removeDiscuss();
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        })
        SetLoading(false);
      }
    });
  },
  onAtEvent: function (e: any) {
    let username = e.detail;
    let atcomment = getDiscuss();
    if (atcomment.indexOf("@" + username) == -1) {
      saveDiscuss("@" + username + " " + atcomment);
    }

    sender.setData({
      isDiscussFocus: true
    });
  },
  onAction: function (e: any) {
    let action: any = e.currentTarget.dataset.action;
    if (action == "mark") {
      let actionText = sender.data.topic.isMark ? "是否取消收藏主题？" : "是否确认收藏主题";
      wx.showModal({
        title: '提示',
        content: actionText,
        success(res: any) {
          if (res.confirm) {
            wx.showLoading({
              title: "正在操作..."
            })
            user.requestMarkTopic(sender.data.topic.token, !sender.data.topic.isMark, () => {
              let topic: ITopic = sender.data.topic;
              topic.isMark = !topic.isMark;
              sender.setData({
                topic: topic
              });
              //刷新帖子
              requestTopicHtml();
              wx.hideLoading();
            });
          }
        }
      });
    }
    else if (action == "love" && !sender.data.topic.isLove) {
      wx.showModal({
        title: '提示',
        content: "是否向主题创建者发送爱心",
        success(res: any) {
          if (res.confirm) {
            wx.showLoading({
              title: "正在操作..."
            })
            user.sendTopicLove(sender.data.topic.token, () => {
              let topic: ITopic = sender.data.topic;
              topic.isLove = !topic.isLove;
              sender.setData({
                topic: topic
              });
              //刷新帖子
              requestTopicHtml();
              wx.hideLoading();
            });
          }
        }
      });
    }
  }
})
/*获取附言 */
function getSubtle() {
  let html = sender.data.html;
  let Reg: any = /<div class="subtle">([\s\S]*?)<\/div>\s<\/div>/g;
  //测试debug let Reg: any = /<div class="subtle">([\s\S]*?)<\/div><\/div>/g;

  let subtleArray: any[] | null = html.match(Reg);
  if (subtleArray != null) {
    subtleArray.forEach((item: any) => {
      let contentReg: any = /<div class="topic_content">([\s\S]*?)<\/div>/g;
      let titleReg: any = /<span class="fade">(.*?)<\/span>/g;
      let subtleItem: ISubtle = {
        title: titleReg.exec(item)[1],
        content: parser.parse(contentReg.exec(item)[1])
      };
      subtleList.push(subtleItem);
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
 * 获取正文
 */
function getContent() {
  if (sender.data.topic.content_rendered == "") {
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
 * 保存评论内容
 */
function saveDiscuss(value: string) {
  sender.setData({
    discussText: value
  })
  wx.setStorageSync("discuess_" + sender.data.topic.id, value);
}
function removeDiscuss() {
  sender.setData({
    discussText: ""
  })
  wx.removeStorageSync("discuess_" + sender.data.topic.id);
}
function getDiscuss() {
  let d = wx.getStorageSync("discuess_" + sender.data.topic.id);
  return d ? d : "";
}

/**
 * 获取主题状态对于我
 */
function getTopicState() {
  let markReg = /<a href=\"(.*?)\" class=\"op\">取消收藏<\/a>/g;
  let loveReg = /<span class="f11 gray"(.*?)>感谢已发送<\/span>/g;

  let topic: ITopic = sender.data.topic;
  topic.isMark = markReg.test(sender.data.html);
  topic.isLove = loveReg.test(sender.data.html);

  sender.setData({
    topic: topic
  });
}

function getToken() {
  let tokenReg = /<a href="\/(unfavorite|favorite)\/topic\/(.*?)" class="op">/g;
  let tokenRegRes = tokenReg.exec(sender.data.html);
  let topic: ITopic = sender.data.topic;
  topic.token = tokenRegRes ? tokenRegRes[2] : "";
  sender.setData({
    topic: topic
  });
}

/**
 * 解析主题（仅传入ID时辅助）
 */
function parseTopic() {
  let topicResult: ITopic = parser.getParseTopic(sender.data.html);
  let topic: ITopic = sender.data.topic;
  topic.title = topicResult.title;
  topic.node = topicResult.node;
  topic.member = topicResult.member;
  topic.created = topicResult.created;
  topic.click = topicResult.click;
  topic.replies = topicResult.replies;
  sender.setData({
    topic: topic
  });
}