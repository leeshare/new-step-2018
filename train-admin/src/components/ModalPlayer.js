import React from 'react'
import PropTypes from 'prop-types'
import { Card, Row, Col, Progress, Button, Icon, Modal } from 'antd'
import { getDictionaryTitle, ellipsisText, getWeekTitle, convertJSONDateToJSDateObject } from '@/utils';
import './ModalPlayer.less';
//视频播放器
import { DefaultPlayer as Video } from 'react-html5video';
import 'react-html5video/dist/styles.css';
//pdf文档播放器
import PDFViewer from './PDFViewer'

function ModalPlayer({ lecture_info, visible, onCancel }) {
  let block_image = "";
  switch (lecture_info.object_type) {
    case 1://图片
      block_image = <div className='cover' style={{background:`url(${lecture_info.cut_image}) no-repeat center center`,backgroundSize: 'contain'}}></div>
      break;
    case 2://音频
      block_image = <Video autoPlay
        controls={['PlayPause', 'Seek', 'Time', 'Volume', 'Fullscreen']}
        onCanPlayThrough={() => {
          // Do stuff
        }}>
        <source src={lecture_info.media_info.media_url} type="video/mp4" />
      </Video>
      break;
    case 3://视频
      block_image = <Video autoPlay
        controls={['PlayPause', 'Seek', 'Time', 'Volume', 'Fullscreen']}
        onCanPlayThrough={() => {
          // Do stuff
        }}>
        <source src={lecture_info.media_info.media_url} type="video/mp4" />
      </Video>
      break;
    case 4://文档
      block_image = <PDFViewer callback={(currentPage, pages) => { alert(`${currentPage}/${pages}`) }} lecture_info={lecture_info} startPage={1} />

      break;
  }
  return (
    <Modal className='playResource' width={'70%'}
      title="播放"
      wrapClassName="vertical-center-modal"
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      {block_image}
    </Modal>
  );
}

ModalPlayer.propTypes = {
  lecture_info: PropTypes.object,
}

export default ModalPlayer
