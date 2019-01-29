import React from 'react'
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Col, Table, Alert, Icon, Progress, Timeline, Card, Spin, Badge } from 'antd';
import { Route, Redirect } from 'react-router-dom';

import { getStudentTeachRecords } from '@/actions/teach';
import { getDictionaryTitle, ellipsisText, getWeekTitle, convertJSONDateToJSDateObject, dateDiffOfDay, dateFormat } from '@/utils';

import NumberCard from '../components/numberCard';
import PanelBox from '../../../components/PanelBox';
import UserInfo from '../components/UserInfo';
import StudentKZCard from '@/views/Teacher/Components/studentKZCard'
import './index.less'
const colors = ['#64ea91', '#8fc9fb', '#d897eb', '#f69899', '#f8c82e', '#f797d6', '#e5e5e5', '#f4f4f4', '#d6fbb5', '#c1e0fc'];

class StudentHome extends React.Component {
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
    this.setState({ loading: true })
    this.props.getStudentTeachRecords(this.state.pagingSearch).payload.promise.then((response) => {
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
  EncodeUtf8(s1) {
    var s = escape(s1);
    var sa = s.split("%");
    var retV = "";
    if (sa[0] != "") {
      retV = sa[0];
    }
    for (var i = 1; i < sa.length; i++) {
      if (sa[i].substring(0, 1) == "u") {
        retV += this.Hex2Utf8(this.Str2Hex(sa[i].substring(1, 5)));

      }
      else retV += "%" + sa[i];
    }

    return retV;
  }
  Str2Hex(s) {
    var c = "";
    var n;
    var ss = "0123456789ABCDEF";
    var digS = "";
    for (var i = 0; i < s.length; i++) {
      c = s.charAt(i);
      n = ss.indexOf(c);
      digS += this.Dec2Dig(eval(n));

    }
    //return value;
    return digS;
  }
  Dec2Dig(n1) {
    var s = "";
    var n2 = 0;
    for (var i = 0; i < 4; i++) {
      n2 = Math.pow(2, 3 - i);
      if (n1 >= n2) {
        s += '1';
        n1 = n1 - n2;
      }
      else
        s += '0';

    }
    return s;

  }
  Dig2Dec(s) {
    var retV = 0;
    if (s.length == 4) {
      for (var i = 0; i < 4; i++) {
        retV += eval(s.charAt(i)) * Math.pow(2, 3 - i);
      }
      return retV;
    }
    return -1;
  }
  Hex2Utf8(s) {
    var retS = "";
    var tempS = "";
    var ss = "";
    if (s.length == 16) {
      tempS = "1110" + s.substring(0, 4);
      tempS += "10" + s.substring(4, 10);
      tempS += "10" + s.substring(10, 16);
      var sss = "0123456789ABCDEF";
      for (var i = 0; i < 3; i++) {
        retS += "%";
        ss = tempS.substring(i * 8, (eval(i) + 1) * 8);



        retS += sss.charAt(this.Dig2Dec(ss.substring(0, 4)));
        retS += sss.charAt(this.Dig2Dec(ss.substring(4, 8)));
      }
      return retS;
    }
    return "";
  }
  render() {
    if (this.state.loading) {
      return <div style={{ width: 100, margin: '300 auto' }}><Spin tip="数据加载中..."></Spin></div>
    }
    if (this.state.editMode == 'Main') {
      let todayList1 = [];//上课
      let todayList2 = [];//点评列表
      let nextDayList = [];//下一天数据
      let today = dateFormat(new Date(), 'yyyy-MM-dd')//当天日期
      let now = new Date();
      //console.log('now=>'+dateFormat(now,'yyyy-MM-dd'))
      this.state.data_list.map((item) => {
        var plan_begin_time = convertJSONDateToJSDateObject(item.plan_begin_time);
        var plan_end_time = convertJSONDateToJSDateObject(item.plan_end_time);
        if (item.teach_way == 2) {//在线课堂
          todayList1.push(item);
        }
      });
      var ext = encodeURIComponent('#params:email,121521977@qq.com,realname,&#x859B;&#x6C38;&#x6CE2;')
      var serviceUrl = (`http://prd5.jswebcall.com/live/chat.do?command=inviteChat&c=8341&g=14740&f=18961&ext=${ext}`);
      serviceUrl = `http://live.jswebcall.com/live/chat.do?c=8341&g=14740&f=18961&ext=${ext}`
      // alert(serviceUrl);
      // alert(encodeURI(serviceUrl))
      return <Row gutter={24}>
        <Col span={18}>
          <Row gutter={24}>
            {//显示今日在线课堂
              todayList1.map((item, index) => {
                return <Col span={12} style={{ marginBottom: 24 }}>
                  <StudentKZCard item={item} />
                </Col>
              })
            }
            {
              todayList1.length == 0 && <Col span={24}> <Alert
                message="提示"
                description="您目前还没有在线课堂授课安排！"
                type="info"
                showIcon
              /></Col>
            }
          </Row>
        </Col>
        <Col span={6}>
          <Row >
            <Col span={24}>
              <UserInfo />
            </Col>
            <Col span={24}>
              <Card bordered={false} title={`在线客服`}>
                <a href={serviceUrl} target="_blank"><img src='http://prd5.jswebcall.com/images/floaticon/online-6.png' /></a>
                <div style={{ paddingTop: 20 }}>如您遇到任何问题，可以直接联系我们在线客服</div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    }
  }
}

const mapStateToProps = (state) => {
  let user = state.auth.user;
  return { user: user };
};

function mapDispatchToProps(dispatch) {
  return {
    getStudentTeachRecords: bindActionCreators(getStudentTeachRecords, dispatch)
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(StudentHome);