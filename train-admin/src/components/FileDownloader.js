import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { message, Card, Row, Col, Progress, Button, Icon, Input, Upload } from 'antd'
import { getDictionaryTitle, ellipsisText, getWeekTitle, convertJSONDateToJSDateObject } from '@/utils';
import { serverURL, getToken } from '@/api/env';

class FileDownloader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      title: props.title || '下载',
      apiUrl: props.apiUrl || '',
      method: props.method || 'post',
      type: props.type || '',
    };
    (this: any).download2 = this.download2.bind(this);
    (this: any).download = this.download.bind(this);
  }

  download2(){
    var that = this;
    if(this.props.clickCallback){
      this.props.clickCallback(function(options){
        that.download(options);
      });
    }else {
      this.download();
    }
  }

  download = (option) => {
    let { apiUrl } = this.state;
    let options = option ? option : this.props.options || [];//获取参数
    var divElement = document.getElementById("downloadDiv");
    var downloadUrl = `${serverURL}${apiUrl}`;
    var params = {
      token: getToken(),
      ...options
    }
    ReactDOM.render(
      <form action={downloadUrl} method={this.state.method}>
        {Object.keys(params).map((key, index) => {
          return <input name={key} type="hidden" value={params[key]} />
        })
        }
      </form>,
      divElement
    )
    ReactDOM.findDOMNode(divElement).querySelector('form').submit();
    ReactDOM.unmountComponentAtNode(divElement);
  }

  render() {
    return (
      <span>
        <Button onClick={this.download2} icon="export" className="button_dark">{this.state.title}</Button>
        <div id='downloadDiv' style={{ display: 'none' }}></div>
      </span>
    )
  }
}
export default FileDownloader
