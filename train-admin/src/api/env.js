'use strict';

module.exports = {
    //serverURL: '/API-1.0',
    //serverURL: 'http://manage-test.shenmo.com/API-1.0',
    serverURL: 'http://localhost:8084/api',
    product: false,//false=开发模式
    extendAllMenus: 4,//菜单过少全部展开
    appName: (window.Global_AppName || '培训教育'),
    copyright: (window.Global_Copyright || `bj 版权所有 © ${new Date().getFullYear()} org.cn`),
    getToken: function () {
        //在请求发送之前做一些事
        var token = window.localStorage.getItem('token') || '';
        return token;
    },
    //获取当前用户语言环境
    getLocale: function () {
        var lang = navigator.language || navigator.userLanguage;//常规浏览器语言和IE浏览器
        //lang = lang.substr(0, 2);//截取lang前2位字符
        //return 'en';
        return lang;
    }
};
