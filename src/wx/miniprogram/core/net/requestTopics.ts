import { TopicParser } from '../../utils/topicparser';

let parser = new TopicParser();


/**
 * 帖子内容获取
 */
export class RequestTopics {

  requestForHtml(page: number, callBack: any) {
    wx.request({
      url: 'https://www.v2ex.com/recent?p=' + page,
      //url: 'https://www.v2ex.com/api/topics/latest.json',

      header: {
        //'content-type': 'application/json' // 默认值
        'content-type': 'text/html' // 默认值

      },
      success(res) {
        let data: any = res.data;
        console.log("加载帖子内容完成");
        parser.matchTopics(data);
        callBack(data);
      }
    });


  }
}
