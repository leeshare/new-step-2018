import React from 'react'
import PropTypes from 'prop-types'
import { Table, Tag } from 'antd'
import './browser.less'
 

function Browser ({ data,colors }) {
  const columns = [
    {
      title: 'name',
      dataIndex: 'Name',
      className: 'name',
    }, {
      title: 'percent',
      dataIndex: 'Value',
      className: 'percent',
      render: (text, it) => <Tag color={colors[it]}>{text}</Tag>,
    },
  ]
  return <div className="browser"><Table pagination={false} showHeader={false} columns={columns} rowKey={(record, key) => key} dataSource={data} /></div>
}

Browser.propTypes = {
  data: PropTypes.array,
}

export default Browser
