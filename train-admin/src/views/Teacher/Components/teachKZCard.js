import React from 'react'
import PropTypes from 'prop-types'
import { Card, Row, Col, Progress, Button, message } from 'antd'
import { getDictionaryTitle, ellipsisText, getWeekTitle, isValidClassRoom, joinClassRoom } from '@/utils';

function TeachKZCard({ item, onClick}) {
  var { canJoinIn, btnEnable, message } = isValidClassRoom(item);
  return <Card bordered={false} title={`${item.teach_timezoneName}${item.date_group} ${getWeekTitle(item.week)} ${item.plan_begin_time_short}  ${item.periods >= 1 ? item.periods + '课时' : Math.round(item.periods * 100) + '分钟'}`}>
    <Row>
      <Col span={9} style={{ textAlign: 'center' }}>
        <div style={{ width: '100px', height: '100px', border: 'solid 1px #ccc', margin: '0 auto', padding: '10px 0px', fontSize: '50px', fontWeight: 'bolder' }}>{item.kzkjTotal}</div>
        <div style={{ width: '90%', margin: '3 auto' }}><Button size='small' onClick={onClick}>教学课件</Button></div>
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
          {btnEnable && <Button type={canJoinIn?'danger':'primary'} onClick={() => {
            joinClassRoom(item)
          }}>{message}</Button>}
          {!btnEnable && <Button disabled>进入课堂</Button>}
        </div>
      </Col>
    </Row>
  </Card>
}

TeachKZCard.propTypes = {
  item: PropTypes.object,
}

export default TeachKZCard
