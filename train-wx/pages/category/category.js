var HorizontalWaterfallFlow = require('../../utils/waterfallflow.js');
var app = getApp()
var WxNotificationCenter = require("../../utils/WxNotificationCenter.js")
Page({
  data: {
    scrollH: 0,
    scrollW: 0,
    showModalStatus: false,
    category: {},
    temp_photo_list: [],
    page_index: 0,
    total_record: 0,
    all_loaded: false,
    isloading: true,
    keyword: '全部',
    keyword_choosed_index: -2,
    checkitems: [{ name: "checkbox1", checked: false, value: "我已阅读" }],
    imgWidth: 0,
    loadingCount: 0,
    photo: {},
    colAll: [],
    scrollTop: 0,
    ishashome: true,
    last_search_condition: {},
    is_top_filter: 0, //是否置顶过滤面板
    is_paging: false,
    is_loaded: false
  },
  onShareAppMessage: function () {
    var that = this
    return {
      title: that.data.category.name,
      desc: "",
      path: '/pages/category/category?id=' + that.data.category.id,
      success: function (res) {
        if (res) {

        }
      }
    }
  },
  scrollHandler: function (event) {
    if (event.detail.scrollTop >= this.data.scrollH / 2) {
      this.setData({ is_top_filter: 1 });//置顶
    }
    else {
      this.setData({ is_top_filter: 0 });//取消置顶
    }
  },
  gototop: function () {
    this.setData({
      scrollTop: 0
    })
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    //this.fetchDataKeylist();
    //this.fetchDatagroupimg();
    var categoryId = options.id;

    var category = app.globalData.pushData;
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollH: res.windowHeight,
          imgWidth: res.windowWidth * 0.48,
          offsetWidth: res.windowWidth,//屏幕宽度
          pixelRatio: res.pixelRatio,//屏幕密度
          category: category//JSON.parse(options.item)
        });
        app.globalData.pushData = null;
        console.log(that.data.category)
        if (category && category.id) {
          wx.setNavigationBarTitle({ title: category.name });
          that.loadImages();
        } else {
          app.ajax('puzzleV4/getGroupInfoById', { groupId: categoryId }, function (res) {
            that.setData({
              category: res.data.group
            });
            wx.setNavigationBarTitle({ title: res.data.group.name });
            that.loadImages();
          })
        }

      }
    })

    var that = this
    WxNotificationCenter.addNotification("update_photo_favorite",that.updatePhotoFavorite, that)
  },
  updatePhotoFavorite: function(obj){
    if(obj && obj.id && obj.num >= 0){
      var that = this;
      for(var i = 0; i < that.data.colAll.length; i++){
        var item = that.data.colAll[i];
        if(item.photo_id === obj.id){
          item.status_info.total_favorite = obj.num;
          break;
        }
      }
    }
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
    var condition = { groupId: that.data.category.id, pageIndex: that.data.page_index, keyword: that.data.keyword}
    that.setData({ last_search_condition: condition });
    app.ajax('puzzleV4/getPhotoListOfGroup', condition, function (res) {
      console.log(res.data)
      that.setData({ total_record: res.data.total_records })
      if (res.data.total_records==res.data.data_list.length){
        that.setData({ all_loaded: true })
      }
      that.getImageFlowItemsV2(res.data.data_list, isReload);
      that.setData({ isloading: true })
      //}
    })
  },
  getImageFlowItemsV2: function (dataItems, isReload) {
    let loadingCount = this.data.loadingCount - 1;
    let colAll = isReload ? [] : this.data.colAll;
    //合并数据
    colAll = colAll.concat(dataItems);
    //水平瀑布流处理
    let container = { children: colAll, offsetWidth: this.data.offsetWidth - Math.round(3 / this.data.pixelRatio) };//去除右侧margin宽度
    let options = {
      defaultHeight: 180, //默认行高
      margin: Math.round(3 / this.data.pixelRatio)//图片间距px，与样式flow-row-imagebox{margin: 12rpx 12rpx}对应
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
  gotoPhoto: function (e) {
    let photoId = e.currentTarget.dataset.photoId;
    app.globalData.pushData = null;
    var pushData = { list: this.data.colAll, index: -1, condition: this.data.last_search_condition, total_record: this.data.total_record ,ajaxurl:'puzzleV4/getPhotoListOfGroup',datakey:'data_list' }
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
  onPullDownRefresh: function () {
    this.setData({
      page_index: 0
    })
    this.loadImages()
  },
  filterKeyword: function (e) {
    var keyword = e.currentTarget.dataset.keyword
    var keywordIndex = -2;
    if (keyword == "全部") {
      keywordIndex = -2;
    }
    if (keyword == "热门") {
      //keyword = "";
      keywordIndex = -1;
    } else {
      for (var i = 0; i < this.data.category.keyword_str_list.length; i++) {
        if (this.data.category.keyword_str_list[i] == keyword) {
          keywordIndex = i;
          break;
        }
      }
    }

    this.setData({
      keyword: keyword,
      isloading: true,
      all_loaded: true,
      keyword_choosed_index: keywordIndex
    });
    this.loadImages(true);
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
  showModal: function (e) {
    var that = this
    var i = e.currentTarget.dataset.type;
    that.photoId = e.currentTarget.dataset.photoId;
    if (i == 2) {
      //下载
      if (app.getStorageValueSync(1) == 1) {
        that.downloadImg();
        return
      }
    } else if (i == 1) {
      //评论
    }

    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    that.animation = animation
    animation.translateY(300).step()
    if (i == 2) {
      that.setData({
        animationData: animation.export(),
        showModalStatus: true
      })
    }
    if (i == 1) {
      that.setData({
        animationData: animation.export(),
        showModalcomment: true
      })
    }

    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }.bind(that), 200)

  },
  hideModal: function (e) {

    // 隐藏遮罩层
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
      if (this.data.showModalStatus) {
        this.setData({
          animationData: animation.export(),
          showModalStatus: false
        })
      }
      if (this.data.showModalcomment) {
        this.setData({
          animationData: animation.export(),
          showModalcomment: false
        })
      }
    }.bind(this), 200)
  },
  checkboxChange: function () {
    var lastCk = !this.data.checkitems[0].checked
    this.setData({
      checkitems: [{ name: "checkbox1", checked: lastCk, value: "我已阅读" }],
    })
  },
  downloadImg: function (e) {
    var that = this;

    var val = app.getStorageValueSync(1)
    if (val != 1) {
      if (!that.data.checkitems[0].checked) {
        wx.showToast({
          title: '请点击同意声明协议',
          icon: 'success',
          duration: 1000
        })
        return;
      }
    }
    app.ajax("puzzleV4/getPhotoInfoById", { photoId: that.photoId }, function (res) {
      that.setData({
        photo: res.data.photo,
      })
      var url = that.data.photo.cover_big_wxa_download;
      var urls = [];
      urls.push(url);
      wx.previewImage({
        current: '', // 当前显示图片的http链接
        urls: urls, // 需要预览的图片http链接列表
      });
      app.setStorageValueSync(1, 1)
      wx.getSystemInfo({
        success: function (res) {
          console.log(res)
          var clientType = -1;
          if (res.system.ltrim().indexOf("iOS") >= 0 || res.system.ltrim().indexOf("IOS") >= 0 || res.system.ltrim().indexOf("ios") >= 0) {
            clientType = 12
          } else if (res.system.ltrim().indexOf("Android") >= 0 || res.system.ltrim().indexOf("android") >= 0 || res.platform.ltrim().indexOf("android") >= 0) {
            clientType == 11
          }
          var downloadInfo = {
            PhotoshootID: that.data.photo.photo_id,
            ClientType: clientType,
            ClientInfo: "[model] " + res.model + " [system] " + res.system + " [version] " + res.version + " [platform] " + res.platform
          }
          console.log(downloadInfo)
          app.ajax('puzzleV4/insertPhotoDownload', downloadInfo, function (res) {
            console.log(res.data)

          })

        }
      })
      that.hideModal()
    })


  },
  gotohome: function () {
    app.goHome()
  },
  goBack: function () {
    app.goBack()
  }

})