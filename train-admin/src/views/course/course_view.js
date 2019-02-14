//course详情 2019-02-13

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
import { train_org_list } from '@/actions/org';
import { train_teacher_list } from '@/actions/user';
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class CourseView extends React.Component {
    constructor(props) {
        super(props);
        var dm = props.currentDataModel || {
              isShow: 1,
              status: 1,
              courseType: 1,
              orgId: '',
              teacherId: '',
              id: 0
            };
        this.state = {
            dataModel: dm,//数据模型
            disabled: false,
            loading: false,
            orgList: [],
            teacherList: [],
            hidePrice: dm.courseType == 2 ? true : false
        };
    }

    componentWillMount() {
      this.getOrgData();
      this.getTeacherData();
    }
    getOrgData = () => {
      this.props.train_org_list().payload.promise.then((response) => {
        let data = response.payload.data || [];
        var list = [];
        if(data.result){
          data.map(a => {
            list.push({
              value: a.id,
              title: a.name + (a.isDefaultOrg == 1 ? '(默认机构)' : '')
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
    getTeacherData = () => {
      this.props.train_teacher_list().payload.promise.then((response) => {
        let data = response.payload.data || [];
        var list = [];
        if(data.result){
          data.list.map(a => {
            list.push({
              value: a.id,
              title: a.realName,
              orgId: a.orgId
            })
          })
          this.setState({
            loading: false,
            allTeacherList: list,
            teacherList: list
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
        if (this.props.editMode == "Delete") {
            if(this.state.dataModel.isShow == 0){
              message.warning('会员不能删除');
              return;
            }
            Modal.confirm({
                title: '你确认要删除此课程吗?',
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
                    if(!values.orgId){
                      message.warning('请选择一个机构');
                      return;
                    }
                    //按钮点击后加装状态
                    that.setState({ loading: true });
                    setTimeout(() => {
                        that.setState({ loading: false });
                    }, 3000);//合并保存数据
                    if(values.courseType == '2'){
                      values.price = 0;
                    }
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
    onOrgChange = (orgId) => {
      var tList = [];
      var tExist = false;
      this.state.allTeacherList.map(t => {
        if(t.orgId == orgId){
          tList.push(t);
          if(this.state.teacherId && t.value == this.state.teacherId){
            tExist = true;
          }
        }
      });
      var m = this.state.dataModel;
      m.orgId = orgId;
      if(!tExist){
        m.teacherId = '';
        //this.state.teacherId = '';
      }
      this.setState({
        teacherList: tList,
        dataModel: m,
        //teacherId: this.state.teacherId
      })
    }
    onTeacherChange = (teacherId) => {
      var m = this.state.dataModel;
      m.teacherId = teacherId;
      this.setState({
        dataModel: m
      })

    }
    onCourseTypeChange = (e) => {
      if(e.target.value == '2'){
        this.setState({ hidePrice: true })
      }else {
        this.setState({ hidePrice: false })
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
                            label="课程名称"
                        >
                            {getFieldDecorator('name', {
                                initialValue: this.state.dataModel.name,
                                rules: [{
                                    required: true, message: '请输入课程名称!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="课程类型"
                        >
                            {getFieldDecorator('courseType', {
                                initialValue: dataBind(this.state.dataModel.courseType),
                            })(
                                <RadioGroup size="large" onChange={this.onCourseTypeChange}>
                                    <RadioButton value="1">收费课</RadioButton>
                                    <RadioButton value="2">免费课</RadioButton>
                                </RadioGroup>
                                )}
                        </FormItem>
                        {!this.state.hidePrice && <FormItem
                            {...formItemLayout}
                            label="定价"
                        >
                            {getFieldDecorator('price', {
                                initialValue: this.state.dataModel.price,
                                rules: [{
                                    required: false, message: '请输入价格!',
                                    pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                }],
                                getValueFromEvent: (event) => {
                                  return event.target.value.replace(/\D/g,'')
                                },
                            })(
                                <Input />
                                )}
                        </FormItem>}
                        <FormItem
                            {...formItemLayout}
                            label="是否会员"
                        >
                            {getFieldDecorator('isShow', {
                                initialValue: dataBind(this.state.dataModel.isShow),
                            }
                            )(
                                <RadioGroup size="large">
                                    <RadioButton value="1">否</RadioButton>
                                    <RadioButton value="0">是</RadioButton>
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
                        <FormItem
                            {...formItemLayout}
                            label="讲师"
                        >
                            {getFieldDecorator('teacherId', {
                                initialValue: this.state.dataModel.teacherId,
                            }
                            )(
                              <Select defaultValue="无" style={{ width: 120 }} onChange={this.onTeacherChange}>
                                {this.state.teacherList.map((item) => {
                                  return <Option value={item.value}>{item.title}</Option>
                                })}
                              </Select>
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
                            label="课程简介"
                        >
                            {getFieldDecorator('courseDesc', {
                                initialValue: this.state.dataModel.courseDesc,
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
                            label="课程名称"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.name}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="课程类型"
                        >
                            <span className="ant-form-text" >{getDictionaryTitle(this.props.dic_course_type, this.state.dataModel.courseType)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="定价"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.price}元</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="是否会员"
                        >
                            <span className="ant-form-text" >{getDictionaryTitle(this.props.dic_YesNo, this.state.dataModel.isShow == 1 ? 0 : 1)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='课程简介'
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.courseDesc) }}></span>
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

const WrappedCourseView = Form.create()(CourseView);

const mapStateToProps = (state) => {
    return {
    }
};

function mapDispatchToProps(dispatch) {
    return {
      train_org_list: bindActionCreators(train_org_list, dispatch),
      train_teacher_list: bindActionCreators(train_teacher_list, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseView);
