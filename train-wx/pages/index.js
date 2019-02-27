//index.js
//获取应用实例
const app = getApp()
var WxNotificationCenter = require("../utils/WxNotificationCenter.js")
Page({
  data: {
    title: '培训',
    resUrl: app.resUrl,

    currentTab: 0,
    winWidth: 0,
    windowHeight: 0,

    topactive: '0',
    tabActive: '1',
    scrollH: 0,
    imgWidth: 0,
    ishidemode: true,
    showSearch: true,
    isfocuse: false,
    cancel: true,
    essence_id: 0,  //精选
    topicNames: [], //主题名称列表
    topics: [],  //主题列表
    categorys: [], //分类列表
    current: {},   //当前选中的的 主题
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

    motto: 'Hello World2',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    //swiper
    background: ['demo-text-1', 'demo-text-2', 'demo-text-3'],
  },
  onShareAppMessage: function () {
    return {
      title: '要培训找培训',
      desc: '',
      path: '/pages/index'
    }
  },
  onLoad: function () {
    let that = this;
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })

      wx.getSystemInfo({
        success: (res) => {
          console.log(res)
          let ww = res.windowWidth;
          let wh = res.windowHeight - 40;
          let scrollH = wh;

          that.setData({
            winWidth: ww,
            winHeight: wh,
            scrollH: scrollH
          });

          that.loadIndexList()
        }
      })
    })
    WxNotificationCenter.addNotification("update_photo_favorite", that.updatePhotoFavorite, that)
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
  //推页到 更多课程页
  onShowMoreCourse: function(){
    //推页
    wx.navigateTo({
      url: 'component/all_course/all_course'
    });
  },
  bindTabChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  /** 
   * 点击tab切换 
   */
  swichTabNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },

  onShow: function () {
    this.setData({ showSearch: true, dataSearchResult: [] });
  },
  updatePhotoFavorite: function (obj) {
    if (obj && obj.id && obj.num >= 0) {
      var that = this;
      for (var i = 0; i < that.data.current.photo_list.length; i++) {
        var item = that.data.current.photo_list[i];
        if (item.photo_id === obj.id) {
          item.status_info.total_favorite = obj.num;
          break;
        }
      }
      for (var i = 0; i < that.data.topics.length; i++) {
        var c = that.data.topics[i];
        for (var j = 0; j < c.photo_list.length; j++) {
          if (c.photo_list[j].photo_id === obj.id) {
            c.photo_list[j].status_info.total_favorite = obj.num;
            break;
          }
        }
      }
      for (var i = 0; i < that.data.categorys.length; i++) {
        var c = that.data.categorys[i];
        for (var j = 0; j < c.photo_list.length; j++) {
          if (c.photo_list[j].photo_id === obj.id) {
            c.photo_list[j].status_info.total_favorite = obj.num;
            break;
          }
        }
      }
    }
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
    var that = this;
    var dataset = event.currentTarget.dataset;
    let categoryId = dataset.categoryId;
    let index = event.currentTarget.dataset.index;
    if (index == 5) {
      //去去 精选详情页
      wx.navigateTo({
        url: '../category/category?id=' + categoryId
      });
      return;
    }
    let photoId = dataset.photoItem.photo_id;
    app.globalData.pushData = null;
    var lst = [];
    var total = 0;
    if (that.data.current.id == categoryId) {
      lst = that.data.current.photo_list
      total = that.data.current.photo_total_records
    } else {
      for (var i = 0; i < that.data.categorys.length; i++) {
        if (that.data.categorys[i].id == categoryId) {
          lst = that.data.categorys[i].photo_list
          total = that.data.categorys[i].photo_total_records
          break;
        }
      }
    }
    //app.globalData.pushData = dataset.photoItem;
    var condition = { groupId: categoryId, pageIndex: 1, pageSize: 6, keyword: "" }
    that.setData({ last_search_condition: condition });

    var pushData = { list: lst, index: -1, condition: this.data.last_search_condition, total_record: total, ajaxurl: 'puzzleV4/getPhotoListOfGroup', datakey: 'data_list' }
    for (var i = 0; i < lst.length; i++) {
      if (lst[i].photo_id == photoId) {
        pushData.index = i;
        pushData.curr = lst[i];
        app.globalData.pushData = pushData;
        break;
      }
    }

    wx.navigateTo({
      url: '../photo/photo?id=' + photoId
    });
  },
  //载入分类数据
  loadIndexList: function () {
    var that = this;
    app.showLoading('加载中');
    app.ajax(
      'puzzleV20170301/indexHome',
      { dataVersion: 0 },
      function (response) {
        var categorys = response.data.data_categorys.group_list;
        var topicNames = response.data.data_topics;
        //topicNames.push({ id: -1, name: '精选'});
        var essence = response.data.data_editor;
        var topics = that.data.topics;
        var photoTotalNum = response.data.photo_total_num;
        var isExistEssence = false;
        for (var i = 0; i < topics.length; i++) {
          if (topics[i].id == essence.id) {
            isExistEssence = true;
            break;
          }
        }
        if (!isExistEssence) {
          topics.push(essence);
        }
        that.setData({
          topicNames: topicNames,
          categorys: categorys,
          //essence: essence
          essence_id: essence.id,
          topics: topics,
          current: essence,
          photoTotalNum: photoTotalNum
        })

        //that.setData({
        //  categoryItems: [{ categoryType: 2, categoryName: '专辑', categoryLists: topics }, { categoryType: 1, categoryName: '图库', categoryLists: categorys }]
        //});
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
  viewmore: function () {
    wx.navigateTo({
      url: '../viewmore/viewmore'
    })
  },
  toMyCollect: function () {
    wx.navigateTo({
      url: '../mycollect/mycollect'
    })

  },
  getPhotosByCategory: function (id) {
    var that = this;
    app.ajax('puzzleV4/getGroupInfoById', { groupId: id, defaultPhotoNum: 6 },
      function (response) {
        var topics = that.data.topics;
        var isExist = false;
        if (response.data.group) {
          for (var i = 0; i < topics.length; i++) {
            if (topics[i].id == response.data.group.id) {
              topics[i] = response.data.group;
              isExist = true;
              break;
            }
          }
          if (!isExist) {
            topics.push(response.data.group);
            var index = that.data.topactive;
            that.setData({
              current: topics[index]
            });
          }
        }

      }
    );
  },
  selative: function (e) {
    var that = this;
    var dataset = e.currentTarget.dataset;
    var index = dataset.active;
    var id = dataset.id;
    this.setData({
      topactive: index
    })
    var topics = that.data.topics;
    var isExist = false;
    for (var i = 0; i < topics.length; i++) {
      if (id == topics[i].id) {
        isExist = true;
        break;
      }
    }
    if (!isExist) {
      if (id > 0)
        that.getPhotosByCategory(id);
    } else {
      that.setData({
        current: topics[index]
      });
    }
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
      norecord: true,
      inputvalue: true,
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

    app.ajax("puzzlev2/keywordSearchList", { keyword: kw, pageIndex: 1, pageSize: 99 }, function (res) {
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
