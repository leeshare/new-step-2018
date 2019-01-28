import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import configureStore from './store/configureStore';
import Root from './containers/Root';
import './index.less';
import { LocaleProvider } from 'antd';
//多语言环境
import LocaleContext from './locale/index';


const store = configureStore();


render(
  <LocaleProvider locale={LocaleContext.chooseLocale()}>
    <AppContainer>
      <Root
        store={store}
      />
    </AppContainer>
  </LocaleProvider>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const RootContainer = require('./containers/Root');
    render(
      <LocaleProvider locale={LocaleContext.chooseLocale()}>
        <AppContainer>
          <RootContainer
            store={store}
          />
        </AppContainer>
      </LocaleProvider>,
      document.getElementById('root')
    );
  });
}
