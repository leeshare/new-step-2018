import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, Tabs } from 'antd';
const TabPane = Tabs.TabPane;
import ButtonGroup from '@/components/ButtonGroup';

//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onSearchToggle, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';
//工具类方法引入
import { YSI18n, getDictionaryTitle, timestampToTime } from '@/utils';
//业务数据视图（增、删、改、查)
import InfoView from '../InfoView';
//业务数据视图（增、删、改、查)
import VideoInfoView from '../VideoInfoView';
//业务接口方法引入
import { getzixun_ZixunHomeGeneral, zixun_ChannelList, zixun_Savezixun, zixun_DeleteZixun } from '@/actions/zixun';
import './index.less';

class HomeIndex extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 20, Keyword: '', Status: -1 },
            data_list: [],
            data_list_total: 0,
            yesterday: {},
            all: {},
            loading: false,
            channel_data_List: [],
        };
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onSearchToggle = onSearchToggle.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        //this.onSearch();
        this.getzixunHomeGeneral();
        this.getChannelList();
    }
    getzixunHomeGeneral() {
        this.props.getzixun_ZixunHomeGeneral().payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ ...data, loading: false })
            }
        })
    }
    getChannelList() {
        this.props.zixun_ChannelList({ isZb: 1 }).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ channel_data_List: data.data_list, loading: false })
            }
        })
    }
    //处理搜索事件
    fetch = () => {
        this.props.getzixun_ZixunHomeGeneral().payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ ...data, loading: false })
            }
        })
    }
    //table 输出列定义
    columns = [{
        title: YSI18n.get('草稿'),
        width: 200,//可预知的数据长度，请设定固定宽度
        //自定义显示
        render: (text, record, index) => {
            let img_view = record.covers.map(a => {
                return (<div className='img_wrap'><img src={a.coverPath} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} /></div>)
            })
            let publist_view = record.status == 1 ? <div>
                {'已发布 ' + record.publishDate}
            </div> : null;
            let count_view = record.status == 1 ? <div><span className='iconitem'><Icon type="user" className='icon' />{record.readCount}</span> <span className='iconitem'><Icon type="heart" className='icon' />{record.collectCount}</span> <span className='iconitem'><Icon type="message" className='icon' />{record.evaluationCount}</span></div> : null;
            let modify_view = record.status == 0 ? <ButtonGroup divider>
                <a onClick={() => { this.onLookView('Edit', record) }}><Icon type="edit" className='icon' />{YSI18n.get('Edit')}</a>
                <a onClick={() => { this.onLookView('Delete', record) }}><Icon type="delete" className='icon' />{YSI18n.get('Delete')}</a>
            </ButtonGroup> : null;
            return <Row>
                <Col span={12}>
                    <a onClick={() => { this.onLookView('View', record) }} className='fontTitle'>{record.title}</a>
                    {publist_view}
                    {count_view}
                    {modify_view}
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                    {img_view}
                </Col>
            </Row>
        }
    }];
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
                    let Covers = dataModel.FormImagePaths_Temp.filter(item => item.value != '').map(item => { return { CoverPath: item.value } });
                    let entity = {
                        Information: {
                            InformationID: dataModel.id,
                            InfoType: dataModel.infoType,
                            Title: dataModel.title,
                            Content: dataModel.content,
                            CoverType: dataModel.coverType,
                            IsRecommend: dataModel.isRecommend,
                            IsTop: dataModel.isTop,
                            TopNum: dataModel.topNum,
                            Status: dataModel.status
                        },
                        InformationCover: Covers,
                        InfoChannelIDs: dataModel.channelList
                    }
                    this.props.zixun_Savezixun(entity).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.getzixunHomeGeneral();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;
                case "Delete":
                    //提交
                    this.props.zixun_DeleteZixun({ id: dataModel.id }).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.getzixunHomeGeneral();
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
        // return (<div></div>)
        let blockContent = <div className="card-container">
            <Tabs type="card" >
                <TabPane tab={<span>昨日概况</span>} key="1">
                    <div>
                        <Form
                            className="cardbox"
                        >
                            <Row type="flex" justify="center">
                                <Col span={8} className='center'>
                                    <div className='font24 dark' style={{marginBottom:18}}>{this.state.yesterday.yesterdayReadNum}</div>
                                    <div className="font14 gray">{'阅读量'}</div>
                                </Col>
                                <Col span={8} className='center'>
                                    <div>
                                        <div className='font24 dark' style={{marginBottom:18}}>{this.state.yesterday.yesterdayCollectNum}</div>
                                        <div className="font14 gray">{'收藏量'}</div>
                                    </div>
                                </Col>
                                <Col span={8} className='center'>
                                    <div className='font24 dark' style={{marginBottom:18}}>{this.state.yesterday.yesterdayPulishNum}</div>
                                    <div className="font14 gray">{'发布量'}</div>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </TabPane>
                <TabPane tab={<span>总概况</span>} key="2">
                    <div>
                        <Form
                            className="cardbox"
                        >
                            <Row type="flex" justify="center">
                                <Col span={8} className='center'>
                                    <div className='font24 dark' style={{marginBottom:18}}>{this.state.all.allReadNum}</div>
                                    <div className="font14 gray">{'阅读量'}</div>
                                </Col>
                                <Col span={8} className='center'>

                                    <div className='font24 dark' style={{marginBottom:18}}>{this.state.all.allCollectNum}</div>
                                    <div className="font14 gray">{'收藏量'}</div>

                                </Col>
                                <Col span={8} className='center'>
                                    <div className='font24 dark' style={{marginBottom:18}}>{this.state.all.allPulishNum}</div>
                                    <div className="font14 gray">{'发布量'}</div>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </TabPane>
            </Tabs>
        </div>
        let block_Draft_Content = <div className="search-result-list">
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
                </Row>
            </div>
        </div>
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
                block_content = this.state.currentDataModel.infoType==1? <InfoView viewCallback={this.onViewCallback} {...this.state} />:<VideoInfoView viewCallback={this.onViewCallback} {...this.state} />
                return block_content;
            case "Manage":
            default:
                return (
                    <div title={''} >
                        {blockContent}
                        {block_Draft_Content}
                    </div>
                );
        }

    }
}
//表单组件 封装
const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        //各业务接口
        getzixun_ZixunHomeGeneral: bindActionCreators(getzixun_ZixunHomeGeneral, dispatch),
        zixun_ChannelList: bindActionCreators(zixun_ChannelList, dispatch),
        //各业务接口
        zixun_Savezixun: bindActionCreators(zixun_Savezixun, dispatch),
        zixun_DeleteZixun: bindActionCreators(zixun_DeleteZixun, dispatch)
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(HomeIndex);