import api from '../api'

//获取资讯首页数据
export function getzixun_ZixunHomeGeneral() {
    return {
        type: 'zixun_ZixunHomeGeneral',
        payload: {
            promise: api.put('/zixun_ZixunHomeGeneral')
        }
    }
}
export function zixun_Savezixun(obj) {
    return {
        type: 'zixun_SaveZixun',
        payload: {
            promise: api.put('/zixun_SaveZixun',obj)
        }
    }
}
export function zixun_zixunList(obj) {
    return {
        type: 'zixun_zixunList',
        payload: {
            promise: api.put('/zixun_zixunList',obj)
        }
    }
}
export function zixun_ChannelList(obj) {
    return {
        type: 'zixun_ChannelList',
        payload: {
            promise: api.put('/zixun_ChannelList',obj)
        }
    }
}
export function zixun_DeleteZixun(obj) {
    return {
        type: 'zixun_DeleteZixun',
        payload: {
            promise: api.put('/zixun_DeleteZixun',obj)
        }
    }
}

export function zixun_PCChannelList(obj) {
    return {
        type: 'zixun_PCChannelList',
        payload: {
            promise: api.put('/zixun_PCChannelList',obj)
        }
    }
}
export function zixun_SaveChannel(obj) {
    return {
        type: 'zixun_SaveChannel',
        payload: {
            promise: api.put('/zixun_SaveChannel',obj)
        }
    }
}
export function zixun_DeleteChannel(obj) {
    return {
        type: 'zixun_DeleteChannel',
        payload: {
            promise: api.put('/zixun_DeleteChannel',obj)
        }
    }
}
export function zixun_InfoEvaluationList(obj) {
    return {
        type: 'zixun_InfoEvaluationList',
        payload: {
            promise: api.put('/zixun_InfoEvaluationList',obj)
        }
    }
}
export function zixun_ReplyEvaluation(obj) {
    return {
        type: 'zixun_ReplyEvaluation',
        payload: {
            promise: api.put('/zixun_ReplyEvaluation',obj)
        }
    }
}
export function zixun_DeleteEvaluation(obj) {
    return {
        type: 'zixun_DeleteEvaluation',
        payload: {
            promise: api.put('/zixun_DeleteEvaluation',obj)
        }
    }
}


