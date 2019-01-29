import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card,Radio } from 'antd';
import './index.less';
//import ImageUpload from '@/components/ImageUpload';
import ImageCutUpload from '@/components/ImageCutUpload';
import { changeUserInfo } from '@/actions/admin';
const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
};
class ModalModalChangeUserInfoView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.dataModel
        };
    }

    componentWillMount() {

    }

    onSubmit = (callback) => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.changeUserInfo({...this.state.dataModel,...values}).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        callback && callback();
                    }
                })
            }
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return <Modal width={800}
            title="修改个人信息"
            wrapClassName="vertical-center-modal"
            visible={true}
            okText="提交"
            cancelText="取消"
            onOk={() => {
                this.onSubmit(() => {
                    this.props.onCancel();
                })
            }}
            onCancel={() => {
                this.props.onCancel();
            }}
        >
            <Form>
                <FormItem
                    {...formItemLayout}
                    label="姓名"
                >
                    {getFieldDecorator('RealName', {
                        initialValue: this.state.dataModel.RealName,
                        rules: [{
                            required: true, message: '请输入姓名!',
                        }],
                    })(
                        <Input />
                        )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="头像"
                    extra="点击图片可以重新上传"
                >
                    {getFieldDecorator('FormImagePath', {
                        initialValue: this.state.dataModel.Icon,
                    }
                    )(
                        <ImageCutUpload width={300} height={300} />
                        )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="性别"
                >
                    {getFieldDecorator('Sex',{
                        initialValue: this.state.dataModel.Sex,
                    })(
                        <RadioGroup>
                            {this.state.dataModel.Sex==0?<Radio value="0">未设置</Radio>:''}
                            <Radio value="1">男</Radio>
                            <Radio value="2">女</Radio>
                        </RadioGroup>
                    )}
                </FormItem>

            </Form>
        </Modal>
    }
}


const WrappedModalModalChangeUserInfoView = Form.create()(ModalModalChangeUserInfoView);

const mapStateToProps = (state) => {
    let userInfo = state.auth.user;
    return {
        dataModel: { UserID: userInfo.uid, RealName: userInfo.name, FormImagePath: '', Icon: userInfo.icon,Sex:userInfo.gender.toString() }
    }
};

function mapDispatchToProps(dispatch) {
    return {
        changeUserInfo: bindActionCreators(changeUserInfo, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedModalModalChangeUserInfoView);