import React from 'react'
import PropTypes from 'prop-types'
import { withRouter, matchPath } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Layout, Menu, Icon, Row, Col } from 'antd'
import { Link } from 'react-router-dom'
import { getAllMenu, updateNavPath, recordUserFunClick, switchMenuCollapse } from '@/actions/menu'
import { appName, extendAllMenus } from '@/api/env.js'

import { authHOC, getUserLastMenuInfo } from '@/utils/auth';

const loginImage = require('../../assets/logo.png');

const SubMenu = Menu.SubMenu

import './index.less'

const defaultProps = {
  items: []
}

const propTypes = {
  items: PropTypes.array
}

const { Sider } = Layout;

const isActive = (path, history) => {
  return matchPath(path, {
    path: history.location.pathname,
    exact: true,
    strict: false
  })
}

class Sidebar extends React.Component {
  constructor(props) {
    super(props)
    this.lastMenuInfo = getUserLastMenuInfo();

    this.state = {
      selectedSub: this.lastMenuInfo.keyPath[0],
      openKey: this.lastMenuInfo.keyPath[0],
      activeKey: this.lastMenuInfo.key,
      // collapsed: false,
      // mode: 'inline',
    };
  }
  toggle = () => {
    // this.setState({
    //   collapsed: !this.state.collapsed,
    //   mode: !this.state.collapsed ? 'vertical' : 'inline',
    // });
    this.props.switchMenuCollapse();
  }

  componentWillMount() {
    this.props.getAllMenu().payload.promise.then((response) => {
      this.props.updateNavPath(this.lastMenuInfo.keyPath.sort((a, b) => { return (a.length > b.length) ? -1 : 1; }), this.lastMenuInfo.key);
    })
  }

  menuClickHandle = (item) => {
    this.setState({
      activeKey: item.key
    })
    let skey = "";
    if ((item.key).indexOf('-') != -1 && (item.key).indexOf('menu') != -1) {
      skey = (item.key).substring(0, (item.key).indexOf('-'))
      skey = skey.replace("menu", "sub");
    }
    this.setState({ selectedSub: skey });
    this.props.updateNavPath(item.keyPath, item.key)
    setTimeout(() => {
      this.props.recordUserFunClick({ key: item.key, keyPath: item.keyPath });
      window.scrollTo(0, 0);
    }, 500);
  }

  render() {
    const { items, updateNavPath, history } = this.props
    let { activeKey, openKey } = this.state
    let defaultOpenKeys = [];
    if (items.length <= extendAllMenus) {
      items.map((item) => {
        defaultOpenKeys.push(`sub${item.key}`);
      })
    }
    else {
      defaultOpenKeys = [this.state.openKey]
    }
    const _menuProcess = (nodes, pkey) => {

      return Array.isArray(nodes) && nodes.map((item, i) => {
        const menu = _menuProcess(item.child, item.key);
        if (item.url && isActive(item.url, history)) {
          activeKey = 'menu' + item.key
          openKey = 'sub' + pkey
          //this.props.updateNavPath([activeKey, openKey], activeKey)
        }

        if (menu.length > 0) {
          return (item.visible && <SubMenu
              key={'sub' + item.key}
              className={[item.child.length === 1 ? 'dot ' : ' ', this.state.selectedSub === 'sub' + item.key ? ' highlight' : ' ']}
              title={<span><Icon type={item.icon} theme="outlined" twoToneColor="#FFF"/><span className="nav-text">{item.name}</span></span>}
          >
            {menu}
          </SubMenu>
          )
        } else {
          return (item.visible && <Menu.Item
              key={'menu' + item.key}
              className={'menu' + item.key}
            >
              {item.url ? <Link to={item.url}>
                  {item.icon && <Icon type={item.icon} theme="outlined" twoToneColor="#FFF"/>}
                  <span>{item.name}</span>
                </Link> :
                <span>{item.icon && <Icon type={item.icon} theme="outlined" twoToneColor="#FFF"/>}{item.name}</span>
              }
            </Menu.Item>
          )
        }
      });
    }
    const menu = _menuProcess(items);
    let userImage = '';
    let orgName = ''//this.props.auth.user.role_contexts[0].orgName;
    let shortOrgName = ''//orgName.substring(0, 2);
    document.title = orgName + '-' + appName
    if (this.props.profile.user != null) {
      userImage = this.props.profile.user.icon;
    }
    var mode = this.props.menuCollapsed ? 'vertical' : 'inline';
    return (
      <Sider
        width={218}
        trigger={null}
        collapsible
        collapsed={this.props.menuCollapsed}
      //onCollapse={this.onCollapse}
      >
        <div className="ant-layout-logo">
          {/* <img className='ant-layout-log-image' src={loginImage}/> */}
          {!this.props.menuCollapsed ? <span>{orgName}</span> : shortOrgName}
        </div>
        {this.props.items.length > 0 ? <Menu
          mode={mode} theme="dark"
          selectedKeys={[activeKey]}
          defaultOpenKeys={defaultOpenKeys}
          onClick={this.menuClickHandle}

          inlineCollapsed={this.props.menuCollapsed}
        >
          {menu}
        </Menu> : ''}
        <div className="sider-trigger" onClick={this.toggle}>
          <Icon
            className="trigger"
            type={this.props.menuCollapsed ? 'menu-unfold' : 'menu-fold'}

          />
        </div>
      </Sider>
    )
  }
}

Sidebar.propTypes = propTypes;
Sidebar.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    items: state.menu.items,
    menuCollapsed: state.menu.menuCollapsed,
    auth: state.auth,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getAllMenu: bindActionCreators(getAllMenu, dispatch),
    updateNavPath: bindActionCreators(updateNavPath, dispatch),
    recordUserFunClick: bindActionCreators(recordUserFunClick, dispatch),
    switchMenuCollapse: bindActionCreators(switchMenuCollapse, dispatch),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sidebar))
