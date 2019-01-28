import React from 'react'
import { Card } from 'antd';
import { Layout, Menu, Icon, Row, Col, Dropdown, Button } from 'antd'
/*
按钮组
可以将多个按钮放在一起，支持水平（默认)和下拉来展示
属性
dropdown:下拉显示
divider:显示分割线
style:自定义控制按钮直接的样式定义
<ButtonGroup dropdown>
  <a onClick={() => { this.onLookView('Edit', record) }}>{YSI18n.get('Edit')}</a>
  <a onClick={() => { this.onLookView('Delete', record) }}>{YSI18n.get('Delete')}</a>
</ButtonGroup>
*/
export default class ButtonGroup extends React.Component {
  constructor() {
    super()
  }


  render() {
    if (!this.props.children.length) {
      return this.props.children;
    }
    let block_content = <div></div>
    //过滤掉按钮条件为false的情况
    let childs = this.props.children.filter(a => a != false);

    {/* 下拉按钮 */ }
    let blocks = [];
    if (childs.length > 1 && this.props.dropdown) {
      childs.map((item, index) => {
        blocks.push(<Menu.Item>{item}</Menu.Item>);
        if (index + 1 < childs.length) {
          blocks.push(<span className="ant-divider-vertical" />);
        }
      })
      let menus = <Menu>{blocks}</Menu>
      block_content = < Dropdown overlay={menus} >
        <Button>
          {this.props.title || '操作'} <Icon type="down" />
        </Button>
      </Dropdown >
    }
    else if (childs.length > 1) {//水平布局
      childs.map((item, index) => {
        blocks.push(item);
        if (index + 1 < childs.length) {
          blocks.push(<span className={this.props.divider ? 'ant-divider' : 'ant-divider-hide'} style={{ ...(this.props.style || {}) }} />);
        }
      })
      block_content = blocks;
    }
    else {
      block_content = this.props.children
    }
    return <div>{block_content}</div>
  }
}
