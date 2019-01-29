import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, Spin, Anchor } from 'antd';
import { getVCGAPILibrary, vcg_Detail, vcg_Download } from '@/actions/vcg';
import { getDictionaryTitle } from '@/utils';
import ImageView from './ImageView'
const FormItem = Form.Item;
const { Link } = Anchor;
class ImageVCGLibrary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: true,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 40, id: '', keyword: '', orientation: '', sort: '', sort_by: '', asset_format: 'jpg', graphical_style: '' },
            dic_orientationTypes: [{ title: '横图', value: '1' }, { title: '竖图', value: '2' }, { title: '方图', value: '3' }],
            dic_sortTypes: [{ title: '最佳', value: 'best' }, { title: '时间', value: 'time' }],
            dic_sortByTypes: [{ title: '正序', value: 'asc' }, { title: '倒序', value: 'desc' }],
            dic_graphicalStyleTypes: [{ title: '摄影图片', value: '1' }, { title: '插画', value: '2' }, { title: '漫画', value: '3' }],
            data_list: [],
            data_list_total: 0,
            windowScrollY: 0,
            loading: false,
            image_block_width: 0,
        };
    }

    componentWillMount() {
        window.addEventListener('resize', this.onresize);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();

    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.onresize);
    }

    Imagesblock = null;
    onresize = () => {
        this.setState({ image_block_width: 0 });
    }
    onlayoutLoad = (obj) => {
        if (obj) { this.Imagesblock = obj; this.setState({ resize: true }) }
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
                <FormItem {...formItemLayout} label={'关键字'} >
                    {getFieldDecorator('keyword', { initialValue: this.state.pagingSearch.keyword })(
                        <Input placeholder={'多个关键词用空格分隔'} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="图片形状"
                >
                    {getFieldDecorator('orientation', { initialValue: this.state.pagingSearch.orientation })(
                        <Select>
                            <Option value="">全部</Option>
                            {this.state.dic_orientationTypes.map((item) => {
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
                    label="图片类型"
                >
                    {getFieldDecorator('graphical_style', { initialValue: this.state.pagingSearch.graphical_style })(
                        <Select>
                            <Option value="">不限</Option>
                            {this.state.dic_graphicalStyleTypes.map((item) => {
                                return <Option value={item.value}>{item.title}</Option>
                            })}
                        </Select>
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem {...formItemLayout} label={'图片编号'} >
                    {getFieldDecorator('id', { initialValue: this.state.pagingSearch.id })(
                        <Input placeholder={'来自视觉中国的图片编号'} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={8}>
                <FormItem
                    {...formItemLayout}
                    label="排序规则"
                >
                    {getFieldDecorator('sort', { initialValue: this.state.pagingSearch.sort })(
                        <Select>
                            <Option value="">默认排序</Option>
                            {this.state.dic_sortTypes.map((item) => {
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
                    label="排序方向"
                >
                    {getFieldDecorator('sort_by', { initialValue: this.state.pagingSearch.sort_by })(
                        <Select>
                            <Option value="">默认顺序</Option>
                            {this.state.dic_sortByTypes.map((item) => {
                                return <Option value={item.value}>{item.title}</Option>
                            })}
                        </Select>
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
    onSearch = (e) => {
        if (e) {
            e.preventDefault();
            this.state.pagingSearch.PageIndex = 1;//重新查询时重置到第一页
        }
        this.setState({ loading: true })
        this.props.form.validateFields((err, values) => {
            console.log('Received values of form: ', values);
            let pagingSearch = { ...this.state.pagingSearch, ...values };
            this.props.getVCGAPILibrary(pagingSearch).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    this.setState({ loading: false })
                    message.error(data.message);
                }
                else {
                    this.setState({ pagingSearch: pagingSearch, ...data, loading: false })
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
    onLookView = (op, item, index) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
            windowScrollY: window.scrollY,
        });
        window.scrollTo(0, 0);
    };
    //视图回调
    onViewCallback = (dataModel) => {
        this.setState({ currentDataModel: null, editMode: 'Manage' })
        setTimeout(() => {
            window.scrollTo(0, this.state.windowScrollY);
        }, 500);
        if (dataModel && this.props.onSelectedResourceImage) {
            this.props.onSelectedResourceImage && this.props.onSelectedResourceImage(dataModel);//使用图片
        }
    }

    //渲染，根据模式不同控制不同输出
    render() {
        if (this.state.loading) {
            return <div className='pingyin-designer showloading'>
                <Spin size="large" />
            </div>
        }
        var block_content = '';
        switch (this.state.editMode) {
            case "View":
                block_content = <div>
                    <ImageView editMode={this.state.editMode} viewCallback={this.onViewCallback} currentDataModel={this.state.currentDataModel} />
                </div>
                break;
            case "Manage":
            default:
                block_content = (
                    <div>
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
                        <div className="search-result-list" ref={this.onlayoutLoad} >
                            <Row type="flex" justify="center" gutter={12}>
                                {
                                    this.Imagesblock && this.state.data_list.map((item, index) => {
                                        let image_block_width = this.Imagesblock.clientWidth / 4 - 12;
                                        return <Col className={'image-block'} span={6}>
                                            <div className={'image-body'} onClick={(e) => {
                                                this.onLookView("View", item, index);
                                            }}>
                                                <img src={item.ImageUrl} style={(item.Width / item.Height >= 1.5 ? { width: image_block_width, height: 'auto' } : { height: image_block_width * 2 / 3, width: 'auto' })} />
                                            </div>
                                            <div>{item.Title}</div>
                                            <div>{item.VCG_Res_ID}</div>
                                        </Col>
                                    })
                                }
                            </Row>
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
const WrappedImageVCGLibrary = Form.create()(ImageVCGLibrary);

const mapStateToProps = (state) => {
    return { menuCollapsed: state.menu.menuCollapsed };
};

function mapDispatchToProps(dispatch) {
    return {
        getVCGAPILibrary: bindActionCreators(getVCGAPILibrary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedImageVCGLibrary);