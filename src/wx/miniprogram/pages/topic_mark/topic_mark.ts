let sender: any;
import { User } from '../../core/net/user';
import { Cache } from '../../utils/cache';

let user = new User();
let cache = new Cache();

let pageIndex: number = 1;
let maxPage: number = 1;

Page({
  data: {
    isHasMore: false,
    topics: []
  },
  onLoad: function () {
    sender = this;
    console.log(sender.data);
    requestTopics();
  },
  onLoadMore: function () {
    requestMore();
  },
  onShowTopic: function (e: any) {
    let itemIndex: any = e.currentTarget.dataset.id;
    cache.put("topic", sender.data.topics[itemIndex]);

    wx.navigateTo({
      url: '/pages/topic_view/topic_view'
    });
  },
})

function requestTopics() {
  wx.showLoading({
    title: '加载中...',
  });
  user.requestMyTopics((res: any, pageIndex_: number, maxPage_: number) => {
    pageIndex = pageIndex_;
    maxPage = maxPage_;
    sender.setData({
      isHasMore: (pageIndex + 1) <= maxPage,
      topics: sender.data.topics.concat(res)
    });
    wx.hideLoading();
  }, pageIndex);
}

function requestMore() {
  if ((pageIndex + 1) <= maxPage) {
    ++pageIndex;
    requestTopics();
  }
}