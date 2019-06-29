let sender: any;

import { Login } from '../../core/net/login';

let login = new Login();
let loginData: any;

Page({
  data: {
    checkcode: ""
  },
  formSubmit: function (e: any) {
    console.log(e.detail.value);
    let formData = e.detail.value;
    let loginInfo = login.getLoginInfo();
    loginData[loginInfo['nameKey']] = formData['username'];
    loginData[loginInfo['passKey']] = formData['password'];
    loginData[loginInfo['codeKey']] = formData['checkcode'];
    //请求登录
    login.requestLogin(loginData);
  },
  onLoad() {
    sender = this;
    // return;
    login.requestLoginInfo((postData: any, checkCode: string) => {
      console.log(postData);
      console.log(checkCode);
      sender.setData({
        checkcode: checkCode
      });
      loginData = postData;
    });
  }

});
