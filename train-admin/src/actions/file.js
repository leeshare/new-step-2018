import api from '../api'

//获取文件授权列表数据
export function fileAuthListQuery(){
    return {
        type: 'FILE_AUTH_LIST_QUERY',
        payload: {
            promise: api.put('/file_auth_list_query')
        }
    }
}
export function fileAuthSave(obj) {
    return {
        type: 'FILE_AUTH_SAVE',
        payload: {
            promise: api.put('/file_auth_save',obj)
        }
    }
}
export function fileAuthDelete(obj) {
    return {
        type: 'FILE_AUTH_DELETE',
        payload: {
            promise: api.put('/file_auth_delete',obj)
        }
    }
}

//课程列表
export function courseListQuery(obj) {
    return {
        type: 'COURSE_LIST_QUERY',
        payload: {
            promise: api.put('/course_list_query',obj)
        }
    }
}
//部门列表
export function departmentListQuery(obj) {
    return {
      type: 'DEPARTMENT_LIST_QUERY',
      payload: {
        promise: api.put('/department_list_query', obj)
      }
    }
}
//部门列表
export function departmentListSimpleQuery(obj) {
    return {
      type: 'DEPARTMENT_LIST_SIMPLE_QUERY',
      payload: {
        promise: api.put('/department_list_simple_query', obj)
      }
    }
}
//员工列表
export  function employeeListQuery(obj) {
    return {
      type: 'EMPLOYEE_LIST_QUERY',
      payload: {
        promise: api.put('/employee_list_query', obj)
      }
    }
}

//获取公共文件列表数据
export function folderShareListQuery(obj){
    return {
        type: 'FOLDER_SHARE_LIST_QUERY',
        payload: {
            promise: api.put('/folder_share_list_query', obj)
        }
    }
}
//获取公共文件列表数据（根据parent查询）
export function folderShareListByParentQuery(obj){
    return {
        type: 'FOLDER_SHARE_LIST_BY_PARENT_QUERY',
        payload: {
            promise: api.put('/folder_share_list_by_parent_query', obj)
        }
    }
}

//公共文件夹save
export function folderShareSave(obj) {
    return {
        type: 'FOLDER_SHARE_SAVE',
        payload: {
            promise: api.put('/folder_share_save',obj)
        }
    }
}
export function fileShareSave(obj) {
    return {
        type: 'FILE_SHARE_SAVE',
        payload: {
            promise: api.put('/file_share_save',obj)
        }
    }
}


//获取私有文件列表数据
export function folderSelfListQuery(){
    return {
        type: 'FOLDER_SELF_LIST_QUERY',
        payload: {
            promise: api.put('/folder_self_list_query')
        }
    }
}
export function folderSelfSave(obj) {
    return {
        type: 'FOLDER_SELF_SAVE',
        payload: {
            promise: api.put('/folder_self_save',obj)
        }
    }
}

export function folderDelete(obj) {
    return {
        type: 'FOLDER_DELETE',
        payload: {
            promise: api.put('/folder_delete',obj)
        }
    }
}
export function fileDelete(obj) {
    return {
        type: 'FILE_DELETE',
        payload: {
            promise: api.put('/file_delete',obj)
        }
    }
}
export function fileNameUpdate(obj){
  return {
      type: 'FILE_RENAME',
      payload: {
          promise: api.put('/file_rename',obj)
      }
  }
}
export function importStudent(obj){
  return {
      type: 'IMPORT_STUDENT',
      payload: {
          promise: api.put('/import_student',obj)
      }
  }
}
export function importStudentSignup(obj){
    return {
        type: 'IMPORT_STUDENTSIGNUP',
        payload: {
            promise: api.put('/import_studentSignup',obj)
        }
    }
  }
//获取文件授权列表数据
export function fileCollectListQuery(){
    return {
        type: 'FILE_COLLECT_LIST_QUERY',
        payload: {
            promise: api.put('/file_collect_list_query')
        }
    }
}
export function fileCollectSave(obj) {
    return {
        type: 'FILE_COLLECT_SAVE',
        payload: {
            promise: api.put('/file_collect_save',obj)
        }
    }
}
export function fileSearchByName(obj) {
    return {
        type: 'FILE_SEARCH_BY_NAME',
        payload: {
            promise: api.put('/file_search_by_name',obj)
        }
    }
}
export function moveFolder(obj) {
    return {
        type: 'MOVE_FOLDER',
        payload: {
            promise: api.put('/file_or_folder_move', obj)
        }
    }
}
