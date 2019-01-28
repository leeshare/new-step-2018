import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, AutoComplete } from 'antd';
import moment from 'moment';

import EditableUserTagGroup from '@/components/EditableUserTagGroup';
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dateFormat, dataBind } from '@/utils';
import { smartInputSearchUserList } from '@/actions/admin';
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
class QuestionView extends React.Component {
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
                title: '你确认要删除该学生提问?',
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
                    //,UTCBeginTime:utcBeginTime 
                    this.props.viewCallback({ ...this.state.dataModel, ...values });//合并保存数据
                }
            });
        }
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}学生提问`;
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
                block_content = (<div className="form-edit">
                    <Form >
                        <FormItem
                            {...formItemLayout}
                            label="提问内容"
                        >
                            {getFieldDecorator('QuestionName', {
                                initialValue: this.state.dataModel.question_name,
                                rules: [{
                                    required: true, message: '请输入提问内容!',
                                }],
                            })(
                                <TextArea rows={5} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="提问类型"
                        >
                            {getFieldDecorator('QuestionType', {
                                initialValue: dataBind(this.state.dataModel.question_type || '1'),
                                rules: [{
                                    required: true, message: '请指定提问类型!',
                                }]
                            })(
                                <Select>
                                    {this.props.dic_QuestionTypes.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="提问时间"
                        >
                            {getFieldDecorator('CreatedDate', {
                                initialValue: (this.props.editMode == 'Edit' ? this.state.dataModel.created_date : dateFormat(new Date(), 'yyyy-MM-dd hh:mm:00')),
                                rules: [{
                                    required: true, message: '请设置提问时间!'
                                }, {
                                    pattern: /^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, message: '日期格式有误,请参考:2017-01-01 10:00:00!'
                                }]
                            })(
                                <Input placeholder="请设置提问时间" style={{ width: 200 }} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="更多人感兴趣(同问)"
                        >
                            {getFieldDecorator('SimilarMembers', {
                                initialValue: this.state.dataModel.similar_member_number || 0,
                                rules: [{
                                    required: true, message: '请设置更多人感兴趣!',
                                }]
                            })(
                                <InputNumber min={0} max={500} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="提问人"
                            extra="模拟用户进行提问"
                        >
                            {getFieldDecorator('FormOwners', {
                                initialValue: this.state.dataModel.Owners,
                                rules: [{
                                    required: true, message: '请设置提问人!',
                                }]
                            })(
                                <EditableUserTagGroup smartInputSearchUserList={this.props.smartInputSearchUserList} maxTags={1} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="顺序"
                        >
                            {getFieldDecorator('TopLevel', {
                                initialValue: this.state.dataModel.top_level || 0,
                                rules: [{
                                    required: false, message: '请设置顺序!',
                                }]
                            })(
                                <InputNumber min={0} max={500} />
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
                            label="提问内容"
                        >
                            <span className="ant-form-text">{this.state.dataModel.question_name}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="提问类型"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_QuestionTypes, this.state.dataModel.question_type)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="提问时间"
                        >
                            <span className="ant-form-text">{this.state.dataModel.created_date}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="提问人"
                        >
                            <img src={this.state.dataModel.Owners[0].icon} style={{ width: 40, height: 40 }} />
                            <span className="ant-form-text">{this.state.dataModel.Owners[0].chinese_name}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="更多人感兴趣(同问)"
                        >
                            <span className="ant-form-text">{this.state.dataModel.similar_member_number}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="顺序"
                        >
                            <span className="ant-form-text">{this.state.dataModel.top_level}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="提问状态"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_Status, this.state.dataModel.status)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="审核状态"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_AuditStatus, this.state.dataModel.audit_status)}</span>
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

const WrappedQuestionView = Form.create()(QuestionView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        smartInputSearchUserList: bindActionCreators(smartInputSearchUserList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedQuestionView);