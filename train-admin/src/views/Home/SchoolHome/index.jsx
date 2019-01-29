import React from 'react'
import { Row, Col, Table, Alert, Icon, Progress, Timeline, Card, Spin } from 'antd';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import NumberCard from '../components/numberCard';
import UserInfo from '../components/UserInfo';
import BrowserInfo from '../components/browser';
import Sales from '../components/sales';
import Chart from '../components/chart';
import { getStatSumInfoForSchoolearnAdmin } from '@/actions/admin';
import './index.less'
const bodyStyle = {
  bodyStyle: {
    height: 432,
    background: '#fff',
  },
}

const numberIcons = ['zhucexuesheng', 'kechengsheji', 'ziku', 'cijuku', 'duihuaku', 'genchang', ];
const colors = ['#64ea91', '#8fc9fb', '#d897eb', '#f69899', '#f8c82e', '#f797d6', '#e5e5e5', '#f4f4f4', '#d6fbb5', '#c1e0fc'];
class SchoolHome extends React.Component {
  constructor() {
    super()
    this.state = {
      loading: true,
      NumbersSumInfo: [],
      JiaoCaiSumInfo: [],
      ZJQRZSSumInfo: [],
      JRNJLearnSumInfo: []
    }
  }

  componentWillMount() {
    /*this.props.getStatSumInfoForSchoolearnAdmin().payload.promise.then((response) => {
      let data = response.payload.data;
      this.setState({
        ...data, loading: false
      })
    })*/
  }

  render() {
    if (this.state.loading) {
      return <div style={{ width: 100, margin: '300 auto' }}><Spin tip="数据加载中..."></Spin></div>
    }
    const numberCards = this.state.NumbersSumInfo.map((item, key) => {
      let cardObj = {
        icon: numberIcons[key],
        color: colors[key],
        title: item.DataTypeName,
        number: item.Total,
        news: item.Todays,
      };
      //if(item.Total<20){return ""};
      return <Col key={key} lg={4} md={6} className="schoolCard">
        <NumberCard {...cardObj}  />
      </Col>
    });

    //最近7天走势数据
    let salesData = [];
    this.state.ZJQRZSSumInfo.map((item, index) => {
      salesData.push({
        '日期': item.StatDate,
        '学生注册': item.Students,
        '课程下载': item.Downloads,
        '课程学习': item.Learns,
      });
    })
    //今日各年级数据
    let gradeData = [];
    this.state.JRNJLearnSumInfo.map((item, index) => {
      gradeData.push({
        '年级': item.Title,
        '课程下载': item.Downloads,
        '课程学习': item.Learns,
      });
    })
    return (
      <div>
        <Row gutter={24} style={{marginBottom:24}}>
          {numberCards}
        </Row>
        <Row gutter={24}>
          <Col lg={18} md={24}>
            <Row >
              <Col lg={24} md={24}>
                <Card bordered={false}
                  bodyStyle={{
                    padding: '24px 36px 24px 0',
                    height: 432,
                  }}
                >
                  <Sales data={salesData} />
                </Card>
              </Col>
              <Col lg={24} md={24}>
                <Card bordered={false}
                  bodyStyle={{
                    padding: '24px 36px 24px 0',
                    height: 432,
                  }}

                >
                  <Chart data={gradeData} />
                  <div style={{ textAlign: 'center' }}>今日课程学习情况</div>
                </Card>
              </Col>
            </Row>
          </Col>
          <Col lg={6} md={24}>
            <Row >
              <Col lg={24} md={12}>
                <UserInfo />
              </Col>
              <Col lg={24} md={12}>
                <Card title={'同步教材'} bordered={false} bodyStyle={{ paddingTop: 0, paddingLeft: 18 }}>
                  <BrowserInfo colors={colors} data={this.state.JiaoCaiSumInfo} />
                </Card>
              </Col>
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
    getStatSumInfoForSchoolearnAdmin: bindActionCreators(getStatSumInfoForSchoolearnAdmin, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(SchoolHome);
