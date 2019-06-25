import { UtilTime } from '../../../utils/util_time';
import { Cache } from '../../../utils/cache';

let utilTime = new UtilTime();
let cache = new Cache();

let sender: any;
let topicList: ITopic[] = [];
let pageIndex: number = 1;

function getTopics(page: number) {
  console.log("正在加载帖子内容" + page);
  wx.request({
    // url: 'https://www.v2ex.com/recent?p=' + page,
    url: 'https://www.v2ex.com/api/topics/hot.json',

    header: {
      'content-type': 'application/json' // 默认值
    },
    success(res) {
      let data: any = res.data;
      console.log("加载帖子内容完成");
      //parser.matchTopics(data);
      //return;
      let length: number = data.length;
      for (let i = 0; i < length; i++) {
        //data[i]["created"] = utilTime.getDateDiff(data[i]["created"]);
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
      sender.setData({ home_topics: topicList });
      // console.log(data)
    }
  })
}
Component({
  data: {

    navTitle: '最热',
    home_topics: []
  },
  methods: {
    showTopic: function (e: any) {
      let itemIndex: any = e.currentTarget.dataset.id;

      cache.put("topic", sender.data.home_topics[itemIndex]);

      wx.navigateTo({
        url: '/pages/topic_view/topic_view'
      });

      console.log(sender.data.home_topics[itemIndex]);
    }
  },
  pageLifetimes: {
    show: function () {

      sender = this;

      topicList = [];
      getTopics(pageIndex);

      (this as any).getTabBar().setData({
        selected: 1
      })

    }
  }
})


interface ITopic {
  id: number;
  title: string;
  replies: number;
  created: string;
  node: INode;
  member: IMember;
  content_rendered: string;
}
interface INode {
  title: string;
}
interface IMember {
  username: string;
  avatar_normal: string;
}