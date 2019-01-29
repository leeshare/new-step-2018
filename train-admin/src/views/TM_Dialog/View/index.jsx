import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, Tooltip } from 'antd';

import AudioPlayer from '@/components/AudioPlayer';
import AudioUpload from '@/components/AudioUpload';
import ImageUpload from '@/components/ImageUpload';
import EditableTagGroup from '@/components/EditableTagGroup'
import DialogScript from '@/components/DialogScript'

import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml } from '@/utils';
import './index.less';

const dialogScriptInitState = {
    Actor: '',//角色名称
    Script: '',
    Script_En: '',
    Audio: '',
    FormVoicePath: '',
    Segments: '',
    OrderNo: 0,
}

const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
};
const sortDialogScripts = (scripts) => {
    var sortScripts = scripts.sort((a, b) => {
        if (a.OrderNo > b.OrderNo)
            return 1;
        else
            return -1;
    });
    sortScripts.map((item, index) => {
        item.OrderNo = index + 1;
    })
    return sortScripts;
}
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class DialogView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            formValidors: [],
        };
    }

    componentWillMount() {
        if (this.props.editMode == 'Create') {
            this.onDialogScriptAdd(-1)
        }
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
                title: '你确认要删除该对话吗?',
                content: '如果对话已经使用，则不能被删除！',
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
                this.state.formValidors.map((dialogForm) => {
                    dialogForm.validateFields((dialogErr, dialogValues) => {
                        dialogForm.hasError = dialogErr;
                        allErr = allErr || dialogErr;
                    })
                });
                allErr = allErr || err;
                console.log(this.state.dataModel);
                if (!allErr) {
                    this.setState({ loading: true });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 3000);//合并保存数据
                    this.props.viewCallback({ ...this.state.dataModel, ...values });//合并保存数据
                }
            });
        }
    }

    onDialogScriptChange(index, dialogInfo) {
        this.state.dataModel.Scripts[index] = dialogInfo;
        this.setState({ dataModel: this.state.dataModel })//更新
    }
    onDialogScriptAdd(index) {
        this.state.dataModel.Scripts = this.state.dataModel.Scripts || [];
        this.state.dataModel.Scripts.splice(index + 1, 0, { ...dialogScriptInitState, OrderNo: index + 2 });
        this.setState({ dataModel: this.state.dataModel })//更新
    }

    onDialogScriptDelete(index) {
        if (this.state.dataModel.Scripts.length == 1) {
            message.warn("最少保留一个对话脚本！")
            return false;
        }
        Modal.confirm({
            title: '你确认要删除该对话脚本吗?',
            content: '请再次确认',
            onOk: () => {
                //console.log('删除索引' + index)
                //console.log("前->" + JSON.stringify(this.state.dataModel.Scripts))
                let filterScripts = this.state.dataModel.Scripts.filter((item, i) => { return i != index });
                //console.log("后->" + JSON.stringify(filterScripts))
                //删除后，重新赋予OrderNo连贯性
                //fixed:删除数组中间的元素，先显示一条，让内部循环组件重置，然后再显示所有的数组元素
                this.setState({ dataModel: { ...this.state.dataModel, Scripts: [sortDialogScripts(filterScripts)[0]] } })
                setTimeout(() => {
                    this.setState({ dataModel: { ...this.state.dataModel, Scripts: sortDialogScripts(filterScripts) } })//更新
                }, 200)
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
    }
    onDialogScriptSort(direct, index) {
        if (direct < 0 && index > 0) {//向上排序  
            let temp_orderNo = this.state.dataModel.Scripts[index + direct].OrderNo;
            this.state.dataModel.Scripts[index + direct].OrderNo = this.state.dataModel.Scripts[index].OrderNo;
            this.state.dataModel.Scripts[index].OrderNo = temp_orderNo;
            //重新排序
            this.state.dataModel.Scripts = sortDialogScripts(this.state.dataModel.Scripts);
            this.setState({ dataModel: this.state.dataModel })//更新
        }
        else if (direct < 0 && index <= 0) {
            message.warning('已经是第一个了')
        }
        else if (direct > 0 && index < this.state.dataModel.Scripts.length - 1) {//向下排序
            let temp_orderNo = this.state.dataModel.Scripts[index + direct].OrderNo;
            this.state.dataModel.Scripts[index + direct].OrderNo = this.state.dataModel.Scripts[index].OrderNo;
            this.state.dataModel.Scripts[index].OrderNo = temp_orderNo;
            //重新排序
            this.state.dataModel.Scripts = sortDialogScripts(this.state.dataModel.Scripts);
            this.setState({ dataModel: this.state.dataModel })//更新
        }
        else if (direct > 0 && index >= this.state.dataModel.Scripts.length - 1) {
            message.warning('已经是最后一个了')
        }
    }


    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}对话`;
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
                console.log('detail scripts->' + JSON.stringify(this.state.dataModel.Scripts))
                block_content = (<div className="form-edit">
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="知识点"
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
                            label="对话"
                        >
                            {getFieldDecorator('Content', {
                                initialValue: this.state.dataModel.Content,
                                rules: [{
                                    required: true, message: '请输入对话内容!',
                                }],
                            })(
                                <TextArea rows={3} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="对话英文"
                        >
                            {getFieldDecorator('Content_En', {
                                initialValue: this.state.dataModel.Content_En,
                                rules: [{
                                    required: false, message: '请输入对话英文内容!',
                                }],
                            })(
                                <TextArea rows={3} />
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
                            label="配图"
                            extra="点击图片可以重新上传"
                        >
                            {getFieldDecorator('FormImagePath', {
                                initialValue: this.state.dataModel.SceneImage,
                                rules: [{
                                    required: true, message: '请上传对话配图!',
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
                            label="对话脚本"
                        >
                            {
                                this.state.dataModel.Scripts.map((item, index) => {
                                    //let control_key=`Script_${index}_${Math.floor(Math.random()*10000)}`;
                                    let control_key = `Script_${index}`;
                                    return <Card title={`脚本${index + 1}`} extra={
                                        <div>
                                            <Tooltip placement="top" title={'在此之后添加新的脚本'} onClick={() => { this.onDialogScriptAdd(index) }}>
                                                <Button style={{ marginLeft: 8 }} icon="plus"></Button>
                                            </Tooltip>
                                            <Tooltip placement="top" title={'删除当前脚本'} onClick={() => { this.onDialogScriptDelete(index) }}>
                                                <Button style={{ marginLeft: 8 }} icon="minus"></Button>
                                            </Tooltip>
                                            <Tooltip placement="top" title={'向前调整脚本顺序'}>
                                                <Button style={{ marginLeft: 8 }} icon="arrow-up" onClick={() => { this.onDialogScriptSort(-1, index) }}></Button>
                                            </Tooltip>
                                            <Tooltip placement="top" title={'向后调整脚本顺序'}>
                                                <Button style={{ marginLeft: 8 }} icon="arrow-down" onClick={() => { this.onDialogScriptSort(1, index) }}></Button>
                                            </Tooltip>
                                        </div>}>
                                        {getFieldDecorator(control_key, { initialValue: item })(
                                            <DialogScript registerValidor={(form) => {
                                                this.state.formValidors[index] = form;
                                                this.setState({ formValidors: this.state.formValidors })
                                            }} actors={this.props.dic_Actors} onChange={(dialogInfo) => {
                                                this.onDialogScriptChange(index, dialogInfo)
                                            }} />
                                        )}

                                    </Card>

                                })
                            }
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
                                        required: true, message: '请对本次对话修改进行说明!',
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
                            label="知识点"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Knowledges}</span>
                        </FormItem>                        
                        <FormItem
                            {...formItemLayout}
                            label="关键字"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Keywords}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="对话"
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.Content) }}></span> <a onClick={() => { this.onPlayAudio(this.state.dataModel.SceneVoice) }}><Icon type="sound" /></a>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="对话-英文"
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.Content_En) }}></span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="对话脚本"
                        >
                            {this.state.dataModel.Scripts.map((item, index) => {
                                return (
                                    <Row type="flex" justify="center">
                                        <Col span={1}>{index + 1}.</Col>
                                        <Col span={1}><img src={this.state.dataModel.Actors[item.Actor]} style={{ width: 25, height: 25 }} />
                                            <br />
                                            <span style={{ width: '100%', display: 'inline-block', textAlign: 'center' }}>{item.Actor}</span>
                                        </Col>
                                        <Col span={20}>
                                            <div>
                                                {item.Script} <a onClick={() => { this.onPlayAudio(item.Audio) }}><Icon type="sound" /></a>
                                            </div>
                                            <div style={{ fontStyle: 'italic' }}>{item.Script_En}</div>
                                            拆词:[{item.Segments.join(' ')}]
                                        </Col>
                                    </Row>
                                );
                            })}
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

const WrappedDialogView = Form.create()(DialogView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDialogView);