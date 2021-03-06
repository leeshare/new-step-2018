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
class TeachSignupBatchView extends React.Component {
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
        return `${op}报名批次`;
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
                            label="报名课程"
                        >
                            {getFieldDecorator('ProductID', {
                                initialValue: this.state.dataModel.ProductID || '',
                                rules: [{
                                    required: true, message: '请设置报名课程!',
                                }],
                            })(
                                <Select >
                                    {this.props.dic_Products.filter(A => A.status > 0).map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="报名批次"
                        >
                            {getFieldDecorator('Title', {
                                initialValue: dataBind(this.state.dataModel.Title || ''),
                                rules: [{
                                    required: true, message: '请设置报名批次!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="最大报名人数"
                            extra="0表示不限"
                        >
                            {getFieldDecorator('TimeRangeTitle', {
                                initialValue: this.state.dataModel.MaxStudents || 0,
                                rules: [{
                                    required: true, message: '请输入最大报名人数!',
                                }],
                            })(
                                <InputNumber min={0} max={200} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="批次描述"
                        >
                            {getFieldDecorator('Description', {
                                initialValue: this.state.dataModel.Description,
                                rules: [{
                                    required: false, message: '请录入班级描述!',
                                }]
                            })(
                                <TextArea rows={4} />
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
                            label="报名课程"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_Products, this.state.dataModel.ProductID)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="报名批次"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Title}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="最大报名人数"
                        >
                            <span className="ant-form-text">{this.state.dataModel.MaxStudents}</span>
                        </FormItem>
                         <FormItem
                            {...formItemLayout}
                            label='批次描述'
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

const WrappedTeachSignupBatchView = Form.create()(TeachSignupBatchView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {

    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachSignupBatchView);