import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, Tag } from 'antd';

import AudioPlayer from '@/components/AudioPlayer';
import AudioUpload from '@/components/AudioUpload';
import ImageUpload from '@/components/ImageUpload';
import EditableTagGroup from '@/components/EditableTagGroup'
import ModalSearchBaseLibrary from '../../TM_Course/ModalSearchBaseLibrary'
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
class CharacterWritingView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            showAddCharacterTag: false,
            showChooseCharacterWindow: false,
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
                title: '你确认要删除吗?',
                content: '如果听写内容已经使用，则不能被删除！',
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

    onShowChooseWindow(tagType) {
        if (tagType == "Character") {
            this.setState({ showChooseCharacterWindow: true })
        }
    }
    onCloseTag(tagType, selectedObj) {
        if (tagType == "Character") {
            this.setState({ showAddCharacterTag: true, showChooseCharacterWindow: true })
        }
    }

    //选中后预览
    onUnitPreView = (type, selectedObj) => {
        this.setState({ hasChange: true });//有数据变动
        if (type == 91) {
            this.setState({
                dataModel: { ...this.state.dataModel, CharacterID: selectedObj.CharacterID, Word: selectedObj.Word, Phonetic: selectedObj.Phonetic },
                showChooseCharacterWindow: false,
                showAddCharacterTag: false
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
                console.log(this.state.dataModel);
                block_content = (<div className="form-edit">
                    <Modal width={800}
                        title="从字库选择"
                        wrapClassName="vertical-center-modal"
                        visible={this.state.showChooseCharacterWindow}
                        onOk={() => {
                            this.setState({ showChooseCharacterWindow: false });
                        }}
                        onCancel={() => {
                            this.setState({ showChooseCharacterWindow: false });
                        }}
                        footer={null}
                    >
                        <ModalSearchBaseLibrary LibraryType={1} callback={this.onUnitPreView} />
                    </Modal>
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="字">
                            {this.state.showAddCharacterTag || (!this.state.dataModel.CharacterID) ? <Button size="small" type="dashed" onClick={() => { this.onShowChooseWindow('Character') }}>+ 选择字</Button> : <Tag closable onClose={() => { this.onCloseTag('Character') }}>{this.state.dataModel.Word} {this.state.dataModel.Phonetic}</Tag>}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="听写内容"
                            extra="例如:白色的白"
                        >
                            {getFieldDecorator('Content', {
                                initialValue: this.state.dataModel.Content,
                                rules: [{
                                    required: true, message: '请输入听写内容!',
                                }],
                            })(
                                <Input />
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
                            label="字"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Word}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="拼音"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Phonetic}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="听写内容"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Content}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="配音"
                        >
                            <a onClick={() => { this.onPlayAudio(this.state.dataModel.WordVoice) }}><Icon type="sound" /></a>
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

const WrappedCharacterWritingView = Form.create()(CharacterWritingView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCharacterWritingView);