import { Cache } from '../../../utils/cache';
import { RequestTopics } from '../../../core/net/requestTopics';

let cache = new Cache();
let requestTopics = new RequestTopics();

let sender: any;

let isLoading = true;
function SetLoading(sw: boolean) {
  isLoading = sw;
  if (sw) {
    wx.showLoading({
      title: '加载中',
    });
  }
  else {
    wx.hideLoading();
  }
  return isLoading;
}
Component({
  data: {
    navTitle: '热议',
    home_topics: []
  },
  methods: {
    onPullDownRefresh: function () {
      wx.stopPullDownRefresh();
      getRequestTopics();
    },
    showTopic: function (e: any) {
      let itemIndex: any = e.currentTarget.dataset.id;

      cache.put("topic", sender.data.home_topics[itemIndex]);

      wx.navigateTo({
        url: '/pages/topic_view/topic_view'
      });

      console.log(sender.data.home_topics[itemIndex]);
    }
  },
  lifetimes: {
    created: function () {
      sender = this;
      getRequestTopics();
    }
  },
  pageLifetimes: {
    show: function () {
      sender.getTabBar().setData({
        selected: 1
      })
    }
  }
})

function getRequestTopics(){
  SetLoading(true);
  requestTopics.requestHotForJson((e: any) => {
    sender.setData({
      home_topics: e
    });
    SetLoading(false);
  });
}