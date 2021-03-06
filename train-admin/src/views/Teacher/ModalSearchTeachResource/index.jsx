import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Checkbox, Select, Button, Icon, Table, Pagination, Card, DatePicker } from 'antd';
import { getTeachCategoryResList } from '@/actions/teach';
import { getDictionaryTitle } from '@/utils';

import ModalPlayer from '@/components/ModalPlayer';
import ResourceCard from '@/components/ResourceCard';
const FormItem = Form.Item;
class ModalSearchTeachResource extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 20, Keyword: '',CategoryName:'', ResourceType: "-1", ExcludeTeachScheduleID: props.TeachScheduleID, BeginDate: '', EndDate: '', CourseSpecialty: (props.CourseSpecialty || ''), CourseLevel: (/*props.CourseLevel || */''), PeriodType: ('') },
            dic_ResourceTypes: [],
            dic_TeachCategoryTypes: [],
            dic_PeriodTypes: [],
            dic_CourseSpecialtys: [],
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
        //获取课程对应的等级
        var find = this.state.dic_CourseSpecialtys.find(A => A.value == this.state.pagingSearch.CourseSpecialty);
        let courseLevels = find != null ? find.CourseLevels : [];
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
                    label="来源"
                >
                    {getFieldDecorator('CategoryName', { initialValue: this.state.pagingSearch.CategoryName })(
                        <Select>
                            <Option value="">全部</Option>
                            {this.state.dic_TeachCategoryTypes.map((item) => {
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
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="课程类型"
                >
                    {getFieldDecorator('PeriodType', { initialValue: this.state.pagingSearch.PeriodType })(
                        <Select>
                            <Option value="">全部</Option>
                            {this.state.dic_PeriodTypes.map((item) => {
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
            this.props.getTeachCategoryResList(pagingSearch).payload.promise.then((response) => {
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
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Manage":
            default:
                block_content = (
                    <div className="modal-search">
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
                                                <Checkbox onChange={(e) => { this.onChange(item, e) }}>选择</Checkbox>
                                                <ResourceCard lecture_info={item.lecture_info} onPlayMedia={this.onPlayMedia} />
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
const WrappedModalSearchTeachResource = Form.create()(ModalSearchTeachResource);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getTeachCategoryResList: bindActionCreators(getTeachCategoryResList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedModalSearchTeachResource);