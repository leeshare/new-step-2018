import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, Spin } from 'antd';
import { getTMResourceList, saveTMResourceInfo } from '@/actions/tm';
import { getDictionaryTitle } from '@/utils';
import ImageView from './ImageView'
const FormItem = Form.Item;
class ImageResourceLibrary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 40, Keyword: '', FileName: '', Systemkeyword: '', Description: '', Status: "1", ResourceType: "1", IncludeResourceVersionTypes: [] },
            dic_resourceTypes: [],
            dic_orientationTypes: [{ title: '横图', value: '1' }, { title: '竖图', value: '2' }, { title: '方图', value: '3' }],
            dic_Status: [],
            dic_resourceVersionTypes: [],
            data_list: [],
            data_list_total: 0,
            windowScrollY: 0,
            loading: false
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

    componentWillReceiveProps(nextProps) {
        if (nextProps.Keyword != this.props.Keyword) {
            setTimeout(() => {
                this.onSearch();
            }, 100)
        }
        console.log(nextProps)
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
            <Col span={6}>
                <FormItem {...formItemLayout} label={'资源名称'} >
                    {getFieldDecorator('Keyword', { initialValue: this.state.pagingSearch.Keyword })(
                        <Input placeholder={'资源名称或关键字'} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={6}>
                <FormItem {...formItemLayout} label={'图片编号'} >
                    {getFieldDecorator('FileName', { initialValue: this.state.pagingSearch.FileName })(
                        <Input placeholder={'来自视觉中国的图片编号'} />
                    )}
                </FormItem>
            </Col>
        );
        children.push(
            <Col span={6}>
                <FormItem
                    {...formItemLayout}
                    label="图片形状"
                >
                    {getFieldDecorator('Description', { initialValue: this.state.pagingSearch.Description })(
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
            this.props.getTMResourceList(pagingSearch).payload.promise.then((response) => {
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
            windowScrollY: window.scrollY,
        });
        window.scrollTo(0, 0);
    };
    //视图回调
    onViewCallback = (dataModel) => {
        if (!dataModel || !this.props.onSelectedResourceImage) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
            setTimeout(() => {
                window.scrollTo(0, this.state.windowScrollY);
            }, 500);
        }
        else {
            this.props.onSelectedResourceImage && this.props.onSelectedResourceImage(dataModel);//使用图片
            this.setState({ currentDataModel: null, editMode: 'Manage' })
            setTimeout(() => {
                window.scrollTo(0, this.state.windowScrollY);
            }, 500);
        }
    }


    //渲染，根据模式不同控制不同输出
    render() {
        if (this.state.loading) {
            return <div className='pingyin-designer showloading'>
                <Spin size="large" />
            </div>
        }
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "View":
                block_content = <ImageView editMode={'View'} viewCallback={this.onViewCallback} onSelectedResourceImage={this.props.onSelectedResourceImage} currentDataModel={{
                    IsDownloaded: true,
                    ImageUrl_Big: this.state.currentDataModel.FileUrl,
                    Title: this.state.currentDataModel.ResourceName,
                    Keywords: this.state.currentDataModel.Keywords,
                    VCG_Res_ID: this.state.currentDataModel.FileName,
                    Description: this.state.currentDataModel.Description,
                    ResourceID: this.state.currentDataModel.ResourceID,
                }} />
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
                                <Col span={3} style={{ textAlign: 'right' }}>
                                    <Button type="primary" icon="search" onClick={this.onSearch}>查询</Button>
                                    {/* <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                                        更多 <Icon type={this.state.expand ? 'up' : 'down'} />
                                    </a> */}
                                </Col>
                            </Row>
                        </Form>
                        <div className="search-result-list" ref={this.onlayoutLoad} >
                            <Row type="flex" justify="center" gutter={12}>
                                {
                                    this.Imagesblock && this.state.data_list.map((item, index) => {
                                        let image_block_width = this.Imagesblock.clientWidth / 4 - 12;
                                        return <Col className={'image-block'} span={6} >
                                            <div className={'image-body'} onClick={(e) => {
                                                this.onLookView("View", item, index);
                                            }}>
                                                <img src={item.FileUrl} style={(item.Width / item.Height >= 1.5 ? { width: image_block_width, height: 'auto' } : { height: image_block_width * 2 / 3, width: 'auto' })} />
                                            </div>
                                            <div>{item.ResourceName}</div>
                                            <div>{item.Description}</div>
                                            <div>{item.FileName}</div>
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
const WrappedImageResourceLibrary = Form.create()(ImageResourceLibrary);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getTMResourceList: bindActionCreators(getTMResourceList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedImageResourceLibrary);