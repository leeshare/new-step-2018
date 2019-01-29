import React from 'react';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, Radio } from 'antd';

import AudioUpload from '@/components/AudioUpload';
import ImageUpload from '@/components/ImageUpload';
import EditableTagGroup from '@/components/EditableTagGroup'
import './index.less'
const FormItem = Form.Item;
const { TextArea } = Input;

const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const dialogScriptInitState = {
    Actor: '',//角色名称
    Script: '',
    Script_En: '',
    Audio: '',
    FormVoicePath: '',
    Segments: ''
}
class DialogScript extends React.Component {
    state = {};
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.value || { ...dialogScriptInitState }
        };
        props.registerValidor(props.form);
    }
    componentWillReceiveProps(nextProps) {
        // Should be a controlled component.
        if ('value' in nextProps) {
            const value = nextProps.value;
            this.setState({ dataModel: value });
        }
    }

    triggerChange = (changedValue) => {
        // Should provide an event to pass value to Form.
        const onChange = this.props.onChange;
        if(changedValue.Actor!=''){
            changedValue.ActorResID=this.props.actors.find(A=>A.ActorName==changedValue.Actor).ActorID;
        }
        if (onChange) {
            onChange(changedValue);
        }
    }
    handleActorChange = (e) => {
        let dataModel = { ...this.state.dataModel, Actor: e.target.value };
        this.setState({ dataModel: dataModel });
        this.triggerChange(dataModel);
    }
    handleScriptChange = (e) => {
        let dataModel = { ...this.state.dataModel, Script: e.target.value };
        this.setState({ dataModel: dataModel });
        this.triggerChange(dataModel);
    }
    handleScript_EnChange = (e) => {
        let dataModel = { ...this.state.dataModel, Script_En: e.target.value };
        this.setState({ dataModel: dataModel });
        this.triggerChange(dataModel);
    }
    handleSegmentsChange = (value) => {
        let dataModel = { ...this.state.dataModel, Segments: value };
        this.setState({ dataModel: dataModel });
        this.triggerChange(dataModel);
    }
    handleAudioChange = (value) => {
        let dataModel = { ...this.state.dataModel, FormVoicePath: value };
        this.setState({ dataModel: dataModel });
        this.triggerChange(dataModel);
    }

    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        return (
            <div className='dialogscript-area'>
                <FormItem
                    label={`角色设定`}
                >
                    {getFieldDecorator('Actor', {
                        initialValue: this.state.dataModel.Actor,
                        rules: [{
                            required: true, message: '请设定角色!',
                        }],
                    })(
                        <RadioGroup
                            onChange={this.handleActorChange}>
                            {
                                this.props.actors.map((role, index) => {
                                    return <Radio value={role.ActorName}><img src={role.ActorIcon} style={{ width: 25, height: 25 }} /><span>{role.ActorName}</span></Radio>
                                })
                            }
                        </RadioGroup>
                        )}
                </FormItem>
                <FormItem
                    label="脚本"
                >
                    {getFieldDecorator('Script', {
                        initialValue: this.state.dataModel.Script,
                        rules: [{
                            required: true, message: '请输入脚本内容!',
                        }],
                    })(
                        <Input
                            onChange={this.handleScriptChange} />
                        )}
                </FormItem>
                <FormItem
                    label="脚本英文"
                >
                    {getFieldDecorator('Content_En', {
                        initialValue: this.state.dataModel.Script_En,
                        rules: [{
                            required: true, message: '请输入脚本英文内容!',
                        }],
                    })(
                        <Input
                            onChange={this.handleScript_EnChange} />
                        )}
                </FormItem>
                <FormItem
                    label="拆句"
                >
                    {getFieldDecorator('Segments', {
                        initialValue: this.state.dataModel.Segments,
                    })(
                        <EditableTagGroup
                            onChange={this.handleSegmentsChange} />
                        )}
                </FormItem>
                <FormItem
                    label="配音"
                    extra="点击声音图标可以重新上传"
                >
                    {getFieldDecorator('FormVoicePath', {
                        initialValue: this.state.dataModel.Audio,
                        rules: [{
                            required: true, message: '请上传配音!',
                        }]
                    })(
                        <AudioUpload
                            onChange={this.handleAudioChange} />
                        )}
                </FormItem>
            </div>
        );
    }
}

const WrappedDialogScript = Form.create()(DialogScript);

export default WrappedDialogScript;