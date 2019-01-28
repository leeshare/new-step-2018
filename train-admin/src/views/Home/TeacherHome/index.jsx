import React from 'react'
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Col, Table, Alert, Icon, Progress, Timeline, Card, Spin, Badge } from 'antd';
import { Route, Redirect } from 'react-router-dom';

import { getTeacherTeachRecords, getMyStudentList } from '@/actions/teach';
import { getDictionaryTitle, ellipsisText, getWeekTitle, convertJSONDateToJSDateObject, dateDiffOfDay, dateFormat, getTeachLocalDate } from '@/utils';

import NumberCard from '../components/numberCard';
import PanelBox from '../../../components/PanelBox';
import UserInfo from '../components/UserInfo';
import TeachKQCard from '@/views/Teacher/Components/teachKQCard'
import TeachKZCard from '@/views/Teacher/Components/teachKZCard'
import TeachKHCard from '@/views/Teacher/Components/teachKHCard'

import TeachKHDPList from '@/views/Teacher/Components/teachKHDPList';
import TeachDesign from '@/views/Teacher/Components/teachDesign';
import TeachDesignOnline from '@/views/Teacher/Components/teachDesignOnline';
import './index.less'
const colors = ['#64ea91', '#8fc9fb', '#d897eb', '#f69899', '#f8c82e', '#f797d6', '#e5e5e5', '#f4f4f4', '#d6fbb5', '#c1e0fc'];

class TeacherHome extends React.Component {
  constructor() {
    super()
    this.state = {
      loading: true,
      expand: false,
      currentDataModel: null,
      editMode: 'Main',//Main,KH,KQ
      pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', isArchives: false },
      data_list: [],
      data_students: [],
      dic_ClassInfos: [],
      data_list_total: 0,
      progressInfo:
      {
        totalSchedules: 0,
        completedSchedules: 0,
        totalPeriods: 0,
        completedPeriods: 0,
        totalStudents: 0,
        totalComments: 0,
        notifyVideoRemark: false,
        time_limit_timer: null,
        time: ''
      },
      loading: false
    };
  }

  componentWillMount() {
    this.onSearchTeachRecordTasks();

    this.props.getMyStudentList({ pageIndex: 1, PageSize: 10 }).payload.promise.then((response) => {
      let data = response.payload.data;
      let students = { data_students: data.data_list, dic_ClassInfos: data.dic_ClassInfos }
      this.setState({
        ...students, loading: false
      })
    })
    this.time_limit_timer = setInterval(() => {
      this.setState({ time: new Date() })
    }, 1000);
  }
  componentWillUnmount() {
    var that = this;
    if (that.time_limit_timer) {
      clearInterval(that.time_limit_timer);
      that.time_limit_timer = null
    }
  }
  onSearchTeachRecordTasks = () => {
    this.props.getTeacherTeachRecords(this.state.pagingSearch).payload.promise.then((response) => {
      let data = response.payload.data;
      this.setState({
        ...data, loading: false
      })
    });
  }
  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    this.onSearchTeachRecordTasks();
    this.setState({ currentDataModel: null, editMode: 'Main' })
  }
  render() {
    if (this.state.editMode == "KQ_2") {
      if (this.state.currentDataModel.teach_way == 1) {
        return <TeachDesign currentDataModel={this.state.currentDataModel} viewCallback={this.onViewCallback} tabKey={'2'} />
      }
      else {
        return <TeachDesignOnline currentDataModel={this.state.currentDataModel} viewCallback={this.onViewCallback} tabKey={'2'} />
      }
    }
    if (this.state.loading) {
      return <div style={{ width: 100, margin: '300 auto' }}><Spin tip="数据加载中..."></Spin></div>
    }
    if (this.state.editMode == "KQ") {
      if (this.state.currentDataModel.teach_way == 1) {
        return <TeachDesign currentDataModel={this.state.currentDataModel} viewCallback={this.onViewCallback} />
      }
      else {
        return <TeachDesignOnline currentDataModel={this.state.currentDataModel} viewCallback={this.onViewCallback} />
      }
    }
    if (this.state.editMode == "KH") {
      return <TeachKHDPList currentDataModel={this.state.currentDataModel} viewCallback={this.onViewCallback} />
    }
    if (this.state.editMode == 'Main') {
      let progress = 0;
      if (this.state.progressInfo.totalSchedules > 0) {
        progress = Math.round(this.state.progressInfo.completedSchedules / this.state.progressInfo.totalSchedules * 100.00);
      }
      let numberCards = [];
      numberCards[0] = {
        icon: 'solution',
        color: colors[0],
        title: `累计上课`,
        number: `${this.state.progressInfo.completedSchedules}次`,
        news: 0,
      };
      numberCards[1] = {
        icon: 'appstore-o',
        color: colors[1],
        title: `累计课时`,
        number: `${this.state.progressInfo.completedPeriods}课时`,
        news: 0,
      };
      numberCards[2] = {
        icon: 'edit',
        color: colors[2],
        title: `累计点评`,
        number: `${this.state.progressInfo.totalComments}人`,
        news: 0,
      };
      let todayList1 = [];//上课
      let todayList2 = [];//点评列表
      let nextDayList = [];//下一天数据
      let today = dateFormat(new Date(), 'yyyy-MM-dd')//当天日期
      let now = new Date();
      //console.log('now=>'+dateFormat(now,'yyyy-MM-dd'))
      this.state.data_list.map((item) => {
        var localPlanDateInfo = getTeachLocalDate(item);
        var { plan_begin_time, plan_end_time } = localPlanDateInfo;
        if (dateFormat(plan_begin_time, 'yyyy-MM-dd') == today) {
          console.log('plan_end_time=>' + dateFormat(plan_end_time, 'yyyy-MM-dd hh:mm:ss'))
          if (item.teach_way == 2) {//在线课堂
            todayList1.push(item);
          }
          else {
            todayList2.push(item);
          }
        }
        //近三日内要上课的授课安排
        else if (dateFormat(plan_begin_time, 'yyyy-MM-dd') > today) {
          if (dateDiffOfDay(plan_begin_time, now) <= 3) {
            if (item.teach_way == 2) {//在线课堂
              todayList1.push(item);
            }
            else {
              nextDayList.push(item);
            }
          }
        }
        else {//最近一次上课
          todayList2.push(item);
        }
      });

      return <Row gutter={24}>
        <Col span={18}>
          <PanelBox title="本月教学情况"  >
            <Row gutter={24}>
              <Col span={8}>
                <NumberCard {...numberCards[0]} />
                {this.state.progressInfo.notifyVideoRemark && <Badge dot={this.state.progressInfo.notifyVideoRemark}>
                  <a onClick={() => {
                    this.state.progressInfo.notifyVideoRemark = false;
                    this.setState({ progressInfo: this.state.progressInfo })
                    window.location.href = (window.location.hash.replace('/home', '/Teacher/TeachVideo'));
                  }} className="head-example" >上课视频点评</a>
                </Badge>}
              </Col>
              <Col span={8}>
                <NumberCard {...numberCards[1]} />
              </Col>
              <Col span={8}>
                <NumberCard {...numberCards[2]} />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Progress percent={progress} strokeWidth={5} status="active" />
              </Col>
            </Row>
          </PanelBox>
          <Row gutter={24}>
            {//显示今日或最后一次点评任务
              todayList1.map((item, index) => {
                return <Col span={12} style={{ marginBottom: 24 }}>
                  <TeachKZCard item={item} onClick={() => { this.onLookView('KQ_2', item) }} />
                </Col>
              })
            }
            {//显示今日或最后一次点评任务
              todayList2.map((item, index) => {
                return <Col span={12} style={{ marginBottom: 24 }}>
                  <TeachKHCard item={item} onClick={() => { this.onLookView('KH', item) }} />
                </Col>
              })
            }
            {
              //列出仅3天的要开课
              nextDayList.map((item, index) => {
                return <Col span={12} style={{ marginBottom: 24 }}>
                  <TeachKQCard item={item} onClick={() => { this.onLookView('KQ', item) }} />
                </Col>
              })
            }
          </Row>
        </Col>
        <Col span={6}>
          <Row >
            <Col lg={24} md={12}>
              <UserInfo />
            </Col>
            <Col lg={24} md={12}>
              <Card title={'我的学生'} bordered={false} bodyStyle={{ paddingTop: 0, paddingLeft: 18 }} extra={<a href='#/Teacher/Student'>更多</a>}>
                <Row gutter={24}>
                  {this.state.data_students.map((item, index) => {
                    let classNames = item.ClassInfos.map((item, index) => {
                      return getDictionaryTitle(this.state.dic_ClassInfos, item.TeachClassID);
                    });
                    let classInfo = classNames.join(',');
                    return <Col span={24} style={{ margin: 10 }}>
                      <Row gutter={24}>
                        <Col span={5}><img className='img_student' src={item.UserInfo.icon} /></Col>
                        <Col span={7}>
                          <h5>{item.UserInfo.name}</h5>
                          <div>{item.UserInfo.chinese_name}</div>
                        </Col>
                        <Col span={12}>
                          <div>{classInfo}</div>
                        </Col>
                      </Row>
                    </Col>
                  })}
                </Row>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    }
  }
}

const mapStateToProps = (state) => {
  return state;
};

function mapDispatchToProps(dispatch) {
  return {
    getTeacherTeachRecords: bindActionCreators(getTeacherTeachRecords, dispatch),
    getMyStudentList: bindActionCreators(getMyStudentList, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(TeacherHome);