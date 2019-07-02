import { HttpRequest } from '../../core/net/httpRequest';
let httpRequest = new HttpRequest();

export class User {
  isLogin(): boolean {
    if (this.getInfo() == null) {
      return false;
    }
    else {
      return true;
    }
  }
  getInfo(): IMember | null {
    let userInfo = wx.getStorageSync("userInfo");
    console.log("正在读取当前用户信息");
    console.log(userInfo);
    if (userInfo) {
      return userInfo;
    }
    return null;
  }
  requestInfo() {
    console.log("正在获取个人信息");
    httpRequest.getRequest("https://www.v2ex.com/settings", '', (e: any) => {
      if (e.data.indexOf("你要查看的页面需要先登录") != -1) {
        wx.removeStorageSync("userInfo");
        console.log("未登录");
      } else if (e.data.indexOf("在短时间内的登录尝试次数太多，目前暂时不能继续尝试") != -1) {
        // wx.removeStorageSync("userInfo");
        console.log("登录受限");
      }
      else {
        console.log(e.data);
        let formReg: any = /<form method="post" action="\/settings">([\s\S]*?)<\/form>/g;
        let formHtml = formReg.exec(e.data)[1];
        let trReg = /<tr>([\s\S]*?)<\/tr>/g;
        let trArray: string[] = formHtml.match(trReg);
        if (trArray.length > 0) {
          console.log("已匹配到了个人信息");
          //console.log(trArray);
          let usernameReg: any = /<td width="auto" align="left">(.*?)<\/td>/g;

          let member: IMember = {
            username: usernameReg.exec(trArray[0])[1],
            avatar_normal: ''
          }
          wx.setStorageSync("userInfo", member);
        }
        else {
          console.log("匹配失败");
        }

      }
    }, "GET");
  }
}