import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, AutoComplete, Checkbox } from 'antd';
import moment from 'moment';

import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, covertValueToDecimalType, dataBind, dateFormat } from '@/utils';
import EditableUserTagGroup from '@/components/EditableUserTagGroup';
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
};

import { smartInputSearchTeacherList } from '@/actions/admin';
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class TeachTeacherScheduleView extends React.Component {
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
                this.props.viewCallback({ ...this.state.dataModel, ...values, Price: covertValueToDecimalType(values.Price) });//合并保存数据
            }
        });
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}教师排课`;
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
    onCheckChange = (item, val) => {
        this.state.dataModel[`Week_${item}`] = val ? 1 : 0;
        this.setState({ dataModel: this.state.dataModel })
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
                block_content = (
                    <div className="form-edit">
                        <Form>
                            <FormItem
                                {...formItemLayout}
                                label="授课教师"
                            >
                                {getFieldDecorator('FormTeacher', {
                                    initialValue: [],
                                    rules: [{
                                        required: true, message: '请设置授课教师!',
                                    }]
                                })(
                                    <EditableUserTagGroup maxTags={10} smartInputSearchUserList={this.props.smartInputSearchTeacherList} />
                                    )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="班型"
                            >
                                {getFieldDecorator('ClassType', {
                                    rules: [{
                                        required: true, message: '请设置班型!',
                                    }]
                                })(
                                    <Select>
                                        {this.props.dic_ClassTypes.map((item) => {
                                            return <Option value={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="上课时区"
                            >
                                {getFieldDecorator('Timezone', {
                                    initialValue: this.state.dataModel.Timezone,
                                    rules: [{
                                        required: true, message: '请设置上课时区!',
                                    }]
                                })(
                                    <Select>
                                        {this.props.dic_Timezones.map((item) => {
                                            return <Option value={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="周几上课"
                            >
                                {getFieldDecorator('FormChooseWeek', {
                                    initialValue: this.state.dataModel.FormChooseWeek || [],
                                    rules: [{
                                        required: true, message: '请设置周几上课!',
                                    }]
                                })(
                                    <CheckboxGroup options={[
                                        { label: '周一', value: '1' },
                                        { label: '周二', value: '2' },
                                        { label: '周三', value: '3' },
                                        { label: '周四', value: '4' },
                                        { label: '周五', value: '5' },
                                        { label: '周六', value: '6' },
                                        { label: '周日', value: '0' },
                                    ]} />
                                    )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="起始日期"
                            >
                                {getFieldDecorator('FormWeekStartDate', {
                                    initialValue: this.state.dataModel.FormWeekStartDate || dateFormat(new Date(), 'yyyy-MM-dd'),
                                    rules: [{
                                        required: false, message: '请设置起始日期!'
                                    }, {
                                        pattern: /^(\d{4})\-(\d{2})\-(\d{2})$/, message: '日期格式有误,请参考:2017-01-01'
                                    }]
                                })(
                                    <Input placeholder="请设置起始日期" />
                                    )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="共几周"
                            >
                                {getFieldDecorator('FormRepeatWeeks', {
                                    initialValue: this.state.dataModel.FormRepeatWeeks || 1,
                                    rules: [{
                                        required: true, message: '请设置学习周数量!',
                                    }]
                                })(
                                    <InputNumber min={1} max={50} />
                                    )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="上课时间段"
                                extra="格式例如:18:30~17:30"
                            >
                                {getFieldDecorator('TimeRange', {
                                    initialValue: this.state.dataModel.TimeRange,
                                    rules: [{
                                        required: true, message: '请输入时间段!',
                                    },
                                    {
                                        pattern: /^(\d{2}):(\d{2})~(\d{2}):(\d{2})$/, message: '时间段格式有误'
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
            case "Edit":
                block_content = (<div className="form-edit">
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="所在时区"
                        >
                            {getFieldDecorator('Timezone', {
                                initialValue: this.state.dataModel.Timezone,
                                rules: [{
                                    required: true, message: '请设置所在时区!',
                                }],
                            })(
                                <Select >
                                    {this.props.dic_Timezones.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="排课日期"
                        >
                            {getFieldDecorator('ScheduleDate', {
                                initialValue: this.state.dataModel.ScheduleDate || dateFormat(new Date(), 'yyyy-MM-dd'),
                                rules: [{
                                    required: false, message: '请设置排课日期!'
                                }, {
                                    pattern: /^(\d{4})\-(\d{2})\-(\d{2})$/, message: '日期格式有误,请参考:2017-01-01'
                                }]
                            })(
                                <Input placeholder="请设置排课日期" />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="上课时间段"
                            extra="格式例如:18:30~17:30"
                        >
                            {getFieldDecorator('TimeRange', {
                                initialValue: this.state.dataModel.TimeRange,
                                rules: [{
                                    required: true, message: '请输入时间段!',
                                },
                                {
                                    pattern: /^(\d{2}):(\d{2})~(\d{2}):(\d{2})$/, message: '时间段格式有误'
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="班型"
                        >
                            {getFieldDecorator('ClassType', {
                                initialValue: dataBind(this.state.dataModel.ClassType),
                                rules: [{
                                    required: true, message: '请设置班型!',
                                }],
                            })(
                                <Select >
                                    {this.props.dic_ClassTypes.map((item) => {
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
            case "Audit":
                block_content = (
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="教师"
                        >
                            <span className="ant-form-text">{this.state.dataModel.TeacherInfo.chinese_name}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="所在时区"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_Timezones, this.state.dataModel.Timezone)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="排课日期"
                        >
                            <span className="ant-form-text">{this.state.dataModel.ScheduleDate}({getDictionaryTitle(this.props.dic_Weeks, this.state.dataModel.Week)})</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="上课时间段"
                        >
                            <span className="ant-form-text">{this.state.dataModel.TimeRange}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="班型"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_ClassTypes, this.state.dataModel.ClassType)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="备注"
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

const WrappedTeachTeacherScheduleView = Form.create()(TeachTeacherScheduleView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        smartInputSearchTeacherList: bindActionCreators(smartInputSearchTeacherList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachTeacherScheduleView);