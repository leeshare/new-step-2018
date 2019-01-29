import api from '../api'
//获取教师所有课表
export function getAllTeacherSchedules(pagingSearch) {
  return {
    type: 'GetAllTeacherSchedules',
    payload: {
      promise: api.put('/GetAllTeacherSchedules', pagingSearch)
    }
  }
}
//获取教师上课安排计划
export function getTeacherTeachRecords(pagingSearch) {
  return {
    type: 'GetTeacherTeachRecords',
    payload: {
      promise: api.put('/GetTeacherTeachRecords', pagingSearch)
    }
  }
}
//获取教师教授的学员列表
export function getMyStudentList(pagingSearch) {
  return {
    type: 'GetMyStudentList',
    payload: {
      promise: api.put('/GetMyStudentList', pagingSearch)
    }
  }
}
//获取教师授课概况
export function getTeacherTeachOverview(teachScheduleID) {
  return {
    type: 'GetTeacherTeachOverview',
    payload: {
      promise: api.put('/GetTeacherTeachOverview', { teachScheduleID })
    }
  }
}
//获取教师授课概况
export function updateScheduleInfo(teachScheduleID, content, contentType) {
  return {
    type: 'UpdateScheduleInfo',
    payload: {
      promise: api.put('/UpdateScheduleInfo', { teachScheduleID, content, contentType })
    }
  }
}
//删除教师上课资源
export function deleteCategoryResource(resType, categoryResID) {
  return {
    type: 'DeleteCategoryResource',
    payload: {
      promise: api.put('/DeleteCategoryResource', { resType, categoryResID })
    }
  }
}
//修改教师上课资源名称
export function editResourceName(resType, categoryResID, teachResourceAlias) {
  return {
    type: 'EditResourceName',
    payload: {
      promise: api.put('/EditResourceName', { resType, categoryResID, teachResourceAlias })
    }
  }
}
//搜索教学课件资源库名称
export function getTeachCategoryResList(pagingSearch) {
  return {
    type: 'GetTeachCategoryResList',
    payload: {
      promise: api.put('/GetTeachCategoryResList', pagingSearch)
    }
  }
}
//搜索我的课件资源库名称
export function getPublicCategoryResList(pagingSearch) {
  return {
    type: 'GetPublicCategoryResList',
    payload: {
      promise: api.put('/GetPublicCategoryResList', pagingSearch)
    }
  }
}
//保存选中的课件
export function saveChoosedTeachResources(TeachScheduleID, ResType, categoryResIDs) {
  return {
    type: 'SaveChoosedTeachResources',
    payload: {
      promise: api.put('/SaveChoosedTeachResources', { TeachScheduleID, ResType, categoryResIDs })
    }
  }
}
//删除点评附件
export function removeTeachRecordDetail(detailID) {
  return {
    type: 'RemoveTeachRecordDetail',
    payload: {
      promise: api.put('/RemoveTeachRecordDetail', { detailID })
    }
  }
}
//教师点评文本内容
export function postTeacherEval(teachRecordID, evalContent) {
  return {
    type: 'PostTeacherEval',
    payload: {
      promise: api.put('/PostTeacherEval', { teachRecordID, evalContent })
    }
  }
}
//教师点评附件分享给其他同学
export function postTeacherEvalAttachmentShare(sourceTeachRecordID, targetTeachRecordIDs) {
  return {
    type: 'PostTeacherEvalAttachmentShare',
    payload: {
      promise: api.put('/PostTeacherEvalAttachmentShare', { sourceTeachRecordID, targetTeachRecordIDs })
    }
  }
}
//=============================== 在线课后练习及在线网络课备课 ==================================
export function batchAddTeachTask(postData) {
  return {
    type: 'batchAddTeachTask',
    payload: {
      promise: api.put('/batchAddTeachTask', postData)
    }
  }
}
export function deleteTeachTask(postData) {
  return {
    type: 'deleteTeachTask',
    payload: {
      promise: api.put('/deleteTeachTask', postData)
    }
  }
}
export function saveTeachTask(postData) {
  return {
    type: 'saveTeachTask',
    payload: {
      promise: api.put('/saveTeachTask', postData)
    }
  }
}

//教室列表
export function getTeachClassRoomList(pagingSearch) {
  return {
    type: 'GetTeachClassRoomList',
    payload: {
      promise: api.put('/GetTeachClassRoomList', pagingSearch)
    }
  }
}
//教室保存
export function saveTeachClassRoomInfo(classRoomInfo) {
  return {
    type: 'SaveTeachClassRoomInfo',
    payload: {
      promise: api.put('/SaveTeachClassRoomInfo', classRoomInfo)
    }
  }
}
//教室删除
export function deleteTeachClassRoomInfo(classRoomInfo) {
  return {
    type: 'DeleteTeachClassRoomInfo',
    payload: {
      promise: api.put('/DeleteTeachClassRoomInfo', classRoomInfo)
    }
  }
}
//教室日程表
export function getTeachClassRoomSchedules(date) {
  return {
    type: 'GetTeachClassRoomSchedules',
    payload: {
      promise: api.put('/GetTeachClassRoomSchedules', { date })
    }
  }
}
//授课班查询
export function getTeachClassList(pagingSearch) {
  return {
    type: 'GetTeachClassList',
    payload: {
      promise: api.put('/GetTeachClassList', pagingSearch)
    }
  }
}
//授课班保存
export function saveTeachClassInfo(classInfo) {
  return {
    type: 'SaveTeachClassInfo',
    payload: {
      promise: api.put('/SaveTeachClassInfo', classInfo)
    }
  }
}
//授课班状态切换
export function switchTeachClassInfoStatus(classInfo) {
  return {
    type: 'SwitchTeachClassInfoStatus',
    payload: {
      promise: api.put('/SwitchTeachClassInfoStatus', classInfo)
    }
  }
}
//授课班删除
export function deleteTeachClassInfo(classInfo) {
  return {
    type: 'DeleteTeachClassInfo',
    payload: {
      promise: api.put('/DeleteTeachClassInfo', classInfo)
    }
  }
}
//授课班日程表
export function getTeachClassSchedules(date) {
  return {
    type: 'GetTeachClassSchedules',
    payload: {
      promise: api.put('/GetTeachClassSchedules', { date })
    }
  }
}
//授课班x学员列表
export function getTeachClassMemberList(pagingSearch) {
  return {
    type: 'GetTeachClassMemberList',
    payload: {
      promise: api.put('/GetTeachClassMemberList', pagingSearch)
    }
  }
}
//授课班学员保存
export function saveTeachClassMemberInfo(classMemberInfo) {
  return {
    type: 'SaveTeachClassMemberInfo',
    payload: {
      promise: api.put('/SaveTeachClassMemberInfo', classMemberInfo)
    }
  }
}
//授课班学员删除
export function deleteTeachClassMemberInfo(classMemberInfo) {
  return {
    type: 'DeleteTeachClassMemberInfo',
    payload: {
      promise: api.put('/DeleteTeachClassMemberInfo', classMemberInfo)
    }
  }
}

//授课安排列表
export function getTeachClassScheduleList(pagingSearch) {
  return {
    type: 'GetTeachClassScheduleList',
    payload: {
      promise: api.put('/GetTeachClassScheduleList', pagingSearch)
    }
  }
}
//授课安排保存
export function saveTeachClassScheduleInfo(classScheduleInfos) {
  return {
    type: 'SaveTeachClassScheduleInfo',
    payload: {
      promise: api.put('/SaveTeachClassScheduleInfo', classScheduleInfos)
    }
  }
}
//授课安排保存
export function batchSaveTeachClassScheduleInfo(classScheduleInfo) {
  return {
    type: 'BatchSaveTeachClassScheduleInfo',
    payload: {
      promise: api.put('/BatchSaveTeachClassScheduleInfo', classScheduleInfo)
    }
  }
}
//授课安排删除
export function deleteTeachClassScheduleInfo(classScheduleInfo) {
  return {
    type: 'DeleteTeachClassScheduleInfo',
    payload: {
      promise: api.put('/DeleteTeachClassScheduleInfo', classScheduleInfo)
    }
  }
}
//授课安排删除
export function getTeacherClassSchedules(dateType, beginDate, endDate) {
  return {
    type: 'GetTeacherClassSchedules',
    payload: {
      promise: api.put('/GetTeacherClassSchedules', { dateType, beginDate, endDate })
    }
  }
}
//课堂督查
export function getCameraVideoRemarkList(pagingSearch) {
  return {
    type: 'GetCameraVideoRemarkList',
    payload: {
      promise: api.put('/GetCameraVideoRemarkList', pagingSearch)
    }
  }
}
//学生排课表
export function getStudentTeachRecords(pagingSearch) {
  return {
    type: 'GetStudentTeachRecords',
    payload: {
      promise: api.put('/GetStudentTeachRecords', pagingSearch)
    }
  }
}
//===============================报名管理==================================
//学生报名记录
export function getTeachSignupRecordList(pagingSearch) {
  return {
    type: 'GetTeachSignupRecordList',
    payload: {
      promise: api.put('/GetTeachSignupRecordList', pagingSearch)
    }
  }
}
//学生报名信息录入
export function saveTeachSignupRecord(signupInfo) {
  return {
    type: 'SaveTeachSignupRecord',
    payload: {
      promise: api.put('/SaveTeachSignupRecord', signupInfo)
    }
  }
}
//学生报名信息过程跟踪
export function switchTeachSignupStatus(signupInfo) {
  return {
    type: 'SwitchTeachSignupStatus',
    payload: {
      promise: api.put('/SwitchTeachSignupStatus', signupInfo)
    }
  }
}
//===============================试听管理==================================
//学生试听记录
export function getTeachExperienceRecordList(pagingSearch) {
  return {
    type: 'GetTeachExperienceRecordList',
    payload: {
      promise: api.put('/GetTeachExperienceRecordList', pagingSearch)
    }
  }
}
//学生试听信息录入
export function saveTeachExperienceRecord(signupInfo) {
  return {
    type: 'SaveTeachExperienceRecord',
    payload: {
      promise: api.put('/SaveTeachExperienceRecord', signupInfo)
    }
  }
}
//学生试听信息过程跟踪
export function switchTeachExperienceStatus(signupInfo) {
  return {
    type: 'SwitchTeachExperienceStatus',
    payload: {
      promise: api.put('/SwitchTeachExperienceStatus', signupInfo)
    }
  }
}
//学生试听信息过程跟踪
export function studentExperienceToTeachClass(signupInfo) {
  return {
    type: 'StudentExperienceToTeachClass',
    payload: {
      promise: api.put('/StudentExperienceToTeachClass', signupInfo)
    }
  }
}
//===============================在线定价管理==================================
export function getTeachSignupPriceList(pagingSearch) {
  return {
    type: 'GetTeachSignupPriceList',
    payload: {
      promise: api.put('/GetTeachSignupPriceList', pagingSearch)
    }
  }
}
export function saveSignupPriceInfo(signupInfo) {
  return {
    type: 'SaveSignupPriceInfo',
    payload: {
      promise: api.put('/SaveSignupPriceInfo', signupInfo)
    }
  }
}
export function switchSignupPriceInfoStatus(signupInfo) {
  return {
    type: 'SwitchSignupPriceInfoStatus',
    payload: {
      promise: api.put('/SwitchSignupPriceInfoStatus', signupInfo)
    }
  }
}
//===============================报名批次管理==================================
export function getTeachSignupBatchList(pagingSearch) {
  return {
    type: 'GetTeachSignupBatchList',
    payload: {
      promise: api.put('/GetTeachSignupBatchList', pagingSearch)
    }
  }
}
export function saveSignupBatchInfo(signupInfo) {
  return {
    type: 'SaveSignupBatchInfo',
    payload: {
      promise: api.put('/SaveSignupBatchInfo', signupInfo)
    }
  }
}
export function switchSignupBatchInfoStatus(signupInfo) {
  return {
    type: 'SwitchSignupBatchInfoStatus',
    payload: {
      promise: api.put('/SwitchSignupBatchInfoStatus', signupInfo)
    }
  }
}
//===============================教师排课管理==================================
export function getIdleTeacherList(pagingSearch) {
  return {
    type: 'GetIdleTeacherList',
    payload: {
      promise: api.put('/GetIdleTeacherList', pagingSearch)
    }
  }
}
export function getTeachTeacherScheduleList(pagingSearch) {
  return {
    type: 'GetTeachTeacherScheduleList',
    payload: {
      promise: api.put('/GetTeachTeacherScheduleList', pagingSearch)
    }
  }
}
export function saveTeacherScheduleInfo(signupInfo) {
  return {
    type: 'SaveTeacherScheduleInfo',
    payload: {
      promise: api.put('/SaveTeacherScheduleInfo', signupInfo)
    }
  }
}
export function deleteTeacherScheduleInfo(signupInfo) {
  return {
    type: 'DeleteTeacherScheduleInfo',
    payload: {
      promise: api.put('/DeleteTeacherScheduleInfo', signupInfo)
    }
  }
}
export function switchTeacherScheduleInfoStatus(signupInfo) {
  return {
    type: 'SwitchTeacherScheduleInfoStatus',
    payload: {
      promise: api.put('/SwitchTeacherScheduleInfoStatus', signupInfo)
    }
  }
}
//===============================开放时段管理==================================
export function getTeachSignupTimeRangeList(pagingSearch) {
  return {
    type: 'GetTeachSignupTimeRangeList',
    payload: {
      promise: api.put('/GetTeachSignupTimeRangeList', pagingSearch)
    }
  }
}
export function saveSignupTimeRangeInfo(signupInfo) {
  return {
    type: 'SaveSignupTimeRangeInfo',
    payload: {
      promise: api.put('/SaveSignupTimeRangeInfo', signupInfo)
    }
  }
}
export function switchSignupTimeRangeInfoStatus(signupInfo) {
  return {
    type: 'SwitchSignupTimeRangeInfoStatus',
    payload: {
      promise: api.put('/SwitchSignupTimeRangeInfoStatus', signupInfo)
    }
  }
}
//===============================在线报名产品管理==================================
export function getTeachSignupProductList(pagingSearch) {
  return {
    type: 'GetTeachSignupProductList',
    payload: {
      promise: api.put('/GetTeachSignupProductList', pagingSearch)
    }
  }
}
export function saveTeachSignupProductInfo(signupInfo) {
  return {
    type: 'SaveTeachSignupProductInfo',
    payload: {
      promise: api.put('/SaveTeachSignupProductInfo', signupInfo)
    }
  }
}
export function auditSignupProductInfo(signupInfo) {
  return {
    type: 'AuditSignupProductInfo',
    payload: {
      promise: api.put('/AuditSignupProductInfo', signupInfo)
    }
  }
}
export function switchSignupProductInfoStatus(signupInfo) {
  return {
    type: 'SwitchSignupProductInfoStatus',
    payload: {
      promise: api.put('/SwitchSignupProductInfoStatus', signupInfo)
    }
  }
}
export function getProductTimeRange(pagingSearch) {
  return {
    type: 'GetProductTimeRange',
    payload: {
      promise: api.put('/GetProductTimeRange', pagingSearch)
    }
  }
}
