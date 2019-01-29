import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Checkbox, Select, Button, Icon, Table, Pagination, Card, DatePicker,Spin } from 'antd';
import { getPublicCategoryResList, deleteCategoryResource, editResourceName } from '@/actions/teach';
import { getDictionaryTitle } from '@/utils';

import ModalPlayer from '@/components/ModalPlayer';
import ResourceCard from '@/components/ResourceCard';
const FormItem = Form.Item;
class PublicResource extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 20, Keyword: '', CategoryName: '', ResourceType: "-1", ExcludeTeachScheduleID: '', BeginDate: '', EndDate: '' },
            dic_ResourceTypes: [],
            data_list: [],
            data_list_total: 0,
            loading: false
        };

    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }

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
                <FormItem {...formItemLayout} label={'栏目名称'} >
                    {getFieldDecorator('Keyword', { initialValue: '' })(
                        <Input placeholder="按栏目名模糊查找" />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem {...formItemLayout} label={'课件名称'} >
                    {getFieldDecorator('Keyword', { initialValue: '' })(
                        <Input placeholder="按课件名模糊查找" />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="课件类型"
                >
                    {getFieldDecorator('ResourceType', { initialValue: this.state.pagingSearch.ResourceType })(
                        <Select>
                            <Option value="-1">全部</Option>
                            {this.state.dic_ResourceTypes.map((item) => {
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
                    label="上传起始日期"
                >
                    {getFieldDecorator('BeginDate', { initialValue: this.state.pagingSearch.BeginDate })(
                        <DatePicker />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="上传截止日期"
                >
                    {getFieldDecorator('EndDate', { initialValue: this.state.pagingSearch.EndDate })(
                        <DatePicker />
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
    onPlayMedia = (lecture_info) => {
        this.setState({ currentMedia: lecture_info, showPlayMedia: true })
    }
    onCancelPlay = () => {
        this.setState({ showPlayMedia: false, currentMedia: null })
    }
    onEditName = (lectureInfo, teachResourceAlias) => {
        this.props.editResourceName(2, lectureInfo.id, teachResourceAlias).payload.promise.then((response) => {
            var find = this.state.data_list.find(A => A.lecture_info.id == lectureInfo.id);
            find.lecture_info.name = teachResourceAlias;
            this.setState({ schedule_info: this.state.schedule_info })
        });
    }

    onRemove = (lectureInfo) => {
        Modal.confirm({
            title: '你确认要删除该课件吗?',
            content: '请确认',
            onOk: () => {
                this.props.deleteCategoryResource(2, lectureInfo.id).payload.promise.then((response) => {
                    this.state.data_list = this.state.data_list.filter(A => A.lecture_info.id != lectureInfo.id);
                    this.setState({ data_list: this.state.data_list })
                    if (this.state.data_list.length == 0) {//如果一页数据全部删除了则需要强制刷新数据
                        this.onSearch();
                    }
                });
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
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
            this.props.getPublicCategoryResList(pagingSearch).payload.promise.then((response) => {
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
    onChange = (item, e) => {
        this.props.onSelected(item, e.target.checked);
    }
    //渲染，根据模式不同控制不同输出
    render() {
        if (this.state.loading) {
            return <div style={{ width: 100, margin: '300 auto' }}><Spin tip="数据加载中..."></Spin></div>
        }
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Manage":
            default:
                block_content = (
                    <div>
                        <Form
                            className="search-form"
                        >
                            <Row>
                                {this.getFields()}
                                <Col span={24} style={{ textAlign: 'right' }}>
                                    <Button type="primary" icon="search" onClick={this.onSearch}>查询</Button>
                                    <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                                        更多 <Icon type={this.state.expand ? 'up' : 'down'} />
                                    </a>
                                </Col>
                            </Row>
                        </Form>
                        <div className="search-result-list">
                            {!this.state.loading && this.state.data_list_total == 0 ? <div style={{ padding: 30, margin: '100 auto', width: 200, textAlign: 'center' }}>没有找到符合的数据</div> : ''}
                            <Row gutter={24}>
                                {
                                    this.state.data_list.map((item, index) => {
                                        return (
                                            <Col span={6}>
                                                <ResourceCard
                                                    lecture_info={item.lecture_info}
                                                    extendInfo={() => {
                                                        return `[${item.categoryName}] ${item.createdDate}`;
                                                    }}
                                                    onPlayMedia={this.onPlayMedia}
                                                    onRemove={() => { this.onRemove(item.lecture_info); }}
                                                    onEditName={(teachResourceAlias) => { this.onEditName(item.lecture_info, teachResourceAlias) }}
                                                />
                                            </Col>
                                        );
                                    })
                                }
                            </Row>
                            <div className="search-paging">
                                <Row>
                                    <Col span={8}>
                                    </Col>
                                    {
                                        this.state.data_list_total > 0 ? <Col span={16} className={'search-paging-control'}>
                                            <Pagination showSizeChanger
                                                current={this.state.pagingSearch.PageIndex}
                                                defaultPageSize={this.state.pagingSearch.PageSize}
                                                onShowSizeChange={this.onShowSizeChange}
                                                onChange={this.onPageIndexChange}
                                                showTotal={(total) => { return `共${total}条数据`; }}
                                                total={this.state.data_list_total} />
                                        </Col> : ''
                                    }
                                </Row>
                            </div>
                        </div>
                        {
                            this.state.currentMedia ? <ModalPlayer lecture_info={this.state.currentMedia} visible={this.state.showPlayMedia} onCancel={this.onCancelPlay} /> : ''
                        }
                    </div>
                );
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedPublicResource = Form.create()(PublicResource);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getPublicCategoryResList: bindActionCreators(getPublicCategoryResList, dispatch),
        deleteCategoryResource: bindActionCreators(deleteCategoryResource, dispatch),
        editResourceName: bindActionCreators(editResourceName, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedPublicResource);