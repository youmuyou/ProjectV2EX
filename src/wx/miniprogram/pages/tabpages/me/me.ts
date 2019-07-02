import { User } from '../../../core/net/user';
let user = new User();
let sender: any;

Component({
  data: {
    navTitle: '我',
    isLogin: false
  },
  methods: {
    gotologin:function(){
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }
  },
  pageLifetimes: {
    show: function () {
      sender = this;

      sender.setData({
        isLogin: user.isLogin()
      });
      (this as any).getTabBar().setData({
        selected: 3
      })

    }
  }
})