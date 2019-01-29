import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { product } from '@/api/env.js';
import md5 from 'crypto-js/md5';

const validate = function (history) {
  const isLoggedIn = !!window.localStorage.getItem("token");
  if (!isLoggedIn && history.location.pathname != "/login") {
    history.replace("/login");
    return false;
  }
  //url权限
  let saveCode = md5(window.localStorage.getItem("token")).toString();
  if (history.location.pathname.indexOf(saveCode) == -1) {
    history.replace(`/home/${saveCode}`)
    return false;
  }
  return true;
};

export function getUserLastMenuInfo() {
  let saveCode = md5(window.localStorage.getItem("token")).toString();
  let lastMenuInfoStr = window.localStorage.getItem('lastMenuInfo') || "{key:'menu001',keyPath:['menu001'],url:'/home/"+saveCode+"'}";
  let lastMenuInfo = eval('(' + lastMenuInfoStr + ')');
  if (product||lastMenuInfo.url.indexOf(saveCode)==-1) {
    lastMenuInfo = { key: 'menu001', keyPath: ['menu001'], url: '/home/'+saveCode };
  }
  return lastMenuInfo;
}
/**
 * Higher-order component (HOC) to wrap restricted pages
 */
export function authHOC(BaseComponent) {
  class Restricted extends Component {
    isChecked = false;
    componentWillMount() {
      this.checkAuthentication(this.props);
    }
    componentWillReceiveProps(nextProps) {
      if (nextProps.location !== this.props.location) {
        this.checkAuthentication(nextProps);
      }
    }
    checkAuthentication(params) {
      const { history } = params;
      this.isChecked = validate(history);
    }
    render() {
      if (!this.isChecked) {
        return null;
      }
      else {
        return <BaseComponent {...this.props} />;
      }
    }
  }
  return withRouter(Restricted);
}
