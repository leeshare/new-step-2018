import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, InputNumber } from 'antd';
import { getTeachPlanList, getTeachPlanDetails } from '@/actions/tm';
import { getDictionaryTitle, getDictionaryTitleByCode, convertTextToHtml } from '@/utils';
const FormItem = Form.Item;

import ModalPlayer from '@/components/ModalPlayer';
import CourseView from '@/views/TM_Course/View/lectures';
//props
//IsMultiple:true|default
//ExcludeIDs:[]
//callback:fun([])
class ModalSearchCourse extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 5, Keyword: '', Status: 1, CourseSpecialty: '', TeachPlanNo: '', TeachPlanID: '', IsStandand: '1', ExcludeIDs: props.ExcludeIDs || [] },
            dic_CourseSpecialtys: [],
            dic_TeachPlans: [],
            data_list: [],
            data_list_total: 0,
            loading: false,
            SaveSelectedCourseIDs: []
        };

    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.fetchTeachPlanList();//加载网络教材列表字典
        this.onSearch();
    }

    //table 输出列定义
    columns = [
        {
            title: '网络课教材名称',
            dataIndex: 'TeachPlanInfo.TeachPlanName',
        },
        {
            title: '课程',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_CourseSpecialtys, record.TeachPlanInfo.CourseSpecialty);
            }
        },
        {
            title: '课次',
            render: (text, record, index) => {
                return `第${record.TeachPlanNo}次课`
            }
        },
        {
            title: '教学任务',
            render: (text, record, index) => {
                return (record.JiaoxueCourseInfo == null) ? <span>----</span> : <a onClick={() => { this.onLookView('JiaoxueCourseView', record) }}>{record.JiaoxueCourseInfo.CourseName}</a>
            }
        },
        {
            title: '教案内容',
            render: (text, record, index) => {
                return (record.JiaoAnResourceInfo == null) ? <span>----</span> : <a onClick={() => { this.onLookView('JiaoAnResourceView', record) }}>{record.JiaoAnResourceInfo.ResourceName}</a>
            }
        },
        {
            title: '教学备注',
            render: (text, record, index) => {
                return <div dangerouslySetInnerHTML={{ __html: convertTextToHtml(record.Description) }}></div>
            }
        },
    ];

    fetchTeachPlanList = () => {
        this.props.getTeachPlanList({ pageSize: 999, AuditStatus: 3, Status: 1, }).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                this.setState({ dic_CourseSpecialtys: data.dic_CourseSpecialtys, dic_TeachPlans: data.data_list })
            }
        });
    }
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
                <FormItem {...formItemLayout} label={'网络课教材'} >
                    {getFieldDecorator('TeachPlanID', { initialValue: this.state.pagingSearch.TeachPlanID })(
                        <Select
                            showSearch={true}
                            filterOption={(inputValue, option) => {
                                return (option.props.children.indexOf(inputValue) != -1);
                            }}>
                            <Option value="">全部</Option>
                            {this.state.dic_TeachPlans.map((item) => {
                                return <Option value={item.TeachPlanID}>{item.TeachPlanName}</Option>
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
                    label="课程"
                >
                    {getFieldDecorator('CourseSpecialty', { initialValue: this.state.pagingSearch.CourseSpecialty })(
                        <Select
                            showSearch={true}
                            filterOption={(inputValue, option) => {
                                return (option.props.children.indexOf(inputValue) != -1);
                            }}>
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
            <Col span={5}>
                <FormItem
                    {...formItemLayout}
                    label="第几次课"
                >
                    {getFieldDecorator('TeachPlanNo', { initialValue: this.state.pagingSearch.TeachPlanNo })(
                        <InputNumber />
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
            this.props.getTeachPlanDetails(pagingSearch).payload.promise.then((response) => {
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
    onShowMediaPlayer = (mediaType, url) => {
        this.setState({ currentMedia: { object_type: mediaType, media_info: { media_url: url } }, showPlayMedia: true });
    }
    //浏览视图
    onLookView = (op, item) => {

        if (op == 'JiaoAnResourceView') {//pdf特殊处理
            this.onShowMediaPlayer(4, item.JiaoAnResourceInfo.FileUrl);
        }
        else {
            if (op == 'JiaoxueCourseView') {
                item = item.JiaoxueCourseInfo;
            }
            this.setState({
                editMode: op,//编辑模式
                currentDataModel: item,//编辑对象
            });
        }
    };
    //视图回调
    onViewCallback = (dataModel) => {
        this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
    //保存选择的学习任务
    onSaveSelectedCourse = () => {
        //回传给调用页面选中的数据
        this.props.callback(this.state.SaveSelectedCourseIDs)
        //清除选中
        this.setState({ SaveSelectedCourseIDs: [] });
    }
    //渲染，根据模式不同控制不同输出
    render() {
        // rowSelection object indicates the need for row selection
        var rowSelection = {
            selectedRowKeys: this.state.SaveSelectedCourseIDs,
            onChange: (selectedRowKeys, selectedRows) => {
                //是否只允许选择一个
                if (this.props.IsMultiple === false) {
                    if (this.state.SaveSelectedCourseIDs.length == 0 || selectedRowKeys.length == 0) {
                        this.setState({ SaveSelectedCourseIDs: selectedRowKeys });
                    }
                    else {
                        this.setState({ SaveSelectedCourseIDs: selectedRowKeys.filter(a => a != this.state.SaveSelectedCourseIDs[0]) });
                    }
                }
                else {
                    this.setState({ SaveSelectedCourseIDs: selectedRowKeys });
                }
            },
            getCheckboxProps: record => ({
                disabled: false,    // Column configuration not to be checked
            }),
        };
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "JiaoxueCourseView":
                block_content = <CourseView viewCallback={this.onViewCallback} {...{ ...this.state, editMode: 'View' }} />
                break;
            case "Manage":
            default:
                block_content = (
                    <div className="modal-search">{
                        this.state.currentMedia ? <ModalPlayer lecture_info={this.state.currentMedia} visible={this.state.showPlayMedia} onCancel={this.onCancelPlay} /> : ''
                    }
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
                                rowSelection={rowSelection}
                                pagination={false}
                                rowKey={'JiaoxueCourseID'}
                                columns={this.columns} //列定义
                                dataSource={this.state.data_list}//数据
                            />
                            <div className="search-paging">
                                <Row>
                                    <Col span={8} className={'search-paging-batchcontrol'}>
                                        {this.state.SaveSelectedCourseIDs.length > 0 ? <Button icon="plus" onClick={this.onSaveSelectedCourse}>{'加入学习任务'}</Button> : <Button icon="plus" disabled>{'加入学习任务'}</Button>}
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
const WrappedModalSearchCourse = Form.create()(ModalSearchCourse);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getTeachPlanList: bindActionCreators(getTeachPlanList, dispatch),
        getTeachPlanDetails: bindActionCreators(getTeachPlanDetails, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedModalSearchCourse);