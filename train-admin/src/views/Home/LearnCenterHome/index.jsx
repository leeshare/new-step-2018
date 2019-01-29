import React from 'react'
import { Row, Col, Table, Alert, Icon, Progress, Timeline, Card } from 'antd';

import PanelBox from '../../../components/PanelBox';
import Schedule from '../../../components/Schedule';
import './index.less'


export default class LearnCenterHome extends React.Component {
  constructor() {
    super()
  }

  componentWillMount() {
  }

  callback() {

  }

  render() {

    return (
      <div>
        <div style={{'marginBottom': '20px'}}>
          <Alert
            message="学习中心管理员"
            description="此处显示学习中心常见的数据！"
            type="info"
            showIcon
            closable={true}
          />
        </div>
      </div>
    )
  }
}
