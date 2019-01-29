import React from 'react'
import PropTypes from 'prop-types'
import { Card, Row, Col, Progress, Button } from 'antd'
import { getDictionaryTitle, ellipsisText, getWeekTitle } from '@/utils';

import ModalPlayer from '@/components/ModalPlayer';
import ResourceCard from '@/components/ResourceCard';

function TeachViewStudentKHDP({ item, onPlayMedia }) {

  return <Row >
      <Col span={2} style={{textAlign:'center'}}>
        <img src={item.student_info.icon} className='userIcon' />
        <div>{item.student_info.chinese_name}</div>
      </Col>
      <Col span={22}> 
        {item.order_no_khdp > 0 ?
          <Row gutter={16}>
            { item.teacher_evaluate_content != '' ? <Col span={24} style={{padding:'20 10'}}>{item.teacher_evaluate_content}</Col> : '' }         
            {
              item.attachments_khdp.map((attachment, index) => {
                return (
                  <Col span={6}>
                    <ResourceCard lecture_info={attachment.lecture_info} onPlayMedia={onPlayMedia} />
                  </Col>
                );
              })
            }         
          </Row> : '未点评'}
      </Col>
    </Row>
}

TeachViewStudentKHDP.propTypes = {
  item: PropTypes.object,
}

export default TeachViewStudentKHDP
