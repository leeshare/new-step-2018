import api from '../api'

//获取机构列表
export function getOrganizationList(pagingSearch) {
  return {
    type: 'GetOrganizationList',
    payload: {
      promise: api.put('/GetOrganizationList',pagingSearch)
    }
  }
}
//保存机构信息
export function saveOrganizationInfo(orgInfo) {
  return {
    type: 'SaveOrganizationInfo',
    payload: {
      promise: api.put('/SaveOrganizationInfo',orgInfo)
    }
  }
}
//保存机构信息
export function switchOrganizationInfoStatus(orgInfo) {
  return {
    type: 'SwitchOrganizationInfoStatus',
    payload: {
      promise: api.put('/SwitchOrganizationInfoStatus',orgInfo)
    }
  }
}