import React from 'react'
import PropTypes from 'prop-types'
import { Card, Row, Col, Progress, Button, message } from 'antd'
import { getDictionaryTitle, ellipsisText, getWeekTitle, isValidClassRoom, joinClassRoom } from '@/utils';

function StudentKZCard({ item, onClick }) {
  var { canJoinIn, btnEnable, message } = isValidClassRoom(item);
  return <Card bordered={false} 
  title={`${item.teach_timezoneName}${item.date_group} ${getWeekTitle(item.week)} ${item.plan_begin_time_short} ${item.periods >= 1 ? item.periods + '课时' : Math.round(item.periods * 100) + '分钟'}`} >
    <Row>
      <Col span={9} style={{ textAlign: 'center' }}>
        <div><img style={{ width: 100, borderRadius: '50px' }} src={item.teacher_info.icon} /></div>
        <div style={{ width: '90%', margin: '3 auto' }}>{item.teacher_info.chinese_name}</div>
      </Col>
      <Col span={15}>
        <h2>
          {item.teach_name}
        </h2>
        <div style={{ margin: '10px auto', fontStyle: 'italic' }}>
          {item.position}
        </div>
        <h1>共{item.classStudents}人</h1>
        <div style={{ textAlign: 'right' }}>
          {btnEnable && <Button type={canJoinIn ? 'danger' : 'primary'} onClick={() => {
            joinClassRoom(item)
          }}>{message}</Button>}
          {!btnEnable && <Button disabled>课堂结束</Button>}
        </div>
      </Col>
    </Row>
  </Card>
    }

StudentKZCard.propTypes = {
      item: PropTypes.object,
}

export default StudentKZCard
