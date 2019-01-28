import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, Spin, Tabs, message, Alert } from 'antd';

import { getTeacherTeachOverview, updateScheduleInfo, batchAddTeachTask, deleteTeachTask, saveTeachTask } from '@/actions/teach';
import AudioUpload from '@/components/AudioUpload';
import ImageUpload from '@/components/ImageUpload';
import ModalPlayer from '@/components/ModalPlayer';
import CourseView from '@/views/TM_Course/View/lectures';
import ResourceCard from '@/components/ResourceCard';

import ModalSearchCourse from '@/views/TM_Course/ModalSearchCourse'
import ModalSearchTeachCourse from '@/views/TM_TeachPlan/ModalSearchCourse'

import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml } from '@/utils';
import { serverURL } from '@/api/env'
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
class TeachDesignOnline extends React.Component {
    timer = 0;
    uploads = [];
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            dataModel: props.currentDataModel,//数据模型
            schedule_info: {},
            student_teach_records: [],
            userChooseds: [],//选择的
            tabKey: props.tabKey || '1',
            dic_courseWareTypes: [{ "title": "看图识字", "value": "Words", "code": "1", "status": 0 }, { "title": "对话", "value": "Dialog", "code": "2", "status": 0 }, { "title": "跟唱", "value": "Chant", "code": "3", "status": 0 }, { "title": "句型", "value": "Pattern", "code": "4", "status": 0 }, { "title": "听写", "value": "Writing", "code": "5", "status": 0 }, { "title": "朗读", "value": "Reader", "code": "6", "status": 0 }, { "title": "看图说话", "value": "Talk", "code": "7", "status": 0 }, { "title": "讲稿", "value": "Lecture", "code": "8", "status": 0 }],
            dic_unitPartTypes: [{ "title": "Part 1", "value": "1", "code": "", "status": 0 }, { "title": "Part 2", "value": "2", "code": "", "status": 0 }, { "title": "Part 3", "value": "3", "code": "", "status": 0 }, { "title": "Part 4", "value": "4", "code": "", "status": 0 }, { "title": "Part 5", "value": "5", "code": "", "status": 0 }, { "title": "Part 6", "value": "6", "code": "", "status": 0 }]
        };
    }

    componentWillMount() {
        let { teach_schedule_id } = this.state.dataModel;
        this.props.getTeacherTeachOverview(teach_schedule_id).payload.promise.then((response) => {
            let data = response.payload.data;
            this.setState({ ...data, loading: false });
        })
    }
    onCancel = () => {
        this.props.viewCallback(this.state.schedule_info.attachments_kzkj.length);
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let { teach_schedule_id } = this.state.dataModel;
                let { Objectives, Exercises } = values;
                this.props.updateScheduleInfo(teach_schedule_id, Objectives, 'Objectives').payload.promise.then((response) => {
                    this.props.updateScheduleInfo(teach_schedule_id, Exercises, 'Exercises').payload.promise.then((response) => {
                        message.info('信息保存成功')
                    })
                })
            }
        });
    }
    onPlayMedia = (item) => {
        this.setState({ currentMedia: { CourseID: item.courseInfo.id }, showPlayMedia: true })
    }
    onCancelPlay = () => {
        this.setState({ showPlayMedia: false, currentMedia: null })
    }
    emptyHandler = () => { }

    onEditName = (lectureInfo, teachResourceAlias) => {
        this.props.saveTeachTask({ id: lectureInfo.taskId, taskName: teachResourceAlias }).payload.promise.then((response) => {
            var find = this.state.schedule_info.tasks.find(A => A.taskId == lectureInfo.taskId);
            find.taskName = teachResourceAlias;
            this.setState({ schedule_info: this.state.schedule_info })
        });
    }

    onRemove = (lectureInfo) => {
        Modal.confirm({
            title: '你确认要删除该内容吗?',
            content: '请确认',
            onOk: () => {
                this.props.deleteTeachTask({ id: lectureInfo.taskId }).payload.promise.then((response) => {
                    this.state.schedule_info.tasks = this.state.schedule_info.tasks.filter(A => A.taskId != lectureInfo.taskId);
                    this.setState({ schedule_info: this.state.schedule_info })
                });
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
    }
    onSaveSelectedCourse = (courseIDs, taskType) => {
        this.props.batchAddTeachTask({ taskType, teachScheduleId: this.state.schedule_info.teach_schedule_id, courseIds: courseIDs }).payload.promise.then((response) => {
            this.componentWillMount();//刷新数据
            //关闭对话框
            this.setState({ showChooseLearnTask: false, showChooseTeachTask: false });
        })
    }

    render() {
        if (this.state.loading) {
            return <div style={{ width: 100, margin: '300 auto' }}><Spin tip="数据加载中..."></Spin></div>
        }
        const { getFieldDecorator } = this.props.form;
        //在线教案
        let teachTasks = this.state.schedule_info.tasks.filter(a => a.taskType == 1);
        //自主练习作业
        let learnTasks = this.state.schedule_info.tasks.filter(a => a.taskType == 2);
        return (
            <Card title={`教师备课`} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
                <Tabs
                    defaultActiveKey={this.state.tabKey}
                    tabPosition={'right'}
                >
                    <TabPane tab="①基本信息维护" key="1">
                        <div className="form-edit">
                            <Form>
                                <FormItem
                                    {...formItemLayout}
                                    label="学习目标"
                                >
                                    {getFieldDecorator('Objectives', {
                                        initialValue: this.state.schedule_info.objectives,
                                        rules: [{
                                            required: true, message: '请输入学习目标内容!',
                                        }],
                                    })(
                                        <TextArea rows={10} />
                                        )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="课后作业"
                                >
                                    {getFieldDecorator('Exercises', {
                                        initialValue: this.state.schedule_info.exercises,
                                        rules: [{
                                            required: true, message: '请输入课后作业内容!',
                                        }],
                                    })(
                                        <TextArea rows={10} />
                                        )}
                                </FormItem>
                                <FormItem
                                    className='btnControl'
                                    {...btnformItemLayout}
                                >
                                    <Button type="primary" icon="save" onClick={this.onSubmit}>保存</Button> <Button icon="rollback" onClick={this.onCancel} >取消</Button>
                                </FormItem>
                            </Form>
                        </div>
                    </TabPane>
                    <TabPane tab="②在线教学教案" key="2">
                        <Row gutter={24}>
                            {/* 在线教案仅一份 */}
                            {teachTasks.length == 0 && <Col onClick={() => {
                                this.setState({ showChooseTeachTask: true })
                            }} span={6}>
                                <ResourceCard
                                    lecture_info={{ object_type: -1, name: '从网络课教材库中选择' }}
                                    onPlayMedia={this.emptyHandler} />
                            </Col>
                            }
                            {
                                teachTasks.map((item, index) => {
                                    return (
                                        <Col span={6}>
                                            <ResourceCard
                                                lecture_info={item}
                                                onPlayMedia={this.onPlayMedia}
                                                onRemove={() => { this.onRemove(item, 1); }}
                                                onEditName={(teachResourceAlias) => { this.onEditName(item, teachResourceAlias) }} />
                                        </Col>
                                    );
                                })
                            }
                        </Row>
                    </TabPane>
                    <TabPane tab="③课后自主练习" key="3">
                        <Row gutter={24}>
                            <Col onClick={() => {
                                this.setState({ showChooseLearnTask: true })
                            }} span={6}>
                                <ResourceCard
                                    lecture_info={{ object_type: -1, name: '从自主学习任务库查找' }}
                                    onPlayMedia={this.emptyHandler} />
                            </Col>
                            {
                                learnTasks.map((item, index) => {
                                    return (
                                        <Col span={6}>
                                            <ResourceCard
                                                lecture_info={item}
                                                onPlayMedia={this.onPlayMedia}
                                                onRemove={() => { this.onRemove(item, 2); }}
                                                onEditName={(teachResourceAlias) => { this.onEditName(item, teachResourceAlias) }} />
                                        </Col>
                                    );
                                })
                            }
                        </Row>
                    </TabPane>
                </Tabs>
                {
                    this.state.showChooseTeachTask && <Modal
                        width={'80%'}
                        title="从网络课教材库中选择"
                        wrapClassName="vertical-center-modal"
                        visible={this.state.showChooseTeachTask}
                        onOk={() => {
                            this.setState({ showChooseTeachTask: false });
                        }}
                        onCancel={() => {
                            this.setState({ showChooseTeachTask: false });
                        }}
                        footer={null}
                    >
                        <ModalSearchTeachCourse IsMultiple={false} callback={(courseIds) => { this.onSaveSelectedCourse(courseIds, 1); }} />
                    </Modal>
                }
                {
                    this.state.showChooseLearnTask && <Modal
                        width={'80%'}
                        title="从自主学习任务库中选择"
                        wrapClassName="vertical-center-modal"
                        visible={this.state.showChooseLearnTask}
                        onOk={() => {
                            this.setState({ showChooseLearnTask: false });
                            this.onSaveSelectedCourse();
                        }}
                        onCancel={() => {
                            this.setState({ showChooseLearnTask: false });
                        }}
                        footer={null}
                    >
                        <ModalSearchCourse callback={(courseIds) => { this.onSaveSelectedCourse(courseIds, 2); }} />
                    </Modal>
                }
                {
                    this.state.showPlayMedia && <Modal className="playCourse"
                        width={'80%'}
                        title="任务详情"
                        wrapClassName="vertical-center-modal"
                        visible={this.state.showPlayMedia}
                        onOk={() => {
                        }}
                        onCancel={() => {
                            this.setState({ showPlayMedia: false });
                        }}
                        footer={null}
                    >
                        <CourseView viewCallback={() => {
                            this.setState({ showPlayMedia: false });
                        }} {...{ currentDataModel: this.state.currentMedia, editMode: 'View', dic_courseWareTypes: this.state.dic_courseWareTypes, dic_unitPartTypes: this.state.dic_unitPartTypes }} />
                    </Modal>
                }
            </Card >
        );
    }
}

const WrappedTeachDesignOnline = Form.create()(TeachDesignOnline);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        getTeacherTeachOverview: bindActionCreators(getTeacherTeachOverview, dispatch),
        updateScheduleInfo: bindActionCreators(updateScheduleInfo, dispatch),

        batchAddTeachTask: bindActionCreators(batchAddTeachTask, dispatch),
        deleteTeachTask: bindActionCreators(deleteTeachTask, dispatch),
        saveTeachTask: bindActionCreators(saveTeachTask, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachDesignOnline);