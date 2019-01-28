import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination } from 'antd';
import { getCourseList, deleteCourseInfo, saveCourseInfo, saveCourseDesign } from '@/actions/tm';
import { getDictionaryTitle, getDictionaryTitleByCode } from '@/utils';
import CourseView from '../View';
import './index.less'

const FormItem = Form.Item;


class CourseManage extends React.Component {
    state = {
        expand: false,
        viewMode: 'Manage',//Manage,View,Edit,Create,Design
        pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', ApplicableScopes: '-1', Status: "-1", AuditStatus: "-1", SupportUnitType: '-1'},
        dic_courseApplicableScopes: [],
        dic_courseWareTypes: [],
        dic_courseStatus: [],
        dic_courseAuditStatus: [],
        data_list: [],
        data_list_total: 0,
        loading: false
    };

    constructor() {
        super()
    }

    componentWillMount() {
        this.onSearch();
    }

    columns = [
        {
            title: `任务封面`,
            width: 120,
            //自定义显示
            render: (text, record, index) => {
                return <div style={{ width: 60, height: 'auto' }}><img src={record.Cover} style={{ width: '100%', height: 'auto' }} /></div>
            }
        },
        {
            title: '任务名称',
            render: (text, record, index) => {
                return <a onClick={() => { this.onLookView('View', record) }}>{record.CourseName}</a>
            }
        },
        {
            title: '任务类型',
            render: (text, record, index) => {
                return record.SupportUnitType == 0 ? '综合' : getDictionaryTitleByCode(this.state.dic_courseWareTypes, record.SupportUnitType);
            }
        },
        // {
        //     title: '关键字',
        //     dataIndex: 'Keywords',
        // },
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
            title: '显示排序',
            dataIndex: 'OrderNo',
        },
        {
            title: '金币数',
            dataIndex: 'Golds',
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
                    <a onClick={() => { this.onLookView('Edit', record) }}>修改</a>
                    <span className="ant-divider" />
                    <a onClick={() => { this.onLookView('Design', record) }}>设计</a>
                    <span className="ant-divider" />
                    {record.AuditStatus == 3 ? <a disabled>删除</a> : <a onClick={() => { this.onLookView('Delete', record) }}>删除</a>}
                </span>
            ),
        }];

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
                <FormItem {...formItemLayout} label={'任务名称'} >
                    {getFieldDecorator('Keyword', { initialValue: this.state.pagingSearch.Keyword })(
                        <Input placeholder="任务名称或关键字" />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="任务类型"
                >
                    {getFieldDecorator('SupportUnitType', { initialValue: this.state.pagingSearch.SupportUnitType })(
                        <Select>
                            <Option value="-1">全部</Option>
                            <Option value={'0'}>综合</Option>
                            {
                                this.state.dic_courseWareTypes.map((item) => {
                                    return <Option value={item.code}>{item.title}</Option>
                                })
                            }
                        </Select>
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
                            <Option value="-1">全部</Option>
                            {this.state.dic_courseAuditStatus.map((item) => {
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
                    label="任务状态"
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
    onSearch = (e) => {
        if (e) {
            e.preventDefault();
            this.state.pagingSearch.PageIndex = 1;//重新查询时重置到第一页
        }
        this.setState({ loading: true })
        this.props.form.validateFields((err, values) => {
            console.log('Received values of form: ', values);
            let pagingSearch = { ...this.state.pagingSearch, ...values };
            this.props.getCourseList(pagingSearch).payload.promise.then((response) => {
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
                case "Edit": //提交
                    this.props.saveCourseInfo(dataModel).payload.promise.then((response) => {
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
                    //提交
                    break;
                case "Delete":
                    //提交
                    this.props.deleteCourseInfo(this.state.currentDataModel.CourseID).payload.promise.then((response) => {
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
                case "Design":
                    let courseDesign = { ...this.state.currentDataModel, CourseUnits: dataModel };
                    this.props.saveCourseDesign(courseDesign).payload.promise.then((response) => {
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

    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
            case "Design":
                block_content = <CourseView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                block_content = (
                    <div>
                        <Form
                            className="search-form"
                        >
                            <Row gutter={40}>
                                {this.getFields()}
                            </Row>
                            <Row>
                                <Col span={24} style={{ textAlign: 'right' }}>
                                    <Button type="primary" icon="search" onClick={this.onSearch}>查询</Button>
                                    <Button style={{ marginLeft: 8 }} onClick={() => { this.onLookView('Create', {}) }} icon="plus">学习任务</Button>
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
                break;
        }
        return block_content;
    }
}

const WrappedCourseManage = Form.create()(CourseManage);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getCourseList: bindActionCreators(getCourseList, dispatch),
        deleteCourseInfo: bindActionCreators(deleteCourseInfo, dispatch),
        saveCourseInfo: bindActionCreators(saveCourseInfo, dispatch),
        saveCourseDesign: bindActionCreators(saveCourseDesign, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
