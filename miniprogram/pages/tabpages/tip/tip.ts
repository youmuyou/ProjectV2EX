Component({
  data: {

    navTitle: '提醒',
  },
  methods: {
    
  },
  pageLifetimes: {
    show: function () {
      (this as any).getTabBar().setData({
        selected: 2
      })

    }
  }
})