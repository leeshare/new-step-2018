import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber } from 'antd';
import ButtonGroup from '@/components/ButtonGroup';

import { formItemLayout, formItemLayout24 } from '@/utils/componentExt';
import { YSI18n, getDictionaryTitle, getViewEditModeTitle } from '@/utils';
const FormItem = Form.Item;
const { TextArea } = Input;
const DefineDictionaryForm = Form.create()(
    (props) => {
        const { visible, onCancel, onCreate, form } = props;
        const { getFieldDecorator } = form;
        return (
            <Modal
                visible={visible}
                title={YSI18n.get('DictionaryType')}
                okText={YSI18n.get('Create')}
                cancelText={YSI18n.get('Cancel')}
                onCancel={onCancel}
                onOk={onCreate}
            >
                <Form layout="vertical">
                    <FormItem label={YSI18n.get('DictionaryType')}>
                        {getFieldDecorator('GroupName', {
                            rules: [{ required: true, message: YSI18n.get('PleaseInput') }],
                        })(
                            <Input />
                            )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
);
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class DictionaryView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            showAddGroupName: false,
            dic_GroupNames: props.dic_GroupNames,
        };
    }

    componentWillMount() {

    }
    showModal = () => {
        this.setState({ showAddGroupName: true });
    }
    handleCancel = () => {
        this.setState({ showAddGroupName: false });
    }
    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.setState({ dic_GroupNames: [{ title: values.GroupName, value: values.GroupName }, ...this.state.dic_GroupNames], showAddGroupName: false });

            //重置
            form.resetFields();
        });
    }
    saveFormRef = (form) => {
        this.form = form;
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        if (this.props.editMode == "Delete") {
            Modal.confirm({
                title: YSI18n.get('DeleteConfirmTitle'),
                content: YSI18n.get('DeleteConfirmContent'),
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
        return <span>{YSI18n.get('Dictionary')}<Icon type="arrow-right" />{op}</span>;
    }
    //表单按钮处理
    renderBtnControl() {
        const btnformItemLayout = {
            wrapperCol: { span: 24 },
        };
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <ButtonGroup>
                    <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{YSI18n.get('Save')}</Button>
                    <Button icon="rollback" onClick={this.onCancel} >{YSI18n.get('Cancel')}</Button>
                </ButtonGroup>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <ButtonGroup>
                    <Button onClick={this.onCancel} icon="rollback">{YSI18n.get('Back')}</Button>
                </ButtonGroup>
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
                            label={YSI18n.get('DictionaryItemTitle')}
                        >
                            {getFieldDecorator('Title', {
                                initialValue: this.state.dataModel.Title,
                                rules: [{
                                    required: true, message: YSI18n.get('PleaseInput'),
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('DictionaryItemValue')}
                        >
                            {getFieldDecorator('Value', {
                                initialValue: this.state.dataModel.Value,
                                rules: [{
                                    required: true, message: YSI18n.get('PleaseInput'),
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('DictionaryType')}
                            extra={this.props.editMode == 'Create' ? <Button icon="plus" onClick={this.showModal}>{YSI18n.get('DictionaryType')}</Button> : ''}
                        >
                            {getFieldDecorator('GroupName', {
                                initialValue: this.state.dataModel.GroupName,
                                rules: [{
                                    required: true, message: YSI18n.get('PleaseChoose'),
                                }],
                            })(
                                <Select>
                                    {this.state.dic_GroupNames.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('OrderNo')}
                        >
                            {getFieldDecorator('OrderNo', {
                                initialValue: this.state.dataModel.OrderNo,
                                rules: [{
                                    required: true, message: YSI18n.get('PleaseChoose'),
                                }],
                            })(
                                <InputNumber min={1} max={100} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('Description')}
                        >
                            {getFieldDecorator('Description', {
                                initialValue: this.state.dataModel.Description,
                            })(
                                <TextArea rows={4} />
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('Status')}
                        >
                            {getFieldDecorator('Status', {
                                initialValue: (this.state.dataModel.Status || "1").toString(),
                                rules: [{
                                    required: true, message: YSI18n.get('PleaseChoose'),
                                }],
                            })(
                                <Select>
                                    {this.props.dic_Status.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        {this.renderBtnControl()}
                    </Form>
                    <DefineDictionaryForm
                        ref={this.saveFormRef}
                        visible={this.state.showAddGroupName}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                    />
                </div>
                );
                break;
            case "View":
            case "Delete":
                block_content = (
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('DictionaryItemTitle')}
                        >
                            <span className="ant-form-text">{this.state.dataModel.Title}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('DictionaryItemValue')}
                        >
                            <span className="ant-form-text">{this.state.dataModel.Value}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('DictionaryType')}
                        >
                            <span className="ant-form-text">{this.state.dataModel.GroupName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('OrderNo')}
                        >
                            <span className="ant-form-text">{this.state.dataModel.OrderNo}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('Description')}
                        >
                            <span className="ant-form-text">{this.state.dataModel.Description}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('Status')}
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_Status, this.state.dataModel.Status)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('CreateInfo')}
                        >
                            <span className="ant-form-text">{this.state.dataModel.CreatedDate} by {this.state.dataModel.CreatedUserInfo.name}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('UpdateInfo')}
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
            <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />{YSI18n.get('Back')}</a>}>
                {block_editModeView}
            </Card>
        );
    }
}

const WrappedDictionaryView = Form.create()(DictionaryView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDictionaryView);