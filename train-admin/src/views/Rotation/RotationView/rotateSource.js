//选择轮播

import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Layout,
  Icon, Table, Pagination, Card, Upload, Modal, Divider, Popover
} from 'antd';
const Search = Input.Search;
const {
  Content, Sider } = Layout;

//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onSearchToggle, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';
//工具类方法引入
import { YSI18n, getDictionaryTitle, timestampToTime } from '@/utils';
//业务接口方法引入
import { zixun_zixunList } from '@/actions/zixun';

import './index.less';




class rotateSource extends React.Component {
  constructor(props) {
    super(props);

    //组件状态初始化过程
    this.state = {
      currentDataModel: null,
      loading: false,
      activeItem: 1,
      keywords: ''
    };

  }

  componentWillMount() {

  }

  searchZixun(value) {
    if (value == '') {
      return;
    }
    let pagingSearch = { pageIndex: 1, pageSize: 20, Title: value, InfoType: this.state.activeItem, channelIds: null, PublishBeginDate: null, PublishEndDate: null }
    this.setState({ loading: true })
    this.props.zixun_zixunList(pagingSearch).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ pagingSearch, ...data, loading: false })
      }
    })
  }

  //table 输出列定义
  columns = [
    {
      title: YSI18n.get('标题'),
      dataIndex: 'title',
      render: (text, record) => {
        return <span>{record.title}</span>
      },
    },
    {
      title: YSI18n.get('时间'),
      width: 180,
      dataIndex: 'time',
      render: (text, record) => {
        return <span>{record.publishDate}</span>
      },
    },

  ];
  onItemclick(i) {
    this.setState({ activeItem: i })
  }

  //渲染，根据模式不同控制不同输出
  render() {
    var that = this;
    let block_content = <div></div>

    var rowSelection = {
      type:'radio',
      selectedRowKeys: this.state.UserSelecteds,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ UserSelecteds: selectedRowKeys })
      },

    }
    block_content = (
      <div className='rotate-source-wrap'>
        <Layout>
          <Sider
            theme='light'
            breakpoint="lg"
            width={150}
            collapsedWidth="0"
            onBreakpoint={(broken) => { console.log(broken); }}
            onCollapse={(collapsed, type) => { console.log(collapsed, type); }}
          >
            <div className='dv_menu_wrap'>
              <a onClick={() => { this.onItemclick(1) }} className='item_link' style={{ background: this.state.activeItem == 1 ? '#f2f2f2' : 'transparent' }}>资讯文章</a>
              <a onClick={() => { this.onItemclick(2) }} className='item_link' style={{ background: this.state.activeItem == 2 ? '#f2f2f2' : 'transparent' }}>资讯视频</a>
              <a onClick={() => { this.onItemclick(3) }} className='item_link' style={{ background: this.state.activeItem == 3 ? '#f2f2f2' : 'transparent' }}>资讯音频</a>
            </div>
          </Sider>
          <Layout>
            <Content>
              <div className='dv_search_input_form'>
                <Row type="flex" justify='end'>
                  <Col span={24}>
                    <div className='search_input_wrap'>
                      <Search
                        placeholder="搜索文件"
                        onSearch={value => this.searchZixun(value)}
                        style={{ width: 236 }}
                        onChange={e => this.setState({ keywords: e.target.value })}
                      />
                      <Button type="primary" onClick={() => this.searchZixun(this.state.keywords)} className='button_newfolder'>搜索</Button>
                    </div>
                  </Col>
                </Row>
              </div>
              <div className='dv_search_result'>
                <Table
                  loading={this.state.loading}
                  pagination={false}
                  columns={this.columns} //列定义
                  rowKey={'id'}
                  dataSource={this.state.data_list}//数据
                  rowSelection={rowSelection}
                  onRow={(record) => {
                    return {
                      onClick: () => { this.setState({UserSelecteds:record.id}); this.props.callback(record) },       // 点击行
                    };
                  }}
                />
              </div>
            </Content>
          </Layout>
        </Layout>
      </div>
    );
    return block_content;
  }
}
//表单组件 封装
const WrappedShareManage = Form.create()(rotateSource);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    zixun_zixunList: bindActionCreators(zixun_zixunList, dispatch)
  };
}
//redux 组件 封装
export default connect(null, mapDispatchToProps)(WrappedShareManage);
