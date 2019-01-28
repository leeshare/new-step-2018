//文件管理权限

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
import { fileAuthListQuery, fileAuthSave, fileAuthDelete } from '@/actions/file';
//业务数据视图（增、删、改、查)
import AuthEdit from './auth_edit';

class AuthManage extends React.Component {
    constructor(props) {
        super(props)

        //组件状态初始化过程
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 999, Keyword: '', GroupName: '', Status: "-1" },
            data_list: [],
            loading: false
        };

        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
    }

    componentWillMount() {
         //载入需要的字典项
         this.loadBizDictionary(['dic_Status']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

    //table 输出列定义
    columns = [
        {
            title: YSI18n.get('目录名称'),

            //dataIndex: 'Folder.'
            render: (text, record) => {
              return <span><span  className='icon_folder' />{record.Folder.FolderName}</span>
            }
        },
        {
            title: YSI18n.get('负责人'),
            width: 100,//可预知的数据长度，请设定固定宽度
            //dataIndex: 'OrderNum',
            render: (text, record) => {
              return <span>{record.AuthUserList.length}人</span>
            }
        },
        {
            title: YSI18n.get('创建日期'),
            width: 180,
            render: (text, record, index) => {
                //return getDictionaryTitle(this.state.dic_Status, record.Status);
                return <span>{record.updatedDateStr}</span>
            }
        },
        {
            title: YSI18n.get('大小'),
            width: 100,
            render: (text, record, index) => {
                //return getDictionaryTitle(this.state.dic_Status, record.Status);
                return <span>-</span>
            }
        },
        {
            title: YSI18n.get('排序'),
            width: 100,
            dataIndex: 'order_num'
        },
        {
            title: YSI18n.get('Action'),
            width: 140,//可预知的数据长度，请设定固定宽度
            render: (text, record) => (
                <ButtonGroup >
                    <a onClick={() => { this.onLookView('Edit', record) }}><Icon type="edit" className='icon_button' /></a>
                    <a onClick={() => { this.onLookView('Delete', record) }}><Icon type="delete" className='icon_button' /></a>
                </ButtonGroup>
            ),
        }];

    fetch = (pagingSearch) => {

        this.setState({ loading: true })
        this.props.fileAuthListQuery().payload.promise.then((response) => {
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
                    this.props.fileAuthSave(dataModel).payload.promise.then((response) => {
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
                    this.props.fileAuthDelete({folderId: this.state.currentDataModel.Folder.FolderID}).payload.promise.then((response) => {
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
                block_content = <AuthEdit viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                block_content = (
                    <div >
                        <Form
                            className="search-form"
                        >
                            {/* <Row gutter={40}>
                                {this.getFields()}
                            </Row> */}
                            <Row>
                                <Col span={24} style={{ textAlign: 'left' }}>
                                    <ButtonGroup>
                                        <Button type='primary' onClick={() => { this.onLookView('Create', {Folder: {IsToOrgRead: 0}, AuthUserList: []}) }} ghost>{YSI18n.get('创建目录')}</Button>
                                    </ButtonGroup>
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

                            {/* <div className="search-paging">
                                <Row>
                                    <Col span={8}>
                                    </Col>
                                    <Col span={16} className={'search-paging-control'}>
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
                            </div> */}
                        </div>
                    </div>
                );
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedAuthManage = Form.create()(AuthManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        fileAuthListQuery: bindActionCreators(fileAuthListQuery, dispatch),
        fileAuthSave: bindActionCreators(fileAuthSave, dispatch),
        fileAuthDelete: bindActionCreators(fileAuthDelete, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAuthManage);
