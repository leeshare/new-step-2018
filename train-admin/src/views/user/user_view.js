//用户详情 2019-02-12

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

import { train_org_list } from '@/actions/org';

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
class UserView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel || {
              recommendUserId: 0, status: 1, id: 0
            },//数据模型
            disabled: false,
            loading: false,
            orgList: [],
        };
    }

    componentWillMount() {
      if(this.props.user.orgType == 1){
        this.getOrgData();
      }
    }
    getOrgData = () => {
      this.props.train_org_list().payload.promise.then((response) => {
        let data = response.payload.data || [];
        var list = [];
        if(data.result){
          data.map(a => {
            list.push({
              value: a.id,
              title: a.name
            })
          })
          this.setState({
            loading: false,
            orgList: list
          });
        }else {
          message.error(data.message);
          this.setState({ loading: false });
        }
      }).catch(error => {
        message.error(error.message);
        this.setState({ loading: false });
      })
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
    onOrgChange = (e) => {
      if(e){

      }

    }
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
                            label="用户姓名"
                        >
                            {getFieldDecorator('realName', {
                                initialValue: this.state.dataModel.realName,
                                rules: [{
                                    required: true, message: '请输入用户姓名!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="用户名"
                        >
                            {getFieldDecorator('userName', {
                                initialValue: this.state.dataModel.userName,
                                rules: [{
                                    required: true, message: '请输入用户名!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        {this.props.editMode == 'Create' && <FormItem
                            {...formItemLayout}
                            label="密码"
                        >
                            {getFieldDecorator('password', {
                                initialValue: this.state.dataModel.password,
                                rules: [{
                                    required: true, message: '请输入密码!',
                                }],
                            })(
                                <Input type="password" placeholder="输入密码"/>
                                )}
                        </FormItem>}
                        <FormItem
                            {...formItemLayout}
                            label="角色"
                        >
                            {getFieldDecorator('roleType', {
                                initialValue: dataBind(this.state.dataModel.roleType),
                            }
                            )(
                                <RadioGroup size="large">
                                    <RadioButton value="1">管理员</RadioButton>
                                    <RadioButton value="2">机构管理员</RadioButton>
                                    <RadioButton value="3">教师</RadioButton>
                                    <RadioButton value="4">普通用户</RadioButton>
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
                            label="所属机构"
                        >
                            {getFieldDecorator('orgId', {
                                initialValue: this.state.dataModel.orgId,
                            }
                            )(
                              <Select defaultValue="无" style={{ width: 120 }} onChange={this.onOrgChange}>
                                {this.state.orgList.map((item) => {
                                  return <Option value={item.value}>{item.title}</Option>
                                })}
                              </Select>
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
                            label="用户姓名"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.realName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="用户名"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.userName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="角色"
                        >
                            <span className="ant-form-text" >{getDictionaryTitle(this.props.dic_role, this.state.dataModel.roleType)}</span>
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

const WrappedUserView = Form.create()(UserView);

const mapStateToProps = (state) => {
    var u = state.auth.user;
    return {
      user: u,
    }
};

function mapDispatchToProps(dispatch) {
    return {
      train_org_list: bindActionCreators(train_org_list, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedUserView);
