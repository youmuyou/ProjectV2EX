import { TopicParser } from '../../utils/topicparser';
import { HttpRequest } from '../../core/net/httpRequest';
import { UtilTime } from '../../utils/util_time';

let parser = new TopicParser();
let httpRequest = new HttpRequest();
let utilTime = new UtilTime();


/**
 * 帖子内容获取
 */
export class RequestTopics {

  /**
   * 获取主题列表通过html（已登录）
   */
  requestForHtml(page: number, callBack: any) {

    httpRequest.getRequest("https://www.v2ex.com/recent?p=" + page, "", (e: any) => {
      let topics = parser.getMatchTopics(e.data);
      callBack(topics);
    }, "GET");
  }

  requestForJson(callBack: any) {
    wx.request({
      url: 'https://www.v2ex.com/api/topics/latest.json',

      header: {
        'content-type': 'application/json'
      },
      success(res) {
        console.log("加载帖子内容完成");
        let data: any = res.data;
        let topicList: ITopic[] = [];

        let length: number = data.length;
        for (let i = 0; i < length; i++) {
          let created: string = utilTime.getDateDiff(data[i]["created"]);

          let node: INode = {
            title: data[i]["node"]["title"]
          }
          let member: IMember = {
            username: data[i]["member"]["username"],
            avatar_normal: data[i]["member"]["avatar_normal"]

          }
          let t: ITopic = {
            id: data[i]["id"],
            created: created,
            title: data[i]["title"],
            replies: data[i]["replies"],
            node: node,
            member: member,
            content_rendered: data[i]["content_rendered"]
          };
          topicList.push(t);
        }
        callBack(topicList);

      }
    })
  }

  /**
   * 获取热门主题列表
   */
  requestHotForJson(callBack: any) {
    wx.request({
      url: 'https://www.v2ex.com/api/topics/hot.json',
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        let data: any = res.data;
        let topicList: ITopic[] = [];
        console.log("加载帖子内容完成");
        let length: number = data.length;
        for (let i = 0; i < length; i++) {
          let created: string = utilTime.getDateDiff(data[i]["created"]);
          let node: INode = {
            title: data[i]["node"]["title"]
          }
          let member: IMember = {
            username: data[i]["member"]["username"],
            avatar_normal: data[i]["member"]["avatar_normal"]

          }
          let t: ITopic = {
            id: data[i]["id"],
            created: created,
            title: data[i]["title"],
            replies: data[i]["replies"],
            node: node,
            member: member,
            content_rendered: data[i]["content_rendered"]
          };
          topicList.push(t);
        }
        callBack(topicList);
      }
    })
  }

  /**
   * 获取一个主题的内容信息，返回ITopic结构
   
  getRequest(id: any, callback: any) {
    httpRequest.getRequest(""+id,null,(res:any)=>{

    },"GET");
  }*/
}
