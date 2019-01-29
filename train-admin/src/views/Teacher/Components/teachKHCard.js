import React from 'react'
import PropTypes from 'prop-types'
import { Card, Row, Col, Progress,Button } from 'antd'
import { getDictionaryTitle, ellipsisText, getWeekTitle } from '@/utils';

function TeachKHCard({ item,onClick}) {
  let progress = 0;
  if (item.classStudents > 0) {
    progress = Math.round(item.commentStudents / item.classStudents * 100.00);
  }
  return <Card bordered={false} title={`${item.date_group} ${getWeekTitle(item.week)} ${item.plan_begin_time_short}  ${item.periods >= 1 ? item.periods + '课时' : Math.round(item.periods * 100) + '分钟'}`}>
    <Row>
      <Col span={9} style={{ textAlign: 'center' }}>
        <Progress width={100} type="circle" percent={progress} />
        <div>点评进度</div>
      </Col>
      <Col span={15}>
         <h2>
          {item.teach_name}
        </h2>
        <div style={{ margin: '10px auto', fontStyle: 'italic' }}>
          {item.position} 共{item.classStudents}人
        </div>
        <h1>{item.teach_schedule_no}</h1>
        <div style={{ textAlign:'right' }}>
          <Button type='primary' onClick={onClick}>立即点评</Button>
        </div>
      </Col>
    </Row>
  </Card>
}

TeachKHCard.propTypes = {
  item: PropTypes.object,
}

export default TeachKHCard
