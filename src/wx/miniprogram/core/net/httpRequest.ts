
let cookie: any = wx.getStorageSync("cookie");
export class HttpRequest {

  getRequest(url: string, data: any, callBack: any, method: | 'OPTIONS'
    | 'GET'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'TRACE'
    | 'CONNECT' = "GET", contentType: string = "text/html", addCookie: boolean = true) {

    wx.request({
      url: url,
      method: method,
      data: data,
      header: {
        'content-type': contentType,
        'Cookie': cookie
      },
      success(res: any) {
        if (addCookie) {
          if (res.header) {
            if ('Set-Cookie' in res.header) {
              wx.setStorageSync("cookie", res.header['Set-Cookie']);
            }
            else if ('set-cookie' in res.header) {
              wx.setStorageSync("cookie", res.header['set-cookie'])
            }
          }
        }
        callBack(res);
      }
    })
  }
}