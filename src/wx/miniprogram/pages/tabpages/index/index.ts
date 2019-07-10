//index.js
//获取应用实例
//import { IMyApp } from '../../app';
import { Cache } from '../../../utils/cache';
import { RequestTopics } from '../../../core/net/requestTopics';
import { User } from '../../../core/net/user';

//const app = getApp<IMyApp>();

let cache = new Cache();
let user = new User();

let requestTopics = new RequestTopics();
let sender: any;
let pageIndex: number = 1;

function SetLoading(sw: boolean) {
  sender.setData({
    isLoading: sw
  })
  if (sw) {
    wx.showLoading({
      title: '加载中',
    });
  }
  else {
    wx.hideLoading();
  }
}
Component({
  data: {
    navTitle: '主页',
    home_topics: [],
    filter: true,
    isLoading: true
  },
  methods: {
    onPullDownRefresh: function () {
      wx.stopPullDownRefresh();
      loadTopics();
    },
    showTopic: function (e: any) {
      let itemIndex: any = e.currentTarget.dataset.id;

      cache.put("topic", sender.data.home_topics[itemIndex]);

      wx.navigateTo({
        url: '/pages/topic_view/topic_view'
      });

      console.log(sender.data.home_topics[itemIndex]);
    },
    loadmore: function () {
      pageIndex++;
      SetLoading(true);
      user.requestUserName();
      if (user.isLogin()) {
        requestTopics.requestForHtml(pageIndex, (e: any) => {
          sender.setData({
            home_topics: sender.data.home_topics.concat(e)
          });
          SetLoading(false);

        });
      }
    },
    onFilter: function () {
      wx.showActionSheet({
        itemList: ['查看最新', '查看最近'],
        success(res) {
          if (res.tapIndex == 0) {
            sender.setData({
              filter: true
            });
            wx.showToast({
              title: '当前浏览最新帖子',
              icon: 'none',
              duration: 2000
            })
          }
          else if (res.tapIndex == 1) {
            sender.setData({
              filter: false
            });
            wx.showToast({
              title: '当前浏览最近帖子',
              icon: 'none',
              duration: 2000
            })
          }
          loadTopics();
          console.log(res.tapIndex)
        },
        fail(res) {
          console.log(res.errMsg)
        }
      })
    }
  },
  pageLifetimes: {
    show: function () {
      // 页面被展示
      sender.getTabBar().setData({
        selected: 0
      });
    },
  },
  lifetimes: {
    created: function () {
      sender = this;
      user.requestUserName();
      loadTopics();
    }
  }
})

function loadTopics() {
  pageIndex = 1;
  SetLoading(true);
  if (!sender.data.filter && user.isLogin()) {
    requestTopics.requestForHtml(pageIndex, (e: any) => {
      sender.setData({
        home_topics: e
      });
      SetLoading(false);
    });
  }
  else {
    requestTopics.requestForJson((e: any) => {
      sender.setData({
        home_topics: e
      });
      SetLoading(false);
    });
  }
}