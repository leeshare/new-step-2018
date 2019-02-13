import { serverURL, getToken, getLocale } from './env';
var axios = require('axios');
var MockAdapter = require('axios-mock-adapter');
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
var normalAxios = axios.create({
  //baseURL:'http://mobile-sm.schoolearn.com/API-1.0',
  baseURL: serverURL,

});

var axios0 = axios;
import { menus } from './mock/menu';

var mockAxios = axios.create();
var axios = normalAxios;

//添加一个请求拦截器
axios.interceptors.request.use(function (config) {
  //在请求发送之前做一些事
  var token = getToken(); //window.localStorage.getItem('token') || '';
  var locale = getLocale();//语言环境
  //config.headers.common.token = token;
  config.headers.common.ticket = token;
  config.headers.common.locale = locale;
  config.data = config.data || {}
  return config;
}, function (error) {
  //当出现请求错误是做一些事
  return Promise.reject(error);
});

//添加一个返回拦截器
axios.interceptors.response.use(function (response) {
  //api 调用出错的标志result=false;
  //if (!response.data.result)
  if (response.data.state == 0){
    //对返回的错误进行一些处理
    return Promise.reject({ message: response.data.msg, result: false });
  }
  if(response.data.error){
    return Promise.reject({ message: response.data.error, result: false });
  }
  if(!response.data){
    //对返回的错误进行一些处理
    return Promise.reject({ message: '请重新登录', result: false });
  }
  //升级为业务对象
  response.data = response.data.data || {};//兼容成功时没有数据情况
  response.data.result = true;
  //response.data = response.data || {};//兼容成功时没有数据情况
  return response;
}, function (error) {
  if (error.response && error.response.status == 401) {//因安全问题被拒绝
    //对返回的错误进行一些处理
    window.location.href = "#/login";
    //return Promise.reject(error);
  }
  else {
    //对返回的错误进行一些处理
    return Promise.reject({ message: "网络故障，请检查网络!", result: false });
  }
});

// mock 数据
var mock = new MockAdapter(mockAxios);
//登录处理 train
mock.onPut('/login').reply(config => {
  return new Promise(function (resolve, reject) {
    //normalAxios.post('/user/AdminLogin', config.data)
    normalAxios.post('/login', config.data)
    .then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//从本地获取菜单  train
mock.onGet('/menu').reply(config => {
  return new Promise(function (resolve, reject) {
    resolve([200, menus]);

    /*normalAxios.post('/user/GetUserMenus')
    .then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });*/
  });
});
//退出处理
mock.onGet('/logout').reply(200, {});

//机构管理
mock.onPut('/train_org_list').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/org/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//机构save
mock.onPut('/train_org_save').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/org/save', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//机构del
mock.onPut('/train_org_del').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/org/del', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//用户管理
mock.onPut('/train_user_list').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/user/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//用户save
mock.onPut('/train_user_save').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/user/save', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//user del
mock.onPut('/train_user_del').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/user/del', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//course管理
mock.onPut('/train_course_list').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/course/list', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//course save
mock.onPut('/train_course_save').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/course/save', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//course del
mock.onPut('/train_course_del').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/course/del', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//二维码登录URL地址获取
mock.onPut('/GetAdminLoginQRCode').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/user/GetAdminLoginQRCode', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//二维码登录周期检测
mock.onPut('/TestAdminLoginQRCode').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/user/TestAdminLoginQRCode', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//字典管理
mock.onPut('/ClientLoadDictionarys').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Dictionary/ClientLoadDictionarys', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetDictionaryList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Dictionary/GetDictionaryList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveDictionaryInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Dictionary/SaveDictionaryInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//角色管理

mock.onPut('/RoleList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Role/GetRoleList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/RoleFunList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Role/GetRoleFunList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveRoleInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Role/SaveRoleInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteRoleInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Role/DeleteRoleInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//消息推送
mock.onPut('/AdminSendAppNotify').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/AdminSendAppNotify', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/AdminSendEmailNotify').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/AdminSendEmailNotify', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//后台权限管理
mock.onPut('/SmartInputSearchUserList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SmartInputSearchUserList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SmartInputSearchTeacherUserList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SmartInputSearchTeacherUserList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SmartInputSearchStudentUserList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SmartInputSearchStudentUserList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//学生管理
mock.onPut('/GetOrganizationStudentList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetOrganizationStudentList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveOrganizationStudentInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveOrganizationStudentInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//教师管理
mock.onPut('/GetOrganizationTeacherList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetOrganizationTeacherList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveOrganizationTeacherInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveOrganizationTeacherInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveOrganizationTeacherAuthInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveOrganizationTeacherAuthInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//后台操作用户管理
mock.onPut('/GetOrganizationUserList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetOrganizationUserList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetUserInfoByMobile').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetUserInfoByMobile', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetUserInfoByEmail').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetUserInfoByEmail', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetUserInfoByUserName').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetUserInfoByUserName', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveOrganizationUserInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveOrganizationUserInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchOrganizationUserInfoStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchOrganizationUserInfoStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteOrganizationUserInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteOrganizationUserInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/ResetUserPassword').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/ResetUserPassword', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/ChangePassword').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/User/changePwd', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/ChangUserInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/ChangUserInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//TM部分
mock.onPut('/LoadPdfDocuments').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/LoadPdfDocuments', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/CourseList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetCourseList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/searchCourseWare').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetCourseWareList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/CourseUnitList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetCourseUnitList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteCourseInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteCourseInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveCourseInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/PostCourseInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/BatchBuildCoursePackages').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/BatchBuildCoursePackages', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/AuditCourseInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/AuditCourseInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveCourseDesign').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveCourseDesign', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//字听写库操作
mock.onPut('/SearchCharaterWritingLibrary').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetCharaterWritingLibraryList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveCharacterWritingInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveCharacterWritingInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/AuditCharacterWritingInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/AuditCharacterWritingInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteCharacterWritingInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteCharacterWritingInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchCharacterWritingInfoStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchCharacterWritingInfoStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//字、词句库操作
mock.onPut('/SeachBaseLibrary').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetBaseLibraryList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveCharacterInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveCharacterInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/AuditCharacterInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/AuditCharacterInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteCharacterInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteCharacterInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchCharacterInfoStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchCharacterInfoStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveSentenceInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveSentenceInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/AuditSentenceInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/AuditSentenceInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteSentenceInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteSentenceInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchSentenceInfoStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchSentenceInfoStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/AuditCourseWareInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/AuditCourseWareInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteCourseWareInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteCourseWareInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchCourseWareInfoStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchCourseWareInfoStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/SaveCourseWare_ChantInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveCourseWare_ChantInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/SaveCourseWare_DialogInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveCourseWare_DialogInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveCourseWare_PatternInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveCourseWare_PatternInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveCourseWare_WritingInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveCourseWare_WritingInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveCourseWare_ReaderInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveCourseWare_ReaderInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveCourseWare_TalkInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveCourseWare_TalkInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveCourseWare_LectureInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveCourseWare_LectureInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//课程主题操作
mock.onPut('/GetTopicList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTopicList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveCourseTopicInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveCourseTopicInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/AuditCourseTopicInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/AuditCourseTopicInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteCourseTopicInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteCourseTopicInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchCourseTopicInfoStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchCourseTopicInfoStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetCourseTopicDetails').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetCourseTopicDetails', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/AddSelectedCourseToTopic').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/AddSelectedCourseToTopic', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/DeleteSelectedCourseToTopic').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteSelectedCourseToTopic', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//--------------教学安排-----------------
mock.onPut('/GetTeachPlanList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeachPlanList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveTeachPlanInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveTeachPlanInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/AuditTeachPlanInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/AuditTeachPlanInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteTeachPlanInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteTeachPlanInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchTeachPlanInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchTeachPlanInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetTeachPlanDetails').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeachPlanDetails', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/BatchAddTeachPlanDetail').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/BatchAddTeachPlanDetail', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveTeachPlanDetailInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveTeachPlanDetailInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


mock.onPut('/DeleteTeachPlanDetail').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteTeachPlanDetail', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/GetTMResourceList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTMResourceList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/SaveTMResourceInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveTMResourceInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/GetStatSumInfoForSchoolearnAdmin').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetStatSumInfoForSchoolearnAdmin', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetStatSumInfoForBranchAdmin').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetStatSumInfoForBranchAdmin', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/PostCameraVideoRemark').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/PostCameraVideoRemark', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//教学模块-Teach
mock.onPut('/GetAllTeacherSchedules').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/GetAllTeacherSchedules', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetTeacherTeachRecords').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/GetTeacherTeachRecords', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetMyStudentList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/GetMyStudentList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetTeacherTeachOverview').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/GetTeacherTeachOverview', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/UpdateScheduleInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/UpdateScheduleInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteCategoryResource').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/DeleteCategoryResource', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/EditResourceName').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/EditResourceName', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetTeachCategoryResList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/GetTeachCategoryResList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetPublicCategoryResList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/GetPublicCategoryResList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveChoosedTeachResources').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/SaveChoosedTeachResources', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/RemoveTeachRecordDetail').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/RemoveTeachRecordDetail', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/PostTeacherEval').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/PostTeacherEval', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/PostTeacherEvalAttachmentShare').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/PostTeacherEvalAttachmentShare', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/batchAddTeachTask').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/batchAddTeachTask', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/deleteTeachTask').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/deleteTeachTask', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/saveTeachTask').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/SaveTeachTask', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//直播相关
mock.onPut('/GetLiveList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetLiveList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveLiveInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveLiveInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/AuditLiveInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/AuditLiveInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchLiveInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchLiveInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteLiveInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteLiveInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//直播提问相关
mock.onPut('/GetLiveQuestionList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetLiveQuestionList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveLiveQuestionInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveLiveQuestionInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchLiveQuestionInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchLiveQuestionInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteLiveQuestionInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteLiveQuestionInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//授课教室管理
mock.onPut('/GetTeachClassRoomList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeachClassRoomList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveTeachClassRoomInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveTeachClassRoomInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteTeachClassRoomInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteTeachClassRoomInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetTeachClassRoomSchedules').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeachClassRoomSchedules', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//授课班
mock.onPut('/GetTeachClassList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeachClassList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveTeachClassInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveTeachClassInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchTeachClassInfoStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchTeachClassInfoStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteTeachClassInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteTeachClassInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetTeachClassSchedules').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeachClassSchedules', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//授课班级成员
mock.onPut('/GetTeachClassMemberList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeachClassMemberList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveTeachClassMemberInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveTeachClassMemberInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteTeachClassMemberInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteTeachClassMemberInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//授课安排
mock.onPut('/GetTeachClassScheduleList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeachClassScheduleList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveTeachClassScheduleInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveTeachClassScheduleInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/BatchSaveTeachClassScheduleInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/BatchSaveTeachClassScheduleInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteTeachClassScheduleInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteTeachClassScheduleInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetTeacherClassSchedules').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeacherClassSchedules', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetCameraVideoRemarkList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetCameraVideoRemarkList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//订单费用相关
mock.onPut('/GetFeeOrderList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetFeeOrderList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/TestNewOrderExist').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/TestNewOrderExist', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveFeeOrderInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveFeeOrderInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/CancelOrderInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/CancelOrderInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetFeeRefundOrderInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetFeeRefundOrderInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveFeeRefundOrderInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveFeeRefundOrderInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//查询统计
mock.onPut('/GetReportOfFeeOfMonth').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetReportOfFeeOfMonth', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetReportOfStudentSignup').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetReportOfStudentSignup', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetReportOfStudentSignupHistory').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetReportOfStudentSignupHistory', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetReportOfK12LearningStudents').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetReportOfK12LearningStudents', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//机构管理
mock.onPut('/GetOrganizationList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetOrganizationList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveOrganizationInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveOrganizationInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchOrganizationInfoStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchOrganizationInfoStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/TransformToPinyin').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/TransformToPinyin', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//vcg
mock.onPut('/GetVCGAPILibrary').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetVCGAPILibrary', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetLocalLibrary').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetLocalLibrary', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/VCG_Detail').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/VCG_Detail', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/VCG_Download').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/VCG_Download', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/VCG_SaveCutImageInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/VCG_SaveCutImageInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//订单发票相关
mock.onPut('/GetFeeInvoiceList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetFeeInvoiceList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveFeeInvoiceInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveFeeInvoiceInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/CancelInvoiceInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/CancelInvoiceInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//app背景图相关
mock.onPut('/GetAppImagePackageList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetAppImagePackageList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveAppImagePackageInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveAppImagePackageInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchAppImagePackageInfoStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchAppImagePackageInfoStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/AuditAppImagePackageInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/AuditAppImagePackageInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteAppImagePackageInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteAppImagePackageInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//app用户反馈相关
mock.onPut('/GetAppFeedbackList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetAppFeedbackList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveAppFeedbackInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveAppFeedbackInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//学生排课表
mock.onPut('/GetStudentTeachRecords').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/GetStudentTeachRecords', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//===============================报名管理==================================
//学生报名记录
mock.onPut('/GetTeachSignupRecordList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeachSignupRecordList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//学生报名信息录入
mock.onPut('/SaveTeachSignupRecord').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveTeachSignupRecord', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//学生报名信息过程跟踪
mock.onPut('/SwitchTeachSignupStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchTeachSignupStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//===============================试听管理==================================
//学生试听记录
mock.onPut('/GetTeachExperienceRecordList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeachExperienceRecordList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//学生试听信息录入
mock.onPut('/SaveTeachExperienceRecord').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveTeachExperienceRecord', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//学生试听信息过程跟踪
mock.onPut('/SwitchTeachExperienceStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchTeachExperienceStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/StudentExperienceToTeachClass').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/StudentExperienceToTeachClass', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//===============================在线定价管理==================================
mock.onPut('/GetTeachSignupPriceList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeachSignupPriceList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SaveSignupPriceInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveSignupPriceInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchSignupPriceInfoStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchSignupPriceInfoStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//===============================报名批次管理==================================
mock.onPut('/GetTeachSignupBatchList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeachSignupBatchList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/SaveSignupBatchInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveSignupBatchInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchSignupBatchInfoStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchSignupBatchInfoStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//===============================教师排课管理==================================
mock.onPut('/GetIdleTeacherList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetIdleTeacherList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/GetTeachTeacherScheduleList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeachTeacherScheduleList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/SaveTeacherScheduleInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveTeacherScheduleInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/DeleteTeacherScheduleInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/DeleteTeacherScheduleInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchTeacherScheduleInfoStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchTeacherScheduleInfoStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//===============================开放时段管理==================================
mock.onPut('/GetTeachSignupTimeRangeList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeachSignupTimeRangeList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/SaveSignupTimeRangeInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveSignupTimeRangeInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchSignupTimeRangeInfoStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchSignupTimeRangeInfoStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//===============================在线报名产品管理==================================
mock.onPut('/GetTeachSignupProductList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/GetTeachSignupProductList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

mock.onPut('/SaveTeachSignupProductInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SaveTeachSignupProductInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/AuditSignupProductInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/AuditSignupProductInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/SwitchSignupProductInfoStatus').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Admin/SwitchSignupProductInfoStatus', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/GetProductTimeRange').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Xuetang/GetProductTimeRange', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//资讯管理
mock.onPut('/zixun_ZixunHomeGeneral').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/zixun/PC_ZixunHomeGeneral', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/zixun_SaveZixun').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/zixun/PC_SaveZixun', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/zixun_zixunList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/zixun/PC_InformationList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/zixun_ChannelList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/zixun/ChannelList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/zixun_PCChannelList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/zixun/PC_ChannelList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/zixun_SaveChannel').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/zixun/PC_SaveChannel', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/zixun_DeleteChannel').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/zixun/PC_DeleteChannel', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/zixun_DeleteZixun').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/zixun/PC_DeleteZixun', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//==========文件管理 start
//文件授权列表
mock.onPut('/file_auth_list_query').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/deptFile/FolderAuthList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//文件授权save
mock.onPut('/file_auth_save').reply(config => {
  return new Promise(function (resolve, reject) {
    //string parentFolderId, string folderName, int folderType, int isToOrgRead, string authorizationType, string personInCharge
    normalAxios.post('/deptFile/CreateFolderAuth', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//文件授权del
mock.onPut('/file_auth_delete').reply(config => {
  return new Promise(function (resolve, reject) {
    //folderId
    normalAxios.post('/deptFile/FolderAuthDelete', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//公共文件列表(old 一次全部取出来 效率低)
mock.onPut('/folder_share_list_query').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/deptFile/FolderAndFileSharedList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//公共文件列表(new 点击一个文件夹查询一次)
mock.onPut('/folder_share_list_by_parent_query').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/deptFile/FolderAndFileSharedListByParent', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//公共文件夹save
mock.onPut('/folder_share_save').reply(config => {
  return new Promise(function (resolve, reject) {
    //string parentId, string folderName
    normalAxios.post('/deptFile/CreateShareFolder', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//公共文件save
mock.onPut('/file_share_save').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/deptFile/', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//私有文件列表
mock.onPut('/folder_self_list_query').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/deptFile/FolderAndFileSelfList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//私有文件save
mock.onPut('/folder_self_save').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/deptFile/CreateSelfFolder', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//文件夹del
mock.onPut('/folder_delete').reply(config => {
  return new Promise(function (resolve, reject) {
    //folderId
    normalAxios.post('/deptFile/DeleteDir', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//文件del
mock.onPut('/file_delete').reply(config => {
  return new Promise(function (resolve, reject) {
    //folderId
    normalAxios.post('/deptFile/DeleteFile', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/file_rename').reply(config => {
  return new Promise(function (resolve, reject) {
    //string id, string newName, string fType)
    normalAxios.post('/deptFile/RenameFileOrFolder', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//文件收藏列表
//2018-12-04
mock.onPut('/file_collect_list_query').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/deptFile/FileCollectList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//文件收藏save/del
//2018-12-04
mock.onPut('/file_collect_save').reply(config => {
  return new Promise(function (resolve, reject) {
    //string fileId, Boolean isDel
    normalAxios.post('/deptFile/AddFileCollectRecord', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//文件搜索
//2018-12-04
mock.onPut('/file_search_by_name').reply(config => {
  return new Promise(function (resolve, reject) {
    //int selfOrShare, string text
    normalAxios.post('/deptFile/FileSearchByName', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//文件或文件夹移动
//2018-12-21
mock.onPut('/file_or_folder_move').reply(config => {
  return new Promise(function (resolve, reject) {
    //string fId, string folderId
    normalAxios.post('/deptFile/MoveFolder', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//==========文件管理 end

//==========导入管理 start
//学生导入(文件已上传，将路径带入)
mock.onPut('/import_student').reply(config => {
  return new Promise(function (resolve, reject) {
    //string filePath
    normalAxios.post('/sso/importStudent', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/import_studentSignup').reply(config => {
  return new Promise(function (resolve, reject) {
    //string filePath
    normalAxios.post('/sso/importStudentSignup', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});


//==========导入管理 end

//课程列表 2018-10-17
mock.onPut('/course_list_query').reply(config => {
  return new Promise(function (resolve, reject) {
    //folderId
    normalAxios.post('/course/courseList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//部门列表 树形 2018-10-18
mock.onPut('/department_list_query').reply(config => {
  return new Promise(function (resolve, reject) {
    //{}
    normalAxios.post('/sso/departmentList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//部门列表 树形 2018-11-28
mock.onPut('/department_list_simple_query').reply(config => {
  return new Promise(function (resolve, reject) {
    //{}
    normalAxios.post('/sso/departmentListSimple', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//总部员工列表 2018-10-18
mock.onPut('/employee_list_query').reply(config => {
  return new Promise(function (resolve, reject) {
    //{conditions: {UserType: 3, Status: 1}}
    normalAxios.post('/sso/employeeUserList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//资讯评论
mock.onPut('/zixun_InfoEvaluationList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/zixun/InfoEvaluationList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//回复评论
mock.onPut('/zixun_ReplyEvaluation').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/zixun/ReplyEvaluation', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//删除评论
mock.onPut('/zixun_DeleteEvaluation').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/zixun/DeleteEvaluation', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});

//轮播图管理
mock.onPut('/other_getRotationList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Other/getRotationList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//轮播图管理
mock.onPut('/other_xuetang_getRotationList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Other/getXuetangRotationList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/other_saveRotation').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Other/saveRotation', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/other_deleteRotation').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Other/deleteRotation', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
//广告管理
mock.onPut('/other_getLinkInfoList').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Other/getLinkInfoList', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/other_saveLinkInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Other/saveLinkInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
mock.onPut('/other_deleteLinkInfo').reply(config => {
  return new Promise(function (resolve, reject) {
    normalAxios.post('/Other/deleteLinkInfo', config.data).then((res) => {
      resolve([200, res.data]);
    }).catch((err) => {
      resolve([500, err]);
    });
  });
});
export default mockAxios;
