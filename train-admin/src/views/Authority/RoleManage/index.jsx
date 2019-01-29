//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card } from 'antd';
const FormItem = Form.Item;
import ButtonGroup from '@/components/ButtonGroup';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onSearchToggle, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';
//工具类方法引入
import { YSI18n, getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { getRoleList, saveRoleInfo, deleteRoleInfo } from '@/actions/admin';
//业务数据视图（增、删、改、查)
import RoleView from '../RoleView';

class RoleManage extends React.Component {

    constructor(props) {
        super(props)
        //组件状态初始化过程
        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 20, Keyword: '', Status: -1 },
            data_list: [],
            data_list_total: 0,
            loading: false
        };
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onSearchToggle = onSearchToggle.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
    }

    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    //table 输出列定义
    columns = [{
        title: YSI18n.get('RoleName'),
        width: 200,//可预知的数据长度，请设定固定宽度
        //自定义显示
        render: (text, record, index) => {
            return <a onClick={() => { this.onLookView('View', record) }}>{record.RoleName}</a>
        }
    },
    {
        title: YSI18n.get('Description'),
        dataIndex: 'Description'
    },
    {
        title: YSI18n.get('Status'),
        width: 80,//可预知的数据长度，请设定固定宽度
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.dic_Status, record.Status);
        }
    }, {
        title: YSI18n.get('Action'),
        width: 300,//可预知的数据长度，请设定固定宽度
        render: (text, record) => (
            <ButtonGroup divider>
                <a onClick={() => { this.onLookView('Edit', record) }}>{YSI18n.get('Edit')}</a>
                <a onClick={() => { this.onLookView('Delete', record) }}>{YSI18n.get('Delete')}</a>
            </ButtonGroup>
        ),
    }];

    //搜索条件
    getFields() {
        const count = this.state.expand ? 10 : 6;
        const { getFieldDecorator } = this.props.form;
        const children = [];
        children.push(
            <Col span={8}>
                <FormItem {...searchFormItemLayout} label={YSI18n.get('RoleName')} >
                    {getFieldDecorator('Keyword', { initialValue: '' })(
                        <Input placeholder={YSI18n.get('RoleName')} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...searchFormItemLayout}
                    label={YSI18n.get('Status')}
                >
                    {getFieldDecorator('Status', { initialValue: '-1' })(
                        <Select>
                            <Option value="-1">{YSI18n.get('All')}</Option>
                            {this.state.dic_Status.map((item) => {
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
    fetch = (pagingSearch) => {
        this.props.getRoleList(pagingSearch).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ pagingSearch, ...data, loading: false })
            }
        })
    }
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
                    this.props.saveRoleInfo(dataModel).payload.promise.then((response) => {
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
                    this.props.deleteRoleInfo(this.state.currentDataModel.RoleID).payload.promise.then((response) => {
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
                block_content = <RoleView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                block_content = (
                    <div>
                        <Form
                            className="search-form"
                        >
                            <Row gutter={40}>{this.getFields()}</Row>
                            <Row>
                                <Col span={24} style={{ textAlign: 'right' }}>
                                    <ButtonGroup>
                                        <Button type="primary" icon="search" onClick={this.onSearch}>{YSI18n.get('Search')}</Button>
                                        <Button onClick={() => { this.onLookView('Create', { ApplicationID: this.state.defaultApplicationID, Status: 1, RoleName: '', Description: '' }) }} icon="plus">{YSI18n.get('Role')}</Button>
                                    </ButtonGroup>
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
                                    <Col span={14}>
                                    </Col>
                                    <Col span={10} className={'search-paging-control'}>
                                        <Pagination showSizeChanger
                                            current={this.state.pagingSearch.PageIndex}
                                            defaultPageSize={this.state.pagingSearch.PageSize}
                                            onShowSizeChange={this.onShowSizeChange}
                                            onChange={this.onPageIndexChange}
                                            showTotal={(total) => {
                                                let totalInfo = YSI18n.get('Total');
                                                return totalInfo.replace('${total}', total);
                                            }}
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
const WrappedRoleManage = Form.create()(RoleManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),

        //各业务接口
        getRoleList: bindActionCreators(getRoleList, dispatch),
        saveRoleInfo: bindActionCreators(saveRoleInfo, dispatch),
        deleteRoleInfo: bindActionCreators(deleteRoleInfo, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedRoleManage);