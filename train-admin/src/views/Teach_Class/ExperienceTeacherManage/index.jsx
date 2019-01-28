import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, DatePicker } from 'antd';
import { getTeachClassList, saveTeachClassInfo, switchTeachClassInfoStatus, deleteTeachClassInfo } from '@/actions/teach';
import { getDictionaryTitle } from '@/utils';
import ExperienceTeacher from '../View/ExperienceTeacher';
const FormItem = Form.Item;
class ExperienceTeachClassManage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', Status: "-1", Teacher: '', CourseSpecialty: '', CourseLevel: '', PeriodType: '', BeginDate: '', EndDate: '', TeachWay: '-1', Timezone: '', IsExperience: true },
            dic_Status: [],
            dic_CourseSpecialtys: [],
            dic_PeriodTypes: [],
            dic_DurationTypes: [],
            dic_TeachWays: [],//上课方式
            dic_Timezones: [],//上课时区
            data_list: [],
            data_list_total: 0,
            loading: false
        };
    }

    componentWillMount() {
        //首次进入搜索，加载服务端主题典项内容
        this.onSearch();
    }

    //table 输出列定义
    columns = [
        {
            title: '教师',
            render: (text, record, index) => {
                if (record.TeacherInfo.length == 0) {
                    return '-----';
                }
                else {
                    var teacherNames = record.TeacherInfo.map(A => A.name);
                    return teacherNames.join(',');
                }
            }
        },
        {
            title: '试听课程',
            render: (text, record, index) => {
                return `${getDictionaryTitle(this.state.dic_CourseSpecialtys, record.CourseSpecialty)}`;
            }
        },
        {
            title: '上课时区',
            render: (text, record, index) => {
                return `${getDictionaryTitle(this.state.dic_Timezones, record.Timezone, '当地时间')}`;
            }
        },
        {
            title: '开课日期',
            width: 100,//可预知的数据长度，请设定固定宽度
            dataIndex: 'BeginDate'
        },
        {
            title: '结课日期',
            width: 100,//可预知的数据长度，请设定固定宽度
            dataIndex: 'EndDate'
        },
        {
            title: '状态',
            width: 80,
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.Status);
            }
        },
        {
            title: '操作',
            width: 160,//可预知的数据长度，请设定固定宽度
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => { this.onLookView('Edit', record) }}>编辑</a>
                    <span className="ant-divider" />
                    {record.AuditStatus == 3 ? <a disabled>删除</a> : <a onClick={() => { this.onLookView('Delete', record) }}>删除</a>}
                    <span className="ant-divider" />
                    <a onClick={() => { this.onSwitchStatus(record) }}>{record.Status != 1 ? '启用' : '停用'}</a>
                </span>
            ),
        }];

    //搜索条件
    getFields() {
        const count = this.state.expand ? 10 : 6;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 10 },
            wrapperCol: { span: 14 },
        };
        const children = [];
        //获取课程对应的等级
        var find = this.state.dic_CourseSpecialtys.find(A => A.value == this.state.pagingSearch.CourseSpecialty);
        let courseLevels = find != null ? find.CourseLevels : [];
        children.push(
            <Col span={8}>
                <FormItem {...formItemLayout} label={'教师'} >
                    {getFieldDecorator('Teacher', { initialValue: this.state.pagingSearch.Teacher })(
                        <Input placeholder={'教师名称或账号模糊查找'} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="试听课程"
                >
                    {getFieldDecorator('CourseSpecialty', { initialValue: this.state.pagingSearch.CourseSpecialty })(
                        <Select onChange={(value) => {
                            this.state.pagingSearch.CourseSpecialty = value;
                            this.setState({ pagingSearch: this.state.pagingSearch })
                        }}>
                            <Option value="">全部</Option>
                            {this.state.dic_CourseSpecialtys.map((item) => {
                                return <Option value={item.value}>{item.title}</Option>
                            })}
                        </Select>
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="状态"
                >
                    {getFieldDecorator('Status', { initialValue: this.state.pagingSearch.Status })(
                        <Select>
                            <Option value="-1">全部</Option>
                            {this.state.dic_Status.map((item) => {
                                return <Option value={item.value}>{item.title}</Option>
                            })}
                        </Select>
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="上课时区"
                >
                    {getFieldDecorator('Timezone', { initialValue: this.state.pagingSearch.Timezone })(
                        <Select>
                            <Option value="">全部</Option>
                            {this.state.dic_Timezones.map((item) => {
                                return <Option value={item.value}>{item.title}</Option>
                            })}
                        </Select>
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem {...formItemLayout} label={'开始日期'} >
                    {getFieldDecorator('BeginDate', { initialValue: this.state.pagingSearch.BeginDate })(
                        <DatePicker />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="截止日期"
                >
                    {getFieldDecorator('EndDate', { initialValue: this.state.pagingSearch.EndDate })(
                        <DatePicker />
                    )}
                </FormItem>
            </Col>
        );

        let filedCount = this.state.expand ? children.length : 3;
        return children.slice(0, filedCount);
    }

    toggle = () => {
        const { expand } = this.state;
        this.setState({ expand: !expand });
    }

    //处理搜索事件
    onSearch = (e) => {
        if (e) {
            e.preventDefault();
            this.state.pagingSearch.PageIndex = 1;//重新查询时重置到第一页
        }
        this.setState({ loading: true })
        this.props.form.validateFields((err, values) => {
            console.log('Received values of form: ', values);
            let pagingSearch = { ...this.state.pagingSearch, ...values };
            this.props.getTeachClassList(pagingSearch).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    this.setState({ loading: false })
                    message.error(data.message);
                }
                else {
                    this.setState({ pagingSearch, ...data, loading: false })
                }
            })
        });
    }
    //处理分页事件
    onPageIndexChange = (page, pageSize) => {
        let pagingSearch = this.state.pagingSearch;
        pagingSearch.PageIndex = page;
        this.setState({ pagingSearch });
        setTimeout(() => {
            //重新查找
            this.onSearch();
        }, 100);
    };
    //处理调整页面大小
    onShowSizeChange = (current, size) => {
        let pagingSearch = this.state.pagingSearch;
        pagingSearch.PageSize = size;
        pagingSearch.PageIndex = 1;//重置到第一页
        this.setState({ pagingSearch });
        setTimeout(() => {
            //重新查找
            this.onSearch();
        }, 100);
    };
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
                case "Create":
                case "Edit": //提交
                    this.props.saveTeachClassInfo(dataModel).payload.promise.then((response) => {
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
                    //提交
                    break;
                case "Delete":
                    //提交
                    this.props.deleteTeachClassInfo(this.state.currentDataModel).payload.promise.then((response) => {
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
                    break;
            }
        }
    }


    //切换状态
    onSwitchStatus(item) {
        //提交
        this.props.switchTeachClassInfoStatus({ ...item, Status: 1 - item.Status }).payload.promise.then((response) => {
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


    //渲染，根据模式不同控制不同输出
    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
                block_content = <ExperienceTeacher viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                block_content = (
                    <div >
                        <Form
                            className="search-form"
                        >
                            <Row gutter={40}>
                                {this.getFields()}
                            </Row>
                            <Row>
                                <Col span={24} style={{ textAlign: 'right' }}>
                                    <Button type="primary" icon="search" onClick={this.onSearch}>查询</Button>
                                    <Button style={{ marginLeft: 8 }} onClick={() => { this.onLookView('Create', { TeachWay: 1 }) }} icon="plus">试听教师</Button>
                                    {<a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                                        更多 <Icon type={this.state.expand ? 'up' : 'down'} />
                                    </a>}
                                </Col>
                            </Row>
                        </Form>
                        <div className="search-result-list">
                            <Table
                                loading={this.state.loading}
                                pagination={false}
                                columns={this.columns} //列定义
                                dataSource={this.state.data_list}//数据
                            />
                            <div className="search-paging">
                                <Row>
                                    <Col span={8}>
                                    </Col>
                                    <Col span={16} className={'search-paging-control'}>
                                        <Pagination showSizeChanger
                                            current={this.state.pagingSearch.PageIndex}
                                            defaultPageSize={this.state.pagingSearch.PageSize}
                                            onShowSizeChange={this.onShowSizeChange}
                                            onChange={this.onPageIndexChange}
                                            showTotal={(total) => { return `共${total}条数据`; }}
                                            total={this.state.data_list_total} />
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                );
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedExperienceTeachClassManage = Form.create()(ExperienceTeachClassManage);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getTeachClassList: bindActionCreators(getTeachClassList, dispatch),
        saveTeachClassInfo: bindActionCreators(saveTeachClassInfo, dispatch),
        switchTeachClassInfoStatus: bindActionCreators(switchTeachClassInfoStatus, dispatch),
        deleteTeachClassInfo: bindActionCreators(deleteTeachClassInfo, dispatch)
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedExperienceTeachClassManage);