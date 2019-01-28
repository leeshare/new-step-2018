import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Card, InputNumber, Spin, Tabs, Checkbox } from 'antd';
import { getDictionaryTitle, ellipsisText, getWeekTitle } from '@/utils';
import { removeTeachRecordDetail } from '@/actions/teach';
import ModalPlayer from '@/components/ModalPlayer';
import ResourceCard from '@/components/ResourceCard';
const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
  wrapperCol: { span: 24 },
};
const formItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 22 },
};
class TeachStudentKHDP extends React.Component {
  timer = 0;
  uploads = [];
  constructor(props) {
    super(props)
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      student_teach_records: props.student_teach_records,//同班同学
      userChooseds: []
    };
  }

  componentWillMount() {

  }

  emptyHandler = () => { }

  onCancel = () => {
    this.props.viewCallback();
  }
  onSubmit = () => {
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.viewCallback({ ...this.state.dataModel, ...values, userChooseds: this.state.userChooseds });//合并保存数据
      }
    });
  }
  onSelectedChange = (item, checked) => {
    this.state.userChooseds = this.state.userChooseds.filter(A => A != item.teach_record_id);
    if (checked) {
      this.state.userChooseds.push(item.teach_record_id);
    }
    this.setState({ userChooseds: this.state.userChooseds });
    console.log(this.state.userChooseds);
  }
  onSelectedAll = (checked) => {
    if (checked) {
      let userChooseds = this.state.student_teach_records.filter(A => A != this.state.dataModel.teach_record_id).map((item) => {
        return item.teach_record_id;
      });
      this.setState({ userChooseds });
    }
    else {
      this.setState({ userChooseds: [] });
    }
  }
  //上传点评附件
  onUpload = (lecture) => {
    this.uploads = [...this.uploads, lecture];
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      let attachments_khdp = this.state.dataModel.attachments_khdp || [];
      this.state.dataModel.attachments_khdp = [...attachments_khdp, ...this.uploads];
      this.uploads = [];
      this.setState({ dataModel: this.state.dataModel })
    }, 500);
  }
  //删除点评附件
  onRemove = (lectureInfo) => {
    Modal.confirm({
      title: '你确认要删除该点评附件吗?',
      content: '请确认',
      onOk: () => {
        this.props.removeTeachRecordDetail(lectureInfo.id).payload.promise.then((response) => {
          this.state.dataModel.attachments_khdp = this.state.dataModel.attachments_khdp.filter(A => A.lecture_info.id != lectureInfo.id);
          this.setState({ dataModel: this.state.dataModel })
        });
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return <div className="form-edit">
      <Form>
        <FormItem
          {...formItemLayout}
          label="点评内容"
        >
          {getFieldDecorator('teacher_evaluate_content', {
            initialValue: this.state.dataModel.teacher_evaluate_content
          })(
            <TextArea rows={6} />
            )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="点评附件"
        >
          <Row gutter={24}>
            {this.state.loading ? '' : <Col onClick={() => { this.timer = 300; }} span={6} key={`ResourceCard_${this.state.dataModel.attachments_khdp.length + 1}`}>
              <ResourceCard
                lecture_info={{ object_type: 0, name: '上传:视频、图片' }}
                onPlayMedia={this.emptyHandler}
                onUpload={this.onUpload}
                teachRecordID={this.state.dataModel.teach_record_id} />
            </Col>
            }
            {
              this.state.dataModel.attachments_khdp.map((item, index) => {
                return (
                  <Col span={6}>
                    <ResourceCard
                      lecture_info={item.lecture_info}
                      onPlayMedia={this.props.onPlayMedia}
                      onRemove={() => { this.onRemove(item.lecture_info); }} />
                  </Col>
                );
              })
            }
          </Row>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="点评学员"
          extra={<Checkbox onChange={(e) => { this.onSelectedAll(e.target.checked) }}>全选 选中的学员将看到相同的点评附件！</Checkbox>}
        >
          <Row gutter={24}>
            <Col span={4}>
              <Checkbox defaultChecked={true} disabled>
                <img style={{ width: 100, borderRadius: '50%' }} src={this.state.dataModel.student_info.icon} />
                <div style={{ textAlign: 'center' }}>{this.state.dataModel.student_info.chinese_name}</div>
              </Checkbox>
            </Col>
            {
              this.state.student_teach_records.filter(A => A.teach_record_id != this.state.dataModel.teach_record_id).map((item, index) => {
                return <Col span={4}>
                  <Checkbox checked={this.state.userChooseds.find(A => A == item.teach_record_id) != null} onChange={(e) => { this.onSelectedChange(item, e.target.checked) }}>
                    <img style={{ width: 100, borderRadius: '50%' }} src={item.student_info.icon} />
                    <div style={{ textAlign: 'center' }}>{item.student_info.chinese_name}</div>
                  </Checkbox>
                </Col>
              })
            }
          </Row>
        </FormItem>
        <FormItem
          className='btnControl'
          {...btnformItemLayout}
        >
          <Button type="primary" icon="save" onClick={this.onSubmit}>保存</Button> <Button icon="rollback" onClick={this.onCancel} >取消</Button>
        </FormItem>
      </Form >
    </div >
  }
}



const WrappedTeachStudentKHDP = Form.create()(TeachStudentKHDP);

const mapStateToProps = (state) => {
  return {}
};

function mapDispatchToProps(dispatch) {
  return {
    removeTeachRecordDetail: bindActionCreators(removeTeachRecordDetail, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachStudentKHDP);
