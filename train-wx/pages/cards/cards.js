// pages/cards/cards.js
var app = getApp();
Page({
  data: {
    showcard: "",
    scaleHeight: "",
    scaleWidth: "",
    template:["http://www.tohappy.com.cn/web2/skin/images/xiaochenxu/template-1.png", "http://www.tohappy.com.cn/web2/skin/images/xiaochenxu/template-2.png"],
    emptycontent: true,
    showModalStatus: false,
    showeditTextarea: false,
    showModelTo: false,
    isMember: true,
    editType: "",
    headertext: "标题（至多可输入12字）",
    wordtext: "内容（至多可输入200字）",
    textvalue: "",
    select: "",
    sty1: "left",
    sty2: "left",
    sty: "",
    isSave: true,
    scrollH: 0,
    listitems: [
      { cover: 'http://image.tohappy.com.cn/Resources/2016/10/14/152208373_Game.jpg_240_thumb.jpg', name: '莫奈', imgnumber: 10 },
      { cover: 'http://image.tohappy.com.cn/Resources/2016/10/14/152223796_Game.jpg_240_thumb.jpg', name: '梵高', imgnumber: 10 },
      { cover: 'http://image.tohappy.com.cn/Resources/2016/10/14/152215771_Game.jpg_240_thumb.jpg', name: '田园风光', imgnumber: 10 },
      { cover: 'http://image.tohappy.com.cn/Resources/2016/10/14/152208373_Game.jpg_240_thumb.jpg', name: '莫奈', imgnumber: 10 },
      { cover: 'http://image.tohappy.com.cn/Resources/2016/10/14/152223796_Game.jpg_240_thumb.jpg', name: '梵高', imgnumber: 10 },
      { cover: 'http://image.tohappy.com.cn/Resources/2016/10/14/152215771_Game.jpg_240_thumb.jpg', name: '田园风光', imgnumber: 10 },
      { cover: 'http://image.tohappy.com.cn/Resources/2016/10/14/152208373_Game.jpg_240_thumb.jpg', name: '莫奈', imgnumber: 10 },
      { cover: 'http://image.tohappy.com.cn/Resources/2016/10/14/152223796_Game.jpg_240_thumb.jpg', name: '梵高', imgnumber: 10 },
      { cover: 'http://image.tohappy.com.cn/Resources/2016/10/14/152215771_Game.jpg_240_thumb.jpg', name: '田园风光', imgnumber: 10 },
      { cover: 'http://image.tohappy.com.cn/Resources/2016/10/14/152208373_Game.jpg_240_thumb.jpg', name: '莫奈', imgnumber: 10 },
      { cover: 'http://image.tohappy.com.cn/Resources/2016/10/14/152223796_Game.jpg_240_thumb.jpg', name: '梵高', imgnumber: 10 },
      { cover: 'http://image.tohappy.com.cn/Resources/2016/10/14/152215771_Game.jpg_240_thumb.jpg', name: '田园风光', imgnumber: 10 }
    ],
    showFavorte: true,
    user_groups: [],
    popInputDialog: false,
    upg: {
      GroupName: '',
      UserGroupID: 0
    },
    option_upg: {},
    photo_id: 0,
    photo: {}
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var res = wx.getSystemInfoSync();  //获取系统信息的同步方法，我用了异步里面提示我this.setData错了  
    var windowWidth = res.windowWidth;
    var windowHeight = res.windowHeight;
    //那就给前面的图片进行赋值，高，宽以及路劲   
    this.setData({
      scaleHeight: windowHeight-50,
      scaleWidth: windowWidth,
      photo_id: options.id,
      photo: app.globalData.pushData
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  choiceTemplate: function () {
    this.setData({
      showcard: "2"
    })
  },
  showTowho: function () {
    wx.navigateTo({
      url: '../towho/towho'
    })
  },
  showCreateTime: function () {
    wx.navigateTo({
      url: '../creatTime/creatTime'
    })
  },
  clearinput: function () {
    var that = this;
    that.setData({
      keyvalue: ""
    })
  },
  inputText: function (e) {
    this.setData({
      textvalue: e.detail.value
    })
  },
  saveEdit: function () {
    if (app.globalData.edit == 1) {
      this.setData({
        headertext: this.data.textvalue,
        sty1: this.data.sty,
        showeditTextarea: false
      })
    }
    else {
      this.setData({
        wordtext: this.data.textvalue,
        sty2: this.data.sty,
        showeditTextarea: false
      })
    }

  },
  showedit: function (e) {
    app.globalData.edit = e.currentTarget.dataset.edittype;
    var arry = ["left", "center", "right", "justify"];
    if (app.globalData.edit == 1) {
      var str1 = this.data.headertext;
      var s = this.data.sty1;
      for (var i = 0; i < arry.length; i++) {
        if (arry[i] == s) break;
      }
    } else {
      var str1 = this.data.wordtext;
      var s = this.data.sty2;
      for (var i = 0; i < arry.length; i++) {
        if (arry[i] == s) break;
      }
    }
    this.setData({
      showeditTextarea: true,
      showModalStatus: false,
      editType: e.currentTarget.dataset.edittype,
      textvalue: str1,
      select: i + 1,
      sty: s
    })
  },
  hideedit: function () {
    this.setData({
      showeditTextarea: false
    })
  },
  gotoFavoriteList: function (e) {
    var that = this;
    app.getUserInfo(function (userInfo) {
     // app.globalData.pushData = e.currentTarget.dataset.photo;
    // let photo = app.globalData.pushData;
    //  let photoId = app.globalData.pushData.photo_id;
    //  that.setData({
   //     photo: photo
   //   })
      that.showFavorteModel();
    })
  },
  showModal: function (e) {
    var that = this

    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    that.animation = animation
    animation.translateY(300).step()
    that.setData({
      animationData: animation.export(),
      showModalStatus: true
    })

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
    }.bind(this), 200)
  },
  setfontstyle: function (e) {
    var st = "";

    switch (e.currentTarget.dataset.type) {
      case "1":
        st = "left";
        break;
      case "2":
        st = "center";
        break;
      case "3":
        st = "right";
        break;
      case "4":
        st = "justify";
        break;
    }

    this.setData({
      select: e.currentTarget.dataset.type,
      sty: st
    })

  },
  poptoPay: function () {
    if (!this.data.isMember) {
      wx.showModal({
        title: '编辑提示',
        content: 'Hello，您是不是想要修改水印？马上加入我们的会员吧！',
        confirmText: "开通会员",
        confirmColor: "#ea5b5a",
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../topay/topay'
            })
          }
        }
      })
    }
    else {
      wx.navigateTo({
        url: '../creatLogo/creatLogo'
      })
    }

  },
  poptoBy: function () {
    wx.navigateTo({
      url: '../By/By'
    })
  },
  save: function () {
    this.setData({
      isshowSave: true
    })
  },
  savesuccess: function () {
    this.setData({
      isshowSave: false
    })
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000
    })
  },
  creatcatgory: function () {
    wx.navigateTo({
      url: '../creatcatgory/creatcatgory'
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
    wx.navigateTo({
      url: '../cards/cards'
    })
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
  },
   goBack: function () {
    app.goBack();
  },
})

