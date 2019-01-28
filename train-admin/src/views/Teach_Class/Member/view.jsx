import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, AutoComplete, Pagination } from 'antd';
import moment from 'moment';
import ImageUpload from '@/components/ImageUpload';
import EditableUserTagGroup from '@/components/EditableUserTagGroup';
import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dataBind, dateFormat } from '@/utils';
import { smartInputSearchStudentUserList } from '@/actions/admin';
import { getTeachClassMemberList, saveTeachClassMemberInfo, deleteTeachClassMemberInfo } from '@/actions/teach';
const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class TeachClassMemberView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            loading: false,
            data_list: [],
            data_list_total: 0,
            dataModel: props.currentDataModel,//数据模型
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', Status: "-1", TeachClassID: props.currentDataModel.TeachClassID, BeginDate: '', EndDate: '' },
            dic_Status: [],
            editMode: 'MemberList',//MemberList,Create
            currentDataModel: null,
            ModalVisible: false,
        };
    }
    componentWillMount() {
        //首次进入搜索，加载服务端主题典项内容
        this.onSearch();
    }

    //table 输出列定义
    columns = [
        {
            title: `头像`,
            width: 70,//可预知的数据长度，请设定固定宽度
            //自定义显示
            render: (text, record, index) => {
                return <img style={{ width: 50, borderRadius: '50%' }} src={record.StudentInfo.icon} />
            }
        },
        {
            title: `学号`,
            width: 120,//可预知的数据长度，请设定固定宽度
            dataIndex: 'StudentInfo.username'
        },
        {
            title: `姓名`,
            width: 120,//可预知的数据长度，请设定固定宽度
            dataIndex: 'StudentInfo.name'
        },
        {
            title: '中文姓名',
            width: 100,//可预知的数据长度，请设定固定宽度
            dataIndex: 'StudentInfo.chinese_name'
        },
        {
            title: '入班日期',
            width: 100,//可预知的数据长度，请设定固定宽度
            dataIndex: 'JoinDate'
        },
        {
            title: '退班日期',
            width: 100,//可预知的数据长度，请设定固定宽度
            dataIndex: 'QuitDate'
        },
        {
            title: '状态',
            width: 80,
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.Status);
            }
        },
        {
            title: '操作',
            width: 120,//可预知的数据长度，请设定固定宽度
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => { this.onLookView('Edit', record) }}>修改</a>
                    <span className="ant-divider" />
                    <a onClick={() => { this.onLookView('Quit', record) }}>退班</a>
                    <span className="ant-divider" />
                    <a onClick={() => { this.onDelete(record) }}>删除</a>
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
            <Col span={12}>
                <FormItem {...formItemLayout} label={'学员姓名'} >
                    {getFieldDecorator('Keyword', { initialValue: this.state.pagingSearch.Keyword })(
                        <Input placeholder={'学号、姓名、中文名模糊查找'} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={12}>
                <FormItem
                    {...formItemLayout}
                    label="状态"
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
        children.push(
            <Col span={12}>
                <FormItem {...formItemLayout} label={'（入班日期）起'} >
                    {getFieldDecorator('BeginDate', { initialValue: this.state.pagingSearch.BeginDate })(
                        <DatePicker />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={12}>
                <FormItem
                    {...formItemLayout}
                    label="（入班日期）止"
                >
                    {getFieldDecorator('EndDate', { initialValue: this.state.pagingSearch.EndDate })(
                        <DatePicker />
                    )}
                </FormItem>
            </Col>
        );

        let filedCount = this.state.expand ? children.length : 2;
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
            this.props.getTeachClassMemberList(pagingSearch).payload.promise.then((response) => {
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
    onCancel = () => {
        if (this.state.editMode == "Create") {
            this.setState({ editMode: 'MemberList' });
        }
        else {
            this.props.viewCallback();
        }
    }
    onModalCancel = () => {
        this.setState({ ModalVisible: false });
        this.onLookView('MemberList', null);
    }
    onSubmit = () => {
        if (this.state.editMode == "Create" || this.state.editMode == "Edit" || this.state.editMode == "Quit") {
            //表单验证后，合并数据提交
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    //保存班级学员F
                    this.props.saveTeachClassMemberInfo({ ...this.state.currentDataModel, ...values, TeachClassID: this.state.dataModel.TeachClassID }).payload.promise.then((response) => {
                        //刷新成员列表
                        this.onSearch();
                        this.onModalCancel();
                    })
                }
            });
        }
    }
    onDelete = (item) => {
        Modal.confirm({
            title: '你确认要删除该学生吗?',
            content: '如果已安排上课，则不能被删除！',
            onOk: () => {
                //保存班级学员
                this.props.deleteTeachClassMemberInfo(item).payload.promise.then((response) => {
                    //刷新成员列表
                    this.onSearch();
                });
            },
            onCancel: () => {
                console.log('Cancel');
            },
        })
    }

    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
        if (op == 'Create' || op == "Edit" || op == "Quit") {
            this.setState({ ModalVisible: true })
        }
    };
    //标题
    getTitle() {
        return `管理班级学员`;
    }

    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.state.editMode) {
            case "Create":
                block_content = <Modal key={this.state.currentDataModel.key} width={800}
                    title="添加班级学员"
                    wrapClassName="vertical-center-modal"
                    visible={this.state.ModalVisible}
                    onCancel={this.onModalCancel}
                    onOk={this.onSubmit}
                >
                    <div className="form-edit">
                        <Form>
                            <FormItem
                                {...formItemLayout}
                                label="班级学员"
                                extra="可一次添加多个"
                            >
                                {getFieldDecorator('FormStudent', {
                                    initialValue: [],
                                    rules: [{
                                        required: true, message: '至少设置一个学员!',
                                    }]
                                })(
                                    <EditableUserTagGroup maxTags={100} smartInputSearchUserList={this.props.smartInputSearchStudentUserList} searchOptions={{ excludeTeachClassID: this.state.dataModel.TeachClassID }} />
                                    )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="入班日期"
                                extra="根据学生实际上课情况录入，教师可以点评"
                            >
                                {getFieldDecorator('JoinDate', {
                                    initialValue: dateFormat(new Date(), 'yyyy-MM-dd'),
                                    rules: [{
                                        required: true, message: '请设置入班日期'
                                    }, {
                                        pattern: /^(\d{4})\-(\d{2})\-(\d{2})$/, message: '日期格式有误,请参考:2017-01-01'
                                    }]
                                })(
                                    <Input placeholder="请设置入班日期" />
                                    )}
                            </FormItem>
                        </Form>
                    </div>
                </Modal>
                break;
            case "Quit":
                block_content = <Modal key={this.state.currentDataModel.key} width={500}
                    title="退班"
                    wrapClassName="vertical-center-modal"
                    visible={this.state.ModalVisible}
                    onCancel={this.onModalCancel}
                    onOk={this.onSubmit}
                >
                    <div className="form-edit">
                        <Form>
                            <FormItem
                                {...formItemLayout}
                                label="退班日期"
                            >
                                {getFieldDecorator('QuitDate', {
                                    initialValue: dataBind(this.state.currentDataModel.QuitDate, true),
                                    rules: [{
                                        required: true, message: '请设置退班日期!',
                                    }]
                                })(
                                    <DatePicker
                                        format="YYYY-MM-DD"
                                        placeholder="请设置退班日期"
                                    />
                                    )}
                            </FormItem>
                        </Form>
                    </div>
                </Modal>
                break;
            case "Edit":
                block_content = <Modal key={this.state.currentDataModel.key} width={500}
                    title="修改"
                    wrapClassName="vertical-center-modal"
                    visible={this.state.ModalVisible}
                    onCancel={this.onModalCancel}
                    onOk={this.onSubmit}
                >
                    <div className="form-edit">
                        <Form>
                            <FormItem
                                {...formItemLayout}
                                label="入班日期"
                            >
                                {getFieldDecorator('JoinDate', {
                                    initialValue: this.state.currentDataModel.JoinDate,
                                    rules: [{
                                        required: true, message: '请设置入班日期'
                                    }, {
                                        pattern: /^(\d{4})\-(\d{2})\-(\d{2})$/, message: '日期格式有误,请参考:2017-01-01'
                                    }]
                                })(
                                    <Input placeholder="请设置入班日期" />
                                    )}
                            </FormItem>
                        </Form>
                    </div>
                </Modal>
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        return (
            <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
                {block_editModeView}
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
                                <Button style={{ marginLeft: 8 }} onClick={() => { this.onLookView('Create', {}) }} icon="plus">添加班级学员</Button>
                                {<a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                                    更多 <Icon type={this.state.expand ? 'up' : 'down'} />
                                </a>}
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
            </Card>
        );
    }
}

const WrappedTeachClassMemberView = Form.create()(TeachClassMemberView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        smartInputSearchStudentUserList: bindActionCreators(smartInputSearchStudentUserList, dispatch),
        getTeachClassMemberList: bindActionCreators(getTeachClassMemberList, dispatch),
        saveTeachClassMemberInfo: bindActionCreators(saveTeachClassMemberInfo, dispatch),
        deleteTeachClassMemberInfo: bindActionCreators(deleteTeachClassMemberInfo, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachClassMemberView);