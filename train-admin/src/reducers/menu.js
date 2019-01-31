import _ from 'lodash';
import md5 from 'crypto-js/md5';

import {
  GET_ALL_MENU,
  GET_ALL_MENU_SUCCESS,
  UPDATE_NAVPATH,
  RECORD_USER_FUNC_CLICK,
  RECORD_USER_FUNC_LOAD,
  SWITCH_MENU_COLLAPSE
} from '../actions/menu';

const initialState = {
  items: [],
  roles: [],
  navpath: [],
  dailyFuns: [],//日常功能
};

export default function menu(state = initialState, action = {}) {
  switch (action.type) {
    case GET_ALL_MENU_SUCCESS:
      let safeCode = md5(window.localStorage.getItem("token")).toString();
      //根据情况设置菜单可见（仅显示pc上支持的菜单）
      //var allMenus = action.payload.data.menus;
      var allMenus = action.payload.data;
      allMenus.filter((a) => {
        var visible = false;
        if(a.visible == false){
          visible = false;
        }else {
          if (!a.child) {
            visible = true;
          }
          (a.child || []).map((child) => {
            //child.visible = (child.support || '').indexOf('pc') != -1;
            child.visible = true;
            visible = visible || child.visible;
          });
        }


        a.visible = visible;
      })
      allMenus.map((item) => {
        if (item.url) {
          item.url += `/${safeCode}`
        }
        if (item.child) {
          item.child.map((A) => {
            A.url += `/${safeCode}`
          })
        }
      })
      console.log((allMenus))
      return Object.assign({}, initialState, { items: allMenus, roles: action.payload.data.roles });
    case UPDATE_NAVPATH:
      let navpath = [], tmpOb, tmpKey, child;
      if (Array.isArray(action.payload.data)) {
        action.payload.data.reverse().map((item) => {
          if (item.indexOf('sub') != -1) {
            tmpKey = item.replace('sub', '');
            if (tmpKey != 'undefined') {
              tmpOb = _.find(state.items, function (o) {
                return o.key == tmpKey;
              });
              child = tmpOb.child;
              navpath.push({
                key: tmpOb.key,
                name: tmpOb.name
              })
            }
          }
          if (item.indexOf('menu') != -1) {
            tmpKey = item.replace('menu', '');
            if (child) {
              tmpOb = _.find(child, function (o) {
                return o.key == tmpKey;
              });
              navpath.push({
                key: tmpOb.key,
                name: tmpOb.name
              });
            }
          }
        })
      }
      return Object.assign({}, state, {
        currentIndex: action.payload.key,
        navpath: navpath
      });
    case RECORD_USER_FUNC_LOAD:
      {
        let dailyFunKey = 'userDailyFuns';
        let jsonStr = window.localStorage.getItem(dailyFunKey);
        if (jsonStr == null) {
          jsonStr = "[]"
        }
        let jsonResult = eval('(' + jsonStr + ')');
        return {
          ...state,
          dailyFuns: jsonResult.sort((a, b) => { return a.times > b.times ? 1 : -1 }),
        };
      }
    case RECORD_USER_FUNC_CLICK:
      {
        let dailyFunKey = 'userDailyFuns';
        let lastMenuInfo = 'lastMenuInfo';
        let jsonStr = window.localStorage.getItem(dailyFunKey);
        if (jsonStr == null) {
          jsonStr = "[]"
        }
        let jsonResult = eval('(' + jsonStr + ')');
        let findUrl = jsonResult.find((item) => (item.url || '').toLowerCase() == action.payload.data.toLowerCase());
        if (findUrl) {
          findUrl.times += 1;
        }
        else {
          jsonResult.push({ url: action.payload.data, times: 1 })
        }
        //存储
        window.localStorage.setItem(dailyFunKey, JSON.stringify(jsonResult));
        window.localStorage.setItem(lastMenuInfo, JSON.stringify(action.payload.lastMenuInfo));
        return {
          ...state,
          dailyFuns: jsonResult.sort((a, b) => { return a.times > b.times ? 1 : -1 }),
        };
      }
    case SWITCH_MENU_COLLAPSE:
      {
        return {
          ...state,
          menuCollapsed: action.payload.data === true ? true : (!state.menuCollapsed)
        }
      }
    default:
      return state;
  }
}
