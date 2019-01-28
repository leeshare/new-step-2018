//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, Checkbox, DatePicker } from 'antd';
const FormItem = Form.Item;
import ButtonGroup from '@/components/ButtonGroup';
const { RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { loadBizDictionary, onSearch, onSearchToggle, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';
//工具类方法引入
import { YSI18n, getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { zixun_Savezixun, zixun_zixunList, zixun_ChannelList, zixun_DeleteZixun } from '@/actions/zixun';

import './index.less';
const searchFormItemLayout24 = {
  labelCol: { span: 2 },
  wrapperCol: { span: 22 },
};
const searchFormItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
class EvaluationManage extends React.Component {

    constructor(props) {
        super(props)
        //组件状态初始化过程
        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { pageIndex: 1, pageSize: 20, Keyword: '', Status: -1,InfoType:1, channelIds: [-2], PublishBeginDate: null, PublishEndDate: null },
            data_list: [],
            data_list_total: 0,
            loading: false,
            channel_data_List: [],
            expand: false,
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
        this.onSearch();
        this.getChannelList();
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
    //table 输出列定义
    columns = [{
        title: YSI18n.get('全部资讯'),
        width: 200,//可预知的数据长度，请设定固定宽度
        //自定义显示
        render: (text, record, index) => {
            let img_view = record.covers.map(a => {
                return (<div className='img_wrap'><img src={a.coverPath} style={{ width: '100%',height:'100%', resizeMode:'cover' }} /></div>)
            })
            let publist_view = record.status == 1 ? <div style={{marginBottom:10,fontSize:14}}>
                {'已发布 ' + record.publishDate}
            </div> : null;
            let count_view = record.status == 1 ? <div className='dv_block_status'><span className='iconitem'><Icon type="user" className='icon' />{record.readCount}</span> <span className='iconitem'><Icon type="heart" className='icon' />{record.collectCount}</span> <span className='iconitem'><Icon type="message" className='icon' />{record.evaluationCount}</span></div> : null;
            let modify_view = <ButtonGroup >
                <a onClick={() => { this.onLookView('Edit', record) }} className='link_gray'><Icon type="edit" className='icon' /><span style={{fontSize:12}}>{YSI18n.get('Edit')}</span></a>
                <a onClick={() => { this.onLookView('Delete', record) }} className='link_gray'><Icon type="delete" className='icon' /><span style={{fontSize:12}}>{YSI18n.get('Delete')}</span></a>
            </ButtonGroup>
            return <Row>
                <Col span={12}>
                    <a onClick={() => { this.onLookView('View', record) }} className='fontTitle'>{record.title}</a>
                    {publist_view}
                    {count_view}
                    {modify_view}
                </Col>
                <Col　span={12} style={{textAlign:'right'}}>
                    {img_view}
                </Col>

            </Row>
        }
    }];

    //搜索条件
    getFields() {
        const count = this.state.expand ? 10 : 6;
        const { getFieldDecorator } = this.props.form;
        const children = [];
        let channelList = this.state.channel_data_List.map(item => {
            return { label: item.InfoChannelName, value: item.InfoChannelID }
        });
        children.push(
            <Col span={24}>
                <FormItem
                    {...searchFormItemLayout24}
                    label="资讯频道"
                >
                    {getFieldDecorator('channelIds', { initialValue: this.state.channelIds })(
                        <CheckboxGroup options={channelList} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={12}>
                <FormItem {...searchFormItemLayout} label={YSI18n.get('资讯名称')} >
                    {getFieldDecorator('Title', { initialValue: '' })(
                        <Input placeholder={YSI18n.get('资讯名称')} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={12}>
                <FormItem
                    {...searchFormItemLayout}
                    label={YSI18n.get('发布日期')}
                >
                    {getFieldDecorator('searchDate', { initialValue: this.state.searchDate })(
                        <RangePicker />
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
    fetch = (pagingSearch) => {
        if (pagingSearch.channelIds == undefined || pagingSearch.channelIds.length == 0) {
            pagingSearch.channelIds = [-2];
        }
        if (pagingSearch.searchDate) {
            pagingSearch.PublishBeginDate = pagingSearch.searchDate[0]._d;
            pagingSearch.PublishEndDate = pagingSearch.searchDate[1]._d;
        }
        this.props.zixun_zixunList(pagingSearch).payload.promise.then((response) => {
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
                    let Covers = dataModel.FormImagePaths_Temp.filter(item => item.value != '').map(item => { return { CoverPath: item.value } });
                    let entity = {
                        Information: {
                            InformationID: dataModel.id,
                            InfoType: 1,
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
                            this.onSearch();
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
                block_content = <InfoView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                block_content = (
                    <div>
                        <Form
                            className="search-form"
                        >
                            <Row >{this.getFields()}</Row>
                            <Row>
                                <Col span={24} style={{ textAlign: 'center' }}>
                                    <ButtonGroup>
                                        <Button type="primary" icon="search" onClick={this.onSearch}>{YSI18n.get('Search')}</Button>
                                        <Button onClick={() => { this.onLookView('Create', { title: '', content: '', coverType: 1, covers: [], isRecommend: 1, isTop: 0, topNum: 0, channel_data_List: this.state.channel_data_List, channelList: [] }) }} icon="plus">{YSI18n.get('资讯')}</Button>
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
const WrappedEvaluationManage = Form.create()(EvaluationManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //各业务接口
        zixun_Savezixun: bindActionCreators(zixun_Savezixun, dispatch),
        zixun_zixunList: bindActionCreators(zixun_zixunList, dispatch),
        zixun_ChannelList: bindActionCreators(zixun_ChannelList, dispatch),
        zixun_DeleteZixun: bindActionCreators(zixun_DeleteZixun, dispatch)
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedEvaluationManage);