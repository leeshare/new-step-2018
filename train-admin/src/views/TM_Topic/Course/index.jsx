import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card } from 'antd';
import { getCourseTopicDetails, addSelectedCourseToTopic, deleteSelectedCourseToTopic } from '@/actions/tm';
import { getDictionaryTitle, getDictionaryTitleByCode } from '@/utils';
import CourseView from '@/views/TM_Course/View';
import ModalSearchCourse from '@/views/TM_Course/ModalSearchCourse'
const FormItem = Form.Item;


class TopicCourseManage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showChooseCourse: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', ExcludeTopicID: props.TopicID, ApplicableScopes: '-1', SupportUnitType: "-1" },
            dic_courseApplicableScopes: [],
            dic_courseStatus: [],
            dic_courseAuditStatus: [],
            dic_courseWareTypes: [],
            data_list: [],
            data_list_total: 0,
            loading: false,
            DeleteSelectedCourseIDs: [],//删除学习任务ID列表
            SaveSelectedCourseIDs: [],//添加学习任务ID列表
        };

    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

    //table 输出列定义
    columns = [
        // {
        //     title: `学习任务封面`,
        //     width: 100,
        //     //自定义显示
        //     render: (text, record, index) => {
        //         return <div style={{ width: 80, height: 'auto' }}><img src={record.CourseInfo.Cover} style={{ width: '100%', height: 'auto' }} /></div>
        //     }
        // },
        {
            title: '学习任务',
            render: (text, record, index) => {
                return <a onClick={() => { this.onLookView('View', record) }}>{record.CourseInfo.CourseName}</a>
            }
        },
        {
            title: '任务类型',
            render: (text, record, index) => {
                return record.CourseInfo.SupportUnitType == 0 ? '综合' : getDictionaryTitleByCode(this.state.dic_courseWareTypes, record.CourseInfo.SupportUnitType);
            }
        },
        {
            title: '适用对象',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_courseApplicableScopes, record.CourseInfo.ApplicableScopes);
            }
        },
        {
            title: '单元数',
            dataIndex: 'CourseInfo.Units',
            width: 80,
        },
        {
            title: '金币数',
            dataIndex: 'CourseInfo.Golds',
            width: 80,
        },
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
                <FormItem {...formItemLayout} label={'学习任务'} >
                    {getFieldDecorator('Keyword', { initialValue: '' })(
                        <Input placeholder="学习任务" />
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
                    {getFieldDecorator('ApplicableScopes', { initialValue: this.props.ApplicableScopes })(
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
        return children;
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
            this.props.getCourseTopicDetails(pagingSearch).payload.promise.then((response) => {
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
    onSaveSelectedCourse = (courseIDs) => {
        this.props.addSelectedCourseToTopic(this.props.TopicID, courseIDs).payload.promise.then((response) => {
            this.onSearch();//刷新数据
            //关闭对话框
            this.setState({ showChooseCourse: false });
        })
    }
    onDeleteSelectedCourse = () => {
        Modal.confirm({
            title: '你确认要批量删除选中的学习任务吗?',
            content: '请确认！',
            onOk: () => {
                this.props.deleteSelectedCourseToTopic(this.state.DeleteSelectedCourseIDs).payload.promise.then((response) => {
                    //批量删除完后清除选中
                    this.setState({ DeleteSelectedCourseIDs: [] });
                    this.onSearch();//刷新数据
                })
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
    }
    //渲染，根据模式不同控制不同输出
    render() {
        //表格选择删除后处理
        var rowSelection = {
            selectedRowKeys: this.state.DeleteSelectedCourseIDs,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ DeleteSelectedCourseIDs: selectedRowKeys })
            },
            getCheckboxProps: record => ({
                disabled: false,    // Column configuration not to be checked
            }),
        };

        let block_content = <div></div>
        switch (this.state.editMode) {
            case "View":
                let props = { ...this.state, currentDataModel: this.state.currentDataModel.CourseInfo };
                block_content = <CourseView viewCallback={() => {
                    this.setState({ currentDataModel: null, editMode: 'Manage' })
                }} {...props} />
                break;
            case "Manage":
            default:
                block_content = (
                    <div>
                        <Modal
                            width={1200}
                            title="从学习任务库中选择"
                            wrapClassName="vertical-center-modal"
                            visible={this.state.showChooseCourse}
                            onOk={() => {
                                this.setState({ showChooseCourse: false });
                                this.onSaveSelectedCourse();
                            }}
                            onCancel={() => {
                                this.setState({ showChooseCourse: false });
                            }}
                            footer={null}
                        >
                            <ModalSearchCourse {...this.props} callback={this.onSaveSelectedCourse} />
                        </Modal>
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
                                        this.setState({ showChooseCourse: true });
                                    }} icon="plus">学习任务</Button>
                                </Col></Row>
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
                                        {this.state.DeleteSelectedCourseIDs.length > 0 ? <Button icon="delete" onClick={this.onDeleteSelectedCourse}>{'删除'}</Button> : <Button icon="delete" disabled>{'删除'}</Button>}
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
const WrappedTopicCourseManage = Form.create()(TopicCourseManage);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getCourseTopicDetails: bindActionCreators(getCourseTopicDetails, dispatch),
        addSelectedCourseToTopic: bindActionCreators(addSelectedCourseToTopic, dispatch),
        deleteSelectedCourseToTopic: bindActionCreators(deleteSelectedCourseToTopic, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTopicCourseManage);