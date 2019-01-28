import React from 'react'
import PropTypes from 'prop-types'
import { message, Card, Row, Col, Progress, Button, Icon, Input, Upload } from 'antd'
import { getDictionaryTitle, ellipsisText, getWeekTitle, convertJSONDateToJSDateObject } from '@/utils';
import { serverURL, getToken } from '@/api/env';
// 引入编辑器以及编辑器样式
import BraftEditor from 'braft-editor'
import 'braft-editor/dist/braft.css'

class RichTextEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: props.value || '',
      is10M: false
    };
  }


  handleChange = (content) => {
    
      console.log('----------------'+content);
  }

  handleHTMLChange = (html) => {
    console.log(html);
    this.setState({ value: html })
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(html);
    }
  }
  render() {
    var that = this;
    const editorProps = {
      height: 300,
      contentFormat: 'html',
      initialContent: this.state.value,
      onChange: this.handleChange,
      onHTMLChange: this.handleHTMLChange,
      pasteMode:'html',
      controls: [
        'undo', 'redo', 'split', 'font-size', 'font-family', 'text-color',
        'bold', 'italic', 'underline', 'strike-through', 'superscript',
        'subscript', 'text-align', 'split', 'headings', 'list_ul', 'list_ol',
        'blockquote', 'code', 'split', 'link', 'split', 'media', 'remove-styles'
      ],
      media: {
        image: true, // 开启图片插入功能
        video: true, // 开启视频插入功能
        audio: true, // 开启音频插入功能
        externalMedias: {
          audio: false,
          video: false,
          image: false,
          embed: false
        },
        validateFn: (file) => {
          var a = file.size < 1024 * 1024 * 30;
          if(!a)
          {
            message.info("抱歉！您上传的文件太大了，请上传小于30M的视频文件")
          }
          return a;  //10M大小
        }, // 指定本地校验函数，说明见下文
        uploadFn: (param) => {
          /*
          {
            file: [File Object],
            progress: function (progress) {
              // progress为0到100
            },
            libraryId: 'XXXXX',
            success: function (res) {
              // res须为一个包含已上传文件url属性的对象：
            },
            error: function (err) {

            }
          }
          */
          let token = getToken();
          let functiontype = this.props.functionType || 'Editor';
          let uploadUrl = `${serverURL}/Admin/UploadFile?token=${token}&FunctionType=${functiontype}`;
          const xhr = new XMLHttpRequest
          const fd = new FormData()

          // libraryId可用于通过mediaLibrary示例来操作对应的媒体内容
          console.log(param.libraryId)

          const successFn = (response) => {
            console.log(xhr.responseText);
            var jsonInfo = eval('(' + xhr.responseText + ')');
            if (jsonInfo.result) {
              // 假设服务端直接返回文件上传后的地址
              // 上传成功后调用param.success并传入上传后的文件地址
              param.success({
                url: jsonInfo.data.fullUrl
              })
            }
            else {
              param.error({ msg: jsonInfo.message });
            }
          }

          const progressFn = (event) => {
            // 上传进度发生变化时调用param.progress
            param.progress(event.loaded / event.total * 100)
          }

          const errorFn = (response) => {
            // 上传发生错误时调用param.error
            // param.error({
            //   msg: '上传失败!'
            // })
            if (that.state.is10M) {
              message.info("抱歉！您上传的文件太大了，请上传小于30M的视频文件")
            }
          }


          xhr.upload.addEventListener("progress", progressFn, true)
          xhr.addEventListener("load", successFn, true)
          xhr.addEventListener("error", errorFn, true)
          xhr.addEventListener("abort", errorFn, true)

          fd.append('file', param.file)
          xhr.open('POST', uploadUrl, true)
          xhr.send(fd)

        } // 指定上传函数，说明见下文
      }
    }

    return (
      <div className="rich-text-editor">
        <BraftEditor {...editorProps} />
      </div>
    )
  }
}
export default RichTextEditor
