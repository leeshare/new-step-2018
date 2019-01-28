import React from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3-shape'
import { Row, Col, Card, Button } from 'antd'
import {
  BarChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
} from 'recharts'
import Container from './Container'

// CardinalAreaChart
const cardinal = d3.curveCardinal.tension(0.2)
const colors = ['#64ea91', '#8fc9fb', '#d897eb', '#f69899', '#f8c82e', '#f797d6', '#e5e5e5', '#d6fbb5', '#c1e0fc', '#8884d8', '#82ca9d', '#8184d8', '#8284d8', '#8384d8', '#8484d8', '#8584d8', '#8684d8', '#8784d8', '#8984d8'];

function YSBarChart({ data, xData }) {
  return <Container>
    <BarChart data={data}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <XAxis dataKey="name" />
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Legend />
      {
        xData.map((item, index) => {
          let color = (index > colors.length - 1) ? colors[index - colors.length] : colors[index];
          return <Bar dataKey={item} fill={color} />
        })
      }
    </BarChart>
  </Container>
}

YSBarChart.propTypes = {
  data: PropTypes.array,
  xData: PropTypes.array,
}

export default YSBarChart