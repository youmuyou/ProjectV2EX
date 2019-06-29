import { Cache } from '../../utils/cache';
import { TopicParser } from '../../utils/topicparser';


let cache = new Cache();
let parser = new TopicParser();
let sender: any;
let subtleList: ISubtle[] = [];
interface ISubtle {
  title: string;
  content: string;
}
/**
 * 获取帖子HTML
 */
function GetTopicHtml(id: number) {
  wx.request({
    url: 'https://www.v2ex.com/t/' + id,
    header: {
      'content-type': 'text/html'
    },
    success(res) {
      console.log("已加载html");
      //console.log(res.data);
      sender.setData({
        html: res.data
      });
      //读取附言
      // + '<div class="subtle"><span class="fade">第 1 条附言 &nbsp;·&nbsp; 7 小时 54 分钟前</span><div class="sep5"></div><div class="topic_content">07:38 未恢复</div></div>'

      RequestSubtle(res.data.toString());
    }
  })
}

/*获取附言 */
function RequestSubtle(html: string) {
  let Reg: any = /<div class="subtle">([\s\S]*?)<\/div>\s<\/div>/g;
  //测试debug let Reg: any = /<div class="subtle">([\s\S]*?)<\/div><\/div>/g;

  let subtleArray: any[] | null = html.match(Reg);
  if (subtleArray != null) {
    subtleArray.forEach((item: any) => {
      console.log(item);
      let contentReg: any = /<div class="topic_content">([\s\S]*?)<\/div>/g;
      let titleReg: any = /<span class="fade">(.*?)<\/span>/g;
      let subtleItem: ISubtle = {
        title: titleReg.exec(item)[1],
        content: parser.parse(contentReg.exec(item)[1])
      };
      subtleList.push(subtleItem);
      console.log(subtleItem);
    });
    sender.setData({
      subtle: subtleList
    });
  }

}

Page({

  data: {
    topic: null,
    html: '',
    subtle: []
  },
  onLoad() {
    sender = this;
    subtleList = [];
    let topicData = cache.take("topic");
    //测试无正文
    //topicData.content_rendered = "";
    topicData.content_rendered = parser.parse(topicData.content_rendered);
    this.setData!({
      topic: topicData
    })
    //读取帖子html
    GetTopicHtml(topicData.id);
  }
})
