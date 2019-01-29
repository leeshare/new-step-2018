import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Card, InputNumber, Radio, Tree, message,
} from 'antd';
import ButtonGroup from '@/components/ButtonGroup';
const RadioGroup = Radio.Group;
const TreeNode = Tree.TreeNode;

import { formItemLayout, formItemLayout24, loadBizDictionary, } from '@/utils/componentExt';
import { YSI18n, getDictionaryTitle, getViewEditModeTitle, dataBind, split } from '@/utils';
const FormItem = Form.Item;
const { TextArea } = Input;

import { loadDictionary } from '@/actions/dic';
//业务接口方法引入
import { courseListQuery, departmentListSimpleQuery, employeeListQuery } from '@/actions/file';
import { getRoleFunList } from '@/actions/admin';
import './index.less'
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class AuthEdit extends React.Component {
    constructor(props) {
        super(props);
        var d = props.currentDataModel || {};
        var _c_list = [];
        var _c_list_names = [];
        if(d.AuthUserList && d.AuthUserList.length){
          d.AuthUserList.map(a => {
            _c_list.push(a.uid);
            _c_list_names.push(a.realName);
          });
        }
        this.state = {
            dataModel: d,//数据模型
            showAddGroupName: false,
            dic_GroupNames: props.dic_GroupNames,
            //roleFuns: [], //授权功能

            FolderID: d.Folder.FolderID,
            //FolderID: d.id,

            course_list: [],
            department_list: [],
            employee_list: [],
            modal_department_show: false,
            employee_list: [],
            employee_choose: _c_list,
            employee_choose_names: _c_list_names,
        };
        this.loadBizDictionary = loadBizDictionary.bind(this);
        (this: any).setEmployeeToDepartment = this.setEmployeeToDepartment.bind(this);
        (this: any).iteratorTree = this.iteratorTree.bind(this);
    }

    componentWillMount() {
      this.loadBizDictionary(['dic_YesNo']);
      if(this.props.isZb){
        this.getCourse();
        this.getDepartment();
      }else {
        this.getEmployee();
      }
    //   this.props.getRoleFunList(this.state.dataModel.RoleID).payload.promise.then((response) => {
    //         let data = response.payload.data;
    //         this.setState({ roleFuns: data.data_list })
    //   })
    }
    getCourse(){
      this.props.courseListQuery({options: {CourseType: 1}}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message || '出错');
            }
            else {
                let list =[{courseSpecialty:'0',courseName:'公开资料'}]
                list =[...list,...data.data_list];
                this.setState({ course_list: list })
            }
      })
    }
    getDepartment(){
      var that = this;
      this.props.departmentListSimpleQuery().payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message || '出错');
            }
            else {
              if(data.data_list.length>0){
                that.getEmployee();
              }
              this.setState({ department_list: data.data_list })
            }
      })
    }
    getEmployee(){
      var that = this;
      this.props.employeeListQuery({conditions: {UserType: this.props.orgUserType, Status: 1,PageIndex:1,PageSize:9999, isSimple:true}}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                that.setState({ loading: false })
                message.error(data.message || '出错');
            }
            else {
                that.setState({ employee_list: data.data_list })
                if(that.props.isZb){
                  //that.setEmployeeToDepartment(data.data_list);
                }else {
                  that.setState({
                    department_list: [{
                      Child: [],
                      Department: {
                        DepartmentID: '00000000-0000-0000-0000-000000000000',
                        DepartmentName: this.props.orgName
                      }
                    }]
                  })
                }
                that.setEmployeeToDepartment(data.data_list);
            }
      })
    }
    setEmployeeToDepartment(list){
      //if(list.length){
        this.iteratorTree(this.state.department_list);
        this.setState({
          tree_load_finish: true
        })
      //}
    }
    iteratorTree(depts) {
        var that = this;
        if (!depts) { return null };
        return depts.map((item) => {
            var childs = this.iteratorTree(item.Child);
            //let title = item.Department.DepartmentName;
            //let key = item.Department.DepartmentID;
            that.state.employee_list.map(e => {
              if(e.user.department_id == item.Department.DepartmentID){
                item.Child.push({
                  Department: {
                    DepartmentID: e.user.uid,
                    DepartmentName: e.user.realName,
                  },
                  //Child: [],
                  Child: null,
                  is_employee: true,
                })
              }
            })
            return childs;
            /*return <TreeNode title={title} key={key}
              isLeaf={childs == null} disableCheckbox
            >{childs}</TreeNode>*/
        })
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
        var that = this;
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
                    var params = {
                      parentFolderId: '00000000-0000-0000-0000-000000000000',
                      folderName: values.FolderName,
                      folderType: 1,
                      isToOrgRead: values.IsToOrgRead || 0,
                      authorizationType: values.AuthorizationType=='0'?'':values.AuthorizationType,
                      personInCharge: that.state.employee_choose.join(','),
                      folderID: that.state.FolderID,
                      OrderNum: values.OrderNum,
                    };

                    that.props.viewCallback(params);//合并保存数据
                }
            });
        }
    }
    onOrgReadChange(e){
      var f = this.state.dataModel.Folder;
      f.IsToOrgRead = e.target.value;
      this.setState({Folder: f});
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return <span>{YSI18n.get('Dictionary')}<Icon type="arrow-right" />{op}</span>;
    }
    //权限树
    renderTree(menus) {
        if (!menus || menus.length==0) { return null };
        return menus.map((item) => {
            let childs = this.renderTree(item.Child);
            let title = item.Department.DepartmentName;
            let key = item.Department.DepartmentID;
            if(item.is_employee){
              return <TreeNode title={title} key={key}
                isLeaf={childs == null}
              >{childs}</TreeNode>
            }else {
              return <TreeNode　 title={title} key={key}
                isLeaf={childs == null} disableCheckbox
              >{childs}</TreeNode>
            }
        })
    }
    showModal = () => {
      if(this.state.tree_load_finish){
        this.setState({modal_department_show: true})
      }else {
        message.info('请稍等，正在加载数据中...');
      }
    }
    hideModal = () => {
      this.setState({modal_department_show: false})
    }
    onCheck = (checkedKeys, info) => {
        //this.setState({ roleFuns: checkedKeys });
        var names = [];
        info.checkedNodes.map(n => {
          names.push(n.props.title);
        })
        this.setState({ employee_choose: checkedKeys, employee_choose_names: names });
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
        var d = this.state.dataModel;
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (<div className="form-edit">
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('目录名称')}
                        >
                            {getFieldDecorator('FolderName', {
                                initialValue: d.Folder.FolderName,
                                rules: [{
                                    required: true, message: YSI18n.get('PleaseInput'),
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        {!!this.props.isZb && <FormItem {...formItemLayout} label="是否允许盟校校长查看？">
                          {getFieldDecorator('IsToOrgRead', {
                            initialValue: dataBind(d.Folder.IsToOrgRead),
                          })(
                            <RadioGroup value={dataBind(d.Folder.IsToOrgRead)} hasFeedback onChange={(e) =>this.onOrgReadChange(e)} className='radiogroup'>
                              {this.state.dic_YesNo.map((item, index) => {
                                return <Radio value={item.value} key={index}>{item.title}</Radio>
                              })}
                            </RadioGroup>

                            )}
                        </FormItem>}
                        {!!this.props.isZb && d.Folder.IsToOrgRead == 1 && <FormItem {...formItemLayout} label="选择可查看课程">
                          {getFieldDecorator('AuthorizationType', {
                            initialValue: dataBind(d.Folder.AuthorizationType==''?'0':d.Folder.AuthorizationType),
                            rules: [{ required: true, message: '选择可查看课程!' }],
                          })(
                            <Select>
                              {this.state.course_list.map((item, index) => {
                                return <Option value={item.courseSpecialty} key={index}>{item.courseName}</Option>
                              })}
                            </Select>
                            )}
                        </FormItem>}
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('负责人')}
                        >
                          <Button type="primary" onClick={this.showModal}>打开员工列表</Button>
                          <p>{this.state.employee_choose_names.join(',')}</p>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('目录排序')}
                        >
                            {getFieldDecorator('OrderNum', {
                                initialValue: d.Folder.OrderNum,
                                rules: [{
                                    required: true, message: YSI18n.get('PleaseInput'),
                                }, {
                                  validator: (rule, value, callback) => {
                                    var regex = /^[0-9]*$/;
                                    if (!regex.test(value)) {
                                      callback('请输入数字！')
                                    } else {
                                      callback();
                                    }
                                  }
                                }],
                            })(
                                <Input style={{width: 200}} />
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
                            label={YSI18n.get('目录名称')}
                        >
                            <span className="ant-form-text">{d.Folder.FolderName}</span>
                        </FormItem>
                        {!!this.props.isZb && <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('是否允许盟校校长查看')}
                        >
                            <span className="ant-form-text">{d.Folder.IsToOrgRead == 1 ? '是' : '否'}</span>
                        </FormItem> }
                        {!!this.props.isZb && d.Folder.IsToOrgRead == 1 && <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('课程')}
                        >
                          {getFieldDecorator('AuthorizationType', {
                            initialValue: dataBind(d.Folder.AuthorizationType==''?'0':d.Folder.AuthorizationType),
                            rules: [{ required: true, message: '选择可查看课程!' }],
                          })(
                            <Select disabled>
                              {this.state.course_list.map((item, index) => {
                                return <Option value={item.courseSpecialty} key={index}>{item.courseName}</Option>
                              })}
                            </Select>
                            )}
                        </FormItem> }
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('负责人')}
                        >
                            <span className="ant-form-text">{this.state.employee_choose_names.join(',')}</span>
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

        //let filterMenus = this.props.menus.filter(A => A.name != "首页");
        let departments = this.state.department_list;
        let block_funTree = this.renderTree(departments);

        return (
            <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />{YSI18n.get('Back')}</a>}>
                {block_editModeView}
                <Modal
                  //popup
                  title="选择员工"
                  visible={this.state.modal_department_show}
                  onOk={this.hideModal}
                  onCancel={this.hideModal}
                  //animationType="slide-up"
                  //maskClosable={true}
                  okText="确认"
                  cancelText="关闭"
                  width={640}

                >
                  <div className='funTree' style={{height:640,overflow:'auto'}}>
                      <Tree
                          checkable
                          defaultExpandAll={true}
                          checkedKeys={this.state.employee_choose}
                          onCheck={this.onCheck}
                      >
                          {block_funTree}
                      </Tree>
                  </div>
                </Modal>

            </Card>
        );
    }
}

const WrappedAuthEdit = Form.create()(AuthEdit);

const mapStateToProps = (state) => {
    let { Dictionarys } = state.dic;
    var userType = state.auth.user.user_type;
    var orgName = '';
    //if(state.auth.user.role_contexts && state.auth.user.role_contexts.length){
    //  orgName = state.auth.user.role_contexts[0].orgName;
    //}
    return {
      Dictionarys,
      menus: state.menu.items,
      isZb: userType == 3,  //3 总部
      orgUserType: (userType == 2 || userType == 4 || userType == 5 || userType == 7) ? 2457 : 3,
      userType,
      orgName
    };
};

function mapDispatchToProps(dispatch) {
    return {
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        courseListQuery: bindActionCreators(courseListQuery, dispatch),
        departmentListSimpleQuery: bindActionCreators(departmentListSimpleQuery, dispatch),
        employeeListQuery: bindActionCreators(employeeListQuery, dispatch),

        getRoleFunList: bindActionCreators(getRoleFunList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAuthEdit);
