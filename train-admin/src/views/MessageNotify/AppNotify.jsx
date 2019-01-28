import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker,message } from 'antd';
import moment from 'moment';

import ImageUpload from '@/components/ImageUpload';
import EditableUserTagGroup from '@/components/EditableUserTagGroup';
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dateFormat, dataBind } from '@/utils';
import { smartInputSearchUserList, adminSendAppNotify } from '@/actions/admin';
const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class AppNotifyView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            recievers: props.recievers || [],//数据模型
            showDialog: props.showDialog || false,//是否以对话框方式显示
        };
    }

    componentWillMount() {

    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        Modal.confirm({
            title: '你确认要立即发送消息吗?',
            content: '消息一经发送，APP将收到消息通知。',
            onOk: () => {
                //表单验证后，合并数据提交
                this.props.form.validateFields((err, values) => {
                    if (!err) {
                        this.setState({ loading: true });
                        setTimeout(() => {
                            this.setState({ loading: false });
                        }, 3000);//合并保存数据
                        //,UTCBeginTime:utcBeginTime 
                        //提交
                        this.props.adminSendAppNotify(values).payload.promise.then((response) => {
                            let data = response.payload.data;
                            if (data.result === false) {
                                message.error(data.message);
                            }
                            else {
                                message.info("消息发送成功!");
                            }
                        })
                    }
                });
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
    }
    //标题
    getTitle() {
        return `App消息通知`;
    }
    //表单按钮处理
    renderBtnControl() {
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
        >
            <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>发送</Button> <Button icon="rollback" onClick={this.onCancel} >取消</Button>
        </FormItem>
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        block_content = (<div className="form-edit">
            <Form >
                <FormItem
                    {...formItemLayout}
                    label="接收者"
                    extra="可一次添加多个"
                >
                    {getFieldDecorator('FormStudent', {
                        initialValue: this.state.recievers,
                        rules: [{
                            required: true, message: '至少设置一个接收人!',
                        }]
                    })(
                        <EditableUserTagGroup maxTags={100} smartInputSearchUserList={this.props.smartInputSearchUserList} />
                        )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="消息内容"
                >
                    {getFieldDecorator('Content', {
                        initialValue: '',
                        rules: [{
                            required: true, message: '请您输入消息内容!',
                        }]
                    })(
                        <TextArea rows={5} style={{height:350}}/>
                        )}
                </FormItem>
                {this.renderBtnControl()}
            </Form>
        </div>
        );
        return block_content;
    }

    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        if (this.state.showDialog) {
            return block_editModeView;
        }
        else {
            return (
                <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
                    {block_editModeView}
                </Card>
            );
        }
    }
}

const WrappedImagePackageView = Form.create()(AppNotifyView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        smartInputSearchUserList: bindActionCreators(smartInputSearchUserList, dispatch),
        adminSendAppNotify:bindActionCreators(adminSendAppNotify, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedImagePackageView);