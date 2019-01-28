import React from 'react'
import PropTypes from 'prop-types'
import { Card, Row, Col, Progress, Button, Icon, Input, Upload } from 'antd'
import { getDictionaryTitle, ellipsisText, getWeekTitle, convertJSONDateToJSDateObject } from '@/utils';
import { serverURL, getToken } from '@/api/env';
import './ResourceCard.less'

class ResourceCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      editMode: false,
    };
  }
  onStartEditName = () => {
    if (this.props.onEditName) {
      this.setState({ editMode: true })
    }
  }
  onEndEditName = (e) => {
    this.setState({ editMode: false })
    if (e.target.value != '' || e.target.value != this.props.lecture_info.name) {//触发名称修改
      if (this.props.onEditName) {
        this.props.onEditName(e.target.value);
      }
    }
  }
  render() {
    let { lecture_info, onPlayMedia, onRemove, onEditName, onUpload, extendInfo, teachScheduleID, teachRecordID } = this.props;
    let _this = this;
    let UploadProps = {
      name: 'file',
      multiple: true,
      action: teachScheduleID ? `${serverURL}/Xuetang/UploadTeachFile?teachScheduleID=${teachScheduleID}&token=${getToken()}` : `${serverURL}/Xuetang/UploadTeachRecordDetailContent?teachRecordID=${teachRecordID}&bizType=1&token=${getToken()}`,
      onChange(info) {
        if (info.file.status === 'done') {
          if (!info.file.response.result) {
            message.error(info.file.response.message);
          }
          else {
            //追加课件显示
            info.file.response.attachment_info ? onUpload(info.file.response.attachment_info) : onUpload(info.file.response.data);
          }
        }
      },
    }

    console.log(lecture_info)

    let block_image = "";
    switch (lecture_info.object_type) {
      case 1://图片
        block_image = <div className='cover' style={{ background: `url(${lecture_info.cut_image}) no-repeat center center`, backgroundSize: 'contain' }}></div>//<img style={{ width: '100%' }} src={lecture_info.cut_image} />
        break;
      case 2://音频
        block_image = <Icon className='icon' type="sound" />
        break;
      case 3://视频
        block_image = <div className='cover' style={{ background: `url(${lecture_info.cut_image}) no-repeat center center`, backgroundSize: 'contain' }}><Icon className='icon' type="play-circle-o" /></div>//<img style={{ width: '100%' }} src={lecture_info.cut_image} />
        break;
      case 4://文档
        block_image = <Icon className='icon' type="file-pdf" />
        break;
      case 0://直接上传
        block_image = <Upload {...UploadProps}><Icon className='icon' type="upload" /></Upload>
        break;
      case -1://资料库查找
        block_image = <Icon className='icon' type="search" />
        break;
    }
    if (lecture_info.taskType == 1) {
      lecture_info.name = lecture_info.taskName;
      block_image = <Icon className='icon' type='file-ppt' />
    }
    else if (lecture_info.taskType == 2) {
      lecture_info.name = lecture_info.taskName;
      block_image = <Icon className='icon' type='tablet' />
    }
    return <Card className='ResourceCard' bodyStyle={{ padding: 0 }}>
      <div className='ResourceCover' onClick={() => { onPlayMedia(lecture_info) }}>
        {block_image}
      </div>
      <div style={{ padding: '10px 16px' }}>
        <h3 onClick={this.onStartEditName}>{this.state.editMode ? <Input defaultValue={lecture_info.name} onBlur={this.onEndEditName} /> : lecture_info.name}</h3> {onRemove ? <div onClick={onRemove} className="remove"><Icon type="delete" /></div> : ''}
        <p style={{ color: '#999' }}>
          {extendInfo ? <div className="extendInfo">{extendInfo()}</div> : ''}</p>
      </div>
    </Card>
  }
}
export default ResourceCard
