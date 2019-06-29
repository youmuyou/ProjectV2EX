Component({
  data: {
    selected: 0,
    color: "#2c2c2c",
    selectedColor: "#ffc803",
    list: [{
      pagePath: "/pages/tabpages/index/index",
      iconPath: "/images/home.png",
      selectedIconPath: "/images/home_active.png",
      text: "最新"
    }, {
      pagePath: "/pages/tabpages/hot/hot",
      iconPath: "/images/hot.png",
      selectedIconPath: "/images/hot_active.png",
      text: "最热"
    }, {
      pagePath: "/pages/tabpages/tip/tip",
      iconPath: "/images/tip.png",
      selectedIconPath: "/images/tip_active.png",
      text: "提醒"
    }, {
      pagePath: "/pages/tabpages/me/me",
      iconPath: "/images/me.png",
      selectedIconPath: "/images/me_active.png",
      text: "我"
    }]
  },
  attached() { },
  methods: {
    switchTab: function (e: any) {
      let data: any = e.currentTarget.dataset;
      let url: string = data.path;
      let sender: any = this;
      wx.switchTab({
        url
      })
      sender.setData({
        selected: data.index
      })
      console.log(url);
    }
  }
})