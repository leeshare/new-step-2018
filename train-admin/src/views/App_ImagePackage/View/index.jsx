import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, AutoComplete } from 'antd';
import moment from 'moment';

import ImageUpload from '@/components/ImageUpload';
import EditableUserTagGroup from '@/components/EditableUserTagGroup';
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dateFormat, dataBind } from '@/utils';
import { smartInputSearchUserList } from '@/actions/admin';
import './index.less';
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
class ImagePackageInfoView extends React.Component {
    constructor(props) {
        super(props)
        let formImagePaths = props.currentDataModel.Images.map((item) => {
            let { ResourceID } = item;
            return { value: `resource://${ResourceID}`, url: item.Cover };
        });
        formImagePaths.push({ value: '', url: '' });
        props.currentDataModel.FormImagePaths_Temp = formImagePaths;
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
                title: '你确认要删除该图包吗?',
                content: '如果图包已经使用，则不能被删除！',
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
                    this.props.viewCallback({ ...this.state.dataModel, ...values, FormImagePaths: this.state.dataModel.FormImagePaths_Temp.filter(A => A != '').map(A => A.value) });//合并保存数据
                }
            });
        }
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}图包`;
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
                let auditStatus = this.props.dic_AuditStatus.filter(A => A.value < 2);

                block_content = (<div className="form-edit">
                    <Form >
                        <FormItem
                            {...formItemLayout}
                            label="图包名称"
                        >
                            {getFieldDecorator('Title', {
                                initialValue: this.state.dataModel.Title,
                                rules: [{
                                    required: true, message: '请输入图包名称!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="图包描述"
                        >
                            {getFieldDecorator('Description', {
                                initialValue: this.state.dataModel.Description,
                                rules: [{
                                    required: false, message: '请录入图包描述!',
                                }]
                            })(
                                <TextArea rows={5} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="图片列表"
                            extra="点击直播封面图可以重新上传"
                        >
                            <Row gutter={24} className="AppBackGroundImageList">
                                {this.state.dataModel.FormImagePaths_Temp.map((item, index) => {
                                    return <Col span={12} style={{ marginBottom: 24 }}>
                                        <ImageUpload value={item.url} onChange={(value, url) => {
                                            var item = this.state.dataModel.FormImagePaths_Temp[index];
                                            if (item.value == '') {
                                                this.state.dataModel.FormImagePaths_Temp.push({ value: '', url: '' })
                                            }
                                            item.value = value;
                                            item.url = url;
                                            this.setState({ dataModel: this.state.dataModel })
                                        }} />
                                    </Col>
                                })
                                }
                            </Row>
                        </FormItem>
                        {
                            this.props.editMode == 'Create' ? "" : <FormItem
                                {...formItemLayout}
                                label="提交审核"
                            >
                                {getFieldDecorator('AuditStatus', {
                                    rules: [{
                                        required: true, message: '请选择提交审核状态!',
                                    }]
                                })(
                                    <Select>
                                        {auditStatus.map((item) => {
                                            return <Option value={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}</FormItem>
                        }
                        {
                            this.props.editMode == 'Create' ? "" : <FormItem
                                {...formItemLayout}
                                label="修改描述"
                            >
                                {getFieldDecorator('AuditRemark', {
                                    rules: [{
                                        required: true, message: '请对本次直播计划修改进行说明!',
                                    }]
                                })(
                                    <TextArea rows={4} />
                                    )}
                            </FormItem>
                        }
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
                            label="图包名称"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Title}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="图包描述"
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.Description) }}></span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="图片列表"
                        >
                            <Row gutter={24}>
                                {this.state.dataModel.Images.map((item, index) => {
                                    return <Col span={12} style={{ marginBottom: 24, overflow: 'hidden' }}>
                                        <img style={{ width: '300px', height: '300px' }} src={item.Cover} />
                                    </Col>
                                })
                                }
                            </Row>
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

const WrappedImagePackageView = Form.create()(ImagePackageInfoView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        smartInputSearchUserList: bindActionCreators(smartInputSearchUserList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedImagePackageView);