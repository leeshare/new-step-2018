import api from '../api'

//获取course列表
export function train_course_list(pagingSearch) {
  return {
    type: 'TRAIN_COURSE_LIST',
    payload: {
      promise: api.put('/train_course_list', pagingSearch)
    }
  }
}
//保存course信息
export function train_course_save(courseInfo) {
  return {
    type: 'TRAIN_COURSE_SAVE',
    payload: {
      promise: api.put('/train_course_save', courseInfo)
    }
  }
}
//删除course信息
export function train_course_del(courseId) {
  return {
    type: 'TRAIN_COURSE_DEL',
    payload: {
      promise: api.put('/train_course_del', courseId)
    }
  }
}
