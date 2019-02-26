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
    photoTotalNum: 0,
    inputvalue: true,
    keyvalue: "",
    dataSearchResult: [],
    //热词列表
    dataWordList: [],
    //历史搜索
    dataHistoryList: [],
    scrollH: 0,
    nobjico: false,
    norecord: true,
    showSearch: true,
    scrollTop: 0,
    is_top_filter: 0, //是否置顶过滤面板
  },
  onShareAppMessage: function () {
    return {
      title: '找好图用找图',
      desc: '',
      path: '/pages/index'
    }
  },
  onLoad: function () {
    let that = this;

    wx.getSystemInfo({
      success: (res) => {
        console.log(res)
        let ww = res.windowWidth;
        let wh = res.windowHeight;
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
  onShow:function(){
    this.setData({ showSearch: true,dataSearchResult: [] });
  },
  //搜索事件事件
  showSearchModel: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    var that = this;
    that.animation = animation;
    animation.translateY(300).step()

    that.setData({ showSearch: false, animationData: animation.export() });
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }.bind(that), 200);

    that.loadDatalist();
  },
  hideSearchModel: function () {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showSearch: true
      })
    }.bind(this), 200)

    this.clearinput();
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
      'puzzlev4/PuzzleDiscoverDefaultData',
      { dataVersion: 0 },
      function (response) {
        var categorys = response.data.data_categorys.group_list;
        var topics = response.data.data_topics.group_list;
        var photoTotalNum = response.data.photo_total_num;
        that.setData({
          categoryItems: [{ categoryType: 2, categoryName: '专辑', categoryLists: topics }, { categoryType: 1, categoryName: '图库', categoryLists: categorys }],
          photoTotalNum: photoTotalNum
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

  viewmore: function () {
    wx.navigateTo({
      url: '../viewmore/viewmore'
    })
  },
  Inputword: function (e) {
    var that = this;
    that.setData({
      inputvalue: false,
    })
    if (e.detail.value != "") {
      that.setData({
        inputvalue: false,
        clearbutton: false,
        keyvalue: e.detail.value
      })
    }
    else {
      that.setData({
        clearbutton: true,
        dataSearchResult: []
      })
    }
    app.showLoading('加载中');
    that.loadDatalist(e.detail.value)

  },
  clearinput: function (e) {
    var that = this;
    that.setData({
      nobjico: false,
      inputvalue: true,
      norecord:true,
      dataSearchResult: [],
      keyvalue: ""
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
      nobjico: false,
    })
    wx.navigateTo({
      url: '../detail/detail?keyword=' + keywordObj.keyword
    })
    var historys = app.getStorageValueSync(2) || []
    var result = []
    result.push(keywordObj)
    for (var i = 0; i < historys.length; i++) {
      var isExist = false;
      for (var j = 0; j < result.length; j++) {
        if (result[j].keyword_id == historys[i].keyword_id) {
          isExist = true;
          break;
        }
      }
      if (!isExist)
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

    app.ajax("puzzlev2/keywordSearchList", { keyword: kw, pageIndex: 1, pageSize: 10 }, function (res) {
      console.log(res);
      app.hideLoading();
      if (res.data.keyword_obj_list.length == 0) {
        that.setData({
          norecord: false
        })
      } else {
        that.setData({
          norecord: true,
          inputvalue: true
        })
      }
      if (res.data.keyword_obj_list) {
        if (kw) {
          that.setData({
            dataSearchResult: res.data.keyword_obj_list,
          })
        } else {
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
  navigatebackto: function () {
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
  clearHis: function () {
    app.removeStorageValueSync(2)
    this.setData({
      dataHistoryList: []
    })
  },
 
})
