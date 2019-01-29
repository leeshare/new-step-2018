import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, AutoComplete } from 'antd';
import moment from 'moment';

import ImageUpload from '@/components/ImageUpload';
import EditableUserTagGroup from '@/components/EditableUserTagGroup';
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dateFormat, dataBind } from '@/utils';
import { smartInputSearchUserList } from '@/actions/admin';
import './index.less';
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
class FeedbackView extends React.Component {
    constructor(props) {
        super(props)
        let formImagePaths = props.currentDataModel.Images.map((item) => {
            let { ResourceID } = item;
            return { value: `resource://${ResourceID}`, url: item.Cover };
        });
        formImagePaths.push({ value: '', url: '' });
        props.currentDataModel.FormImagePaths_Temp = formImagePaths;
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
        if (this.props.editMode == "Delete") {
            Modal.confirm({
                title: '你确认要删除该图包吗?',
                content: '如果图包已经使用，则不能被删除！',
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
                    //,UTCBeginTime:utcBeginTime 
                    this.props.viewCallback({ ...this.state.dataModel, ...values, FormImagePaths: this.state.dataModel.FormImagePaths_Temp.filter(A => A != '').map(A => A.value) });//合并保存数据
                }
            });
        }
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `处理用户反馈`;
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
                block_content = (<div className="form-edit">
                    <Form >
                        <FormItem
                            {...formItemLayout}
                            label="反馈日期"
                        >
                            <span className="ant-form-text">{this.state.dataModel.CreatedDate} by {this.state.dataModel.CreatedUserInfo.name}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="用户反馈"
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.FeedContent) }}></span>
                        </FormItem>
                        {
                            this.state.dataModel.Images.length > 0 &&

                            <FormItem
                                {...formItemLayout}
                                label="图片"
                            >
                                <Row gutter={24}>
                                    {this.state.dataModel.Images.map((item, index) => {
                                        return <Col span={12} style={{ marginBottom: 24, overflow: 'hidden' }}>
                                            <img style={{ width: '300px', height: '300px' }} src={item.Cover} />
                                        </Col>
                                    })
                                    }
                                </Row>
                            </FormItem>
                        }
                        <FormItem
                            {...formItemLayout}
                            label="处理结果"
                        >
                            {getFieldDecorator('ReplyContent', {
                                initialValue: this.state.dataModel.ReplyContent,
                                rules: [{
                                    required: true, message: '请录入处理结果!',
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
                            label="用户反馈"
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.FeedContent) }}></span>
                        </FormItem>
                        {
                            this.state.dataModel.Images.length > 0 &&

                            <FormItem
                                {...formItemLayout}
                                label="图片"
                            >
                                <Row gutter={24}>
                                    {this.state.dataModel.Images.map((item, index) => {
                                        return <Col span={12} style={{ marginBottom: 24, overflow: 'hidden' }}>
                                            <img style={{ width: '300px', height: '300px' }} src={item.Cover} />
                                        </Col>
                                    })
                                    }
                                </Row>
                            </FormItem>
                        }
                        <FormItem
                            {...formItemLayout}
                            label="处理结果"
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.ReplyContent) }}></span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="反馈日期"
                        >
                            <span className="ant-form-text">{this.state.dataModel.CreatedDate} by {this.state.dataModel.CreatedUserInfo.name}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="处理日期"
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
            <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
                {block_editModeView}
            </Card>
        );
    }
}

const WrappedImagePackageView = Form.create()(FeedbackView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        smartInputSearchUserList: bindActionCreators(smartInputSearchUserList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedImagePackageView);