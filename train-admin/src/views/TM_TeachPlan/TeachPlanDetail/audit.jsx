import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card } from 'antd';
import { getTeachPlanDetails, batchAddTeachPlanDetail, deleteTeachPlanDetail, saveTeachPlanDetailInfo } from '@/actions/tm';
import { getDictionaryTitle, getDictionaryTitleByCode, convertTextToHtml } from '@/utils';
import TeachPlanDetailView from './view';
const FormItem = Form.Item;

import ModalPlayer from '@/components/ModalPlayer';
import CourseView from '@/views/TM_Course/View/lectures';


class TeachPlanDetailAudit extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showChooseCourse: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', TeachPlanID: props.TeachPlanID, IsStandand: '1' },
            dic_TeachPlanTypes: [],
            data_list: [],
            data_list_total: 0,
            loading: false,
            DeleteSelectedCourseIDs: [],//删除课次安排ID列表
            SaveSelectedCourseIDs: [],//添加课次安排ID列表
        };

    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

    //table 输出列定义
    columns = [
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
                <FormItem {...formItemLayout} label={'课次安排'} >
                    {getFieldDecorator('Keyword', { initialValue: '' })(
                        <Input placeholder="课次安排" />
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
    onDelete = (dataModel) => {
        Modal.confirm({
            title: '你确认要删除该课次安排吗?',
            content: '',
            onOk: () => {
                //提交
                this.props.deleteTeachPlanDetail(dataModel).payload.promise.then((response) => {
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
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
    }
    //视图回调
    onViewCallback = (dataModel) => {
        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case "Create":
                case "Edit": //提交                                
                    this.props.saveTeachPlanDetailInfo(dataModel).payload.promise.then((response) => {
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
            }
        }
    }

    onCancelPlay = () => {
        this.setState({ currentMedia: null, showPlayMedia: false });
    }

    //渲染，根据模式不同控制不同输出
    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
                let props = { ...this.state, currentDataModel: this.state.currentDataModel };
                block_content = <TeachPlanDetailView viewCallback={this.onViewCallback} {...props} />
                break;
            case "JiaoxueCourseView":
                block_content = <CourseView viewCallback={this.onViewCallback} {...{ ...this.state, editMode: 'View' }} />
                break;
            case "Manage":
            default:
                block_content = (
                    <div>{
                        this.state.currentMedia ? <ModalPlayer lecture_info={this.state.currentMedia} visible={this.state.showPlayMedia} onCancel={this.onCancelPlay} /> : ''
                    }                        
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
const WrappedTeachPlanDetailAudit = Form.create()(TeachPlanDetailAudit);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getTeachPlanDetails: bindActionCreators(getTeachPlanDetails, dispatch),
        batchAddTeachPlanDetail: bindActionCreators(batchAddTeachPlanDetail, dispatch),
        saveTeachPlanDetailInfo: bindActionCreators(saveTeachPlanDetailInfo, dispatch),
        deleteTeachPlanDetail: bindActionCreators(deleteTeachPlanDetail, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachPlanDetailAudit);