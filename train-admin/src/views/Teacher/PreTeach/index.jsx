import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, Progress, DatePicker, Spin, Alert } from 'antd';
import { getTeacherTeachRecords } from '@/actions/teach';
import { getDictionaryTitle, ellipsisText, getWeekTitle, convertJSONDateToJSDateObject } from '@/utils';
import TeachKQCard from '@/views/Teacher/Components/teachKQCard'
import TeachDesign from '../Components/teachDesign';
import TeachDesignOnline from '../Components/teachDesignOnline';
const FormItem = Form.Item;
class TeacherPreTeach extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', isArchives: false },
            data_list: [],
            data_list_total: 0,
            loading: false
        };
    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.Keyword != this.props.Keyword) {
            setTimeout(() => {
                this.onSearch();
            }, 100)
        }
        console.log(nextProps)
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
            this.props.getTeacherTeachRecords(pagingSearch).payload.promise.then((response) => {
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
    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
    };
    //视图回调
    onViewCallback = (dataModel) => {
        var find = this.state.data_list.find(A => A.teach_schedule_id == this.state.currentDataModel.teach_schedule_id);
        find.kzkjTotal = dataModel;
        this.setState({ data_list: this.state.data_list, currentDataModel: null, editMode: 'Manage' })
    }
    //渲染，根据模式不同控制不同输出
    render() {
        if (this.state.loading) {
            return <div style={{ width: 100, margin: '300 auto' }}><Spin tip="数据加载中..."></Spin></div>
        }
        let todayList1 = [];//上课列表
        let todayList2 = [];//点评列表
        let nextDayList = [];//下一天数据
        let today = new Date().toLocaleDateString()//当天日期
        let now = new Date();
        this.state.data_list.map((item) => {
            var plan_begin_time = convertJSONDateToJSDateObject(item.plan_begin_time);
            if (plan_begin_time.toLocaleDateString() == today) {
                var date3 = plan_begin_time.getTime() - now.getTime();
                var leave1 = date3 % (24 * 3600 * 1000);    //计算天数后剩余的毫秒数  
                var hours = Math.floor(leave1 / (3600 * 1000));
                if (hours < item.periods || plan_begin_time > now) {
                    todayList1.push(item);
                }
                else {
                    todayList2.push(item);
                }
            }
            else if (plan_begin_time > now) {
                nextDayList.push(item);
            }
            else {
                todayList2.push(item);
            }
        });

        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
            case "Audit":
                if (this.state.currentDataModel.teach_way == 1) {
                    block_content = <TeachDesign viewCallback={this.onViewCallback} {...this.state} />
                } else {
                    block_content = <TeachDesignOnline viewCallback={this.onViewCallback} {...this.state} />
                }
                break;
            case "Manage":
            default:
                block_content = (
                    <Row gutter={24}>
                        {nextDayList.length > 0 && nextDayList.map((item, index) => {
                            return <Col span={8} style={{ marginBottom: 30 }}>
                                <TeachKQCard item={item} onClick={() => { this.onLookView('Edit', item) }} />
                            </Col>
                        })}
                        {
                            nextDayList.length == 0 && <Col span={24}> <Alert
                                message="提示"
                                description="暂无教学任务"
                                type="info"
                                showIcon
                            /></Col>
                        }
                    </Row>
                );
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedTeacherPreTeach = Form.create()(TeacherPreTeach);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getTeacherTeachRecords: bindActionCreators(getTeacherTeachRecords, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeacherPreTeach);