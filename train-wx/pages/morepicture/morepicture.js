// pages/morepicture/morepicture.js
var app = getApp()
Page({
  data: {
    scrollH: 0,
    groupType: -1,
    pageIndex: 0,
    dataTopicList: [],
    total_record: 0,
    all_loaded: false
  },
  onShareAppMessage: function () {
    var that = this
    return {
      title: "明信片",
      desc: "",
      path: '/pages/morepicture/morepicture'
    }
  },
  onLoad: function (options) {
    this.setData({
      groupType: options.type
    })
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollH: res.windowHeight
        })
      that.getData()
      }
    })
  },
  getData: function () {
    var that = this
    if (that.data.total_record <= that.data.dataTopicList.length && that.data.total_record > 0) {
      that.setData({ all_loaded: true })
      return;
    }
    that.setData({
      pageIndex: that.data.pageIndex + 1
    })
    app.ajax("puzzlev4/groupTopicListV4", { order: "CreatedDate DESC", pageIndex: that.data.pageIndex, groupType: that.data.groupType }, function(res){
      that.setData({
        dataTopicList: res.data.topic_list,
        total_record: res.data.total_records
      })
    })
  },
  //跳转到详情
  viewDetail: function (event) {
    app.globalData.pushData = event.currentTarget.dataset.categoryItem;
    let categoryId = app.globalData.pushData.id;
    wx.navigateTo({
      url: '../category/category?id=' + categoryId
    });
  }
})