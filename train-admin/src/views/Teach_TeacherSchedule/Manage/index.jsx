import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, DatePicker, Tabs, Tag, Radio, Spin, Tooltip, Modal } from 'antd';
import { getTeachTeacherScheduleList, saveTeacherScheduleInfo, switchTeacherScheduleInfoStatus, deleteTeacherScheduleInfo } from '@/actions/teach';
import { getDictionaryTitle, getWeekTitle, dateFormat, dataBind } from '@/utils';
import TeachTeacherScheduleView from '../View';
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
class TeachTeacherScheduleManage extends React.Component {
    constructor(props) {
        super(props)
        var now = new Date();
        var endWeek = new Date();
        endWeek.setHours(now.getHours() + 6 * 24);

        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 999, Keyword: '', Status: "-1", Teacher: '', Week: '-1', TimeRange: '', ClassType: '', BeginDate: dateFormat(now, 'yyyy-MM-dd'), EndDate: dateFormat(endWeek, 'yyyy-MM-dd'), Timezone: '', StudentTimezone: null },
            dic_Status: [],
            dic_Weeks: [],
            dic_ClassTypes: [],
            dic_Timezones: [],
            data_list: [],
            data_list_total: 0,
            UserSelecteds: [],//列表选择
            loading: false,
            localTimezone: null,//本地操作时区            
            currentTab: 'tab1',
        };
    }

    componentWillMount() {
        //首次进入搜索，加载服务端主题典项内容
        this.onSearch();
    }

    //table 输出列定义
    columns = [
        {
            title: '教师时间安排',
            render: (text, record, index) => {
                return `${record.TeacherInfo.chinese_name} ${record.ScheduleDate}(${getDictionaryTitle(this.state.dic_Weeks, record.Week)}) ${record.TimeRange}`
            }
        },
        {
            title: '所在时区',
            render: (text, record, index) => {
                return `${getDictionaryTitle(this.state.dic_Timezones, record.Timezone)}`
            }
        }, {
            title: '班型',
            render: (text, record, index) => {
                return `${getDictionaryTitle(this.state.dic_ClassTypes, record.ClassType)}`
            }
        },
        {
            title: '状态',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.Status);
            }
        },
        {
            title: '操作',
            width: 100,//可预知的数据长度，请设定固定宽度
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => { this.onLookView('Edit', record) }}>编辑</a> <span className="ant-divider" />
                    <a onClick={() => { this.onLookView('View', record) }}>详情</a>
                    {/* <span className="ant-divider" />
                    <a onClick={() => { this.onSwitchStatus(record) }}>{record.Status != 1 ? '启用' : '停用'}</a> */}
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
                <FormItem {...formItemLayout} label={'教师'} >
                    {getFieldDecorator('Teacher', { initialValue: this.state.pagingSearch.Teacher })(
                        <Input placeholder={''} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem {...formItemLayout} label={'时间段'} >
                    {getFieldDecorator('TimeRange', { initialValue: this.state.pagingSearch.TimeRange })(
                        <Input placeholder={''} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="时区"
                >
                    {getFieldDecorator('Status', { initialValue: this.state.pagingSearch.Status })(
                        <Select>
                            <Option value="-1">全部</Option>
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
                <FormItem
                    {...formItemLayout}
                    label="班型"
                >
                    {getFieldDecorator('ClassType', { initialValue: this.state.pagingSearch.ClassType })(
                        <Select>
                            <Option value="-1">全部</Option>
                            {this.state.dic_ClassTypes.map((item) => {
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
                    label="截止日期"
                >
                    {getFieldDecorator('EndDate', { initialValue: dataBind(this.state.pagingSearch.EndDate, true) })(
                        <DatePicker />
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
            (values.BeginDate && values.BeginDate.format) && (values.BeginDate = values.BeginDate.format('YYYY-MM-DD'));
            (values.BeginDate && values.EndDate.format) && (values.EndDate = values.EndDate.format('YYYY-MM-DD'));
            let pagingSearch = { ...this.state.pagingSearch, ...values };
            this.props.getTeachTeacherScheduleList(pagingSearch).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    this.setState({ loading: false })
                    message.error(data.message);
                }
                else {
                    this.setState({ pagingSearch, ...data, loading: false });
                    //默认设置学生目标视图，首次则自动定位用户所在时区
                    if (!this.state.pagingSearch.StudentTimezone) {
                        if (data.dic_Timezones.find(A => A.value == data.localTimezone)) {
                            this.state.pagingSearch.StudentTimezone = data.localTimezone;
                        }
                        else {
                            this.state.pagingSearch.StudentTimezone = data.dic_Timezones[0].value;
                        }
                        this.setState({ pagingSearch: this.state.pagingSearch });
                    }
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
                    this.props.saveTeacherScheduleInfo(dataModel).payload.promise.then((response) => {
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
                    this.props.switchTeacherScheduleInfoStatus(this.state.currentDataModel).payload.promise.then((response) => {
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
        this.props.switchTeacherScheduleInfoStatus({ ...item, Status: 1 - item.Status }).payload.promise.then((response) => {
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
    onDeleteSelected = (e) => {
        Modal.confirm({
            title: '你确认要删除选中的教师排课安排吗?',
            content: '如果已安排上课，则不能被删除！',
            onOk: () => {
                //提交
                var batchDeleteIDs = this.state.UserSelecteds.map((A) => { return { ID: A } });
                this.props.deleteTeacherScheduleInfo({ TeacherScheduleInfos: batchDeleteIDs }).payload.promise.then((response) => {
                    let data = response.payload.data;
                    this.setState({ UserSelecteds: [] });
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        this.onSearch();
                    }
                })
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
    }

    tabChange = (key) => {
        console.log(key);
        this.setState({ currentTab: key })
    }
    StudentTimezoneChange = (e) => {
        this.state.pagingSearch.StudentTimezone = e.target.value;
        this.setState({ pagingSearch: this.state.pagingSearch });
        setTimeout(() => {
            //重新查找
            this.onSearch();
        }, 100);
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
            this.onSearch();
        }, 100);
    }
    renderScheduleTable() {
        {
            if (this.state.loading && this.state.data_list.length == 0) {
                return <div style={{ width: 100, margin: '300 auto' }}><Spin tip="数据加载中..."></Spin></div>
            }
            //筛选对应时区的数据
            let studentTimezone = this.state.pagingSearch.StudentTimezone || this.state.dic_Timezones[0].value;
            let timeRanges = [];
            let localTimeDataList = [];
            let currentWeek = (new Date(this.state.toBeginDate)).getDay();//当前周几
            this.state.data_list.map((data) => {
                var localTimeInfo = data.GlobalTimes.find(item => item.Timezone == studentTimezone);
                timeRanges = [...timeRanges.filter(item => item != localTimeInfo.TimeRange), localTimeInfo.TimeRange];
                data.LocalTimeInfo = localTimeInfo;
                localTimeDataList.push(data);
            });
            //color 颜色
            var classType01 = '#8a2be2';
            var classType02 = '#2db7f5';
            //table 行数据
            timeRanges = timeRanges.sort((a, b) => a > b ? 1 : -1);//按时间段排序
            //table 表头定义
            let tableColumns = [
                {
                    title: <div className='center'>开课时间</div>,
                    className: 'center',
                    render: (text, record, index) => {
                        return `${record}`
                    }
                }];
            //动态按照今日周几排列表头顺序
            var today = dateFormat(new Date(), 'yyyy-MM-dd')
            this.state.dic_Weeks.map((week, index) => {
                //计算获得周几对应的日期
                let currentDate = new Date(this.state.toBeginDate);
                currentDate.setHours(currentDate.getHours() + index * 24);
                //当前周几排第一位
                let realWeek = (currentWeek + index) % 7;
                //周几对应的数据列定义
                let columnItem = {
                    title: <div className={today == dateFormat(currentDate, 'yyyy-MM-dd') ? 'center today' : 'center'}>{getWeekTitle(realWeek)}<br />
                        {dateFormat(currentDate, 'yyyy-MM-dd')}{today == dateFormat(currentDate, 'yyyy-MM-dd') ? '(今天)' : ''}</div>,//周几+日期
                    render: (text, record, index) => {
                        return <div>
                            <Tag style={{ fontSize: 16, border: 'dashed 1px #ccc' }} onClick={() => {
                                this.onLookView('Create', {
                                    FormWeekStartDate: dateFormat(currentDate, 'yyyy-MM-dd'),
                                    TimeRange: timeRanges[index],
                                    FormChooseWeek: [`${realWeek}`],
                                    FormRepeatWeeks: 1,
                                    Timezone: this.state.pagingSearch.StudentTimezone
                                })
                            }} >+</Tag>
                            {
                                //从总数据标准基于本地时间，查找对应相同周几及开课时间段的老师数据
                                localTimeDataList
                                    .filter((A) => { return A.LocalTimeInfo.ScheduleDate >= this.state.toBeginDate && A.LocalTimeInfo.ScheduleDate <= this.state.toEndDate; })//过滤特定日期
                                    .filter(data => data.LocalTimeInfo.Week == realWeek && data.LocalTimeInfo.TimeRange == timeRanges[index])//同一天，同一时段
                                    .map((data) => {
                                        if (data.ClassType == '01')
                                            return <Tag closable={true} onClose={(e) => {
                                                e.preventDefault();
                                                this.state.UserSelecteds = [data.key];
                                                this.onDeleteSelected(e);
                                            }} color={data.Status == 1 ? '#ccc' : classType01}><Icon type="team" /> {data.TeacherInfo.chinese_name}</Tag>
                                        else
                                            return <Tag closable={true} onClose={(e) => {
                                                e.preventDefault();
                                                this.state.UserSelecteds = [data.key];
                                                this.onDeleteSelected(e);
                                            }} color={data.Status == 1 ? '#ccc' : classType02}><Icon type="customer-service" /> {data.TeacherInfo.chinese_name}</Tag>
                                    })
                            }
                        </div>
                    }
                }
                tableColumns.push(columnItem);
            })
            return <Table
                footer={() => { return <div>教师排课表说明：<Tag color={classType02}><Icon type="customer-service" /> 试听课（空闲）</Tag><Tag color={classType01}><Icon type="team" /> 小班课（空闲）</Tag><Tag color={'#ccc'}><Icon type="user" /> 试听课（占用）</Tag><Tag color={'#ccc'}><Icon type="team" /> 小班课（占用）</Tag></div> }}
                title={() => {
                    return <Row gutter={24}>
                        <Col span={3} className='center'><br />
                            <Button onClick={() => { this.onWeekButtonClick(-1) }}><Icon type="left-circle-o" />上一周</Button>
                        </Col>
                        <Col span={18} className='center'>
                            <h3>当地时区对应课表</h3>
                            <br />
                            <RadioGroup value={this.state.pagingSearch.StudentTimezone} onChange={this.StudentTimezoneChange}>
                                {
                                    this.state.dic_Timezones.map((item, index) => {
                                        return <RadioButton value={item.value}>{item.title}</RadioButton>
                                    })
                                }
                            </RadioGroup>
                        </Col>
                        <Col span={3} className='center'><br /><Button onClick={() => { this.onWeekButtonClick(1) }}>下一周<Icon type="right-circle-o" /></Button></Col>
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
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
                block_content = <TeachTeacherScheduleView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                //表格选择删除后处理
                var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        this.setState({ UserSelecteds: selectedRowKeys })
                    },
                    getCheckboxProps: record => ({
                        disabled: record.Status == 1,    // Column configuration not to be checked
                    }),
                };

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
                                    <Button style={{ marginLeft: 8 }} onClick={() => { this.onLookView('Create', { IsSignup: 0 }) }} icon="plus">教师排课</Button>
                                    <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                                        更多 <Icon type={this.state.expand ? 'up' : 'down'} />
                                    </a>
                                </Col>
                            </Row>
                        </Form>
                        <div className="search-result-list">
                            <Tabs activeKey={this.state.currentTab} onChange={this.tabChange} type="card">
                                <TabPane tab="周排课视图" key="tab1">
                                    {this.renderScheduleTable()}
                                </TabPane>
                                <TabPane tab="数据列表视图" key="tab2">
                                    <Table
                                        loading={this.state.loading}
                                        rowSelection={rowSelection}
                                        pagination={false}
                                        columns={this.columns} //列定义
                                        dataSource={this.state.data_list}//数据
                                    />
                                    <div className="search-paging">
                                        <Row>
                                            <Col span={8} className={'search-paging-batchcontrol'}>
                                                {this.state.UserSelecteds.length > 0 ? <Button icon="delete" onClick={this.onDeleteSelected}>{'批量删除'}</Button> : <Button icon="delete" disabled>{'批量删除'}</Button>}
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
const WrappedTeachTeacherScheduleManage = Form.create()(TeachTeacherScheduleManage);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getTeachTeacherScheduleList: bindActionCreators(getTeachTeacherScheduleList, dispatch),
        saveTeacherScheduleInfo: bindActionCreators(saveTeacherScheduleInfo, dispatch),
        switchTeacherScheduleInfoStatus: bindActionCreators(switchTeacherScheduleInfoStatus, dispatch),
        deleteTeacherScheduleInfo: bindActionCreators(deleteTeacherScheduleInfo, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachTeacherScheduleManage);