// pages/createFavorte/createFavorte.js
var app = getApp()
Page({
  data:{
    isLoaded: false,
    photo: {},
    user_groups: []
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    let photoId = options.id;
    let photo = app.globalData.pushData;
    this.setData({
        photo: photo
    })

  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    
    this.getData();
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  createFavorite: function () {
    app.globalData.pushData = this.data.photo;
    let photoId = this.data.photo.photo_id;
    wx.navigateTo({
      url: '../myFavoriteCreate/myFavoriteCreate?id=' + photoId
    })
  },
  getData: function(){
    var that = this;
    app.ajax("puzzlev4/UserCollectList", { photoId: that.data.photo.photo_id }, function(response){
      that.setData({
        isLoaded: true,
        user_groups: response.data.user_groups,
        user_photo_groups: response.data.user_photo_groups
      });

    }, function(){

    });
  },
  setPhotoCollect: function (e) {
    var that = this;
    var userGroupId = e.currentTarget.dataset.ugId;
    var userGroupName = e.currentTarget.dataset.ugName;
    var photoId = e.currentTarget.dataset.photoId;

    var currentPhotoId = that.data.photo.photo_id;

    if(photoId == currentPhotoId){
      app.ajax("puzzlev4/delUserCollectPhoto", { userGroupId: userGroupId, photoId: photoId }, function(res){
        if(!res.data.photo_id){
          res.data.photo_id = 0;
          res.data.photo_num = 0;
          res.data.photo_url = "";
        }
        for(var i = 0; i < that.data.user_groups.length; i++){
          if(that.data.user_groups[i].UserGroupID == userGroupId){
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
    }else {
      app.ajax("puzzlev4/UserCollectSave", { upg: { UserGroupID: userGroupId, GroupName: userGroupName, photo_id: currentPhotoId } }, function(res){
        wx.navigateBack();
        wx.showToast({
          title: '收藏成功',
          icon: 'success',
          duration: 800
        })

        var lst = that.data.user_groups;
        for(var i = 0; i< lst.length; i++){
          if(lst[i].UserGroupID == res.data.UserGroupID){
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

  }
})