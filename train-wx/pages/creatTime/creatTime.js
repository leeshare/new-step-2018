// pages/creatTime/creatTime.js
const date = new Date()
const years = []
const months = []
const days = []

for (let i = 1990; i <= date.getFullYear() + 10; i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  months.push(i)
}

for (let i = 1; i <= 31; i++) {
  days.push(i)
}

Page({
  data: {
    years: years,
    year: date.getFullYear(),
    months: months,
    month: 2,
    days: days,
    day: 2,
    value: [1, 1, 1],
  },
  bindChange: function (e) {
    const val = e.detail.value
    this.setData({
      year: this.data.years[val[0]],
      month: this.data.months[val[1]],
      day: this.data.days[val[2]]
    })
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var year_ = date.getFullYear();
    var month_ = date.getMonth() + 1;
    var day_ = date.getDate();
   
    var i = ('|' + this.data.years.join('|') + '|').indexOf('|' + year_ + '|');
    var k = ('|' + this.data.months.join('|') + '|').indexOf('|' + month_ + '|');
    var l = ('|' + this.data.days.join('|') + '|').indexOf('|' + day_ + '|');
  
    this.setData({
      value: [i/5, k/2, l/2]
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
  }
})