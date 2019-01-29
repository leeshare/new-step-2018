import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, AutoComplete } from 'antd';
import moment from 'moment';
const Option = Select.Option;
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, covertValueToDecimalType,dataBind } from '@/utils';
import { getTeachSignupPriceList, getTeachSignupTimeRangeList } from '@/actions/teach';
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
class TeachSignupProductView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            DefaultTimeRangeOptions: [],
            DefaultPriceOptions: [],
            FormSignupTimeRangeOptions: [],
            FormExperienceTimeRangeOptions: [],
            FormPriceOptions: [],
        };
    }

    componentWillMount() {
        this.onCourseSpecialtyChange(this.state.dataModel.CourseSpecialty);
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
                this.props.viewCallback({ ...this.state.dataModel, ...values });//合并保存数据
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

    onCourseSpecialtyChange = (val) => {
        this.props.getTeachSignupPriceList({ PageIndex: 1, PageSize: 99, Status: 1, CourseSpecialty: this.state.dataModel.CourseSpecialty }).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                this.setState({ DefaultPriceOptions: data.data_list })
            }
        })
        this.props.getTeachSignupTimeRangeList({ PageIndex: 1, PageSize: 99, Status: 1, CourseSpecialty: this.state.dataModel.CourseSpecialty }).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                this.setState({ DefaultTimeRangeOptions: data.data_list })
            }
        })
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
                            label="报名课程名称"
                        >
                            {getFieldDecorator('ProductName', {
                                initialValue: this.state.dataModel.ProductName,
                                rules: [{
                                    required: true, message: '请输入报名课程名称!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        {
                            this.props.editMode == 'Create' &&
                            <FormItem
                                {...formItemLayout}
                                label="教授课程"
                            >
                                {getFieldDecorator('CourseSpecialty', {
                                    initialValue: this.state.dataModel.CourseSpecialty,
                                    rules: [{
                                        required: true, message: '请设置专业!',
                                    }],
                                })(
                                    <Select onChange={(val) => {
                                        //重新选择课程
                                        this.state.dataModel.CourseSpecialty = val;
                                        //清楚级联设置
                                        this.state.dataModel.SignupTimeRangeOptions = '';
                                        this.state.dataModel.ExperienceTimeRangeOptions = '';
                                        this.state.dataModel.PriceOptions = '';
                                        this.setState({ dataModel: this.state.dataModel });
                                        this.props.form.resetFields();
                                        this.onCourseSpecialtyChange(val);
                                    }} >
                                        {this.props.dic_CourseSpecialtys.map((item) => {
                                            return <Option value={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}
                            </FormItem>
                        }
                        {
                            this.props.editMode == 'Create' && <FormItem
                                {...formItemLayout}
                                label="教授方式"
                            >
                                {getFieldDecorator('ClassType', {
                                    initialValue: this.state.dataModel.ClassType,
                                    rules: [{
                                        required: true, message: '请设置教授方式!',
                                    }],
                                })(
                                    <Select >
                                        {this.props.dic_ClassTypes.map((item) => {
                                            return <Option value={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}
                            </FormItem>
                        }
                        <FormItem
                            {...formItemLayout}
                            label="价格范围"
                            extra="如果不设置，则默认全部"
                        >
                            {getFieldDecorator('FormPriceOptions', {
                                initialValue: this.state.dataModel.PriceOptions ? this.state.dataModel.PriceOptions.split(',') : [],
                                rules: [{
                                    required: false, message: '请设置价格范围!',
                                }],
                            })(
                                <Select mode="multiple">
                                    {this.state.DefaultPriceOptions.map((item) => {
                                        return <Option value={item.PriceID}>{item.PriceName}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="试听时段(老师)"
                            extra="如果不设置教师，则默认全部教师（可用时间段）"
                        >
                            {getFieldDecorator('FormExperienceTimeRangeOptions', {
                                initialValue: this.state.dataModel.ExperienceTimeRangeOptions ? this.state.dataModel.ExperienceTimeRangeOptions.split(',') : [],
                                rules: [{
                                    required: false, message: '请设置试听时段!',
                                }],
                            })(
                                <Select mode="multiple">
                                    {this.state.DefaultTimeRangeOptions.filter(A => A.IsSignup == 0).map((item) => {
                                        return <Option value={item.TimeRangeID}>{item.TimeRange}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="上课时段(老师)"
                            extra="如果不设置教师，则默认全部教师（可用时间段）"
                        >
                            {getFieldDecorator('FormSignupTimeRangeOptions', {
                                initialValue: this.state.dataModel.SignupTimeRangeOptions ? this.state.dataModel.SignupTimeRangeOptions.split(',') : [],
                                rules: [{
                                    required: false, message: '请设置上课!',
                                }],
                            })(
                                <Select mode="multiple">
                                    {this.state.DefaultTimeRangeOptions.filter(A => A.IsSignup == 1).map((item) => {
                                        return <Option value={item.TimeRangeID}>{item.TimeRange}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="顺序"
                            extra=""
                        >
                            {getFieldDecorator('OrderNo', {
                                initialValue: dataBind(this.state.dataModel.OrderNo || 1),
                                rules: [{
                                    required: true, message: '请设置价格范围!',
                                }],
                            })(
                                <Select>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((item) => {
                                        return <Option value={item}>{item}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="更多描述"
                        >
                            {getFieldDecorator('Description', {
                                initialValue: this.state.dataModel.Description,
                                rules: [{
                                    required: false, message: '请录入备注信息!',
                                }]
                            })(
                                <TextArea style={{ height: 300 }} />
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
                let auditStatus1 = this.props.dic_AuditStatus.filter(A => A.value >= 2);

                block_content = (
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="报名课程名称"
                        >
                            <span className="ant-form-text">{this.state.dataModel.ProductName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="教授课程"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_CourseSpecialtys, this.state.dataModel.CourseSpecialty)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="教授方式"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_ClassTypes, this.state.dataModel.ClassType)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="价格范围"
                        >
                            <span className="ant-form-text">{this.state.dataModel.PriceOptionInfos ? this.state.dataModel.PriceOptionInfos.map(A => A.PriceName).join(',') : '不限'}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="试听时段(老师)"
                        >
                            <span className="ant-form-text">{this.state.dataModel.ExperienceTimeRangeOptionInfos ? this.state.dataModel.ExperienceTimeRangeOptionInfos.map(A => `${A.TimeRangeTitle}${A.TimeRange}`).join(',') : '不限'}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="上课时段(老师)"
                        >
                            <span className="ant-form-text">{this.state.dataModel.SignupTimeRangeOptionInfos ? this.state.dataModel.SignupTimeRangeOptionInfos.map(A => `${A.TimeRangeTitle}${A.TimeRange}`).join(',') : '不限'}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="更多描述"
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
                            label="审核状态"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_AuditStatus, this.state.dataModel.AuditStatus)}</span>
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
                        <FormItem
                            {...formItemLayout}
                            label="审核信息"
                        >
                            <span className="ant-form-text">{this.state.dataModel.AuditRemark.map((item) => {
                                return <div>{item}</div>
                            })}</span>
                        </FormItem>
                        {
                            this.props.editMode != 'Audit' ? "" : <FormItem
                                {...formItemLayout}
                                label="审核状态"
                            >
                                {getFieldDecorator('AuditStatus', {
                                    initialValue: "3",
                                    rules: [{
                                        required: true, message: '请选择提交审核状态!',
                                    }]
                                })(
                                    <Select>
                                        {auditStatus1.map((item) => {
                                            return <Option value={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}</FormItem>
                        }
                        {
                            this.props.editMode != 'Audit' ? "" : <FormItem
                                {...formItemLayout}
                                label="审核意见"
                                extra="如果不同意，请给出修改建议！"
                            >
                                {getFieldDecorator('AuditRemark', {
                                    initialValue: '同意'
                                })(
                                    <TextArea rows={4} />
                                    )}
                            </FormItem>
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
            </Card>
        );
    }
}

const WrappedTeachSignupProductView = Form.create()(TeachSignupProductView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        getTeachSignupPriceList: bindActionCreators(getTeachSignupPriceList, dispatch),
        getTeachSignupTimeRangeList: bindActionCreators(getTeachSignupTimeRangeList, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachSignupProductView);