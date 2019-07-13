import { TopicParser } from '../../utils/topicparser';
import { User } from '../../core/net/user';
import { HttpRequest } from '../../core/net/httpRequest';

let parser = new TopicParser();
let user = new User();
let httpRequest = new HttpRequest();
let commentList: IComment[] = [];
let commentInfo: ICommentInfo = {
  count: 0,
  index: 0,
  pageTotal: 0
};
let sender: any;

/**
 * 评论基本信息
 */
interface ICommentInfo {
  /**
   * 评论总条数
   */
  count: number;
  /**
   * 当前所在页数
   */
  index: number;
  /**
   * 总页数
   */
  pageTotal: number;
}

/**
 * 评论模型
 */
interface IComment {
  /**
   * 用户名
   */
  username: string;
  /**
   * 时间
   */
  time: string;
  /**
   * 评论内容
   */
  content: string;
  /**
   * 楼层
   */
  index: number;
  /**
   * 头像链接
   */
  avatar: string;
  /**
   * 感谢
   */
  love: number;
  /**
   * 是否已点赞
   */
  ismylove: boolean;
  replyId: number;
  /**
   * 是否是主题创建者
   */
  isCreater?: boolean;
}



Component({
  properties: {
    "topicId": {
      type: Number,
      value: 0
    },
    "topicComments": {
      type: Number,
      value: 0
    },
    "topicHtml": {
      type: String,
      value: ""
    },
    "topicCreater": {
      type: String,
      value: ""
    },
    "isLoadComments": {
      type: Boolean,
      value: false
    }
  },
  data: {
    comments: [],
    commentinfo: null,
    html: '',
    isHasMore: false,
    isShowDialog: false,
    atComments: []
  },
  methods: {
    onLoadComment: function () {
      console.log('加载下一页评论');
      sender.setData({
        isHasMore: false
      })
      if (commentInfo.index + 1 <= commentInfo.pageTotal) {
        requestPageComments(commentInfo.index + 1);
      }
    },
    onAction: function (res: any) {
      let index = res.currentTarget.dataset.index;
      let t = res.currentTarget.dataset.t;
      let comment: IComment = t == "0" ? sender.data.atComments[index] : sender.data.comments[index];
      let actionList = ['发送爱心', '@' + comment.username, '复制'];
      if (comment.ismylove) {
        actionList = ['已发送爱心', '@' + comment.username, '复制'];
      }
      if (isHasAt(comment.content)) {
        actionList.push("查看对话");
      }
      wx.showActionSheet({
        itemList: actionList,
        success(res) {
          if (res.tapIndex == 0 && !comment.ismylove) {
            if (comment.replyId != 0) {
              wx.showLoading({
                title: "正在发送爱心...",
              });
              user.sendLove(comment.replyId, (success: boolean) => {
                wx.hideLoading();
                //请求新的once
                user.requestOnce();
                if (success) {
                  comment.ismylove = true;
                  ++comment.love;
                  let data = sender.data.comments;
                  data[index] = comment;
                  sender.setData({
                    comments: data
                  });
                }
                console.log(success);
                wx.showToast({
                  title: success ? '发送成功！' : '操作失败！',
                  icon: 'none',
                  duration: 4000
                })

              });
            }
            else {
              wx.showToast({
                title: '操作失败！',
                icon: 'none',
                duration: 4000
              })
            }


          }
          else if (res.tapIndex == 1) {
            //@用户
            sender.triggerEvent('atevent', comment.username);
          }
          else if (res.tapIndex == 2) {
            wx.setClipboardData({
              data: comment.content,
              success(res: any) {
                wx.showToast({
                  title: '已复制到剪贴板',
                  icon: 'none',
                  duration: 4000
                })
                console.log(res) // data
              }
            })
          }
          else if (res.tapIndex == 3) {
            let atComments = getAtComments(comment.content, index);
            if (atComments.length > 0) {
              sender.setData({
                isShowDialog: true,
                atComments: atComments
              });
            }
            else {
              wx.showToast({
                title: '@的用户并没有发言',
                icon: 'none',
                duration: 4000
              })
            }
          }
          console.log(res.tapIndex)
        },
        fail(res) {
          console.log(res.errMsg)
        }
      })
    },
    onCloseDialog: function (e: any) {
      console.log(e);
      sender.setData({
        isShowDialog: false
      })
    }
  },
  ready: function () {
    commentList = [];
    sender = this;
    /*if (sender.properties.topicComments > 0) {
      GetTopicHtml(this.properties.topicId);
    }*/
  },
  observers: {
    'topicHtml,isLoadComments': function (topicHtml: string, isLoadComments: boolean) {
      if (topicHtml != "") {
        sender = this;
        sender.setData({
          html: topicHtml
        })
      }
      if (isLoadComments) {
        console.log("提取评论");
        GetRequest();
      }
    }
  }
})

function GetRequest() {
  //清空当前评论
  commentList = [];
  //提取评论信息
  RequestInfo();
  //获取当前页评论
  requestPageComments(commentInfo.index);
  UpdateData();

}

function UpdateData() {
  sender.setData({
    comments: commentList,
    commentinfo: commentInfo
  });
}

//提取评论信息
function RequestInfo() {
  let noreplyReg: any = /<div\sclass="inner"(.*?)>\s(.*?)目前尚无回复(.*?)\s<\/div>/g;
  let isHasMore: boolean = false;

  commentInfo.count = sender.properties.topicComments;
  commentInfo.index = 1;
  commentInfo.pageTotal = 1;
  if (!noreplyReg.test(sender.data.html)) {

    //需要分页的
    let replyPageReg: any = /<div class="inner" style="text-align: center;">([\s\S]*?)<\/div>/g;
    if (replyPageReg.test(sender.data.html)) {
      //需要分页
      //获取最大页数
      let pageStr: any = sender.data.html.toString().match(replyPageReg);
      let replyPagesReg: any = /<(.*?)>(.*?)<\/(.*?)>/g;
      let pageInfo: any[] = pageStr.toString().match(replyPagesReg);
      let pageReg: any = />(.*?)</g;
      let page: number = pageReg.exec(pageInfo[pageInfo.length - 1])[1];
      console.log("最大页码：" + page);
      //获取当前页码
      let pageIndexReg: any = /<span(.*?)>(.*?)<\/span>/g;
      let pageIndex: number = pageIndexReg.exec(pageStr)[2];
      console.log("当前页码：" + pageIndex);

      commentInfo.index = pageIndex;
      commentInfo.pageTotal = page;

      if (pageIndex < page) {
        isHasMore = true;
      }
    }

  }
  sender.setData({
    isHasMore: isHasMore
  })

}


//获取指定页码的评论内容
function requestPageComments(page: number) {
  if (page == commentInfo.index) {
    //当前页，只需读取当前的html
    GetHtmlComments(sender.data.html.toString());
  }
  else {
    wx.showLoading({
      title: "正在加载评论..."
    })
    httpRequest.getRequest('https://www.v2ex.com/t/' + sender.properties.topicId + "?p=" + page, null, (res: any) => {
      sender.setData({
        html: res.data
      })
      //提取评论信息
      RequestInfo();
      //获取评论内容
      GetHtmlComments(res.data);
      //更新数据
      UpdateData();
      wx.hideLoading();
    }, "GET");

  }
}
function GetHtmlComments(html: string) {
  //console.log(html);
  let commentReg: any = /<div id="(.*?)" class="(cell|inner)">([\s\S]*?)<\/table>/g;
  let commentArray: any[] | null = html.match(commentReg);
  if (commentArray != null) {
    commentArray.forEach((item: any) => {
      let contentReg: any = /<div class="reply_content">([\s\S]*?)<\/div>/g;
      let usernameReg: any = /<a(.*?)class="dark">(.*?)<\/a>/g;
      let indexReg: any = /<span class="no">(.*?)<\/span>/g;
      let timeReg: any = /<span class="fade small">(.*?)<\/span>/g;
      let avatarReg: any = /<img loading="lazy" src="(.*?)" class="avatar"/g;
      let loveReg: any = /<span class="small fade">♥ (.*?)<\/span>/g;
      let loveRegRes = loveReg.exec(item);
      let ismyloveReg: any = /<div(.*?)class="thank_area thanked">/g;
      let replyidReg: any = /<div id="thank_area_([0-9]{1,15})/g;
      let replyidRegRes = replyidReg.exec(item);
      let comment: IComment = {
        content: "",
        username: "",
        time: "",
        index: 0,
        avatar: "",
        love: 0,
        ismylove: false,
        replyId: 0
      };
      comment.content = parser.parse(contentReg.exec(item)[1]);
      comment.username = usernameReg.exec(item)[2];
      comment.index = indexReg.exec(item)[1];
      comment.time = timeReg.exec(item)[1];
      comment.avatar = "https:" + avatarReg.exec(item)[1];
      comment.love = loveRegRes ? loveRegRes[1] : 0;
      comment.ismylove = ismyloveReg.test(item);
      comment.replyId = replyidRegRes ? replyidRegRes[1] : 0;
      comment.isCreater = sender.properties.topicCreater == comment.username;
      commentList.push(comment);
    });
  }
}

function isHasAt(content: string) {
  let memberReg = /<a class="md_link" class="md_atlink">@(.*?)<\/a>/g;
  return memberReg.test(content);
}
function getAtComments(content: string, index: number) {
  let atComments: IComment[] = [];
  let memberArray: string[] | null = content.match(/<a class="md_link" class="md_atlink">@(.*?)<\/a>/g);
  if (memberArray !== null) {
    memberArray.forEach((item: any) => {
      console.log(item);
      let usernameReg = /<a class="md_link" class="md_atlink">@(.*?)<\/a>/g;
      let usernameRegRes = usernameReg.exec(item);
      let username = usernameRegRes ? usernameRegRes[1] : "";
      if (username != "") {
        let result = getUserComments(username, index);
        if (result.length > 0) {
          atComments = atComments.concat(result);
        }
      }
    });
  }
  if (atComments.length > 0) {
    atComments.push(sender.data.comments[index]);
  }
  return atComments;
}
function getUserComments(username: string, index: number) {
  //从指定位置之前查找指定用户的所有对话
  let comments: IComment[] = [];

  for (let i = index; i >= 0; i--) {
    let comment = sender.data.comments[i];
    console.log(i + "/" + index);
    console.log(comment);
    if (comment.username == username) {
      comments.push(comment);
    }
  }
  console.log(comments);
  return comments;
}