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
class CharacterView extends React.Component {
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
                title: '你确认要删除该字吗?',
                content: '如果字已经使用，则不能被删除！',
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
        return `${op}字`;
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
                let auditStatus = this.props.dic_AuditStatus.filter(A => A.value < 2);
                block_content = (<div className="form-edit">
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="字"
                        >
                            {getFieldDecorator('CharacterName', {
                                initialValue: this.state.dataModel.Word,
                                rules: [{
                                    required: true, message: '请输入字名称!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="字-英文"
                        >
                            {getFieldDecorator('CharacterName_En', {
                                initialValue: this.state.dataModel.Word_En,
                                rules: [{
                                    required: true, message: '请输入字英文翻译!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="混淆字"
                        >
                            {getFieldDecorator('ConfusedWords', {
                                initialValue: this.state.dataModel.ConfusedWords,
                                rules: [{
                                    required: true, message: '请输入混淆字!',
                                }],
                            })(
                                <EditableTagGroup />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="音标"
                        >
                            {getFieldDecorator('Phonetic', {
                                initialValue: this.state.dataModel.Phonetic,
                                rules: [{
                                    required: true, message: '请输入音标!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="偏旁部首"
                        >
                            {getFieldDecorator('SideCharactor', {
                                initialValue: this.state.dataModel.SideCharactor,
                                rules: [{
                                    required: true, message: '请输入偏旁部首!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="字结构"
                        >
                            {getFieldDecorator('StructureType', {
                                initialValue: this.state.dataModel.StructureType,
                                rules: [{
                                    required: true, message: '请输入字结构!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="笔画数"
                        >
                            {getFieldDecorator('Strokes', {
                                initialValue: this.state.dataModel.Strokes,
                                rules: [{
                                    required: true, message: '请输入笔画数!',
                                }]
                            })(
                                <InputNumber min={1} max={50} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="书写动画"
                            extra="点击字可以重新上传"
                        >
                            {getFieldDecorator('FormGifPath', {
                                initialValue: this.state.dataModel.WritingGif,
                                rules: [{
                                    required: true, message: '请上传书写动画!',
                                }]
                            }
                            )(
                                <ImageUpload />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="配音"
                            extra="点击声音图标可以重新上传"
                        >
                            {getFieldDecorator('FormVoicePath', {
                                initialValue: this.state.dataModel.WordVoice,
                                rules: [{
                                    required: true, message: '请上传配音!',
                                }]
                            })(
                                <AudioUpload />
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
                                        required: true, message: '请对本次字修改进行说明!',
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
                            label="书写动画"
                        >
                            <img style={{ width: 100 }} src={this.state.dataModel.WritingGif} />
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="字"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Word}</span> <a onClick={() => { this.onPlayAudio(this.state.dataModel.WordVoice) }}><Icon type="sound" /></a>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="字-英文"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Word_En}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="混淆字"
                        >
                            <span className="ant-form-text">{this.state.dataModel.ConfusedWords}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="音标"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Phonetic}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="偏旁部首"
                        >
                            <span className="ant-form-text">{this.state.dataModel.SideCharactor}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="字结构"
                        >
                            <span className="ant-form-text">{this.state.dataModel.StructureType}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="笔画数"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Strokes}</span>
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
                <AudioPlayer ref="audioPlayer" />
                {block_editModeView}
            </Card>
        );
    }
}

const WrappedCharacterView = Form.create()(CharacterView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCharacterView);