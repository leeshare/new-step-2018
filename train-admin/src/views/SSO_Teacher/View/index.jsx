import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, Radio, Checkbox } from 'antd';

import ImageCutUpload from '@/components/ImageCutUpload';
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dataBind, dateFormat } from '@/utils';
const FormItem = Form.Item;
const TextArea = Input.TextArea;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
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
class TeacherView extends React.Component {
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
                    //按钮点击后加装状态
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
                this.setState({ findUser: true });
                message.info('根据邮箱找到对应用户!')
                this.setState({dataModel:{...this.state.dataModel,...data}}); 
            }
            else {
                this.setState({ findUser: false });
            }
        })
    }
    //标题
    getTitle() {
        if (this.props.editMode == 'CourseAudit') {
            return '教师认证管理'
        }
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}教师信息`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" disabled={this.state.disabled} loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '保存')}</Button> <Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
    onCourseLevelsChange(item, values) {
        var FormCourseAuths = this.state.dataModel.FormCourseAuths || [];
        var find = FormCourseAuths.find(A => A.CourseSpecialty == item.value);
        if (find) {
            find.CourseLevels = values;
        }
        else {
            FormCourseAuths.push({ CourseSpecialty: item.value, CourseLevels: values })
        }
        this.state.dataModel.FormCourseAuths = FormCourseAuths;
        this.setState({ dataModel: this.state.dataModel })
    }
    onSelectedAllCourseLevels(item, checked) {
        var FormCourseAuths = this.state.dataModel.FormCourseAuths || [];
        var values = checked ? item.CourseLevels.map(A => A.value).join(',') : "";
        var find = FormCourseAuths.find(A => A.CourseSpecialty == item.value);
        if (find) {
            find.CourseLevels = values;
        }
        else {
            FormCourseAuths.push({ CourseSpecialty: item.value, CourseLevels: values })
        }
        this.state.dataModel.FormCourseAuths = FormCourseAuths;
        this.setState({ dataModel: this.state.dataModel })
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
                                    label="学校"
                                >
                                    {getFieldDecorator('FormOrganizationID', {
                                        rules: [
                                            {
                                                required: true, message: '请指定学校!',
                                            }],
                                    })(
                                        <Select>
                                            {
                                                this.props.dic_BranchOrganizations.map((item) => {
                                                    return <Option value={item.value}>{item.title}</Option>
                                                })
                                            }
                                        </Select>
                                        )}
                                </FormItem> : ''
                        }
                        {
                            this.props.editMode == 'Create' ?
                                <FormItem
                                    {...formItemLayout}
                                    label="邮箱"
                                    extra="邮箱须保证唯一，输入后会自动检测该邮箱是否存在！"
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
                                            placeholder="请输入邮箱"
                                            style={{ height: 32 }}
                                            onBlur={this.onSearchUserInfo}
                                        />
                                        )}
                                </FormItem> : ''
                        }
                        {
                            this.props.editMode == 'Create' && !this.state.findUser ? <FormItem
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
                            label="毕业院校"
                        >
                            {getFieldDecorator('GraduatedSchool', {
                                initialValue: this.state.dataModel.GraduatedSchool,
                                rules: [{
                                    required: false, message: '请输入毕业院校!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="学历"
                        >
                            {getFieldDecorator('Education', {
                                initialValue: this.state.dataModel.Education,
                                rules: [{
                                    required: false, message: '请输入学历!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="所学专业"
                        >
                            {getFieldDecorator('Specialty', {
                                initialValue: this.state.dataModel.Specialty,
                                rules: [{
                                    required: false, message: '请输入所学专业!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="证件号码"
                        >
                            {getFieldDecorator('IDCard', {
                                initialValue: this.state.dataModel.IDCard,
                                rules: [{
                                    required: false, message: '请输入证件号码!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="教师简介"
                        >
                            {getFieldDecorator('Description', {
                                initialValue: this.state.dataModel.Description,
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
                            label='认证课程'
                            className='ant-table'
                        >
                            <table>
                                <thead className="ant-table-thead">
                                    <tr>
                                        <th>课程</th>
                                        <th>课程级别</th>
                                        <th>授权日期</th>
                                    </tr>
                                </thead>
                                <tbody className="ant-table-tbody">
                                    {
                                        this.state.dataModel.AuthCourseList.map((item, index) => {
                                            var courseSpecialtyFind = this.props.dic_CourseSpecialtys.find(A => A.value == item.CourseSpecialty) || { title: '未知课程', CourseLevels: [] };
                                            var courseLevelFind = courseSpecialtyFind.CourseLevels.find(A => A.value == item.CourseLevel) || { title: '未知级别' };
                                            return <tr className='ant-table-row  ant-table-row-level-0'>
                                                <td>{courseSpecialtyFind.title}</td>
                                                <td>{courseLevelFind.title}</td>
                                                <td>{item.AuthDate}</td>
                                            </tr>
                                        })
                                    }
                                    <tr className='ant-table-row  ant-table-row-level-0'>
                                        <td></td>
                                        <td></td>
                                        <td style={{ fontWeight: 'bold', fontSize: '16px' }}>共计{this.state.dataModel.AuthCourseList.length}课程授权</td>
                                    </tr>
                                </tbody>
                            </table>
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
                            label="毕业学校"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.GraduatedSchool}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="学历"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.Education}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="所学专业"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.Specialty}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="证件号码"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.IDCard}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='教师简介'
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.Description) }}></span>
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
            case "CourseAuth":
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
                            label='认证课程'
                            className='ant-table'
                        >
                            <table>
                                <thead className="ant-table-thead">
                                    <tr>
                                        <th style={{ width: 160 }}>课程</th>
                                        <th>课程级别</th>
                                        <th style={{ width: 80 }}></th>
                                    </tr>
                                </thead>
                                <tbody className="ant-table-tbody">
                                    {
                                        this.props.dic_CourseSpecialtys.map((item, index) => {
                                            var ckGroupOptions = item.CourseLevels.map((A) => {
                                                return { label: A.title, value: A.value };
                                            });
                                            var userSelected = this.state.dataModel.FormCourseAuths && this.state.dataModel.FormCourseAuths.find(A => A.CourseSpecialty == item.value);
                                            var ckDefaultValues = userSelected ? (userSelected.CourseLevels) : this.state.dataModel.AuthCourseList.filter(A => A.CourseSpecialty == item.value).map(A => A.CourseLevel);
                                            return <tr className='ant-table-row  ant-table-row-level-0'>
                                                <td>{item.title}</td>
                                                <td>
                                                    <CheckboxGroup options={ckGroupOptions} value={ckDefaultValues} onChange={(values) => { this.onCourseLevelsChange(item, values) }} />
                                                </td>
                                                <td>
                                                    <Checkbox onChange={(e) => { this.onSelectedAllCourseLevels(item, e.target.checked) }}>全选</Checkbox>
                                                </td>
                                            </tr>
                                        })
                                    }
                                </tbody>
                            </table>
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

const WrappedStudentView = Form.create()(TeacherView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedStudentView);