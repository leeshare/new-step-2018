import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber } from 'antd';

import AudioPlayer from '@/components/AudioPlayer';
import AudioUpload from '@/components/AudioUpload';
import ImageUpload from '@/components/ImageUpload';
import EditableTagGroup from '@/components/EditableTagGroup'
import { getDictionaryTitle, getViewEditModeTitle } from '@/utils';
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
class ResourceView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
        };
    }

    componentWillMount() {

    }
    onPlayAudio(audioUrl) {
        this.refs.audioPlayer.play(audioUrl);
    }

    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        if (this.props.editMode == "Delete") {
            Modal.confirm({
                title: '你确认要删除该资源吗?',
                content: '如果资源已经使用，则不能被删除！',
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
        return `${op}资源`;
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
                            label="资源名称"
                        >
                            {getFieldDecorator('CharacterName', {
                                initialValue: this.state.dataModel.ResourceName,
                                rules: [{
                                    required: true, message: '请输入资源名称!',
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
                            })(
                                <EditableTagGroup />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="资源描述"
                        >
                            {getFieldDecorator('Description', {
                                initialValue: this.state.dataModel.Phonetic,
                            })(
                                <Input />
                                )}
                        </FormItem>
                        {
                            this.props.currentDataModel.ResourceType == 1 ?
                                <FormItem
                                    {...formItemLayout}
                                    label="配图"
                                    extra="点击图片可以重新上传"
                                >
                                    {getFieldDecorator('FormFilePath', {
                                        initialValue: this.state.dataModel.FileUrl,
                                        rules: [{
                                            required: true, message: '请上传资源对应的图片!',
                                        }]
                                    }
                                    )(
                                        <ImageUpload />
                                        )}
                                </FormItem> : ''
                        }
                        {
                            this.props.currentDataModel.ResourceType == 2 ?
                                <FormItem
                                    {...formItemLayout}
                                    label="配音"
                                    extra="点击声音图标可以重新上传"
                                >
                                    {getFieldDecorator('FormFilePath', {
                                        initialValue: this.state.dataModel.FileUrl,
                                        rules: [{
                                            required: true, message: '请上传配音!',
                                        }]
                                    })(
                                        <AudioUpload />
                                        )}
                                </FormItem> : ''
                        }
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
                        {
                            this.props.currentDataModel.ResourceType == 1 ?
                                <FormItem
                                    {...formItemLayout}
                                    label="资源配图"
                                >
                                    <img style={{ width: 400 }} src={this.state.dataModel.FileUrl} />
                                </FormItem> : ''
                        }
                        {
                            this.props.currentDataModel.ResourceType == 2 ?
                                <FormItem
                                    {...formItemLayout}
                                    label="资源配音"
                                >
                                    <a onClick={() => { this.onPlayAudio(this.state.dataModel.FileUrl) }}><Icon type="sound" /></a>
                                </FormItem> : ''
                        }
                        <FormItem
                            {...formItemLayout}
                            label="资源名称"
                        >
                            <span className="ant-form-text">{this.state.dataModel.ResourceName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="关键字"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Keywords}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="资源描述"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Description}</span>
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
                <AudioPlayer ref="audioPlayer" />
                {block_editModeView}
            </Card>
        );
    }
}

const WrappedResourceView = Form.create()(ResourceView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedResourceView);