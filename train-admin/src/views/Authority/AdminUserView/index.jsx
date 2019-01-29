import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber } from 'antd';

import ImageCutUpload from '@/components/ImageCutUpload';
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml } from '@/utils';
import './index.less';
const FormItem = Form.Item;
const { TextAre, Search } = Input;
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
class AdminUserView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
        };
    }

    componentWillMount() {

    }
    onPlayAudio(audioUrl) {
        this.refs.audioPlayer.play(audioUrl);
    }

    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        if (this.props.editMode == "Delete") {
            Modal.confirm({
                title: '你确认要删除该操作人员吗?',
                content: '请确认',
                onOk: () => {
                    this.props.viewCallback(this.state.dataModel);//保存数据
                },
                onCancel: () => {
                    console.log('Cancel');
                },
            });
        }
        else {
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
    }
    onSearchUserInfo = (e) => {
        // this.props.form.validateFields((err, values) => {
        //     console.log(err);
        //     if (err && !err.Email) {

        //     }
        // });
        this.props.getUserInfoByEmail(e.target.value).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.UserID == '') {data.RealName=''; message.info('账号不存，请补充信息!'); }
            this.setState({ dataModel: { ...this.state.dataModel, ...data } })
        })
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}操作人员`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" icon="save" loading={this.state.loading} onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button> <Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
                let roles = this.state.dataModel.Roles || [];
                let roleIDs = [];
                roles.map((role) => {
                    roleIDs.push(role.RoleID.toLocaleLowerCase());
                });
                block_content = (<div className="form-edit">
                    <Form>
                        {
                            this.props.editMode == 'Create' ?
                                <FormItem
                                    {...formItemLayout}
                                    label="邮箱"
                                    extra="邮箱将作为登录账户，须保证唯一，输入后会自动检测该邮箱是否存在！"
                                >
                                    {getFieldDecorator('Email', {
                                        initialValue: '',
                                        rules: [
                                            {
                                                type: 'email', message: '邮箱格式不正确!',
                                            },
                                            {
                                                required: true, message: '请输入邮箱!',
                                            }],
                                    })(
                                        <Input
                                            placeholder="请输入邮箱"
                                            style={{ height: 32 }}
                                            onBlur={this.onSearchUserInfo}
                                        />
                                        )}
                                </FormItem> : ''
                        }
                        {
                            this.props.editMode == 'Create' && !this.state.dataModel.UserID ? <FormItem
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
                            </FormItem> : ''
                        }
                        <FormItem
                            {...formItemLayout}
                            label="姓名"
                        >
                            {getFieldDecorator('RealName', {
                                initialValue: this.state.dataModel.RealName,
                                rules: [{
                                    required: true, message: '请输入姓名!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="头像"
                            extra="点击图片可以重新上传"
                        >
                            {getFieldDecorator('FormImagePath', {
                                initialValue: this.state.dataModel.Icon,
                            }
                            )(
                                <ImageCutUpload width={300} height={300} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="用户权限"
                        >
                            {getFieldDecorator('Roles', {
                                initialValue: roleIDs,
                                rules: [{
                                    required: true, message: '请设定用户权限!',
                                }],
                            })(
                                <Select mode={'multiple'}>
                                    {this.props.dic_Roles.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        {this.renderBtnControl()}
                    </Form>
                </div>
                );
                break;
            case "View":
            case "Delete":
                block_content = (
                    <Form>
                        {this.state.dataModel.SceneImage != '' ?
                            <FormItem
                                {...formItemLayout}
                                label="头像"
                            >
                                <img style={{ width: 100, height: 100 }} src={this.state.dataModel.Icon} />
                            </FormItem> : ''}
                        <FormItem
                            {...formItemLayout}
                            label="账号"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.UserName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="姓名"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.RealName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="邮箱"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.Email}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="用户权限"
                        >
                            {
                                this.state.dataModel.Roles.map((role) => {
                                    return <span className="ant-form-text" style={{ paddingRight: 10 }} >{role.RoleName}</span>
                                })
                            }
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

const WrappedAdminUserView = Form.create()(AdminUserView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAdminUserView);