import { User } from '../../../core/net/user';
let user = new User();
let sender: any;

Component({
  data: {
    navTitle: '我',
    isLogin: false,
    info: {}
  },
  methods: {
    gotologin: function () {
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }, onSignout: function () {
      wx.showModal({
        title: '提示',
        content: '是否确认退出？',
        success(res) {
          if (res.confirm) {
            user.signOut();
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
    }
  },
  pageLifetimes: {
    show: function () {
      sender = this;
      sender.getTabBar().setData({
        selected: 3
      });
      sender.setData({
        isLogin: user.isLogin()
      });
      if (sender.data.isLogin) {
        //已登录，请求个人信息
        let userInfo = user.getInfo();
        if (userInfo != null) {
          user.requestUserInfo(userInfo.username, (i: any) => {
            sender.setData({
              info: i
            });
          });
        }
      }



    }
  }
})