import React from 'react'
import PropTypes from 'prop-types'
import { Card, Row, Col, Progress, Button } from 'antd'
import { getDictionaryTitle, ellipsisText, getWeekTitle } from '@/utils';

function TeachViewParentEval({ item }) {

  return <Card bordered={false}>
    <Row>
      <Col span={24} style={{ textAlign: 'center' }}>
        <img src={item.student_info.icon} style={{ width: 50 }} />
        <div>{item.student_info.chinese_name}</div>
      </Col>
      <Col span={24}>
        <h2>
          {item.parent_evaluate_content}
        </h2>
      </Col> }
    </Row>
  </Card>
}

TeachViewParentEval.propTypes = {
  item: PropTypes.object,
}

export default TeachViewParentEval
