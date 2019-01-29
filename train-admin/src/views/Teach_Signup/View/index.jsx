import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, Radio, TimePicker, Spin, message, Switch } from 'antd';
import moment from 'moment';
//import './index.less';
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dataBind, covertValueToDecimalType, dateFormat, getWeekTitle } from '@/utils';
import { getUserInfoByEmail, getUserInfoByMobile } from '@/actions/admin';
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const formItemLayout = {
    className: 'formItemLabel',
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

const formItemLayout2 = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

import ModalChooseSchedule from '@/views/Teach_TeacherSchedule/ModalChooseSchedule'

const dic_Countrys = [{ title: '美国、加拿大', value: '+1' }, { title: '中国', value: '+86' }];
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class TeachSignupView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            refund_dataModel: {},
            refundEditMode: '',//根据数据检测进入何种视图View，Edit
            refund_loading: true,
            selectedProduct: { code: '', value: '', title: '' },
        };
    }

    componentWillMount() {

    }
    onSearchUserInfo = (e) => {
        if (this.state.dataModel.FormAccountType == "1") {
            this.props.getUserInfoByEmail(e.target.value).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.UserID != '') {
                    this.setState({ findUser: true });
                    message.info('根据邮箱找到对应用户!')
                    this.state.dataModel.FormIsRegister = false;
                    this.state.dataModel.StudentID = data.UserID;
                    // this.state.dataModel.StudentInfo = {
                    //     gender: data.Sex,
                    //     email: data.Email,
                    //     name: data.RealName,
                    //     chinese_name: data.ChineseName,
                    //     birthday: data.BirthDate,
                    //     parent_telephone: data.ContactTelephone
                    // };

                    this.state.dataModel.FormRealName = data.RealName;
                    this.state.dataModel.FormChineseName = data.ChineseName;
                    this.state.dataModel.FormTelphone = data.ContactTelephone;
                    this.state.dataModel.FormBirthday = data.BirthDate;
                    this.state.dataModel.FormSex = data.Sex;

                    this.setState({ dataModel: this.state.dataModel });
                }
                else {
                    this.state.dataModel.FormIsRegister = true;
                    this.state.dataModel.StudentID = '';
                    this.state.dataModel.FormRealName = '';
                    this.state.dataModel.FormChineseName = '';
                    this.state.dataModel.FormTelphone = '';
                    this.state.dataModel.FormBirthday = '';
                    this.state.dataModel.FormSex = '';
                    this.setState({ findUser: false });
                    this.setState({ dataModel: this.state.dataModel });
                }
            })
        }
        else {
            this.props.getUserInfoByMobile(this.state.dataModel.FormCountry + e.target.value).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.UserID != '') {
                    this.setState({ findUser: true });
                    message.info('根据手机号找到对应用户!')
                    this.state.dataModel.FormIsRegister = false;
                    this.state.dataModel.StudentID = data.UserID;

                    this.state.dataModel.FormRealName = data.RealName;
                    this.state.dataModel.FormChineseName = data.ChineseName;
                    this.state.dataModel.FormTelphone = data.ContactTelephone != '' ? data.ContactTelephone : (this.state.dataModel.FormCountry + this.state.dataModel.FormMobile);
                    this.state.dataModel.FormBirthday = data.BirthDate;
                    this.state.dataModel.FormSex = data.Sex;
                    /*
                    this.state.dataModel.StudentInfo = {
                        gender: data.Sex,
                        email: data.Email,
                        name: data.RealName,
                        chinese_name: data.ChineseName,
                        birthday: data.BirthDate,
                        parent_telephone: data.ContactTelephone != '' ? data.ContactTelephone : this.state.dataModel.StudentInfo.parent_telephone
                    };
                    */
                    this.setState({ dataModel: this.state.dataModel });
                }
                else {
                    this.state.dataModel.FormIsRegister = true;
                    this.state.dataModel.StudentID = '';
                    this.state.dataModel.FormRealName = '';
                    this.state.dataModel.FormChineseName = '';
                    this.state.dataModel.FormTelphone = '';
                    this.state.dataModel.FormBirthday = '';
                    this.state.dataModel.FormSex = '';
                    this.setState({ findUser: false });
                    this.setState({ dataModel: this.state.dataModel });
                }
            })
        }
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        if (this.props.editMode == "Create" || this.props.editMode == "Edit") {//新增订单
            //表单验证后，合并数据提交
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    this.setState({ loading: true });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 3000);//合并保存数据
                    this.props.viewCallback({ ...this.state.dataModel, ...values, Location: this.props.default_location });
                }
            });
        }
        else if (this.props.editMode == "Cancel") {//取消订单
            //表单验证后，合并数据提交
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    Modal.confirm({
                        title: '你确认要取消该报名吗?',
                        content: '取消后不能恢复状态',
                        onOk: () => {
                            this.setState({ loading: true });
                            setTimeout(() => {
                                this.setState({ loading: false });
                            }, 3000);//合并保存数据
                            this.props.viewCallback({ ...this.state.dataModel, ...values, Status: 99 });//保存数据
                        },
                        onCancel: () => {
                            console.log('Cancel');
                        },
                    });
                }
            });
        }
        else if (this.props.editMode == "CustomerService") {//客户跟踪
            //表单验证后，合并数据提交
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    Modal.confirm({
                        title: '你确认要修改报名状态吗?',
                        content: '注意：报名状态不能后撤',
                        onOk: () => {
                            this.setState({ loading: true });
                            setTimeout(() => {
                                this.setState({ loading: false });
                            }, 3000);//合并保存数据
                            this.props.viewCallback({ ...this.state.dataModel, ...values });//保存数据
                        },
                        onCancel: () => {
                            console.log('Cancel');
                        },
                    });
                }
            });
        }
    }
    //标题
    getTitle() {
        if (this.props.editMode == 'Cancel') return '取消报名';
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}报名信息`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode == 'Create' || this.props.editMode == 'Edit') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" icon="save" onClick={this.onSubmit} loading={this.state.loading} >{getViewEditModeTitle(this.props.editMode, '保存')}</Button> <Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else if (this.props.editMode == 'Cancel' || this.props.editMode == 'CustomerService') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" icon="save" onClick={this.onSubmit} loading={this.state.loading} >{getViewEditModeTitle(this.props.editMode, '保存')}</Button> <Button icon="rollback" onClick={this.onCancel} >取消</Button>
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

    onAccountTypeChange = (e) => {
        this.state.dataModel.FormAccountType = e.target.value;
        this.setState({ dataModel: this.state.dataModel });
    }

    onCountryChange = (value) => {
        this.state.dataModel.FormCountry = value;
        this.setState({ dataModel: this.state.dataModel });
    }

    onCustomerServiceChangeStatus = (val) => {
        if (parseInt(val) == 30) {
            this.state.dataModel.FormIsCreateOrder = true;
            this.setState({ dataModel: this.state.dataModel });
        }
    }

    onScheduleChoosed = (item) => {
        let { selectedTimeRange, selectedWeekInfo, Timezone, TimezoneName } = item;
        this.state.dataModel.TimeRange = selectedTimeRange;
        this.state.dataModel.ScheduleDate = selectedWeekInfo.ScheduleDate;
        this.state.dataModel.Week = selectedWeekInfo.Week;
        this.state.dataModel.Timezone = Timezone;
        if (TimezoneName) {
            this.state.dataModel.TimezoneName = TimezoneName;
        }
        this.setState({ dataModel: this.state.dataModel, showChooseScheduleWindow: false });
    }
    onExperienceScheduleChoosed = (item) => {
        let { selectedTimeRange, selectedWeekInfo, Timezone, TimezoneName } = item;
        this.state.dataModel.FormExperienceTimeRange = selectedTimeRange;
        this.state.dataModel.FormExperienceScheduleDate = selectedWeekInfo.ScheduleDate;
        this.state.dataModel.FormExperienceWeek = selectedWeekInfo.Week;
        this.state.dataModel.FormExperienceTimezone = Timezone;
        if (TimezoneName) {
            this.state.dataModel.FormExperienceTimezoneName = TimezoneName;
        }
        this.setState({ dataModel: this.state.dataModel, showChooseScheduleWindowExperience: false });
    }
    //多种模式视图处理
    renderEditModeOfView() {
        console.log(this.state.dataModel)
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                const prefixSelector = getFieldDecorator('FormCountry', {
                    initialValue: dataBind(this.state.dataModel.FormCountry || '+1'),
                    rules: [
                        {
                            required: true, message: '请选择国家!',
                        }],
                })(
                    <Select style={{ width: 120 }} onChange={this.onCountryChange}>
                        {dic_Countrys.map((item, index) => {
                            return <Option value={item.value}>{item.title}</Option>;
                        })}
                    </Select>
                    );

                block_content = (<div className="form-edit">
                    <Form>
                        <Row type="flex" justify="center" >
                            {this.props.editMode == 'Create' &&
                                <Col span={12}><FormItem
                                    {...formItemLayout}
                                    label="账号类型"
                                    extra="可以使用邮箱或手机号作为登录账号"
                                >
                                    {getFieldDecorator('FormAccountType', {
                                        initialValue: dataBind(this.state.dataModel.FormAccountType || '1'),
                                        rules: [
                                            {
                                                required: true, message: '账号类型!',
                                            }],
                                    })(
                                        <RadioGroup size="large" onChange={this.onAccountTypeChange}>
                                            <Radio value="1">邮箱</Radio>
                                            <Radio value="2">手机号</Radio>
                                        </RadioGroup>
                                        )}
                                </FormItem></Col>
                            }
                            {this.props.editMode == 'Create'
                                && (!this.state.dataModel.FormAccountType || this.state.dataModel.FormAccountType == "1") &&
                                <Col span={12}><FormItem
                                    {...formItemLayout}
                                    label="邮箱"
                                    extra="须保证唯一，输入后会自动检测该邮箱是否存在！"
                                >
                                    {getFieldDecorator('FormEmail', {
                                        initialValue: this.state.dataModel.FormEmail,
                                        rules: [
                                            {
                                                type: 'email', message: '邮箱格式不正确!',
                                            },
                                            {
                                                required: true, message: '请输入邮箱!',
                                            }],
                                    })(
                                        <Input onChange={(e) => { this.setState({ FormEmail: e.target.value }) }}
                                            placeholder="请输入邮箱"
                                            style={{ height: 32 }}
                                            onBlur={this.onSearchUserInfo}
                                        />
                                        )}
                                </FormItem>
                                </Col>
                            }
                            {this.props.editMode == 'Create' && (this.state.dataModel.FormAccountType == "2") &&
                                <Col span={12}><FormItem
                                    {...formItemLayout}
                                    label="手机号"
                                    extra="须保证唯一，输入后会自动检测该手机号是否存在！"
                                >
                                    {getFieldDecorator('FormMobile', {
                                        initialValue: this.state.dataModel.FormMobile,
                                        rules: [
                                            {
                                                pattern: /^(\d{10,11})$/, message: '手机号格式不正确!'
                                            },
                                            {
                                                required: true, message: '请输入手机号!',
                                            }],
                                    })(
                                        <Input addonBefore={prefixSelector} onChange={(e) => {
                                            let value = e.target.value;
                                            //循环替换包含有国家前缀的如+86
                                            dic_Countrys.map((item) => {
                                                value = value.replace(item.value, '');
                                                //自动选择国家
                                                if (value != e.target.value) {
                                                    this.state.dataModel.FormCountry = item.value;
                                                }
                                            })
                                            let dataModel = { ...this.props.form.getFieldsValue(), ...this.state.dataModel };
                                            dataModel.FormMobile = value;
                                            dataModel.StudentInfo.parent_telephone = this.state.dataModel.FormCountry + value;
                                            this.setState({ dataModel });
                                            setTimeout(() => {
                                                this.props.form.resetFields();
                                            }, 500);
                                        }}
                                            placeholder="请输入手机号"
                                            style={{ height: 32, width: '100%' }}
                                            onBlur={this.onSearchUserInfo}
                                        />
                                        )}
                                </FormItem>
                                </Col>
                            }
                            {this.props.editMode == 'Edit' &&
                                <Col span={12}><FormItem
                                    {...formItemLayout}
                                    label="邮箱"
                                >
                                    {this.state.dataModel.StudentInfo.email}
                                </FormItem>
                                </Col>
                            }
                            {this.props.editMode == 'Edit' &&
                                <Col span={12}><FormItem
                                    {...formItemLayout}
                                    label="手机号"
                                >
                                    {this.state.dataModel.StudentInfo.mobile}
                                </FormItem>
                                </Col>
                            }
                            <Col span={12}><FormItem
                                {...formItemLayout}
                                label="英文名"
                            >
                                {getFieldDecorator('FormRealName', {
                                    initialValue: this.state.dataModel.FormRealName || '',
                                    rules: [{
                                        required: true, message: '请输入学生英文名!',
                                    }],
                                })(
                                    <Input />
                                    )}
                            </FormItem>
                            </Col>
                            <Col span={12}><FormItem
                                {...formItemLayout}
                                label="中文名"
                            >
                                {getFieldDecorator('FormChineseName', {
                                    initialValue: this.state.dataModel.FormChineseName || '',
                                    rules: [{
                                        required: true, message: '请输入中文名!',
                                    }],
                                })(
                                    <Input />
                                    )}
                            </FormItem>
                            </Col>
                            <Col span={12}><FormItem
                                {...formItemLayout}
                                label="出生日期"
                            >
                                {getFieldDecorator('FormBirthday', {
                                    initialValue: this.state.dataModel.FormBirthday || '',
                                    rules: [{
                                        required: false, message: '请设置出生日期!'
                                    }, {
                                        pattern: /^(\d{4})\-(\d{2})\-(\d{2})$/, message: '日期格式有误,请参考:2017-01-01'
                                    }]
                                })(
                                    <Input placeholder="请设置出生日期,格式:yyyy-mm-dd,例如：2017-01-01" />
                                    )}
                            </FormItem>
                            </Col>
                            <Col span={12}><FormItem
                                {...formItemLayout}
                                label="性别"
                            >
                                {getFieldDecorator('FormSex', {
                                    initialValue: dataBind(this.state.dataModel.FormSex || '1'),
                                }
                                )(
                                    <RadioGroup size="large">
                                        <Radio value="1">男</Radio>
                                        <Radio value="2">女</Radio>
                                    </RadioGroup>
                                    )}
                            </FormItem>
                            </Col>
                            <Col span={12}><FormItem
                                {...formItemLayout}
                                label="家长联系电话"
                            >
                                {getFieldDecorator('FormTelphone', {
                                    initialValue: this.state.dataModel.FormTelphone || '',
                                    rules: [{
                                        required: true, message: '请输入家长联系电话!',
                                    }],
                                })(
                                    <Input />
                                    )}
                            </FormItem>
                            </Col>
                            <Col span={12}><FormItem
                                {...formItemLayout}
                                label="现在上几年级"
                            >
                                {getFieldDecorator('UserRemark', {
                                    initialValue: this.state.dataModel.UserRemark || '',
                                    rules: [{
                                        required: false, message: '请输入现在上几年级!',
                                    }],
                                })(
                                    <Input />
                                    )}
                            </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...formItemLayout}
                                    label="报名课程"
                                >
                                    {getFieldDecorator('ProductID', {
                                        initialValue: dataBind(this.state.dataModel.ProductID),
                                        rules: [{
                                            required: true, message: '请选择报名课程!',
                                        }]
                                    })(
                                        <Select onChange={(val) => {
                                            var find = this.props.dic_Products.find(A => A.value == val) || { code: '' };
                                            let dataModel = { ...this.state.dataModel, ...this.props.form.getFieldsValue() };
                                            dataModel.ProductID = find.value;
                                            this.setState({ dataModel: dataModel, selectedProduct: find });
                                            setTimeout(() => {
                                                this.props.form.resetFields();
                                            }, 200);
                                        }} >
                                            <Option value=''>请选择报名课程</Option>
                                            {this.props.dic_Products.map((item) => {
                                                return <Option value={item.value}>{item.title}</Option>
                                            })}
                                        </Select>
                                        )}
                                </FormItem></Col>
                            <Col span={12}>
                                <FormItem
                                    {...formItemLayout}
                                    label="上课时间"
                                    extra="具体上课时间，客服在上课之前会再次沟通确认"
                                >
                                    {getFieldDecorator('TimeRange1', {
                                        rules: [{
                                            required: true,
                                            message: '请选择上课时段!',
                                            validator: (rule, value, callback) => {
                                                const { getFieldValue } = this.props.form
                                                if (!this.state.dataModel.ScheduleDate) {
                                                    callback('请选择上课时段')
                                                }
                                                else {
                                                    // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                                                    callback();
                                                }
                                            }
                                        }]
                                    })(
                                        <div className="ant-form-text" style={{ width: '100%', padding: '0px 8px', border: '1px solid rgb(217, 217, 217)', backgroundColor: 'white', borderRadius: '5px' }} onClick={() => {
                                            this.state.dataModel.ProductID && this.setState({ showChooseScheduleWindow: this.state.showChooseScheduleWindow || true })
                                        }}>
                                            {this.state.dataModel.ScheduleDate ? `${this.state.dataModel.ScheduleDate} ${getWeekTitle(this.state.dataModel.Week)} ${this.state.dataModel.TimeRange} ${this.state.dataModel.TimezoneName}` : '请您选择上课时段'}
                                        </div>
                                        )}
                                </FormItem></Col>
                            <Col span={12}>
                                <FormItem
                                    {...formItemLayout}
                                    label="是否参与试听"
                                    extra="如果是第一次报名，建议参与试听！"
                                >
                                    <Switch onChange={(checked) => {
                                        this.state.dataModel.FormExperienceEnable = checked;
                                        this.setState({ dataModel: this.state.dataModel });
                                    }} checkedChildren="是" unCheckedChildren="否" />
                                </FormItem></Col>
                            {
                                !this.state.dataModel.FormExperienceEnable &&
                                <Col span={12}></Col>
                            }
                            {
                                this.state.dataModel.FormExperienceEnable &&
                                <Col span={12}><FormItem
                                    {...formItemLayout}
                                    label="首次试听课时间"
                                    extra="具体上课时间,客服在上课之前会再次沟通确认"
                                >
                                    {getFieldDecorator('TimeRange2', {
                                        rules: [{
                                            required: this.state.dataModel.FormExperienceEnable,
                                            message: '请选择次试听课时间!',
                                            validator: (rule, value, callback) => {
                                                const { getFieldValue } = this.props.form
                                                if (!this.state.dataModel.FormExperienceScheduleDate) {
                                                    callback('请选择次试听课时间')
                                                }
                                                else {
                                                    // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                                                    callback();
                                                }
                                            }
                                        }]
                                    })(
                                        <div className="ant-form-text" style={{ width: '100%', padding: '0px 8px', border: '1px solid rgb(217, 217, 217)', backgroundColor: 'white', borderRadius: '5px' }} onClick={() => {
                                            this.state.dataModel.ProductID && this.setState({ showChooseScheduleWindowExperience: this.state.showChooseScheduleWindowExperience || true })
                                        }}>
                                            {this.state.dataModel.FormExperienceScheduleDate ? `${this.state.dataModel.FormExperienceScheduleDate} ${getWeekTitle(this.state.dataModel.FormExperienceWeek)} ${this.state.dataModel.FormExperienceTimeRange} ${this.state.dataModel.FormExperienceTimezoneName}` : '请您选择试听上课时段'}
                                        </div>
                                        )}
                                </FormItem></Col>
                            }

                            <Col span={12}>
                                <FormItem
                                    {...formItemLayout}
                                    label="是否选择报名价格"
                                    extra="选择后可以生成预付订单，学生登录优实学堂APP后，在我的订单中完成支付。"
                                >
                                    <Switch onChange={(checked) => {
                                        this.state.dataModel.FormIsCreateOrder = checked;
                                        this.setState({ dataModel: this.state.dataModel });
                                    }} checkedChildren="是" unCheckedChildren="否" />
                                </FormItem>
                            </Col>
                            {
                                !this.state.dataModel.FormIsCreateOrder &&
                                <Col span={12}></Col>
                            }
                            {
                                this.state.dataModel.FormIsCreateOrder &&
                                <Col span={12}><FormItem
                                    {...formItemLayout}
                                    label="价格"
                                    extra={this.state.selectedProduct.code == '' ? '请您先选择报名课程' : ''}
                                >
                                    {getFieldDecorator('FormPriceID', {
                                        initialValue: dataBind(this.state.dataModel.FormPriceID),
                                        rules: [{
                                            required: this.state.dataModel.FormIsCreateOrder, message: '请选择上课方式!',
                                        }]
                                    })(
                                        <RadioGroup>
                                            {/* <Option value=''>意向报名,后期缴费</Option> */}
                                            {this.props.dic_ProductPrices.filter(A => this.state.selectedProduct.code.indexOf(A.code) == 0).map((item) => {
                                                return <Radio value={item.value}>{item.title}</Radio>
                                            })}
                                        </RadioGroup>
                                        )}
                                </FormItem></Col>
                            }
                            {/* <FormItem
                            {...formItemLayout}
                            label="家长备注"
                        >
                            {getFieldDecorator('UserRemark', {
                                initialValue: this.state.dataModel.UserRemark,
                                rules: [{
                                    required: false, message: '家长备注!',
                                }]
                            })(
                                <TextArea rows={4} />
                                )}
                        </FormItem> */}
                            {
                                this.props.editMode != "Cancel" &&
                                <Col span={24}><FormItem
                                    {...formItemLayout}
                                    label="客服记录"
                                >
                                    {getFieldDecorator('Remark', {
                                        initialValue: this.state.dataModel.Remark,
                                        rules: [{
                                            required: false, message: '客服记录!',
                                        }]
                                    })(
                                        <TextArea rows={4} />
                                        )}
                                </FormItem></Col>
                            }
                            <Col span={24}> {this.renderBtnControl()}</Col>
                        </Row>
                    </Form>
                </div>
                );
                break;
            case "View":
            case "Cancel":
            case "CustomerService":
                block_content = (
                    <Form>
                        <Card title={this.props.editMode != "View" ? '报名信息' : ''} bordered={this.props.editMode != "View"} hoverable={false}>
                            <Row gutter={24}>
                                <Col span={8}>
                                    <FormItem
                                        {...formItemLayout2}
                                        label="邮箱"
                                    >
                                        <span className="ant-form-text" >{this.state.dataModel.StudentInfo.email}</span>
                                    </FormItem></Col>
                                <Col span={8}>
                                    <FormItem
                                        {...formItemLayout2}
                                        label="英文名"
                                    >
                                        <span className="ant-form-text" >{this.state.dataModel.StudentInfo.name}</span>
                                    </FormItem></Col>

                                <Col span={8}>
                                    <FormItem
                                        {...formItemLayout2}
                                        label="中文名"
                                    >
                                        <span className="ant-form-text" >{this.state.dataModel.StudentInfo.chinese_name}</span>
                                    </FormItem></Col>
                            </Row>
                            <Row gutter={24}>
                                <Col span={8}>
                                    <FormItem
                                        {...formItemLayout2}
                                        label="性别"
                                    >
                                        <span className="ant-form-text" >{this.state.dataModel.StudentInfo.gender == 1 ? '男' : '女'}</span>
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem
                                        {...formItemLayout2}
                                        label="年龄"
                                    >
                                        <span className="ant-form-text" >{this.state.dataModel.StudentInfo.age}</span>
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem
                                        {...formItemLayout2}
                                        label="联系方式"
                                    >
                                        <span className="ant-form-text" >{this.state.dataModel.StudentInfo.mobile} {this.state.dataModel.StudentInfo.parent_telephone}</span>
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={24}>
                                <Col span={8}>
                                    <FormItem
                                        {...formItemLayout2}
                                        label="报名课程"
                                    >
                                        <span className="ant-form-text">{this.state.dataModel.ProductInfo.productName}</span>
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem
                                        {...formItemLayout2}
                                        label="报名状态"
                                    >
                                        <span className="ant-form-text">{getDictionaryTitle(this.props.dic_TeachSignupStatus, this.state.dataModel.Status)}</span>
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem
                                        {...formItemLayout2}
                                        label="填报日期"
                                    >
                                        <span className="ant-form-text">{this.state.dataModel.SignupDate}</span>
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem
                                        {...formItemLayout2}
                                        label="报名上课时间"
                                    >
                                        <div className="ant-form-text">
                                            {`${this.state.dataModel.ScheduleDate}`} {`${getWeekTitle(this.state.dataModel.Week)}`} {`${this.state.dataModel.TimeRange}`}
                                            {`${this.state.dataModel.Location}`}
                                        </div>
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem
                                        {...formItemLayout2}
                                        label="所在时区"
                                    >
                                        <div className="ant-form-text">
                                            {`${this.state.dataModel.TimezoneName}`}
                                        </div>
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem
                                        {...formItemLayout2}
                                        label='报名备注'
                                    >
                                        <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.Remark) }}></span>
                                    </FormItem>
                                </Col>
                                {/* <Col span={8}>
                                    <FormItem
                                        {...formItemLayout}
                                        label='用户留言'
                                    >
                                        <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.UserRemark) }}></span>
                                    </FormItem>
                                </Col> */}

                            </Row>
                        </Card>
                        {
                            (this.props.editMode == "CustomerService" || this.props.editMode == "Cancel") && <Card style={{ marginTop: 20 }} title="客服跟踪">
                                <Row gutter={24}>
                                    {
                                        (this.props.editMode == "Cancel") &&
                                        <Col span={8}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="取消原因补充"
                                            >
                                                {getFieldDecorator('Remark', {
                                                    initialValue: '',
                                                    rules: [{
                                                        required: true, message: '请录入报名信息取消说明!',
                                                    }]
                                                })(
                                                    <TextArea rows={4} />
                                                    )}
                                            </FormItem>
                                        </Col>
                                    }
                                    {(this.props.editMode == "CustomerService") &&
                                        <Col span={24}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="报名状态"
                                                extra="客服跟进，修改报名状态"
                                            >
                                                {getFieldDecorator('Status', {
                                                    initialValue: '',
                                                    rules: [{
                                                        required: true, message: '请选择报名状态!',
                                                    }]
                                                })(
                                                    <Select onChange={this.onCustomerServiceChangeStatus}>
                                                        {this.props.dic_TeachSignupStatus.filter(A => parseInt(A.value) > this.state.dataModel.Status).map((item) => {
                                                            return <Option value={item.value}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                    )}
                                            </FormItem>
                                        </Col>
                                    }
                                    {(this.props.editMode == "CustomerService") &&
                                        <Col span={24}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="上课时段"
                                                extra="与家长沟通后可以修改"
                                            >
                                                <div className="ant-form-text" style={{ width: '100%', padding: '0px 8px', border: '1px solid rgb(217, 217, 217)', backgroundColor: 'white', borderRadius: '5px' }} onClick={() => {
                                                    this.setState({ showChooseScheduleWindow: this.state.showChooseScheduleWindow || true })
                                                }}>
                                                    {`${this.state.dataModel.ScheduleDate}`} {`${getWeekTitle(this.state.dataModel.Week)}`} {`${this.state.dataModel.TimeRange}`} {`${this.state.dataModel.TimezoneName}`}
                                                </div>
                                            </FormItem>
                                        </Col>
                                    }
                                    {
                                        this.props.editMode == "CustomerService" && this.state.dataModel.FormIsCreateOrder &&
                                        <Col span={24}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="报名定价"
                                                extra="选择后可以生成预付订单，学生登录优实学堂APP后，在我的订单中完成支付。"
                                            >
                                                {getFieldDecorator('FormPriceID', {
                                                    initialValue: dataBind(this.state.dataModel.FormPriceID),
                                                    rules: [{
                                                        required: true, message: '请选择缴费!',
                                                    }]
                                                })(
                                                    <Select>
                                                        {this.props.dic_ProductPrices.filter(A => A.code == `${this.state.dataModel.ProductInfo.courseSpecialty}_${this.state.dataModel.ProductInfo.classType}`).map((item) => {
                                                            return <Option value={item.value}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                    )}
                                            </FormItem>
                                        </Col>
                                    }
                                    {(this.props.editMode == "CustomerService") &&
                                        <Col span={24}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="学生年龄"
                                            >
                                                {getFieldDecorator('FormAge', {
                                                    initialValue: this.state.dataModel.StudentInfo.age,
                                                    rules: [{
                                                        required: false, message: '请录入学生年龄!',
                                                    }]
                                                })(
                                                    <Select>
                                                        {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((item) => {
                                                            return <Option value={`${item}`}>{item}岁</Option>
                                                        })}
                                                    </Select>
                                                    )}
                                            </FormItem>
                                        </Col>
                                    }
                                    {(this.props.editMode == "CustomerService") &&
                                        <Col span={24}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="学生级别"
                                            >
                                                {getFieldDecorator('CourseLevel', {
                                                    initialValue: this.state.dataModel.CourseLevel,
                                                    rules: [{
                                                        required: false, message: '请录入学生级别!',
                                                    }]
                                                })(
                                                    <Input />
                                                    )}
                                            </FormItem>
                                        </Col>
                                    }
                                    {(this.props.editMode == "CustomerService") &&
                                        <Col span={24}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="客服记录"
                                            >
                                                {getFieldDecorator('Remark', {
                                                    initialValue: '',
                                                    rules: [{
                                                        required: true, message: '请录入跟客户沟通后的信息!',
                                                    }]
                                                })(
                                                    <TextArea rows={4} />
                                                    )}
                                            </FormItem>
                                        </Col>
                                    }
                                    {/* {(this.props.editMode == "CustomerService") &&
                                        <Col span={24}><FormItem
                                            {...formItemLayout}
                                            label="家长备注"
                                        >
                                            {getFieldDecorator('UserRemark', {
                                                initialValue: this.state.dataModel.UserRemark,
                                                rules: [{
                                                    required: false, message: '请录入家长备注信息!',
                                                }]
                                            })(
                                                <TextArea rows={4} />
                                                )}
                                        </FormItem>
                                        </Col>
                                    } */}
                                </Row>
                            </Card>
                        }
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
                <Modal width={600}
                    title="选择上课时段"
                    wrapClassName="vertical-center-modal"
                    visible={this.state.showChooseScheduleWindow}
                    onOk={() => {
                        this.setState({ showChooseScheduleWindow: false });
                    }}
                    onCancel={() => {
                        this.setState({ showChooseScheduleWindow: false });
                    }}
                    footer={null}
                >
                    <ModalChooseSchedule key={this.state.dataModel.ProductID || '1'} ProductID={this.state.dataModel.ProductID} IsExperience={false} Timezone={this.state.dataModel.Timezone} callback={this.onScheduleChoosed} />
                </Modal>
                <Modal width={600}
                    title="选择上课时段"
                    wrapClassName="vertical-center-modal"
                    visible={this.state.showChooseScheduleWindowExperience}
                    onOk={() => {
                        this.setState({ showChooseScheduleWindowExperience: false });
                    }}
                    onCancel={() => {
                        this.setState({ showChooseScheduleWindowExperience: false });
                    }}
                    footer={null}
                >
                    <ModalChooseSchedule key={`Experience_${this.state.dataModel.ProductID || '1'}`} ProductID={this.state.dataModel.ProductID} IsExperience={true} Timezone={this.state.dataModel.Timezone} callback={this.onExperienceScheduleChoosed} />
                </Modal>
            </Card>
        );
    }
}

const WrappedTeachSignupView = Form.create()(TeachSignupView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        getUserInfoByEmail: bindActionCreators(getUserInfoByEmail, dispatch),
        getUserInfoByMobile: bindActionCreators(getUserInfoByMobile, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachSignupView);