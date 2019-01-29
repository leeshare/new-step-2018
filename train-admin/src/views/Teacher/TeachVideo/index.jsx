import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, Progress, DatePicker, Tooltip, Badge } from 'antd';
import { getCameraVideoRemarkList } from '@/actions/teach';
import { getDictionaryTitle, ellipsisText, getWeekTitle, convertTextToHtml } from '@/utils';
import TeachView from '../Components/teachView';
const FormItem = Form.Item;
class TeachVideo extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', TeacherID: (props.OrganizationID ? '' : props.user.uid), Teacher: '', beginDate: '', endDate: '', OrganizationID: props.OrganizationID || '' },
            data_list: [],
            data_list_total: 0,
            loading: false
        };
    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

    //table 输出列定义
    columns = [
        {
            title: `督学点评`,
            //自定义显示
            render: (text, record, index) => {
                return <Row gutter={24}>
                    <Col span={24}>
                        <h3>{record.TeacherInfos.map(A => A.name).join(',')} {record.TeachClassName} {record.BeginTime}</h3>
                    </Col>
                    <Col span={24} style={{marginTop:20}}>
                        <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(record.Remark) }}></span>
                    </Col>
                    <Col span={24} style={{marginTop:20}}>
                        <span>{record.UpdatedDate}</span>
                        <span style={{paddingLeft:10}}>
                            <a onClick={() => { this.onLookView('View', { teach_schedule_id: record.TeachScheduleID }) }}>{'查看详情'}</a>
                        </span>
                    </Col>
                </Row>
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
        if (this.props.OrganizationID) {
            children.push(
                <Col span={8}>
                    <FormItem
                        {...formItemLayout}
                        label="教师"
                    >
                        {getFieldDecorator('Teacher', { initialValue: this.state.pagingSearch.Teacher })(
                            <Input placeholder="教师账号或姓名" />
                        )}
                    </FormItem>
                </Col>
            );
        }
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
            this.props.getCameraVideoRemarkList(pagingSearch).payload.promise.then((response) => {
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
            case "View":
                block_content = <TeachView viewCallback={this.onViewCallback} {...this.state} />
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
const WrappedTeachVideo = Form.create()(TeachVideo);

const mapStateToProps = (state) => {
    let user = state.auth.user;
    return { user };
};

function mapDispatchToProps(dispatch) {
    return {
        getCameraVideoRemarkList: bindActionCreators(getCameraVideoRemarkList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachVideo);