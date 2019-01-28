//神墨学堂轮播图管理
//2019-01-04

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
import { getRotationList,saveRotation,deleteRotation } from '@/actions/other';
//业务数据视图（增、删、改、查)
import RotationView from '../RotationView/index.js';
class XuetangRotationManage extends React.Component {
    constructor(props) {
        super(props)

        //组件状态初始化过程
        this.state = {
            appType: 2,
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 999, Keyword: '', Status: "-1" },
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
            title: YSI18n.get('图片'),
            width: 200,//可预知的数据长度，请设定固定宽度
            render: (text, record) => (
                <div className='img_wrap'>
                    <img style={{ width: '100%', height: '100%' }} className='img_item' src={record.ImagePath} />
                </div>
            ),
        },
        {
            title: YSI18n.get('来源'),
            width: 200,//可预知的数据长度，请设定固定宽度
            dataIndex: 'SourceType',
            render: (text, record, index) => {
                return record.SourceType==1?'资讯':record.SourceType==2?'活动':'外链';
            }
        },
        {
            title: YSI18n.get('顺序号'),
            width: 100,//可预知的数据长度，请设定固定宽度
            dataIndex: 'OrderNum'
        },
        {
            title: YSI18n.get('Status'),
            width: 100,
            render: (text, record, index) => {
                return record.Status==1?'启用':'停用';
            }
        },
        {
            title: YSI18n.get('Action'),
            width: 100,//可预知的数据长度，请设定固定宽度
            render: (text, record) => (
                <ButtonGroup divider>
                    <a onClick={() => { this.onLookView('Edit', record) }}>{YSI18n.get('Edit')}</a>
                    <a onClick={() => { this.onLookView('Delete', record) }}>{YSI18n.get('Delete')}</a>
                </ButtonGroup>
            ),
        }];

    fetch = (pagingSearch) => {
        this.setState({ loading: true })
        this.props.getRotationList({type:2, appType: this.state.appType}).payload.promise.then((response) => {
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
                    let entity={
                        RotationInfoID:dataModel.RotationInfoID,
                        SourceType:dataModel.SourceType,
                        ImagePath:dataModel.FormImagePaths_Temp[0].value,
                        SourceID:dataModel.contentInfo.id,
                        SourceTitle:dataModel.SourceType!=3?dataModel.contentInfo.title:'',
                        Status:dataModel.Status,
                        OrderNum:dataModel.OrderNum,
                        AppType: 2,
                    }
                    this.props.saveRotation(entity).payload.promise.then((response) => {
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
                    this.props.deleteRotation({id:dataModel.RotationInfoID}).payload.promise.then((response) => {
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
                block_content = <RotationView viewCallback={this.onViewCallback} {...this.state} />
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
                                <Col span={24} style={{ textAlign: 'right' }}>
                                    <ButtonGroup>
                                        <Button onClick={() => { this.onLookView('Create', {}) }} icon="plus">{YSI18n.get('轮播图')}</Button>
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
                        </div>
                    </div>
                );
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedDictionaryManage = Form.create()(XuetangRotationManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //各业务接口
        getRotationList: bindActionCreators(getRotationList, dispatch),
        saveRotation: bindActionCreators(saveRotation, dispatch),
        deleteRotation: bindActionCreators(deleteRotation, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDictionaryManage);
