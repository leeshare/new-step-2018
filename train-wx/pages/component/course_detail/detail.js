// pages/component/course_detail/detail.js
let col1H = 0;
let col2H = 0;
var HorizontalWaterfallFlow = require('../../../utils/waterfallflow.js');
var app = getApp()
Page({
  data: {
    scrollH: 0,
    courseInfo: {},
    currentTab: 0,

    keywordObj: {},
    temp_photo_list: [],
    page_index: 0,
    total_record: 0,
    //all_loaded: false,
    all_loaded: true,

    imgWidth: 0,
    loadingCount: 0,
    col1H: 0,
    col2H: 0,
    col1: [],
    col2: [],
    colAll: [],
    last_search_condition: {},
    scrollTop: 0,
    ishashome: true,
    is_top_filter: 0, //是否置顶过滤面板

  },
  onShareAppMessage: function () {
    var that = this
    return {
      title: that.data.courseInfo.name,
      desc: "",
      path: '/pages/component/course_detail/detail?keyword=' + that.data.courseInfo.name
    }
  },
  onLoad: function (options) {
    let courseInfo = app.globalData.pushData;
    //wx.setNavigationBarTitle({ title: courseInfo.name });
    wx.setNavigationBarTitle({ title: '图文详情' });
    this.setData({ courseInfo: courseInfo });

    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollH: res.windowHeight - 40,
          imgWidth: res.windowWidth * 0.48,
          offsetWidth:res.windowWidth,//屏幕宽度
          pixelRatio:res.pixelRatio,//屏幕密度
        });
      }
    })
    //that.loadImages();
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
  buyCourse: function() {
    //app.showSuccess("购买课程成功")
    app.showFail("购买课程失败")
  },

  onShow: function () {
    let currentPages = getCurrentPages();
    if (currentPages.length == 1) {
      this.setData({
        ishashome: false
      })
    }
  },
  loadImages: function (isReload) {
    var that = this;
    isReload = (isReload === true);
    that.setData({ isloading: false });
    if (!isReload && that.data.total_record <= that.data.colAll.length && that.data.total_record > 0) {
      that.setData({ all_loaded: true })
      return;
    }
    if (that.data.is_paging) {
      return;
    }
    that.setData({
      is_paging: true
    })
    if (isReload) {//初始化
      that.setData({ page_index: 0, all_loaded: false })
    }
    that.setData({ page_index: that.data.page_index + 1 })
    var condition = { keyword: that.data.keywordObj.keyword, pageIndex: that.data.page_index, userType: that.data.keywordObj.keyvalue}
    that.setData({ last_search_condition: condition });

    app.ajax('puzzlev2/keywordPhotoList', condition , function (res) {
      console.log(res.data)
      that.setData({ total_record: res.data.total_records })
      if (res.data.total_records==res.data.keyword_photo_list.length){
        that.setData({ all_loaded: true })
      }
      if (res.data.keyword_photo_list.length > 0) {
        that.getImageFlowItemsV2(res.data.keyword_photo_list, isReload);
        that.setData({ isloading: true })
      }
    })
  },
  getImageFlowItems: function (dataItems) {
    let col1 = this.data.col1;
    let col2 = this.data.col2;
    let colAll = this.data.colAll;
    let col1H = this.data.col1H;
    let col2H = this.data.col2H;
    for (let i = 0; i < dataItems.length; i++) {
      //判断当前图片添加到左列还是右列
      let imgHeight = dataItems[i].height;
      let imageObj = dataItems[i];
      if (col1H <= col2H) {
        col1H += imgHeight;
        col1.push(imageObj);
      } else {
        col2H += imgHeight;
        col2.push(imageObj);
      }
      colAll.push(imageObj);
    }
    let data = {
      col1: col1,
      col2: col2,
      colAll: colAll,
      col1H: col1H,
      col2H: col2H
    };
    this.setData(data);
  },
  gotoPhoto: function (e) {
    let photoId = e.currentTarget.dataset.photoId;
    app.globalData.pushData = null;
    var pushData = { list: this.data.colAll, index: -1, condition: this.data.last_search_condition, total_record: this.data.total_record ,ajaxurl:'puzzlev2/keywordPhotoList',datakey:'keyword_photo_list' }
    
    for (var i = 0; i < this.data.colAll.length; i++) {
      if (this.data.colAll[i].photo_id == photoId) {
        pushData.index = i;
        pushData.curr = this.data.colAll[i];
        app.globalData.pushData = pushData;
        break;
      }
    }
    wx.navigateTo({
      url: '../photo/photo?id=' + photoId
    });
  },
  gotoSearch: function (e) {
    wx.navigateBack()
  },
  onPullDownRefresh: function () {
    this.setData({
      page_index: 1
    })
    this.loadImages()
  },
  favorited: function (e) {
    var that = this
    var photoId = e.currentTarget.dataset.photoId;
    var status = e.currentTarget.dataset.status;
    app.ajax("puzzlev2/photoFavorite", { photoId: photoId, isCancel: status }, function (res) {
      console.log(res.data)
      for (var i = 0; i < that.data.col1.length; i++) {
        var temp = that.data.col1[i]
        if (temp.photo_id == photoId) {
          temp.status_info.is_favorited = !temp.status_info.is_favorited
          if (temp.status_info.is_favorited)
            temp.status_info.total_favorite += 1
          else
            temp.status_info.total_favorite -= 1
          break;
        }
      }
      for (var i = 0; i < that.data.col2.length; i++) {
        var temp = that.data.col2[i]
        if (temp.photo_id == photoId) {
          temp.status_info.is_favorited = !temp.status_info.is_favorited
          if (temp.status_info.is_favorited)
            temp.status_info.total_favorite += 1
          else
            temp.status_info.total_favorite -= 1
          break;
        }
      }
      that.setData({
        col1: that.data.col1,
        col2: that.data.col2
      })
    })
  },
  gotohome: function () {
    app.goHome()
  },
  goBack: function () {
    app.goBack();
  },
  gototop: function () {
    this.setData({
      scrollTop: 0
    })
  },
  scrollHandler: function (event) {
    if (event.detail.scrollTop >= this.data.scrollH / 2) {
      this.setData({ is_top_filter: 1 });//置顶
    }
    else {
      this.setData({ is_top_filter: 0 });//取消置顶
    }
  },
  getImageFlowItemsV2: function (dataItems, isReload) {
    let loadingCount = this.data.loadingCount - 1;
    let colAll = isReload ? [] : this.data.colAll;
    //合并数据
    colAll = colAll.concat(dataItems);
    //水平瀑布流处理
    let container = { children: colAll, offsetWidth: this.data.offsetWidth - (6 / this.data.pixelRatio) };//去除右侧margin宽度
    let options = {
      defaultHeight: 180, //默认行高
      margin: (6 / this.data.pixelRatio)//图片间距px，与样式flow-row-imagebox{margin: 12rpx 12rpx}对应
    };
    new HorizontalWaterfallFlow(container, options);
    //水平瀑布流行
    let flowRows = [];
    if (container.children.length > 0) {
      for (let i = 0; i <= container.children[container.children.length - 1].flowRowNo; i++) {
        flowRows[i] = i;
      }
    }
    console.log("offsetWidth:" + this.data.offsetWidth);
    console.log("pixelRatio:" + this.data.pixelRatio);
    console.log("children:" + JSON.stringify(container.children));
    //处理完毕后页面刷新排版
    let data = {
      loadingCount: loadingCount,
      colAll: colAll,
      flowRows: flowRows,
      is_paging: false,
      is_loaded: true
    };
    this.setData(data);
  },
})