import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, AutoComplete } from 'antd';
import moment from 'moment';

import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml } from '@/utils';
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
class TeachClassRoomView extends React.Component {
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
        if (this.props.editMode == "Delete") {
            Modal.confirm({
                title: '你确认要删除该教室吗?',
                content: '如果已安排上课，则不能被删除！',
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
                    this.props.viewCallback({ ...this.state.dataModel, ...values, ClassRoomIDs: (values.FormClassRoomIDs || []).join(',') });//合并保存数据
                }
            });
        }
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}教室`;
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
                            label="教室名称"
                        >
                            {getFieldDecorator('ClassRoomName', {
                                initialValue: this.state.dataModel.ClassRoomName,
                                rules: [{
                                    required: true, message: '请输入教室名称!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        {
                            this.state.dataModel.ClassRoomType == 2 && <FormItem
                                {...formItemLayout}
                                label="关联教室"
                            >
                                {getFieldDecorator('FormClassRoomIDs', {
                                    initialValue: this.state.dataModel.ClassRoomIDs,
                                    rules: [{
                                        required: true, message: '请设置关联教室!',
                                    }],
                                })(
                                    <Select multiple>
                                        {this.props.data_list.filter(A => A.Status = 1 && A.ClassRoomType == 1).map((item) => {
                                            return <Option value={item.TeachClassRoomID}>{item.ClassRoomName}</Option>
                                        })}
                                    </Select>
                                    )}
                            </FormItem>
                        }
                        <FormItem
                            {...formItemLayout}
                            label="主摄像头编号"
                        >
                            {getFieldDecorator('PrimaryCameraNo', {
                                initialValue: this.state.dataModel.PrimaryCameraNo,
                                rules: [{
                                    required: false, message: '请输入主摄像头编号!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="副摄像头编号"
                        >
                            {getFieldDecorator('SecondaryCameraNo', {
                                initialValue: this.state.dataModel.SecondaryCameraNo,
                                rules: [{
                                    required: false, message: '请输入副摄像头编号!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="所在位置"
                        >
                            {getFieldDecorator('Address', {
                                initialValue: this.state.dataModel.Address,
                                rules: [{
                                    required: false, message: '请录入教室所在位置!',
                                }]
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="顺序号"
                        >
                            {getFieldDecorator('OrderNo', {
                                initialValue: this.state.dataModel.OrderNo,
                                rules: [{
                                    required: true, message: '顺序号!',
                                }]
                            })(
                                <InputNumber min={0} max={200} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="状态"
                        >
                            {getFieldDecorator('Status', {
                                initialValue: this.state.dataModel.Status || '1'
                            })(
                                <Select>
                                    {this.props.dic_Status.map((item) => {
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
                            label="教室名称"
                        >
                            <span className="ant-form-text">{this.state.dataModel.ClassRoomName}</span>
                        </FormItem>

                        {
                            this.state.dataModel.ClassRoomType == 2 && <FormItem
                                {...formItemLayout}
                                label="关联教室"
                            >
                                {
                                    this.state.dataModel.ClassRoomIDs.map((item, index) => {
                                        var teachClassInfo = this.props.data_list.find(A => A.TeachClassRoomID == item);
                                        if (teachClassInfo) {
                                            return <span className="ant-form-text" style={{ marginRight: 10 }}>{teachClassInfo.ClassRoomName}</span>
                                        }
                                        return "";
                                    })
                                }
                            </FormItem>
                        }
                        <FormItem
                            {...formItemLayout}
                            label="主摄像头编号"
                        >
                            <span className="ant-form-text">{this.state.dataModel.PrimaryCameraNo}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="副摄像头编号"
                        >
                            <span className="ant-form-text">{this.state.dataModel.SecondaryCameraNo}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="教室位置"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Address}</span>
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

const WrappedTeachClassRoomView = Form.create()(TeachClassRoomView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {

    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachClassRoomView);