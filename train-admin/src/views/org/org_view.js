//机构详情 2019-02-03

import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select,
  Button, Icon, Table, Card, InputNumber, DatePicker,
  Radio, Checkbox
} from 'antd';

import ImageCutUpload from '@/components/ImageCutUpload';
import { getDictionaryTitle, getViewEditModeTitle,
  convertTextToHtml, dataBind, dateFormat, timestampToTime
} from '@/utils';
const FormItem = Form.Item;
const TextArea = Input.TextArea;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const { TextAre, Search } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
};
import './index.less';
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class OrgView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel || { isDefaultOrg: 0, status: 1, id: 0 },//数据模型
            disabled: false,
            loading: false,
        };
    }

    componentWillMount() {

    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        var that = this;
        if(this.state.dataModel.isDefaultOrg == 1){
          message.warning('默认机构不能删除');
          return;
        }
        if (this.props.editMode == "Delete") {
            Modal.confirm({
                title: '你确认要删除该机构吗?',
                content: '请确认',
                onOk: () => {
                    this.props.viewCallback(this.state.dataModel, true);//保存数据
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
                    //按钮点击后加装状态
                    that.setState({ loading: true });
                    setTimeout(() => {
                        that.setState({ loading: false });
                    }, 3000);//合并保存数据
                    this.props.viewCallback({ ...that.state.dataModel, ...values });//合并保存数据
                }
            });
        }
    }
    /*onSearchUserInfo = (e) => {
        this.props.getUserInfoByUserName(e.target.value).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.UserID != '') {
                this.setState({ findUser: true });
                message.info('根据邮箱找到对应用户!')
                this.setState({dataModel:{...this.state.dataModel,...data}});
            }
            else {
                this.setState({ findUser: false });
            }
        })
    }*/
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}机构信息`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode == 'Create' || this.props.editMode == 'Edit') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" disabled={this.state.disabled} loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '保存')}</Button>
                <Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else if(this.props.editMode == 'Delete') {
          return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" disabled={this.state.disabled} loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '保存')}</Button>
                <Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
                let defaultBirthDate = dateFormat(new Date(), 'yyyy-MM-dd')
                block_content = (<div className="form-edit">
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="机构名称"
                        >
                            {getFieldDecorator('name', {
                                initialValue: this.state.dataModel.name,
                                rules: [{
                                    required: true, message: '请输入机构名称!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="机构编号"
                        >
                            {getFieldDecorator('code', {
                                initialValue: this.state.dataModel.code,
                                rules: [{
                                    required: true, message: '请输入机构编号!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="是否默认机构"
                        >
                            {getFieldDecorator('isDefaultOrg', {
                                initialValue: dataBind(this.state.dataModel.isDefaultOrg),
                            }
                            )(
                                <RadioGroup size="large">
                                    <RadioButton value="1">是</RadioButton>
                                    <RadioButton value="0">否</RadioButton>
                                </RadioGroup>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="状态"
                        >
                            {getFieldDecorator('status', {
                                initialValue: dataBind(this.state.dataModel.status),
                            }
                            )(
                                <RadioGroup size="large">
                                    <RadioButton value="1">启用</RadioButton>
                                    <RadioButton value="0">停用</RadioButton>
                                </RadioGroup>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="机构简介"
                        >
                            {getFieldDecorator('remark', {
                                initialValue: this.state.dataModel.remark,
                                rules: [{
                                    required: false, message: '备注!',
                                }]
                            })(
                                <TextArea rows={5} />
                                )}
                        </FormItem>
                        {this.renderBtnControl()}
                    </Form>
                </div>
                );
                break;
            case "View":
            case "Delete":
                block_content = (
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="机构名称"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.name}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="机构编号"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.code}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="是否默认机构"
                        >
                            <span className="ant-form-text" >{getDictionaryTitle(this.props.dic_YesNo, this.state.dataModel.isDefaultOrg)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='机构简介'
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.remark) }}></span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="状态"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_Status, this.state.dataModel.status)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="创建信息"
                        >
                            <span className="ant-form-text">{timestampToTime(this.state.dataModel.createdDate)} by {this.state.dataModel.createdUserName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="修改信息"
                        >
                            <span className="ant-form-text">{timestampToTime(this.state.dataModel.updatedDate)} by {this.state.dataModel.updatedUserName}</span>
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
                {block_editModeView}
            </Card>
        );
    }
}

const WrappedOrgView = Form.create()(OrgView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedOrgView);
