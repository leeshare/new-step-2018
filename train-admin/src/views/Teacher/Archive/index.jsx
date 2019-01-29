import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, Progress, DatePicker, Tooltip, Badge } from 'antd';
import { getTeacherTeachRecords } from '@/actions/teach';
import { getDictionaryTitle, ellipsisText, getWeekTitle } from '@/utils';
import TeachView from '../Components/teachView';
import TeachDesign from '../Components/teachDesign';
import TeachKHDPList from '../Components/teachKHDPList';
import TeachDesignOnline from '@/views/Teacher/Components/teachDesignOnline';
const FormItem = Form.Item;
class TeacherArchive extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', isArchives: true, beginDate: '', endDate: '' },
            data_list: [],
            data_list_total: 0,
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
        console.log(nextProps)
    }
    //table 输出列定义
    columns = [
        {
            title: `上课时间/人数`,
            //自定义显示
            render: (text, record, index) => {
                return <span>{record.date_group} {getWeekTitle(record.week)} {record.plan_begin_time_short} {record.periods}课时 {record.classStudents}人</span>
            }
        },
        {
            title: `班课名称`,
            //自定义显示
            render: (text, record, index) => {
                return <span>{record.teach_name}({record.teach_schedule_no})</span>
            }
        },
        {
            title: `上课教室`,
            //自定义显示
            render: (text, record, index) => {
                return <span>{record.position}</span>
            }
        },
        {
            title: `点评进度`,
            //自定义显示
            render: (text, record, index) => {
                let progress = 0;
                if (record.classStudents > 0) {
                    progress = Math.round(record.commentStudents / record.classStudents * 100.00);
                }
                return <Progress percent={progress} />
            }
        },
        {
            title: '操作',
            width: 240,//可预知的数据长度，请设定固定宽度
            key: 'action',
            render: (text, record) => (
                <span>
                    <a style={{ marginRight: 10 }} onClick={() => { this.onLookView('Edit', record) }}>教师备课</a>
                    <a style={{ marginRight: 10 }} onClick={() => { this.onLookView('KHDP', record) }}>课后点评</a>
                    {
                        !record.cameraVideoInfo.isShowNew && <a onClick={() => { this.onLookView('View', record) }}>{'查看详情'}</a>
                    }
                    {
                        record.cameraVideoInfo.isShowNew &&
                        <Tooltip placement="top" title={'课堂回放点评：' + record.cameraVideoInfo.remark}>
                            <Badge dot={true}>
                                <a onClick={() => { this.onLookView('View', record) }}>{'查看详情'}</a>
                            </Badge>
                        </Tooltip>
                    }
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
                <FormItem {...formItemLayout} label={'开始日期'} >
                    {getFieldDecorator('beginDate', { initialValue: this.state.pagingSearch.beginDate })(
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
                    {getFieldDecorator('endDate', { initialValue: this.state.pagingSearch.endDate })(
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
            this.props.getTeacherTeachRecords(pagingSearch).payload.promise.then((response) => {
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
        this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
    //渲染，根据模式不同控制不同输出
    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
                if (this.state.currentDataModel.teach_way == 1) {
                    return <TeachDesign currentDataModel={this.state.currentDataModel} viewCallback={this.onViewCallback} />
                }
                else {
                    return <TeachDesignOnline currentDataModel={this.state.currentDataModel} viewCallback={this.onViewCallback} />
                }
                break;
            case "View":
                block_content = <TeachView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "KHDP":
                block_content = <TeachKHDPList viewCallback={this.onViewCallback} {...this.state} />
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
                                    {/* <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                                        更多 <Icon type={this.state.expand ? 'up' : 'down'} />
                                    </a> */}
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
const WrappedTeacherArchive = Form.create()(TeacherArchive);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getTeacherTeachRecords: bindActionCreators(getTeacherTeachRecords, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeacherArchive);