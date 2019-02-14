import React from 'react'
import PropTypes from 'prop-types'
import { Layout, Modal, Form, Input, Button, Row, Col, Icon, message } from 'antd'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';
import { login, getAdminLoginQRCode, testAdminLoginQRCode } from '../../actions/auth'
import { appName, copyright } from '@/api/env.js'
const FormItem = Form.Item;
const { Footer } = Layout;
import { YSI18n, getDictionaryTitle, timestampToTime, convertTextToHtml } from '@/utils';
import './index.less'

const propTypes = {
  user: PropTypes.object,
};

class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      showQRCodeLogin: false
    }
  }


  componentWillMount() {
    var _this = this;
    //提前获取二维码
    /*this.props.getAdminLoginQRCode().payload.promise.then(res => {
      if (res.error) {
        message.error(res.payload.data.message);
        return;
      }
      _this.setState({ QRCodeInfo: res.payload.data });
    })*/
  }

  testQRLoginTimer = () => {
    if (this.timer) {
      clearInterval(this.timer);
    }
    var _this = this;
    //定时检测是否扫描登录
    _this.timer = setInterval(() => {
      this.props.testAdminLoginQRCode(_this.state.QRCodeInfo.Code)
        .payload.promise.then(res => {
          if (res.error) {
            message.error(res.payload.data.message);
            return;
          }
          //如果检测到登录已经成功，则停止检测
          if (res.payload.data.TestOK) {
            clearInterval(_this.timer);
            message.loading(YSI18n.get('loginPending'), 2, () => {
              message.success(YSI18n.get('loginSuccess').replace('{realName}', res.payload.data.UserInfo.name));
            })
            this.props.history.replace('/');
          }
          //刷新二维码
          if (res.payload.data.RefreshLoginQRCode) {
            _this.componentWillMount();
          }
        })
    }, 3000)
  }
  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  onForget = () => {
    Modal.info({
      title: YSI18n.get('forget_password'),
      content: (
        <div>
          <p></p>
          <p dangerouslySetInnerHTML={{ __html: convertTextToHtml(YSI18n.get('forget_password_content')) }}></p>
        </div>
      ),
      onOk() { },
    });
  }

  onLogin = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          loading: true
        });
        const data = values;
        this.props.login(data.user, data.password).payload.promise.then(res => {
          window.localStorage.setItem('loginInfo', JSON.stringify({ username: data.user, password: data.password }))
          this.setState({
            loading: false
          });
          if (res.error) {
            message.error(res.payload.data.message);
            return;
          }
          message.success(YSI18n.get('loginSuccess').replace('{realName}', res.payload.data.realName));
          this.props.history.replace('/');
        }).catch(err => {
          this.setState({
            loading: false
          });
        })
      }
    });
  }

  onSwitchLogin = () => {
    if (!this.state.showQRCodeLogin) {
      this.testQRLoginTimer();
    }
    else {
      //停用计时器
      this.componentWillUnmount();
    }
    this.setState({ showQRCodeLogin: !this.state.showQRCodeLogin })
  }

  render() {
    const { getFieldDecorator } = this.props.form

    let loginInfoStr = window.localStorage.getItem('loginInfo');
    let formInfo = { username: '', password: '' };
    if (loginInfoStr != null) {
      formInfo = eval('(' + loginInfoStr + ')');
    }
    let block_login_content = null;
    if (!this.state.showQRCodeLogin) {
      block_login_content = <Form layout="horizontal" className="login-form">
        <h2 className="logo_wrap"><span className="logo_name">{YSI18n.get('acount_login')}</span></h2>
        <div className="input_wrap">

          <FormItem>
            {getFieldDecorator('user', {
              initialValue: formInfo.username, rules: [{
                required: true, message: YSI18n.get('account_empty'),
              }]
            })(
              <Input placeholder={YSI18n.get('account')} size='large' style={{ marginBottom: 10 }} />
              )}
          </FormItem>

          <FormItem>
            {getFieldDecorator('password', {
              initialValue: formInfo.password, rules: [{
                required: true, message: YSI18n.get('password_empty'),
              }]
            })(
              <Input type='password' placeholder={YSI18n.get('password')} size='large' style={{ marginBottom: 10 }} />
              )}
          </FormItem>
          <p>
            <Button className="btn-login" type='primary' size="large" loading={this.state.loading} onClick={this.onLogin}>{YSI18n.get('login')}</Button>
          </p>
          <div>
            {/*<a onClick={() => this.onSwitchLogin()} >{YSI18n.get('qrcode_login')}</a>*/}
            <a onClick={this.onForget} className='forget'>{YSI18n.get('forget_password_title')}</a>
          </div>
        </div>

      </Form>
    } else {
      /*block_login_content = <Form layout="horizontal" className="login-form">
        <h2 className="logo_wrap"><span className="logo_name">{YSI18n.get('qrcode_login_title')}</span></h2>
        <h3 style={{ textAlign: 'center', marginBottom: 18 }} dangerouslySetInnerHTML={{ __html: convertTextToHtml(YSI18n.get('qrcode_login_tips')) }}></h3>
        <div className='qrcodeImg'>{this.state.QRCodeInfo &&
          <img src={this.state.QRCodeInfo.QRImageUrl} style={{ width: '100%', height: '100%' }} />
        }</div>
        <div onClick={() => this.onSwitchLogin()}><a>{YSI18n.get('account_login_title')}</a></div>
      </Form>*/
    }

    let year = new Date().getFullYear();
    return (
      <div>
        <Row className="login-row" type="flex" justify="space-around" align="middle">
          <div className='dv_weblog' />
          <Col span="6" className="login-wrap">
            {block_login_content}
          </Col>
        </Row>
        <div className='version'>
          {copyright}
        </div>
      </div>
    )
  }
}

Login.propTypes = propTypes;

Login = Form.create()(Login);

function mapStateToProps(state) {
  return { user: state.auth };
}

function mapDispatchToProps(dispatch) {
  return {
    login: bindActionCreators(login, dispatch),
    getAdminLoginQRCode: bindActionCreators(getAdminLoginQRCode, dispatch),
    testAdminLoginQRCode: bindActionCreators(testAdminLoginQRCode, dispatch),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login))
