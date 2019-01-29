import React from 'react'
import PropTypes from 'prop-types'
import { Card, Row, Col, Progress, Button } from 'antd'
import { getDictionaryTitle, ellipsisText, getWeekTitle } from '@/utils';


function TeachKQCard({ item, onClick }) { 
  return <Card bordered={false} title={`${item.teach_timezoneName}${item.date_group} ${getWeekTitle(item.week)} ${item.plan_begin_time_short}  ${item.periods >= 1 ? item.periods + '课时' : Math.round(item.periods * 100) + '分钟'}`}>
    <Row>
      <Col span={9} style={{ textAlign: 'center' }}>
        <div style={{ width: '100px', height:'100px', border: 'solid 1px #ccc', margin: '0 auto',padding: '10px 0px', fontSize: '50px', fontWeight: 'bolder' }}>{item.kzkjTotal}</div>
        <div style={{ width: '90%', margin: '0 auto' }}>课件准备</div>
      </Col>
      <Col span={15}>
        <h2>
          {item.teach_name}
        </h2>
        <div style={{ margin: '10px auto', fontStyle: 'italic' }}>
          {item.position} 共{item.classStudents}人
        </div>
        <h1>{item.teach_schedule_no}</h1>
        <div style={{ textAlign: 'right' }}>
          <Button type='primary' onClick={onClick}>开始备课</Button>
        </div>
      </Col>
    </Row>
  </Card>
}

TeachKQCard.propTypes = {
  item: PropTypes.object,
}

export default TeachKQCard
