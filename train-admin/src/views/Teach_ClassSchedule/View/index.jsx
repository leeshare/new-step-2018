import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, Checkbox, TimePicker } from 'antd';
import moment from 'moment';

import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dataBind, dateFormat } from '@/utils';
import EditableUserTagGroup from '@/components/EditableUserTagGroup';
import { smartInputSearchTeacherList } from '@/actions/admin';
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
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
class TeachClassScheduleView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            CurrentClassInfo: {},
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
                title: '你确认要删除该授课安排吗?',
                content: '如果已完成上课，则不能被删除！',
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
                    this.props.viewCallback({ ...this.state.dataModel, ...values });
                }
            });
        }
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        if (op == "") {
            op = '批量设置'
        }
        return `${op}授课安排`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" icon="save" onClick={this.onSubmit} loading={this.state.loading} >{getViewEditModeTitle(this.props.editMode, '保存')}</Button> <Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
            case "BatchCreate": {
                var teacherInfo = this.state.CurrentClassInfo.TeacherInfo;
                block_content = (<div className="form-edit">
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="授课班"
                        >
                            {getFieldDecorator('TeachClassID', {
                                initialValue: dataBind(this.state.dataModel.TeachClassID),
                                rules: [{
                                    required: true, message: '请设置授课班!',
                                }]
                            })(
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    onChange={(value) => {
                                        let findTeachClass = this.props.dic_TeachClass.find(A => A.value == value);
                                        this.setState({ CurrentClassInfo: findTeachClass })
                                    }}>
                                    {this.props.dic_TeachClass.filter(A => A.status == 1).map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="教学内容"
                            extra="对授课班名称的补充，方便学生区分授课安排"
                        >
                            {getFieldDecorator('TeachContent', {
                                initialValue: this.state.dataModel.TeachContent,
                                rules: [{
                                    required: false, message: '请输入教学内容!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="授课教师"
                        >
                            {getFieldDecorator('FormTeacher', {
                                initialValue: (teacherInfo|| []),
                                rules: [{
                                    required: true, message: '请设置授课教师!',
                                }]
                            })(
                                <EditableUserTagGroup maxTags={10} smartInputSearchUserList={this.props.smartInputSearchTeacherList} searchOptions={{ CourseSpecialty: this.state.CurrentClassInfo.CourseSpecialty, CourseLevel: this.state.CurrentClassInfo.CourseLevel }} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="上课方式"
                        >
                            {getFieldDecorator('TeachWay', {
                                initialValue: dataBind(this.state.dataModel.TeachWay),
                                rules: [{
                                    required: true, message: '请设置上课方式!',
                                }]
                            })(
                                <Select>
                                    {this.props.dic_TeachWays.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="所在教室"
                        >
                            {getFieldDecorator('TeachClassRoomID', {
                                initialValue: dataBind(this.state.dataModel.TeachClassRoomID),
                                rules: [{
                                    required: true, message: '请设置所在教室!',
                                }]
                            })(
                                <Select>
                                    {this.props.dic_TeachClassRooms.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="周几上课"
                        >
                            {getFieldDecorator('FormChooseWeek', {
                                initialValue: ['1'],
                                rules: [{
                                    required: true, message: '请设置周几上课!',
                                }]
                            })(
                                <CheckboxGroup options={[
                                    { label: '周一', value: '1' },
                                    { label: '周二', value: '2' },
                                    { label: '周三', value: '3' },
                                    { label: '周四', value: '4' },
                                    { label: '周五', value: '5' },
                                    { label: '周六', value: '6' },
                                    { label: '周日', value: '0' },
                                ]} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="起始日期"
                        >
                            {getFieldDecorator('FormWeekStartDate', {
                                initialValue: this.state.dataModel.FormWeekStartDate || dateFormat(new Date(), 'yyyy-MM-dd'),
                                rules: [{
                                    required: false, message: '请设置起始日期!'
                                }, {
                                    pattern: /^(\d{4})\-(\d{2})\-(\d{2})$/, message: '日期格式有误,请参考:2017-01-01'
                                }]
                            })(
                                <Input placeholder="请设置起始日期" />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="共几周"
                        >
                            {getFieldDecorator('FormRepeatWeeks', {
                                initialValue: 1,
                                rules: [{
                                    required: true, message: '请设置学习周数量!',
                                }]
                            })(
                                <InputNumber min={1} max={50} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="上课时间"
                        >
                            {getFieldDecorator('FormChooseTime', {
                                initialValue: dateFormat(new Date(), 'hh:00'),
                                rules: [{
                                    required: true, message: '请设置上课时间!'
                                }, {
                                    pattern: /^(\d{2}):(\d{2})$/, message: '时间格式有误,请参考:10:00'
                                }]
                            })(
                                <Input placeholder="请设置上课时间" />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="课时数"
                        >
                            {getFieldDecorator('Periods', {
                                initialValue: this.state.dataModel.Periods || 1,
                                rules: [{
                                    required: true, message: '请设置课时数!',
                                }]
                            })(
                                <InputNumber min={1} max={10} />
                                )}
                        </FormItem>
                        {this.renderBtnControl()}
                    </Form>
                </div>
                );
            }
                break;
            case "BatchUpdate":
                block_content = (
                    <div className="form-edit">
                        <Form>
                            <FormItem
                                {...formItemLayout}
                                label="授课教师"
                            >
                                {getFieldDecorator('FormTeacher', {
                                    initialValue: this.state.dataModel.TeacherInfo,
                                    rules: [{
                                        required: true, message: '请设置授课教师!',
                                    }]
                                })(
                                    <EditableUserTagGroup maxTags={10} smartInputSearchUserList={this.props.smartInputSearchTeacherList} />
                                    )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="所在教室"
                            >
                                {getFieldDecorator('TeachClassRoomID', {
                                    initialValue: dataBind(this.state.dataModel.TeachClassRoomID),
                                    rules: [{
                                        required: true, message: '请设置所在教室!',
                                    }]
                                })(
                                    <Select>
                                        {this.props.dic_TeachClassRooms.map((item) => {
                                            return <Option value={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}
                            </FormItem>
                            {this.renderBtnControl()}
                        </Form>
                    </div>
                );
                break;
            case "Create":
            case "Edit":
                var teacherInfo = this.state.dataModel.TeacherInfo || this.state.CurrentClassInfo.TeacherInfo;
                block_content = (<div className="form-edit">
                    <Form>
                        {/* 授课班仅添加模式出现 */}
                        {this.props.editMode == "Create" ?
                            <FormItem
                                {...formItemLayout}
                                label="授课班"
                            >
                                {getFieldDecorator('TeachClassID', {
                                    initialValue: dataBind(this.state.dataModel.TeachClassID),
                                    rules: [{
                                        required: true, message: '请设置授课班!',
                                    }]
                                })(
                                    <Select onChange={(value) => {
                                        let findTeachClass = this.props.dic_TeachClass.find(A => A.value == value);
                                        this.setState({ CurrentClassInfo: findTeachClass })
                                    }}>
                                        {this.props.dic_TeachClass.filter(A => A.status == 1).map((item) => {
                                            return <Option value={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}
                            </FormItem> : ''
                        }
                        <FormItem
                            {...formItemLayout}
                            label="所在教室"
                        >
                            {getFieldDecorator('TeachClassRoomID', {
                                initialValue: dataBind(this.state.dataModel.TeachClassRoomID),
                                rules: [{
                                    required: true, message: '请设置所在教室!',
                                }]
                            })(
                                <Select>
                                    {this.props.dic_TeachClassRooms.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="上课时间"
                        > {getFieldDecorator('BeginTime', {
                            initialValue: this.state.dataModel.BeginTime || dateFormat(new Date(), 'yyyy-MM-dd hh:00:00'),
                            rules: [{
                                required: false, message: '请设置上课时间!'
                            }, {
                                pattern: /^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, message: '日期格式有误,请参考:2017-01-01 10:00:00!'
                            }]
                        })(
                            <Input placeholder="请设置上课时间" />
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="第几次课"
                        >
                            {getFieldDecorator('TeachScheduleNo', {
                                initialValue: this.state.dataModel.TeachScheduleNo || 1,
                                rules: [{
                                    required: true, message: '请设置第几次课!',
                                }]
                            })(
                                <InputNumber min={1} max={1000} />
                                )}
                        </FormItem>                        
                        <FormItem
                            {...formItemLayout}
                            label="课时数"
                        >
                            {getFieldDecorator('Periods', {
                                initialValue: this.state.dataModel.Periods || 1,
                                rules: [{
                                    required: true, message: '请设置课时数!',
                                }]
                            })(
                                <InputNumber min={1} max={10} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="授课教师"
                        >
                            {getFieldDecorator('FormTeacher', {
                                initialValue: (teacherInfo || []),
                                rules: [{
                                    required: true, message: '请设置授课教师!',
                                }]
                            })(
                                <EditableUserTagGroup maxTags={10} smartInputSearchUserList={this.props.smartInputSearchTeacherList} searchOptions={{ CourseSpecialty: this.state.CurrentClassInfo.CourseSpecialty, CourseLevel: this.state.CurrentClassInfo.CourseLevel }} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="上课方式"
                        >
                            {getFieldDecorator('TeachWay', {
                                initialValue: dataBind(this.state.dataModel.TeachWay),
                                rules: [{
                                    required: true, message: '请设置上课方式!',
                                }]
                            })(
                                <Select>
                                    {this.props.dic_TeachWays.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="教学内容"
                            extra="对授课班名称的补充，方便学生区分授课安排"
                        >
                            {getFieldDecorator('TeachContent', {
                                initialValue: this.state.dataModel.TeachContent,
                                rules: [{
                                    required: false, message: '请输入教学内容!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="学习目标"
                        >
                            {getFieldDecorator('Objectives', {
                                initialValue: this.state.dataModel.Objectives,
                                rules: [{
                                    required: false, message: '请录入学习目标!',
                                }]
                            })(
                                <TextArea rows={10} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="课后作业"
                        >
                            {getFieldDecorator('Exercises', {
                                initialValue: this.state.dataModel.Exercises,
                                rules: [{
                                    required: false, message: '请录入课后作业!',
                                }]
                            })(
                                <TextArea rows={10} />
                                )}
                        </FormItem>
                        {this.renderBtnControl()}
                    </Form>
                </div>
                );
                break;
            case "View":
            case "Delete":
            case "Audit":
                block_content = (
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="授课班"
                        >
                            <span className="ant-form-text">{this.state.dataModel.TeachClassName}{this.state.dataModel.TeachContent}({this.state.dataModel.TeachScheduleNoInfo})</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="所在教室"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_TeachClassRooms, this.state.dataModel.TeachClassRoomID)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="上课时间"
                        >
                            <span className="ant-form-text">{this.state.dataModel.BeginTime}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="课时数"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Periods}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="授课教师"
                        >
                            <span className="ant-form-text">
                                {this.state.dataModel.TeacherInfo.map(A => A.name).join(',')}
                            </span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="授课方式"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_TeachWays, this.state.dataModel.TeachWay)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='学习目标'
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.Objectives) }}></span>
                        </FormItem>

                        <FormItem
                            {...formItemLayout}
                            label='课后作业'
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.Exercises) }}></span>
                        </FormItem>

                        <FormItem
                            {...formItemLayout}
                            label="创建信息"
                        >
                            <span className="ant-form-text">{this.state.dataModel.CreatedDate} by {this.state.dataModel.CreatedUserInfo.name}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="修改信息"
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

const WrappedTeachClassScheduleView = Form.create()(TeachClassScheduleView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        smartInputSearchTeacherList: bindActionCreators(smartInputSearchTeacherList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachClassScheduleView);