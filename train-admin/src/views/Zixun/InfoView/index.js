import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, DatePicker, Radio, Checkbox } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, convertTextToHtml, dataBind, dateFormat } from '@/utils';
const FormItem = Form.Item;
const TextArea = Input.TextArea;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const { TextAre, Search } = Input;
import RichTextEditor from '@/components/RichTextEditor';
import ImageUpload from '@/components/ImageUpload';
import ModalPrevHtml from '@/views/Zixun/ModalPrevHtml';
import FileManage from '@/views/File/share_manage_new';
import ButtonGroup from '@/components/ButtonGroup';
import './index.less';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const formItemLayout = {
    labelCol: { span: 2 },
    wrapperCol: { span: 21 },
};
//import './index.less';
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class InfoView extends React.Component {
    constructor(props) {
        super(props)
        let formImagePaths = props.currentDataModel.covers.map((item) => {
            return { value: item.path, url: item.coverPath };
        });
        if (formImagePaths.length < 3) {
            formImagePaths.push({ value: '', url: '' });
        }
        props.currentDataModel.FormImagePaths_Temp = formImagePaths;
        let channels = props.currentDataModel.channelList.map(item => { return item.value });
        props.currentDataModel.channels = channels;
        let channellabels = props.currentDataModel.channelList.map(item => { return item.label })
        props.currentDataModel.channellabels = channellabels;
        if (props.channel_data_List) {
            props.currentDataModel.channel_data_List = props.channel_data_List;
        }
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            disabled: false,
            showPrevHtml: false,
            loading: false,
            showFiles: false,

            tags: [],
            tagNames: props.currentDataModel.tagNames || [],
        };
        (this: any).onChannelChange = this.onChannelChange.bind(this);
        (this: any).onTagChange = this.onTagChange.bind(this);
    }

    componentWillMount() {
      var ids = this.props.currentDataModel.channels;
      if(ids.length){
        this.onChannelChange(ids)
      }
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = (status) => {
        if (this.props.editMode == "Delete") {
            Modal.confirm({
                title: '你确认要删除吗?',
                content: '请确认',
                onOk: () => {
                    this.props.viewCallback(this.state.dataModel);//保存数据
                },
                onCancel: () => {
                    console.log('Cancel');
                },
            });
        }
        else {
            //表单验证后，合并数据提交
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    //按钮点击后加装状态
                    this.setState({ loading: true });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 3000);//合并保存数据
                    this.props.viewCallback({
                      ...this.state.dataModel,
                      ...values,
                      status: status,
                      tagNames: this.state.tagNames 
                    });//合并保存数据
                }
            });
        }
    }
    onOpenfiles = () => {
        this.setState({ showFiles: true })
    }

    onSearchUserInfo = (e) => {
        this.props.getUserInfoByUserName(e.target.value).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.UserID != '') {
                this.setState({ findUser: true });
                message.info('根据邮箱找到对应用户!')
                this.setState({ dataModel: { ...this.state.dataModel, ...data } });
            }
            else {
                this.setState({ findUser: false });
            }
        })
    }
    //标题
    getTitle() {
        if (this.props.editMode == 'CourseAudit') {
            return '资讯管理'
        }
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}资讯信息`;
    }
    onPreView() {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                var dataModel = this.state.dataModel;
                dataModel.title = values.title;
                dataModel.content = values.content;
                this.setState({ dataModel: dataModel });
            }
        });
        this.setState({ showPrevHtml: true })
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                {this.props.editMode != 'Delete' && <Button type="primary" disabled={this.state.disabled} loading={this.state.loading} icon="save"
                    onClick={() => { this.onSubmit(0) }}>{'保存草稿'}</Button>}

                {this.props.editMode != 'Delete' && <Button type="primary" disabled={this.state.disabled} loading={this.state.loading} icon="save"
                    onClick={() => { this.onSubmit(1) }} className='button_send'>{'发布'}</Button>}
                {this.props.editMode == 'Delete' && <Button type="primary" disabled={this.state.disabled} loading={this.state.loading} icon="save"
                    onClick={() => { this.onSubmit() }} className='button_send'>{'删除'}</Button>}
                {this.props.editMode != 'Delete' && <Button type="primary" disabled={this.state.disabled} loading={this.state.loading} icon="save"
                    onClick={() => { this.onPreView() }} className='button_send'>{'预览'}</Button>}
                <Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    }
    onCourseLevelsChange(item, values) {
        var FormCourseAuths = this.state.dataModel.FormCourseAuths || [];
        var find = FormCourseAuths.find(A => A.CourseSpecialty == item.value);
        if (find) {
            find.CourseLevels = values;
        }
        else {
            FormCourseAuths.push({ CourseSpecialty: item.value, CourseLevels: values })
        }
        this.state.dataModel.FormCourseAuths = FormCourseAuths;
        this.setState({ dataModel: this.state.dataModel })
    }
    onSelectedAllCourseLevels(item, checked) {
        var FormCourseAuths = this.state.dataModel.FormCourseAuths || [];
        var values = checked ? item.CourseLevels.map(A => A.value).join(',') : "";
        var find = FormCourseAuths.find(A => A.CourseSpecialty == item.value);
        if (find) {
            find.CourseLevels = values;
        }
        else {
            FormCourseAuths.push({ CourseSpecialty: item.value, CourseLevels: values })
        }
        this.state.dataModel.FormCourseAuths = FormCourseAuths;
        this.setState({ dataModel: this.state.dataModel })
    }
    onChannelChange(choosedChannelIds){
      var that = this;
      var tags = [];
      if(choosedChannelIds.length){
        choosedChannelIds.map(id => {
          that.props.channel_data_List.map(c => {
            if(c.InfoChannelID == id){
              if(c.tags.length){
                //tags.splice((tags.length > 0 ? tags.length - 1 : 0), c.tags.length, c.tags)
                c.tags.map(t => {
                  tags.push(t);
                })
              }
            }
          })
        })
      }
      this.setState({
        tags: tags
      })
    }
    onTagChange(choosedTagIds){
      var names = [];
      this.state.tags.map(t => {
        choosedTagIds.map(id => {
          if(id == t.value){
            names.push(t.label);
          }
        })
      })
      this.setState({
        tagNames: names
      })
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        let channelList = this.state.dataModel.channel_data_List.map(item => {
            return { label: item.InfoChannelName, value: item.InfoChannelID }
        });
        var that = this;
        var tagIds = [];
        (this.state.dataModel.tagNames || []).map(name => {
            that.state.tags.map(t => {
              if(t.label == name){
                tagIds.push(t.value);
              }
            })
        })


        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                let defaultBirthDate = dateFormat(new Date(), 'yyyy-MM-dd')
                block_content = (<div className="form-edit">
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="标题"
                        >
                            {getFieldDecorator('title', {
                                initialValue: this.state.dataModel.title,
                                rules: [{
                                    required: true, message: '请输入标题!(5-50)',
                                }],
                            })(
                                <Input onChangeText={this.setState} />
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="资讯内容"
                            extra=""
                        >
                            {getFieldDecorator('content', {
                                initialValue: this.state.dataModel.content,
                                rules: [{
                                    required: true, message: '请输入资讯内容',
                                }]
                            })(
                                <RichTextEditor functionType={'ZixunFiles'} />
                            )}

                        </FormItem>
                        <FormItem
                            className='btnControl'
                            {...formItemLayout}

                        >
                            {this.props.editMode != 'Delete' && <div><Button type="primary" disabled={this.state.disabled} loading={this.state.loading} icon="save"
                                onClick={() => { this.onOpenfiles() }} className='button_send'>{'打开文件资料'}</Button></div>}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="选择封面"
                        >
                            {getFieldDecorator('coverType', {
                                initialValue: dataBind(this.state.dataModel.coverType),
                            }
                            )(
                                <RadioGroup size="large">
                                    <RadioButton value="1">单图</RadioButton>
                                    <RadioButton value="2">三图</RadioButton>
                                    <RadioButton value="0">无图</RadioButton>
                                </RadioGroup>
                            )}
                        </FormItem>

                        <FormItem
                            {...formItemLayout}
                            label="图片列表"
                            extra="建议尺寸：1024*718px；大小：200kb左右"
                        >
                            <Row className="AppBackGroundImageList">
                                {this.state.dataModel.FormImagePaths_Temp.map((item, index) => {
                                    return <div className='dv_img_list' style={{ marginBottom: 24 }}>
                                        <ImageUpload index={index} value={item.url} functionType={'ZixunFiles'} onChange={(value, url) => {
                                            var item = this.state.dataModel.FormImagePaths_Temp[index];
                                            if (item.value == '' && this.state.dataModel.FormImagePaths_Temp.length < 3) {
                                                this.state.dataModel.FormImagePaths_Temp.push({ value: '', url: '' })
                                            }
                                            item.value = value;
                                            item.url = url;
                                            this.setState({ dataModel: this.state.dataModel })
                                        }} onDelete={() => {
                                            //var item = this.state.dataModel.FormImagePaths_Temp[index];
                                            this.state.dataModel.FormImagePaths_Temp = this.state.dataModel.FormImagePaths_Temp.filter((a, b) => { return b != index });
                                            console.log(this.state.dataModel.FormImagePaths_Temp)
                                            if (this.state.dataModel.FormImagePaths_Temp.length < 3 && !this.state.dataModel.FormImagePaths_Temp.find(item => item.value == '')) {
                                                this.state.dataModel.FormImagePaths_Temp.push({ value: '', url: '' })
                                            }
                                            this.setState({ dataModel: this.state.dataModel })
                                        }} />
                                    </div>
                                })
                                }
                            </Row>
                        </FormItem>

                        <FormItem
                            {...formItemLayout}
                            label="资讯频道"
                        >
                            {getFieldDecorator('channelList', {
                                initialValue: this.state.dataModel.channels,
                                rules: [{
                                    required: true, message: '请选择资讯频道',
                                }]
                            })(
                                //<div style={{ marginTop: 8 }}>
                                <CheckboxGroup options={channelList} onChange={this.onChannelChange} />
                                //</div>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="频道标签"
                        >
                            {getFieldDecorator('tagList', {
                                initialValue: tagIds,
                                rules: [{
                                    required: false, message: '请选择频道标签',
                                }]
                            })(
                                <CheckboxGroup options={this.state.tags} onChange={this.onTagChange} />
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="是否推荐"
                        >
                            {getFieldDecorator('isRecommend', {
                                initialValue: dataBind(this.state.dataModel.isRecommend),
                            }
                            )(
                                <RadioGroup size="large">
                                    <RadioButton value="1">是</RadioButton>
                                    <RadioButton value="0">否</RadioButton>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="是否置顶"
                        >
                            {getFieldDecorator('isTop', {
                                initialValue: dataBind(this.state.dataModel.isTop),
                            }
                            )(
                                <RadioGroup size="large">
                                    <RadioButton value="1">是</RadioButton>
                                    <RadioButton value="0">否</RadioButton>
                                </RadioGroup>

                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="置顶天数"
                        >
                            {getFieldDecorator('topNum', {
                                initialValue: dataBind(this.state.dataModel.topNum),
                            }
                            )(
                                <Input />
                            )}
                        </FormItem>

                        {this.renderBtnControl()}
                    </Form>
                </div>
                );
                break;
            case "View":
            case "Delete":
                block_content = (
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="标题"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.title}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="资讯内容"
                        >
                            <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: this.state.dataModel.content }}></span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='封面图片'
                            className='ant-table'
                        >
                            {
                                this.state.dataModel.covers.map(item => {
                                    return <div className='img_wrap'><img style={{ width: '100%', height: '100%' }} className='img_item' src={item.coverPath} /></div>
                                })
                            }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="资讯频道"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.channellabels.join(',')}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="是否推荐"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.isRecommend == 1 ? '是' : '否'}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="是否置顶"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.isTop == 1 ? '是' : '否'}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="置顶天数"
                        >
                            <span className="ant-form-text" >{this.state.dataModel.topNum}</span>
                        </FormItem>
                        {this.renderBtnControl()}
                    </Form>
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
                {
                    this.state.showPrevHtml ?
                        <ModalPrevHtml
                            dataHtml={this.state.dataModel.content}
                            title={this.state.dataModel.title}
                            realname={this.state.dataModel.infoAuthor || this.props.userInfo.name}
                            datetime={this.state.dataModel.publishDate}
                            onCancel={() => {
                                this.setState({ showPrevHtml: false });
                            }} /> : ''
                }
                {
                    this.state.showFiles ?
                        <Modal width={1200}
                            title=""
                            closable={true}
                            wrapClassName="vertical-center-modal"
                            visible={true}
                            cancelText="确认"
                            onCancel={() => {
                                this.setState({ showFiles: false });
                            }}
                            footer={null}
                        >
                            <FileManage />
                        </Modal> : ''
                }
            </Card>
        );
    }
}

const WrappedStudentView = Form.create()(InfoView);

const mapStateToProps = (state) => {
    let userInfo = state.auth.user;
    return {
        userInfo: userInfo,
    }
};

function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedStudentView);
