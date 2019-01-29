import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, DatePicker } from 'antd';
import { getTeachClassScheduleList } from '@/actions/teach';
import { getDictionaryTitle, dataBind, dateFormat } from '@/utils';
import TeachView from '@/views/Teacher/Components/teachView';
const FormItem = Form.Item;
class TeachClassScheduleQuery extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', Status: "-1", PeriodType: '', TeachWay: '-1', TeachClassID: '', TeachClassRoomID: '', Teacher: '', BeginDate: '', EndDate: dateFormat(new Date(), 'yyyy-MM-dd'), DataOrder: 'BeginTime asc', OrganizationID: props.OrganizationID || '' },
            dic_TeachWays: [],
            dic_TeachClass: [],
            dic_PeriodTypes: [],
            dic_TeachClassRooms: [],//上课教室
            data_list: [],
            data_list_total: 0,
            loading: false
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
                return <a onClick={() => { this.onLookView('View', record) }}>{record.TeachClassName}{record.TeachContent}({record.TeachScheduleNoInfo})</a>
            }
        },
        {
            title: `所在教室`,
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_TeachClassRooms, record.TeachClassRoomID);
            }
        },
        {
            title: '上课时间',
            width: 160,//可预知的数据长度，请设定固定宽度
            dataIndex: 'BeginTime',
        },
        {
            title: '课时数',
            width: 100,//可预知的数据长度，请设定固定宽度
            dataIndex: 'Periods',
        },               
        {
            title: '授课教师',            
            render: (text, record, index) => {
                var teacherNames=record.TeacherInfo.map(A=>A.name);
                return teacherNames.join(',');
            }
        },
        {
            title: '授课类型',
            width: 140,
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_PeriodTypes, record.Periods = 1);
            }
        },
        {
            title: '授课方式',
            width: 140,
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_TeachWays, record.TeachWay);
            }
        },
        {
            title: '操作',
            width: 100,//可预知的数据长度，请设定固定宽度
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => { this.onLookView('View', record) }}>教学详情</a>
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
                    {getFieldDecorator('EndDate', { initialValue: dataBind(this.state.pagingSearch.EndDate, true) })(
                        <DatePicker />
                    )}
                </FormItem>
            </Col>
        );
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
                            {this.state.dic_TeachClass.map((item) => {
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
                <FormItem
                    {...formItemLayout}
                    label="授课类型"
                >
                    {getFieldDecorator('PeriodType', { initialValue: this.state.pagingSearch.PeriodType })(
                        <Select>
                            <Option value="">全部</Option>
                            {this.state.dic_PeriodTypes.map((item) => {
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
                    label="授课方式"
                >
                    {getFieldDecorator('TeachWay', { initialValue: this.state.pagingSearch.TeachWay })(
                        <Select>
                            <Option value="-1">全部</Option>
                            {this.state.dic_TeachWays.map((item) => {
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
        item.teach_schedule_id = item.TeachScheduleID,
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
    }


    //渲染，根据模式不同控制不同输出
    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "BatchCreate":
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
                block_content = <TeachView adminMode={this.props.adminMode} viewCallback={this.onViewCallback} {...this.state} />
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
const WrappedTeachClassScheduleQuery = Form.create()(TeachClassScheduleQuery);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getTeachClassScheduleList: bindActionCreators(getTeachClassScheduleList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachClassScheduleQuery);