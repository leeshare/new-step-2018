//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    scrollH: 0,
    imgWidth: 0,
    ishidemode: true,
    isfocuse: false,
    cancel: true,
    categoryItems: [],
    photoTotalNum: 0
  },
  onShareAppMessage: function () {
    return {
      title: '找好图用找图',
      desc: '',
      path: '/pages/viewmore/viewmore'
    }
  },
  onLoad: function () {
    let that = this;
    // app.getUserInfo(function (userInfo) {
    //   //更新数据
    //   that.setData({
    //     userInfo: userInfo
    //   })
    // })

    wx.getSystemInfo({
      success: (res) => {
        console.log(res)
        let ww = res.windowWidth;
        let wh = res.windowHeight - 90;
        let scrollH = wh;

        that.setData({
          scrollH: scrollH
        });

        that.loadCategoryList();
      }
    })
  },
  onReady: function () {
    var that = this;
    var sysInfo = wx.getSystemInfoSync();
    var accessNum = app.getStorageValueSync(3)
    if (accessNum) {
      if (accessNum == 1 && sysInfo.system.toLowerCase().indexOf("android") != -1) {
        that.setData({ ishidemode: false })
        accessNum += 1
        app.setStorageValueSync(3, accessNum)
      }
    } else
      app.setStorageValueSync(3, 1)
  },
  //搜索事件事件
  gotoSearch: function () {
    wx.navigateTo({
      url: '../search/search'
    })
  },
  //跳转到详情
  viewDetail: function (event) {
    app.globalData.pushData = event.currentTarget.dataset.categoryItem;
    let categoryId = app.globalData.pushData.id;
    wx.navigateTo({
      url: '../category/category?id=' + categoryId
    });
  },
  //载入分类数据
  loadCategoryList: function () {
    var that = this;
    app.showLoading('加载中');
    app.ajax(
      'puzzleV20170301/puzzleCategoryListData',
      { dataVersion: 0 },
      function (response) {
        var categorys = response.data.data_categorys.group_list;
        that.setData({
          categoryItems: [{ categoryType: 1, categoryName: '图库', categoryLists: categorys }]
        });
        app.hideLoading();
      },
      function (response) {
        console.log(response.message);
        app.hideLoading();
      });
  },
  topagemore: function (e) {
    wx.navigateTo({
      //url: '../morepicture/morepicture?type=' + e.currentTarget.dataset.id,
      url: '../morepicture/morepicture'
    })
  },
  hidemode: function () {
    this.setData({
      ishidemode: true
    })
  },
  toMyCollect: function () {
    wx.navigateTo({
      url: '../mycollect/mycollect'
    })
  },
  tabBar: function (e) {
    var i = e.currentTarget.dataset.tab
    this.setData({
      tabActive: i
    })
    switch (i) {
      case "1":
        app.goHome();
        break;
      case "2":
        wx.switchTab({
          url: '/pages/mycollect/mycollect'
        })
        break;
      case "3":
       wx.switchTab({
          url: '/pages/T/T'
        })
        break;
    }
  }
})
