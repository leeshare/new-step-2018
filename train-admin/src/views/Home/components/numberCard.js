import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Card, Badge } from 'antd'
import styles from './numberCard.less'

function NumberCard({ icon, color, title, number, news }) {
  return (
    <Card className={'numberCard'} bordered={false} bodyStyle={{ padding: 0 }}>
      <Icon className={'iconWarp iconfont'} style={{ color }} type={icon} />{news>0?<Badge className="bandge" count={news}><a href="#"></a></Badge>:''}
      <div className={'content'}>
        <p className={'title'}>{title || 'No Title'}
        </p>
        <p className={'number'}>{number}</p> </div>
    </Card>
  )
}

NumberCard.propTypes = {
  icon: PropTypes.string,
  color: PropTypes.string,
  title: PropTypes.string,
  number: PropTypes.number,
  news: PropTypes.number,
 
}

export default NumberCard
