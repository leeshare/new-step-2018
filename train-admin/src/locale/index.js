import { getLocale } from '../api/env';
//语言包导入
import zh from './zh';
import en from './en';

//支持的语言包集合
const supportLocales = [zh, en];
const chooseLocale = function () {
  let currentLocale = getLocale();
  if (currentLocale.indexOf('zh') != -1) {
    return zh;
  }
  else if (currentLocale.indexOf('en') != -1) {
    return en;
  }
  return zh;//默认
}
export default {
  supportLocales,
  chooseLocale,
};