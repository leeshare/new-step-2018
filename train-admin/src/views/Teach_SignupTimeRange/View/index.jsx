import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, AutoComplete, Checkbox } from 'antd';
import moment from 'moment';

import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, covertValueToDecimalType, dataBind } from '@/utils';
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
class TeachSignupTimeRangeView extends React.Component {
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
        return `${op}时段`;
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
            case "Edit":
                block_content = (<div className="form-edit">
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="课程"
                        >
                            {getFieldDecorator('CourseSpecialty', {
                                initialValue: this.state.dataModel.CourseSpecialty,
                                rules: [{
                                    required: true, message: '请设置课程!',
                                }],
                            })(
                                <Select >
                                    {this.props.dic_CourseSpecialtys.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="时段类型"
                        >
                            {getFieldDecorator('IsSignup', {
                                initialValue: dataBind(this.state.dataModel.IsSignup),
                                rules: [{
                                    required: true, message: '请设置时段类型!',
                                }],
                            })(
                                <Select >
                                    {this.props.dic_TimeRangeTypes.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="时间段"
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
                            label="时间段别名"
                            extra="如:上午，下午，可以为空"
                        >
                            {getFieldDecorator('TimeRangeTitle', {
                                initialValue: this.state.dataModel.TimeRangeTitle,
                                rules: [{
                                    required: false, message: '请输入时间段别名!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="周课表"
                        >
                            <Row>
                                <Col span={3} className='center'>周一</Col><Col className='center' span={3}>周二</Col><Col className='center' span={3}>周三</Col><Col className='center' span={3}>周四</Col><Col className='center' span={3}>周五</Col><Col className='center' span={3}>周六</Col><Col span={3} className='center'>周日</Col>
                            </Row>
                            <Row>
                                {
                                    [1, 2, 3, 4, 5, 6, 0].map((item, index) => {
                                        return <Col span={3} className='center'><Checkbox checked={this.state.dataModel[`Week_${item}`] ? true : false} onChange={(val) => {
                                            this.onCheckChange(item, val.target.checked);
                                        }}></Checkbox></Col>
                                    })
                                }
                            </Row>
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
                            label="定价名称"
                        >
                            <span className="ant-form-text">{this.state.dataModel.PriceName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="课程"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_CourseSpecialtys, this.state.dataModel.CourseSpecialty)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="班型"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_ClassTypes, this.state.dataModel.ClassType)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="价格"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Price}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="课时数"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Periods}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="有效期"
                        >
                            <span className="ant-form-text">{this.state.dataModel.PeriodDuration}个月</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="备注"
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

const WrappedTeachSignupTimeRangeView = Form.create()(TeachSignupTimeRangeView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {

    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachSignupTimeRangeView);