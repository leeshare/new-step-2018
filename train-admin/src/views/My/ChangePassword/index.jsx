import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card } from 'antd';

//import { changePassword } from '@/actions/admin';
import { changePassword } from '@/actions/auth';
const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
};
class ModalChangePasswordView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        };
    }

    componentWillMount() {

    }

    checkPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            callback('两次输入的密码不一致！');
        } else {
            callback();
        }
    }
    onSubmit = (callback) => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.changePassword(values).payload.promise.then((response) => {
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
        return <Modal width={600}
            title="修改密码"
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
                    label="旧密码"
                >
                    {getFieldDecorator('old_password', {
                        initialValue: '',
                        rules: [{
                            required: true, message: '请输入旧密码!',
                        }],
                    })(
                        <Input type="password" />
                        )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="新密码"
                >
                    {getFieldDecorator('password', {
                        initialValue: '',
                        rules: [{
                            required: true, message: '请输入新密码!',
                        }],
                    })(
                        <Input type="password" />
                        )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="确认密码"
                >
                    {getFieldDecorator('password1', {
                        initialValue: '',
                        rules: [{
                            required: true, message: '请输入确认密码!',
                        }, {
                            validator: this.checkPassword,
                        }],
                    })(
                        <Input type="password" />
                        )}
                </FormItem>
            </Form>
        </Modal>
    }
}


const WrappedModalChangePasswordView = Form.create()(ModalChangePasswordView);

const mapStateToProps = (state) => {
    return {

    }
};

function mapDispatchToProps(dispatch) {
    return {
        changePassword: bindActionCreators(changePassword, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedModalChangePasswordView);
