import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, Tabs } from 'antd';
const TabPane = Tabs.TabPane;
import AppNotify from './AppNotify'
import EmailNotify from './EmailNotify'
class NotifyView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        };
    }

    componentWillMount() {
    }

    onCancel = () => {
        this.props.viewCallback();
    }

    //渲染，根据模式不同控制不同输出
    render() {
        let blockContent = <div className="card-container">
            <Tabs type="card">
                <TabPane tab={<span><Icon type="mobile" />APP消息</span>} key="1">
                    <AppNotify showDialog={true} recievers={this.props.recievers || []} />
                </TabPane>
                <TabPane tab={<span><Icon type="mail" />邮件消息</span>} key="2">
                    <EmailNotify showDialog={true} recievers={this.props.recievers || []} />
                </TabPane>
            </Tabs>
        </div>
        return (
            <Card title={'消息通知'} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
                {blockContent}
            </Card>
        );
    }
}
//表单组件 封装
const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(NotifyView);