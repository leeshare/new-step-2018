import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, Spin, Radio, Slider, Tag } from 'antd';

import AvatarEditor from 'react-avatar-editor'
import AudioPlayer from '@/components/AudioPlayer';
import AudioUpload from '@/components/AudioUpload';
import ImageUpload from '@/components/ImageUpload';
import EditableTagGroup from '@/components/EditableTagGroup'
import { getDictionaryTitle, getViewEditModeTitle } from '@/utils';
import { getVCGAPILibrary, vcg_Detail, vcg_Download, vcg_SaveCutImageInfo } from '@/actions/vcg';
import './index.less';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const formItemLayout = {
    formLayout: 'vertical',
};
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class ImageView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: {...props.currentDataModel,Width:0,Height:0},//数据模型
            editMode: props.editMode,
            loading: false,
            showLoading: false,
            MaxSideLength: 1280,
            dic_AspectRatios: [{ title: '16:9', value: 1.78 }, { title: '4:3', value: 1.33 }, { title: '1:1', value: 1 }, { title: '原图', value: 0 }],
            AspectRatio: 0,
            scale: 1,
            cutBorder: 50,
            rotate: 0,
        };
    }

    componentWillMount() {
        if (this.props.currentDataModel.IsLoadDetail) {
            this.onLoadImageInfo(this.props.currentDataModel.VCG_Res_ID);
        }
    }
    //处理搜索事件
    onLoadImageInfo = (VCG_Res_ID) => {
        message.info('正在加载更详细的内容...', 2);
        this.setState({ showLoading: true })
        this.props.vcg_Detail(VCG_Res_ID).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ showLoading: false })
                message.error(data.message);
            }
            else {
                this.setState({ dataModel: { ...data }, showLoading: false })
            }
        })
    }

    onCancel = () => {
        this.props.viewCallback();
    }
    onDownload = () => {
        Modal.confirm({
            title: '你确认要下载这张图片吗?',
            content: '图片下载属于付费项目，请合理使用，系统后记录您的下载记录！',
            onOk: () => {
                this.props.vcg_Download(this.props.currentDataModel.VCG_Res_ID).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        this.setState({ loading: false })
                        message.error(data.message);
                    }
                    else {
                        this.setState({ dataModel: { ...data, IsLoadDetail: false } })
                        message.success('图片下载成功,你可以使用了。', 3);
                    }
                })
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });

    }
    onCutImage = () => {
        //按照图片实际情况，技术边长
        var originalWidth = this.state.dataModel.Width;
        var originalHeight = this.state.dataModel.Height;
        var originalMaxLength = Math.max(originalWidth, originalHeight);
        var realMaxLength = Math.min(originalMaxLength, this.state.MaxSideLength);
        var realWidth = 0;
        var realHeight = 0;
        var realAspectRatio = this.state.dic_AspectRatios[this.state.AspectRatio].value;
        if (realAspectRatio == 0) {
            if (originalWidth > originalHeight) {
                realAspectRatio = originalWidth / originalHeight;
            }
            else {
                realAspectRatio = originalHeight / originalWidth;
            }
        }
        if (originalWidth > originalHeight) {
            realWidth = realMaxLength;
            realHeight = Math.round(realWidth / parseFloat(realAspectRatio));
        }
        else {
            realHeight = realMaxLength;
            realWidth = Math.round(realHeight / parseFloat(realAspectRatio));
        }
        this.setState({ width: realWidth, height: realHeight, MaxSideLength: realMaxLength, editMode: 'Cut', image: this.state.dataModel.ImageUrl_Big });
    }
    onUseImage = () => {
        this.props.viewCallback(this.state.dataModel);
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.state.editMode);
        return `图片信息`;
    }


    setEditorRef = (editor) => this.editor = editor

    onAspectRatioChange = (e) => {
        this.setState({ AspectRatio: e.target.value });
        setTimeout(() => {
            this.onCutImage();
        }, 200);
    }
    onScaleChange = (value) => {
        this.setState({ scale: value });
    }
    onMaxSideLengthChange = (value) => {
        this.setState({ MaxSideLength: value });
        setTimeout(() => {
            this.onCutImage();
        }, 200);
    }

    doCut = () => {
        if (this.editor) {
            // This returns a HTMLCanvasElement, it can be made into a data URL or a blob,
            // drawn on another canvas, or added to the DOM.
            const canvas = this.editor.getImageScaledToCanvas();
            var cutImage = canvas.toDataURL('image/jpeg');
            //this.state.dataModel.FormImage = cutImage;
            //this.setState({ dataModel: this.state.dataModel });
            return cutImage;
        }
        return "";
    }
    onSubmit = () => {
        let that = this;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                var formImagePath = this.doCut();
                var { width, height, AspectRatio } = this.state;
                var Orientation = this.state.dataModel.Orientation;
                var AspectRatioItem = this.state.dic_AspectRatios[AspectRatio];
                var aspectTitle = AspectRatioItem.title;
                this.props.vcg_SaveCutImageInfo({
                    FileName: this.props.currentDataModel.VCG_Res_ID,//图片ID
                    FormImagePath: formImagePath,//base64截图
                    ResourceName: values.ResourceName,
                    Keywords: values.Keywords,
                    Description: `${Orientation},${aspectTitle},${width}x${height}`,
                }).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        that.setState({ loading: false })
                        message.error(data.message);
                    }
                    else {
                        that.setState({ dataModel: { ...data, IsLoadDetail: false } })
                        message.success('成功保存图片到资源库', 3);
                        that.props.viewCallback({ ...data, ImageUrl_Big: data.FileUrl });
                    }
                })
            }
        });
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.state.editMode) {
            case "View":
                block_content = (
                    <div>
                        <Row>
                            <Col span={20} style={{ textAlign: 'center' }}>
                                {this.state.dataModel.IsDownloaded && <img onLoad={(e) => {
                                    this.state.dataModel.Width=e.target.naturalWidth;
                                    this.state.dataModel.Height=e.target.naturalHeight;
                                    this.setState({ dataModel:this.state.dataModel });
                                }} src={this.state.dataModel.ImageUrl_Big} style={{ width: '95%', height: 'auto' }} />}
                                {!this.state.dataModel.IsDownloaded && <img src={(this.state.dataModel.ImageUrl_Middle != '' ? this.state.dataModel.ImageUrl_Middle : this.state.dataModel.ImageUrl)} style={{ width: '95%', height: 'auto' }} />}
                            </Col>
                            <Col span={4}>
                                <Form>
                                    <FormItem
                                        {...btnformItemLayout}
                                    >
                                        {this.state.dataModel.Title}
                                    </FormItem>
                                    <FormItem
                                        {...formItemLayout}
                                        label="关键字"
                                    >
                                        {this.state.dataModel.Keywords}
                                    </FormItem>
                                    <FormItem
                                        {...formItemLayout}
                                        label="图片编号"
                                    >
                                        {this.state.dataModel.VCG_Res_ID}
                                    </FormItem>
                                    {
                                        (this.state.dataModel.Description && this.state.dataModel.Description != '') && <FormItem
                                            {...formItemLayout}
                                            label="图片规格"
                                        >
                                            {this.state.dataModel.Description}
                                        </FormItem>
                                    }
                                    <FormItem style={{ textAlign: 'center' }}
                                        {...btnformItemLayout}
                                    >
                                        {!this.state.dataModel.IsDownloaded && <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onDownload}>下载图片</Button>
                                        }
                                        {
                                            (this.state.dataModel.IsDownloaded && !this.state.dataModel.ResourceID) && <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onCutImage}>使用图片</Button>
                                        }
                                        {
                                            (this.state.dataModel.IsDownloaded && this.state.dataModel.ResourceID && this.props.onSelectedResourceImage) && <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onUseImage}>使用图片</Button>
                                        }
                                    </FormItem>
                                </Form>
                            </Col>
                        </Row>
                    </div>
                );
                break;
            case 'Cut':
                block_content = (
                    <div>
                        <Row gutter={24}>
                            <Col span={20} style={{ textAlign: 'center' }}>
                                <AvatarEditor
                                    ref={this.setEditorRef}
                                    image={this.state.image}
                                    width={this.state.width}
                                    height={this.state.height}
                                    border={this.state.cutBorder}
                                    color={[0, 0, 0, 0.6]} // RGBA
                                    scale={this.state.scale}
                                    rotate={this.state.rotate}
                                />
                            </Col>
                            <Col span={4} style={{ backgroundColor: '#fff' }}>
                                <Form>
                                    <FormItem
                                        {...formItemLayout}
                                        label="剪裁比例"
                                    >
                                        <RadioGroup onChange={this.onAspectRatioChange} value={this.state.AspectRatio}>
                                            {this.state.dic_AspectRatios.map((item, index) => {
                                                return <Radio value={index}>{item.title}</Radio>
                                            })}
                                        </RadioGroup>
                                    </FormItem>
                                    <FormItem
                                        {...formItemLayout}
                                        label="缩放比例"
                                    >
                                        <Slider step={0.1} value={this.state.scale} min={1} max={2.5} onChange={this.onScaleChange} />
                                    </FormItem>
                                    <FormItem
                                        {...formItemLayout}
                                        label="最大边长"
                                    >
                                        <InputNumber min={480} max={2500} value={this.state.MaxSideLength} onChange={this.onMaxSideLengthChange} />
                                        <div style={{ marginTop: 10 }}>
                                            <Tag key={`default`}>常用:</Tag>
                                            {[1334, 1024].map((item, index) => {
                                                return <Tag key={`${item}`} onClick={() => { this.onMaxSideLengthChange(item) }}>
                                                    {item}
                                                </Tag>
                                            })
                                            }
                                        </div>
                                    </FormItem>
                                    <FormItem
                                        {...formItemLayout}
                                        label="图片名称"
                                    >
                                        {getFieldDecorator('ResourceName', {
                                            initialValue: this.state.dataModel.Title,
                                            rules: [{
                                                required: true, message: '请输入图片名称!',
                                            }],
                                        })(
                                            <Input />
                                            )}
                                    </FormItem>
                                    <FormItem
                                        {...formItemLayout}
                                        label="关键字"
                                    >
                                        {getFieldDecorator('Keywords', {
                                            initialValue: this.state.dataModel.Keywords,
                                            rules: [{
                                                required: true, message: '请填写关键字!',
                                            }],
                                        })(
                                            <EditableTagGroup />
                                            )}
                                    </FormItem>
                                    <FormItem
                                        className='btnControl'
                                        {...btnformItemLayout}
                                    >
                                        <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>保存</Button> <Button icon="rollback" onClick={this.onCancel} >取消</Button>
                                    </FormItem>
                                </Form>

                            </Col>
                        </Row>
                    </div>
                );
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        return (
            <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
                {block_editModeView}
            </Card>
        );
    }
}

const WrappedImageView = Form.create()(ImageView);

const mapStateToProps = (state) => {
    return {}
};

function mapDispatchToProps(dispatch) {
    return {
        vcg_Detail: bindActionCreators(vcg_Detail, dispatch),
        vcg_Download: bindActionCreators(vcg_Download, dispatch),
        vcg_SaveCutImageInfo: bindActionCreators(vcg_SaveCutImageInfo, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedImageView);