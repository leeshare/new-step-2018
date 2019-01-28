import api from '../api'
export const LOAD_DICTIONARY_SUCCESS = 'LOAD_DICTIONARY_SUCCESS';
//获取字典
export function loadDictionary(dicTypes) {
  return {
    type: 'LOAD_DICTIONARY',
    payload: {
      promise: api.put('/ClientLoadDictionarys', { groupName: dicTypes.join(',') })
    }
  }
}
//设置字典
export function setDictionary(dicTypes) {
  return {
    type: 'SET_DICTIONARY',
    data: dicTypes
  }
}