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
        wx.downloadFile({
          url: checkCodeUrl,
          header: {
            'Cookie': postData["cookie"]
          },
          success(res) {
            if (res.statusCode === 200) {
              console.log(checkCodeUrl);
              console.log(res.tempFilePath);
              callback(postData, res.tempFilePath);
            }
          }
        })


      }
      else {
        console.log("登录请请求失败，获取不到KEY");
      }
    });
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
  requestLogin(postData: any) {
    //提交到处理服务端
    httpRequest.getRequest("https:///v2exlogin.php", postData, (res: any) => {
      console.log("登录返回");
      console.log(res.data);
      if (res.data == "0") {

      }
      else if (res.data == "1") {

      } else if (res.data == "2") {

      } else if (res.data == "3") {

      } else if (res.data == "4") {

      } else if (res.data == "5") {

      }
      else {
        //登录成功
        wx.setStorageSync("cookie", res.data);

        //获取个人信息
        user.requestInfo();
        //测试使用获得的cookie
        /*httpRequest.getRequest("https://www.v2ex.com/recent?p=2", '', (cb: any) => {
          console.log(cb.data);
        }, "GET");*/
      }
      //console.log(postData);
    }, "POST", "application/x-www-form-urlencoded");

  }
}