//app.ts
//import { Cache } from './utils/cache';
import { User } from './core/net/user';

//let cache = new Cache();
let user = new User();
export interface IMyApp {
  globalData: {
  }
}

App<IMyApp>({
  globalData: {
  },
  onLaunch: function (options: any) {
    console.log(options);
    //cache.put("tips", 0);
    updateTips();
    setInterval(() => {
      updateTips();
    }, 30000);
  },
})

function updateTips() {
  user.requestTips((res: number) => {
    //cache.put("tips", res);
    if (res > 0) {
      wx.setTabBarBadge({
        index: 2,
        text: res.toString()
      })
    }
    else {
      wx.removeTabBarBadge({
        index: 2
      });
    }
  });
}