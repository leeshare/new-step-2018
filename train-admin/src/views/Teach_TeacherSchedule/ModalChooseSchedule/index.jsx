import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, Timeline, Spin } from 'antd';
import { getProductTimeRange } from '@/actions/teach';
import { getDictionaryTitle, dateFormat, getWeekTitle } from '@/utils';
import './index.less';
const FormItem = Form.Item;
class ModalChooseSchedule extends React.Component {

    constructor(props) {
        super(props)
        //加载最新的排课表
        //获取当前日期
        let beginDate = new Date();
        let endDate = new Date();
        endDate.setHours(endDate.getHours() + 24 * 7);
        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,div,Delete
            pagingSearch: { productId: props.ProductID, beginDate, endDate, isExperience: props.IsExperience || false, defaultTimezone: props.Timezone },
            WeekSchedules: null,
            loading: false,
            selectedTimeRange: '',
            selectedRealTimeRange: '',
            selectedWeekInfo: null,
            switchWeekInfo: null,
        };

    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

    groupScheduleByWeek = (schedules) => {
        //alert(JSON.stringify(schedules))
        let { data_list, localTimezoneId, localTimezoneName, localTimezone } = schedules;
        if (this.state.pagingSearch.defaultTimezone) {
            localTimezoneId = this.state.pagingSearch.defaultTimezone;//
        }
        this.setState({ LocalTimezone: localTimezoneId, LocalTimezoneName: localTimezoneName });
        let real_timeZone = new Date().getTimezoneOffset();//时间的时区时差
        //本地时区数据列表
        let localTimeDataList = [];
        let allTimeRanges = [];
        data_list.map((data) => {
            let localTimeInfo = data.GlobalTimes.find(item => item.Timezone == localTimezoneId);
            allTimeRanges = [...allTimeRanges.filter(item => item != localTimeInfo.TimeRange), localTimeInfo.TimeRange];
            data.LocalTimeInfo = localTimeInfo;
            localTimeDataList.push(data);
        });
        //按上课时间段排序
        allTimeRanges = allTimeRanges.sort((a, b) => a > b ? 1 : -1);

        //动态按照今日周几排列表头顺序
        let today = dateFormat(new Date(), 'yyyy-MM-dd');
        let currentWeek = (new Date()).getDay();
        let daySchedules = [];
        [1, 2, 3, 4, 5, 6, 0].map((week, index) => {
            //计算获得周几对应的日期
            let currentDate = new Date();
            currentDate.setHours(currentDate.getHours() + index * 24);
            //当前周几排第一位
            let realWeek = (currentWeek + index) % 7;
            let scheduleDate = dateFormat(currentDate, 'yyyy-MM-dd');
            daySchedules.push({
                Week: realWeek,
                WeekTitle: getWeekTitle(realWeek),
                ScheduleDate: scheduleDate,
                ScheduleDateTitle: index == 0 ? '今' : dateFormat(currentDate, 'dd'),
                DayTimeRanges: localTimeDataList.filter(data => data.LocalTimeInfo.ScheduleDate == scheduleDate)//同一天
            });
        });
        let result = {
            allTimeRanges, daySchedules
        };
        //alert(JSON.stringify(result))
        return result;
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
            this.props.getProductTimeRange(pagingSearch).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    this.setState({ loading: false })
                    message.error(data.message);
                }
                else {
                    this.setState({ pagingSearch, loading: false });
                    var weekSchedules = this.groupScheduleByWeek(data);
                    this.setState({
                        WeekSchedules: weekSchedules,
                        switchWeekInfo: weekSchedules.daySchedules[0],
                    });
                }
            })
        });
    }
    chooseTimeRange = (timeRange) => {
        let scheduleSelected = { selectedTimeRange: timeRange, can_save: true, selectedWeekInfo: this.state.switchWeekInfo };
        this.setState(scheduleSelected);
        this.props.callback && this.props.callback({ ...scheduleSelected, Timezone: this.state.LocalTimezone, TimezoneName: this.state.LocalTimezoneName });//回调
    }

    switchWeek = (week) => {
        this.setState({ switchWeekInfo: week })
    }
    //渲染，根据模式不同控制不同输出
    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Manage":
            default:
                if (!this.state.WeekSchedules) { return <div style={{ width: 100, margin: '100 auto' }}><Spin tip="数据加载中..."></Spin></div> }
                let block_weeks = <Row type="flex" justify="center" style={{ backgroundColor: '#fff', padding: 10 }}>
                    {this.state.WeekSchedules.daySchedules.map((item, i) => {
                        return (<Col span={3} className={this.state.switchWeekInfo.Week == item.Week ? 'center block_week_selected' : 'center'}>
                            <div onClick={() => this.switchWeek(item)}>
                                {item.WeekTitle}
                            </div>
                            <div onClick={() => this.switchWeek(item)}>{item.ScheduleDateTitle}</div>
                        </Col>)
                    })
                    }
                </Row>
                let block_dayTimeRanges = this.state.WeekSchedules.allTimeRanges.map((item, i) => {
                    // let startTime, endTime = "";
                    // startTime = item.split('~')[0];
                    // endTime = item.split('~')[1];//Util.timeRangeAddMinute(item.split('~')[1], -5);
                    let validTimeRange = this.state.switchWeekInfo.DayTimeRanges.find(A => A.LocalTimeInfo.TimeRange == item);
                    if (!validTimeRange) return null;
                    return (<Row style={{ padding: '10 20' }} gutter={24} className='timeRangeItem'>
                        <Col span={19}><Icon type="clock-circle-o" style={{ fontSize: 14, paddingRight: 10 }} /><span className='text_startTime'>{item}</span></Col>
                        {
                            validTimeRange &&
                            <Col span={5} onClick={() => this.chooseTimeRange(item)}>
                                {(this.state.selectedWeekInfo == this.state.switchWeekInfo && item == this.state.selectedTimeRange) && <span style={{ paddingLeft: 20 }}><Icon type="check" /></span>}
                                {!(this.state.selectedWeekInfo == this.state.switchWeekInfo && item == this.state.selectedTimeRange) && <span className={'text_appoint'}>选择</span>}
                            </Col>
                        }
                        {
                            !validTimeRange &&
                            <Col span={5}>
                                <span className='text_appoint_disable'>选择</span>
                            </Col>
                        }
                    </Row>)
                })
                let block_dayTimeRanges_valid = block_dayTimeRanges.filter(A => A != null);                
                block_content = (
                    <div className="modal-search">
                        {block_weeks}
                        <div className='block_timeranges'>
                            {block_dayTimeRanges_valid.length > 0 ? block_dayTimeRanges_valid : <div style={{ textAlign: 'center' }}>当天没有排课安排,请您选择其它时间。</div>}
                        </div>
                    </div>
                );
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedModalChooseSchedule = Form.create()(ModalChooseSchedule);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getProductTimeRange: bindActionCreators(getProductTimeRange, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedModalChooseSchedule);