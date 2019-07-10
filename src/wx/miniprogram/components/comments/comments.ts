import { TopicParser } from '../../utils/topicparser';

let parser = new TopicParser();

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
    }
  },
  data: {
    comments: [],
    commentinfo: null
  },
  methods: {

  },
  ready: function () {
    commentList = [];
    sender = this;
    /*if (sender.properties.topicComments > 0) {
      GetTopicHtml(this.properties.topicId);
    }*/
  }, observers: {
    'topicHtml': function (topicHtml: string) {
      if (topicHtml != "") {
        sender = this;
        GetRequest();
      }
    }
  }
})

function GetRequest() {
  //提取评论信息
  RequestInfo();
  //获取当前页评论
  GetPageComments(commentInfo.index);
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

  commentInfo.count = sender.properties.topicComments;
  commentInfo.index = 1;
  commentInfo.pageTotal = 1;
  console.log("获取评论信息");
  if (!noreplyReg.test(sender.properties.topicHtml)) {
    console.log("有回复，需要提取");
    //有回复，需要提取
    //需要分页的
    let replyPageReg: any = /<div class="inner" style="text-align: center;">([\s\S]*?)<\/div>/g;
    //console.log(topicHtml);
    if (replyPageReg.test(sender.properties.topicHtml)) {
      //需要分页
      //获取最大页数
      let pageStr: any = sender.properties.topicHtml.toString().match(replyPageReg);
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
    }
    else {
      console.log("不需要分页");
    }
  }

}


//获取指定页码的评论内容
function GetPageComments(page: number) {
  if (page == commentInfo.index) {
    //当前页，只需读取当前的html
   
    GetHtmlComments(sender.properties.topicHtml.toString());
  }
  else {
    console.log('>>>>');
    wx.request({
      url: 'https://www.v2ex.com/t/' + sender.properties.topicId + "?p=" + page,
      header: {
        'content-type': 'text/html'
      },
      success(res) {
        GetHtmlComments(res.data.toString());
      }
    })
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

      let comment: IComment = {
        content: "",
        username: "",
        time: "",
        index: 0,
        avatar: ""
      };
      comment.content = parser.parse(contentReg.exec(item)[1]);
      comment.username = usernameReg.exec(item)[2];
      comment.index = indexReg.exec(item)[1];
      comment.time = timeReg.exec(item)[1];
      comment.avatar = "https:" + avatarReg.exec(item)[1];

      //console.log(comment);
      commentList.push(comment);
    });
  }
}