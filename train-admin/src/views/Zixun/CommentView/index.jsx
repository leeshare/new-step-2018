import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Avatar, Divider } from 'antd';
import ButtonGroup from '@/components/ButtonGroup';

import { formItemLayout, formItemLayout24 } from '@/utils/componentExt';

import { YSI18n, getDictionaryTitle, getViewEditModeTitle, dataBind, formatMsgTime } from '@/utils';
import { getRoleFunList } from '@/actions/admin';

//组件实例模板方法引入
import { onSearch, onSearchToggle, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';

//业务接口方法引入
import { zixun_InfoEvaluationList, zixun_ReplyEvaluation, zixun_DeleteEvaluation } from '@/actions/zixun';

const { TextArea } = Input;

import './index.less'
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class CommentView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showReply: -1,
            reply: false,
            dataModel: props.currentDataModel,//数据模型
            pagingSearch: { pageIndex: 1, pageSize: 20, Keyword: '', informationID: props.currentDataModel.id },
            data_list: [],
            data_list_total: 0,
            loading: false,
            Content: ''
        };
        this.onSearch = onSearch.bind(this);
        this.onSearchToggle = onSearchToggle.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    //处理搜索事件
    fetch = (pagingSearch) => {
        this.props.zixun_InfoEvaluationList(pagingSearch).payload.promise.then((response) => {
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
    onCancel = () => {
        this.props.viewCallback();
    }



    //标题
    getTitle() {
        if (this.props.editMode == 'Comment') {
            return '评论管理'
        }

    }
    onReply(i) {
        this.setState({ showReply: i })
    }
    onCancelReply() {
        this.setState({ showReply: -1 })
    }
    onSave(eid) {
        if (this.state.Content && this.state.Content.length > 0) {
            this.props.zixun_ReplyEvaluation({ InformationID: this.state.dataModel.id, Content: this.state.Content, InfoEvaluationFID: eid }).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    this.setState({ showReply: -1, reply: true })
                    message.error(data.message);
                }
                else {
                    this.setState({ showReply: -1, reply: true })
                    let datas = this.state.data_list;
                    var edata = datas.find(a => a.InfoEvaluationID == eid);
                    var list = edata.child;
                    list = [{ Content: this.state.Content }, ...list];
                    edata.child = list;
                    datas = datas.filter(a => a.InfoEvaluationID != eid);
                    datas = [edata, ...datas];
                    this.setState({ data_list: datas })
                }
            })
        }
    }
    onDelete(eid) {
        Modal.confirm({
            title: '你确认要删除吗?',
            content: '请确认',
            onOk: () => {
                this.props.zixun_DeleteEvaluation({ infoEvaluationID: eid }).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        this.setState({ showReply: -1, reply: true })
                        message.error(data.message);
                    }
                    else {
                        this.setState({ showReply: -1, reply: true })
                        let datas = this.state.data_list;
                        datas = datas.filter(a => a.InfoEvaluationID != eid);
                        this.setState({ data_list: datas })
                    }
                })
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
    }
    rendeCommentView() {




        let datas = this.state.data_list;

        let block_comment = datas.map((a, index) => {

            let block_replyContent = a.child.map(b => {
                return (
                    <div className='block_replyContent'>
                        <div className='text_reply'>你的回复</div>
                        <div className='text_reply_content'>
                            {b.Content}
                        </div>
                    </div>
                )
            })
            return (
                <div className={index == datas.length - 1 ? 'block_commentWrap_last' : 'block_commentWrap'}>
                    <div className='block_avatar'>
                        <Avatar shape="circle" size={50} src={a.Icon} />
                    </div>
                    <div className='block_comment'>
                        <div className='block_userwrap'>
                            <span className='text_userName'>{a.RealName}</span>
                            <div className='text_buttonGroup'>
                                <ButtonGroup>
                                    <a className='link_text' onClick={() => this.onReply(index)}>回复</a>
                                    <a className='link_text' onClick={() => this.onDelete(a.InfoEvaluationID)}>删除</a>
                                </ButtonGroup>
                            </div>
                        </div>
                        <div>
                            <p className='text_commentContent'>{a.Content}</p>
                        </div>
                        <div><span className='text_date'>{formatMsgTime(a.CreatedDate)}</span></div>
                        {this.state.showReply == index && <div className='block_inputBox'>
                            <TextArea rows={5} placeholder="回复该评论：" className='textarea' onChange={(e) => { this.setState({ Content: e.target.value }) }} />
                            <ButtonGroup>
                                <Button type="primary" loading={this.state.loading} onClick={() => this.onSave(a.InfoEvaluationID)}>{YSI18n.get('发送')}</Button>
                                <Button onClick={() => this.onCancelReply()} >{YSI18n.get('收起')}</Button>
                            </ButtonGroup>
                        </div>}
                        {block_replyContent}
                    </div>

                </div>
            )
        })

        return <div>
            <p className='text_title'>{this.state.dataModel.title}</p>
            <p className='text_date'>{this.state.dataModel.publishDate}</p>
            <div>
                <Row>
                    <Col span={24}>
                        <Card title={`全部评论（${this.state.data_list_total}）`} bordered={true}>
                            {block_comment}
                        </Card>

                    </Col>

                </Row>
            </div>
        </div>
    }

    render() {
        let title = this.getTitle();
        let block_commentView = this.rendeCommentView();
        return (
            <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
                {block_commentView}

            </Card>
        );
    }
}

const WrappedCommentView = Form.create()(CommentView);

function mapDispatchToProps(dispatch) {
    return {
        //各业务接口
        zixun_InfoEvaluationList: bindActionCreators(zixun_InfoEvaluationList, dispatch),
        zixun_ReplyEvaluation: bindActionCreators(zixun_ReplyEvaluation, dispatch),
        zixun_DeleteEvaluation: bindActionCreators(zixun_DeleteEvaluation, dispatch),
    };
}
//redux 组件 封装
export default connect(null, mapDispatchToProps)(WrappedCommentView);