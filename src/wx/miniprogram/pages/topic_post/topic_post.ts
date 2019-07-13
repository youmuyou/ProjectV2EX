let sender: any;
import { User } from '../../core/net/user';
let user = new User();

Page({
  data: {
    node: '',
    nodeTitle: ''
  },
  onLoad: function () {
    sender = this;
  },
  onSelectNode: function (e: any) {
    console.log(e);
    let nodeName = e.currentTarget.dataset.name;
    let nodeTitle = e.currentTarget.dataset.title;

    sender.setData({
      node: nodeName,
      nodeTitle: nodeTitle
    })
  },
  formSubmit: function (e: any) {
    let formData = e.detail.value;
    if (formData['title'] == "") {
      wx.showToast({
        title: '标题是必须的',
        icon: 'none',
        duration: 4000
      })
    }
    else if (formData['title'].length < 5) {
      wx.showToast({
        title: '标题长度过短',
        icon: 'none',
        duration: 4000
      })
    }
    else {
      wx.showLoading({
        title: "正在提交..."
      })
      user.postTopic((success: boolean) => {
        if (success) {
          wx.showToast({
            title: '发布成功！',
            icon: 'none',
            duration: 4000
          })
        }
        wx.hideLoading();
      }, sender.data.node, formData['title'], formData['content']);
    }
  }
})