import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, message } from 'antd';
import moment from 'moment';

import ImageUpload from '@/components/ImageUpload';
import EditableUserTagGroup from '@/components/EditableUserTagGroup';
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dateFormat, dataBind } from '@/utils';
import { smartInputSearchUserList, adminSendEmailNotify } from '@/actions/admin';

import RichTextEditor from '@/components/RichTextEditor';

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
class EmailNotifyView extends React.Component {
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
            content: '消息一经发送，邮箱将收到消息通知。',
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
                        this.props.adminSendEmailNotify(values).payload.promise.then((response) => {
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
        return `邮件消息通知`;
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
                    label="收件人"
                    extra="可一次添加多个"
                >
                    {getFieldDecorator('FormStudent', {
                        initialValue: this.state.recievers,
                        rules: [{
                            required: true, message: '至少设置一个接收人!',
                        }]
                    })(
                        <EditableUserTagGroup maxTags={100} showEmail={true} smartInputSearchUserList={this.props.smartInputSearchUserList} />
                        )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="邮件标题"
                >
                    {getFieldDecorator('Title', {
                        initialValue: '',
                        rules: [{
                            required: true, message: '请输入邮件标题!',
                        }]
                    })(
                        <Input />
                        )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="邮件内容"
                >
                    {getFieldDecorator('Body', {
                        initialValue: '',
                        rules: [{
                            required: true, message: '请输入邮件内容!',
                        }]
                    })(
                        <RichTextEditor/>
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

const WrappedImagePackageView = Form.create()(EmailNotifyView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        smartInputSearchUserList: bindActionCreators(smartInputSearchUserList, dispatch),
        adminSendEmailNotify: bindActionCreators(adminSendEmailNotify, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedImagePackageView);