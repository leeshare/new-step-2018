import api from '../api'

export const FETCH_PROFILE_PENDING = 'FETCH_PROFILE_PENDING';
export const FETCH_PROFILE_SUCCESS = 'FETCH_PROFILE_SUCCESS';
export const ChangUserInfo_SUCCESS = 'ChangUserInfo_SUCCESS';
export const SWITCH_ORG_CONTEXT='SWITCH_ORG_CONTEXT';
export const LOGIN_PENDING = 'LOGIN_PENDING';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_ERROR = 'LOGIN_ERROR';

export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const TestAdminLoginQRCode_SUCCESS='TestAdminLoginQRCode_SUCCESS';

export function switchOrgContext(orgID) {
  return {
    type: 'SWITCH_ORG_CONTEXT',
    payload: {
      data: orgID
    }
  }
}

export function fetchProfile() {
  let user = eval('(' +window.localStorage.getItem("profile") + ')');
  return {
    type: 'FETCH_PROFILE_SUCCESS',
    payload: {
      data: user
    }
  }
}

export function login(user, password) {
  return {
    type: 'LOGIN',
    payload: {
      promise: api.put('/login', {
        //username: user,
        userName: user,
        password: password
      })
    }
  }
}

export function logout() {
  return {
    type: 'LOGOUT',
    payload: {
      promise: api.get('/logout')
    }
  }
}

export function changePassword(info) {
  return {
    type: 'CHANGE_PWD',
    payload: {
      promise: api.put('/change_pwd', {
        oldPwd: info.old_password,
        newPwd: info.password
      })
    }
  }
}

//二维码登录URL地址获取
export function getAdminLoginQRCode() {
  return {
    type: 'GetAdminLoginQRCode',
    payload: {
      promise: api.put('/GetAdminLoginQRCode')
    }
  }
}

//二维码登录周期检测
export function testAdminLoginQRCode(code) {
  return {
    type: 'TestAdminLoginQRCode',
    payload: {
      promise: api.put('/TestAdminLoginQRCode', {code})
    }
  }
}
