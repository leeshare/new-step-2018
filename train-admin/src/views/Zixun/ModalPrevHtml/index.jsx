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
class ModalPrevHtml extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.dataModel
        };
    }


    render() {
       
        return <Modal width={600}
            title=""
            closable={true}
            wrapClassName="vertical-center-modal"
            visible={true}
            cancelText="确认"
            onCancel={() => {
                this.props.onCancel();
            }}
            footer={null}
        >
           <div>
               <div　className='header'>{this.props.title}</div>
               <div><span className='author'>{this.props.realname}</span><span className="date">{this.props.datetime}</span></div>
               <div>
                   <span className="content" dangerouslySetInnerHTML={{ __html: this.props.dataHtml }}></span>
                   </div>
           </div>
        </Modal>
    }
}


const WrappedModalPrevHtml = Form.create()(ModalPrevHtml);

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
export default connect(mapStateToProps, mapDispatchToProps)(WrappedModalPrevHtml);