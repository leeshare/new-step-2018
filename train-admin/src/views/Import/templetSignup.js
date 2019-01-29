/*
学生导入模板
2018-11-15
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Modal, Upload
} from 'antd';
const FormItem = Form.Item;

import { formatMoney, timestampToTime, getDictionaryTitle, openExport } from '@/utils';
import { getToken, serverURL } from '@/api/env';

import ContentBox from '@/components/ContentBox';
import {
  loadBizDictionary, onSearch, onPageIndexChange,
  onShowSizeChange, searchFormItemLayout
} from '@/utils/componentExt';
import FileDownloader from '@/components/FileDownloader';

//业务接口方法引入
import { importStudentSignup } from '@/actions/file';

const formItemLayout24 = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};
const btnformItemLayout = {
  wrapperCol: { span: 24 },
};


class templetSignup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: '',
      loading: false,
      pagingSearch: props.pagingSearch,

      uploading: false,
      fileList: [],

      isImported: false,
      successCount: 0,
      errorCount: 0,
      errorJsonStr: '',
      error_url: ''
    };
    this.onSearch = onSearch.bind(this);
    (this: any).onCancel = this.onCancel.bind(this);
    (this: any).onSave = this.onSave.bind(this);
    //(this: any).onExport = this.onExport.bind(this);
    (this: any).onSaveStudentSignup = this.onSaveStudentSignup.bind(this);
  }
  componentWillMount() {
  }

  onSaveStudentSignup(url: string) {
    this.setState({ loading: true })
    this.props.importStudentSignup({ filePath: url }).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        //alert(JSON.stringify(data))
        var url = data.excelFilePath;
        window.open(url);
        this.setState({
          loading: false,
        })
        /*that.setState({
          isImported: true,
          successCount: data.data.successCount,
          errorCount: data.data.errCount,
          errorJsonObj: data.data.error,
          error_url: `/edu/courseArrangeImport/errCourseExports`,
        })*/
      }
    })
  }

  onCancel = () => {
    this.props.viewCallback();
  }

  onSave = () => {
    var that = this;
    const { fileList } = this.state;
    const formData = new FormData();
    //fileList.forEach((file) => {
    //  formData.append('files[]', file);
    //});
    if (!fileList.length) {
      message.error("请上传一个文件");
      return;
    }
    let token = getToken();
    formData.append('file', fileList[0]);
    formData.append('token', token);

    this.setState({
      uploading: true,
      isImported: false
    });

    const successFn = (response) => {
      console.log(xhr.responseText);
      var data = eval('(' + xhr.responseText + ')');
      if (data.result) {
        // 假设服务端直接返回文件上传后的地址
        // 上传成功后调用param.success并传入上传后的文件地址
        var fileUrl = data.data.url;
        if (fileUrl) {
          that.onSaveStudentSignup(fileUrl);
        }
      }
      else {
        message.error(data.message);
      }
    }

    const progressFn = (event) => {
      // 上传进度发生变化时调用param.progress
      //param.progress(event.loaded / event.total * 100)
    }

    const errorFn = (response) => {
      // 上传发生错误时调用param.error
      message.error('上传失败!');
    }

    let uploadUrl = `${serverURL}/Admin/UploadFile?token=${token}&functionType=ExcelFiles`;
    //let uploadUrl = `${env.serverURL}/sso/importStudent?token=${token}`;
    const xhr = new XMLHttpRequest
    xhr.upload.addEventListener("progress", progressFn, false)
    xhr.addEventListener("load", successFn, false)
    xhr.addEventListener("error", errorFn, false)
    xhr.addEventListener("abort", errorFn, false)
    xhr.open('POST', uploadUrl, true)
    //xhr.responseType
    xhr.send(formData)
  }

  render() {
    const { uploading } = this.state;
    const props = {
      action: '//jsonplaceholder.typicode.com/posts/',
      onRemove: (file) => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {
        //this.setState(({ fileList }) => ({ fileList: [...fileList, file] }));
        this.setState({
          fileList: [file]
        })
        return false;
      },
      //fileList: this.state.fileList,
      fileList: this.state.fileList.length ? [this.state.fileList[this.state.fileList.length - 1]] : [],
      multiple: false
    };

    let block_content = <div></div>
    var url = serverURL + "/excelTemplate/学生导入报名模板.xls";
    switch (this.state.editMode) {
      case 'Manage':
      default:
        block_content = (
          <div style={{width:'100%'}}>
            <Form className="search-form" enctype="multipart/form-data" method="post">
              <Row type='flex' justify='start' align='middle' gutter={24}>
                <Col span={8}>
                  点击
                  {<a target="_blank" onClick={() => { window.open(url) }}>下载上传模板</a>}
                </Col>
                <Col span={8}>
                  <FormItem {...formItemLayout24} label='选择上传文档' style={{marginBottom:0}}>
                    <Upload {...props}>
                      <Button>
                        <Icon type="upload" /> 选择文件上传
                      </Button>
                    </Upload>
                  </FormItem>
                </Col>
                <Col>
                  <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSave}>保存</Button>
                </Col>
              </Row>

              <Row>
                {this.state.isImported &&
                  <Col span={24}>
                    成功导入{this.state.successCount}条。导入失败{this.state.errorCount}条。
                    {this.state.errorCount ?
                      <FileDownloader
                        apiUrl={this.state.error_url}//api下载地址
                        method={'post'}//提交方式
                        //options={'token': env.getToken()}//提交参数
                        title={'导出错误记录'}
                      />
                      : ''
                    }
                  </Col>

                }
              </Row>
            </Form>
          </div>
        )
        break;
    }
    return (
      <ContentBox titleName={"学生报名导入"}>
        <div className="dv_split"></div>
        {block_content}
        <div className="dv_split"></div>
      </ContentBox>
    )
  }
}
//表单组件 封装
const WrappedManage = Form.create()(templetSignup);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //courseArrangeImport: bindActionCreators(courseArrangeImport, dispatch),
    importStudentSignup: bindActionCreators(importStudentSignup, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
