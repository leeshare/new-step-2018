import React from 'react'
import { Table, Form, Row, Col, Pagination, Select, Button, Input, Modal, Icon, message } from 'antd';

import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import './index.less';
import { getCourseList, auditCourseInfo } from '@/actions/tm';
import { getDictionaryTitle, getDictionaryTitleByCode } from '@/utils';
import CourseView from '../View/lectures';

const FormItem = Form.Item;
const confirm = Modal.confirm;

class LectureCourseAudit extends React.Component {
  state = {
    pagination: {},
    loading: false,

    pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', ApplicableScopes: '-1', Status: "-1", AuditStatus: "1", SupportUnitType: '8', IsLecture: true },
    dic_courseApplicableScopes: [],
    dic_courseStatus: [],
    dic_courseWareTypes: [],
    dic_courseAuditStatus: [],
    data_list: [],
    data_list_total: 0,
    expand: false,
  };
  columns = [];
  loadColumns() {
    var u_list = [];
    this.state.dic_courseApplicableScopes.map((item) => {
      u_list.push({ text: item.title, value: item.value })
    })
    this.columns = [
      {
        title: '教学任务名称',
        render: (text, record, index) => {
          return <a onClick={() => { this.onLookView('View', record) }}>{record.CourseName}</a>
        }
      },
      {
        title: '关键字',
        dataIndex: 'Keywords',
      },
      {
        title: '适用对象',
        render: (text, record, index) => {
          return getDictionaryTitle(this.state.dic_courseApplicableScopes, record.ApplicableScopes);
        }
      },
      {
        title: '单元数',
        dataIndex: 'Units',
      },
      {
        title: '设计者',
        render: (text, record, index) => {
                return `${record.CreatedUserInfo.username}`
        }
      },
      {
        title: '状态',
        render: (text, record, index) => {
          return getDictionaryTitle(this.state.dic_courseStatus, record.Status);
        }
      },
      {
        title: '审核状态',
        render: (text, record, index) => {
          return getDictionaryTitle(this.state.dic_courseAuditStatus, record.AuditStatus);
        }
      }, {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <span>
            <a onClick={() => { this.auditCourse(record) }}>
              {record.AuditStatus == 0 ? "待审核" : record.AuditStatus == 3 ? "审核不通过" : "审核通过"}</a>
          </span>
        ),
      }]
  };
  auditCourse(item) {
    var that = this;
    var status_name = item.AuditStatus == 3 ? "审核不通过" : "审核通过";
    confirm({
      title: '审核教学任务',
      content: `确认要${status_name}吗？`,
      onOk() {
        var audit = item.AuditStatus == 3 ? false : true;
        that.props.auditCourseInfo(item.CourseID, audit).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message,5);
          }
          else {
            that.onSearch();
          }
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }
  handleTableChange = (pagination, filters, sorter) => {
    const pager = this.state.pagination;
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    this.onSearch(null, {
      PageSize: pagination.pageSize,
      PageIndex: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    })
  }
  //搜索条件
  getFields() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const children = [];
    children.push(
      <Col span={8}>
        <FormItem {...formItemLayout} label={'教学任务名称'} >
          {getFieldDecorator('Keyword', { initialValue: this.state.pagingSearch.Keyword })(
            <Input placeholder="教学任务名称或关键字" />
          )}
        </FormItem>
      </Col>
    );
    children.push(
      <Col span={8}>
        <FormItem
          {...formItemLayout}
          label="适用对象"
        >
          {getFieldDecorator('ApplicableScopes', { initialValue: this.state.pagingSearch.ApplicableScopes })(
            <Select>
              <Option value="-1">全部</Option>
              {this.state.dic_courseApplicableScopes.map((item) => {
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
          label="审核状态"
        >
          {getFieldDecorator('AuditStatus', { initialValue: this.state.pagingSearch.AuditStatus })(
            <Select>
              {this.state.dic_courseAuditStatus.filter(A => A.value > 0).map((item) => {
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
          label="教学任务状态"
        >
          {getFieldDecorator('Status', { initialValue: this.state.pagingSearch.Status })(
            <Select>
              <Option value="-1">全部</Option>
              {this.state.dic_courseStatus.map((item) => {
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
  //处理搜索事件
  onSearch = (e, params = {}) => {
    if (e) {
      e.preventDefault();
      this.state.pagingSearch.PageIndex = 1;//重新查询时重置到第一页
    }
    this.setState({ loading: true })
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
      let pagingSearch = { ...this.state.pagingSearch, ...values, ...params };
      this.props.getCourseList(pagingSearch).payload.promise.then((response) => {
        let data = response.payload.data;
        this.setState({ pagingSearch, ...data, loading: false })
      })
    });
  }
  //处理分页事件
  onPageIndexChange = (page, pageSize) => {
    let pagingSearch = this.state.pagingSearch;
    pagingSearch.PageIndex = page;
    this.setState({ pagingSearch });
    setTimeout(() => {
      //重新查找
      this.onSearch();
    }, 100);
  };
  //处理调整页面大小
  onShowSizeChange = (current, size) => {
    let pagingSearch = this.state.pagingSearch;
    pagingSearch.PageSize = size;
    pagingSearch.PageIndex = 1;//重置到第一页
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
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
  }
  componentWillMount() {
    this.onSearch();
  }
  render() {
    if (this.state.editMode == "View") {
      return (
        <CourseView viewCallback={this.onViewCallback} {...this.state} />
      )
    }
    this.loadColumns();
    return (
      <div>
        <Form className="search-form">
          <Row gutter={40}>
            {this.getFields()}
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button type="primary" icon="search" onClick={this.onSearch}>查询</Button>
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
            //pagination={this.state.pagination}
            columns={this.columns}
            dataSource={this.state.data_list}
            rowKey={record => record.registered}
            onChange={this.handleTableChange}
          />
          <div className="search-paging">
            <Row>
              <Col span={14}>
              </Col>
              <Col span={10} className={'search-paging-control'}>
                <Pagination showSizeChanger
                  current={this.state.pagingSearch.PageIndex}
                  defaultPageSize={this.state.pagingSearch.PageSize}
                  onShowSizeChange={this.onShowSizeChange}
                  onChange={this.onPageIndexChange}
                  showTotal={(total) => { return `共${total}条数据`; }}
                  total={this.state.data_list_total} />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }

}

const WrappedCourseManage = Form.create()(LectureCourseAudit);

const mapStateToProps = (state) => {
  return state;
};

function mapDispatchToProps(dispatch) {
  return {
    getCourseList: bindActionCreators(getCourseList, dispatch),
    auditCourseInfo: bindActionCreators(auditCourseInfo, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
