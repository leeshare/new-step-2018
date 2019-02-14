import {
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  FETCH_PROFILE_SUCCESS,
  SWITCH_ORG_CONTEXT,
  ChangUserInfo_SUCCESS,
  TestAdminLoginQRCode_SUCCESS
} from '../actions/auth';

const initialState = {
  user: null,
};

export default function auth(state = initialState, action = {}) {
  switch (action.type) {
    case LOGIN_SUCCESS:
      {
        let user = action.payload.data;
        //let currentOrgID = user.role_contexts[user.role_contexts.length - 1].orgID;
        //window.localStorage.setItem('token', user.token + ',' + currentOrgID)
        window.localStorage.setItem('token', user.ticket)
        window.localStorage.setItem('org', user.orgId)
        window.localStorage.setItem('profile', JSON.stringify(user));
        //user.currentOrgID = currentOrgID;
        return {
          ...state,
          user: user,
        };
      }
    case SWITCH_ORG_CONTEXT:
      {
        let user = state.user;
        window.localStorage.setItem('token', user.token + ',' + action.payload.data)
        user.currentOrgID = action.payload.data;
        return {
          ...state,
          user: user
        };
      }
    case LOGOUT_SUCCESS:
      {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('profile');
        window.localStorage.removeItem('lastMenuInfo');
        return {
          ...state,
          user: null,
        };
      }
    case TestAdminLoginQRCode_SUCCESS:
      {
        let { TestOK, UserInfo } = action.payload.data;
        if (TestOK) {
          //let currentOrgID = UserInfo.role_contexts[0].orgID;
          //window.localStorage.setItem('token', UserInfo.token + ',' + currentOrgID);
          window.localStorage.setItem('token', UserInfo.ticket);
          window.localStorage.setItem('profile', JSON.stringify(UserInfo));
          //UserInfo.currentOrgID = currentOrgID;
          return {
            ...state,
            user: UserInfo,
          };
        }
        return state;
      }
      break;
    case FETCH_PROFILE_SUCCESS:
      {
        var user = action.payload.data;
        //let currentOrgID = user.role_contexts[user.role_contexts.length - 1].orgID;
        //user.currentOrgID = currentOrgID;
        //window.localStorage.setItem('token', user.token + ',' + currentOrgID);
        window.localStorage.setItem('token', user.ticket);
        return {
          ...state,
          user: user,
        };
      }
    case ChangUserInfo_SUCCESS:
      {
        let newUserInfo = { ...state.user, ...action.payload.data };
        return {
          ...state,
          user: newUserInfo,
        };
      }
    default:
      return state;
  }
}
