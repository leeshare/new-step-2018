import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, AutoComplete } from 'antd';
import moment from 'moment';

import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, covertValueToDecimalType } from '@/utils';
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
class TeachSignupPriceView extends React.Component {
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
        return `${op}定价`;
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
                            label="定价名称"
                        >
                            {getFieldDecorator('PriceName', {
                                initialValue: this.state.dataModel.PriceName,
                                rules: [{
                                    required: true, message: '请输入定价名称!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="价格"
                        >
                            {getFieldDecorator('Price', {
                                initialValue: (this.state.dataModel.Price || ''),
                                rules: [{
                                    required: true, message: '请设置价格!',
                                }]
                            })(
                                <InputNumber step={0.01} min={0.01} max={50000} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="课时数"
                        >
                            {getFieldDecorator('Periods', {
                                initialValue: (this.state.dataModel.Periods || ''),
                                rules: [{
                                    required: true, message: '请设置课时数!',
                                }]
                            })(
                                <InputNumber step={1} min={1} max={200} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="有效期（月）"
                        >
                            {getFieldDecorator('PeriodDuration', {
                                initialValue: (this.state.dataModel.PeriodDuration || ''),
                                rules: [{
                                    required: true, message: '请设置有效期!',
                                }]
                            })(
                                <InputNumber step={1} min={1} max={50} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="适用课程"
                        >
                            {getFieldDecorator('CourseSpecialty', {
                                initialValue: this.state.dataModel.CourseSpecialty,
                                rules: [{
                                    required: true, message: '请设置适用课程!',
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
                            label="适用班型"
                        >
                            {getFieldDecorator('ClassType', {
                                initialValue: this.state.dataModel.ClassType,
                                rules: [{
                                    required: true, message: '请设置适用班型!',
                                }],
                            })(
                                <Select >
                                    {this.props.dic_ClassTypes.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="备注"
                        >
                            {getFieldDecorator('Description', {
                                initialValue: this.state.dataModel.Description,
                                rules: [{
                                    required: false, message: '请录入备注信息!',
                                }]
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

const WrappedTeachSignupPriceView = Form.create()(TeachSignupPriceView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {

    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachSignupPriceView);