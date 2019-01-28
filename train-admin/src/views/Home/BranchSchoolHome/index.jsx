import React from 'react'
import { Row, Col, Table, Alert, Icon, Progress, Timeline, Card, Spin } from 'antd';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import NumberCard from '../components/numberCard';
import UserInfo from '../components/UserInfo';
import BrowserInfo from '../components/browser';
import Sales from '../components/sales_branch';
import Chart from '../components/chart_branch';
import { getStatSumInfoForBranchAdmin } from '@/actions/admin';
import './index.less'
const bodyStyle = {
  bodyStyle: {
    height: 432,
    background: '#fff',
  },
}

const numberIcons = ['zhucexuesheng', 'zhucejiaoshi', 'dingdanshuliang', 'dingdanjine', 'shoukeanpai', 'xueshengshangke', 'jiaoshidianping', 'zizhuxuexi'];
const colors = ['#64ea91', '#8fc9fb', '#d897eb', '#f69899', '#f8c82e', '#f797d6', '#91d5bf', '#bfd591', '#d6fbb5', '#c1e0fc'];
class BranchSchoolHome extends React.Component {
  constructor() {
    super()
    this.state = {
      loading: true,
      NumbersSumInfo: [],
      JiaoCaiSumInfo: [],
      ZJQRZSSumInfo: [],
    }
  }

  componentWillMount() {
    this.props.getStatSumInfoForBranchAdmin().payload.promise.then((response) => {
      let data = response.payload.data;
      this.setState({
        ...data, loading: false
      })
    })
  }

  render() {
    // if (this.state.loading) {
    //   return <div style={{ width: 100, margin: '300 auto' }}><Spin tip="数据加载中..."></Spin></div>
    // }
    const numberCards = this.state.NumbersSumInfo.map((item, key) => {
      let cardObj = {
        icon: numberIcons[key],
        color: colors[key],
        title: item.DataTypeName,
        number: item.Total,
        news: item.Todays,
      };
      //if(item.Total<20){return ""};
      return <Col key={key} span={12}>
        <NumberCard {...cardObj} />
      </Col>
    });

    //最近7天走势数据
    let salesData = [];
    this.state.ZJQRZSSumInfo.map((item, index) => {
      salesData.push({
        '日期': item.StatDate,
        '学生注册': item.Students,
        '报名订单': item.Orders,
        '授课安排': item.TeachSchedules,
        '学生上课': item.TeachRecords,
      });
    })
    //课程学生分布
    let gradeData = [];
    this.state.JiaoCaiSumInfo.map((item, index) => {
      gradeData.push({
        '课程': item.Name,
        '累计学生': item.Value,
        '今日上课学生': item.TodayLearnStudents,
      });
    })
    return (
      <div>
        <Row gutter={24}>
          <Col span={16}>
            <Row >
              <Col span={24} >
                <Card bordered={false}
                  bodyStyle={{
                    padding: '24px 36px 24px 0',
                    height: 432,
                  }}
                >
                  <Sales data={salesData} />
                </Card>
              </Col>
              <Col span={24}>
                <Card bordered={false}
                  bodyStyle={{
                    padding: '24px 36px 24px 0',
                    height: 432,
                  }}
                >
                  <Chart data={gradeData} />
                  {/* <div style={{ textAlign: 'center' }}>课程学员分布及今日上课情况</div> */}
                </Card>
              </Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row >
              <Col span={24}>
                <UserInfo />
              </Col>
            </Row>
            <Row gutter={24} style={{ margin: '24 0'}} className="schoolCard branchSchool">
              {numberCards}
            </Row>
          </Col>
        </Row>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return state;
};

function mapDispatchToProps(dispatch) {
  return {
    getStatSumInfoForBranchAdmin: bindActionCreators(getStatSumInfoForBranchAdmin, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(BranchSchoolHome);