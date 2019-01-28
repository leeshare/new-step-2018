import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, Spin, Tabs, message, Alert } from 'antd';

import { getTeacherTeachOverview, updateScheduleInfo, deleteCategoryResource, editResourceName, saveChoosedTeachResources, batchAddTeachTask, deleteTeachTask, saveTeachTask } from '@/actions/teach';
import AudioUpload from '@/components/AudioUpload';
import ImageUpload from '@/components/ImageUpload';
import ModalPlayer from '@/components/ModalPlayer';
import ResourceCard from '@/components/ResourceCard';
import ModalSearchTeachResource from '../ModalSearchTeachResource'
import ModalSearchPublicResource from '../ModalSearchPublicResource'


import CourseView from '@/views/TM_Course/View/lectures';
import ModalSearchCourse from '@/views/TM_Course/ModalSearchCourse'

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
class TeachDesign extends React.Component {
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
    onPlayCourse = (item) => {
        this.setState({ currentPlayCourse: { CourseID: item.courseInfo.id }, showPlayCourse: true })
    }
    onPlayMedia = (lecture_info) => {
        this.setState({ currentMedia: lecture_info, showPlayMedia: true })
    }
    onCancelPlay = () => {
        this.setState({ showPlayMedia: false, currentMedia: null })
    }
    emptyHandler = () => { }

    onUpload = (lectures) => {
        this.uploads = [...this.uploads, ...lectures];
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            let attachments_kzkj = this.state.schedule_info.attachments_kzkj || [];
            this.state.schedule_info.attachments_kzkj = [...attachments_kzkj, ...this.uploads];
            this.uploads = [];
            this.setState({ schedule_info: this.state.schedule_info })
        }, 500);
    }

    onEditName = (lectureInfo, teachResourceAlias) => {
        this.props.editResourceName(1, lectureInfo.id, teachResourceAlias).payload.promise.then((response) => {
            var find = this.state.schedule_info.attachments_kzkj.find(A => A.lecture_info.id == lectureInfo.id);
            find.lecture_info.name = teachResourceAlias;
            this.setState({ schedule_info: this.state.schedule_info })
        });
    }

    onRemove = (lectureInfo) => {
        Modal.confirm({
            title: '你确认要删除该课件吗?',
            content: '请确认',
            onOk: () => {
                this.props.deleteCategoryResource(1, lectureInfo.id).payload.promise.then((response) => {
                    this.state.schedule_info.attachments_kzkj = this.state.schedule_info.attachments_kzkj.filter(A => A.lecture_info.id != lectureInfo.id);
                    this.setState({ schedule_info: this.state.schedule_info })
                });
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
    }
    onShowModalSearchTeachResource = () => {
        this.setState({ showModalSearchTeachResource: true })
    }
    onHideModalSearchTeachResource = () => {
        this.setState({ showModalSearchTeachResource: false })
    }
    onShowModalSearchPublicResource = () => {
        this.setState({ showModalSearchPublicResource: true })
    }
    onHideModalSearchPublicResource = () => {
        this.setState({ showModalSearchPublicResource: false })
    }
    onSelected = (item, checked) => {
        this.state.userChooseds = this.state.userChooseds.filter(A => A.lecture_info.id != item.lecture_info.id);
        if (checked) {
            this.state.userChooseds.push(item);
        }
        this.setState({ userChooseds: this.state.userChooseds });
        console.log(this.state.userChooseds);
    }
    onSaveUserSelected = () => {
        if (this.state.userChooseds.length > 0) {
            //保存关系
            this.props.saveChoosedTeachResources(
                this.state.schedule_info.teach_schedule_id,
                this.state.showModalSearchTeachResource ? 1 : 2,
                this.state.userChooseds.map(A => A.lecture_info.id)
            ).payload.promise.then((response) => {
                let attachments_kzkj = this.state.schedule_info.attachments_kzkj || [];
                this.state.schedule_info.attachments_kzkj = [...attachments_kzkj, ...response.payload.data];
                this.setState({ schedule_info: this.state.schedule_info, userChooseds: [] })
                this.onHideModalSearchTeachResource();
                this.onHideModalSearchPublicResource();
            });
        }
        else {
            this.onHideModalSearchTeachResource();
        }
    }
    onEditTaskName = (taskInfo, teachResourceAlias) => {
        this.props.saveTeachTask({ id: taskInfo.taskId, taskName: teachResourceAlias }).payload.promise.then((response) => {
            var find = this.state.schedule_info.tasks.find(A => A.taskId == taskInfo.taskId);
            find.taskName = teachResourceAlias;
            this.setState({ schedule_info: this.state.schedule_info })
        });
    }

    onRemoveTask = (taskInfo) => {
        Modal.confirm({
            title: '你确认要删除该内容吗?',
            content: '请确认',
            onOk: () => {
                this.props.deleteTeachTask({ id: taskInfo.taskId }).payload.promise.then((response) => {
                    this.state.schedule_info.tasks = this.state.schedule_info.tasks.filter(A => A.taskId != taskInfo.taskId);
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
            this.setState({ showChooseLearnTask: false, });
        })
    }

    onDownloadClick = () => {
        window.open(`${serverURL}/xuetang/DownloadTeachCourewares?scheduleId=${this.state.dataModel.teach_schedule_id}&forceUpdate=true`)
    }
    render() {
        if (this.state.loading) {
            return <div style={{ width: 100, margin: '300 auto' }}><Spin tip="数据加载中..."></Spin></div>
        }
        const { getFieldDecorator } = this.props.form;
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
                    <TabPane tab="②教学教案维护" key="2">
                        <Row gutter={24}>
                            {this.state.loading ? '' : <Col onClick={() => { this.timer = 300; }} span={6} key={`ResourceCard_${this.state.schedule_info.attachments_kzkj.length + 1}`}>
                                <ResourceCard
                                    lecture_info={{ object_type: 0, name: '上传:视频、音频、图片、文档' }}
                                    onPlayMedia={this.emptyHandler}
                                    onUpload={this.onUpload}
                                    teachScheduleID={this.state.schedule_info.teach_schedule_id} />
                            </Col>
                            }
                            {this.state.loading ? '' : <Col onClick={this.onShowModalSearchTeachResource} span={6}>
                                <ResourceCard
                                    lecture_info={{ object_type: -1, name: '从教案、素材库、往期教学库查找' }}
                                    onPlayMedia={this.emptyHandler} />
                            </Col>
                            }
                            {this.state.loading ? '' : <Col onClick={this.onShowModalSearchPublicResource} span={6}>
                                <ResourceCard
                                    lecture_info={{ object_type: -1, name: '从我的素材库查找' }}
                                    onPlayMedia={this.emptyHandler} />
                            </Col>
                            }
                            {
                                this.state.schedule_info.attachments_kzkj.map((item, index) => {
                                    return (
                                        <Col span={6}>
                                            <ResourceCard
                                                lecture_info={item.lecture_info}
                                                onPlayMedia={this.onPlayMedia}
                                                onRemove={() => { this.onRemove(item.lecture_info); }}
                                                onEditName={(teachResourceAlias) => { this.onEditName(item.lecture_info, teachResourceAlias) }} />
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
                                                onPlayMedia={this.onPlayCourse}
                                                onRemove={() => { this.onRemoveTask(item, 2); }}
                                                onEditName={(teachResourceAlias) => { this.onEditTaskName(item, teachResourceAlias) }} />
                                        </Col>
                                    );
                                })
                            }
                        </Row>
                    </TabPane>
                    <TabPane tab="④教学教案下载" key="4">
                        <Row gutter={24}>
                            <Col>
                                {
                                    this.state.schedule_info.attachments_kzkj.length > 0 && <Button type="Primary" onClick={this.onDownloadClick}>{`打包下载(${this.state.schedule_info.attachments_kzkj.length})`}课件</Button>
                                }
                                {
                                    this.state.schedule_info.attachments_kzkj.length == 0 && <Alert
                                        message="提示"
                                        description="您还未完成备课内容"
                                        type="warning"
                                        showIcon
                                    />
                                }
                            </Col>
                        </Row>
                    </TabPane>
                </Tabs>
                {
                    this.state.currentMedia ? <ModalPlayer lecture_info={this.state.currentMedia} visible={this.state.showPlayMedia} onCancel={this.onCancelPlay} /> : ''
                }
                {
                    this.state.showModalSearchTeachResource ?
                        <Modal width={'75%'}
                            title="从教案、素材库、往期教学库"
                            wrapClassName="vertical-center-modal"
                            visible={true}
                            onCancel={this.onHideModalSearchTeachResource}
                            onOk={this.onSaveUserSelected}
                        >
                            <ModalSearchTeachResource
                                onSelected={this.onSelected}
                                TeachScheduleID={this.state.schedule_info.teach_schedule_id}
                                CourseSpecialty={this.state.schedule_info.the_specialty}
                                CourseLevel={this.state.schedule_info.the_level}
                                PeriodType={this.state.schedule_info.period_type}
                            />
                        </Modal> : ''
                }
                {
                    this.state.showModalSearchPublicResource ?
                        <Modal width={'75%'}
                            title="从我的素材库查找"
                            wrapClassName="vertical-center-modal"
                            visible={true}
                            onCancel={this.onHideModalSearchPublicResource}
                            onOk={this.onSaveUserSelected}
                        >
                            <ModalSearchPublicResource
                                onSelected={this.onSelected}
                                TeachScheduleID={this.state.schedule_info.teach_schedule_id}
                            />
                        </Modal> : ''
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
                    this.state.showPlayCourse && <Modal className="playCourse"
                        width={'80%'}
                        title="任务详情"
                        wrapClassName="vertical-center-modal"
                        visible={this.state.showPlayCourse}
                        onOk={() => {
                        }}
                        onCancel={() => {
                            this.setState({ showPlayCourse: false });
                        }}
                        footer={null}
                    >
                        <CourseView viewCallback={() => {
                            this.setState({ showPlayCourse: false });
                        }} {...{ currentDataModel: this.state.currentPlayCourse, editMode: 'View', dic_courseWareTypes: this.state.dic_courseWareTypes, dic_unitPartTypes: this.state.dic_unitPartTypes }} />
                    </Modal>
                }
            </Card >
        );
    }
}

const WrappedTeachDesign = Form.create()(TeachDesign);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        getTeacherTeachOverview: bindActionCreators(getTeacherTeachOverview, dispatch),
        updateScheduleInfo: bindActionCreators(updateScheduleInfo, dispatch),
        deleteCategoryResource: bindActionCreators(deleteCategoryResource, dispatch),
        editResourceName: bindActionCreators(editResourceName, dispatch),
        saveChoosedTeachResources: bindActionCreators(saveChoosedTeachResources, dispatch),


        batchAddTeachTask: bindActionCreators(batchAddTeachTask, dispatch),
        deleteTeachTask: bindActionCreators(deleteTeachTask, dispatch),
        saveTeachTask: bindActionCreators(saveTeachTask, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachDesign);