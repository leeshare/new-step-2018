// pages/mycollect/mycollect.js
var app = getApp()
Page({
  data: {
    user_groups: [],
    tabActive: '2',
    scrollH:'',

    userInfo: {}
  },
  /*onShareAppMessage: function () {
    var that = this
    return {
      title: "我的图库",
      desc: "",
      path: '/pages/mycollect/mycollect'
    }
  },*/
  onLoad: function (options) {
    let that = this;
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })

      wx.getSystemInfo({
        success: (res) => {
          that.setData({
            scrollH: res.windowHeight
          })

          that.getData();
        }
      })
    })

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    this.getData();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  gotoview: function (e) {
    app.globalData.pushData = e.currentTarget.dataset.ug;
    var userGroupId = e.currentTarget.dataset.ug.UserGroupID;
    wx.navigateTo({
      url: '../mycollectview/mycollectview?id=' + userGroupId
     // url: '../shareCollect/shareCollect?id=' + userGroupId
    })
  },
  viewmore: function () {
    wx.navigateTo({
      url: '../viewmore/viewmore'
    })
  },
  getData: function(){
    var that = this;
    app.ajax("puzzlev4/UserCollectList", { }, function(response){
      that.setData({
        isLoaded: true,
        user_groups: response.data.user_groups
      });

    }, function(){

    });
  }
  
})