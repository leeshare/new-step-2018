import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, Alert } from 'antd';
import { getOrganizationTeacherList, getUserInfoByUserName, saveOrganizationTeacherInfo,saveOrganizationTeacherAuthInfo, switchOrganizationUserInfoStatus, deleteOrganizationUserInfo, resetUserPassword } from '@/actions/admin';
import { getDictionaryTitle, ellipsisText, dataBind } from '@/utils';
import TeacherView from '../View';
const FormItem = Form.Item;
class TeacherCourseAuthManage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', OrganizationID: '', OrganizationTreeSearchMode: true, Status: '-1', UserType: 2, UserImageStatus: '-1', CourseSpecialty: '', CourseLevel: '' },
            dic_UserTypes: [],
            dic_Status: [],
            dic_SexTypes: [],
            dic_CourseSpecialtys: [],
            dic_BranchOrganizations: [],
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
            title: `头像`,
            width: 70,
            //自定义显示
            render: (text, record, index) => {
                return <img src={record.Icon} style={{ width: 50, borderRadius: '50%' }} />
            }
        },
        {
            title: `账号`,
            width: 200,
            //自定义显示
            render: (text, record, index) => {
                return <a onClick={() => { this.onLookView('View', record) }}>{record.UserName}</a>
            }
        },
        {
            title: `姓名`,
            width: 120,
            dataIndex: 'RealName'
        }
        , {
            title: '性别',
            width: 80,
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_SexTypes, record.Sex);
            }
        },
        {
            title: '联系方式',
            width: 200,
            dataIndex: 'ContactTelephone'
        },
        {
            title: `已认证课程`,
            //自定义显示
            render: (text, record, index) => {
                var CourseSpecialtyTitles = [];
                record.AuthCourseList.map((A) => {
                    var courseSpecialtyFind = this.state.dic_CourseSpecialtys.find(B => B.value == A.CourseSpecialty) || { title: '未知课程' };
                    if (!CourseSpecialtyTitles.find(B => B == courseSpecialtyFind.title)) {
                        CourseSpecialtyTitles.push(courseSpecialtyFind.title);
                    }
                })
                return CourseSpecialtyTitles.join(' ');
            }
        },
        {
            title: '操作',
            key: 'action',
            width: 100,
            render: (text, record) => (
                <span>
                    <a onClick={() => { this.onLookView('CourseAuth', record) }}>管理认证</a>
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
        //获取课程对应的等级
        var find = this.state.dic_CourseSpecialtys.find(A => A.value == this.state.pagingSearch.CourseSpecialty);
        let courseLevels = find != null ? find.CourseLevels : [];
        children.push(
            <Col span={8}>
                <FormItem {...formItemLayout} label={'教师'} >
                    {getFieldDecorator('Keyword', { initialValue: this.state.pagingSearch.Keyword })(
                        <Input placeholder={'账号、姓名模糊搜索'} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="学校"
                >
                    {getFieldDecorator('OrganizationID', { initialValue: this.state.pagingSearch.OrganizationID })(
                        <Select>
                            <Option value="">全部</Option>
                            {this.state.dic_BranchOrganizations.map((item) => {
                                return <Option value={item.value}>{item.title}</Option>
                            })}
                        </Select>
                    )}
                </FormItem>
            </Col>
        );
        // children.push(
        //     <Col span={8}>
        //         <FormItem
        //             {...formItemLayout}
        //             label="照片状态"
        //         >
        //             {getFieldDecorator('UserImageStatus', { initialValue: this.state.pagingSearch.UserImageStatus })(
        //                 <Select>
        //                     <Option value="-1">全部</Option>
        //                     <Option value="1">已上传</Option>
        //                     <Option value="0">未上传</Option>
        //                 </Select>
        //             )}
        //         </FormItem>
        //     </Col>
        // );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="认证课程"
                >
                    {getFieldDecorator('CourseSpecialty', { initialValue: this.state.pagingSearch.CourseSpecialty })(
                        <Select onChange={(value) => {
                            this.state.pagingSearch.CourseSpecialty = value;
                            this.setState({ pagingSearch: this.state.pagingSearch })
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
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="课程级别"
                >
                    {getFieldDecorator('CourseLevel', { initialValue: this.state.pagingSearch.CourseLevel })(
                        <Select>
                            <Option value="">全部</Option>
                            {courseLevels.map((item) => {
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
            this.props.getOrganizationTeacherList(pagingSearch).payload.promise.then((response) => {
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
                    this.props.saveOrganizationTeacherInfo(dataModel).payload.promise.then((response) => {
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
                case "CourseAuth": 
                    console.log(dataModel);
                    this.props.saveOrganizationTeacherAuthInfo(dataModel).payload.promise.then((response) => {
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

    //渲染，根据模式不同控制不同输出
    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
            case "CourseAuth":
                block_content = <TeacherView viewCallback={this.onViewCallback} {...this.state} getUserInfoByUserName={this.props.getUserInfoByUserName} />
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
                                    {/* <Button style={{ marginLeft: 8 }} onClick={() => { this.onLookView('Create', {}) }} icon="plus">新增教师</Button> */}
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
const WrappedStudentManage = Form.create()(TeacherCourseAuthManage);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getOrganizationTeacherList: bindActionCreators(getOrganizationTeacherList, dispatch),
        saveOrganizationTeacherInfo: bindActionCreators(saveOrganizationTeacherInfo, dispatch),
        saveOrganizationTeacherAuthInfo: bindActionCreators(saveOrganizationTeacherAuthInfo, dispatch),
        deleteOrganizationUserInfo: bindActionCreators(deleteOrganizationUserInfo, dispatch),
        switchOrganizationUserInfoStatus: bindActionCreators(switchOrganizationUserInfoStatus, dispatch),
        resetUserPassword: bindActionCreators(resetUserPassword, dispatch),
        getUserInfoByUserName: bindActionCreators(getUserInfoByUserName, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedStudentManage);