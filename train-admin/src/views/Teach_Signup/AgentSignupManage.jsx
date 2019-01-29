import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, DatePicker } from 'antd';
import { getTeachSignupRecordList, saveTeachSignupRecord, switchTeachSignupStatus } from '@/actions/teach';
import { getDictionaryTitle, dataBind,distinctOfArray } from '@/utils';
import TeachSignupView from './View';
const FormItem = Form.Item;
class AgentSignupManage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', Status: "-1", IsAgent: '1', ProductID: '', TeachClassName: '', Student: '', Week: '-1', TimeRange: '', Location: '', BeginDate: '', EndDate: '' },
            dic_Timezones: [],
            dic_TeachSignupStatus: [],
            dic_Products: [],
            dic_ProductPrices: [],
            dic_Batchs: [],
            dic_SignupChooseTimeRanges: [],
            dic_TeachTimeRanges: [],
            dic_Weeks: [],
            default_location: "",
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
            title: `学生姓名`,
            //自定义显示
            render: (text, record, index) => {
                return <a onClick={() => { this.onLookView('View', record) }}>{record.StudentInfo.chinese_name}</a>
            }
        },
        {
            title: `邮箱`,
            //自定义显示
            render: (text, record, index) => {
                return `${record.StudentInfo.email}`
            }
        }, {
            title: `联系方式`,
            //自定义显示
            render: (text, record, index) => {
                return `${distinctOfArray([record.StudentInfo.mobile,record.StudentInfo.parent_telephone]).join(' ')}`
            }
        },
        {
            title: `报名课程`,
             //自定义显示
            render: (text, record, index) => {
                return `${record.ProductInfo.productName}`
            }
        },
        {
            title: `缴费`,
            //自定义显示
            render: (text, record, index) => {
                if (record.OrderInfo) {
                    return `${record.PriceInfo.priceName}`;
                }
                else {
                    return '----------'
                }
            }
        },
        {
            title: `填报日期`,
            width: 160,//可预知的数据长度，请设定固定宽度
            dataIndex: 'SignupDate'
        },
        {
            title: '报名状态',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_TeachSignupStatus, record.Status, '未知');
            }
        },
        {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => { this.onLookView('View', record) }}>查看详情</a>
                    {/* {record.Status > 0 && record.Status < 30 && <a style={{ marginLeft: 20 }} onClick={() => { this.onLookView('Edit', record) }}>报名缴费</a>}
                    {record.Status == 30 && <a style={{ marginLeft: 20 }} onClick={() => { this.onLookView('Cancel', record) }}>取消报名</a>} */}
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
                <FormItem {...formItemLayout} label={'学生'} >
                    {getFieldDecorator('Student', { initialValue: this.state.pagingSearch.Student })(
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
                    {getFieldDecorator('ProductID', { initialValue: this.state.pagingSearch.ProductID })(
                        <Select>
                            <Option value="">全部</Option>
                            {this.state.dic_Products.map((item) => {
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
                    label="报名状态"
                >
                    {getFieldDecorator('Status', { initialValue: this.state.pagingSearch.Status })(
                        <Select>
                            <Option value="-1">全部</Option>
                            {this.state.dic_TeachSignupStatus.map((item) => {
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
            this.props.getTeachSignupRecordList(pagingSearch).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    this.setState({ loading: false })
                    message.error(data.message, 5);
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
                case "Edit":
                    //提交订单
                    this.props.saveTeachSignupRecord(dataModel).payload.promise.then((response) => {
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
                case "Cancel":
                    //提交
                    this.props.switchTeachSignupStatus(dataModel).payload.promise.then((response) => {
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
            case "Edit":
                block_content = <TeachSignupView viewCallback={this.onViewCallback} {...this.state} />
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
                                    <Button style={{ marginLeft: 8 }} onClick={() => { this.onLookView('Create', { StudentInfo: {} }) }} icon="plus">课程报名</Button>
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
const WrappedAgentSignupManage = Form.create()(AgentSignupManage);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getTeachSignupRecordList: bindActionCreators(getTeachSignupRecordList, dispatch),
        saveTeachSignupRecord: bindActionCreators(saveTeachSignupRecord, dispatch),
        switchTeachSignupStatus: bindActionCreators(switchTeachSignupStatus, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAgentSignupManage);