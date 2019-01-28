import api from '../api'

//获取数据
export function getRotationList(obj) {
    if(obj.appType == 2){
      //神墨学堂 轮播图
      return {
        type: 'other_xuetang_getRotationList',
        payload: {
            promise: api.put('/other_xuetang_getRotationList',obj)
        }
      }
    }
    //神墨app
    return {
        type: 'other_getRotationList',
        payload: {
            promise: api.put('/other_getRotationList',obj)
        }
    }
}
//保存
export function saveRotation(obj) {
    return {
        type: 'other_saveRotation',
        payload: {
            promise: api.put('/other_saveRotation',obj)
        }
    }
}
//删除
export function deleteRotation(obj) {
    return {
        type: 'other_deleteRotation',
        payload: {
            promise: api.put('/other_deleteRotation',obj)
        }
    }
}

//获取数据广告
export function getLinkInfoList(obj) {
    return {
        type: 'other_getLinkInfoList',
        payload: {
            promise: api.put('/other_getLinkInfoList',obj)
        }
    }
}
//保存
export function saveLinkInfo(obj) {
    return {
        type: 'other_saveLinkInfo',
        payload: {
            promise: api.put('/other_saveLinkInfo',obj)
        }
    }
}
//删除
export function deleteLinkInfo(obj) {
    return {
        type: 'other_deleteLinkInfo',
        payload: {
            promise: api.put('/other_deleteLinkInfo',obj)
        }
    }
}
