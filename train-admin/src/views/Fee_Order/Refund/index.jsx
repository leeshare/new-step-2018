import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, DatePicker } from 'antd';
import { getFeeOrderList, testNewOrderExist, saveFeeOrderInfo, cancelOrderInfo, getFeeRefundOrderInfo, saveFeeRefundOrderInfo } from '@/actions/fee';
import { getDictionaryTitle, dataBind } from '@/utils';
import FeeOrderView from '../View';
const FormItem = Form.Item;
class FeeOrderRefund extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', Status: "3", OrderCode: '', CourseSpecialty: '', BeginDate: '', EndDate: '' },
            dic_CourseSpecialtys: [],
            dic_OrderStatus: [],
            dic_PeriodDurationTypes: [],
            dic_InvoiceStatus: [],
            dic_PeriodTypes: [],
            dic_TrueOrFalse: [],
            data_list: [],
            data_list_total: 0,
            loading: false,
        };
    }

    componentWillMount() {
        //首次进入搜索，加载服务端主题典项内容
        this.onSearch();
    }

    //table 输出列定义
    columns = [
        {
            title: `订单编号`,
            //自定义显示
            render: (text, record, index) => {
                return <a onClick={() => { this.onLookView('View', record) }}>{record.OrderCode}</a>
            }
        },
        {
            title: `学号`,
            dataIndex: 'StudentInfo.username'
        },
        {
            title: '中文姓名',
            dataIndex: 'StudentInfo.chinese_name'
        },
        {
            title: `订单时间`,
            dataIndex: 'OrderDate'
        },
        {
            title: `订单金额`,
            dataIndex: 'OrderMoney'
        },
        {
            title: '课程名称',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_CourseSpecialtys, record.CourseSpecialty);
            }
        },
        {
            title: '课时数',
            dataIndex: 'Periods',
        },
        {
            title: '有效期',
            render: (text, record, index) => {
                let PeriodDurationType = getDictionaryTitle(this.state.dic_PeriodDurationTypes, record.PeriodDurationType);
                return `${record.PeriodDuration}${PeriodDurationType}`;
            }
        },
        {
            title: '订单状态',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_OrderStatus, record.OrderStatus);
            }
        },
        {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => { this.onLookView('View', record) }}>查看订单</a>

                    {record.OrderStatus == 3 ? <a style={{ marginLeft: 20 }} onClick={() => { this.onLookView('Refund', record) }}>新增退款单</a> : ''}
                    {record.OrderStatus == 4 ? <a style={{ marginLeft: 20 }} onClick={() => { this.onLookView('Refund', record) }}>查看退款单</a> : ''}
{/* 
                    {record.OrderStatus == 1 ? <a style={{ marginLeft: 20 }} onClick={() => { this.onLookView('Cancel', record) }}>取消订单</a> : ''} */}
                </span>
            ),
        }];

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
                <FormItem {...formItemLayout} label={'订单编号'} >
                    {getFieldDecorator('OrderCode', { initialValue: this.state.pagingSearch.OrderCode })(
                        <Input placeholder={'订单编号模糊查找'} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem {...formItemLayout} label={'学生'} >
                    {getFieldDecorator('Keyword', { initialValue: this.state.pagingSearch.Keyword })(
                        <Input placeholder={'学号、姓名、中文名模糊查找'} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="课程"
                >
                    {getFieldDecorator('CourseSpecialty', { initialValue: this.state.pagingSearch.CourseSpecialty })(
                        <Select>
                            <Option value="">全部</Option>
                            {this.state.dic_CourseSpecialtys.map((item) => {
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
                    label="订单状态"
                >
                    {getFieldDecorator('Status', { initialValue: this.state.pagingSearch.Status })(
                        <Select>
                            <Option value="-1">全部</Option>
                            {this.state.dic_OrderStatus.filter(A=>A.value>2).map((item) => {
                                return <Option value={item.value}>{item.title}</Option>
                            })}
                        </Select>
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem {...formItemLayout} label={'开始日期'} >
                    {getFieldDecorator('BeginDate', { initialValue: this.state.pagingSearch.BeginDate })(
                        <DatePicker />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="截止日期"
                >
                    {getFieldDecorator('EndDate', { initialValue: this.state.pagingSearch.EndDate })(
                        <DatePicker />
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
    onSearch = (e) => {
        if (e) {
            e.preventDefault();
            this.state.pagingSearch.PageIndex = 1;//重新查询时重置到第一页
        }
        this.setState({ loading: true })
        this.props.form.validateFields((err, values) => {
            console.log('Received values of form: ', values);
            let pagingSearch = { ...this.state.pagingSearch, ...values };
            this.props.getFeeOrderList(pagingSearch).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    this.setState({ loading: false })
                    message.error(data.message);
                }
                else {
                    this.setState({ pagingSearch, ...data, loading: false })
                }
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
        else {
            switch (this.state.editMode) {
                case "Create":
                    //检测下是否已经有重复订单
                    this.props.testNewOrderExist(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            Modal.confirm({
                                title: data.message,
                                content: '如果没有问题请点击确认提交，否则取消！',
                                onOk: () => {
                                    //提交订单
                                    this.props.saveFeeOrderInfo({ ...dataModel, OrderStatus: 3 }).payload.promise.then((response) => {
                                        let data = response.payload.data;
                                        if (data.result === false) {
                                            message.error(data.message);
                                        }
                                        else {
                                            this.onSearch();
                                            //进入管理页
                                            this.onLookView("Manage", null);
                                        }
                                    })
                                },
                                onCancel: () => {
                                    console.log('Cancel');
                                },
                            });
                        }
                        else {
                            //提交订单
                            this.props.saveFeeOrderInfo(dataModel).payload.promise.then((response) => {
                                let data = response.payload.data;
                                if (data.result === false) {
                                    message.error(data.message);
                                }
                                else {
                                    this.onSearch();
                                    //进入管理页
                                    this.onLookView("Manage", null);
                                }
                            })
                        }
                    })
                    break;
                case "Cancel":
                    //提交
                    this.props.cancelOrderInfo(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case "Refund"://退款处理
                    {
                        //提交
                        this.props.saveFeeRefundOrderInfo(dataModel).payload.promise.then((response) => {
                            let data = response.payload.data;
                            if (data.result === false) {
                                message.error(data.message);
                            }
                            else {
                                this.onSearch();
                                //进入管理页
                                this.onLookView("Manage", null);
                            }
                        })
                    }
                    break;
            }
        }
    }

    //渲染，根据模式不同控制不同输出
    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Create":
            case "View":
            case "Cancel":
            case "Refund":
                block_content = <FeeOrderView getFeeRefundOrderInfo={this.props.getFeeRefundOrderInfo} viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                block_content = (
                    <div >
                        <Form
                            className="search-form"
                        >
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
                                columns={this.columns} //列定义
                                dataSource={this.state.data_list}//数据
                            />
                            <div className="search-paging">
                                <Row>
                                    <Col span={8} className={'search-paging-batchcontrol'}>
                                    </Col>
                                    <Col span={16} className={'search-paging-control'}>
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
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedFeeOrderManage = Form.create()(FeeOrderRefund);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getFeeOrderList: bindActionCreators(getFeeOrderList, dispatch),
        testNewOrderExist: bindActionCreators(testNewOrderExist, dispatch),
        saveFeeOrderInfo: bindActionCreators(saveFeeOrderInfo, dispatch),
        cancelOrderInfo: bindActionCreators(cancelOrderInfo, dispatch),
        getFeeRefundOrderInfo: bindActionCreators(getFeeRefundOrderInfo, dispatch),
        saveFeeRefundOrderInfo: bindActionCreators(saveFeeRefundOrderInfo, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedFeeOrderManage);