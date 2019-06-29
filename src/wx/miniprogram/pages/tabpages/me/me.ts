Component({
  data: {

    navTitle: '我',
  },
  methods: {
    
  },
  pageLifetimes: {
    show: function () {
      (this as any).getTabBar().setData({
        selected: 3
      })

    }
  }
})