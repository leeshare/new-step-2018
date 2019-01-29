import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card } from 'antd';
import { getCourseList } from '@/actions/tm';
import { getDictionaryTitle, getDictionaryTitleByCode } from '@/utils';
import LectureCourseView from '../View/lectures';
const FormItem = Form.Item;


class ModalSearchLectureCourse extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 5, Keyword: '', Status: 1, AuditStatus: 3, ApplicableScopes: '', SupportUnitType: '8', IsLecture: true },
            dic_courseApplicableScopes: [],
            dic_courseWareTypes: [],
            dic_courseStatus: [],
            dic_courseAuditStatus: [],
            data_list: [],
            data_list_total: 0,
            loading: false,
        };

    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

    //table 输出列定义
    columns = [
        {
            title: '教学任务名称',
            render: (text, record, index) => {
                return <a onClick={() => { this.onLookView('View', record) }}>{record.CourseName}</a>
            }
        },
        {
            title: '关键字',
            dataIndex: 'Keywords',
        },
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
            title: '操作',
            render: (text, record, index) => {
                return <Button onClick={()=>this.onSaveSelectedCourse(record)}>{'选择'}</Button>
            }
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
            <Col span={7}>
                <FormItem {...formItemLayout} label={'教学任务名称'} >
                    {getFieldDecorator('Keyword', { initialValue: '' })(
                        <Input placeholder="教学任务名称或关键字" />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={7}>
                <FormItem
                    {...formItemLayout}
                    label="适用对象"
                >
                    {getFieldDecorator('ApplicableScopes', { initialValue: '' })(
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
        this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
    triggerChange = (changedValue) => {
        // Should provide an event to pass value to Form.
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(changedValue);
        }
    }
    //保存选择的学习任务
    onSaveSelectedCourse = (courseInfo) => {
        //回传给调用页面选中的数据
        this.triggerChange(courseInfo);
        this.props.callback(courseInfo);
    }
    //渲染，根据模式不同控制不同输出
    render() {        
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "View":
                block_content = <LectureCourseView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                block_content = (
                    <div className="modal-search">
                        <Form
                            className="search-form"
                        >
                            <Row gutter={40}>
                                {this.getFields()}
                                <Col span={3} style={{ textAlign: 'right' }}>
                                    <Button type="primary" icon="search" onClick={this.onSearch}>查询</Button>
                                </Col></Row>
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
const WrappedModalSearchLectureCourse = Form.create()(ModalSearchLectureCourse);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getCourseList: bindActionCreators(getCourseList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedModalSearchLectureCourse);