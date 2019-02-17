// pages/search/search.js
var app = getApp()
Page({
  data: {
    inputvalue: true,
    keyvalue:"",
    dataSearchResult: [],
    //热词列表
    dataWordList: [],
    //历史搜索
    dataHistoryList: [],
    scrollH: 0,
    nobjico: false
  },
  onShareAppMessage: function () {
    var that = this
    return {
      title: "找图",
      desc: "",
      path: '/pages/search/search'
    }
  },
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollH: res.windowHeight 
        });
      }
    })
    this.loadDatalist();
  },
  Inputword: function (e) {
    var that = this;
  
    if (e.detail.value != "") {
      that.setData({
        inputvalue: false,
        clearbutton:false,
        keyvalue:e.detail.value
      })
    }
    else {
      that.setData({
        inputvalue: true,
        clearbutton:true
      })
    }
    that.loadDatalist(e.detail.value)

  },
  clearinput:function(e){
    var that=this;
    that.setData({
        nobjico:false,
        inputvalue: true,
        keyvalue:""
      })
      
  },
  toDetail: function (event) {
    var that = this
    var keywordObj = event.currentTarget.dataset.item;
    keywordObj.keyvalue = that.data.keyvalue;
    app.globalData.pushData = keywordObj
    that.setData({
      keyvalue: "",
      inputvalue: true,
      nobjico:false,
    })
    wx.navigateTo({
      url: '../detail/detail?keyword=' + keywordObj.keyword
    })
    var historys = app.getStorageValueSync(2) || []
    var result = []
    result.push(keywordObj)
    for(var i = 0; i < historys.length; i++){
        var isExist = false;
        for(var j = 0; j < result.length; j++){
          if(result[j].keyword_id == historys[i].keyword_id){
            isExist = true;
            break;
          }
        }
        if(!isExist)
          result.push(historys[i])
    }
    app.setStorageValueSync(2, result)
    that.setData({
        dataHistoryList: result
    })
    that.cancelinput()
  },
  loadDatalist: function (kw) {
    var that = this;
    app.showLoading('加载中');
    app.ajax("puzzlev2/keywordSearchList", { keyword: kw, pageIndex: 1, pageSize: 99 }, function (res) {
      console.log(res)
      app.hideLoading();

      if (res.data.keyword_obj_list) {
        if(kw){
          that.setData({
            dataSearchResult: res.data.keyword_obj_list
          })
        }else {
          that.setData({
            dataWordList: res.data.keyword_obj_list
          })
        }
      }
    })

    var res = app.getStorageValueSync(2)
    if (res) {
      that.setData({
        dataHistoryList: res
      })
    }
  },
  cancelinput: function () {
    var that = this;
    that.setData({
      inputvalue: true
    })
  },
  navigatebackto:function(){
    wx.navigateBack({
      delta: 1, // 回退前 delta(默认为1) 页面
    })
  
  },
  hidebjico: function (e) {
    var that = this;

    that.setData({
      nobjico: true
    })

  },
  showbjico: function (e) {
    var that = this;
    if (e.detail.value == "") {
      that.setData({
        nobjico: false
      })
    }
  },
  clearHis: function(){
    app.removeStorageValueSync(2)
    this.setData({
      dataHistoryList: []
    })
  }
})