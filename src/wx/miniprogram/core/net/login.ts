import { HttpRequest } from '../../core/net/httpRequest';

let httpRequest = new HttpRequest();

let usernameKey: string;
let passwordKey: string;
let checkcodeKey: string;

export class Login {
  login() {
    return;
    httpRequest.getRequest("https://www.v2ex.com/signin", null, (res: any) => {
      console.log(res.data);
      let formReg: any = /<form method="post" action="\/signin">([\s\S]*?)<\/form>/g;
      let formHtml = formReg.exec(res.data)[1];
      let inputReg = /<input(.*?)name="(.*?)"(.*?)value="(.*?)"(.*?)\/>/g;
      let inputArray: string[] = formHtml.match(inputReg);
      if (inputArray.length > 0) {
        let usernameExec = /<input(.*?)name="(.*?)"(.*?)value="(.*?)"(.*?)\/>/g.exec(inputArray[1]);
        let checkcodeExec = /<input(.*?)name="(.*?)"(.*?)value="(.*?)"(.*?)\/>/g.exec(inputArray[3]);
        let passwordExec = /<input type="password"(.*?)name="(.*?)"(.*?)value="(.*?)"(.*?)\/>/g.exec(inputArray[2]);
        let onceExec = /<input type="hidden"(.*?)value="(.*?)"(.*?)\/>/g.exec(inputArray[2]);
        console.log(inputArray);
        usernameKey = usernameExec ? usernameExec[2] : "";
        passwordKey = passwordExec ? passwordExec[2] : "";
        checkcodeKey = checkcodeExec ? checkcodeExec[2] : "";
        let once = onceExec ? onceExec[2]:"";
        console.log(usernameKey);
        console.log(passwordKey);
        console.log(checkcodeKey);
        let postData: any = {};
        postData[usernameKey] = "2087893087@qq.com";
        postData[passwordKey] = "19970724";
        postData[checkcodeKey] = "123232";
        postData["next"] = "/";
        postData["once"] = once;

        httpRequest.getRequest("https://www.v2ex.com/signin", postData, (res: any) => {
          console.log("登录返回");
          console.log(res.data);
          console.log(postData);
        }, "POST");

      }
      else {
        console.log("登录请请求失败，获取不到KEY");
      }
    });
  }
}