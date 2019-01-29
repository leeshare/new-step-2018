import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './sales.less'

const color = {
  green: '#64ea91',
  blue: '#8fc9fb',
  purple: '#d897eb',
  red: '#f69899',
  yellow: '#f8c82e',
  peach: '#f797d6',
  borderBase: '#e5e5e5',
  borderSplit: '#f4f4f4',
  grass: '#d6fbb5',
  sky: '#c1e0fc',
}
function Sales ({ data }) {
  return (
    <div className={'sales'}>
      {/* <div className={'title'}>最近七天数据</div> */}
      <ResponsiveContainer minHeight={360}>
        <LineChart data={data}>
          <Legend verticalAlign="top"
            content={(prop) => {
              const { payload } = prop
              return (<ul className={classnames({ ['legend']: true, clearfix: true })}>
                {payload.map((item, key) => <li key={key}><span className={'radiusdot'} style={{ background: item.color }} />{item.value}</li>)}
              </ul>)
            }}
          />
          <XAxis dataKey="日期" axisLine={{ stroke: color.borderBase, strokeWidth: 1 }} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <CartesianGrid vertical={false} stroke={color.borderBase} strokeDasharray="3 3" />
          <Tooltip
            wrapperStyle={{ border: 'none', boxShadow: '4px 4px 40px rgba(0, 0, 0, 0.05)' }}
            content={(content) => {
              const list = content.payload.map((item, key) => <li key={key} className={'tipitem'}><span className={'radiusdot'} style={{ background: item.color }} />{`${item.name}:${item.value}`}</li>)
              return <div className={'tooltip'}><p className={'tiptitle'}>{content.label}</p><ul>{list}</ul></div>
            }}
          />
          <Line type="monotone" dataKey="学生注册" stroke={color.purple} strokeWidth={3} dot={{ fill: color.purple }} activeDot={{ r: 5, strokeWidth: 0 }} />
          <Line type="monotone" dataKey="课程下载" stroke={color.red} strokeWidth={3} dot={{ fill: color.red }} activeDot={{ r: 5, strokeWidth: 0 }} />
          <Line type="monotone" dataKey="课程学习" stroke={color.green} strokeWidth={3} dot={{ fill: color.green }} activeDot={{ r: 5, strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

Sales.propTypes = {
  data: PropTypes.array,
}

export default Sales
