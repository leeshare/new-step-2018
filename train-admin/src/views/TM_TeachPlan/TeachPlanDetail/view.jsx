import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, Upload, Radio } from 'antd';

import ImageUpload from '@/components/ImageUpload';
import EditableTagGroup from '@/components/EditableTagGroup'
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml } from '@/utils';

import { serverURL, getToken } from '@/api/env';

import ModalSearchLectureCourse from '@/views/TM_Course/ModalSearchLectureCourse'
const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
};
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class TeachPlanDetailView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
        };
    }

    componentWillMount() {

    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                console.log({
                    ...this.state.dataModel, ...values,
                    JiaoxueCourseID: this.state.dataModel.JiaoxueCourseInfo.CourseID,
                    FormJiaoanResourcePath: (this.state.UploadFileInfo ? this.state.UploadFileInfo.url : '')
                })
                this.props.viewCallback({
                    ...this.state.dataModel, ...values,
                    JiaoxueCourseID: this.state.dataModel.JiaoxueCourseInfo.CourseID,
                    FormJiaoanResourcePath: (this.state.UploadFileInfo ? this.state.UploadFileInfo.url : '')
                });//合并保存数据
            }
        });
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}课次安排`;
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
                var _this = this;
                //文件上次参数设定
                let UploadProps = {
                    name: 'file',
                    multiple: false,
                    accept: 'application/pdf',
                    action: `${serverURL}/Admin/UploadFile?token=${getToken()}`,
                    onChange(info) {
                        if (info.file.status === 'done') {
                            if (!info.file.response.result) {
                                message.error(info.file.response.message);
                            }
                            else {
                                _this.setState({ UploadFileInfo: info.file.response.data })
                            }
                        }
                    },
                }

                let TeachPlanNos = [];
                for (var i = 1; i <= this.props.data_list_total + 1; i++) {
                    TeachPlanNos.push(i);
                }
                block_content = (<div className="form-edit">
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="课次"
                        >
                            {getFieldDecorator('TeachPlanNo', {
                                initialValue: this.state.dataModel.TeachPlanNo,
                                rules: [{
                                    required: true, message: '请设置课次!',
                                }],
                            })(
                                <Select>
                                    {TeachPlanNos.map((item, index) => {
                                        return <Option value={item}>{`第${item}次课`}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="教学任务"
                            extra={this.state.dataModel.JiaoxueCourseInfo ? this.state.dataModel.JiaoxueCourseInfo.CourseName : ''}
                        >
                            {getFieldDecorator('FormJiaoxueCourse1', {
                                initialValue: this.state.dataModel.JiaoxueCourseInfo != null,
                                rules: [{
                                    required: true, message: '请您选择教学任务!',
                                }]
                            })(
                                <div>
                                    <a onClick={() => { this.setState({ showChooseTalkWindow: true }); }}><Radio>选择教学任务</Radio></a>
                                    <Modal width={800}
                                        title="选择教学任务"
                                        wrapClassName="vertical-center-modal"
                                        visible={this.state.showChooseTalkWindow}
                                        onOk={() => {
                                            this.setState({ showChooseTalkWindow: false });
                                        }}
                                        onCancel={() => {
                                            this.setState({ showChooseTalkWindow: false });
                                        }}
                                        footer={null}
                                    >
                                        <ModalSearchLectureCourse callback={(courseInfo) => {
                                            this.state.dataModel.JiaoxueCourseInfo = courseInfo;
                                            this.setState({ dataModel: this.state.dataModel, showChooseTalkWindow: false })
                                        }} />
                                    </Modal>
                                </div>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="上传PDF教案"
                            extra={this.state.dataModel.JiaoAnResourceInfo ? this.state.dataModel.JiaoAnResourceInfo.ResourceName : ''}
                        >
                            {getFieldDecorator('FormJiaoanResourcePath1', {
                                rules: [{
                                    required: true, message: '请您上传PDF教案!',
                                }]
                            })(
                                <Upload {...UploadProps}><Icon className='file-pdf' style={{ margin: 10, fontSize: 16 }} type="upload" /></Upload>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="课次安排描述"
                        >
                            {getFieldDecorator('Description', {
                                initialValue: this.state.dataModel.Description,
                                rules: [{
                                    required: false, message: '请录入教材描述信息!',
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

const WrappedTeachPlanDetailView = Form.create()(TeachPlanDetailView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachPlanDetailView);