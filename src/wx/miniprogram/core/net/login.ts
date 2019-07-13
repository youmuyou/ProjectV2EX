import { HttpRequest } from '../../core/net/httpRequest';
import { User } from '../../core/net/user';
let user = new User();
let httpRequest = new HttpRequest();

let usernameKey: string;
let passwordKey: string;
let checkcodeKey: string;

export class Login {
  /**
   * 请求登录信息
   */
  requestLoginInfo(callback: any) {
    //获取v2ex的登录提交参数
    httpRequest.getRequest("https://www.v2ex.com/signin", null, (res: any) => {
      //console.log(res.data);
      if (res.data.indexOf("在短时间内的登录尝试次数太多，目前暂时不能继续尝试") != -1) {
        callback(false, null, null);
      } else {
        let formReg: any = /<form method="post" action="\/signin">([\s\S]*?)<\/form>/g;
        let formHtml = formReg.exec(res.data)[1];
        //匹配验证码图片
        let checkcodeReg: any = /background-image: url\('(.*?)'\)/g;
        let checkCodeUrl = "https://v2ex.com" + checkcodeReg.exec(res.data)[1];
        //console.log(checkCodeUrl);
        let inputReg = /<input(.*?)name="(.*?)"(.*?)value="(.*?)"(.*?)\/>/g;
        let inputArray: string[] = formHtml.match(inputReg);
        if (inputArray.length > 0) {
          let usernameExec = /<input(.*?)name="(.*?)"(.*?)value="(.*?)"(.*?)\/>/g.exec(inputArray[1]);
          let checkcodeExec = /<input(.*?)name="(.*?)"(.*?)value="(.*?)"(.*?)\/>/g.exec(inputArray[3]);
          let passwordExec = /<input type="password"(.*?)name="(.*?)"(.*?)value="(.*?)"(.*?)\/>/g.exec(inputArray[2]);
          let onceExec = /<input type="hidden"(.*?)value="(.*?)"(.*?)\/>/g.exec(inputArray[2]);
          //console.log(inputArray);
          usernameKey = usernameExec ? usernameExec[2] : "";
          passwordKey = passwordExec ? passwordExec[2] : "";
          checkcodeKey = checkcodeExec ? checkcodeExec[2] : "";
          let once = onceExec ? onceExec[2] : "";
          let postData: any = {};
          postData[usernameKey] = "";
          postData[passwordKey] = "";
          postData[checkcodeKey] = "";
          postData["next"] = "/";
          postData["once"] = once;
          postData["cookie"] = wx.getStorageSync("cookie");

          console.log(postData);
          console.log(checkCodeUrl);
          /*httpRequest.getRequest(checkCodeUrl, null, (res: any) => {
            console.log(res);
          });*/
          console.log("下载验证码携带的cookie:" + postData["cookie"]);
          wx.downloadFile({
            url: checkCodeUrl,
            header: {
              'Cookie': postData["cookie"]
            },
            fail(res) {
              console.log(res);
              callback(false, null, null);
            },
            success(res) {
              wx.removeStorageSync("cookie");
              console.log(res);
              if (res.statusCode === 200) {
                callback(true, postData, res.tempFilePath);
              }
              else {
                callback(false, null, null);
              }
            }
          })


        }
        else {
          callback(false, null, null);
          console.log("登录请请求失败，获取不到KEY");
        }
      }
    }, "GET", "text/html", true);
  }

  /**
   * 获取登录信息
   */
  getLoginInfo(): any {
    let info = {
      nameKey: usernameKey,
      passKey: passwordKey,
      codeKey: checkcodeKey
    };
    return info;
  }

  /**
   * 请求登录服务器
   */
  requestLoginPost(postData: any, callback: any) {
    //提交到处理服务端
    httpRequest.getRequest("https://www.aliegame.com/v2exlogin.php", postData, (res: any) => {
      console.log("登录返回");
      console.log(res.data);
      let msg = "";
      if (res.data == "0") {
        msg = "用户名和密码无法匹配";
        callback(false, msg);
      }
      else if (res.data == "1") {
        msg = "输入的验证码不正确";
        callback(false, msg);
      } else if (res.data == "2") {
        msg = "登录有点问题，请重试一次";
        callback(false, msg);
      } else if (res.data == "3") {
        msg = "请解决以下问题然后再提交";
        callback(false, msg);
      } else if (res.data == "4") {
        msg = "登录限制，您的IP被禁止";
        callback(false, msg);
      } else if (res.data == "5") {
        msg = "登录失败，请重试";
        callback(false, msg);
      }
      else {
        //登录成功
        wx.setStorageSync("cookie", res.data);

        //获取个人信息
        user.requestUserName((res: boolean) => {
          callback(res, msg);
        });
        //测试使用获得的cookie
        /*httpRequest.getRequest("https://www.v2ex.com/recent?p=2", '', (cb: any) => {
          console.log(cb.data);
        }, "GET");*/
      }

      //console.log(postData);
    }, "POST", "application/x-www-form-urlencoded");

  }

  /**
   * 小程序无法获得302请求的cookie所以暂时不能直接post
   */
  requestPostLogin(postData: any, callback: any) {
    httpRequest.getRequest("https://www.v2ex.com/signin", postData, (res: any) => {
      callback(res);
    }, "POST", "application/x-www-form-urlencoded");
  }
}