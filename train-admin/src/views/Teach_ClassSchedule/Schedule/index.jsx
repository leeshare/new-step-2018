import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, DatePicker, Spin, Radio } from 'antd';
import { getTeacherClassSchedules } from '@/actions/teach';
import { getDictionaryTitle, dateFormat, dataBind } from '@/utils';

import moment from 'moment';
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
class TeachClassSchedule extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dateType: '1',//1当日(显示时刻范围)，2:几日内(显示日期范围)
            beginDate: dateFormat(new Date(), 'yyyy-MM-dd'),
            endDate: dateFormat(new Date(), 'yyyy-MM-dd'),
            x_items: [],
            y_items: [],
            data_list: [],
            loading: false,
        };
    }

    getOtion() {
        //var hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
        //var days = ['1号教室（黄山）', '2号教室（泰山）', '3号教室（峨眉山）', '4号教室（庐山）', '5号教室（长白山）', '6号教室（华山）', '7号教室（珠穆朗玛峰）', '8号教室（武夷山）', '9号教室（嵩山）'];
        //var data = [[0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0], [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4], [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5], [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9], [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2], [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0], [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5], [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4], [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13], [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1], [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2], [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8], [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0], [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0], [5, 5, 0], [5, 6, 0], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5], [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0], [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0], [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0], [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]];
        var { x_items, y_items, data_list } = this.state;
        var data = data_list.map(function (item) {
            return [x_items[item[1]], y_items[item[0]], item[2]];
        });
        var option = {
            tooltip: {
                position: 'top'
            },
            animation: false,
            grid: {
                height: '50%',
                y: '10%'
            },
            xAxis: {
                type: 'category',
                data: x_items,
                splitArea: {
                    show: true
                }
            },
            yAxis: {
                type: 'category',
                data: y_items,
                splitArea: {
                    show: true
                }
            },
            visualMap: {
                min: 0,
                max: 10,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '15%'
            },
            series: [{
                name: '教师上课安排',
                type: 'heatmap',
                data: data,
                label: {
                    normal: {
                        show: true
                    }
                },
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
        return option;
    }
    componentWillMount() {
        this.onSearch();
    }
    //处理搜索事件
    onSearch = (e) => {
        this.setState({ loading: true })
        this.props.getTeacherClassSchedules(this.state.dateType, this.state.beginDate, this.state.endDate).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ ...data, loading: false })
            }
        })
    }
    onDateTypeChange = (e) => {
        this.setState({ dateType: e.target.value })
    }
    onBeginDataPickerChange = (date, dateString) => {
        if (dateString != '') {
            this.setState({ beginDate: dateString });
        }
    }
    onEndDataPickerChange = (date, dateString) => {
        if (dateString != '') {
            this.setState({ endDate: dateString });
        }
    }

    //渲染，根据模式不同控制不同输出
    render() {
        if (this.state.loading) {
            return <div style={{ width: 100, margin: '300 auto' }}><Spin tip="数据加载中..."></Spin></div>
        }
        const formItemLayout = {
            labelCol: { span: 10 },
            wrapperCol: { span: 14 },
        };
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Manage":
            default:
                let beginDate = dataBind(this.state.beginDate, true);
                let endDate = dataBind(this.state.endDate, true);
                block_content = (
                    <div >
                        <Form
                            className="search-form"
                        >
                            <Row gutter={40}>

                                <Col span={8}>
                                    <FormItem {...formItemLayout} label={'数据类型'} >
                                        <RadioGroup defaultValue="1" size="large" onChange={(e) => {
                                            this.onDateTypeChange(e);
                                        }}>
                                            <RadioButton value="1">当日</RadioButton>
                                            <RadioButton value="2">几日内</RadioButton>
                                        </RadioGroup>
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label={'起始日期'} >
                                        <DatePicker defaultValue={beginDate} onChange={this.onBeginDataPickerChange} />
                                    </FormItem>
                                </Col>
                                {
                                    this.state.dateType == 2 ? <Col span={8}>
                                        <FormItem {...formItemLayout} label={'截止日期'} >
                                            <DatePicker defaultValue={endDate} onChange={this.onEndDataPickerChange} />
                                        </FormItem>
                                    </Col> : ''
                                }
                                <Col span={8}>
                                    <Button type="primary" icon="search" onClick={this.onSearch}>查询</Button>
                                </Col>
                            </Row>
                        </Form>
                        <div className='examples'>
                            <div className='parent'>
                                <ReactEcharts
                                    option={this.getOtion()}
                                    style={{ height: '100%', width: '100%' }}
                                    className='react_for_echarts' />
                            </div>
                        </div>
                    </div>
                );
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedTeachClassRoomManage = Form.create()(TeachClassSchedule);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getTeacherClassSchedules: bindActionCreators(getTeacherClassSchedules, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachClassRoomManage);