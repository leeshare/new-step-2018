import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, DatePicker } from 'antd';
import { getTeachClassScheduleList, saveTeachClassScheduleInfo, batchSaveTeachClassScheduleInfo, deleteTeachClassScheduleInfo } from '@/actions/teach';
import { getDictionaryTitle, dataBind } from '@/utils';
import { smartInputSearchTeacherList } from '@/actions/admin';
import TeachClassScheduleView from '../View';
const FormItem = Form.Item;
class TeachClassScheduleExperience extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', Status: "-1", PeriodType: '04', TeachClassID: '', TeachClassRoomID: '', Teacher: '', BeginDate: '', EndDate: '' },
            dic_TeachWays: [],
            dic_TeachClass: [],
            dic_Timezones: [],
            dic_TeachClassRooms: [],//上课教室
            data_list: [],
            data_list_total: 0,
            loading: false,
            UserSelecteds: [],//列表选择
        };
    }

    componentWillMount() {
        //首次进入搜索，加载服务端主题典项内容
        this.onSearch();
    }

    //table 输出列定义
    columns = [
        {
            title: `授课班`,
            //自定义显示
            render: (text, record, index) => {
                return `${record.TeachClassName}(${record.TeachScheduleNoInfo})`
            }
        },
        {
            title: `所在教室`,
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_TeachClassRooms, record.TeachClassRoomID);
            }
        },
        {
            title: '上课时区',
            render: (text, record, index) => {
                return `${getDictionaryTitle(this.state.dic_Timezones, record.Timezone, '当地时间')}`;
            }
        },
        {
            title: '上课时间',
            width: 160,//可预知的数据长度，请设定固定宽度
            dataIndex: 'BeginTime',
        },
        // {
        //     title: '课时数',
        //     width: 100,//可预知的数据长度，请设定固定宽度
        //     dataIndex: 'Periods',
        // },
        {
            title: '上课教师',
            render: (text, record, index) => {
                var teacherNames = record.TeacherInfo.map(A => A.name);
                return teacherNames.join(',');
            }
        },
        {
            title: '操作',
            width: 100,//可预知的数据长度，请设定固定宽度
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => { this.onLookView('Edit', record) }}>编辑</a>
                    <span className="ant-divider" />
                    {record.AuditStatus == 3 ? <a disabled>删除</a> : <a onClick={() => { this.onLookView('Delete', record) }}>删除</a>}
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
                <FormItem
                    {...formItemLayout}
                    label="授课班"
                >
                    {getFieldDecorator('TeachClassID', { initialValue: this.state.pagingSearch.TeachClassID })(
                        <Select
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                            <Option value="">全部</Option>
                            {this.state.dic_TeachClass.filter(A => A.status == 1).map((item) => {
                                return <Option value={item.value}>{item.title}</Option>
                            })}
                        </Select>
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem {...formItemLayout} label={'教师'} >
                    {getFieldDecorator('Teacher', { initialValue: this.state.pagingSearch.Teacher })(
                        <Input placeholder={'教师名称或账号模糊查找'} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="所在教室"
                >
                    {getFieldDecorator('TeachClassRoomID', { initialValue: this.state.pagingSearch.TeachClassRoomID })(
                        <Select>
                            <Option value="">全部</Option>
                            {this.state.dic_TeachClassRooms.map((item) => {
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
            this.props.getTeachClassScheduleList(pagingSearch).payload.promise.then((response) => {
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
                case "BatchCreate":
                    this.props.batchSaveTeachClassScheduleInfo(dataModel).payload.promise.then((response) => {
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
                case "BatchUpdate":
                    var batchUploads = this.state.UserSelecteds.map((A) => {
                        var find = this.state.data_list.find(B => B.TeachScheduleID == A);
                        return { ...find, FormTeacher: dataModel.FormTeacher, TeachClassRoomID: dataModel.TeachClassRoomID };
                    });
                    this.props.saveTeachClassScheduleInfo({ ClassScheduleInfos: batchUploads }).payload.promise.then((response) => {
                        let data = response.payload.data;
                        this.setState({ UserSelecteds: [] });
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
                case "Create":
                case "Edit": //提交
                    this.props.saveTeachClassScheduleInfo({ ClassScheduleInfos: [dataModel] }).payload.promise.then((response) => {
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
                    this.props.deleteTeachClassScheduleInfo({ ClassScheduleInfos: [this.state.currentDataModel] }).payload.promise.then((response) => {
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
    onDeleteSelected = () => {
        Modal.confirm({
            title: '你确认要删除选中的授课安排吗?',
            content: '如果已完成上课，则不能被删除！',
            onOk: () => {
                //提交
                var batchDeleteIDs = this.state.UserSelecteds.map((A) => { return { TeachScheduleID: A } });
                this.props.deleteTeachClassScheduleInfo({ ClassScheduleInfos: batchDeleteIDs }).payload.promise.then((response) => {
                    let data = response.payload.data;
                    this.setState({ UserSelecteds: [] });
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        this.onSearch();
                    }
                })
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
    }
    onUpdateSelected = () => {
        //默认取选择的第一个
        var find = this.state.data_list.find(A => A.TeachScheduleID == this.state.UserSelecteds[0]);
        this.onLookView('BatchUpdate', find);
    }
    isUserSelectedOneTeacher = () => {
        var teacherIDs = this.state.UserSelecteds.map((A) => {
            var find = this.state.data_list.find(B => B.TeachScheduleID == A);
            return find.TeacherInfo.map(A => A.uid).join(',');
        });
        return teacherIDs.find(A => A != teacherIDs[0]) == null;
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
            case "BatchCreate":
            case "BatchUpdate":
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
                block_content = <TeachClassScheduleView viewCallback={this.onViewCallback} {...this.state} />
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
                                    {/* <Button style={{ marginLeft: 8 }} onClick={() => { this.onLookView('BatchCreate', { PeriodType: this.state.pagingSearch.PeriodType }) }} icon="plus-square-o">批量班课授课安排</Button>
                                    <Button style={{ marginLeft: 8 }} onClick={() => { this.onLookView('Create', { PeriodType: this.state.pagingSearch.PeriodType }) }} icon="plus">班课授课安排</Button> */}
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
                                        {this.state.UserSelecteds.length > 0 ? <Button icon="delete" onClick={this.onDeleteSelected}>{'批量删除'}</Button> : <Button icon="delete" disabled>{'批量删除'}</Button>}
                                        {/* {this.state.UserSelecteds.length > 0 && this.isUserSelectedOneTeacher() ? <Button icon="edit" style={{ marginLeft: 20 }} onClick={this.onUpdateSelected}>{'批量修改'}</Button> : <Button style={{ marginLeft: 20 }} icon="edit" disabled>{'批量修改'}</Button>} */}
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
const WrappedTeachClassScheduleCourseClass = Form.create()(TeachClassScheduleExperience);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getTeachClassScheduleList: bindActionCreators(getTeachClassScheduleList, dispatch),
        saveTeachClassScheduleInfo: bindActionCreators(saveTeachClassScheduleInfo, dispatch),
        batchSaveTeachClassScheduleInfo: bindActionCreators(batchSaveTeachClassScheduleInfo, dispatch),
        deleteTeachClassScheduleInfo: bindActionCreators(deleteTeachClassScheduleInfo, dispatch),
        smartInputSearchTeacherList: bindActionCreators(smartInputSearchTeacherList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachClassScheduleCourseClass);