import React from 'react'
import { Row, Col, Table, Alert, Icon, Progress, Timeline, Card } from 'antd';

import PanelBox from '../../../components/PanelBox';
import Schedule from '../../../components/Schedule';
import './index.less'


export default class UserHome extends React.Component {
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
        <Row gutter={16} type="flex" justify="space-between">
          <Col xs={24} md={14}>
            <PanelBox title="常用功能" bodyStyle={{ 'padding': '20px' }}>
               
            </PanelBox>
          </Col> 
        </Row>
      </div>
    )
  }
}
