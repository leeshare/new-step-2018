import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Modal, Layout, Row, Col, Icon,
  Badge, Menu, Dropdown, Avatar, Popover
} from 'antd'
import './index.less'
import { Link, withRouter } from 'react-router-dom'
const { Header } = Layout;
import { getAllMenu } from '../../actions/menu'
import { switchOrgContext } from '../../actions/auth'
import NavPath from '@/components/NavPath';
import ModalChangeUserInfoView from '@/views/My/ChangeUserInfo';
import ModalChangePasswordView from '@/views/My/ChangePassword';
class commonHeader extends React.Component {
  constructor() {
    super();
    this.state = { showChangePassword: false, showChangeUserInfo: false };
  }

  handleLogOut = () => {
    const { logout } = this.props
    logout().payload.promise.then(() => {
      this.props.history.replace('/login');
    });
  }
  handleSwitchContext = (item) => {
    this.setState({ currentOrgInfo: item });
    this.props.switchOrgContext(item.orgID);
    //切换身份后立即获取对应的功能菜单
    this.props.getAllMenu();
  }


  handleProfile = () => {
    this.setState({ showChangeUserInfo: true })
  }



  handlePassword = () => {
    this.setState({ showChangePassword: true })
  }

  render() {
    const { profile, navpath } = this.props

    let username = profile.user ? profile.user.name : '';
    let userIcon = profile.user ? profile.user.icon : '';

    //应用上下文切换
    let role_contexts = []//profile.user ? profile.user.role_contexts : [];
    let block_switchContextMenu = null;
    if (role_contexts.length > 0) {
      let block_menuItems = role_contexts.map((item) => {
        return (
          <Menu.Item key={item.orgID}>
            <a onClick={() => { this.handleSwitchContext(item) }}>{item.orgName}</a>
          </Menu.Item>
        );
      });
      block_switchContextMenu = (
        <Menu>
          {block_menuItems}
        </Menu>
      );
    }

    const menu = (
      <Menu>
        <Menu.Item>
          <a onClick={this.handleProfile}>个人信息</a>
        </Menu.Item>
        <Menu.Item>
          <a onClick={this.handlePassword}>修改密码</a>
        </Menu.Item>
        <Menu.Item>
          <a onClick={this.handleLogOut}>退出登录</a>
        </Menu.Item>
      </Menu>
    );

    const content = (
      <div>
        <p>Content</p>
        <p>Content</p>
        <p>Content</p>
        <p>Content</p>
        <p>Content</p>
      </div>
    );
    let block_switchContext = null;
    if (role_contexts.length > 1) {
      let currentOrgInfo = this.state.currentOrgInfo || role_contexts[0];
      block_switchContext = (
        // <Col span={3}>
        <Dropdown overlay={block_switchContextMenu}>
          <a className="ant-dropdown-link" style={{marginRight:20}} >
            {currentOrgInfo.orgName}<Icon type="down" />
          </a>
        </Dropdown>
        // </Col>
      );
    }
    return (
      <Header className='block_header'>
        <Row type="flex" justify="end" align="middle">
          {/* <Col span={3}>
            <Badge className="header-icon" count={5}>
              <Link to="/mailbox">
                <Icon type="mail" />
              </Link>
            </Badge>
            <Popover content={content} title="Title" trigger="click">
              <Badge className="header-icon" dot>
                <a href="#">
                  <Icon type="notification" />
                </a>
              </Badge>
            </Popover>
          </Col> */}
          <Col span={17}> <NavPath data={navpath} /></Col>
          <Col span={6} style={{ textAlign: 'right' }} pull={1}>
            {block_switchContext}
            <Dropdown overlay={menu}>
              <a className="ant-dropdown-link">
                <Avatar src={userIcon} style={{ verticalAlign: 'middle', marginRight: 13 }}>
                </Avatar><span style={{ fontSize: 15, color: '#333', marginRight: 10, verticalAlign: '-4%' }}>{username}</span> <Icon className="drop_down" type="caret-down" />
              </a>
            </Dropdown>
          </Col>

        </Row>
        {
          this.state.showChangePassword ?
            <ModalChangePasswordView onCancel={() => {
              this.setState({ showChangePassword: false });
            }} /> : ''}
        {
          this.state.showChangeUserInfo ?
            <ModalChangeUserInfoView onCancel={() => {
              this.setState({ showChangeUserInfo: false });
            }} /> : ''}
      </Header>
    )
  }
}
commonHeader.propTypes = {
  navpath: PropTypes.array
};
const mapStateToProps = (state) => {
  const { menu } = state;
  return {
    navpath: menu.navpath
  };
};

function mapDispatchToProps(dispatch) {
  return {
    getAllMenu: bindActionCreators(getAllMenu, dispatch),
    switchOrgContext: bindActionCreators(switchOrgContext, dispatch)
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(commonHeader))
