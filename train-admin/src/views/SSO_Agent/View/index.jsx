import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber } from 'antd';

import ImageUpload from '@/components/ImageUpload';
import { getDictionaryTitle, getViewEditModeTitle } from '@/utils';
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
class SSO_AgentView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
        };
    }

    componentWillMount() {

    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                this.props.viewCallback({ ...this.state.dataModel, ...values });//合并保存数据
            }
        });
    }
    onSearchUserInfo = (e) => {
        this.props.getUserInfoByUserName(e.target.value).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.UserID != '') {
                this.setState({ findUser: true });
                message.error('邮箱已经存在!')
            }
            else {
                this.setState({ findUser: false });
            }
        })
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}招生代理`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button> <Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (<div className="form-edit">
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="招生代理全称"
                        >
                            {getFieldDecorator('OrganizationName', {
                                initialValue: this.state.dataModel.OrganizationName,
                                rules: [{
                                    required: true, message: '请输入招生代理全称!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="招生代理简称"
                        >
                            {getFieldDecorator('OrganizationShortName', {
                                initialValue: this.state.dataModel.OrganizationShortName,
                                rules: [{
                                    required: true, message: '请输入招生代理简称!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="招生代理编码"
                            extra="格式例如：YS-BJ"
                        >
                            {getFieldDecorator('OrganizationCode', {
                                initialValue: this.state.dataModel.OrganizationCode,
                                rules: [{
                                    required: true, message: '请输入招生代理编码!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        {this.props.editMode == 'Create' && <FormItem
                            {...formItemLayout}
                            label="管理账号"
                            extra="邮箱格式，邮箱须保证唯一，输入后会自动检测该邮箱是否存在！"
                        >
                            {getFieldDecorator('Email', {
                                initialValue: this.state.dataModel.Email,
                                rules: [
                                    {
                                        type: 'email', message: '邮箱格式不正确!',
                                    },
                                    {
                                        required: true, message: '请输入邮箱!',
                                    }],
                            })(
                                <Input onChange={(e) => { this.setState({ Email: e.target.value }) }}
                                    placeholder="请输入管理账号!"
                                    style={{ height: 32 }}
                                    onBlur={this.onSearchUserInfo}
                                />
                                )}
                        </FormItem>
                        }
                        {this.props.editMode == 'Create' && <FormItem
                            {...formItemLayout}
                            label="密码"
                        >
                            {getFieldDecorator('Password', {
                                initialValue: this.state.dataModel.Password || '888888',
                                rules: [{
                                    required: true, message: '请输入密码!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        }
                        <FormItem
                            {...formItemLayout}
                            label="负责人"
                        >
                            {getFieldDecorator('ContactPerson', {
                                initialValue: this.state.dataModel.ContactPerson,
                                rules: [{
                                    required: true, message: '请输入负责人!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="联系电话"
                        >
                            {getFieldDecorator('ContactTelphone', {
                                initialValue: this.state.dataModel.ContactTelphone,
                                rules: [{
                                    required: false, message: '请输入联系电话!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        {this.renderBtnControl()}
                    </Form>
                </div>
                );
                break;
            case "View":
            case "Delete":
            case "Audit":
                block_content = (
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="招生代理编码"
                        >
                            <img style={{ width: 100 }} src={this.state.dataModel.OrganizationCode} />
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="招生代理简称"
                        >
                            <img style={{ width: 100 }} src={this.state.dataModel.OrganizationShortName} />
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="招生代理全称"
                        >
                            <span className="ant-form-text">{this.state.dataModel.OrganizationName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="管理账号"
                        >
                            <span className="ant-form-text">{this.state.dataModel.OrgUserInfo.username}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="负责人"
                        >
                            <span className="ant-form-text">{this.state.dataModel.ContactPerson}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="联系电话"
                        >
                            <span className="ant-form-text">{this.state.dataModel.ContactTelephone}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="状态"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_Status, this.state.dataModel.Status)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="创建信息"
                        >
                            <span className="ant-form-text">{this.state.dataModel.CreatedDate} by {this.state.dataModel.CreatedUserInfo.name}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="修改信息"
                        >
                            <span className="ant-form-text">{this.state.dataModel.UpdatedDate} by {this.state.dataModel.UpdatedUserInfo.name}</span>
                        </FormItem>
                        {this.renderBtnControl()}
                    </Form>
                );
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        return (
            <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
                {block_editModeView}
            </Card>
        );
    }
}

const WrappedSSO_AgentView = Form.create()(SSO_AgentView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedSSO_AgentView);