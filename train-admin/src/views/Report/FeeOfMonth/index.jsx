import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, Spin } from 'antd';
import { getReportOfFeeOfMonth } from '@/actions/report';
import { getDictionaryTitle, ellipsisText, dataBind } from '@/utils';
import YSBarChart from '../components/YSBarChart.js'
const FormItem = Form.Item;
const Option = Select.Option;
class FeeOfMonth extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', Status: '-1', UserType: 1, UserImageStatus: '-1' },
            dic_months: [],
            data_list: [],
            data_list_total: 0,
            loading: false
        };
    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

    //table 输出列定义
    columns = [
        {
            title: `月份`,
            dataIndex: 'name'
        },
        {
            title: `缴费（元）`,
            dataIndex: '缴费（元）'
        },
        {
            title: '退费（元）',
            dataIndex: '退费（元）'
        }];

    //搜索条件
    getFields() {
        const count = this.state.expand ? 10 : 6;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };
        const children = [];
        let options = [];
        this.state.dic_months.map((item, index) => {
            options.push(<Option value={item}>{item}</Option>);
        })
        children.push(
            <Col span={12}>
                <FormItem
                    {...formItemLayout}
                    label="月份选择"
                >
                    <Select
                        mode="multiple"
                        placeholder="请选择月份"
                        defaultValue={(this.state.pagingSearch.str_months||'').split(',').filter(A=>A!='')}
                        onChange={(values) => {
                            this.state.pagingSearch.str_months = values.join(',');
                            this.setState({ pagingSearch: this.state.pagingSearch })
                        }}
                    >
                        {options}
                    </Select>
                </FormItem>
            </Col>
        );
        let filedCount = this.state.expand ? children.length : 1;
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
            this.props.getReportOfFeeOfMonth(pagingSearch).payload.promise.then((response) => {
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

    //渲染，根据模式不同控制不同输出
    render() {
        if (this.state.loading) {
            return <div style={{ width: 100, margin: '300 auto' }}><Spin tip="数据加载中..."></Spin></div>
        }
        let block_content = (
            <div>
                <Form
                    className="search-form"
                >
                    <Row gutter={40}>
                        {this.getFields()}
                        <Col span={8} style={{ textAlign: 'right' }}>
                            <Button type="primary" icon="search" onClick={this.onSearch}>查询</Button>
                            {/* <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                                        更多 <Icon type={this.state.expand ? 'up' : 'down'} />
                                    </a> */}
                        </Col>
                    </Row>
                </Form>
                <div className="search-result-list">
                    <div>
                        <YSBarChart data={this.state.data_list} xData={["缴费（元）", "退费（元）"]} />
                    </div>
                    <Table
                        loading={this.state.loading}
                        pagination={false}
                        columns={this.columns} //列定义
                        dataSource={this.state.data_list}//数据
                    />
                </div>
            </div>
        );
        return block_content;
    }
}
//表单组件 封装
const WrappedFeeOfMonth = Form.create()(FeeOfMonth);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getReportOfFeeOfMonth: bindActionCreators(getReportOfFeeOfMonth, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedFeeOfMonth);