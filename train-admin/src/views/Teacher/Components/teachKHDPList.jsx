import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, Spin, Tabs, message } from 'antd';

import ModalPlayer from '@/components/ModalPlayer';
import TeachViewStudentKHDP from './teachViewStudentKHDP';
import TeachStudentKHDP from './teachStudentKHDP';
import { getTeacherTeachOverview, postTeacherEval, postTeacherEvalAttachmentShare } from '@/actions/teach';

import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml } from '@/utils';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
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
class TeachKHDPList extends React.Component {
    timer = 0;
    uploads = [];
    constructor(props) {
        super(props)
        this.state = {
            editMode: 'Manage',//Manage|Edit
            currentDataModel: {},
            loading: true,
            dataModel: props.currentDataModel,//数据模型
            schedule_info: {},
            student_teach_records: [],
        };
    }
    onSearch = () => {
        let { teach_schedule_id } = this.state.dataModel;
        this.props.getTeacherTeachOverview(teach_schedule_id).payload.promise.then((response) => {
            let data = response.payload.data;
            this.setState({ ...data, loading: false });
        })
    }
    componentWillMount() {
        this.onSearch();
    }
    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
    };
    //视图回调
    onViewCallback = (dataModel) => {
        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case "Edit": //提交
                    this.props.postTeacherEval(dataModel.teach_record_id, dataModel.teacher_evaluate_content).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            if (dataModel.userChooseds.length > 0) {
                                this.props.postTeacherEvalAttachmentShare(dataModel.teach_record_id, dataModel.userChooseds).payload.promise.then((response) => {
                                    let data = response.payload.data;
                                    if (data.result === false) {
                                        message.error(data.message);
                                    }
                                    else {
                                        this.onSearch();
                                        //进入管理页
                                        this.onLookView("Manage", null);
                                    }
                                })
                            }
                            else {
                                this.onSearch();
                                //进入管理页
                                this.onLookView("Manage", null);
                            }
                        }
                    })
            }
        }
    }

    onCancel = () => {
        if (this.state.editMode == "Edit") {
            this.onViewCallback(null);
        }
        else {
            this.props.viewCallback();
        }
    }

    onPlayMedia = (lecture_info) => {
        this.setState({ currentMedia: lecture_info, showPlayMedia: true })
    }
    onCancelPlay = () => {
        this.setState({ showPlayMedia: false, currentMedia: null })
    }
    emptyHandler = () => { }

    render() {
        if (this.state.loading) {
            return <div style={{ width: 100, margin: '300 auto' }}><Spin tip="数据加载中..."></Spin></div>
        }
        const { getFieldDecorator } = this.props.form;

        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Edit":
                block_content = <TeachStudentKHDP  onPlayMedia={this.onPlayMedia} currentDataModel={this.state.currentDataModel} student_teach_records={this.state.student_teach_records} viewCallback={this.onViewCallback} />
                break;
            case "Manage":
            default:
                block_content = this.state.student_teach_records.sort((A, B) => {
                    if (A.order_no_khdp > B.order_no_khdp) {
                        return 1;
                    }
                    else {
                        return -1;
                    }
                }).map((item, index) => {
                    return (
                        <Row>
                            <Col span={24}>
                                <TeachViewStudentKHDP item={{ ...item }} onPlayMedia={this.onPlayMedia} />
                                <div style={{ borderBottom: 'solid 1px #eee', marginLeft: 120, paddingBottom: 20, marginBottom: 20, textAlign: 'right' }} > <Button type="primary" onClick={() => { this.onLookView('Edit', item) }}>点评学生</Button></div>
                            </Col>

                        </Row>
                    );
                });
                break;
        }
        return (
            <Card title={`立即点评`} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
                {block_content}
                {
                    this.state.currentMedia ? <ModalPlayer lecture_info={this.state.currentMedia} visible={this.state.showPlayMedia} onCancel={this.onCancelPlay} /> : ''
                }
            </Card >
        );
    }
}

const WrappedTeachKHDPList = Form.create()(TeachKHDPList);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        getTeacherTeachOverview: bindActionCreators(getTeacherTeachOverview, dispatch),
        postTeacherEval: bindActionCreators(postTeacherEval, dispatch),
        postTeacherEvalAttachmentShare: bindActionCreators(postTeacherEvalAttachmentShare, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachKHDPList);