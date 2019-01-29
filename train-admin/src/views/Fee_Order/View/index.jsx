import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, Radio, TimePicker, Spin } from 'antd';
import moment from 'moment';
//import './index.less';
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dataBind, covertValueToDecimalType, dateFormat } from '@/utils';
import EditableUserTagGroup from '@/components/EditableUserTagGroup';
import { smartInputSearchStudentUserList } from '@/actions/admin';
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
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
class FeeOrderView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            refund_dataModel: {},
            refundEditMode: '',//根据数据检测进入何种视图View，Edit
            refund_loading: true,
        };
    }

    componentWillMount() {
        if (this.props.editMode.indexOf("Refund") != -1) {
            this.props.getFeeRefundOrderInfo(this.props.currentDataModel).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.RefundStatus < 3) {
                    this.setState({ refund_loading: false, refundEditMode: 'Edit', refund_dataModel: data });
                }
                else {
                    this.setState({ refund_loading: false, refundEditMode: 'View', refund_dataModel: data });
                }
            })
        }
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        if (this.props.editMode == "Cancel") {//取消订单
            //表单验证后，合并数据提交
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    Modal.confirm({
                        title: '你确认要取消该订单吗?',
                        content: '订单取消后不能恢复状态',
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
        else if (this.props.editMode == "Create") {//新增订单
            //表单验证后，合并数据提交
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    this.setState({ loading: true });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 3000);//合并保存数据
                    this.props.viewCallback({ ...this.state.dataModel, ...values, OrderMoney: covertValueToDecimalType(values.OrderMoney) });
                }
            });
        }
        else if (this.props.editMode == "Refund") {//退款
            //表单验证后，合并数据提交
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    this.setState({ loading: true });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 3000);//合并保存数据
                    this.props.viewCallback({ ...this.state.refund_dataModel, ...values, RefundMoney: covertValueToDecimalType(values.RefundMoney), OrderID: this.state.dataModel.OrderID });
                }
            });
        }
    }
    //标题
    getTitle() {
        if (this.props.editMode == 'Cancel') return '取消订单';
        if (this.props.editMode == "Refund") {
            if (this.state.refundEditMode == "Edit") {
                return '添加退款单';
            }
            else {
                return '查看退款单'
            }
        }
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}订单`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode == 'Create' || this.state.refundEditMode == 'Edit') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" icon="save" onClick={this.onSubmit} loading={this.state.loading} >{getViewEditModeTitle(this.props.editMode, '保存')}</Button> <Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else if (this.props.editMode == 'Cancel') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" icon="save" onClick={this.onSubmit} loading={this.state.loading} >{getViewEditModeTitle(this.props.editMode)}</Button> <Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
                let totalPeriods = 0;
                this.state.dataModel.FormOrderDetails.map((item) => {
                    if (item.Periods) {
                        totalPeriods += item.Periods;
                    }
                })
                block_content = (<div className="form-edit">
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="购买课程"
                        >
                            {getFieldDecorator('CourseSpecialty', {
                                initialValue: (this.state.dataModel.CourseSpecialty || ''),
                                rules: [{
                                    required: true, message: '请指定购买课程!',
                                }]
                            })(<RadioGroup>
                                {
                                    this.props.dic_CourseSpecialtys.map((item, index) => {
                                        return <RadioButton value={item.value}>{item.title}</RadioButton>;
                                    })
                                }
                            </RadioGroup>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="课时购买"
                            className='ant-table'
                        >
                            <table>
                                <thead className="ant-table-thead">
                                    <tr>
                                        <th>课时类型</th>
                                        <th>课时数</th>
                                    </tr>
                                </thead>
                                <tbody className="ant-table-tbody">
                                    {
                                        this.props.dic_PeriodTypes.map((item, index) => {
                                            return <tr className='ant-table-row  ant-table-row-level-0'>
                                                <td>{item.title}</td>
                                                <td><InputNumber min={0} max={500} onChange={(value) => {
                                                    this.state.dataModel.FormOrderDetails[index] = { PeriodType: item.value, Periods: value };
                                                    this.setState({ dataModel: this.state.dataModel })
                                                }} /></td>
                                            </tr>
                                        })
                                    }
                                    <tr className='ant-table-row  ant-table-row-level-0'>
                                        <td></td>
                                        <td style={{ fontWeight: 'bold', fontSize: '16px' }}>共计{totalPeriods}课时</td>
                                    </tr>
                                </tbody>
                            </table>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="课时有效期"
                            className='form-duration'
                        >
                            {getFieldDecorator('PeriodDuration', {
                                initialValue: 1,
                                rules: [{
                                    required: true, message: '请设置课时有效期!',
                                }]
                            })(
                                <InputNumber min={1} max={500} />
                                )}
                            {getFieldDecorator('PeriodDurationType', {
                                initialValue: '2',
                            })(
                                <Select>
                                    {this.props.dic_PeriodDurationTypes.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="学生信息"
                        >
                            {getFieldDecorator('FormStudent', {
                                initialValue: ([]),
                                rules: [{
                                    required: true, message: '请设置学生信息!',
                                }]
                            })(
                                <EditableUserTagGroup maxTags={1} smartInputSearchUserList={this.props.smartInputSearchStudentUserList} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="订单金额"
                        >
                            {getFieldDecorator('OrderMoney', {
                                rules: [{
                                    required: true, message: '请设置订单金额!',
                                }]
                            })(
                                <InputNumber step={0.01} min={0.01} max={10000} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="订单时间"
                        >
                            {getFieldDecorator('OrderDate', {
                                initialValue: dateFormat(new Date(), 'yyyy-MM-dd hh:mm:00'),
                                rules: [{
                                    required: true, message: '请设置订单时间!'
                                }, {
                                    pattern: /^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, message: '日期格式有误,请参考:2017-01-01 10:00:00!'
                                }]
                            })(
                                <Input placeholder="请设置订单日期" />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="结算方式"
                        >
                            {getFieldDecorator('PayType', {
                                initialValue: '',
                                rules: [{
                                    required: true, message: '请设置结算方式!'
                                }]
                            })(
                                <Select>
                                    {this.props.dic_PayTypes.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="订单补充说明"
                        >
                            {getFieldDecorator('Remark', {
                                initialValue: this.state.dataModel.Remark,
                                rules: [{
                                    required: false, message: '请录入订单补充说明!',
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

            case "Refund"://退单
                if (this.state.refund_loading) {
                    block_content = <div style={{ width: 100, margin: '300 auto' }}><Spin tip="数据加载中..."></Spin></div>
                    break;
                }
                if (this.state.refundEditMode == 'Edit') {
                    this.state.refund_dataModel.FormRefundDetails = this.state.refund_dataModel.Details.length > 0 ? this.state.refund_dataModel.Details : this.state.dataModel.Details;

                    let refund_totalPeriods = 0;
                    this.state.refund_dataModel.FormRefundDetails.map((item) => {
                        if (item.Periods) {
                            refund_totalPeriods += item.Periods;
                        }
                    })
                    block_content = (<div className="form-edit">
                        <Form>
                            <FormItem
                                {...formItemLayout}
                                label="订单编号"
                            >
                                <span className="ant-form-text">{this.state.dataModel.OrderCode}</span>
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="订单金额"
                            >
                                <span className="ant-form-text">{this.state.dataModel.OrderMoney}</span>
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="订单时间"
                            >
                                <span className="ant-form-text">{this.state.dataModel.OrderDate}</span>
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="课时数"
                            >
                                <span className="ant-form-text">{this.state.dataModel.Periods}</span>
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="退课时"
                                className='ant-table'
                            >
                                <table>
                                    <thead className="ant-table-thead">
                                        <tr>
                                            <th>课时类型</th>
                                            <th>课时数</th>
                                        </tr>
                                    </thead>
                                    <tbody className="ant-table-tbody">
                                        {
                                            this.state.dataModel.Details.map((item, index) => {
                                                return <tr className='ant-table-row  ant-table-row-level-0'>
                                                    <td>{getDictionaryTitle(this.props.dic_PeriodTypes, item.PeriodType)}</td>
                                                    <td><InputNumber min={0} max={item.Periods} defaultValue={item.Periods} onChange={(value) => {
                                                        this.state.refund_dataModel.FormRefundDetails[index] = { PeriodType: item.PeriodType, Periods: value };
                                                        this.setState({ refund_dataModel: this.state.refund_dataModel })
                                                    }} /></td>
                                                </tr>
                                            })
                                        }
                                        <tr className='ant-table-row  ant-table-row-level-0'>
                                            <td></td>
                                            <td style={{ fontWeight: 'bold', fontSize: '16px' }}>共计{refund_totalPeriods}课时</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="退款金额"
                            >
                                {getFieldDecorator('RefundMoney', {
                                    rules: [{
                                        required: true, message: '请设置订单金额!',
                                    }]
                                })(
                                    <InputNumber step={0.01} min={0.01} max={10000} />
                                    )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="退款日期"
                            >
                                {getFieldDecorator('CreatedDate', {
                                    initialValue: dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss'),
                                    rules: [{
                                        required: true, message: '请设置退款日期!'
                                    }, {
                                        pattern: /^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, message: '日期格式有误,请参考:2017-01-01 10:00:00!'
                                    }]
                                })(
                                    <Input placeholder="请设置退款日期" />
                                    )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="退款补充说明"
                            >
                                {getFieldDecorator('RefundReason', {
                                    initialValue: this.state.dataModel.Remark,
                                    rules: [{
                                        required: false, message: '请录入退款补充说明!',
                                    }]
                                })(
                                    <TextArea rows={4} />
                                    )}
                            </FormItem>
                            {this.renderBtnControl()}
                        </Form>
                    </div>
                    );
                }
                else {
                    let refund_totalPeriods = 0;
                    this.state.refund_dataModel.Details.map((item) => {
                        if (item.Periods) {
                            refund_totalPeriods += item.Periods;
                        }
                    })
                    block_content = (<div className="form-edit">
                        <Form>
                            <FormItem
                                {...formItemLayout}
                                label="退款编号"
                            >
                                <span className="ant-form-text">{this.state.refund_dataModel.RefundCode}</span>
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="退款金额"
                            >
                                <span className="ant-form-text">{this.state.refund_dataModel.RefundMoney}</span>
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="退款日期"
                            >
                                <span className="ant-form-text">{this.state.refund_dataModel.CreatedDate}</span>
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="退课时"
                                className='ant-table'
                            >
                                <table>
                                    <thead className="ant-table-thead">
                                        <tr>
                                            <th>课时类型</th>
                                            <th>课时数</th>
                                        </tr>
                                    </thead>
                                    <tbody className="ant-table-tbody">
                                        {
                                            this.state.refund_dataModel.Details.map((item, index) => {
                                                return <tr className='ant-table-row  ant-table-row-level-0'>
                                                    <td>{getDictionaryTitle(this.props.dic_PeriodTypes, item.PeriodType)}</td>
                                                    <td>{item.Periods}</td>
                                                </tr>
                                            })
                                        }
                                        <tr className='ant-table-row  ant-table-row-level-0'>
                                            <td></td>
                                            <td style={{ fontWeight: 'bold', fontSize: '16px' }}>共计{refund_totalPeriods}课时</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="退款状态"
                            >
                                <span className="ant-form-text">{getDictionaryTitle(this.props.dic_RefundStatus, this.state.refund_dataModel.RefundStatus)}</span>
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label='退款补充说明'
                            >
                                <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.refund_dataModel.RefundReason) }}></span>
                            </FormItem>
                            {this.renderBtnControl()}
                        </Form>
                    </div>
                    );
                }
                break;
            case "View":
            case "Cancel":
                block_content = (
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="订单编号"
                        >
                            <span className="ant-form-text">{this.state.dataModel.OrderCode}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="学生信息"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.StudentInfo.username}</span>
                            <span className="ant-form-text" >{this.state.dataModel.StudentInfo.name}</span>
                            <span className="ant-form-text" >{this.state.dataModel.StudentInfo.chinese_name}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="购买课程"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_CourseSpecialtys, this.state.dataModel.CourseSpecialty)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="课时有效期"
                        >
                            <span className="ant-form-text">自{this.state.dataModel.OrderDate}起，{this.state.dataModel.PeriodDuration} {getDictionaryTitle(this.props.dic_PeriodDurationTypes, this.state.dataModel.PeriodDurationType)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="购买课时"
                            className='ant-table'
                        >
                            <table>
                                <thead className="ant-table-thead">
                                    <tr>
                                        <th>课时类型</th>
                                        <th>课时数</th>
                                    </tr>
                                </thead>
                                <tbody className="ant-table-tbody">
                                    {
                                        this.state.dataModel.Details.map((item, index) => {
                                            return <tr className='ant-table-row  ant-table-row-level-0'>
                                                <td>{getDictionaryTitle(this.props.dic_PeriodTypes, item.PeriodType)}</td>
                                                <td>{item.Periods}</td>
                                            </tr>
                                        })
                                    }
                                    <tr className='ant-table-row  ant-table-row-level-0'>
                                        <td></td>
                                        <td style={{ fontWeight: 'bold', fontSize: '16px' }}>共计{this.state.dataModel.Periods}课时</td>
                                    </tr>
                                </tbody>
                            </table>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="订单金额"
                        >
                            <span className="ant-form-text">{this.state.dataModel.OrderMoney}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="优惠金额"
                        >
                            <span className="ant-form-text">{this.state.dataModel.AdjustMoney}</span>
                        </FormItem>
                        {
                            //如果开票则显示税金
                            this.state.dataModel.IsNeedInvoice == 1 ?
                                <FormItem
                                    {...formItemLayout}
                                    label="税金"
                                >
                                    <span className="ant-form-text">{this.state.dataModel.InvoiceMoney}</span>
                                </FormItem> : ''
                        }
                        <FormItem
                            {...formItemLayout}
                            label="实付金额"
                        >
                            <span className="ant-form-text">{this.state.dataModel.PayMoney}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="订单状态"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_OrderStatus, this.state.dataModel.OrderStatus)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="结算方式"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_PayTypes, this.state.dataModel.PayType, '未知')}</span>
                        </FormItem>
                        {
                            //如果开票则显示税金
                            this.state.dataModel.IsNeedInvoice == 1 ? <FormItem
                                {...formItemLayout}
                                label="是否已开具发票"
                            >
                                <span className="ant-form-text">{getDictionaryTitle(this.props.dic_TrueOrFalse, this.state.dataModel.InvoiceStatus)}</span>
                            </FormItem> : ''
                        }
                        <FormItem
                            {...formItemLayout}
                            label='订单补充说明'
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.Remark) }}></span>
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
                        {
                            this.props.editMode == "Cancel" ?
                                <FormItem
                                    {...formItemLayout}
                                    label="取消原因补充"
                                >
                                    {getFieldDecorator('Remark', {
                                        initialValue: this.state.dataModel.Remark,
                                        rules: [{
                                            required: true, message: '请录入订单补充说明!',
                                        }]
                                    })(
                                        <TextArea rows={4} />
                                        )}
                                </FormItem> : ''
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

const WrappedFeeOrderView = Form.create()(FeeOrderView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        smartInputSearchStudentUserList: bindActionCreators(smartInputSearchStudentUserList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedFeeOrderView);