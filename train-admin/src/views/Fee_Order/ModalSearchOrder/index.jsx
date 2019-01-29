import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card } from 'antd';
import { getFeeOrderList } from '@/actions/fee';
import { getDictionaryTitle } from '@/utils';
import FeeOrderView from '../View';
const FormItem = Form.Item;
class ModalSearchOrder extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', Status: "3",PayType:'-1', OrderCode: '', CourseSpecialty: '', BeginDate: '', EndDate: '' },
            dic_CourseSpecialtys: [],
            dic_OrderStatus: [],
            dic_PeriodDurationTypes: [],
            dic_InvoiceStatus: [],
            dic_PeriodTypes: [],
            dic_TrueOrFalse: [],
            dic_PayTypes:[],
            data_list: [],
            data_list_total: 0,
            ChooseObjects: props.ChooseObjects || [],
            loading: false
        };
    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.Keyword != this.props.Keyword) {
            setTimeout(() => {
                this.onSearch();
            }, 100)
        }
        this.setState({ ChooseObjects: nextProps.ChooseObjects || [] });
        console.log(nextProps)
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
            width: 160,//可预知的数据长度，请设定固定宽度
            dataIndex: 'OrderDate'
        },
        {
            title: `订单金额`,
            dataIndex: 'OrderMoney'
        },        
        {
            title: '结算方式',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_PayTypes, record.PayType,'未知');
            }
        },
        {
            title: '操作',
            width: 100,//可预知的数据长度，请设定固定宽度
            key: 'action',
            render: (text, record) => (
                this.state.ChooseObjects.find(A => A.key == record.key) ? <span>已选择</span> : <a onClick={() => { this.props.callback(record) }}>选择</a>
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
            <Col span={7}>
                <FormItem {...formItemLayout} label={'订单编号'} >
                    {getFieldDecorator('OrderCode', { initialValue: this.state.pagingSearch.OrderCode })(
                        <Input placeholder={'订单编号模糊查找'} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={7}>
                <FormItem {...formItemLayout} label={'学生'} >
                    {getFieldDecorator('Keyword', { initialValue: this.state.pagingSearch.Keyword })(
                        <Input placeholder={'学号、姓名、中文名模糊查找'} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={7}>
                <FormItem
                    {...formItemLayout}
                    label="结算方式"
                >
                    {getFieldDecorator('PayType', { initialValue: this.state.pagingSearch.PayType })(
                        <Select>
                            <Option value="-1">全部</Option>
                            {this.state.dic_PayTypes.map((item) => {
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
                                <Col span={3} style={{ textAlign: 'right' }}>
                                    <Button type="primary" icon="search" onClick={this.onSearch}>查询</Button>                                    
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
const WrappedModalSearchOrder = Form.create()(ModalSearchOrder);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getFeeOrderList: bindActionCreators(getFeeOrderList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedModalSearchOrder);