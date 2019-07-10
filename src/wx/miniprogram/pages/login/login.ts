let sender: any;

import { Login } from '../../core/net/login';

let login = new Login();
let loginData: any;

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
Page({
  data: {
    checkcode: ""
  },
  formSubmit: function (e: any) {
    console.log(e.detail.value);
    let formData = e.detail.value;
    if (formData['username'] == "") {
      wx.showToast({
        title: '用户名不能为空',
        icon: 'none',
        duration: 2000
      })
    }
    else if (formData['password'] == "") {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none',
        duration: 2000
      })
    }
    else if (formData['checkcode'] == "") {
      wx.showToast({
        title: '验证码不能为空',
        icon: 'none',
        duration: 2000
      })
    }
    else {
      let loginInfo = login.getLoginInfo();
      loginData[loginInfo['nameKey']] = formData['username'];
      loginData[loginInfo['passKey']] = formData['password'];
      loginData[loginInfo['codeKey']] = formData['checkcode'];
      //请求登录
      SetLoading(true);
      login.requestLoginPost(loginData, (e: any, c: any) => {
        SetLoading(false);

        if (e) {
          wx.showToast({
            title: "登录成功",
            icon: 'none',
            duration: 2000
          });
          wx.navigateBack({
            delta: 1
          });
          wx.setStorageSync("login", true);
        }
        else {
          wx.showToast({
            title: c,
            icon: 'none',
            duration: 2000
          })
        }
      });
    }

  },
  onLoad() {
    sender = this;
    this.updateInfo();
  },
  updateInfo: function () {
    SetLoading(true);
    login.requestLoginInfo((result: boolean, postData: any, checkCode: string) => {
      if (result) {
        console.log(checkCode);
        sender.setData({
          checkcode: checkCode
        });
        loginData = postData;
      }
      else {
        wx.showModal({
          title: '提示',
          content: '无法请求登录信息，请重试',
          success(res) {
            if (res.confirm) {
              sender.updateInfo();
            } 
          }
        });
      }
      SetLoading(false);
    });
  },
  onRefCheckCode:function(){
    wx.showModal({
      title: '提示',
      content: '是否刷新验证码',
      success(res) {
        if (res.confirm) {
          sender.updateInfo();
        }
      }
    });
  }

});
