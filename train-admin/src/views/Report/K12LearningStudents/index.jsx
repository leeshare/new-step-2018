import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, Spin } from 'antd';
import { getReportOfK12LearningStudents } from '@/actions/report';
import { getDictionaryTitle, ellipsisText, dataBind } from '@/utils';
const FormItem = Form.Item;
const Option = Select.Option;
class K12LearningStudents extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', Status: '-1', UserType: 1, UserImageStatus: '-1' },
            dic_months: [],
            dic_CourseSpecialtys: [],
            data_list: [],
            data_list_total: 0,
            loading: false
        };
    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

    //搜索条件
    getFields() {
        const count = this.state.expand ? 10 : 6;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };
        const children = [];
        children.push(
            <Col span={8}>
                <FormItem {...formItemLayout} label={'学生'} >
                    {getFieldDecorator('Keyword', { initialValue: this.state.pagingSearch.Keyword })(
                        <Input placeholder={'学号、姓名、中文姓名'} />
                    )}
                </FormItem>
            </Col>
        );
        let filedCount = this.state.expand ? children.length : 2;
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
            this.props.getReportOfK12LearningStudents(pagingSearch).payload.promise.then((response) => {
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

        //table 输出列定义
        let columns = [
            {
                title: `头像`,
                width: 70,
                //自定义显示
                render: (text, record, index) => {
                    return <img src={record.StudentInfo.icon} style={{ width: 50, borderRadius: '50%' }} />
                }
            },
            {
                title: `学号`,
                width: 160,
                dataIndex: 'StudentInfo.username'
            },
            {
                title: `姓名`,
                dataIndex: 'StudentInfo.name'
            },
            {
                title: `中文姓名`,
                dataIndex: 'StudentInfo.chinese_name'
            },
            {
                title: `已用课时`,
                dataIndex: 'UsedDuration'
            },
            {
                title: `剩余课时`,
                width: 160,
                render: (text, record, index) => {
                    return `${record.AllDuration - record.UsedDuration}`
                }
            },
            {
                title: `总课时`,
                dataIndex: 'AllDuration'
            },
        ];
        let block_content = (
            <div>
                <Form
                    className="search-form"
                >
                    <Row gutter={40}>
                        {this.getFields()}
                        <Col span={2} style={{ textAlign: 'right' }}>
                            <Button type="primary" icon="search" onClick={this.onSearch}>查询</Button>
                        </Col>
                    </Row>
                </Form>
                <div className="search-result-list">
                    <Table
                        loading={this.state.loading}
                        pagination={false}
                        columns={columns} //列定义
                        dataSource={this.state.data_list}//数据
                    />
                    <div className="search-paging">
                        <Row>
                            <Col span={8}>
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
        return block_content;
    }
}
//表单组件 封装
const WrappedFeeOfMonth = Form.create()(K12LearningStudents);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getReportOfK12LearningStudents: bindActionCreators(getReportOfK12LearningStudents, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedFeeOfMonth);