import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, Tooltip, Radio, Switch, Tag } from 'antd';

const RadioGroup = Radio.Group;

import AudioPlayer from '@/components/AudioPlayer';
import AudioUpload from '@/components/AudioUpload';
import ImageUpload from '@/components/ImageUpload';
import EditableTagGroup from '@/components/EditableTagGroup'
import ModalSearchBaseLibrary from '../../TM_Course/ModalSearchBaseLibrary'
import ModalSearchCharaterWritingLibrary from '../../TM_Course/ModalSearchCharaterWritingLibrary'

import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dataBind } from '@/utils';
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
class WritingView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            formValidors: [],
            showChooseCharacterWindow: false,
            showChooseSentenceWindow: false,
            currentApplicableScopes: props.currentDataModel.ApplicableScopes || '',
            currentWritingObjects: props.currentDataModel.WritingObjects || [],
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
                    //所选择的听写内容
                    var writingType = "";
                    var formWritingObjects = this.state.currentWritingObjects.map((item, index) => {
                        if (item.Word) {
                            writingType += '1';
                        }
                        else {
                            writingType += '2';
                        }
                        return { ID: item.key, Name: item.Name };
                    })
                    writingType = writingType.split('').join(',');
                    console.log(formWritingObjects)
                    this.props.viewCallback({ ...this.state.dataModel, ...values, FormWritingObjects: formWritingObjects, ApplicableScopes: this.state.currentApplicableScopes, WritingType: writingType });//合并保存数据
                }
            });
        }
    }
    //当前适用对象变化时
    onApplicableScopesChange = (value) => {
        this.setState({ currentApplicableScopes: value });
    }
    //显示搜索库对话库
    onShowChooseLibrary = (writingObjectType) => {
        if (writingObjectType == 1) {
            this.setState({ showChooseCharacterWindow: true, showChooseSentenceWindow: false });
        }
        else {
            this.setState({ showChooseCharacterWindow: false, showChooseSentenceWindow: true });
        }
    }
    //添加用户选择
    onChooseLibrary = (chooseObjtype, chooseObj) => {
        var find = this.state.currentWritingObjects.find(A => A.key == chooseObj.key);
        if (!find) {
            this.state.currentWritingObjects.push(chooseObj);
            //更新
            this.setState({ currentWritingObjects: this.state.currentWritingObjects });
        }
        message.info('添加成功');
    }
    //添加用户选择
    onRemoveLibrary = (chooseObj) => {
        var result = this.state.currentWritingObjects.filter(A => A.key != chooseObj.key);
        //更新
        this.setState({ currentWritingObjects: result });
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}听写库`;
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
                    <Modal width={800}
                        title="从字听写库选择"
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
                        <ModalSearchCharaterWritingLibrary ChooseObjects={this.state.currentWritingObjects} ChooseObjectsChange={this.state.currentWritingObjects.length} ApplicableScopes={this.state.currentApplicableScopes} callback={this.onChooseLibrary} />
                    </Modal>
                    <Modal width={800}
                        title="从词句库中选择"
                        wrapClassName="vertical-center-modal"
                        visible={this.state.showChooseSentenceWindow}
                        onOk={() => {
                            this.setState({ showChooseSentenceWindow: false });
                        }}
                        onCancel={() => {
                            this.setState({ showChooseSentenceWindow: false });
                        }}
                        footer={null}
                    >
                        <ModalSearchBaseLibrary ChooseObjects={this.state.currentWritingObjects} ChooseObjectsChange={this.state.currentWritingObjects.length} ApplicableScopes={this.state.currentApplicableScopes} LibraryType={2} callback={this.onChooseLibrary} />
                    </Modal>
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="适用对象"
                        >
                            <Select onSelect={this.onApplicableScopesChange} value={this.state.currentApplicableScopes}><Option value={''}>不指定</Option>
                                {this.props.dic_ApplicableScopes.map((item) => {
                                    return <Option value={item.value}>{item.title}</Option>
                                })}
                            </Select>

                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="听写内容"
                        >
                            <Row>
                                {this.state.currentWritingObjects.map((item, index) => {
                                    return (<Col span={24} style={{ marginBottom: 10 }}>
                                        <Tag key={item.key} closable={true} afterClose={() => this.onRemoveLibrary(item)}>
                                            {item.Name}
                                        </Tag>
                                    </Col>
                                    );
                                })}
                                <Col span={24} style={{ marginBottom: 10 }}>
                                    <Button size="small" type="dashed" onClick={() => { this.onShowChooseLibrary(1) }}>+从字听写库选择</Button>
                                    <Button size="small" style={{ marginLeft: 10 }} type="dashed" onClick={() => { this.onShowChooseLibrary(2) }}>+从词句库选择</Button>
                                </Col>
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
                        <FormItem
                            {...formItemLayout}
                            label="听写内容"
                        >
                            <span className="ant-form-text">{this.state.dataModel.WritingContent}</span>
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

const WrappedWritingView = Form.create()(WritingView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedWritingView);