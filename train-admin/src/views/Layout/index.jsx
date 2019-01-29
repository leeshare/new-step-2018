import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Layout, Affix, Row, Col } from 'antd';
import { Route, Redirect } from 'react-router-dom';

import { childRoutes } from '@/route'
import { authHOC, getUserLastMenuInfo } from '@/utils/auth'

import Header from '@/components/Header/index'
import Sidebar from '@/components/Sidebar/index'
import Footer from '@/components/Footer'
import { fetchProfile, logout } from '@/actions/auth';

import './index.less';


const { Content } = Layout;

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const { actions } = this.props;
    actions.fetchProfile();
  }

  render() {
    const { auth, navpath, actions } = this.props;
    let role_contexts = (auth.user && auth.user.role_contexts) || [];
    let findAppType = role_contexts.find(A => A.orgID == auth.user.currentOrgID);
    let skin_class='skin-green';
    const skin = (findAppType && findAppType.orgType) || -1;
    // switch (skin) {
    //   case 1:
    //     require('../../skin-blue.less');
    //     skin_class='skin-blue';
    //     break;
    //   case 2:
    //     require('../../skin-purple.less');
    //     skin_class='skin-purple';
    //     break;
    //   case 3:
    //     require('../../skin-orange.less');
    //     skin_class='skin-orange';
    //     break;
    //   case 0:
    //   default:
    //     require('../../skin-green.less');
    //      skin_class='skin-green';
    //     break;
    // }
    let lastMenuInfo = getUserLastMenuInfo();
    return (
      auth.user!=null && <Layout className="ant-layout-has-sider" id={skin_class}>
        <Sidebar profile={auth} />
        <Layout className="ant-layout-has-content">
          <Header profile={auth} logout={actions.logout} />
          <Content style={{ margin: '0 16px' }}>
            <div style={{ minHeight: 360, paddingTop: 20 }}>
              {/* <Redirect to={lastMenuInfo.url} /> */}
              {childRoutes.map((route, index) => (
                <Route key={index} path={route.path} component={authHOC(route.component)} exactly={route.exactly} />
              ))}
            </div>
          </Content>
          <Footer />
        </Layout>
      </Layout>
    );
  }
}

App.propTypes = {
  auth: PropTypes.object,
  navpath: PropTypes.array
};

const mapStateToProps = (state) => {
  const { auth, menu } = state;
  return {
    auth: auth ? auth : null,
    navpath: menu.navpath
  };
};

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators({ fetchProfile, logout }, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
