// pages/comment/comment.js
var app = getApp()
Page({
  data: {
    data_hot_list: [],
    data_new_list: [],
    content: "",
    replyUserId: 0,
    scrollH: 0,
    photo_id: 0,
    page_index: 0,
    total_record: 0,

    internaler: null,
    submit: false,
    content2: ""
  },
  onLoad: function (options) {
    this.setData({
      photo_id : options.photo_id
    })
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollH: res.windowHeight - 60,
        });
      }
    })
    this.loadDatalist();
  },
  loadDatalist: function (isFocus) {
    var that = this;
    if(!isFocus){
      if(that.data.total_record <= that.data.data_hot_list.length + that.data.data_new_list.length && that.data.total_record > 0){
        that.setData({ all_loaded: true })
        return;
      }
    }
    that.setData({ page_index: that.data.page_index + 1 })

    app.ajax("puzzlev2/evaluateList", {evaluateType: 1, pageIndex: that.data.page_index, photoId: that.data.photo_id}, function(res){
      console.log(res.data)
      that.setData({ total_record: res.data.total_record })
      if(res.data.evaluate_list.length > 0){
        var evaluate_list = [];
        if(that.data.page_index == 1)
          evaluate_list = res.data.evaluate_list
        else {
          for(var i = 0; i < res.data.evaluate_list.length; i++){
            evaluate_list.push(res.data.evaluate_list[i]);
          }
        }
        var hot_list = []
        var new_list = []
        for(var i = 0; i < evaluate_list.length; i++){
          if(evaluate_list[i].favorite_count >= 10)
            hot_list.push(evaluate_list[i])
          else
            new_list.push(evaluate_list[i])
        }
        
        that.setData({
          data_hot_list: hot_list,
          data_new_list: new_list
        })
      }
    })

  },
  textBlur: function(e){
    var that = this;
    var intervaler = this.data.intervaler
    if(!intervaler){
      intervaler = setInterval(function(){
        if(that.data.submit){
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
  textInput: function(e){
    this.setData({
      content : e.detail.value
    });
  },
  reply: function (e) {
    var cName = e.currentTarget.dataset.name
    var cUid = e.currentTarget.dataset.uid
    this.setData({
      content2: "回复" + cName + ":",
      replyUserId: cUid
    })
  },
  evaluate: function(e){
    var that = this;
    setTimeout(function(){
      var content = that.data.content;
      if (that.data.replyUserId > 0)
        that.setData({
          content: content.substring(content.indexOf(":") + 1)
        })
      if(!content){
        wx.showToast({ title: "请输入评价内容" })
        return
      }else if(content.length < 5 || content.length > 500){
        wx.showToast({ title: "内容为5-500个字" })
        return;
      }

      app.ajax('puzzlev2/setEvaluate', { content: content, evaluateType: 1, photoId: that.data.photo_id, replyUserId: 0 }, function(res){
        wx.showToast({ title: "评价成功" })
        that.setData({
          content: "",
          page_index: 0
        })
        that.loadDatalist(true)
        that.setData({
          submit: true
        })
      })
    }, 200)
    
  },
  favorte: function(e){
    var that = this
    var evaluateId = e.currentTarget.dataset.evaluateId;
    var status = e.currentTarget.dataset.status;
    app.ajax("puzzlev2/evaluateFavorite", { evaluateId: evaluateId, isCancel: status }, function(res){
      console.log(res.data)
        for(var i = 0; i < that.data.data_hot_list.length; i++){
          var temp = that.data.data_hot_list[i]
          if(temp.id == evaluateId){
            temp.is_favorited = !temp.is_favorited
            if(temp.is_favorited)
              temp.favorite_count += 1
            else
              temp.favorite_count -= 1
            break;
          }
        }
        for(var i = 0; i < that.data.data_new_list.length; i++){
          var temp = that.data.data_new_list[i]
          if(temp.id == evaluateId){
            temp.is_favorited = !temp.is_favorited
            if(temp.is_favorited)
              temp.favorite_count += 1
            else
              temp.favorite_count -= 1
            break;
          }
        }
        that.setData({
          data_hot_list: that.data.data_hot_list,
          data_new_list: that.data.data_new_list
        })
    })
  }

})