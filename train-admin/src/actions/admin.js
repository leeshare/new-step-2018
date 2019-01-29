import api from '../api'
//发送消息
export function adminSendAppNotify(notifyInfo) {
  return {
    type: 'AdminSendAppNotify',
    payload: {
      promise: api.put('/AdminSendAppNotify', notifyInfo)
    }
  }
}
export function adminSendEmailNotify(notifyInfo) {
  return {
    type: 'AdminSendEmailNotify',
    payload: {
      promise: api.put('/AdminSendEmailNotify', notifyInfo)
    }
  }
}
//智能输入搜索本机构下人员信息
export function smartInputSearchUserList(searchOptions) {
  return {
    type: 'SmartInputSearchUserList',
    payload: {
      promise: api.put('/SmartInputSearchUserList', searchOptions)
    }
  }
}
//智能输入搜索本机构下教师信息
export function smartInputSearchTeacherList(searchOptions) {
  return {
    type: 'SmartInputSearchTeacherUserList',
    payload: {
      promise: api.put('/SmartInputSearchTeacherUserList', searchOptions)
    }
  }
}
//智能输入搜索本机构下学生信息
export function smartInputSearchStudentUserList(searchOptions) {
  return {
    type: 'SmartInputSearchStudentUserList',
    payload: {
      promise: api.put('/SmartInputSearchStudentUserList', searchOptions)
    }
  }
}
//获取角色列表
export function getRoleList(pagingSearch) {
  return {
    type: 'RoleList',
    payload: {
      promise: api.put('/RoleList', pagingSearch)
    }
  }
}
//获取角色功能列表
export function getRoleFunList(roleID) {
  return {
    type: 'RoleFunList',
    payload: {
      promise: api.put('/RoleFunList', { roleID })
    }
  }
}
//保存角色信息
export function saveRoleInfo(roleInfo) {
  return {
    type: 'SaveRoleInfo',
    payload: {
      promise: api.put('/SaveRoleInfo', roleInfo)
    }
  }
}
//删除角色信息
export function deleteRoleInfo(roleID) {
  return {
    type: 'DeleteRoleInfo',
    payload: {
      promise: api.put('/DeleteRoleInfo', { roleID })
    }
  }
}
//获取机构学生列表
export function getOrganizationStudentList(pagingSearch) {
  return {
    type: 'GetOrganizationStudentList',
    payload: {
      promise: api.put('/GetOrganizationStudentList', pagingSearch)
    }
  }
}
//保存机构学生信息
export function saveOrganizationStudentInfo(orgUserInfo) {
  return {
    type: 'SaveOrganizationStudentInfo',
    payload: {
      promise: api.put('/SaveOrganizationStudentInfo', orgUserInfo)
    }
  }
}
//获取机构教师列表
export function getOrganizationTeacherList(pagingSearch) {
  return {
    type: 'GetOrganizationTeacherList',
    payload: {
      promise: api.put('/GetOrganizationTeacherList', pagingSearch)
    }
  }
}
//保存机构教师信息
export function saveOrganizationTeacherInfo(orgUserInfo) {
  return {
    type: 'SaveOrganizationTeacherInfo',
    payload: {
      promise: api.put('/SaveOrganizationTeacherInfo', orgUserInfo)
    }
  }
}
//保存机构教师授权信息
export function saveOrganizationTeacherAuthInfo(orgUserInfo) {
  return {
    type: 'SaveOrganizationTeacherAuthInfo',
    payload: {
      promise: api.put('/SaveOrganizationTeacherAuthInfo', orgUserInfo)
    }
  }
}
//获取机构用户列表
export function getOrganizationUserList(pagingSearch) {
  return {
    type: 'GetOrganizationUserList',
    payload: {
      promise: api.put('/GetOrganizationUserList', pagingSearch)
    }
  }
}
//根据学号用户名查找用户信息
export function getUserInfoByUserName(userName) {
  return {
    type: 'GetUserInfoByUserName',
    payload: {
      promise: api.put('/GetUserInfoByUserName', { userName })
    }
  }
}
//根据Mobile查找用户信息
export function getUserInfoByMobile(mobile) {
  return {
    type: 'GetUserInfoByMobile',
    payload: {
      promise: api.put('/GetUserInfoByMobile', { mobile })
    }
  }
}
//根据Email查找用户信息
export function getUserInfoByEmail(email) {
  return {
    type: 'GetUserInfoByEmail',
    payload: {
      promise: api.put('/GetUserInfoByEmail', { email })
    }
  }
}
//保存机构用户信息
export function saveOrganizationUserInfo(orgUserInfo) {
  return {
    type: 'SaveOrganizationUserInfo',
    payload: {
      promise: api.put('/SaveOrganizationUserInfo', orgUserInfo)
    }
  }
}
//切换机构用户状态
export function switchOrganizationUserInfoStatus(orgUserInfo) {
  return {
    type: 'SwitchOrganizationUserInfoStatus',
    payload: {
      promise: api.put('/SwitchOrganizationUserInfoStatus', orgUserInfo)
    }
  }
}
//删除机构用户信息
export function deleteOrganizationUserInfo(orgUserInfo) {
  return {
    type: 'DeleteOrganizationUserInfo',
    payload: {
      promise: api.put('/DeleteOrganizationUserInfo', orgUserInfo)
    }
  }
}
//重置用户密码
export function resetUserPassword(orgUserInfo) {
  return {
    type: 'ResetUserPassword',
    payload: {
      promise: api.put('/ResetUserPassword', orgUserInfo)
    }
  }
}
//修改用户密码
export function changePassword(passwordInfo) {
  return {
    type: 'ChangePassword',
    payload: {
      promise: api.put('/ChangePassword', passwordInfo)
    }
  }
}
//修改用户基本信息
export function changeUserInfo(userInfo) {
  return {
    type: 'ChangUserInfo',
    payload: {
      promise: api.put('/ChangUserInfo', userInfo)
    }
  }
}



//系统字典维护
export function getDictionaryList(pagingSearch) {
  return {
    type: 'GetDictionaryList',
    payload: {
      promise: api.put('/GetDictionaryList', pagingSearch)
    }
  }
}
export function saveDictionaryInfo(dicInfo) {
  return {
    type: 'SaveDictionaryInfo',
    payload: {
      promise: api.put('/SaveDictionaryInfo', dicInfo)
    }
  }
}
//总部管理员首页统计数据汇总
export function getStatSumInfoForSchoolearnAdmin() {
  return {
    type: 'GetStatSumInfoForSchoolearnAdmin',
    payload: {
      promise: api.put('/GetStatSumInfoForSchoolearnAdmin')
    }
  }
}
//分校管理员首页统计数据汇总
export function getStatSumInfoForBranchAdmin() {
  return {
    type: 'GetStatSumInfoForBranchAdmin',
    payload: {
      promise: api.put('/GetStatSumInfoForBranchAdmin')
    }
  }
}
//回放视频点评
export function postCameraVideoRemark(cameraVideoInfo) {
  return {
    type: 'PostCameraVideoRemark',
    payload: {
      promise: api.put('/PostCameraVideoRemark', cameraVideoInfo)
    }
  }
}