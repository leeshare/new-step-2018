import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card } from 'antd';
import { getMyStudentList } from '@/actions/teach';
import { getDictionaryTitle, ellipsisText } from '@/utils';
const FormItem = Form.Item;
class TeacherStudent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', TeachClassID: '' },
            dic_ClassInfos: [],
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
            title: `头像`,
            width: 70,//可预知的数据长度，请设定固定宽度
            //自定义显示
            render: (text, record, index) => {
                return <img style={{ width: 50, borderRadius: '50%' }} src={record.UserInfo.icon} />
            }
        },
        {
            title: `学号`,
            width: 120,//可预知的数据长度，请设定固定宽度
            dataIndex: 'UserInfo.username'
        },
        {
            title: `姓名`,
            width: 120,//可预知的数据长度，请设定固定宽度
            dataIndex: 'UserInfo.name'
        },
        {
            title: '中文姓名',
            width: 100,//可预知的数据长度，请设定固定宽度
            dataIndex: 'UserInfo.chinese_name'
        },
        {
            title: '家长姓名',
            width: 120,//可预知的数据长度，请设定固定宽度
            dataIndex: 'UserInfo.parent_name'
        },
        {
            title: '联系电话',
            width: 120,//可预知的数据长度，请设定固定宽度
            dataIndex: 'UserInfo.parent_telephone'
        },
        {
            title: '就读学校',
            dataIndex: 'UserInfo.school'
        },
        {
            title: '所在年级',
            width: 100,//可预知的数据长度，请设定固定宽度
            dataIndex: 'UserInfo.grade'
        },
        {
            title: '今日积分',
            width: 120,//可预知的数据长度，请设定固定宽度
            dataIndex: 'UserOrderSeed'
        },
        {
            title: '所在班级',
            render: (text, record, index) => {
                let classNames = record.ClassInfos.map((item, index) => {
                    return getDictionaryTitle(this.state.dic_ClassInfos, item.TeachClassID);
                });
                return classNames.join(',');
            }
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
                <FormItem {...formItemLayout} label={'学员'} >
                    {getFieldDecorator('Keyword', { initialValue: this.state.pagingSearch.Keyword })(
                        <Input placeholder={'学号或姓名或中文名'} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="所在班级"
                >
                    {getFieldDecorator('TeachClassID', { initialValue: this.state.pagingSearch.TeachClassID })(
                        <Select>
                            <Option value="">全部</Option>
                            {this.state.dic_ClassInfos.map((item) => {
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
            this.props.getMyStudentList(pagingSearch).payload.promise.then((response) => {
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
    }
    //渲染，根据模式不同控制不同输出
    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
            case "Audit":
                block_content = <ChantView viewCallback={this.onViewCallback} {...this.state} />
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
const WrappedTeacherStudent = Form.create()(TeacherStudent);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getMyStudentList: bindActionCreators(getMyStudentList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeacherStudent);