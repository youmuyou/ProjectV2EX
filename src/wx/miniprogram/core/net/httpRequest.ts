
export class HttpRequest {

  getRequest(url: string, data: any, callBack: any, method: | 'OPTIONS'
    | 'GET'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'TRACE'
    | 'CONNECT' = "GET", contentType: string = "text/html", isSaveCookie: boolean = false) {

    let cookie: any = wx.getStorageSync("cookie") + wx.getStorageSync("responseCookie");
    //console.log('请求的url:' + url);
    //console.log('携带的cookie:' + cookie);
    wx.request({
      url: url,
      method: method,
      data: data,
      header: {
        'content-type': contentType,
        'Cookie': cookie
      },
      success(res: any) {
        //提取once
        let once: number = 0;
        let reg: any = /<input(.*?)value="(.*?)" name="once"/g;
        let onceReg = reg.exec(res.data);
        if (onceReg) {
          once = onceReg[2];
        }
        else {
          let reg2: any = /once=([0-9]{2,6})"/g;
          let onceReg2 = reg2.exec(res.data);
          if (onceReg2) {
            once = onceReg2[1];
          }
        }

        //获取cookie
        let setCookie = "";
        if (res.header) {
          if ('Set-Cookie' in res.header) {
            setCookie = res.header['Set-Cookie'];
          }
          else if ('set-cookie' in res.header) {
            setCookie = res.header['set-cookie'];
          }
          //console.log("请求的URL：" + url + "，返回的cookie：" + setCookie);
        }
        let lastOnce = wx.getStorageSync("once");
        //console.log("更新：当前once:" + once + "，上一个once:" + lastOnce);
        if (once != 0 && lastOnce != once) {
          
          wx.setStorageSync("once", once);
          if (setCookie.length > 40) {
            wx.setStorageSync("responseCookie", "; " + setCookie);
          }
        }


        if (isSaveCookie) {
          if (setCookie.indexOf("Secure,PB3_SESSION") != -1) {
            //console.log("解析：" + setCookie);
            let setCookieReg = /Secure,PB3_SESSION(.*)/g;
            let setCookieRegResult = setCookieReg.exec(setCookie);
            setCookie = setCookieRegResult ? "PB3_SESSION" + setCookieRegResult[1] : setCookie;
          }
          wx.setStorageSync("cookie", setCookie);
          //console.log("保存cookie:" + setCookie);
        }

        callBack(res);
      }
    })
  }
}