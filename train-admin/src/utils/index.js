//多语言
import YSI18n from './YSI18n';
import moment from 'moment';
import { message } from 'antd'
//对外提供多语言环境
export { YSI18n };

export function isPromise(value) {
  if (value !== null && typeof value === 'object') {
    return value.promise && typeof value.promise.then === 'function';
  }
}

export function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

export function getDictionaryTitle(dic, value, defaultTitle) {
  dic = dic || [];
  var findItem = dic.find((item) => { return item.value == value; });
  if (findItem != null) {
    return findItem.title;
  }
  if (defaultTitle) return defaultTitle;
  else return value;
}
export function getDictionaryTitleByCode(dic, value, defaultTitle) {
  dic = dic || [];
  var findItem = dic.find((item) => { return item.code.toString() == value.toString(); });
  if (findItem != null) {
    return findItem.title;
  }
  if (defaultTitle) return defaultTitle;
  else return value;
}
//获取编辑模式描述
export function getViewEditModeTitle(editMode, defaultValue) {
  let opTitle = '';
  switch (editMode.toLowerCase()) {
    case "create":
      opTitle = '添加';
      break;
    case "edit":
      opTitle = '修改';
      break;
    case "view":
      opTitle = '查看';
      break;
    case "delete":
      opTitle = '删除';
      break;
    case "audit":
      opTitle = '审核';
      break;
  }
  //多语言
  opTitle = YSI18n.get(editMode);
  if (opTitle == '' && defaultValue) {
    return defaultValue
  }
  else {
    return opTitle;
  }
}

//文本...显示
export function ellipsisText(source, maxLength, ellipsis) {
  source = source || "";
  maxLength = maxLength || 20;
  ellipsis = ellipsis || "...";
  if (source.length > maxLength) {
    let cutString = source.slice(0, maxLength)
    return `${cutString}...`;
  }
  else {
    return source;
  }
}

//文本内容转HTML格式显示
export function convertTextToHtml(source) {
  source = source || "";
  return source.replace(/\r/g, "<br/>").replace(/\n/g, "<br/>");
}
//获取周几名称
export function getWeekTitle(week) {
  var weeks = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return weeks[week];
}
//获取当前时间戳
export function getCurrentTimeStamp() {
  let timestamp = (new Date()).valueOf();
  timestamp = timestamp / 1000;
  return timestamp;
}
//获取格林威治时间
export function convertToGTMDate(date) {
  var timeZone = new Date().getTimezoneOffset();
  if (typeof (date) === "string") {
    date = new Date(date);
  }
  return date.Minutes(date.getMinutes() + timeZone);
}
//JSON内时间对象转换为JS 内的Date
export function convertJSONDateToJSDateObject(JSONDateString) {
  var date = new Date(parseInt(JSONDateString.replace("/Date(", "").replace(")/", ""), 10));
  return date;
}
//日期直接相差天数
export function dateDiffOfDay(date1, date2) {
  //把相差的毫秒数转换为天数
  let iDays = parseInt(Math.abs(date1 - date2) / 1000 / 60 / 60 / 24)
  return iDays
}
// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
export function dateFormat(dateTime, fmt) { //author: meizz
  var o = {
    "M+": dateTime.getMonth() + 1, //月份
    "d+": dateTime.getDate(), //日
    "h+": dateTime.getHours(), //小时
    "m+": dateTime.getMinutes(), //分
    "s+": dateTime.getSeconds(), //秒
    "q+": Math.floor((dateTime.getMonth() + 3) / 3), //季度
    "S": dateTime.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (dateTime.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}
//数组去重
export function distinctOfArray(sourceArray) {
  if (!sourceArray || sourceArray.length < 1) {
    return sourceArray;
  }
  var resultArray = [];
  sourceArray.map((item, index) => {
    if (item != '') {
      resultArray = [...resultArray.filter(A => A != item), item];
    }
  })
  return resultArray;
}
//数组乱选
export function randomOfArray(sourceArray) {
  var sWordsTemp = [];
  for (var k = 0; k < sourceArray.length; k++) {
    sWordsTemp.push(sourceArray[k]);
  }
  var sWords = [];
  while (sWordsTemp.length > 0) {
    var tempNum = parseInt(Math.random() * 10);
    if (sWordsTemp.length == 1)
      tempNum = 0;
    if (tempNum < sWordsTemp.length) {
      sWords.push(sWordsTemp[tempNum]);
      sWordsTemp.splice(tempNum, 1);
    }
  }
  return sWords;
}
//绑定值到组件
export function dataBind(value, isDate) {
  if (isDate) {
    return moment(value != '' ? value : undefined)
  }
  else {
    if (value == undefined) {
      return '';
    }
    else {
      return value.toString();
    }
  }
}

export function covertValueToDecimalType(value) {
  if (!value) return "";
  return value + (value.toString().indexOf('.') != -1 ? '' : '.00');
}

export function getTeachLocalDate(teachRecordInfo) {
  if (teachRecordInfo.teach_way == 2) {
    var timeZone = new Date().getTimezoneOffset();//当前时区
    var sbegin = teachRecordInfo.teach_begin_time_GTM;
    var begin = new Date(Date.parse(sbegin.replace(/-/g, "/")));
    var MinBegin = new Date(Date.parse(sbegin.replace(/-/g, "/")));
    var MaxEnd = new Date(Date.parse(sbegin.replace(/-/g, "/")));
    begin.setMinutes(begin.getMinutes() + -1 * timeZone);
    MinBegin.setMinutes(MinBegin.getMinutes() + -1 * timeZone);
    MaxEnd.setMinutes(MaxEnd.getMinutes() + -1 * timeZone + Math.round(teachRecordInfo.periods < 1 ? teachRecordInfo.periods * 100 : teachRecordInfo.periods * 60));
    return { plan_begin_time: MinBegin, plan_end_time: MaxEnd, teach_way: 2 };
  }
  else {
    var plan_begin_time = convertJSONDateToJSDateObject(teachRecordInfo.plan_begin_time);
    var plan_end_time = convertJSONDateToJSDateObject(teachRecordInfo.plan_end_time);
    return { plan_begin_time: plan_begin_time, plan_end_time: plan_end_time, teach_way: 1 };
  }
}

export function isValidClassRoom(teachRecordInfo) {
  var timeZone = new Date().getTimezoneOffset();//当前时区
  var sbegin = teachRecordInfo.teach_begin_time_GTM;
  //可进入的时间范围 //提前3分钟~推后3分钟
  var begin = new Date(Date.parse(sbegin.replace(/-/g, "/")));
  var MinBegin = new Date(Date.parse(sbegin.replace(/-/g, "/")));
  var MaxEnd = new Date(Date.parse(sbegin.replace(/-/g, "/")));
  begin.setMinutes(begin.getMinutes() + -1 * timeZone);
  MinBegin.setMinutes(MinBegin.getMinutes() + -1 * timeZone - 3);
  MaxEnd.setMinutes(MaxEnd.getMinutes() + -1 * timeZone + Math.round(teachRecordInfo.periods < 1 ? teachRecordInfo.periods * 100 : teachRecordInfo.periods * 60) + 3);
  var now = new Date();
  var timeInfo = { btnText: '', time_limit: '' }
  if (now < MaxEnd) {
    var num_reduce = 0;
    var btnText = "";
    if (begin <= now && now < MaxEnd) {
      num_reduce = MaxEnd.getTime() - now.getTime();
      btnText = "结束";
    }
    else {
      num_reduce = begin.getTime() - now.getTime();
      btnText = "开始"
    }

    var leave1 = num_reduce//%(24*3600*1000)    //计算天数后剩余的毫秒数
    var hours = Math.floor(leave1 / (3600 * 1000))
    var leave2 = num_reduce % (3600 * 1000)        //计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / (60 * 1000))
    var leave3 = leave2 % (60 * 1000)      //计算分钟数后剩余的毫秒数
    var seconds = Math.round(leave3 / 1000)

    timeInfo = {
      btnText: btnText,
      time_limit:
      (hours < 10 ? "0" + hours : hours) + ":" +
      (minutes < 10 ? "0" + minutes : minutes) + ":" +
      (seconds < 10 ? "0" + seconds : seconds)
    };

  }

  if (now >= MinBegin && now < MaxEnd) {
    return { canJoinIn: true, btnEnable: true, message: `${timeInfo.time_limit}${timeInfo.btnText}`, begin, MinBegin, MaxEnd }
  }
  else if (now < MinBegin) {

    return { canJoinIn: false, btnEnable: true, message: `${timeInfo.time_limit}${timeInfo.btnText}`, begin, MinBegin, MaxEnd }
  }
  else {
    return { canJoinIn: false, btnEnable: false, message: '课程已经结束了', begin, MinBegin, MaxEnd }
  }
}
export function joinClassRoom(teachRecordInfo) {
  let { teach_classRoomUrl, teach_way, teach_begin_time_GTM } = teachRecordInfo;
  var validInfo = isValidClassRoom(teachRecordInfo);
  if (!validInfo.canJoinIn) {
    message.warn(validInfo.message);
  }
  else {
    window.open(teach_classRoomUrl)
  }
}

// 时间转换成几分钟前，几小时前，几天前
export function formatMsgTime(comparedateTime) {
  var dateTime = new Date(comparedateTime.replace(/-/g, '/'));

  var year = dateTime.getFullYear();
  var month = dateTime.getMonth() + 1;
  var day = dateTime.getDate();
  var hour = dateTime.getHours();
  var minute = dateTime.getMinutes();
  var second = dateTime.getSeconds();
  var now = new Date();
  var now_new = now.valueOf();  //typescript转换写法

  var milliseconds = 0;
  var timeSpanStr;

  milliseconds = now_new - dateTime.valueOf();

  if (milliseconds <= 1000 * 60 * 1) {
    timeSpanStr = YSI18n.get('just');
  }
  else if (1000 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60) {
    timeSpanStr = Math.round((milliseconds / (1000 * 60))) + YSI18n.get('minutesago');
  }
  else if (1000 * 60 * 60 * 1 < milliseconds && milliseconds < 1000 * 60 * 60 * 24) {
    timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60)) + YSI18n.get('hoursago');
  }
  else if (1000 * 60 * 60 * 24 <= milliseconds && milliseconds <= 1000 * 60 * 60 * 24 * 2) {
    timeSpanStr = YSI18n.get('yesterday');
  }
  else if (1000 * 60 * 60 * 24 * 2 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24 * 3) {
    timeSpanStr = YSI18n.get('beforeyesterday');
  }
  // else if (1000 * 60 * 60 * 24 * 3 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24 * 4) {
  //   timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60 * 24)) + YSI18n.get('daysago');
  // }
  else if (milliseconds > 1000 * 60 * 60 * 24 * 3 && year == now.getFullYear()) {
    timeSpanStr = month + '-' + day;// + ' ' + hour + ':' + minute;
  } else {
    timeSpanStr = year + '-' + month + '-' + day;//+ ' ' + hour + ':' + minute;
  }

  return timeSpanStr;
};

export function timestampToTime(timestamp){
  var d = new Date(timestamp); //根据时间戳生成的时间对象
  var m = d.getMonth() + 1;
  var dd = d.getDate();
  var date = (d.getFullYear()) + "-" +
    (m < 10 ? ('0' + m) : m) + "-" +
    (dd < 10 ? ('0' + dd) : dd) + " " +
    (d.getHours()) + ":" +
    (d.getMinutes()) + ":" +
    (d.getSeconds());
  return date;
}
