import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, AutoComplete } from 'antd';
import moment from 'moment';

import ImageCutUpload from '@/components/ImageCutUpload';
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
class LiveView extends React.Component {
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
                title: '你确认要删除该直播计划吗?',
                content: '如果直播计划已经使用，则不能被删除！',
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
        return `${op}直播计划`;
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
                            label="直播名称"
                        >
                            {getFieldDecorator('LiveName', {
                                initialValue: this.state.dataModel.LiveName,
                                rules: [{
                                    required: true, message: '请输入直播名称!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="直播封面"
                            extra="点击直播封面图可以重新上传"
                        >
                            {getFieldDecorator('FormImagePath', {
                                initialValue: this.state.dataModel.TitlePages,
                                rules: [{
                                    required: true, message: '请上传直播封面图片!',
                                }]
                            }
                            )(
                                <ImageCutUpload width={1024} height={630} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="直播类型"
                        >
                            {getFieldDecorator('LiveType', {
                                initialValue: dataBind(this.state.dataModel.LiveType || '1'),
                                rules: [{
                                    required: true, message: '请指定直播类型!',
                                }]
                            })(
                                <Select>
                                    {this.props.dic_LiveTypes.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="直播地点"
                            extra="用户地域跨时区时，方便用户协调开始时间"
                        >
                            {getFieldDecorator('LivePosition', {
                                initialValue: this.state.dataModel.LivePosition,
                                rules: [{
                                    required: true, message: '请指定直播地点!',
                                }]
                            })(
                                <Select>
                                    {this.props.dic_LivePositions.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="开始时间"
                        >
                            {getFieldDecorator('BeginTime', {
                                initialValue: (this.props.editMode == 'Edit' ? this.state.dataModel.BeginTime : dateFormat(new Date(), 'yyyy-MM-dd hh:00:00')),
                                rules: [{
                                    required: true, message: '请设置开始时间!'
                                }, {
                                    pattern: /^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, message: '日期格式有误,请参考:2017-01-01 10:00:00!'
                                }]
                            })(
                                <Input placeholder="请设置开始时间" style={{ width: 200 }} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="持续时长(分钟)"
                        >
                            {getFieldDecorator('Duration', {
                                initialValue: this.state.dataModel.Duration,
                                rules: [{
                                    required: true, message: '请设置直播持续时长!',
                                }]
                            })(
                                <InputNumber min={1} max={500} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="直播议程"
                        >
                            {getFieldDecorator('ScheduleInfo', {
                                initialValue: this.state.dataModel.ScheduleInfo,
                                rules: [{
                                    required: true, message: '请录入直播议程安排!',
                                }]
                            })(
                                <TextArea rows={5} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="直播内容简介"
                        >
                            {getFieldDecorator('Description', {
                                initialValue: this.state.dataModel.Description,
                                rules: [{
                                    required: true, message: '请录入直播内容简介!',
                                }]
                            })(
                                <TextArea rows={5} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="主讲人"
                        >
                            {getFieldDecorator('FormOwners', {
                                initialValue: this.state.dataModel.Owners,
                                rules: [{
                                    required: true, message: '请设置主讲人!',
                                }]
                            })(
                                <EditableUserTagGroup smartInputSearchUserList={this.props.smartInputSearchUserList} searchOptions={{ UseType: 12 }} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="主持人"
                        >
                            {getFieldDecorator('FormPresenters', {
                                initialValue: this.state.dataModel.Presenters,
                            })(
                                <EditableUserTagGroup smartInputSearchUserList={this.props.smartInputSearchUserList} searchOptions={{ UseType: 12 }} />
                                )}
                        </FormItem>

                        <FormItem
                            {...formItemLayout}
                            label="嘉宾"
                        >
                            {getFieldDecorator('FormGuests', {
                                initialValue: this.state.dataModel.Guests,
                            })(
                                <EditableUserTagGroup smartInputSearchUserList={this.props.smartInputSearchUserList} searchOptions={{ UseType: 12 }} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="直播视频地址"
                        >
                            {getFieldDecorator('LiveUrl', {
                                initialValue: this.state.dataModel.LiveUrl,
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="直播回放地址"
                        >
                            {getFieldDecorator('VideoUrl', {
                                initialValue: this.state.dataModel.VideoUrl,
                            })(
                                <Input />
                                )}
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
                            label="直播封面"
                        >
                            <img style={{ width: 375 }} src={this.state.dataModel.TitlePages} />
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="直播名称"
                        >
                            <span className="ant-form-text">{this.state.dataModel.LiveName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="直播类型"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_LiveTypes, this.state.dataModel.LiveType)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="直播地点"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_LivePositions, this.state.dataModel.LivePosition).split('-').reverse()[0]}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="开始时间"
                        >
                            <span className="ant-form-text">{this.state.dataModel.BeginTime}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="持续时长(分钟)"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Duration}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="直播议程"
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.ScheduleInfo) }}></span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="直播简介"
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.Description) }}></span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="直播进度"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_LiveProgressStatus, this.state.dataModel.LiveProgress)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="直播视频地址"
                        >
                            <span className="ant-form-text">{this.state.dataModel.LiveUrl}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="直播回放地址"
                        >
                            <span className="ant-form-text">{this.state.dataModel.VideoUrl}</span>
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

const WrappedLiveView = Form.create()(LiveView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        smartInputSearchUserList: bindActionCreators(smartInputSearchUserList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedLiveView);