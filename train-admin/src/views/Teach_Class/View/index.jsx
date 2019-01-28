import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, AutoComplete } from 'antd';
import moment from 'moment';
import './index.less';
import ImageUpload from '@/components/ImageUpload';
import EditableUserTagGroup from '@/components/EditableUserTagGroup';
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dataBind, dateFormat } from '@/utils';
import { smartInputSearchTeacherList } from '@/actions/admin';
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
class TeachClassRoomView extends React.Component {
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
        if (this.props.editMode == "Delete") {
            Modal.confirm({
                title: '你确认要删除该班级吗?',
                content: '如果已安排上课，则不能被删除！',
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
                    this.props.viewCallback({ ...this.state.dataModel, ...values, MaxStudents: 200 });//合并保存数据
                }
            });
        }
    }

    onTeachWaySelectedChange = (value) => {
        this.state.dataModel.TeachWay = value;
        this.setState({ dataModel: this.state.dataModel })
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}班级`;
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
                //获取课程对应的等级
                var find = this.props.dic_CourseSpecialtys.find(A => A.value == this.state.dataModel.CourseSpecialty);
                let courseLevels = find != null ? find.CourseLevels : [];
                var defaultTeachClassName = "";
                if (find) {
                    defaultTeachClassName = find.title;
                    let findCourseLevel = find.CourseLevels.find(A => A.value == this.state.dataModel.CourseLevel);
                    if (findCourseLevel) {
                        defaultTeachClassName += findCourseLevel.title;
                    }
                }
                block_content = (<div className="form-edit">
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="课程"
                        >
                            {getFieldDecorator('CourseSpecialty', {
                                initialValue: this.state.dataModel.CourseSpecialty,
                                rules: [{
                                    required: true, message: '请设置课程!',
                                }],
                            })(
                                <Select onChange={(value) => {
                                    this.state.dataModel.CourseSpecialty = value;
                                    delete this.state.dataModel.CourseLevel;
                                    this.props.form.resetFields(['CourseLevel', 'TeachClassName']);
                                    this.setState({ dataModal: this.state.dataModel })
                                }}>
                                    {this.props.dic_CourseSpecialtys.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="课程级别"
                            extra={this.state.dataModel.CourseSpecialty ? '' : '请先指定课程!'}
                        >
                            {getFieldDecorator('CourseLevel', {
                                initialValue: this.state.dataModel.CourseLevel,
                                rules: [{
                                    required: true, message: '请设置课程级别!',
                                }],
                            })(
                                <Select onChange={(value) => {
                                    this.state.dataModel.CourseLevel = value;
                                    this.setState({ dataModal: this.state.dataModel })
                                }}>
                                    {courseLevels.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="班级名称"
                        >
                            {getFieldDecorator('TeachClassName', {
                                initialValue: (this.state.dataModel.TeachClassName || defaultTeachClassName),
                                rules: [{
                                    required: true, message: '请输入班级名称!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        {1 == 0 && <FormItem
                            {...formItemLayout}
                            label="班级封面"
                            extra="点击班级封面图可以重新上传"
                        >
                            {getFieldDecorator('FormImagePath', {
                                initialValue: this.state.dataModel.ImagePath,
                                rules: [{
                                    required: false, message: '请上传班级封面图片!',
                                }]
                            }
                            )(
                                <ImageUpload />
                                )}
                        </FormItem>
                        }
                        <FormItem
                            {...formItemLayout}
                            label="开课日期"
                        >
                            {getFieldDecorator('BeginDate', {
                                initialValue: this.state.dataModel.BeginDate || dateFormat(new Date(), 'yyyy-MM-dd'),
                                rules: [{
                                    required: false, message: '请设置开课日期!'
                                }, {
                                    pattern: /^(\d{4})\-(\d{2})\-(\d{2})$/, message: '日期格式有误,请参考:2017-01-01'
                                }]
                            })(
                                <Input placeholder="请设置开课日期" />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="开课周期"
                            className='form-duration'
                        >
                            {getFieldDecorator('Duration', {
                                initialValue: dataBind(this.state.dataModel.Duration || 4),
                                rules: [{
                                    required: true, message: '请设置开课周期!',
                                }]
                            })(
                                <InputNumber min={1} max={500} />
                                )}
                            {getFieldDecorator('DurationType', {
                                initialValue: dataBind(this.state.dataModel.DurationType || 'w'),
                            })(
                                <Select>
                                    {this.props.dic_DurationTypes.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="开课类型"
                        >
                            {getFieldDecorator('PeriodType', {
                                initialValue: dataBind(this.state.dataModel.PeriodType || '01'),
                                rules: [{
                                    required: false, message: '请设置开课类型!',
                                }],
                            })(
                                <Select>
                                    {this.props.dic_PeriodTypes.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
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
                                <Select onChange={this.onTeachWaySelectedChange}>
                                    {this.props.dic_TeachWays.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        {
                            this.state.dataModel.TeachWay.toString() == "2" && <FormItem
                                {...formItemLayout}
                                label="上课时区"
                            >
                                {getFieldDecorator('Timezone', {
                                    initialValue: dataBind(this.state.dataModel.Timezone || ''),
                                    rules: [{
                                        required: true, message: '请设置上课时区!',
                                    }]
                                })(
                                    <Select>
                                        {this.props.dic_Timezones.map((item) => {
                                            return <Option value={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}
                            </FormItem>
                        }
                        {/* <FormItem
                            {...formItemLayout}
                            label="班级最大人数"
                            extra="0表示不限"
                        >
                            {getFieldDecorator('MaxStudents', {
                                initialValue: this.state.dataModel.MaxStudents || 0,
                                rules: [{
                                    required: true, message: '请设置班级最大人数!',
                                }]
                            })(
                                <InputNumber min={0} max={200} />
                                )}
                        </FormItem> */}
                        <FormItem
                            {...formItemLayout}
                            label="上课教师"
                            extra={this.props.editMode == 'Edit' ? '注意：如果班级已有授课安排，则需手工修改授课安排对应的教师。' : ''}
                        >
                            {getFieldDecorator('FormTeacher', {
                                initialValue: (this.state.dataModel.TeacherInfo || []),
                                rules: [{
                                    required: false, message: '请设置上课教师!',
                                }]
                            })(
                                <EditableUserTagGroup maxTags={10} smartInputSearchUserList={this.props.smartInputSearchTeacherList} />
                                )}
                        </FormItem>
                        {1 == 0 && <FormItem
                            {...formItemLayout}
                            label="班级口号"
                        >
                            {getFieldDecorator('Slogan', {
                                initialValue: this.state.dataModel.Slogan,
                                rules: [{
                                    required: false, message: '请录入班级口号!',
                                }]
                            })(
                                <Input />
                                )}
                        </FormItem>
                        }
                        <FormItem
                            {...formItemLayout}
                            label="班级描述"
                            extra="特殊说明，如果是用于试听课，请设置'试听课',设置后，默认的上课时长25分钟"
                        >
                            {getFieldDecorator('Description', {
                                initialValue: this.state.dataModel.Description,
                                rules: [{
                                    required: false, message: '请录入班级描述!',
                                }]
                            })(
                                <TextArea rows={4} />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="状态"
                        >
                            {getFieldDecorator('Status', {
                                initialValue: (this.state.dataModel.Status || 1).toString()
                            })(
                                <Select>
                                    {this.props.dic_Status.map((item) => {
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
            case "View":
            case "Delete":
            case "Audit":
                //获取课程对应的等级
                var find2 = this.props.dic_CourseSpecialtys.find(A => A.value == this.state.dataModel.CourseSpecialty);
                let courseLevels2 = find2 != null ? find2.CourseLevels : [];
                block_content = (
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="班级名称"
                        >
                            <span className="ant-form-text">{this.state.dataModel.TeachClassName}</span>
                        </FormItem>
                        {1 == 0 && <FormItem
                            {...formItemLayout}
                            label='班级封面'
                        >
                            <img style={{ width: 100 }} src={this.state.dataModel.ImagePath} />
                        </FormItem>}
                        {1 == 0 && <FormItem
                            {...formItemLayout}
                            label='班级口号'
                        >
                            <span className="ant-form-text">{this.state.dataModel.Slogan}</span>
                        </FormItem>
                        }
                        <FormItem
                            {...formItemLayout}
                            label='班级描述'
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.Description) }}></span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="开课日期"
                        >
                            <span className="ant-form-text">{this.state.dataModel.BeginDate}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="开课周期"                        >
                            <span className="ant-form-text">{this.state.dataModel.Duration}{getDictionaryTitle(this.props.dic_DurationTypes, this.state.dataModel.DurationType)}`</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="班级类型"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_PeriodTypes, this.state.dataModel.PeriodType)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="上课方式"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_TeachWays, this.state.dataModel.TeachWay)}</span>
                        </FormItem>
                        {
                            this.props.dic_TeachWays.toString() == "2" &&
                            <FormItem
                                {...formItemLayout}
                                label="上课时区"
                            >
                                <span className="ant-form-text">{getDictionaryTitle(this.props.dic_Timezones, this.state.dataModel.Timezone)}</span>
                            </FormItem>
                        }
                        <FormItem
                            {...formItemLayout}
                            label="班级人数"
                        >
                            <span className="ant-form-text">{this.state.dataModel.ClassStudents}/{this.state.dataModel.MaxStudents == 0 ? '不限' : this.state.dataModel.MaxStudents}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="课程信息"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_CourseSpecialtys, this.state.dataModel.CourseSpecialty)}{getDictionaryTitle(courseLevels2, this.state.dataModel.CourseLevel)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="上课教师"
                        >
                            <span className="ant-form-text">
                                {this.state.dataModel.TeacherInfo.map(A => A.name).join(',')}
                            </span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="状态"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_Status, this.state.dataModel.Status)}</span>
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

const WrappedTeachClassRoomView = Form.create()(TeachClassRoomView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        smartInputSearchTeacherList: bindActionCreators(smartInputSearchTeacherList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachClassRoomView);