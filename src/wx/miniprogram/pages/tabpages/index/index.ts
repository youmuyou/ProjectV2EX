//index.js
//获取应用实例
//import { IMyApp } from '../../app';
import { UtilTime } from '../../../utils/util_time';
import { Cache } from '../../../utils/cache';
import { TopicParser } from '../../../utils/topicparser';
//import { RequestTopics } from '../../../core/net/requestTopics';

//const app = getApp<IMyApp>();

let utilTime = new UtilTime();
let cache = new Cache();
let parser = new TopicParser();
//let requestTopics=new RequestTopics();
let sender: any;
let topicList: ITopic[] = [];
//let pageIndex: number = 1;

function getTopics(page: number) {
  console.log("正在加载帖子内容" + page);
  return;
  wx.request({
     url: 'https://www.v2ex.com/recent?p=' + page,
    //url: 'https://www.v2ex.com/api/topics/latest.json',

    header: {
      //'content-type': 'application/json' // 默认值
      'content-type': 'text/html' // 默认值

    },
    success(res) {
      let data: any = res.data;
      console.log("加载帖子内容完成");
      parser.matchTopics(data);
      return;
      let length: number = data.length;
      for (let i = 0; i < length; i++) {
        //data[i]["created"] = utilTime.getDateDiff(data[i]["created"]);
        let created: string = utilTime.getDateDiff(data[i]["created"]);

        let node: INode = {
          title: data[i]["node"]["title"]
        }
        let member: IMember = {
          username: data[i]["member"]["username"],
          avatar_normal: data[i]["member"]["avatar_normal"]

        }
        let t: ITopic = {
          id: data[i]["id"],
          created: created,
          title: data[i]["title"],
          replies: data[i]["replies"],
          node: node,
          member: member,
          content_rendered: data[i]["content_rendered"]
        };
        topicList.push(t);
      }
      sender.setData({ home_topics: topicList });
      // console.log(data)
    }
  })
}
Component({
  data: {

    navTitle: '最新',
    home_topics: []
  },
  methods: {
    showTopic: function (e: any) {
      let itemIndex: any = e.currentTarget.dataset.id;

      cache.put("topic", sender.data.home_topics[itemIndex]);

      wx.navigateTo({
        url: '/pages/topic_view/topic_view'
      });

      console.log(sender.data.home_topics[itemIndex]);
    }
  },
  pageLifetimes: {
    show: function () {

      sender = this;

      topicList = [];
      getTopics(0);
      /*requestTopics.requestForHtml(pageIndex,(e:any)=>{
        console.log(e);
      });*/
      wx.navigateTo({
        url: '/pages/login/login'
      });
      (this as any).getTabBar().setData({
        selected: 0
      })

    }
  }
})


interface ITopic {
  id: number;
  title: string;
  replies: number;
  created: string;
  node: INode;
  member: IMember;
  content_rendered: string;
}
interface INode {
  title: string;
}
interface IMember {
  username: string;
  avatar_normal: string;
}
/*
Page({
  data: {
    motto: '点击 “编译” 以构建',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    navSelected: 'home',
    home_image: '../../images/home.svg',
    hot_image: '../../images/hot.svg',
    msg_image: '../../images/msg.svg',
    me_image: '../../images/me.svg',
    navTitleArray: ['最新', '热榜', '提醒', '我'],
    navTitle: '',
    home_topics: []
  },
  showTopic() {
    wx.navigateTo({
      url: '/pages/topic_view/topic_view'
    })
  },
  updateTitle() {
    let index: number = 0;
    if (this.data.navSelected == "hot") {
      index = 1;
    }
    else if (this.data.navSelected == "msg") {
      index = 2;
    }
    else if (this.data.navSelected == "me") {
      index = 3;
    }
    else {
      index = 0;
    }
    this.setData!({ navTitle: this.data.navTitleArray[index] });
  },
  setNav(id: string, active: boolean) {
    let bindName: string = id + "_image";
    var newData: any = {}

    if (active) {
      newData[bindName] = "../../images/" + id + "_active.svg";
    }
    else {
      newData[bindName] = "../../images/" + id + ".svg";
    }
    //设置选中图标样式
    this.setData!(newData);
    //保存当前位置
    this.setData!({ navSelected: id });
    //更新标题
    this.updateTitle();
  },
  //事件处理函数
  bindViewTap(e: any) {
    //清除原来的样式
    this.setNav(this.data.navSelected, false);
    //设置当前选中样式
    this.setNav(e.currentTarget.id, true);
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    getTopics(this);
    //设置默认选中nav
    this.setNav(this.data.navSelected, true);
    if (app.globalData.userInfo) {
      this.setData!({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = (res) => {
        this.setData!({
          userInfo: res,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData!({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  getUserInfo(e: any) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData!({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
*/