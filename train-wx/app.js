//app.js
App({
  isDevelop: true,
  productUrl: 'https://www.tohappy.com.cn/API-2.0/',
  developUrl: 'http://localhost:8084/api/',
  apiUrl: function () {
    return this.isDevelop ? this.developUrl : this.productUrl
  },
  onLaunch: function () {
    
  },
  goHome: function () {
    let currentPages = getCurrentPages();
    let url = "pages/index";
    if (currentPages[0].__route__ == url) {
      wx.navigateBack({
        delta: 12
      });
    }
    else {
      wx.redirectTo({ url: url });
    }
  },
  goBack: function () {
    wx.navigateBack();
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function (response) {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              that.globalData.token = res.signature
              that.getTokenFromServer(response.code, res.encryptedData, res.iv, res.signature, cb);
            }
          })
        }
      })
    }
  },
  globalData: {
    userInfo: null,
    token: '',
    pushData: {}
  },
  getTokenFromServer: function (code, encryptedData, iv, signature, cb) {
    var that = this;
    if (code) {
      wx.request({
        url: that.apiUrl() + 'login/wechat',
        //url: 'http://localhost:8084/api/course/list',
        data: {
          code: code,
          encryptedData: encryptedData,
          iv: iv,
          signature: signature
        },
        method: 'POST',
        success: function (res) {
          console.log(res.data)
          if (res.data.state == 1) {
            var token = res.data.data.ticket;
            //that.loginToServer(token, cb);
            that.setStorageValueSync(0, res.data.data)
            typeof cb == "function" && cb(that.globalData.userInfo)
          }
          
        },
        fail: function (res) {
          console.log(res);
        }
      })
    }
  },
  loginToServer: function (token, cb) {
    var that = this;
    wx.request({
      url: that.apiUrl() + 'user/getCurrentUserInfo?token=' + token,
      method: 'POST',
      success: function (res) {
        console.log(res.data)
        that.setStorageValueSync(0, res.data.data)
        typeof cb == "function" && cb(that.globalData.userInfo)
      }
    })
  },
  //显示加载中对话框
  showLoading: function (title) {
    wx.showToast({ title: title || '加载中', icon: 'loading', mask: true, duration: 10000 });
  },
  //关闭加载中对话框
  hideLoading: function (itle) {
    wx.hideToast();
  },
  //API接口数据
  ajax: function (url, data, _success, _fail) {
    var that = this;
    var toPost = function (token) {
      var url2 = that.apiUrl() + url + '?token=' + token;
      wx.request({
        url: url2,
        data: data,
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          console.log(res.data);
          if (res.data.result) {
            typeof _success == "function" && _success(res.data);
          }
          else if (res.data.result === false) {
            typeof _fail == "function" && _fail(res.data);
          }
          else {
            let data = { result: false, message: res.data }
            typeof _fail == "function" && _fail(data);
          }
        },
        fail: function (res) {
          console.log(res);
          let data = { result: false, message: res }
          typeof _fail == "function" && _fail(data);
        }
      })
    }
    wx.getStorage({
      key: 'UserContextInfo',
      success: function (res0) {
        toPost(res0.data.token);
      },
      fail: function (resError) {
        toPost();
      }
    });
  },
  //0 用户登录后的信息，1 是否看过下载协议，2 搜索历史, 3 首页显示朦层，提示加到桌面
  keyList: ["UserContextInfo", "downloadAgreement", "searchHistory", "indexTip", "yindao1", "yindao2"],
  getStorageValueSync: function (index) {
    let key = this.keyList[index]
    var result = wx.getStorageSync(key)
    console.log("wx.getStorageSync(" + key + ")=" + result)
    return result
  },
  setStorageValueSync: function (index, value) {
    let key = this.keyList[index]
    wx.setStorageSync(key, value)
    console.log("wx.setStorageValueSync(" + key + ")=" + value)
  },
  removeStorageValueSync: function (index, value) {
    let key = this.keyList[index]
    try {
      wx.removeStorageSync(key)
    } catch (e) {
      // Do something when catch error
    }
  }

  /*
  getOpenId: function(res){
    wx.request({
      url: api.loginUrl,
      data: {
        code: loginRes.code,//临时登录凭证
        rawData: infoRes.rawData,//用户非敏感信息
        signature: infoRes.signature,//签名
        encrypteData: infoRes.encryptedData,//用户敏感信息
        iv: infoRes.iv//解密算法的向量
      },
      success: function (res) {
        console.log('login success');
        res = res.data;
        if (res.result == 0) {
          that.globalData.userInfo = res.userInfo;
          wx.setStorageSync('userInfo', JSON.stringify(res.userInfo));
          wx.setStorageSync('loginFlag', res.skey);
          console.log("skey=" + res.skey);
          callback();
        } else {
          that.showInfo('res.errmsg');
        }
      },
      fail: function (error) {
        //调用服务端登录接口失败
        // that.showInfo('调用接口失败');
        console.log(error);
      }
    });
  }*/

})