import api from '../api'
//app-背景图包
export function getAppImagePackageList(pagingSearch) {
  return {
    type: 'GetAppImagePackageList',
    payload: {
      promise: api.put('/GetAppImagePackageList', pagingSearch)
    }
  }
}
//保存
export function saveAppImagePackageInfo(appImagePackageInfo) {
  return {
    type: 'SaveAppImagePackageInfo',
    payload: {
      promise: api.put('/SaveAppImagePackageInfo', appImagePackageInfo)
    }
  }
}
//审核
export function auditAppImagePackageInfo(appImagePackageInfo) {
  return {
    type: 'AuditAppImagePackageInfo',
    payload: {
      promise: api.put('/AuditAppImagePackageInfo', { id: appImagePackageInfo.ImagePackageID, AuditStatus: appImagePackageInfo.AuditStatus, AuditRemark: appImagePackageInfo.AuditRemark })
    }
  }
}
//切换状态
export function switchAppImagePackageInfoStatus(appImagePackageInfo) {
  return {
    type: 'SwitchAppImagePackageInfoStatus',
    payload: {
      promise: api.put('/SwitchAppImagePackageInfoStatus', { id: appImagePackageInfo.ImagePackageID, Status: appImagePackageInfo.Status })
    }
  }
}
//删除
export function deleteAppImagePackageInfo(appImagePackageInfo) {
  return {
    type: 'DeleteAppImagePackageInfo',
    payload: {
      promise: api.put('/DeleteAppImagePackageInfo', { id: appImagePackageInfo.ImagePackageID })
    }
  }
}
//app-用户反馈
export function getAppFeedbackList(pagingSearch) {
  return {
    type: 'GetAppFeedbackList',
    payload: {
      promise: api.put('/GetAppFeedbackList', pagingSearch)
    }
  }
}
//保存
export function saveAppFeedbackInfo(appImagePackageInfo) {
  return {
    type: 'SaveAppFeedbackInfo',
    payload: {
      promise: api.put('/SaveAppFeedbackInfo', appImagePackageInfo)
    }
  }
}