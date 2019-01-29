import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, Spin, Tabs, Radio } from 'antd';

import { DefaultPlayer as Video } from 'react-html5video';
import { getTeacherTeachOverview } from '@/actions/teach';
import AudioUpload from '@/components/AudioUpload';
import ImageUpload from '@/components/ImageUpload';
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml } from '@/utils';

import CourseView from '@/views/TM_Course/View/lectures';
import ModalPlayer from '@/components/ModalPlayer';
import ResourceCard from '@/components/ResourceCard';
import TeachViewParentEval from './TeachViewParentEval';
import TeachViewStudentKHDP from './teachViewStudentKHDP';
import { postCameraVideoRemark } from '@/actions/admin';

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
class TeachView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            dataModel: props.currentDataModel,//数据模型
            schedule_info: { attachments_kzkj: [] },
            student_teach_records: [],
            currentClassRoomVideoIndex: 0,
            adminMode: props.adminMode || 0,//管理员应用
            videoRemark: '',//视频点评内容
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
        this.props.viewCallback();
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let { teach_schedule_id } = this.state.dataModel;
                let { Objectives, Exercises } = values;
                this.props.updateScheduleInfo(teach_schedule_id, Objectives, 'Objectives').payload.promise.then((response) => {
                    this.props.updateScheduleInfo(teach_schedule_id, Exercises, 'Exercises').payload.promise.then((response) => {
                        this.props.viewCallback();//合并保存数据
                    })
                })
            }
        });
    }
    onPlayMedia = (lecture_info) => {
        this.setState({ currentMedia: lecture_info, showPlayMedia: true })
    }

    onPlayCourse = (item) => {
        this.setState({ currentPlayCourse: { CourseID: item.courseInfo.id }, showPlayCourse: true })
    }

    onCancelPlay = () => {
        this.setState({ showPlayMedia: false, currentMedia: null })
    }
    onSwitchClassRoomVideo = (e) => {
        this.setState({ currentClassRoomVideoIndex: parseInt(e.target.value) })
    }
    ontxtRemarkBlur = (e) => {
        this.state.schedule_info.liveVideos[this.state.currentClassRoomVideoIndex].Remark = e.target.value;
        this.setState({ schedule_info: this.state.schedule_info, saveRemarkEnable: e.target.value != "" });
    }
    onVideoLoaded = (e) => {
        this.state.schedule_info.liveVideos[this.state.currentClassRoomVideoIndex].Duration = Math.round(e.target.duration);
        this.setState({ schedule_info: this.state.schedule_info });
    }
    onVideoError = (e) => {
        if (!e.target.duration) {
            if (e.target.src != this.state.schedule_info.liveVideos[this.state.currentClassRoomVideoIndex].ClassRoomVideoCDN) {
                this.setState({ videoReload: false, videoError: `播放失败,请检查文件${e.target.src}` })
            }
        }
        else {
            this.setState({ videoReload: true, videoError: '可能因网络问题导致播放失败，点击尝试重新播放！' })
        }
        this.currentVideo = e.target;
        console.log(e.target.error)
    }
    onSaveRemark = () => {
        this.setState({ save_loading: true })
        this.props.postCameraVideoRemark(this.state.schedule_info.liveVideos[this.state.currentClassRoomVideoIndex]).payload.promise.then((response) => {
            let data = response.payload.data;
            this.setState({ save_loading: false })
            if (data.result === false) {
                message.error(data.message, 3);
            }
            else {
                message.success('点评成功');
            }
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
        //讲座反馈
        let parentEvals = this.state.student_teach_records
            .filter(A => A.order_no_eval > 0).sort((A, B) => {
                if (A.order_no_eval > B.order_no_eval) {
                    return 1;
                }
                else {
                    return -1;
                }
            });
        return (
            <Card title={`查看详情`} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
                <Tabs
                    defaultActiveKey="1"
                    tabPosition={'right'}
                >
                    <TabPane tab="①基本信息" key="1">
                        <div className="form-edit">
                            <Form>
                                <FormItem
                                    {...formItemLayout}
                                    label="班课名称"
                                >
                                    <span className="ant-form-text">{this.state.schedule_info.teach_name}({this.state.schedule_info.teach_schedule_no})</span>
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="上课时间"
                                >
                                    <span className="ant-form-text">{this.state.schedule_info.teach_timezoneName}{this.state.schedule_info.plan_begin_date} {this.state.schedule_info.plan_begin_time_short} {this.state.schedule_info.periods}课时</span>
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="课时数"
                                >
                                    <span className="ant-form-text">{this.state.schedule_info.periods}课时</span>
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="上课地点"
                                >
                                    <span className="ant-form-text">{this.state.schedule_info.position}</span>
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="学习目标"
                                >
                                    <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.schedule_info.objectives) }}></span>
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="课后作业"
                                >
                                    <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.schedule_info.exercises) }}></span>
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="学生数量"
                                >
                                    <span className="ant-form-text">{this.state.schedule_info.classStudents}人</span>
                                </FormItem>
                            </Form>
                        </div>
                    </TabPane>
                    <TabPane tab="②教学资料" key="2">
                        <Row gutter={24}>
                            {
                                this.state.schedule_info.attachments_kzkj.map((item, index) => {
                                    return (
                                        <Col span={6}>
                                            <ResourceCard lecture_info={item.lecture_info} onPlayMedia={this.onPlayMedia} />
                                        </Col>
                                    );
                                })
                            }
                            {
                                teachTasks.map((item, index) => {
                                    return (
                                        <Col span={6}>
                                            <ResourceCard
                                                lecture_info={item}
                                                onPlayMedia={this.onPlayCourse} />
                                        </Col>
                                    );
                                })
                            }
                            {
                                learnTasks.map((item, index) => {
                                    return (
                                        <Col span={6}>
                                            <ResourceCard
                                                lecture_info={item}
                                                onPlayMedia={this.onPlayCourse} />
                                        </Col>
                                    );
                                })
                            }
                        </Row>
                    </TabPane>
                    <TabPane tab="③课后点评" key="3">
                        {
                            this.state.student_teach_records.sort((A, B) => {
                                if (A.order_no_khdp > B.order_no_khdp) {
                                    return 1;
                                }
                                else {
                                    return -1;
                                }
                            }).map((item, index) => {
                                return (
                                    <Col span={24}>
                                        <TeachViewStudentKHDP item={{ ...item }} onPlayMedia={this.onPlayMedia} />
                                    </Col>
                                );
                            })
                        }
                    </TabPane>
                    <TabPane tab="④家长反馈" key="4">
                        {parentEvals.length > 0 ?
                            parentEvals.map((item, index) => {
                                return (
                                    <Col span={8}>
                                        <TeachViewParentEval item={item} />
                                    </Col>
                                );
                            }) : <div>暂无反馈内容</div>
                        }
                    </TabPane>
                    <TabPane tab="⑤课堂回放" key="5">
                        {
                            this.state.schedule_info.liveVideos.length > 1 && <Radio.Group style={{ marginBottom: 20 }} onChange={this.onSwitchClassRoomVideo} value={this.state.currentClassRoomVideoIndex.toString()}>
                                {
                                    this.state.schedule_info.liveVideos.map((item, index) => {
                                        return <Radio.Button value={index.toString()}>{item.ClassRoomName}</Radio.Button>;
                                    })
                                }
                            </Radio.Group>
                        }
                        {
                            this.state.schedule_info.liveVideos[this.state.currentClassRoomVideoIndex] && this.state.schedule_info.liveVideos[this.state.currentClassRoomVideoIndex].ClassRoomVideo.indexOf('http') != -1 ?
                                <div>
                                    <Row gutter={36}>
                                        <Col span={14} style={{ height: 480 }}><Video key={`video_${this.state.currentClassRoomVideoIndex}`}
                                            controls={['PlayPause', 'Seek', 'Time', 'Volume', 'Fullscreen']}
                                            onCanPlay={this.onVideoLoaded}
                                            onCanPlayThrough={this.onVideoLoaded}
                                            onPlaying={() => { this.setState({ videoError: '' }) }}
                                            onError={this.onVideoError}
                                        >
                                            <source src={this.state.schedule_info.liveVideos[this.state.currentClassRoomVideoIndex].ClassRoomVideoCDN} type="video/mp4" />
                                            <source src={this.state.schedule_info.liveVideos[this.state.currentClassRoomVideoIndex].ClassRoomVideo} type="video/mp4" />
                                        </Video>
                                            {(this.state.videoError && this.state.videoError != '') && <div onClick={() => {
                                                if (this.state.videoReload) {
                                                    this.currentVideo.load()
                                                }
                                            }} style={{ color: 'red' }}>{this.state.videoError}</div>}
                                        </Col>
                                        <Col span={10}>
                                            <Form>
                                                <FormItem
                                                    label="点评内容"
                                                >
                                                    {this.state.adminMode == 1 && <TextArea style={{ height: 448 }} onChange={this.ontxtRemarkBlur} value={this.state.schedule_info.liveVideos[this.state.currentClassRoomVideoIndex].Remark} />}
                                                    {this.state.adminMode == 0 && (this.state.schedule_info.liveVideos[this.state.currentClassRoomVideoIndex].Remark)}
                                                </FormItem>
                                                {
                                                    this.state.adminMode == 1 && <FormItem style={{ textAlign: 'right' }}>

                                                        {(!this.state.schedule_info.liveVideos[this.state.currentClassRoomVideoIndex].Remark || this.state.schedule_info.liveVideos[this.state.currentClassRoomVideoIndex].Remark.length == 0) && <Button disabled={true} icon="save">保存点评</Button>}
                                                        {this.state.schedule_info.liveVideos[this.state.currentClassRoomVideoIndex].Remark && this.state.schedule_info.liveVideos[this.state.currentClassRoomVideoIndex].Remark.length > 0 && <Button type="primary" loading={this.state.save_loading} icon="save" onClick={this.onSaveRemark}>保存点评</Button>}
                                                    </FormItem>
                                                }
                                            </Form>
                                        </Col>
                                    </Row>
                                </div> : <div>{this.state.schedule_info.liveVideos[this.state.currentClassRoomVideoIndex].ClassRoomVideo}</div>
                        }
                    </TabPane>
                </Tabs>
                {this.state.currentMedia ? <ModalPlayer lecture_info={this.state.currentMedia} visible={this.state.showPlayMedia} onCancel={this.onCancelPlay} /> : ''}
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
            </Card>
        );
    }
}

const WrappedTeachView = Form.create()(TeachView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        getTeacherTeachOverview: bindActionCreators(getTeacherTeachOverview, dispatch),
        postCameraVideoRemark: bindActionCreators(postCameraVideoRemark, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachView);