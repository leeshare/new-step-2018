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
import './index.less';

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class ChannelView extends React.Component {
    constructor(props) {
        super(props);
        var d = props.currentDataModel;
        var tags = [];
        var _increment = 1;
        var isExistBlank = false;
        if((d.tags || []).length){
          (d.tags || []).map(t => {
            if(!t.label){
              isExistBlank = true;
            }
            tags.push({
              value: t.value,
              label: t.label,
              autoIncrement: _increment
            })
            _increment += 1;
          })
        }
        if(!isExistBlank){
          _increment += 1;
          tags.push({
            value: '',
            label: '',
            autoIncrement: _increment,
          })
        }
        this.state = {
            dataModel: d,//数据模型
            showAddGroupName: false,
            dic_GroupNames: props.dic_GroupNames,
            tags: tags
        };
        (this: any).removeTag = this.removeTag.bind(this);
        (this: any).changeTag = this.changeTag.bind(this);
        this.autoIncrement = _increment + 1;
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

                    var tags = [];
                    var ts = that.state.tags;
                    for(var i = 0; i < ts.length; i++){
                      var isExist = false;
                      if(!ts[i].label){
                        continue;
                      }
                      for(var j = 0; j < tags.length; j++){
                        if(ts[i].label == tags[j]){
                          isExist = true;
                          break;
                        }
                      }
                      if(!isExist){
                        tags.push(ts[i].label);
                      }
                    }
                    var tagObj = {tagNames: tags.join('#x#')}
                    that.props.viewCallback({ ...that.state.dataModel, ...values, ...tagObj  });//合并保存数据
                }
            });
        }
    }
    removeTag(tagTitle){
      var tags = this.state.tags;
      for(var i = 0; i < tags.length; i++){
        if(tags[i].label == tagTitle){
          tags.splice(i, 1);
          this.setState({
            tags: tags
          })
          break;
        }
      }
    }
    changeTag(e, id){
      var v = e.target.value;
      //var lv = e.target.defaultValue;
      var tags = this.state.tags || [];
      var isExistBlank = false;
      for(var i = 0; i < tags.length; i++){
        if(tags[i].autoIncrement == id){
          tags[i].label = v;
        }else if(tags[i].label){

        }
        else {
          isExistBlank = true;
          break;
        }
      }
      if(!isExistBlank){
        this.autoIncrement += 1;
        //var _auto = this.autoIncrement;
        tags.push({
          value: '',
          label: '',
          autoIncrement: this.autoIncrement
        })
        this.setState({
          tags: tags
        })
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
                var tagBlock = [];
                this.state.tags.map((tag, index) => {
                    tagBlock.push(
                        <div>
                            {getFieldDecorator('TagNames' + tag.autoIncrement, {
                                initialValue: tag.label,
                                rules: [{
                                    required: false, message: YSI18n.get('请输入'),
                                }],
                            })(
                                <Input className='ant-input22' onChange={(e) => this.changeTag(e, tag.autoIncrement)} />
                            )}

                            {tag.label && <Button onClick={() => this.removeTag(tag.label)}>删除</Button>}
                        </div>
                    )
                })
                block_content = (<div className="form-edit">
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('频道名称')}
                        >
                            {getFieldDecorator('InfoChannelName', {
                                initialValue: this.state.dataModel.InfoChannelName,
                                rules: [{
                                    required: true, message: YSI18n.get('PleaseInput'),
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('OrderNo')}
                        >
                            {getFieldDecorator('OrderNum', {
                                initialValue: this.state.dataModel.OrderNum,
                                rules: [{
                                    required: true, message: YSI18n.get('PleaseChoose'),
                                }],
                            })(
                                <InputNumber min={1} max={100} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('标签')}
                        >
                          {tagBlock}
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
                            label={YSI18n.get('频道名称')}
                        >
                            <span className="ant-form-text">{this.state.dataModel.InfoChannelName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('OrderNo')}
                        >
                            <span className="ant-form-text">{this.state.dataModel.OrderNum}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('Status')}
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_Status, this.state.dataModel.Status)}</span>
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


const WrappedDictionaryView = Form.create()(ChannelView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDictionaryView);
