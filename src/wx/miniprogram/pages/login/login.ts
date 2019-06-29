let sender: any;

import { Login } from '../../core/net/login';

let login = new Login();

Page({
  data: {

  },
  onLoad() {
    sender = this;
    login.login();
  }

});
