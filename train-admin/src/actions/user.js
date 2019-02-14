import api from '../api'

//获取用户列表
export function train_user_list(pagingSearch) {
  return {
    type: 'TRAIN_USER_LIST',
    payload: {
      promise: api.put('/train_user_list', pagingSearch)
    }
  }
}
export function train_teacher_list() {
  return {
    type: 'TRAIN_TEACHER_LIST',
    payload: {
      promise: api.put('/train_user_list', {status: 1, roleType: 3, page: 1, size: 999, keyword: ''})
    }
  }
}
//保存用户信息
export function train_user_save(userInfo) {
  return {
    type: 'TRAIN_USER_SAVE',
    payload: {
      promise: api.put('/train_user_save', userInfo)
    }
  }
}
//删除用户信息
export function train_user_del(userId) {
  return {
    type: 'TRAIN_USER_DEL',
    payload: {
      promise: api.put('/train_user_del', userId)
    }
  }
}
