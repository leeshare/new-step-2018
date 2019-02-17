// pages/mycollectview/mycollectview.js
var HorizontalWaterfallFlow = require('../../utils/waterfallflow.js');
var app = getApp()
Page({
  data: {
    userGroupId: 0,
    userGroup: {},
    user_photo_groups: [],
    total_record: 0,
    col1: [],
    col2: [],
    page_index: 0,
    all_loaded: false,
    last_search_condition: {},
    colAll: [],
    col1H: 0,
    col2H: 0,
    loadingCount: 0,
    touch_start: 0,
    touch_end: 0,
    showModalStatus: false
  },
  onShareAppMessage: function () {
    return {
      title: '找好图用找图',
      desc: '',
      path: '/pages/shareCollect/shareCollect?id=' + app.globalData.id
    }
  },
  onLoad: function (options) {
    var that = this

    app.globalData.id = options.id;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollH: res.windowHeight,
          imgWidth: res.windowWidth * 0.48,
          offsetWidth: res.windowWidth,//屏幕宽度
          pixelRatio: res.pixelRatio,//屏幕密度
        });
      }
    })
    let userGroupId = options.id;
    this.setData({
      userGroupId: userGroupId,
      //userGroup: app.globalData.pushData
    })

  },
  onReady: function () {
    // 页面渲染完成

  },
  onShow: function () {
    // 页面显示
    this.getData();
    if (app.globalData.pushData) {
      var ug = this.data.userGroup;
      ug.GroupName = app.globalData.pushData.GroupName
      this.setData({
        userGroup: ug
      })
    }

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  createFavorite: function (e) {
    app.globalData.pushData = this.data.userGroup;
    wx.navigateTo({
      url: '../myFavoriteCreate/myFavoriteCreate'
    })
  },
  gotohome: function () {
    app.goHome()
  },
  gotoBack: function () {
    app.goBack();
  },
  getData: function (isReload) {
    var that = this;

    isReload = (isReload === true);
    var that = this;
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
    var condition = { userGroupId: that.data.userGroupId, pageIndex: 1, pageSize: 999 }
    that.setData({ last_search_condition: condition });
    app.ajax('puzzleV4/otherUserCollectPhotoList', condition, function (res) {
      console.log(res.data)
      that.setData({
        total_record: res.data.total_records,
        userGroup: res.data.user_group,
        creatorInfo: res.data.creator_info
      })
      if (res.data.total_records==res.data.user_photo_groups.length){
        that.setData({ all_loaded: true })
      }
      let tempphoto=[];
       for (let i = 0; i < res.data.user_photo_groups.length; i++) {
        tempphoto.push(res.data.user_photo_groups[i].photo)
      }
      wx.setNavigationBarTitle({ title: that.data.creatorInfo.name + "的图册" });
      that.getImageFlowItemsV2(tempphoto, isReload);
      that.setData({ isloading: true })
    })

  },
  getImageFlowItems: function (dataItems, isReload) {
    let loadingCount = this.data.loadingCount - 1;
    let col1 = isReload ? [] : this.data.col1;
    let col2 = isReload ? [] : this.data.col2;
    let colAll = isReload ? [] : this.data.colAll;
    let col1H = isReload ? 0 : this.data.col1H;
    let col2H = isReload ? 0 : this.data.col2H;
    for (let i = 0; i < dataItems.length; i++) {
      let imgHeight = dataItems[i].photo.height;
      let imageObj = dataItems[i];
      var isExists = false;
      for (var j = 0; j < colAll.length; j++) {
        if (imageObj.photo_id == colAll[j].photo_id) {
          isExists = true;
          break;
        }
      }
      if (isExists) {
        continue;
      }

      //判断当前图片添加到左列还是右列
      if (col1H <= col2H) {
        col1H += imgHeight;
        col1.push(imageObj);
      } else {
        col2H += imgHeight;
        col2.push(imageObj);
      }
      colAll.push(imageObj.photo);
    }
    let data = {
      loadingCount: loadingCount,
      col1: col1,
      col2: col2,
      colAll: colAll,
      col1H: col1H,
      col2H: col2H
    };
    this.setData(data);
  },
  gotoPhoto: function (e) {
    var that = this;
    var touchTime = that.data.touch_end - that.data.touch_start;
    console.log(touchTime);

    let photoId = e.currentTarget.dataset.photoId;
    app.globalData.pushData = null;
    var pushData = { list: this.data.colAll, index: -1, condition: this.data.last_search_condition, total_record: this.data.total_record ,ajaxurl:'puzzleV4/otherUserCollectPhotoList',datakey:'user_photo_groups'}
    for (var i = 0; i < this.data.colAll.length; i++) {
      if (this.data.colAll[i].photo_id == photoId) {
        pushData.index = i;
        app.globalData.pushData = pushData;
        break;
      }
    }

    wx.navigateTo({
      url: '../photo/photo?id=' + photoId
    });
  },
  //按下事件开始  
  mytouchstart: function (e) {
    let that = this;
    that.setData({
      touch_start: e.timeStamp
    })
    console.log(e.timeStamp + '- touch-start')
  },
  //按下事件结束  
  mytouchend: function (e) {
    let that = this;
    that.setData({
      touch_end: e.timeStamp
    })
    console.log(e.timeStamp + '- touch-end')
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
