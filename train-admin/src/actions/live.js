import api from '../api'
//获取直播列表
export function getLiveList(pagingSearch) {
  return {
    type: 'GetLiveList',
    payload: {
      promise: api.put('/GetLiveList', pagingSearch)
    }
  }
}

//保存直播信息
export function saveLiveInfo(liveInfo) {
  return {
    type: 'SaveLiveInfo',
    payload: {
      promise: api.put('/SaveLiveInfo', liveInfo)
    }
  }
}

//审核直播信息
export function auditLiveInfo(liveInfo) {
  return {
    type: 'AuditLiveInfo',
    payload: {
      promise: api.put('/AuditLiveInfo', liveInfo)
    }
  }
}

//切换直播状态
export function switchLiveInfo(liveInfo) {
  return {
    type: 'SwitchLiveInfo',
    payload: {
      promise: api.put('/SwitchLiveInfo', liveInfo)
    }
  }
}


//删除直播信息
export function deleteLiveInfo(liveInfo) {
  return {
    type: 'DeleteLiveInfo',
    payload: {
      promise: api.put('/DeleteLiveInfo', liveInfo)
    }
  }
}


//获取直播提问列表
export function getLiveQuestionList(pagingSearch) {
  return {
    type: 'GetLiveQuestionList',
    payload: {
      promise: api.put('/GetLiveQuestionList', pagingSearch)
    }
  }
}

//保存直播提问信息
export function saveLiveQuestionInfo(liveInfo) {
  return {
    type: 'SaveLiveQuestionInfo',
    payload: {
      promise: api.put('/SaveLiveQuestionInfo', liveInfo)
    }
  }
}

//审核直播提问信息
export function switchLiveQuestionInfo(liveInfo) {
  return {
    type: 'SwitchLiveQuestionInfo',
    payload: {
      promise: api.put('/SwitchLiveQuestionInfo', liveInfo)
    }
  }
}
 
//删除直播提问信息
export function deleteLiveQuestionInfo(liveInfo) {
  return {
    type: 'DeleteLiveQuestionInfo',
    payload: {
      promise: api.put('/DeleteLiveQuestionInfo', liveInfo)
    }
  }
}

