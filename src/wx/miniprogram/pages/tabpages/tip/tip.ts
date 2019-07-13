import { HttpRequest } from '../../../core/net/httpRequest';
import { TopicParser } from '../../../utils/topicparser';
import { Cache } from '../../../utils/cache';

let httpRequest = new HttpRequest();
let topicparser = new TopicParser();
let cache = new Cache();

let sender: any;
interface INotification {
  avatar?: string;
  username?: string;
  action?: string;
  topicID?: string;
  info?: string;
  time?: string;
  nid: string;
}
Component({
  data: {
    notifications: [],
  },
  methods: {
    onPullDownRefresh: function () {
      wx.stopPullDownRefresh();
      requestTipsData();
    },
    onShowTopic: function (e: any) {
      let itemIndex: any = e.currentTarget.dataset.index;
      let notification: INotification = sender.data.notifications[itemIndex];
      let topicid = notification.topicID ? parseInt(notification.topicID) : 0;
      let topic: ITopic = {
        id: topicid,
        content_rendered: ""
      };
      cache.put("topic", topic);

      wx.navigateTo({
        url: '/pages/topic_view/topic_view'
      });
    }
  },
  pageLifetimes: {
    show: function () {
      wx.removeTabBarBadge({
        index: 2
      });
      requestTipsData();
    }
  },
  lifetimes: {
    created: function () {
      sender = this;
      requestTipsData();
    }
  }
})

function requestTipsData() {
  wx.showLoading({
    title: "正在刷新..."
  })
  httpRequest.getRequest("https://www.v2ex.com/notifications", null, (res: any) => {

    let Reg: any = /<table cellpadding="0" cellspacing="0" border="0" width="100%">([\s\S]*?)<\/table>/g;

    let dataArray: any[] | null = res.data.match(Reg);

    let notifications: INotification[] = [];
    if (dataArray != null) {
      dataArray.forEach((item: any) => {
        if (item.indexOf("<td width=\"32\" align=\"left\" valign=\"top\">") != -1) {
          let avatarReg: any = /<img loading="lazy" src="(.*?)" class="avatar"/g;
          let avatarRegRes = avatarReg.exec(item);
          let avatar: string = avatarRegRes ? avatarRegRes[1] : "";

          let usernameReg: any = /<a href="\/member\/(.*?)">/g;
          let usernameRegRes = usernameReg.exec(item);
          let username: string = usernameRegRes ? usernameRegRes[1] : "";

          let actionReg: any = /<span class="fade">([\s\S]*?)<\/span>/g;
          let actionRegRes = actionReg.exec(item);
          let action: string = actionRegRes ? actionRegRes[1] : "";
          let clear1 = /<a href="\/member(.*?)">(.*?)<\/a>/g;
          let clear2 = /<a href="\/t(.*?)">(.*?)<\/a>/g;

          action = action.replace(clear1, "");
          action = action.replace(clear2, "《$2》");

          let infoReg: any = /<div class="payload">([\s\S]*?)<\/div>/g;
          let infoRegRes = infoReg.exec(item);
          let info: string = infoRegRes ? infoRegRes[1] : "";
          if (info != "") {
            info = topicparser.parse(info);
          }
          let timeReg: any = /<span class="snow">(.*?)前/g;
          let timeRegRes = timeReg.exec(item);
          let time: string = timeRegRes ? timeRegRes[1] + "前" : "";

          let topicidReg: any = /href="\/t\/([0-9]{1,10})/g;
          let topicidRegRes = topicidReg.exec(item);
          let topicid: string = topicidRegRes ? topicidRegRes[1] : "";

          let nidReg: any = /deleteNotification\(([0-9]{1,20})/g;
          let nidRegRes = nidReg.exec(item);
          let nid: string = nidRegRes ? nidRegRes[1] : "";

          let notification: INotification = {
            avatar: "https:" + avatar,
            username: username,
            action: action,
            info: info,
            time: time,
            topicID: topicid,
            nid: nid
          };
          //console.log(notification);
          notifications.push(notification);
        }
      });
    }
    sender.setData({
      notifications: notifications
    });
    wx.hideLoading();
  }, "GET");
}