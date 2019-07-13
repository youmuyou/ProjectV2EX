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
            user.signOut((success: boolean) => {
              if (success) {
                wx.navigateTo({
                  url: '/pages/login/login'
                });
              }
              else {
                wx.showToast({
                  title: "退出操作失败，请重试",
                  icon: 'none',
                  duration: 4000
                })
              }

            });

          }
        }
      });
    }
    , onPost: function () {
      wx.navigateTo({
        url: '/pages/topic_post/topic_post'
      });
    }
    , onShowPage: function (e: any) {
      let page = e.currentTarget.dataset.page;
      wx.navigateTo({
        url: page
      });
    }
  },
  pageLifetimes: {
    show: function () {
      sender = this;
      
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