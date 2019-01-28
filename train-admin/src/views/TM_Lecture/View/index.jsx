import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber } from 'antd';

import ModalPlayer from '@/components/ModalPlayer';
import VideoUpload from '@/components/VideoUpload';
import AudioUpload from '@/components/AudioUpload';
import ImageUpload from '@/components/ImageUpload';
import EditableTagGroup from '@/components/EditableTagGroup'
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml } from '@/utils';
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
class LectureView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
        };
    }

    componentWillMount() {

    }
    onShowMediaPlayer = (mediaType, url) => {
        this.setState({ currentMedia: { object_type: mediaType, media_info: { media_url: url } }, showPlayMedia: true });
    }
    onCancelPlay = () => {
        this.setState({ currentMedia: null, showPlayMedia: false });
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        if (this.props.editMode == "Delete") {
            Modal.confirm({
                title: '你确认要删除该讲稿吗?',
                content: '如果讲稿已经使用，则不能被删除！',
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
                    this.props.viewCallback({ ...this.state.dataModel, ...values });//合并保存数据
                }
            });
        }
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}讲稿`;
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
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="讲稿名称"
                        >
                            {getFieldDecorator('CourseWareName', {
                                initialValue: this.state.dataModel.CourseWareName,
                                rules: [{
                                    required: true, message: '请输入讲稿名称!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="关键字"
                        >
                            {getFieldDecorator('Keywords', {
                                initialValue: this.state.dataModel.Keywords,
                                rules: [{
                                    required: false, message: '关键字!',
                                }],
                            })(
                                <EditableTagGroup />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="文稿图"
                            extra="点击图片可以重新上传"
                        >
                            {getFieldDecorator('FormBgImagePath', {
                                initialValue: this.state.dataModel.SceneImage,
                                rules: [{
                                    required: true, message: '请上传讲稿文稿图!',
                                }]
                            }
                            )(
                                <ImageUpload />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="视频"
                            extra="点击图标可以重新上传"
                        >
                            {getFieldDecorator('FormVideoPath', {
                                initialValue: this.state.dataModel.SceneVideo,
                                rules: [{
                                    required: false, message: '请上传视频!',
                                }]
                            })(
                                <VideoUpload />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="音频"
                            extra="点击声音图标可以重新上传"
                        >
                            {getFieldDecorator('FormVoicePath', {
                                initialValue: this.state.dataModel.SceneVoice,
                                rules: [{
                                    required: false, message: '请上传音频!',
                                }]
                            })(
                                <AudioUpload />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="教学批注"
                        >
                            {getFieldDecorator('Remark', {
                                initialValue: this.state.dataModel.Remark,
                                rules: [{
                                    required: false, message: '请设置教学批注!',
                                }]
                            })(
                                <TextArea rows={4} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="适用对象"
                        >
                            {getFieldDecorator('ApplicableScopes', { initialValue: this.state.dataModel.ApplicableScopes })(
                                <Select><Option value={''}>不指定</Option>
                                    {this.props.dic_ApplicableScopes.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
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
                                        required: true, message: '请对本次讲稿修改进行说明!',
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
                            label="讲稿名称"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.CourseWareName}</span>
                        </FormItem>
                        {this.state.dataModel.SceneImage != '' ?
                            <FormItem
                                {...formItemLayout}
                                label="文稿图"
                            >
                                <img style={{ width: 300 }} src={this.state.dataModel.SceneImage} />
                            </FormItem> : ''}
                        {this.state.dataModel.SceneVideo != '' ?
                            <FormItem
                                {...formItemLayout}
                                label="视频"
                            >
                                <a onClick={() => { this.onShowMediaPlayer(3, this.state.dataModel.SceneVideo) }}> <Icon type="play-circle-o" />播放</a>
                            </FormItem> : ''}
                        {this.state.dataModel.SceneVoice != '' ?
                            <FormItem
                                {...formItemLayout}
                                label="音频"
                            >
                                <a onClick={() => { this.onShowMediaPlayer(2, this.state.dataModel.SceneVoice) }}> <Icon type="sound" />播放</a>
                            </FormItem> : ''}
                        <FormItem
                            {...formItemLayout}
                            label="教学批注"
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.Remark) }}></span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="关键字"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Keywords}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="适用对象"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_ApplicableScopes, this.state.dataModel.ApplicableScopes)}</span>
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
                {
                    this.state.currentMedia ? <ModalPlayer lecture_info={this.state.currentMedia} visible={this.state.showPlayMedia} onCancel={this.onCancelPlay} /> : ''
                }
                {block_editModeView}
            </Card>
        );
    }
}

const WrappedLectureView = Form.create()(LectureView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedLectureView);