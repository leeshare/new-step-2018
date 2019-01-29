import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, Radio, Checkbox } from 'antd';
import { YSI18n, getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dataBind, dateFormat } from '@/utils';
const FormItem = Form.Item;
const TextArea = Input.TextArea;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const { TextAre, Search } = Input;
import ImageUpload from '@/components/ImageUpload';
import './index.less';
import RotateSource from './rotateSource';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const formItemLayout = {
    labelCol: { span: 2 },
    wrapperCol: { span: 21 },
};
//import './index.less';
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class RotationView extends React.Component {
    constructor(props) {
        super(props)
        let formImagePaths = [{ value: props.currentDataModel.Path, url: props.currentDataModel.ImagePath }];
        props.currentDataModel.FormImagePaths_Temp = formImagePaths;
        let source = { value: props.currentDataModel.SourceID, label: props.currentDataModel.SourceTitle }
        props.currentDataModel.source = source;
        let contentInfo = {}
        if (props.currentDataModel) {
            if (props.currentDataModel.SourceType != 3) {
                contentInfo = { id: props.currentDataModel.SourceID, title: props.currentDataModel.SourceTitle };
            } else {
                contentInfo = { id: props.currentDataModel.SourceID, title: props.currentDataModel.SourceID }
            }
        }
        this.state = {
            dataModel: props.currentDataModel || {},//数据模型
            disabled: false,
            loading: false,
            showFiles: false,
            sourceType: props.currentDataModel.SourceType || 1,
            contentInfo: contentInfo
        };
    }

    componentWillMount() {

    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = (status) => {
        if (this.props.editMode == "Delete") {
            Modal.confirm({
                title: '你确认要删除吗?',
                content: '请确认',
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
            let that = this;
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    //按钮点击后加装状态
                    let dataModel = this.state.dataModel;
                    if (dataModel.FormImagePaths_Temp.length < 0 || !dataModel.FormImagePaths_Temp[0].url) {
                        message.info("请上传轮播图片");
                        return;
                    }
                    that.setState({ loading: true });
                    setTimeout(() => {
                        that.setState({ loading: false });
                    }, 3000);//合并保存数据
                    that.props.viewCallback({ ...that.state.dataModel, ...values, contentInfo: that.state.contentInfo });//合并保存数据
                }
            });
        }
    }
    onOpenfiles = () => {
        this.setState({ showFiles: true })
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}轮播图信息`;
    }
    onPreView() {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                var dataModel = this.state.dataModel;
                dataModel.title = values.title;
                dataModel.content = values.content;
                this.setState({ dataModel: dataModel });
            }
        });
        this.setState({ showPrevHtml: true })
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                {this.props.editMode != 'Delete' && <Button type="primary" disabled={this.state.disabled} loading={this.state.loading} icon="save"
                    onClick={() => { this.onSubmit(1) }} className='button_send'>{'保存'}</Button>}
                {this.props.editMode == 'Delete' && <Button type="primary" disabled={this.state.disabled} loading={this.state.loading} icon="save"
                    onClick={() => { this.onSubmit(0) }} className='button_send'>{'删除'}</Button>}
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

    ontypeChange(e) {
        // console.log(`radio checked:${e.target.value}`);
        this.setState({ sourceType: e.target.value, contentInfo: {} });
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
                            label="图片"
                            extra="建议尺寸：1024*478px；大小：200kb左右"
                        >
                            <Row className="AppBackGroundImageList">
                                {this.state.dataModel.FormImagePaths_Temp.map((item, index) => {
                                    return <div className='dv_img_list' style={{ marginBottom: 24 }}>
                                        <ImageUpload index={index} value={item.url} functionType={'OtherFiles'} onChange={(value, url) => {
                                            var item = this.state.dataModel.FormImagePaths_Temp[index];
                                            // if (item.value == '' && this.state.dataModel.FormImagePaths_Temp.length < 3) {
                                            //     this.state.dataModel.FormImagePaths_Temp.push({ value: '', url: '' })
                                            // }
                                            item.value = value;
                                            item.url = url;
                                            this.setState({ dataModel: this.state.dataModel })
                                        }} onDelete={() => {
                                            //var item = this.state.dataModel.FormImagePaths_Temp[index];
                                            this.state.dataModel.FormImagePaths_Temp = this.state.dataModel.FormImagePaths_Temp.filter((a, b) => { return b != index });
                                            // console.log(this.state.dataModel.FormImagePaths_Temp)
                                            if (this.state.dataModel.FormImagePaths_Temp.length < 1 && !this.state.dataModel.FormImagePaths_Temp.find(item => item.value == '')) {
                                                this.state.dataModel.FormImagePaths_Temp.push({ value: '', url: '' })
                                            }
                                            this.setState({ dataModel: this.state.dataModel })
                                        }} />
                                    </div>
                                })
                                }
                            </Row>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="轮播图类型"

                        >
                            {getFieldDecorator('SourceType', {
                                initialValue: dataBind(this.state.sourceType),
                                rules: [{
                                    required: true, message: '请选择轮播图类型',
                                }]
                            }
                            )(
                                <RadioGroup size="large" onChange={(e) => { this.ontypeChange(e) }}>
                                    <RadioButton value="1">资讯</RadioButton>
                                    <RadioButton value="2">活动</RadioButton>
                                    <RadioButton value="3">外链</RadioButton>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="来源"
                        >
                            {getFieldDecorator('SourceTitle', {
                                initialValue: this.state.contentInfo.title,
                                rules: [{
                                    required: true, message: '请选择来源',
                                }]
                            })(
                                //<div style={{ marginTop: 8 }}>
                                // <CheckboxGroup options={channelList} onChange={this.onChannelChange} />
                                //</div>
                                <div>
                                    <Row type='flex'>
                                        <Col span={24}>
                                            {this.state.sourceType == 1 &&
                                                <Button type="primary" disabled={this.state.disabled} loading={this.state.loading} icon="save"
                                                    onClick={() => { this.onOpenfiles() }} className='button_send' style={{ marginRight: 10 }}>{'选择来源'}</Button>
                                            }
                                            <Input disabled={this.state.sourceType != 3} style={{ width: 480 }} value={this.state.contentInfo.title} onChange={(value) => {
                                                this.setState({ contentInfo: { id: value.target.value, title: value.target.value } })
                                            }} />
                                        </Col>
                                    </Row>
                                </div>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label={YSI18n.get('顺序号')}
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
                            label={YSI18n.get('Status')}
                        >
                            {getFieldDecorator('Status', {
                                initialValue: dataBind(this.state.dataModel.Status?this.state.dataModel.Status.toString():"1" ||"1"),
                                rules: [{
                                    required: true, message: YSI18n.get('PleaseChoose'),
                                }],
                            })(
                                // <Select>
                                //     <Option value="1">启用</Option>
                                //     <Option value="2">停用</Option>
                                // </Select>
                                <RadioGroup size="large" >
                                    <RadioButton value="1">启用</RadioButton>
                                    <RadioButton value="0">停用</RadioButton>
                                </RadioGroup>
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
                            label="轮播图类型"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.SourceType == 1 ? '资讯' : this.state.dataModel.SourceType == 2 ? '活动' : '外链'}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='图片'
                            className='ant-table'
                        >
                            {
                                <div className='img_wrap'><img style={{ width: '100%', height: '100%' }} className='img_item'
                                    src={this.state.dataModel.ImagePath} /></div>
                            }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="来源"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.SourceTitle}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="顺序号"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.OrderNum}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="状态"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.Status == 1 ? '启用' : '停用'}</span>
                        </FormItem>
                        {this.renderBtnControl()}
                    </Form>
                );
                break;
        }
        return block_content;
    }

    callback(dataModel) {
        if (dataModel) {
            this.setState({ contentInfo: dataModel });
        }
    }
    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        return (
            <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
                {block_editModeView}
                {
                    this.state.showFiles && this.state.sourceType == 1 ?
                        <Modal width={800}
                            title="添加链接"
                            closable={true}
                            wrapClassName="vertical-center-modal"
                            visible={true}
                            cancelText="取消"
                            onCancel={() => {
                                this.setState({ showFiles: false, contentInfo: {} });
                            }}
                            onOk={() => {
                                this.setState({ showFiles: false });
                            }}
                            // footer={null}
                            className='modal_rotate'
                        >
                            {this.state.sourceType == 1 && <RotateSource sourceType={this.state.sourceType} callback={(dataModel) => { this.callback(dataModel) }} />}
                        </Modal> : ''
                }
            </Card>
        );
    }
}

const WrappedStudentView = Form.create()(RotationView);

const mapStateToProps = (state) => {
    let userInfo = state.auth.user;
    return {
        userInfo: userInfo,
    }
};

function mapDispatchToProps(dispatch) {
    return {

    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedStudentView);
