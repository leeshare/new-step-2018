// pages/photo/photo.js
var util = require('../../utils/util.js')
var olddistance = 0;  //这个是上一次两个手指的距离  
var newdistance;      //本次两手指之间的距离，两个一减咱们就知道了滑动了多少，以及放大还是缩小（正负嘛）  
var oldscale = 1;     //这个是上一次动作留下的比例  
var diffdistance;     //这个是新的比例，新的比例一定是建立在旧的比例上面的，给人一种连续的假象  
var baseHeight;       //上一次触摸完之后的高  
var baseWidth;        //上一次触摸完之后的宽  
var windowWidth = 0;  //咱们屏幕的宽  
var windowHeight = 0; //咱们屏幕的高  

var WxNotificationCenter = require("../../utils/WxNotificationCenter.js")

var app = getApp()
Page({
  data: {
    showAll: false,
    showModalStatus: false,
    showModalcomment: false,
    scaleWidth: "",
    scaleHeight: "",
    checkitems: [{ name: "checkbox1", checked: false, value: "我已阅读" }],
    imgList: "",
    photo: {},
    slide: false,
    yindao: "1",
    photoList: [],
    photoIndex: -1,
    totalRecord: 0,
    isrotate: false,
    lastSearchCondition: {},  //上一次查询条件
    content: '',
    ishidemode: true,
    internaler: null,
    submit: false,
    content2: "",
    is_ios: false,
    showFavorte: true,
    isLoaded: false,
    photo: {},
    ishashome: true,
    user_groups: [],
    popInputDialog: false,
    
    swiper_current_index: 1,//默认起始位置
    last_swiper_index: 1,//最后一次滑屏对应的索引

    upg: {
      GroupName: '',
      UserGroupID: 0
    },
    option_upg: {},
    photo_id: 0
  },
  onShareAppMessage: function () {
    var that = this
    console.log("分享" + that.data.photo.name)
    return {
      title: that.data.photo.name,
      desc: "",
      path: '/pages/photo/photo?id=' + that.data.photo.photo_id
    }
  },
  onLoad: function (options) {
    var that = this
    let photoId = options.id;
    app.globalData.pushData = app.globalData.pushData || {};
    let photoList = app.globalData.pushData.list;
    let photoIndex = app.globalData.pushData.index;
    let lastSearchCondition = app.globalData.pushData.condition;
    let ajaxurl=app.globalData.pushData.ajaxurl;
    let datakey=app.globalData.pushData.datakey;
    let totalRecord = app.globalData.pushData.total_record;
    app.showLoading('加载中');
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        var clientType = -1;
        if (res.system.ltrim().indexOf("iOS") >= 0) {
          that.setData({ is_ios: true });
        }
      }
    });
    if (photoList && photoList.length > 0) {
      if (app.globalData.pushData.curr) {
        that.setData({
          photo: app.globalData.pushData.curr
        })
      } else {
        that.setData({
          photo: photoList[photoIndex]
        })
      }
      that.setData({
        photoList: photoList,
        photoIndex: photoIndex,
        //photo: photoList[photoIndex],
        lastSearchCondition: lastSearchCondition,
        ajaxurl:ajaxurl,
        datakey:datakey,
        totalRecord: totalRecord
      });
      console.log("从上下文取图片对象");
      console.log(that.data.photo);

      let photoListLoop = this.InitPhotoListLoop(this.data.photoList, this.data.photoIndex);
      this.setData({
        enableCircular: !(this.data.photoIndex < 1),
        photoListLoop: photoListLoop//循环数组
      });

      wx.setNavigationBarTitle({ title: that.data.photo.name });
      app.globalData.pushData = null;
    } else {
      app.ajax("puzzleV4/getPhotoInfoById", { photoId: photoId }, function (res) {
        that.setData({
          photo: res.data.photo,
          photoList: [res.data.photo],
          photoIndex: 0,
          totalRecord: 1
        })

        let photoListLoop = [res.data.photo];
        that.setData({
          photoListLoop: photoListLoop,//循环数组
          swiper_current_index: 0
        });
        console.log("按Id取图片对象");
        console.log(that.data.photoListLoop);

        wx.setNavigationBarTitle({ title: res.data.photo.name });
      })
    }

    // 页面初始化 options为页面跳转所带来的参数
    var res = wx.getSystemInfoSync();  //获取系统信息的同步方法，我用了异步里面提示我this.setData错了  
    windowWidth = res.windowWidth;
    windowHeight = res.windowHeight;
    //那就给前面的图片进行赋值，高，宽以及路劲   
    this.setData({
      scaleHeight: windowHeight,
      scaleWidth: windowWidth
    })
    console.log("读取scale w h：" + this.data.scaleWidth + " " + this.data.scaleHeight)
  },
  setPhotoView: function (msg) {
    var photo = this.data.photoList[this.data.photoIndex]
    console.log("记录图片浏览【id=" + photo.photo_id + "】 " + msg);
    app.ajax('puzzleV4/setPhotoStat', { photoId: photo.photo_id, statType: 1 }, function (res) {
      //console.log(res.data)
    })
    app.hideLoading();

    //var url = photo.wxa_is_use_watermark ? photo.cover_big_wxa : photo.cover_big
    //console.log("当前图片大尺寸尺寸：" + url);
  },
  onReady: function () {
    // 页面渲染完成
    var that = this;
    var sysInfo = wx.getSystemInfoSync();
    var accessNum = app.getStorageValueSync(4)
    if (accessNum == '') {
      that.setData({ ishidemode: false })
      accessNum += 1
      app.setStorageValueSync(4, accessNum)
    }
    this.setPhotoView("onReady");
  },
  onShow: function () {
    // 页面显示
    let currentPages = getCurrentPages();
    if (currentPages.length == 1) {
      this.setData({
        ishashome: false
      })
    }
    this.getData();
  },
  //初始化循环的图片数组
  InitPhotoListLoop: function (photoList, startIndex) {
    let loopPhotoList = [];
    //针对特殊情况处理
    if (photoList.length <= 3 || startIndex == 0) {
      for (let i = 0; i < Math.min(photoList.length, 3); i++) {
        loopPhotoList.push(photoList[i]);
      }
      this.setData({ swiper_start_index: startIndex, swiper_current_index: startIndex, last_swiper_index: startIndex});
      return loopPhotoList;
    } else if (startIndex == photoList.length - 1) {
      for (let i = photoList.length - 3; i < photoList.length; i++) {
        loopPhotoList.push(photoList[i]);
      }
      this.setData({ swiper_start_index: 2, swiper_current_index: 2, last_swiper_index: 2});
      return loopPhotoList;
    }
    //正常情况
    let preIndex = startIndex - 1;
    let nextIndex = startIndex + 1;
    //前一个
    if (preIndex >= 0) {
      loopPhotoList.push(photoList[preIndex]);
    }
    else {
      loopPhotoList.push(photoList[photoList.length - 1]);//尾
    }
    //中间
    loopPhotoList.push(photoList[startIndex]);
    //后一个
    if (nextIndex < photoList.length) {
      loopPhotoList.push(photoList[nextIndex]);
    }
    else {
      loopPhotoList.push(photoList[0]);//头
    }
    return loopPhotoList;
  },
  //滑块事件时动态替换数组
  SetPhotoListLoopOnSwiperEvent: function (current_swiper_index) {
    let isMoveRight = false;
    if (this.data.startX > this.data.endX) {//向右滑动
      //-->向右滑动方向（1页)
      if ((this.data.last_swiper_index + 1 == current_swiper_index)
        || (this.data.last_swiper_index == 2 && current_swiper_index == 0)) {
        this.data.last_swiper_index = current_swiper_index;
        this.data.photoIndex++;
        isMoveRight = true;
      }
      //-->向右滑动方向(2页)
      else if ((this.data.last_swiper_index + 2) % 3 == current_swiper_index) {
        this.data.last_swiper_index = current_swiper_index;
        this.data.photoIndex += 2;
        isMoveRight = true;
      }
    }
    else {//向左滑动
      //<--向左滑动方向（1页)
      if ((this.data.last_swiper_index - 1 == current_swiper_index)
        || (this.data.last_swiper_index == 0 && current_swiper_index == 2)) {
        this.data.last_swiper_index = current_swiper_index;
        this.data.photoIndex--;
        isMoveRight = false;
      }
      //<--向左滑动方向（2页)
      else if ((this.data.last_swiper_index - 2 + 3) % 3 == current_swiper_index) {
        this.data.last_swiper_index = current_swiper_index;
        this.data.photoIndex -= 2;
        isMoveRight = false;
      }
    }   
    //循环处理数据
    if (isMoveRight) {
      //到结尾从头开始
      if (this.data.photoIndex + 1 == this.data.totalRecord) {
          this.data.photoListLoop[(current_swiper_index + 1) % 3] = this.data.photoList[0];
      }
      else if (this.data.photoIndex + 1 > this.data.totalRecord) {
          this.data.photoIndex=0;
          this.data.photoListLoop[(current_swiper_index + 1) % 3] = this.data.photoList[this.data.photoIndex+1];
      }
      else {
        this.data.photoListLoop[(current_swiper_index + 1) % 3] = this.data.photoList[this.data.photoIndex+1];
      }
    }
    else {
       //从已有的数据开始循环
      if (this.data.photoIndex == 0) {
          this.data.photoListLoop[((current_swiper_index - 1+3)%3)] = this.data.photoList[this.data.photoList.length-1];
      }
      else if (this.data.photoIndex - 1<0) {
          this.data.photoIndex=this.data.photoList.length-1;
          this.data.photoListLoop[((current_swiper_index - 1+3)%3)] = this.data.photoList[this.data.photoIndex-1];
      } 
      else if (this.data.photoIndex >= 1) {
        this.data.photoListLoop[((current_swiper_index - 1+3)%3)] = this.data.photoList[this.data.photoIndex - 1];
      }
    }
     //设置最新数据
    this.setData({
      last_swiper_index: this.data.last_swiper_index,
      photoIndex: this.data.photoIndex,
      photoListLoop: this.data.photoListLoop 
    });
  },
  //这里是图片加载完毕之后的信息，因为滑动手指距离会变，我们要跟着图片的长宽进行缩放，不能跟着屏幕的长宽进行缩放  
  imgload: function (e) {
    var originalWidth = e.detail.width;//图片原始宽  
    var originalHeight = e.detail.height;//图片原始高  
    var originalScale = originalHeight / originalWidth;//图片高宽比  
    var windowscale = windowHeight / windowWidth;//屏幕高宽比  

    if (originalScale < windowscale) {//图片高宽比小于屏幕高宽比  
      //图片缩放后的宽为屏幕宽  
      baseWidth = windowWidth;
      baseHeight = (windowWidth * originalHeight) / originalWidth;
    } else {//图片高宽比大于屏幕高宽比  
      //图片缩放后的高为屏幕高  
      baseHeight = windowHeight;
      baseWidth = (windowHeight * originalWidth) / originalHeight;
    }
    if (originalHeight / originalWidth > 1.5) {
      this.setData({
        isrotate: true
      })
    }
    else {
      this.setData({
        isrotate: false
      })
    }
  },
  onTouchStart: function (event) {
    //console.log("onTouchStart");
    this.setData({ startX: event.changedTouches[0].clientX });
    //console.log(event.changedTouches);
  },
  onTouchEnd: function (event) {
    this.setData({ endX: event.changedTouches[0].clientX });
    //console.log("onTouchEnd");
    //console.log(event.changedTouches);
  },
  //两手指进行拖动了  
  movetap: function (event) {
    var e = event;
    if (e.touches.length == 2) {
      var xMove = e.touches[1].clientX - e.touches[0].clientX;
      var yMove = e.touches[1].clientY - e.touches[0].clientY;
      var distance = Math.sqrt(xMove * xMove + yMove * yMove);//两手指之间的距离   
      if (olddistance == 0) {
        olddistance = distance; //要是第一次就给他弄上值，什么都不操作  
        //console.log(olddistance);
      }
      else {
        newdistance = distance; //第二次就可以计算它们的差值了  
        diffdistance = newdistance - olddistance;
        olddistance = newdistance; //计算之后更新  
        //console.log(diffdistance);
        var newScale = oldscale + 0.005 * diffdistance;  //比例  
        //console.log(newScale);
        //刷新.wxml  
        this.setData({
          scaleHeight: newScale * baseHeight,
          scaleWidth: newScale * baseWidth

        })
        oldscale = newScale;
        //更新比例  

      }
    }
  },
  endtap: function (event) {
    //console.log(event);//抬起手指，保存下数据  
    if (event.touches.length == 2) {
      olddistance = 0;
    }

  },
  showJieshao: function () {
    var that = this;
    that.setData({
      showAll: true
    })
  },
  hideJieshao: function () {
    var that = this;
    that.setData({
      showAll: false
    })
  },
  downloadImg: function () {
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

    //var url = that.data.photo.cover_big_wxa_download;
    var clientContinue = function (url) {
      var urls = [];
      urls.push(url);
      wx.previewImage({
        current: '', // 当前显示图片的http链接
        urls: urls, // 需要预览的图片http链接列表
      });
      app.setStorageValueSync(1, 1)
      wx.getSystemInfo({
        success: function (res) {
          //console.log(res)
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
    }

    app.ajax('puzzleV4/CheckAndGetDownloadUrl', { clientType: 1, photoId: that.data.photo.photo_id }, function (res) {
      if (res.data && res.data.url) {
        console.log("下载url= " + res.data.url);
        clientContinue(res.data.url);
      } else {
        wx.showToast({
          title: '当前不允许下载图片',
          icon: 'fail',
          duration: 2000
        })
      }
    });

    return


  },
  textBlur: function (e) {
    var that = this;
    var intervaler = this.data.intervaler
    if (!intervaler) {
      intervaler = setInterval(function () {
        if (that.data.submit) {
          clearInterval(intervaler);
          that.setData({
            submit: false,
            intervaler: null,
            content2: ""
          })
        }
      }, 500)
    }
  },
  textInput: function (e) {
    this.setData({
      content: e.detail.value
    });
  },
  evaluate: function () {
    var that = this;
    var content = this.data.content;
    if (!content) {
      wx.showToast({ title: "请输入评价内容" })
      return
    } else if (content.length < 5 || content.length > 500) {
      wx.showToast({ title: "内容为5-500个字" })
      return;
    }
    app.ajax('puzzlev2/setEvaluate', { content: content, evaluateType: 1, photoId: that.data.photo.photo_id, replyUserId: 0 }, function (res) {
      wx.showToast({ title: "评价成功" })
      that.hideModal()
      that.data.photo.status_info.total_evaluate += 1
      for (var i = 0; i < that.data.photoList.length; i++) {
        if (that.data.photoList[i].photo_id == that.data.photo.photo_id) {
          that.data.photoList[i].status_info.total_evaluate += 1
        }
      }
      that.setData({
        photo: that.data.photo,
        photoList: that.data.photoList,
        submit: true
      })
    })

  },
  showModal: function (e) {
    var that = this

    var doSth = function () {
      var i = e.currentTarget.dataset.type;
      if (i == 2) {
        //下载
        if (app.getStorageValueSync(1) == 1) {
          that.downloadImg()
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
    }

    app.getUserInfo(function (userInfo) {
      doSth();
    });
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
  //滑动，翻页时，触发
  intervalChange: function (e) {
    /*this.setData({
      photoIndex: e.detail.current+1
    })*/
    var _this = this;
    //onTouchEnd事件竟然晚于intervalChange，为了等待判断移动方向，必须等待)
    setTimeout(function () {
      _this.SetPhotoListLoopOnSwiperEvent(e.detail.current);
      _this.setData({ photo: _this.data.photoList[_this.data.photoIndex] })
      wx.setNavigationBarTitle({ title: _this.data.photo.name });
      if (_this.data.photoIndex + 3 >= _this.data.photoList.length) {
        _this.searchData()
      }
      _this.setPhotoView("intervalChange");
    }, 50);
  },
  gotoCommentPage: function (event) {
    let photoId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../comment/comment?photo_id=' + photoId,
    })
  },
  topagehome: function () {
    app.goHome();
  },
  goBack: function () {
    app.goBack();
  },
  searchData: function () {
    var that = this;
    if (that.data.totalRecord <= that.data.photoList.length && that.data.totalRecord > 0) {
      return;
    }
    var condition = that.data.lastSearchCondition
    var url=that.data.ajaxurl;
    var datakey=that.data.datakey;
    if (!condition)
      return
    condition.pageIndex += 1;
    app.ajax(url, condition, function (res) {
      console.log("searchData");
      console.log(res.data)
      
      var tempList = res.data[datakey];
      let photoList = that.data.photoList;
      for (var i = 0; i < tempList.length; i++) {
        photoList.push(tempList[i])
      }
      that.setData({ photoList: photoList })
    })
  },
  toggleslid: function () {
    this.setData({ slide: !this.data.slide })
  },
  showcomment: function () {
    this.setData({
      showModalcomment: true
    })
  },
  hidecomment: function () {
    this.setData({
      showModalcomment: false
    })
  },
  gotoFavoriteList: function (e) {
    var that = this;
    app.getUserInfo(function (userInfo) {
      app.globalData.pushData = e.currentTarget.dataset.photo;
      let photo = app.globalData.pushData;
      let photoId = app.globalData.pushData.photo_id;
      that.setData({
        photo: photo
      })
      that.showFavorteModel();
    })


  },
  favoritePhoto: function (e) {
    var that = this;

    var doSth = function () {
      if (e.currentTarget.dataset.photo) {
        //e.stopPropagation();
        var item = e.currentTarget.dataset.photo;
        var isCancel = item.status_info.is_favorited;
        app.ajax('puzzleV2/photoFavorite', { photoId: item.photo_id, isCancel: isCancel }, function (res) {

          //var msg = "收藏成功";
          if (isCancel) {
            //msg = "取消收藏成功";
            item.status_info.total_favorite -= 1;
            item.status_info.total_favorite = item.status_info.total_favorite < 0 ? 0 : item.status_info.total_favorite;
          } else {
            item.status_info.total_favorite += 1;
          }

          item.status_info.is_favorited = !item.status_info.is_favorited;
          for (var i = 0; i < that.data.photoList.length; i++) {
            var temp = that.data.photoList[i];
            if (temp.photo_id == item.photo_id) {
              temp.status_info.total_favorite = item.status_info.total_favorite;
              break;
            }
          }
          that.setData({
            photoList: that.data.photoList,
            photo: item
          })

          WxNotificationCenter.postNotificationName("update_photo_favorite", {id: item.photo_id, num: item.status_info.total_favorite});
        })
      }
    }

    app.getUserInfo(function (userInfo) {

      doSth();
    })

  },
  hideYindao: function (e) {
    var i = e.currentTarget.dataset.order;
    if (i == "1") i = '0';
    this.setData({
      yindao: i
    })
  },
  createFavorite: function () {
    app.globalData.pushData = this.data.photo;
    this.setData({
      popInputDialog: true
    })
    let photoId = this.data.photo.photo_id;

    this.setData({
      photo_id: photoId,
      option_upg: app.globalData.pushData || {}
    });

  },
  getData: function () {
    var that = this;
    app.ajax("puzzlev4/UserCollectList", { photoId: that.data.photo.photo_id }, function (response) {
      that.setData({
        isLoaded: true,
        user_groups: response.data.user_groups,
        user_photo_groups: response.data.user_photo_groups
      });

    }, function () {

    });
  },
  setPhotoCollect: function (e) {
    var that = this;
    var userGroupId = e.currentTarget.dataset.ugId;
    var userGroupName = e.currentTarget.dataset.ugName;
    var photoId = e.currentTarget.dataset.photoId;

    var currentPhotoId = that.data.photo.photo_id;

    if (photoId == currentPhotoId) {
      app.ajax("puzzlev4/delUserCollectPhoto", { userGroupId: userGroupId, photoId: photoId }, function (res) {
        if (!res.data.photo_id) {
          res.data.photo_id = 0;
          res.data.photo_num = 0;
          res.data.photo_url = "";
        }
        for (var i = 0; i < that.data.user_groups.length; i++) {
          if (that.data.user_groups[i].UserGroupID == userGroupId) {
            that.data.user_groups[i].photo_id = res.data.photo_id;
            that.data.user_groups[i].photo_num = res.data.photo_num;
            that.data.user_groups[i].photo_url = res.data.photo_url;
            break;
          }
        }
        that.setData({
          user_groups: that.data.user_groups
        })
        wx.showToast({
          title: '取消图片收藏成功',
          icon: 'success',
          duration: 800
        })
      })
    } else {
      app.ajax("puzzlev4/UserCollectSave", { upg: { UserGroupID: userGroupId, GroupName: userGroupName, photo_id: currentPhotoId } }, function (res) {
        that.hideFavorteModel();
        wx.showToast({
          title: '收藏成功',
          icon: 'success',
          duration: 800
        })

        var lst = that.data.user_groups;
        for (var i = 0; i < lst.length; i++) {
          if (lst[i].UserGroupID == res.data.UserGroupID) {
            lst[i].photo_url = res.data.photo_url;
            lst[i].photo_id = res.data.photo_id;
            lst[i].photo_num += 1;
            break;
          }
        }
        that.setData({
          user_groups: lst
        });
      })
    }

  },
  showFavorteModel: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    var that = this;
    that.animation = animation;
    animation.translateY(300).step()

    that.setData({ showFavorte: false, animationData: animation.export() });
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }.bind(that), 200);

    that.getData();
  },
  hideFavorteModel: function () {
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
        showFavorte: true
      })
    }.bind(this), 200)

  },
  createCard: function () {
    if(this.data.photo){
      let photoId = this.data.photo.photo_id;
      app.globalData.pushData = this.data.photo;
      wx.navigateTo({
        url: '../cards/cards?id=' + photoId
      })
    }
  },
  clearinput: function () {
    var that = this;
    that.data.option_upg.GroupName = "";
    that.setData({
      option_upg: that.data.option_upg
    })
  },
  bindKeyInput: function (e) {
    var that = this;
    this.setData({
      upg: {
        GroupName: e.detail.value,
        UserGroupID: that.data.upg.UserGroupID
      }
    });
  },
  saveAndBack: function (e) {
    var that = this;
    if (that.data.upg.GroupName == '' && that.data.option_upg.GroupName != '') {
      this.setData({
        upg: {
          GroupName: that.data.option_upg.GroupName,
        }
      });
    }
    if (that.data.upg.GroupName != '') {
      //如果传入upg对象，这判断名称是否修改，如未修改，则直接返回
      if (that.data.upg) {
        if (that.data.option_upg.GroupName == that.data.upg.GroupName) {
          //$rootScope.homeNavigator.popPage();
          that.setData({
            popInputDialog: false
          })
          return;
        }
      }
      that.data.option_upg.GroupName = that.data.upg.GroupName;
      app.ajax("puzzlev4/UserCollectSave", that.data.option_upg, function () {
        app.globalData.pushData = that.data.upg;
        wx.showToast({
          title: '此收藏保存成功',
          icon: 'success',
          duration: 800
        })
        that.setData({
          popInputDialog: false
        });
        that.getData();
      });
    }
  },
  delUserGroup: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '您确认要删除此收藏吗?',
      success: function (res) {
        if (res.confirm) {
          app.ajax("puzzlev4/delUserCollect", { userGroupId: that.data.option_upg.UserGroupID }, function () {
            wx.showToast({
              title: '此收藏删除成功',
              icon: 'success',
              duration: 800
            })
            wx.navigateBack({ delta: 2 });
          });
        }
      }
    })
  },
  closeDiaolog: function () {
    this.setData({
      popInputDialog: false
    })
  }
})