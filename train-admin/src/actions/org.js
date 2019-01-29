import api from '../api'

//获取机构列表
export function train_org_list(pagingSearch) {
  return {
    type: 'TRAIN_ORG_LIST',
    payload: {
      promise: api.put('/train_org_list', pagingSearch)
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
