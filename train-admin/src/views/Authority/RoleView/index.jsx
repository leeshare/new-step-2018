import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card } from 'antd';
import ButtonGroup from '@/components/ButtonGroup';

import { formItemLayout, formItemLayout24 } from '@/utils/componentExt';

import { YSI18n, getDictionaryTitle, getViewEditModeTitle, dataBind } from '@/utils';
import { getRoleFunList } from '@/actions/admin';
const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;
const { TextArea } = Input;
import './index.less'
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class RoleView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            roleFuns: []//授权功能
        };
    }

    componentWillMount() {
        this.props.getRoleFunList(this.state.dataModel.RoleID).payload.promise.then((response) => {
            let data = response.payload.data;
            //this.setState({ roleFuns: ['002-001', '002-002'] });//调试
            this.setState({ roleFuns: data.data_list })
        })
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
                    this.props.viewCallback({ ...this.state.dataModel, ...values, Functions: this.state.roleFuns });//合并保存数据
                }
            });
        }
    }
    onCheck = (checkedKeys, info) => {
        this.setState({ roleFuns: checkedKeys });
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return <span>{YSI18n.get('Role')}<Icon type="arrow-right" />{op}</span>;
    }
    //权限树
    renderTree(menus) {
        if (!menus) { return null };
        return menus.map((item) => {
            let childs = this.renderTree(item.child);
            let title = item.name;// + ":" + item.key;
            return <TreeNode title={title} key={item.key} isLeaf={childs == null}>{childs}</TreeNode>
        })
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
        let filterMenus = this.props.menus.filter(A => A.name != "首页");
        let block_funTree = this.renderTree(filterMenus);
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('RoleName')}
                        >
                            {getFieldDecorator('RoleName', {
                                initialValue: this.state.dataModel.RoleName,
                                rules: [{
                                    required: true, message: YSI18n.get('PleaseInput'),
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('Description')}
                        >
                            {getFieldDecorator('Description', {
                                initialValue: this.state.dataModel.Description
                            })(
                                <TextArea rows={4} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('Status')}
                        >
                            {getFieldDecorator('Status', { initialValue: dataBind(this.state.dataModel.Status) })(
                                <Select>
                                    {this.props.dic_Status.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('RoleFuns')}
                        >
                            <div className={'funTree'}>
                                <Tree
                                    checkable
                                    defaultExpandAll={true}
                                    checkedKeys={this.state.roleFuns}
                                    onCheck={this.onCheck}
                                >
                                    {block_funTree}
                                </Tree>
                            </div>
                        </FormItem>
                        {this.renderBtnControl()}
                    </Form>
                );
                break;
            case "View":
            case "Delete":
                block_content = (
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('RoleName')}
                        >
                            <span className="ant-form-text">{this.state.dataModel.RoleName}</span>
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
                            label={YSI18n.get('RoleFuns')}
                        >
                            <div className={'funTree'}>
                                <Tree
                                    checkable
                                    defaultExpandAll={true}
                                    checkedKeys={this.state.roleFuns}
                                >
                                    {block_funTree}
                                </Tree>
                            </div>
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

const WrappedRoleView = Form.create()(RoleView);

const mapStateToProps = (state) => {
    return {
        menus: state.menu.items
    }
};

function mapDispatchToProps(dispatch) {
    return {
        getRoleFunList: bindActionCreators(getRoleFunList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedRoleView);