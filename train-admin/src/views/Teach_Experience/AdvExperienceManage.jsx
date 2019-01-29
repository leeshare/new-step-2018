import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, Tabs, Tag, DatePicker, Spin, RadioGroup, Popover, Avatar } from 'antd';
import { getTeachExperienceRecordList, saveTeachExperienceRecord, switchTeachExperienceStatus, getTeachTeacherScheduleList, saveTeacherScheduleInfo, getTeachClassList, studentExperienceToTeachClass } from '@/actions/teach';
import { getDictionaryTitle, dataBind, getWeekTitle, distinctOfArray, dateFormat, convertTextToHtml } from '@/utils';
import TeachExperienceView from './View';
import NotifyView from '../MessageNotify/Index';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

//color 颜色
const statusColors = ['green', 'cyan', 'blue', 'purple', 'orange', 'red', '#f50',]
const statusIcons = ['edit', 'check', 'calendar', 'solution', 'phone', 'shopping-cart', 'frown',]

class AdvExperienceManage extends React.Component {
    constructor(props) {
        super(props)
        var now = new Date();
        now.setHours(now.getHours() + -1 * 24);
        var endWeek = new Date();
        endWeek.setHours(now.getHours() + 5 * 24);

        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 999, Keyword: '', Status: "-1", ProductID: '', TeachClassName: '', Student: '', Week: '-1', TimeRange: '', Location: '', BeginDate: dateFormat(now, 'yyyy-MM-dd'), EndDate: dateFormat(endWeek, 'yyyy-MM-dd') },
            dic_Timezones: [],
            dic_TeachExperienceStatus: [],
            dic_Products: [],
            dic_ProductPrices: [],
            dic_ExperienceChooseTimeRanges: [],
            dic_TeachTimeRanges: [],
            dic_ClassRooms: [],
            dic_Weeks: [],
            dic_Agents: [],
            default_location: "",
            data_list: [],
            data_list_total: 0,
            loading: false,
            currentTab: 'tab1',
        };
    }

    componentWillMount() {
        //首次进入搜索，加载服务端主题典项内容
        this.onSearchTeachSchedule();
    }

    //table 输出列定义
    columns = [
        {
            title: `学生信息`,
            width: 300,
            //自定义显示
            render: (text, record, index) => {
                return <Row>
                    <Col span={6}><img style={{ width: 60, borderRadius: '50px' }} src={record.StudentInfo.icon} /></Col>
                    <Col span={18}><div>{record.StudentInfo.name} {record.StudentInfo.chinese_name}</div>
                        <div>{record.StudentInfo.email}</div>
                        <div>{distinctOfArray([record.StudentInfo.mobile, record.StudentInfo.parent_telephone]).join(' ')}</div>
                    </Col>
                </Row>
            }
        },
        {
            title: '预约试听信息',
            render: (text, record, index) => {
                var tmps = record.TimeRange.split('-');
                return <div>
                    {`${record.ProductInfo.productName}`}<br />
                    {`${record.TimezoneName}`}<br />
                    {`${record.ScheduleDate}`} {`${getWeekTitle(record.Week)}`} {`${record.TimeRange}`}<br />
                    {`${record.Location}`}
                </div>
            }
        },
        {
            title: '试听状态',
            render: (text, record, index) => {
                return <div>
                    {`${getDictionaryTitle(this.state.dic_TeachExperienceStatus, record.Status, '未知')}`}
                </div>
            }
        },
        {
            title: '提交日期',
            render: (text, record, index) => {
                return `${record.ExperienceDate}`
            }
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            render: (text, record) => (
                <span>
                    <a onClick={() => { this.onLookView('View', record) }}>查看详情</a><br />
                    {record.Status > 0 && <a onClick={() => { this.onLookView('CustomerService', record) }}>报名跟踪</a>}<br />
                    <a onClick={() => { this.onLookView('SendMessage', record) }}>消息通知</a>
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
        children.push(
            <Col span={8}>
                <FormItem {...formItemLayout} label={'学生'} >
                    {getFieldDecorator('Student', { initialValue: this.state.pagingSearch.Student })(
                        <Input placeholder={'学号、姓名、中文名模糊查找'} />
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
                    {getFieldDecorator('ProductID', { initialValue: this.state.pagingSearch.ProductID })(
                        <Select>
                            <Option value="">全部</Option>
                            {this.state.dic_Products.map((item) => {
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
                    label="试听状态"
                >
                    {getFieldDecorator('Status', { initialValue: this.state.pagingSearch.Status })(
                        <Select>
                            <Option value="-1">全部</Option>
                            {this.state.dic_TeachExperienceStatus.map((item) => {
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
                    label="位置"
                >
                    {getFieldDecorator('Location', { initialValue: this.state.pagingSearch.Location })(
                        <Input placeholder={'支持模糊查找如加拿大或温哥华'} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem {...formItemLayout} label={'提交日期起'} >
                    {getFieldDecorator('BeginDate', { initialValue: dataBind(this.state.pagingSearch.BeginDate, true) })(
                        <DatePicker />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="提交日期止"
                >
                    {getFieldDecorator('EndDate', { initialValue: dataBind(this.state.pagingSearch.EndDate, true) })(
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
            this.props.getTeachExperienceRecordList(pagingSearch).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    this.setState({ loading: false })
                    message.error(data.message, 5);
                }
                else {
                    this.setState({ pagingSearch, ...data, loading: false })
                }
            })
        });
    }
    //处理搜索事件
    onSearchTeachSchedule = (e) => {
        if (e) {
            e.preventDefault();
            this.state.pagingSearch.PageIndex = 1;//重新查询时重置到第一页
        }
        this.setState({ loading: true })
        this.props.form.validateFields((err, values) => {
            console.log('Received values of form: ', values);
            (values.BeginDate && values.BeginDate.format) && (values.BeginDate = values.BeginDate.format('YYYY-MM-DD'));
            (values.BeginDate && values.EndDate.format) && (values.EndDate = values.EndDate.format('YYYY-MM-DD'));
            let pagingSearch = { ...this.state.pagingSearch, ...values, ClassType: '02' };
            this.props.getTeachTeacherScheduleList(pagingSearch).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    this.setState({ loading: false })
                    message.error(data.message);
                }
                else {
                    this.setState({ teacherSchedules: data, loading: false });
                    this.onSearch();//检索报名数据
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
                case "Edit":
                    //提交订单
                    this.props.saveTeachExperienceRecord(dataModel).payload.promise.then((response) => {
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
                case "Cancel":
                    //提交
                    this.props.switchTeachExperienceStatus(dataModel).payload.promise.then((response) => {
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
                case "CustomerService":
                    //提交
                    this.props.switchTeachExperienceStatus(dataModel).payload.promise.then((response) => {
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

    tabChange = (key) => {
        console.log(key);
        this.setState({ currentTab: key })
    }

    onWeekButtonClick = (step) => {
        let currentDate = new Date(this.state.pagingSearch.BeginDate);
        currentDate.setHours(currentDate.getHours() + step * 7 * 24);
        this.state.pagingSearch.BeginDate = dateFormat(currentDate, 'yyyy-MM-dd');

        currentDate = new Date(this.state.pagingSearch.EndDate);
        currentDate.setHours(currentDate.getHours() + step * 7 * 24);
        this.state.pagingSearch.EndDate = dateFormat(currentDate, 'yyyy-MM-dd');
        setTimeout(() => {
            //重新查找
            this.onSearchTeachSchedule();
        }, 100);
    }

    onStudentTeach = (data, teachers) => {
        this.setState({ showTeachWindow: true, currentDataModel: data, chooseTeachers: teachers, teacherClassInfo: { data_list: [], dic_TeachClassRooms: [] } });
    }

    onStudentTeachSubmit = () => {
        this.props.form.validateFields((err, values) => {
            var data = this.state.currentDataModel;
            data = { ...data, ...data.LocalTimeInfo, ...values };
            console.log(data);
            this.setState({ submiting: true });//正在提交
            this.props.studentExperienceToTeachClass(data).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    this.setState({ submiting: false })
                    message.error(data.message);
                }
                else {
                    this.setState({ submiting: false, showTeachWindow: false });//关闭窗口
                    this.onSearchTeachSchedule();//刷新数据
                }
            })
        });
    }

    renderScheduleTable() {
        {
            if (!this.state.teacherSchedules) {
                return <div style={{ width: 100, margin: '300 auto' }}><Spin tip="数据加载中..."></Spin></div>
            }
            //筛选对应时区的数据
            let studentTimezone = this.state.teacherSchedules.localTimezone;
            let timeRanges = [];//教师及学生总和报名时间段
            let TeacherSchedule_localTimeDataList = [];//教师排课数据
            let localTimeDataList = [];//学生报名数据
            var BeginDate = new Date(this.state.pagingSearch.BeginDate);
            let currentWeek = BeginDate.getDay();//当前周几
            this.state.teacherSchedules.data_list.map((data) => {
                var localTimeInfo = data.GlobalTimes.find(item => item.Timezone == studentTimezone);
                timeRanges = [...timeRanges.filter(item => item != localTimeInfo.TimeRange), localTimeInfo.TimeRange];
                data.LocalTimeInfo = localTimeInfo;
                TeacherSchedule_localTimeDataList.push(data);
            });

            //timeRange合并上实际报名的时间段
            this.state.data_list.map((data) => {
                var localTimeInfo = data.GlobalTimes.find(item => item.Timezone == studentTimezone);
                timeRanges = [...timeRanges.filter(item => item != localTimeInfo.TimeRange), localTimeInfo.TimeRange];
                data.LocalTimeInfo = localTimeInfo;
                localTimeDataList.push(data);
            });

            //table 行数据
            timeRanges = timeRanges.sort((a, b) => a > b ? 1 : -1);//按时间段排序
            //table 表头定义
            let tableColumns = [
                {
                    title: <div className='center'>试听时间</div>,
                    className: 'center',
                    render: (text, record, index) => {
                        return `${record}`
                    }
                }];
            //动态按照今日周几排列表头顺序
            var today = dateFormat(new Date(), 'yyyy-MM-dd')
            this.state.dic_Weeks.map((week, index) => {
                //计算获得周几对应的日期
                let currentDate = new Date(this.state.pagingSearch.BeginDate);
                currentDate.setHours(currentDate.getHours() + index * 24);
                //当前周几排第一位
                let realWeek = (currentWeek + index) % 7;
                //周几对应的数据列定义
                let columnItem = {
                    title: <div className={today == dateFormat(currentDate, 'yyyy-MM-dd') ? 'center today' : 'center'}>{getWeekTitle(realWeek)}<br />
                        {dateFormat(currentDate, 'yyyy-MM-dd')}{today == dateFormat(currentDate, 'yyyy-MM-dd') ? '(今天)' : ''}</div>,//周几+日期
                    render: (text, record, index) => {
                        let teachers = TeacherSchedule_localTimeDataList
                            //.filter((A) => { return A.LocalTimeInfo.ScheduleDate >= this.state.toBeginDate && A.LocalTimeInfo.ScheduleDate <= this.state.toEndDate; })//过滤特定日期
                            .filter(data => data.LocalTimeInfo.Week == realWeek && data.LocalTimeInfo.TimeRange == timeRanges[index])//同一天，同一时段
                            .map((data) => {
                                return data;
                            });
                        return <div>
                            <div>
                                {
                                    //从总数据标准基于本地时间，查找对应相同周几及开课时间段的老师数据
                                    teachers.map((data) => {
                                        if (!data.Status) {
                                            return <Tag style={{ background: '#fff', borderStyle: 'dashed', color: '#ccc' }}><Icon type="customer-service" /> {data.TeacherInfo.chinese_name}老师</Tag>
                                        }
                                        else {
                                            return <Tag style={{ background: '#fff', borderStyle: 'dashed' }}><Icon type="customer-service" /> {data.TeacherInfo.chinese_name}老师</Tag>
                                        }
                                    })
                                }
                            </div>
                            <div>
                                {
                                    //从总数据标准基于本地时间，查找对应相同周几及开课时间段的老师数据
                                    localTimeDataList
                                        .filter(data => data.LocalTimeInfo.Week == realWeek && data.LocalTimeInfo.TimeRange == timeRanges[index])//同一天，同一时段
                                        .map((data) => {
                                            let block_PopoverContent = <div style={{ width: 400 }}>
                                                <Row>
                                                    <Col span={4}><img style={{ width: 60, borderRadius: '50px' }} src={data.StudentInfo.icon} /></Col>
                                                    <Col span={12}><div>{distinctOfArray([data.StudentInfo.name, data.StudentInfo.chinese_name]).join(' ')}</div>
                                                        <div>{data.StudentInfo.email}</div>
                                                        <div>{distinctOfArray([data.StudentInfo.mobile, data.StudentInfo.parent_telephone]).join(' ')}</div>
                                                    </Col>
                                                    <Col span={6} style={{ textAlign: 'right' }}>
                                                        <a onClick={() => {
                                                            this.onLookView('SendMessage', data);
                                                        }}><Icon type="notification" />消息通知</a>
                                                    </Col>
                                                </Row>
                                                <Row><Col span={24}>{data.Location} {data.TimezoneName}</Col></Row>
                                                <Row><Col span={24}><span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(data.Remark) }}></span></Col></Row>
                                                <Row style={{ textAlign: 'right', padding: 10 }}><Col span={24}>
                                                    {(data.Status.toString() == '10' || data.Status.toString() == '21') && <Button style={{ marginLeft: 10 }} type='primary' onClick={() => {
                                                        this.onLookView('CustomerService', { ...data, ChooseStatus: "20", ChooseTeachers: teachers });
                                                    }}>{this.state.dic_TeachExperienceStatus.find(A => A.value == "20").title}</Button>}
                                                    {(data.Status.toString() == '10' || data.Status.toString() == '21') && <Button style={{ marginLeft: 10 }} onClick={() => {
                                                        this.onLookView('CustomerService', { ...data, ChooseStatus: "21" });
                                                    }}>{this.state.dic_TeachExperienceStatus.find(A => A.value == "21").title}</Button>}
                                                    {(data.Status.toString() == '10' || data.Status.toString() == '21') && <Button style={{ marginLeft: 10 }} onClick={() => {
                                                        this.onLookView('CustomerService', { ...data, ChooseStatus: "99" });
                                                    }}>{this.state.dic_TeachExperienceStatus.find(A => A.value == "99").title}</Button>}

                                                    {false && data.Status.toString() == '20' && <Button type='primary' style={{ marginLeft: 10 }} onClick={() => {
                                                        this.onLookView('CustomerService', { ...data, ChooseStatus: "30" });
                                                    }}>{this.state.dic_TeachExperienceStatus.find(A => A.value == "30").title}</Button>}
                                                    {false && data.Status.toString() == '20' && <Button style={{ marginLeft: 10 }} onClick={() => {
                                                        this.onLookView('CustomerService', { ...data, ChooseStatus: "31" });
                                                    }}>{this.state.dic_TeachExperienceStatus.find(A => A.value == "31").title}</Button>}
                                                    {data.Status.toString() == '20' && <Button style={{ marginLeft: 10 }} onClick={() => {
                                                        this.onLookView('CustomerService', { ...data, ChooseStatus: "99" });
                                                    }}>{this.state.dic_TeachExperienceStatus.find(A => A.value == "99").title}</Button>}

                                                    {data.Status.toString() == '30' && <Button type='primary' style={{ marginLeft: 10 }} onClick={() => {
                                                        this.onLookView('CustomerService', { ...data, ChooseStatus: "40" });
                                                    }}>{this.state.dic_TeachExperienceStatus.find(A => A.value == "40").title}</Button>}
                                                    {data.Status.toString() == '30' && <Button style={{ marginLeft: 10 }} onClick={() => {
                                                        this.onLookView('CustomerService', { ...data, ChooseStatus: "41" });
                                                    }}>{this.state.dic_TeachExperienceStatus.find(A => A.value == "41").title}</Button>}
                                                </Col>
                                                </Row>
                                            </div>;
                                            return <Popover content={block_PopoverContent} title={`${data.CourseLevel} 学生 -->${getDictionaryTitle(this.state.dic_TeachExperienceStatus, data.Status, '未知')}`} trigger="hover">
                                                <Tag color={statusColors[this.state.dic_TeachExperienceStatus.findIndex(A => A.value == data.Status.toString())]}><Icon type={statusIcons[this.state.dic_TeachExperienceStatus.findIndex(A => A.value == data.Status.toString())]} />{` ${data.StudentInfo.chinese_name}`}</Tag>
                                            </Popover>
                                        })
                                }
                            </div>
                        </div>
                    }
                }
                tableColumns.push(columnItem);
            })
            return <Table
                footer={() => {
                    return <div>预约试听状态说明：{this.state.dic_TeachExperienceStatus.map((item, index) => {
                        return <Tag color={statusColors[index]}><Icon type={statusIcons[index]} />{` ${item.title}`}</Tag>
                    })}
                        <br />
                        教师排课状态说明：<Tag style={{ background: '#fff', borderStyle: 'dashed' }}><Icon type="customer-service" /> 教师时间可用</Tag><Tag style={{ background: '#fff', borderStyle: 'dashed', color: '#ccc' }}><Icon type="customer-service" /> 教师时间已占用</Tag>
                    </div>
                }}
                title={() => {
                    return <Row gutter={24}>
                        <Col span={3} className='center'>
                            <Button onClick={() => { this.onWeekButtonClick(-1) }}><Icon type="left-circle-o" />上一周</Button>
                        </Col>
                        <Col span={18} className='center'>
                            <h3>教师排课及学生预约报名情况</h3>
                        </Col>
                        <Col span={3} className='center'><Button onClick={() => { this.onWeekButtonClick(1) }}>下一周<Icon type="right-circle-o" /></Button></Col>
                    </Row>
                }}
                rowClassName={(record, index) => {
                    var hour = parseInt(record.substr(0, 2));
                    return (hour >= 8 && hour <= 20) ? 'recommendArea' : '';
                }}
                bordered
                loading={this.state.loading}
                pagination={false}
                columns={tableColumns} //列定义
                dataSource={timeRanges}//数据
            />
        }
    }
    //渲染，根据模式不同控制不同输出
    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "SendMessage":
                block_content = <NotifyView recievers={[this.state.currentDataModel.StudentInfo]} viewCallback={this.onViewCallback} />
                break;
            case "Create":
            case "View":
            case "Cancel":
            case "Edit":
            case "CustomerService":
                block_content = <TeachExperienceView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                const { getFieldDecorator } = this.props.form;
                const formItemLayout = {
                    labelCol: { span: 8 },
                    wrapperCol: { span: 14 },
                };
                block_content = (
                    <div>
                        <Form
                            className="search-form"
                        >
                            <Row gutter={40}>
                                {this.getFields()}
                            </Row>
                            <Row>
                                <Col span={24} style={{ textAlign: 'right' }}>
                                    <Button type="primary" icon="search" onClick={this.onSearch}>查询</Button>
                                    <Button style={{ marginLeft: 8 }} onClick={() => { this.onLookView('Create', { FormCountry: '+1', FormAccountType: "2", StudentInfo: {} }) }} icon="plus">预约试听</Button>
                                    <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                                        更多 <Icon type={this.state.expand ? 'up' : 'down'} />
                                    </a>
                                </Col>
                            </Row>

                            {this.state.currentDataModel && <Modal width={600}
                                key={this.state.currentDataModel.key}
                                title="安排上课"
                                wrapClassName="vertical-center-modal"
                                visible={this.state.showTeachWindow}
                                onOk={() => {
                                    this.setState({ showTeachWindow: false });
                                }}
                                onCancel={() => {
                                    this.setState({ showTeachWindow: false });
                                }}
                                footer={null}
                            >
                                <Row>
                                    <Col span={24}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="学生信息"
                                        >
                                            {this.state.currentDataModel.StudentInfo.name} {this.state.currentDataModel.StudentInfo.chinese_name}
                                        </FormItem>
                                    </Col>
                                    <Col span={24}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="试听时间"
                                        >
                                            {this.state.currentDataModel.LocalTimeInfo.ScheduleDate} {this.state.currentDataModel.LocalTimeInfo.TimeRange}
                                        </FormItem>
                                    </Col>
                                    <Col span={24}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="授课教师"
                                        >
                                            {getFieldDecorator('FormTeacherID', {
                                                initialValue: '',
                                                rules: [
                                                    {
                                                        required: true, message: '请指定授课教师!',
                                                    }],
                                            })(
                                                <Select style={{ width: 250 }} onChange={(value) => {
                                                    if (value == '') {
                                                        this.state.teacherClassInfo.data_list = [];
                                                        this.setState({ teacherClassInfo: this.state.teacherClassInfo });
                                                        return;
                                                    }
                                                    //查询教师开的班
                                                    this.props.getTeachClassList({ PageIndex: 1, PageSize: 20, Status: 1, Teacher: value }).payload.promise.then((response) => {
                                                        let data = response.payload.data;
                                                        if (data.result === false) {
                                                            message.error(data.message);
                                                        }
                                                        else {
                                                            this.setState({ teacherClassInfo: data });
                                                        }
                                                    })
                                                }}><Option value=''>请选择教师</Option>
                                                    {this.state.chooseTeachers.map((item) => {
                                                        return <Option value={item.TeacherInfo.uid}>{item.TeacherInfo.chinese_name}</Option>
                                                    })}
                                                </Select>
                                                )}
                                        </FormItem>
                                    </Col>
                                    <Col span={24}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="教师授课班"
                                        >
                                            {getFieldDecorator('FormTeachClassID', {
                                                initialValue: '',
                                                rules: [
                                                    {
                                                        required: true, message: '请指定授课教师!',
                                                    }],
                                            })(
                                                <Select style={{ width: 250 }} >
                                                    {this.state.teacherClassInfo.data_list.map((item) => {
                                                        return <Option value={item.TeachClassID}>{item.TeachClassName}</Option>
                                                    })}
                                                </Select>
                                                )}
                                        </FormItem>
                                    </Col>
                                    <Col span={24}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="上课教室"
                                        >
                                            {getFieldDecorator('FormTeachClassRoomID', {
                                                initialValue: '',
                                                rules: [
                                                    {
                                                        required: true, message: '请指定授课教师!',
                                                    }],
                                            })(
                                                <Select style={{ width: 250 }} >
                                                    {this.state.teacherClassInfo.dic_TeachClassRooms.map((item) => {
                                                        return <Option value={item.value}>{item.title}</Option>
                                                    })}
                                                </Select>
                                                )}
                                        </FormItem>
                                    </Col>
                                    <Col span={24} className='center'>
                                        <Button type="primary" icon="save" loading={this.state.submiting} onClick={this.onStudentTeachSubmit}>提交</Button>
                                        <Button type="" style={{ marginLeft: 10 }} icon="save" onClick={() => {
                                            this.setState({ showTeachWindow: false });
                                        }}>取消</Button>
                                    </Col>
                                    <Col span={24}>
                                        <br />
                                    </Col>
                                </Row>
                            </Modal>
                            }
                        </Form>
                        <div className="search-result-list">
                            <Tabs activeKey={this.state.currentTab} onChange={this.tabChange} type="card">
                                <TabPane tab="周排班表" key="tab1">
                                    {this.renderScheduleTable()}
                                </TabPane>
                                <TabPane tab="列表视图" key="tab2">
                                    <Table
                                        loading={this.state.loading}
                                        pagination={false}
                                        columns={this.columns} //列定义
                                        dataSource={this.state.data_list}//数据
                                    />
                                    <div className="search-paging">
                                        <Row>
                                            <Col span={8} className={'search-paging-batchcontrol'}>
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
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                );
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedAdvExperienceManage = Form.create()(AdvExperienceManage);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getTeachExperienceRecordList: bindActionCreators(getTeachExperienceRecordList, dispatch),
        saveTeachExperienceRecord: bindActionCreators(saveTeachExperienceRecord, dispatch),
        switchTeachExperienceStatus: bindActionCreators(switchTeachExperienceStatus, dispatch),
        getTeachTeacherScheduleList: bindActionCreators(getTeachTeacherScheduleList, dispatch),
        saveTeacherScheduleInfo: bindActionCreators(saveTeacherScheduleInfo, dispatch),
        getTeachClassList: bindActionCreators(getTeachClassList, dispatch),
        studentExperienceToTeachClass: bindActionCreators(studentExperienceToTeachClass, dispatch),//学生试听分班操作
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAdvExperienceManage);