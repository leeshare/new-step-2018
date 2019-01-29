import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card } from 'antd';
import { getLiveQuestionList, saveLiveQuestionInfo, switchLiveQuestionInfo, deleteLiveQuestionInfo } from '@/actions/live';
import { getDictionaryTitle, convertTextToHtml } from '@/utils';
const FormItem = Form.Item;

import QuestionView from './view'

class LiveQuestionManage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', Status: '-1', AuditStatus: '-1', QuestionType: '-1', LiveID: props.LiveID },
            dic_QuestionTypes: [],
            dic_Status: [],
            dic_AuditStatus: [],
            data_list: [],
            data_list_total: 0,
            loading: false,
            UserSelecteds: []
        };

    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

    //table 输出列定义
    columns = [ {
            title: `头像`,
            width: 70,
            //自定义显示
            render: (text, record, index) => {
                return <img src={record.Owners[0].icon} style={{ width: 50, borderRadius: '50%' }} />
            }
        },
        {
            title: `姓名`,
            //自定义显示
            render: (text, record, index) => {
                return record.Owners[0].chinese_name?record.Owners[0].chinese_name:record.Owners[0].name
            }
        },
        {
            title: '提问',
            render: (text, record, index) => {
                return <span dangerouslySetInnerHTML={{ __html: convertTextToHtml(record.question_name) }}></span>
            }
        },
        {
            title: '提问类型',
            width: 120,
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_QuestionTypes, record.question_type);
            }
        },
        {
            title: '审核状态',
            width: 120,
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_AuditStatus, record.audit_status);
            }
        },
        {
            title: '提问状态',
            width: 120,
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.status);
            }
        },
        {
            title: '提问时间',
            width: 160,
            render: (text, record, index) => {
                return `${record.created_date}`
            }
        },
        {
            title: '多少人感兴趣',
            width: 120,
            render: (text, record, index) => {
                return `${record.similar_member_number}`
            }
        },
        {
            title: '顺序',
            width: 120,
            render: (text, record, index) => {
                return `${record.top_level}`
            }
        },
        {
            title: '操作',
            width: 160,//可预知的数据长度，请设定固定宽度
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => { this.onLookView('Edit', record) }}>{'修改'}</a>
                    <span className="ant-divider" />
                    <a onClick={() => { this.onLookView('Delete', record) }}>{'删除'}</a>
                    <span className="ant-divider" />
                    <a onClick={() => { this.onSwitchStatus(record) }}>{record.audit_status != 2 ? '审核通过' : '审核拒绝'}</a>
                </span>
            ),
        }
    ];

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
                <FormItem {...formItemLayout} label={'提问内容'} >
                    {getFieldDecorator('Keyword', { initialValue: '' })(
                        <Input placeholder="提问内容" />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="提问类型"
                >
                    {getFieldDecorator('QuestionType', { initialValue: this.state.pagingSearch.QuestionType })(
                        <Select>
                            <Option value="-1">全部</Option>
                            {this.state.dic_QuestionTypes.map((item) => {
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
                            {this.state.dic_AuditStatus.map((item) => {
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
                    label="提问状态"
                >
                    {getFieldDecorator('Status', { initialValue: this.state.pagingSearch.Status })(
                        <Select>
                            <Option value="-1">全部</Option>
                            {this.state.dic_Status.map((item) => {
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
            this.props.getLiveQuestionList(pagingSearch).payload.promise.then((response) => {
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
                    this.props.saveLiveQuestionInfo({ ...dataModel, LiveID: this.props.LiveID }).payload.promise.then((response) => {
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
                    this.props.deleteLiveQuestionInfo(this.state.currentDataModel).payload.promise.then((response) => {
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
    onSwitchStatus = (dataModel, status) => {
        if (!status) {
            if (dataModel.audit_status == 2) {
                dataModel.AuditStatus = 1;
            }
            else {
                dataModel.AuditStatus = 2;
            }
        }
        else {
            dataModel.AuditStatus = status;
        }

        this.props.switchLiveQuestionInfo(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                this.setState({ UserSelecteds: [] });
                this.onSearch();
            }
        })
    }

    onBatchSwitchStatus = (status) => {
        this.state.UserSelecteds.map((a) => {
            var dataModel = this.state.data_list.find(A => A.key == a);
            this.onSwitchStatus(dataModel, status);
        });
    }
    //渲染，根据模式不同控制不同输出
    render() {
        //表格选择删除后处理
        var rowSelection = {
            selectedRowKeys: this.state.UserSelecteds,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ UserSelecteds: selectedRowKeys })
            },
            getCheckboxProps: record => ({
                disabled: false,    // Column configuration not to be checked
            }),
        };

        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "Delete":
            case "View":
                let props = { ...this.state, currentDataModel: this.state.currentDataModel };
                block_content = <QuestionView viewCallback={this.onViewCallback} {...props} />
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
                                    <Button style={{ marginLeft: 8 }} onClick={() => {
                                        this.onLookView('Create', {});
                                    }} icon="plus">提问</Button>
                                    <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                                        更多 <Icon type={this.state.expand ? 'up' : 'down'} />
                                    </a>
                                </Col>
                            </Row>
                        </Form>
                        <div className="search-result-list">
                            <Table
                                loading={this.state.loading}
                                rowSelection={rowSelection}
                                pagination={false}
                                columns={this.columns} //列定义
                                dataSource={this.state.data_list}//数据
                            />
                            <div className="search-paging">
                                <Row>
                                    <Col span={8} className={'search-paging-batchcontrol'}>
                                        {this.state.UserSelecteds.length > 0 ? <Button icon="check" onClick={() => { this.onBatchSwitchStatus(2) }}>{'审核通过'}</Button> : <Button icon="check" disabled>{'审核通过'}</Button>}
                                        {this.state.UserSelecteds.length > 0 ? <Button type='danger' style={{ marginLeft: 20 }} icon="exclamation" onClick={() => { this.onBatchSwitchStatus(1) }}>{'审核拒绝'}</Button> : <Button style={{ marginLeft: 20 }} type='danger' icon="exclamation" disabled>{'审核拒绝'}</Button>}
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
const WrappedLiveQuestionManage = Form.create()(LiveQuestionManage);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getLiveQuestionList: bindActionCreators(getLiveQuestionList, dispatch),
        saveLiveQuestionInfo: bindActionCreators(saveLiveQuestionInfo, dispatch),
        switchLiveQuestionInfo: bindActionCreators(switchLiveQuestionInfo, dispatch),
        deleteLiveQuestionInfo: bindActionCreators(deleteLiveQuestionInfo, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedLiveQuestionManage);