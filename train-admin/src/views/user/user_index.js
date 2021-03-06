//用户列表 2019-02-12

import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button,
  Icon, Table, Pagination, Card, Upload, Modal, Divider, Popover
} from 'antd';
const FormItem = Form.Item;
import copy from 'copy-to-clipboard';
import { DefaultPlayer as Video } from 'react-html5video';
const Search = Input.Search;

import ButtonGroup from '@/components/ButtonGroup';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24,
  loadBizDictionary, onSearch, onSearchToggle,
  onPageIndexChange, onShowSizeChange
} from '@/utils/componentExt';
//工具类方法引入
import { YSI18n, getDictionaryTitle, timestampToTime,
  ellipsisText, dataBind
} from '@/utils';
import { serverURL, getToken } from '../../api/env';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//业务接口方法引入
import {
  fileCollectListQuery, fileCollectSave
} from '@/actions/file';
import {
  train_user_list, train_user_save, train_user_del
} from '@/actions/user';

import UserView from './user_view.js';

class UserManage extends React.Component {
  constructor(props) {
    super(props);

    //组件状态初始化过程
    this.state = {
      expand: false,
      currentDataModel: null,
      editMode: '',
      data_list: [],
      data_list_total: 0,
      loading: false,

      pagingSearch: {
        page: 1, size: 20, keyword: '', status: '-1', roleType: '0'
      },
      dic_Status: [],
      dic_role: [],
    };

    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
  }

  componentWillMount() {
    //载入需要的字典项
    this.loadBizDictionary(['dic_Status', 'dic_role']);
    this.onSearch();
  }

  //table 输出列定义
  columns = [
    {
      title: YSI18n.get('姓名'),
      dataIndex: 'realName',
    },
    {
      title: '账号',
      dataIndex: 'userName'
    },
    {
      title: '角色类型',
      dataIndex: 'roleType',
      render: (text, record) => {
        //return text == 1 ? <span>启用</span> : <span>停用</span>
        return getDictionaryTitle(this.state.dic_role, record.roleType);
      }
    },
    {
      title: YSI18n.get('创建时间'),
      width: 200,
      dataIndex: 'createdDate',
      render: (text) => {
        return <span>{timestampToTime(text)}</span>
      }
    },
    {
      title: '状态',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.dic_Status, record.status);
      }
    },
    {
      title: YSI18n.get('操作'),
      width: 100,
      render: (text, record) => {
        return <span>
          <a onClick={() => { this.onLookView('Edit', record) }}>编辑</a> |
          <a onClick={() => { this.onLookView('Delete', record) }}>删除</a>
        </span>
      }
    },
  ];

  fetch = (pagingSearch) => {
    this.setState({ loading: true })
    this.props.train_user_list(pagingSearch).payload.promise.then((response) => {
      let data = response.payload.data || {};
      if(data.result){
        data.list.map(a => {
          a.key = a.id;
        })
        this.setState({
          loading: false,
          data_list: data.list,
          data_list_total: data.total,
          data_has_next: data.hasNextPage,
        });
      }else {
        message.error(data.message);
        this.setState({ loading: false });
      }
    }).catch(error => {
      message.error(error.message);
      this.setState({ loading: false });
    })
  }

  handleOk = (e) => {
    this.setState({
      show_modal: false,
    });
  }
  handleCancel = (e) => {
    this.setState({
      show_modal: false,
    });
  }

  //搜索条件
  getFields() {
      const count = this.state.expand ? 10 : 6;
      const { getFieldDecorator } = this.props.form;
      const formItemLayout = {
          labelCol: { span: 10 },
          wrapperCol: { span: 14 },
      };
      const children = [];
      children.push(
          <Col span={8}>
              <FormItem {...formItemLayout} label={'用户名'} >
                  {getFieldDecorator('keyword', { initialValue: this.state.pagingSearch.keyword })(
                      <Input placeholder={'用户名模糊搜索'} />
                  )}
              </FormItem>
          </Col>
      );
      children.push(
          <Col span={8}>
              <FormItem
                  {...formItemLayout}
                  label="角色"
              >
                  {getFieldDecorator('roleType', { initialValue: this.state.pagingSearch.roleType })(
                      <Select>
                          <Option value="0">全部</Option>
                          {this.state.dic_role.map((item) => {
                              return <Option value={item.value}>{item.title}</Option>
                          })}
                      </Select>
                  )}
              </FormItem>
          </Col>
      );
      children.push(
          <Col span={8}>
              <FormItem
                  {...formItemLayout}
                  label="状态"
              >
                  {getFieldDecorator('status', { initialValue: this.state.pagingSearch.status })(
                      <Select>
                          <Option value="-1">全部</Option>
                          {this.state.dic_Status.map((item) => {
                              return <Option value={item.value}>{item.title}</Option>
                          })}
                      </Select>
                  )}
              </FormItem>
          </Col>
      );
      let filedCount = this.state.expand ? children.length : 3;
      return children.slice(0, filedCount);
  }
  toggle = () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  onViewCallback = (dataModel, isDelete) => {
    if(!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    }else {
      if(isDelete){
        this.props.train_user_del(dataModel.id).payload.promise.then((response) => {
          let data = response.payload.data || {};
          if (data.result === true) {
            this.onSearch();
            //进入管理页
            this.onLookView("Manage", null);
          }
          else {
            message.error(data.message);
          }
        })
      }else {
        this.props.train_user_save(dataModel).payload.promise.then((response) => {
          let data = response.payload.data || {};
          if (data.result === true) {
            this.onSearch();
            //进入管理页
            this.onLookView("Manage", null);
          }
          else {
            message.error(data.message);
          }
        })
      }
    }
  }


  //处理分页事件
  onPageIndexChange = (page, pageSize) => {
      let pagingSearch = this.state.pagingSearch;
      pagingSearch.page = page;
      this.setState({ pagingSearch });
      setTimeout(() => {
          //重新查找
          this.onSearch();
      }, 100);
  };
  //处理调整页面大小
  onShowSizeChange = (current, size) => {
      let pagingSearch = this.state.pagingSearch;
      pagingSearch.size = size;
      pagingSearch.page = 1;//重置到第一页
      this.setState({ pagingSearch });
      setTimeout(() => {
          //重新查找
          this.onSearch();
      }, 100);
  };
  //浏览视图
  onLookView = (op, item) => {
      this.setState({
          editMode: op,//编辑模式
          currentDataModel: item,//编辑对象
      });
  };

  //渲染，根据模式不同控制不同输出
  render() {
    var that = this;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Create':
      case 'Edit':
      case 'View':
      case 'Delete':
        block_content = <UserView viewCallback={this.onViewCallback} {...this.state} />
        break;
      case 'Manage':
      default:
        block_content = (
          <div>
            <Form className="search-form">
              <Row gutter={40}>
                {this.getFields()}
              </Row>
              <Row>
                <Col span={24} style={{ textAlign: 'right' }}>
                  <Button type="primary" icon="search" onClick={this.onSearch}>查询</Button>
                  <Button style={{ marginLeft: 8 }} onClick={() => this.onLookView('Create') } icon="plus">新增用户</Button>
                  <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                    更多 <Icon type={this.state.expand ? 'up' : 'down'} />
                  </a>
                </Col>
              </Row>
            </Form>
            <div className="search-result-list">
              <Table
                  loading={this.state.loading}
                  pagination={false}
                  columns={this.columns} //列定义
                  dataSource={this.state.data_list}//数据
              />
              <div className="search-paging">
                  <Row>
                      <Col span={8}>
                      </Col>
                      <Col span={16} className={'search-paging-control'}>
                          <Pagination showSizeChanger
                              current={this.state.pagingSearch.page}
                              defaultPageSize={this.state.pagingSearch.size}
                              onShowSizeChange={this.onShowSizeChange}
                              onChange={this.onPageIndexChange}
                              showTotal={(total) => { return `共${total}条数据`; }}
                              total={this.state.data_list_total} />
                      </Col>
                  </Row>
              </div>
              </div>
          </div>
        )

    }

    let token = getToken();
    return block_content;
  }
}
//表单组件 封装
const WrappedUserManage = Form.create()(UserManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    fileCollectListQuery: bindActionCreators(fileCollectListQuery, dispatch),
    fileCollectSave: bindActionCreators(fileCollectSave, dispatch),

    train_user_list: bindActionCreators(train_user_list, dispatch),
    train_user_save: bindActionCreators(train_user_save, dispatch),
    train_user_del: bindActionCreators(train_user_del, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedUserManage);
