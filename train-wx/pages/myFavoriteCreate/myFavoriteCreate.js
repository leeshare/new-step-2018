// pages/creatcatgory/creatcatgory.js
var app = getApp()
Page({
  data: {
    photo_id: 0,
    upg: {
      GroupName: '',
      UserGroupID: 0
    },
    scrollH: 0,
    option_upg: {}
  },
  onLoad: function (options) {
    let photoId = options.id;
    //app.globalData.pushData = this.data.photo;
    this.setData({
      photo_id: photoId,
      option_upg: app.globalData.pushData || {}
    });
    if (!photoId) {
      wx.setNavigationBarTitle({ title: '编辑图册' });
    }
    else {
      wx.setNavigationBarTitle({ title: '创建新图册' });
    }
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollH: res.windowHeight
        })
      }
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
          wx.navigateBack();
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
        wx.navigateBack();
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
  }

})