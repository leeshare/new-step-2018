import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, Radio } from 'antd';

import ImageCutUpload from '@/components/ImageCutUpload';
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dataBind, dateFormat } from '@/utils';
const FormItem = Form.Item;
const TextArea = Input.TextArea;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const { TextAre, Search } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
};
import './index.less';
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class StudentView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            disabled: false,
            loading: false,
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
        this.props.getUserInfoByUserName(e.target.value).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.UserID != '') {
                this.setState({ disabled: true });
                message.error('当前学号已经存在!')
            }
            else {
                this.setState({ disabled: false });
            }
        })
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}学员信息`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" disabled={this.state.disabled} loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button> <Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
                let defaultBirthDate = dateFormat(new Date(), 'yyyy-MM-dd')
                block_content = (<div className="form-edit">
                    <Form>
                        {
                            this.props.editMode == 'Create' ?
                                <FormItem
                                    {...formItemLayout}
                                    label="学号"
                                    extra="输入学号后会自动检测改学号是否存在！"
                                >
                                    {getFieldDecorator('StudentNo', {
                                        initialValue: this.state.dataModel.StudentNo,
                                        rules: [{
                                            required: true, message: '请输入学号!',
                                        }],
                                    })(
                                        <Input onChange={(e) => { this.setState({ StudentNo: e.target.value }) }}
                                            placeholder="请输入学号"
                                            style={{ height: 32 }}
                                            onBlur={this.onSearchUserInfo}
                                        />
                                        )}
                                </FormItem> : ''
                        }
                        {
                            this.props.editMode == 'Create' ? <FormItem
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
                        {
                            this.props.editMode == 'Create' ? <FormItem
                                {...formItemLayout}
                                label="邮箱"
                                extra="邮箱须保证唯一"
                            >
                                {getFieldDecorator('Email', {
                                    initialValue: this.state.dataModel.Email || (this.state.StudentNo ? this.state.StudentNo + '@useabc.com' : ''),
                                    rules: [{
                                        required: true, message: '请输入邮箱!',
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
                            label="中文姓名"
                        >
                            {getFieldDecorator('ChineseName', {
                                initialValue: this.state.dataModel.ChineseName,
                                rules: [{
                                    required: true, message: '请输入中文姓名!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="头像"
                            extra="点击图片可以重新上传"
                            className='UploadUserIcon'
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
                            label="出生日期"
                        >
                            {getFieldDecorator('BirthDate', {
                                initialValue: this.state.dataModel.BirthDate || defaultBirthDate,
                                rules: [{
                                    required: false, message: '请设置出生日期!'
                                }, {
                                    pattern: /^(\d{4})\-(\d{2})\-(\d{2})$/, message: '日期格式有误,请参考:2017-01-01'
                                }]
                            })(
                                <Input placeholder="请设置出生日期" />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="性别"
                        >
                            {getFieldDecorator('Sex', {
                                initialValue: dataBind(this.state.dataModel.Sex),
                            }
                            )(
                                <RadioGroup size="large">
                                    <RadioButton value="1">男</RadioButton>
                                    <RadioButton value="2">女</RadioButton>
                                </RadioGroup>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="家长姓名"
                        >
                            {getFieldDecorator('ContactPerson', {
                                initialValue: this.state.dataModel.ContactPerson,
                                rules: [{
                                    required: false, message: '请输入家长姓名!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="联系电话"
                        >
                            {getFieldDecorator('ContactTelephone', {
                                initialValue: this.state.dataModel.ContactTelephone,
                                rules: [{
                                    required: false, message: '请输入联系电话!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="联系地址"
                        >
                            {getFieldDecorator('ContactAddress', {
                                initialValue: this.state.dataModel.ContactAddress,
                                rules: [{
                                    required: false, message: '请输入联系地址!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="所在学校"
                        >
                            {getFieldDecorator('SchoolName', {
                                initialValue: this.state.dataModel.SchoolName,
                                rules: [{
                                    required: false, message: '请输入所在学校!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="读几年级"
                        >
                            {getFieldDecorator('Grade', {
                                initialValue: dataBind(this.state.dataModel.Grade),
                                rules: [{
                                    required: false, message: '请设置读几年级!',
                                }]
                            })(
                                <Select>
                                    <Option value={''}>未设置</Option>
                                    {this.props.dic_Grades.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="备注"
                        >
                            {getFieldDecorator('Remark', {
                                initialValue: this.state.dataModel.Remark,
                                rules: [{
                                    required: false, message: '备注!',
                                }]
                            })(
                                <TextArea rows={10} />
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
                                <img style={{ width: 100, borderRadius: '50%' }} src={this.state.dataModel.Icon} />
                            </FormItem> : ''}
                        <FormItem
                            {...formItemLayout}
                            label="学号"
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
                            label="中文姓名"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.ChineseName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="邮箱"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.Email}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="性别"
                        >
                            <span className="ant-form-text" >{getDictionaryTitle(this.props.dic_SexTypes, this.state.dataModel.Sex)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="出生日期"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.BirthDate}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="家长姓名"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.ContactPerson}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="联系方式"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.ContactTelephone}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="联系地址"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.ContactAddress}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="就读学校"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.SchoolName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="读几年级"
                        >
                            <span className="ant-form-text" >{getDictionaryTitle(this.props.dic_Grades, this.state.dataModel.Grade)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='备注'
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.Remark) }}></span>
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

const WrappedStudentView = Form.create()(StudentView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedStudentView);