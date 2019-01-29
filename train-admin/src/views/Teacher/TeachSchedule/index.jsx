import React from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal, Calendar, Timeline } from 'antd';

import { getAllTeacherSchedules } from '@/actions/teach';
import './index.less'

class TeachSchedule extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentDate: '',
      currentDataList: [],
      calendarMode: 'month',
      showModal: false,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: { PageIndex: 1, PageSize: 999 },
      data_list: [],
      data_list_total: 0,
      loading: false
    };
  }

  componentWillMount() {
    //首次进入搜索，加载服务端字典项内容
    this.props.getAllTeacherSchedules(this.state.pagingSearch).payload.promise.then((response) => {
      let data = response.payload.data;
      this.setState({ ...data, loading: false })
    })
  }
  getListData = (value) => {
    let currentDate = value.format('YYYY-MM-DD');
    let find = this.state.data_list.filter(A => A.Date == currentDate);
    return find;
  }
  dateCellRender = (value) => {
    const listData = this.getListData(value);
    return (
      <ul className="events">
        {
          listData.map((item, index) => (
            <li key={index}>
              <span className={`event-normal`}>●</span>
              {item.BeginTime} {item.TeachName}
            </li>
          ))
        }
      </ul>
    );
  }

  getMonthData = (value) => {
    let currentDate = value.format('YYYY-MM');
    let find = this.state.data_list.filter(A => A.Date.indexOf(currentDate) == 0);
    return find;
  }

  monthCellRender = (value) => {
    const num = this.getMonthData(value).length;
    return num ? <div className="notes-month">
      <section>{num}</section>
      <span>上课安排</span>
    </div> : null;
  }
  onSelect = (value) => {
    if (this.state.calendarMode == 'year') {
      let currentDataList = this.getMonthData(value);
      if (currentDataList.length > 0) {
        this.setState({ showModal: true, currentDataList: currentDataList, currentDate: value.format('YYYY-MM') });
      }
    }
    else if (this.state.calendarMode == 'month') {
      let currentDataList = this.getListData(value);
      console.log(currentDataList)
      if (currentDataList.length > 0) {
        this.setState({ showModal: true, currentDataList: currentDataList, currentDate: value.format('YYYY-MM-DD') });
      }
    }
  }
  onPanelChange = (value, mode) => {
    this.setState({ calendarMode: mode });
    console.log({ value, mode });
  }
  hideModal = () => {
    this.setState({ showModal: false });
  }
  render() {
    let modalKey = "";
    if (this.state.showModal) {
      modalKey = this.state.currentDate;
    }
    switch (this.state.editMode) {
      case 'View':
        return <div></div>
        break;
      default:
        return (
          <div>
            <Calendar onPanelChange={this.onPanelChange} onSelect={this.onSelect} style={{ backgroundColor: '#fff' }} dateCellRender={this.dateCellRender} monthCellRender={this.monthCellRender} />
            <Modal key={modalKey}
              title={`${modalKey} 上课安排`}
              visible={this.state.showModal}
              onCancel={this.hideModal}
              footer={null}
            >
              <div style={{ height: 400, overflowY: 'scroll' }}>
                <Timeline>
                  {this.state.currentDataList.map((item, index) => {
                    return <Timeline.Item>{item.Date} {item.BeginTime}~{item.EndTime} {item.TeachName} {item.Position}</Timeline.Item>
                  })}
                </Timeline>
              </div>
            </Modal>
          </div>
        );
    }
  }
}
const mapStateToProps = (state) => {
  return state;
};

function mapDispatchToProps(dispatch) {
  return {
    getAllTeacherSchedules: bindActionCreators(getAllTeacherSchedules, dispatch)
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(TeachSchedule);