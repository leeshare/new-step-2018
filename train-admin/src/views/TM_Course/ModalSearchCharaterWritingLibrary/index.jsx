import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card } from 'antd';
import { searchCharaterWritingLibrary } from '@/actions/tm';
import { getDictionaryTitle } from '@/utils';
const FormItem = Form.Item;
class ModalSearchCharaterWritingLibrary extends React.Component {
    LibraryTypeName = "听写字库";
    constructor(props) {
        super(props)
        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 5, Keyword: (props.Keyword || ''), Status: 1, LibraryType: props.LibraryType, ApplicableScopes: (props.ApplicableScopes || '') },
            dic_ApplicableScopes: [],
            data_list: [],
            data_list_total: 0,
            ChooseObjects: props.ChooseObjects || [],
            loading: false
        };

    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.Keyword != this.props.Keyword || nextProps.ApplicableScopes != this.props.ApplicableScopes) {
            setTimeout(() => {
                this.onSearch();
            }, 100)
        }
        this.setState({ ChooseObjects: nextProps.ChooseObjects || [] });
        console.log(nextProps)
    }
    //table 输出列定义
    columns = [
        {
            title: `字`,
            //自定义显示
            render: (text, record, index) => {
                return <span>{record.Word} {record.Phonetic}</span>
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
        }, {
            title: '操作',
            width: 100,//可预知的数据长度，请设定固定宽度
            key: 'action',
            render: (text, record) => (
                this.state.ChooseObjects.find(A => A.key == record.key) ? <span>已选择</span> : <a onClick={() => { this.props.callback(90 + this.props.LibraryType, record) }}>选择</a>
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
            <Col span={8}>
                <FormItem {...formItemLayout} label={`字`} >
                    {getFieldDecorator('Keyword', { initialValue: this.props.Keyword })(
                        <Input placeholder={`字或听写内容或关键字`} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={12}>
                <FormItem
                    {...formItemLayout}
                    label="适用对象"
                >
                    {getFieldDecorator('ApplicableScopes', { initialValue: this.props.ApplicableScopes })(
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
        return children;
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
    //渲染，根据模式不同控制不同输出
    render() {
        let block_content = <div></div>
        //设定类型
        let type = 90 + this.props.LibraryType;
        switch (this.state.editMode) {
            case "Manage":
            default:
                block_content = (
                    <div className="modal-search">
                        <Form
                            className="search-form"
                        >
                            <Row gutter={40}>
                                {this.getFields()}
                                <Col span={4} style={{ textAlign: 'right' }}>
                                    <Button type="primary" icon="search" onClick={this.onSearch}>查询</Button>
                                </Col></Row>
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
                                    <Col span={6}>
                                    </Col>
                                    <Col span={18} className={'search-paging-control'}>
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
const WrappedModalSearchCharaterWritingLibrary = Form.create()(ModalSearchCharaterWritingLibrary);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        searchCharaterWritingLibrary: bindActionCreators(searchCharaterWritingLibrary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedModalSearchCharaterWritingLibrary);