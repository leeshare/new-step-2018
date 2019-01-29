import api from '../api'
//获pdf文档视图列表
export function loadPdfDocuments(pagingSearch) {
  return {
    type: 'LoadPdfDocuments',
    payload: {
      promise: api.put('/LoadPdfDocuments', pagingSearch)
    }
  }
}
//获取课程列表
export function getCourseList(pagingSearch) {
  return {
    type: 'CourseList',
    payload: {
      promise: api.put('/CourseList', pagingSearch)
    }
  }
}
//获取课程单元列表
export function getCourseUnitList(courseID) {
  return {
    type: 'CourseUnitList',
    payload: {
      promise: api.put('/CourseUnitList', { courseID })
    }
  }
}
//保存课程信息
export function saveCourseInfo(courseInfo) {
  return {
    type: 'SaveCourseInfo',
    payload: {
      promise: api.put('/SaveCourseInfo', courseInfo)
    }
  }
}
//删除课程信息
export function deleteCourseInfo(courseId) {
  return {
    type: 'DeleteCourseInfo',
    payload: {
      promise: api.put('/DeleteCourseInfo', { id: courseId })
    }
  }
}
//审核课程
export function auditCourseInfo(courseId: string, audit: boolean) {
  return {
    type: 'AuditCourseInfo',
    payload: {
      promise: api.put('/AuditCourseInfo', { courseId: courseId, audit: audit })
    }
  }
}
//批量生成下载课程包
export function batchBuildCoursePackages() {
  return {
    type: 'BatchBuildCoursePackages',
    payload: {
      promise: api.put('/BatchBuildCoursePackages', {})
    }
  }
}
//保存课程设计
export function saveCourseDesign(courseDesign) {
  return {
    type: 'SaveCourseDesign',
    payload: {
      promise: api.put('/SaveCourseDesign', courseDesign)
    }
  }
}

//搜索课件信息
export function searchCourseWare(pagingSearch) {
  return {
    type: 'SearchCourseWare',
    payload: {
      promise: api.put('/searchCourseWare', pagingSearch)
    }
  }
}
//搜索字听写库
export function searchCharaterWritingLibrary(pagingSearch) {
  return {
    type: 'SearchCharaterWritingLibrary',
    payload: {
      promise: api.put('/SearchCharaterWritingLibrary', pagingSearch)
    }
  }
}
//保存字信息
export function saveCharacterWritingInfo(characterWritingInfo) {
  return {
    type: 'SaveCharacterWritingInfo',
    payload: {
      promise: api.put('/SaveCharacterWritingInfo', characterWritingInfo)
    }
  }
}
//审核字信息
export function auditCharacterWritingInfo(characterWritingInfo) {
  return {
    type: 'AuditCharacterWritingInfo',
    payload: {
      promise: api.put('/AuditCharacterWritingInfo', characterWritingInfo)
    }
  }
}
//切换字状态
export function switchCharacterWritingInfoStatus(characterWritingInfo) {
  return {
    type: 'SwitchCharacterWritingInfoStatus',
    payload: {
      promise: api.put('/SwitchCharacterWritingInfoStatus', characterWritingInfo)
    }
  }
}
//删除字信息
export function deleteCharacterWritingInfo(characterWritingInfo) {
  return {
    type: 'DeleteCharacterWritingInfo',
    payload: {
      promise: api.put('/DeleteCharacterWritingInfo', characterWritingInfo)
    }
  }
}
//搜索基础类库->字库、词句库信息
export function seachBaseLibrary(pagingSearch) {
  return {
    type: 'SeachBaseLibrary',
    payload: {
      promise: api.put('/SeachBaseLibrary', pagingSearch)
    }
  }
}
//保存字信息
export function saveCharacterInfo(characterInfo) {
  return {
    type: 'SaveCharacterInfo',
    payload: {
      promise: api.put('/SaveCharacterInfo', characterInfo)
    }
  }
}
//审核字信息
export function auditCharacterInfo(characterInfo) {
  return {
    type: 'AuditCharacterInfo',
    payload: {
      promise: api.put('/AuditCharacterInfo', characterInfo)
    }
  }
}
//切换字状态
export function switchCharacterInfoStatus(characterInfo) {
  return {
    type: 'SwitchCharacterInfoStatus',
    payload: {
      promise: api.put('/SwitchCharacterInfoStatus', characterInfo)
    }
  }
}
//删除字信息
export function deleteCharacterInfo(characterInfo) {
  return {
    type: 'DeleteCharacterInfo',
    payload: {
      promise: api.put('/DeleteCharacterInfo', { id: characterInfo.CharacterID })
    }
  }
}
//保存词句信息
export function saveSentenceInfo(characterInfo) {
  return {
    type: 'SaveSentenceInfo',
    payload: {
      promise: api.put('/SaveSentenceInfo', characterInfo)
    }
  }
}
//审核词句信息
export function auditSentenceInfo(characterInfo) {
  return {
    type: 'AuditSentenceInfo',
    payload: {
      promise: api.put('/AuditSentenceInfo', characterInfo)
    }
  }
}
//切换词句状态
export function switchSentenceInfoStatus(characterInfo) {
  return {
    type: 'SwitchSentenceInfoStatus',
    payload: {
      promise: api.put('/SwitchSentenceInfoStatus', characterInfo)
    }
  }
}
//删除词句信息
export function deleteSentenceInfo(characterInfo) {
  return {
    type: 'DeleteSentenceInfo',
    payload: {
      promise: api.put('/DeleteSentenceInfo', { id: characterInfo.SentenceID })
    }
  }
}
//保存跟唱课件信息
export function saveCourseWare_ChantInfo(courseWareInfo) {
  return {
    type: 'SaveCourseWare_ChantInfo',
    payload: {
      promise: api.put('/SaveCourseWare_ChantInfo', courseWareInfo)
    }
  }
}
//保存对话课件信息
export function saveCourseWare_DialogInfo(courseWareInfo) {
  return {
    type: 'SaveCourseWare_DialogInfo',
    payload: {
      promise: api.put('/SaveCourseWare_DialogInfo', courseWareInfo)
    }
  }
}
//保存句型课件信息
export function saveCourseWare_PatternInfo(courseWareInfo) {
  return {
    type: 'SaveCourseWare_PatternInfo',
    payload: {
      promise: api.put('/SaveCourseWare_PatternInfo', courseWareInfo)
    }
  }
}
//保存听写课件信息
export function saveCourseWare_WritingInfo(courseWareInfo) {
  return {
    type: 'SaveCourseWare_WritingInfo',
    payload: {
      promise: api.put('/SaveCourseWare_WritingInfo', courseWareInfo)
    }
  }
}
//保存朗读课件信息
export function saveCourseWare_ReaderInfo(courseWareInfo) {
  return {
    type: 'SaveCourseWare_ReaderInfo',
    payload: {
      promise: api.put('/SaveCourseWare_ReaderInfo', courseWareInfo)
    }
  }
}
//保存看图说话课件信息
export function saveCourseWare_TalkInfo(courseWareInfo) {
  return {
    type: 'SaveCourseWare_TalkInfo',
    payload: {
      promise: api.put('/SaveCourseWare_TalkInfo', courseWareInfo)
    }
  }
}
//保存讲稿课件信息
export function saveCourseWare_LectureInfo(courseWareInfo) {
  return {
    type: 'SaveCourseWare_LectureInfo',
    payload: {
      promise: api.put('/SaveCourseWare_LectureInfo', courseWareInfo)
    }
  }
}
//审核课件信息
export function auditCourseWareInfo(courseWareInfo) {
  return {
    type: 'AuditCourseWareInfo',
    payload: {
      promise: api.put('/AuditCourseWareInfo', { ID: courseWareInfo.CourseWareID, AuditStatus: courseWareInfo.AuditStatus, AuditRemark: courseWareInfo.AuditRemark })
    }
  }
}
//切换课件状态
export function switchCourseWareInfoStatus(courseWareInfo) {
  return {
    type: 'SwitchCourseWareInfoStatus',
    payload: {
      promise: api.put('/SwitchCourseWareInfoStatus', { ID: courseWareInfo.CourseWareID, Status: courseWareInfo.Status })
    }
  }
}
//删除课件信息
export function deleteCourseWareInfo(courseWareInfo) {
  return {
    type: 'DeleteCourseWareInfo',
    payload: {
      promise: api.put('/DeleteCourseWareInfo', { ID: courseWareInfo.CourseWareID })
    }
  }
}


//搜索课程主题信息
export function getTopicList(pagingSearch) {
  return {
    type: 'GetTopicList',
    payload: {
      promise: api.put('/GetTopicList', pagingSearch)
    }
  }
}
//保存课程主题信息
export function saveCourseTopicInfo(courseTopicInfo) {
  return {
    type: 'SaveCourseTopicInfo',
    payload: {
      promise: api.put('/SaveCourseTopicInfo', courseTopicInfo)
    }
  }
}
//审核课程主题信息
export function auditCourseTopicInfo(courseTopicInfo) {
  return {
    type: 'AuditCourseTopicInfo',
    payload: {
      promise: api.put('/AuditCourseTopicInfo', { id: courseTopicInfo.TopicID, AuditStatus: courseTopicInfo.AuditStatus, AuditRemark: courseTopicInfo.AuditRemark })
    }
  }
}
//切换课程主题状态
export function switchCourseTopicInfoStatus(courseTopicInfo) {
  return {
    type: 'SwitchCourseTopicInfoStatus',
    payload: {
      promise: api.put('/SwitchCourseTopicInfoStatus', { id: courseTopicInfo.TopicID, Status: courseTopicInfo.Status })
    }
  }
}
//删除课程主题信息
export function deleteCourseTopicInfo(courseTopicInfo) {
  return {
    type: 'DeleteCourseTopicInfo',
    payload: {
      promise: api.put('/DeleteCourseTopicInfo', { id: courseTopicInfo.TopicID })
    }
  }
}
//获取主题下的课程列表
export function getCourseTopicDetails(pagingSearch) {
  return {
    type: 'GetCourseTopicDetails',
    payload: {
      promise: api.put('/GetCourseTopicDetails', pagingSearch)
    }
  }
}

//添加选中课程到主题
export function addSelectedCourseToTopic(topicID, courseIDs) {
  return {
    type: 'AddSelectedCourseToTopic',
    payload: {
      promise: api.put('/AddSelectedCourseToTopic', { topicID, courseIDs })
    }
  }
}
//删除主题下的选中的课程
export function deleteSelectedCourseToTopic(courseIDs) {
  return {
    type: 'DeleteSelectedCourseToTopic',
    payload: {
      promise: api.put('/DeleteSelectedCourseToTopic', { courseTopicDetailIDs: courseIDs })
    }
  }
}
//-------------------------------教学安排管理---------------------------------------
//搜索
export function getTeachPlanList(pagingSearch) {
  return {
    type: 'GetTeachPlanList',
    payload: {
      promise: api.put('/GetTeachPlanList', pagingSearch)
    }
  }
}
//保存课程主题信息
export function saveTeachPlanInfo(courseTopicInfo) {
  return {
    type: 'SaveTeachPlanInfo',
    payload: {
      promise: api.put('/SaveTeachPlanInfo', courseTopicInfo)
    }
  }
}
//审核课程主题信息
export function auditTeachPlanInfo(courseTopicInfo) {
  return {
    type: 'AuditTeachPlanInfo',
    payload: {
      promise: api.put('/AuditTeachPlanInfo', courseTopicInfo)
    }
  }
}
//切换课程主题状态
export function switchTeachPlanInfo(courseTopicInfo) {
  return {
    type: 'SwitchTeachPlanInfo',
    payload: {
      promise: api.put('/SwitchTeachPlanInfo', courseTopicInfo)
    }
  }
}
//删除课程主题信息
export function deleteTeachPlanInfo(courseTopicInfo) {
  return {
    type: 'DeleteTeachPlanInfo',
    payload: {
      promise: api.put('/DeleteTeachPlanInfo',courseTopicInfo)
    }
  }
}
//获取主题下的课程列表
export function getTeachPlanDetails(pagingSearch) {
  return {
    type: 'GetTeachPlanDetails',
    payload: {
      promise: api.put('/GetTeachPlanDetails', pagingSearch)
    }
  }
}

//添加选中课程到主题
export function batchAddTeachPlanDetail(teachPlanInfo) {
  return {
    type: 'BatchAddTeachPlanDetail',
    payload: {
      promise: api.put('/BatchAddTeachPlanDetail', teachPlanInfo)
    }
  }
}
//添加选中课程到主题
export function saveTeachPlanDetailInfo(teachPlanInfo) {
  return {
    type: 'SaveTeachPlanDetailInfo',
    payload: {
      promise: api.put('/SaveTeachPlanDetailInfo', teachPlanInfo)
    }
  }
}
//删除主题下的选中的课程
export function deleteTeachPlanDetail(teachPlanInfo) {
  return {
    type: 'DeleteTeachPlanDetail',
    payload: {
      promise: api.put('/DeleteTeachPlanDetail', teachPlanInfo)
    }
  }
}
//获取资源列表
export function getTMResourceList(pagingSearch) {
  return {
    type: 'GetTMResourceList',
    payload: {
      promise: api.put('/GetTMResourceList', pagingSearch)
    }
  }
}
//保存资源信息
export function saveTMResourceInfo(resourceInfo) {
  return {
    type: 'SaveTMResourceInfo',
    payload: {
      promise: api.put('/SaveTMResourceInfo', resourceInfo)
    }
  }
}
//汉字转拼音
export function transformToPinyin(content) {
  return {
    type: 'TransformToPinyin',
    payload: {
      promise: api.put('/TransformToPinyin', {content})
    }
  }
}