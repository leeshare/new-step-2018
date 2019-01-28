import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card } from 'antd';
import { searchCharaterWritingLibrary, saveCharacterWritingInfo, deleteCharacterWritingInfo,auditCharacterWritingInfo,switchCharacterWritingInfoStatus } from '@/actions/tm';
import { getDictionaryTitle } from '@/utils';
import CharacterWritingView from '../View';
const FormItem = Form.Item;
class CharacterWritingAudit extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand:false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', Status: "-1", AuditStatus: "1", LibraryType: 1, ApplicableScopes: '-1' },
            dic_ApplicableScopes: [],
            dic_Status: [],
            dic_AuditStatus: [],
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
            title: `字`,
            width: 100,//可预知的数据长度，请设定固定宽度
            //自定义显示
            render: (text, record, index) => {
                return <a onClick={() => { this.onLookView('View', record) }}>{record.Word} {record.Phonetic}</a>
            }
        },
        {
            title: `听写内容`,
            //自定义显示
            render: (text, record, index) => {
                return <span>{record.Content}</span>
            }
        },
        {
            title: '适用对象',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_ApplicableScopes, record.ApplicableScopes);
            }
        },
        {
            title: '状态',
            width: 80,
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.Status);
            }
        },
        {
            title: '审核状态',
            width: 120,
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_AuditStatus, record.AuditStatus);
            }
        },
        {
            title: '操作',
            width: 140,//可预知的数据长度，请设定固定宽度
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={() => { this.onLookView('Audit', record) }}>{'审核'}</a>
                    <span className="ant-divider" />
                    <a onClick={() => { this.onSwitchStatus(record) }}>{record.Status != 1 ? '启用' : '停用'}</a>
                </span>
            ),
        }];

    //搜索条件
    getFields() {         
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 10 },
            wrapperCol: { span: 14 },
        };
        const children = [];
        children.push(
            <Col span={8}>
                <FormItem {...formItemLayout} label={'字'} >
                    {getFieldDecorator('Keyword', { initialValue: this.state.pagingSearch.Keyword })(
                        <Input placeholder={'字或听写内容或关键字'} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="审核状态"
                >
                    {getFieldDecorator('AuditStatus', { initialValue: this.state.pagingSearch.AuditStatus })(
                        <Select>
                            {this.state.dic_AuditStatus.filter(A => A.value > 0).map((item) => {
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
                    label="适用对象"
                >
                    {getFieldDecorator('ApplicableScopes', { initialValue: this.state.pagingSearch.ApplicableScopes })(
                        <Select>
                            <Option value="-1">全部</Option>
                            {this.state.dic_ApplicableScopes.map((item) => {
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
        let filedCount= this.state.expand?children.length:3;
        return children.slice(0,filedCount);
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
            this.props.searchCharaterWritingLibrary(pagingSearch).payload.promise.then((response) => {
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
                    this.props.saveCharacterWritingInfo(dataModel).payload.promise.then((response) => {
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
                    this.props.deleteCharacterWritingInfo(this.state.currentDataModel).payload.promise.then((response) => {
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
                case "Audit":
                    //提交
                    this.props.auditCharacterWritingInfo({...this.state.currentDataModel,...dataModel}).payload.promise.then((response) => {
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
    //切换状态
    onSwitchStatus(item) {
        //提交
        this.props.switchCharacterWritingInfoStatus({ ...item, Status: 1 - item.Status }).payload.promise.then((response) => {
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
                block_content = <CharacterWritingView viewCallback={this.onViewCallback} {...this.state} />
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
const WrappedCharacterWritingAudit = Form.create()(CharacterWritingAudit);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        searchCharaterWritingLibrary: bindActionCreators(searchCharaterWritingLibrary, dispatch),
        auditCharacterWritingInfo: bindActionCreators(auditCharacterWritingInfo, dispatch),
        switchCharacterWritingInfoStatus: bindActionCreators(switchCharacterWritingInfoStatus, dispatch),
        deleteCharacterWritingInfo: bindActionCreators(deleteCharacterWritingInfo, dispatch)
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCharacterWritingAudit);