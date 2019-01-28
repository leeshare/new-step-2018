import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, Radio, TimePicker, Spin, Tag } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dataBind, covertValueToDecimalType, dateFormat } from '@/utils';
import ImageUpload from '@/components/ImageUpload';
import EditableTagGroup from '@/components/EditableTagGroup'
import { smartInputSearchStudentUserList } from '@/actions/admin';

import ModalSearchOrder from '../../Fee_Order/ModalSearchOrder'
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
class FeeInvoiceView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            refund_dataModel: {},
            refundEditMode: '',//根据数据检测进入何种视图View，Edit
            refund_loading: true,
            showChooseOrderInfoWindow: false,
            SelectedOrderInfos: [],
            FormFilePath: [],//上传其他附件
        };
    }

    componentWillMount() {

    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        if (this.props.editMode == "Delete") {//取消订单
            //表单验证后，合并数据提交
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    Modal.confirm({
                        title: '你确认要取消该发票吗?',
                        content: '取消后可以重新录入',
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
                    if (this.state.SelectedOrderInfos.length == 0) {
                        message.warning('请添加订单')
                        return;
                    }
                    this.setState({ loading: true });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 3000);//合并保存数据

                    let orderCodes = this.state.SelectedOrderInfos.map(A => A.OrderCode).join(',');
                    this.props.viewCallback({
                        ...this.state.dataModel, ...values,
                        FormOrderCodes: orderCodes,
                        InvoiceMoney: covertValueToDecimalType(values.InvoiceMoney),
                        FormFilePath: this.state.FormFilePath.map(A => A.bizUrl)
                    });
                }
            });
        }
    }
    //标题
    getTitle() {
        if (this.props.editMode == 'Delete') return '取消发票';
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}发票`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
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
    onOrderInfoSelected = (orderInfo) => {
        if (!this.state.SelectedOrderInfos.find(A => A.key == orderInfo.key)) {
            if (this.state.SelectedOrderInfos.length > 0 && this.state.SelectedOrderInfos[0].StudentInfo.uid != orderInfo.StudentInfo.uid) {
                message.error('所选择的订单必须是同一个学生!', 3);
                return;
            }
            this.state.SelectedOrderInfos.push(orderInfo);
            this.setState({ SelectedOrderInfos: this.state.SelectedOrderInfos })
        }
        let orderCodes = this.state.SelectedOrderInfos.map(A => A.OrderCode).join(',');
        message.success(`已选订单:${orderCodes}`);
    }

    onOrderInfoRemoved = (orderInfo) => {
        this.setState({ SelectedOrderInfos: this.state.SelectedOrderInfos.filter(A => A.key != orderInfo.key) });
    }
    onShowChooseOrder = () => {
        this.setState({ showChooseOrderInfoWindow: true });
    }
    onRemoveFilePath = (item) => {
        this.setState({ FormFilePath: this.state.FormFilePath.filter(A => A.bizUrl != item.bizUrl) });
    }
    onAddFilePath = (item) => {
        this.state.FormFilePath.push(item);
        this.setState({ FormFilePath: this.state.FormFilePath });
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
                block_content = (<div className="form-edit">
                    <Modal width={1000}
                        title="查找订单信息"
                        wrapClassName="vertical-center-modal"
                        visible={this.state.showChooseOrderInfoWindow}
                        onOk={() => {
                            this.setState({ showChooseOrderInfoWindow: false });
                        }}
                        onCancel={() => {
                            this.setState({ showChooseOrderInfoWindow: false });
                        }}
                        footer={null}
                    >
                        <ModalSearchOrder {...this.props.currentDataModel} ChooseObjectsChange={this.state.SelectedOrderInfos.length} ChooseObjects={this.state.SelectedOrderInfos} callback={this.onOrderInfoSelected} />
                    </Modal>
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="订单编号"
                            required={true}
                        >
                            <Row>
                                {this.state.SelectedOrderInfos.map((item, index) => {
                                    return (<Col span={8} style={{ marginBottom: 10 }}>
                                        <Tag key={item.key} closable={true} afterClose={() => this.onOrderInfoRemoved(item)}>
                                            {item.OrderCode}
                                        </Tag>
                                    </Col>
                                    );
                                })}
                                <Col span={8} style={{ marginBottom: 10 }}>
                                    <Button size="small" type="dashed" onClick={this.onShowChooseOrder}>+订单</Button>
                                </Col>
                            </Row>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="发票金额"
                        >
                            {getFieldDecorator('InvoiceMoney', {
                                rules: [{
                                    required: true, message: '请设置发票金额!',
                                }]
                            })(
                                <InputNumber step={0.01} min={0.01} max={10000} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="开票时间"
                        >
                            {getFieldDecorator('InvoiceDate', {
                                initialValue: dateFormat(new Date(), 'yyyy-MM-dd hh:mm:00'),
                                rules: [{
                                    required: true, message: '请设置开票时间!'
                                }, {
                                    pattern: /^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, message: '日期格式有误,请参考:2017-01-01 10:00:00!'
                                }]
                            })(
                                <Input style={{ width: 200 }} placeholder="请设置开票时间" />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="发票照片"
                            extra="点击图片可以重新上传"
                        >
                            {getFieldDecorator('FormInvoicePath', {
                                initialValue: this.state.dataModel.InvoicePath,
                                rules: [{
                                    required: true, message: '请上传发票照片!',
                                }]
                            }
                            )(
                                <ImageUpload hideLibrary={true} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="其他照片"
                            extra={'可以上传多张，如支付凭据、家长签字等'}
                        >
                            <Row>
                                {
                                    this.state.FormFilePath.map((item, index) => {
                                        return <Col span={8} style={{ textAlign: 'center', backgroundColor: '#ccc', marginBottom: 10, marginRight: 10, overflow: 'hidden' }}>
                                            <img src={item.url} style={{ height: 200, width: 'auto', display: 'block', margin: '0 auto' }}
                                            />
                                            <a onClick={() => { this.onRemoveFilePath(item) }}>删除</a>
                                        </Col>

                                    })
                                }
                                <Col span={8} style={{ marginBottom: 10 }}>
                                    <ImageUpload hideLibrary={true} key={this.state.FormFilePath.length + 1} callback={(url, bizUrl) => {
                                        this.onAddFilePath({ url, bizUrl });
                                    }} />
                                </Col>
                            </Row>
                        </FormItem>
                        {/* <FormItem
                            {...formItemLayout}
                            label="发票编号"
                            extra="如果不设置则系统自动生成流水号"
                        >
                            {getFieldDecorator('InvoiceCode', {
                                initialValue: ''
                            })(
                                <Input style={{ width: 500 }} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="发票抬头"
                        >
                            {getFieldDecorator('InvoiceTitle', {
                                initialValue: '个人'
                            })(
                                <Input style={{ width: 500 }} />
                                )}
                        </FormItem> */}
                        {this.renderBtnControl()}
                    </Form>
                </div>
                );
                break;
            case "View":
            case "Delete":
                block_content = (
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="订单信息"
                        >
                            {this.state.dataModel.Details.map((item, index) => {
                                return <span style={{ marginRight: 10 }}>{item.OrderInfo.OrderCode}</span>
                            })}
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
                            label="发票金额"
                        >
                            <span className="ant-form-text">{this.state.dataModel.InvoiceMoney}</span>
                        </FormItem>
                        {/* <FormItem
                            {...formItemLayout}
                            label="发票抬头"
                        >
                            <span className="ant-form-text">{this.state.dataModel.InvoiceTitle}</span>
                        </FormItem> */}
                        <FormItem
                            {...formItemLayout}
                            label="发票照片"
                        >
                            <img style={{ width: 800 }} src={this.state.dataModel.InvoicePath} />
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="其他照片"
                        >
                            {this.state.dataModel.FilePath.split(',').map((item, index) => {
                                return <img style={{ width: 800, display: 'block',marginBottom:10 }} src={item} />;
                            })}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="创建信息"
                        >
                            <span className="ant-form-text">{this.state.dataModel.CreatedDate} by {this.state.dataModel.CreatedUserInfo.name}</span>
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

const WrappedFeeInvoiceView = Form.create()(FeeInvoiceView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        smartInputSearchStudentUserList: bindActionCreators(smartInputSearchStudentUserList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedFeeInvoiceView);