import React from 'react';
import I18n from 'i18n-js'
import { getLocale } from '../api/env';

//ant-design 多语言包环境配置
import LocaleContext from '../locale/index';

I18n.fallbacks = true;
var translations = {};
//整合业务多语言包
LocaleContext.supportLocales.map((item) => {
    var locale = item.locale;
    var app = item.App;
    eval(`(translations.${locale}=app)`)
});
I18n.translations = translations;
export default class YSI18n extends React.Component {
    static get(name) {
        I18n.locale = getLocale() || 'zh';
        return I18n.t(name, { defaultValue: name });
    }
};
