import React from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3-shape'
import { Row, Col, Card, Button } from 'antd'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import Container from './Container'
 
// CardinalAreaChart
const cardinal = d3.curveCardinal.tension(0.2)
function Chart ({ data }) {
 return <Container>
    <AreaChart data={data}
      margin={{
        top: 10,
        right: 30,
        left: 0,
        bottom: 0,
      }}
    >
      <XAxis dataKey="课程" />
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Area type="monotone" dataKey="累计学生" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
      {<Area type={cardinal} dataKey="今日上课学生" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} /> }
    </AreaChart>
  </Container>
}

Chart.propTypes = {
  data: PropTypes.array,
}

export default Chart