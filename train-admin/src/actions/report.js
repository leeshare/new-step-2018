import api from '../api'
//缴费信息月统计表
export function getReportOfFeeOfMonth(searchOptions) {
  return {
    type: 'GetReportOfFeeOfMonth',
    payload: {
      promise: api.put('/GetReportOfFeeOfMonth',searchOptions)
    }
  }
}
//学生报名统计
export function getReportOfStudentSignup(searchOptions) {
  return {
    type: 'GetReportOfStudentSignup',
    payload: {
      promise: api.put('/GetReportOfStudentSignup',searchOptions)
    }
  }
}
//学生累计数统计
export function getReportOfStudentSignupHistory(searchOptions) {
  return {
    type: 'GetReportOfStudentSignupHistory',
    payload: {
      promise: api.put('/GetReportOfStudentSignupHistory',searchOptions)
    }
  }
}
//在读学生信息
export function getReportOfK12LearningStudents(searchOptions) {
  return {
    type: 'GetReportOfK12LearningStudents',
    payload: {
      promise: api.put('/GetReportOfK12LearningStudents',searchOptions)
    }
  }
}