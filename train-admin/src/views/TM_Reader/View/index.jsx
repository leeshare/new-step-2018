import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, Tooltip, Radio, Switch } from 'antd';

const RadioGroup = Radio.Group;

import AudioPlayer from '@/components/AudioPlayer';
import AudioUpload from '@/components/AudioUpload';
import ImageUpload from '@/components/ImageUpload';
import EditableTagGroup from '@/components/EditableTagGroup'

import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dataBind } from '@/utils';
import './index.less';

import PinyinView from '../Pinyin'

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
class ReaderView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            formValidors: [],
        };
    }

    componentWillMount() {
    }
    shouldComponentUpdate(nextProps, nextState) {
        return true;
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
                content: '如果朗读已经使用，则不能被删除！',
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
            var allErr = undefined;
            this.props.form.validateFields((err, values) => {
                console.log(this.state.dataModel);
                if (!err) {
                    this.setState({ loading: true });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 3000);//合并保存数据
                    values.FormContentPinyin = values.FormContentPinyin || { ContentPinyin: '', ContentPinyins: [] };
                    //fixed:当网络情况不好时，如果要求显示拼音，而又没有自动完成拼音转换，则提示。
                    if (values.IsShowPhonetic=='1' && values.FormContentPinyin.ContentPinyins.length == 0) {
                        message.warn('请您设置拼音内容！')
                    }
                    else {
                        this.props.viewCallback({ ...this.state.dataModel, ...values, ContentPinyin: values.FormContentPinyin.ContentPinyin });//合并保存数据
                    }
                }
            });
        }
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}朗读`;
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
                            label="知识点"
                            extra=""
                        >
                            {getFieldDecorator('Knowledges', {
                                initialValue: this.state.dataModel.Knowledges,
                                rules: [{
                                    required: true, message: '请输入知识点!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="朗读名称"
                        >
                            {getFieldDecorator('CourseWareName', {
                                initialValue: this.state.dataModel.CourseWareName,
                                rules: [{
                                    required: true, message: '请输入朗读名称!',
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
                                    required: false, message: '请填写关键字!',
                                }],
                            })(
                                <EditableTagGroup />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="朗读内容"
                            extra="输入朗读内容自动完成转换"
                        >
                            {getFieldDecorator('Content', {
                                initialValue: this.state.dataModel.Content,
                                rules: [{
                                    required: true, message: '请输入朗读内容!',
                                }],
                            })(
                                <TextArea rows={10} onBlur={(e) => {
                                    let newDataModel = { ...this.state.dataModel, Content: e.target.value };
                                    this.setState({ dataModel: newDataModel })
                                    this.props.form.setFieldsValue({ FormContentPinyin: newDataModel })
                                }} />
                                )}
                        </FormItem>
                        {
                            this.state.dataModel.IsShowPhonetic == '1' && <FormItem
                                {...formItemLayout}
                                label="朗读拼音"
                                extra="点击内容块即可编辑拼音"
                            > {getFieldDecorator('FormContentPinyin', {
                                initialValue: this.state.dataModel,
                                rules: [{
                                    required: true, message: '请输入朗读拼音内容!',
                                }],
                            })(
                                <PinyinView EditMode='Edit' />
                                )}
                            </FormItem>
                        }
                        <FormItem
                            {...formItemLayout}
                            label="内容布局"
                        >
                            {getFieldDecorator('ContentLayout', {
                                initialValue: dataBind(this.state.dataModel.ContentLayout),
                                rules: [{
                                    required: true, message: '请设置内容布局!',
                                }],
                            })(
                                <RadioGroup onChange={(e) => {
                                    let newDataModel = { ...this.state.dataModel, ContentLayout: e.target.value };
                                    this.setState({ dataModel: newDataModel })
                                    this.props.form.setFieldsValue({ FormContentPinyin: newDataModel })
                                }}>
                                    {this.props.dic_ReaderLayoutTypes.map((item) => {
                                        return <Radio value={item.value}>{item.title}</Radio>
                                    })}
                                </RadioGroup>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="是否显示拼音"
                        >
                            {getFieldDecorator('IsShowPhonetic', {
                                initialValue: dataBind(this.state.dataModel.IsShowPhonetic),
                                rules: [{
                                    required: true, message: '请设置是否显示拼音!',
                                }],
                            })(
                                <RadioGroup onChange={(e) => {
                                    let newDataModel = { ...this.state.dataModel, IsShowPhonetic: e.target.value };
                                    this.setState({ dataModel: newDataModel })
                                    this.props.form.setFieldsValue({ FormContentPinyin: newDataModel })
                                }}>
                                    {this.props.dic_SwitchStatus.map((item) => {
                                        return <Radio value={item.value}>{item.title}</Radio>
                                    })}
                                </RadioGroup>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="配图"
                            extra="点击图片可以重新上传"
                        >
                            {getFieldDecorator('FormImagePath', {
                                initialValue: this.state.dataModel.SceneImage,
                                rules: [{
                                    required: true, message: '请上传朗读配图!',
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
                                initialValue: this.state.dataModel.SceneVoice,
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
                                        required: true, message: '请对本次句型修改进行说明!',
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
                        {this.state.dataModel.SceneImage != '' ?
                            <FormItem
                                {...formItemLayout}
                                label="配图"
                            >
                                <img style={{ width: 300 }} src={this.state.dataModel.SceneImage} />
                            </FormItem> : ''}
                        <FormItem
                            {...formItemLayout}
                            label="朗读名称"
                        >
                            <span className="ant-form-text">{this.state.dataModel.CourseWareName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="知识点"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Knowledges}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="关键字"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Keywords}</span>
                        </FormItem><FormItem
                            {...formItemLayout}
                            label="朗读配音"
                        >
                            {/* <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.Content) }}></span>  */}
                            <a onClick={() => { this.onPlayAudio(this.state.dataModel.SceneVoice) }}><Icon type="sound" /></a>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="朗读内容"
                        >
                            <PinyinView value={this.state.dataModel} />
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="内容布局"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_ReaderLayoutTypes, this.state.dataModel.ContentLayout)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="是否显示拼音"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_SwitchStatus, this.state.dataModel.IsShowPhonetic)}</span>
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

const WrappedReaderView = Form.create()(ReaderView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedReaderView);