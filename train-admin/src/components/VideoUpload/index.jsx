import React from 'react';
import { Upload, Icon, message, Modal,Progress } from 'antd';
import './index.less';
import { serverURL, getToken } from '../../api/env';

import VideoLibraryManage from '@/views/TM_Resource/VideoResourceLibrary.jsx'
import ModalPlayer from '@/components/ModalPlayer';
function beforeUpload(file) {
    console.log(file)
    return true;
}

class VideoUpload extends React.Component {
    state = {};
    constructor(props) {
        super(props)
        this.state = {
            audioUrl: this.props.value || '',
            hasAudio: (this.props.value || '') != '',
            modalVisible: false,
            loading: false,
            percent: 0,
        };
    }
    componentWillReceiveProps(nextProps) {
        // Should be a controlled component.
        if ('value' in nextProps) {
            const value = nextProps.value;
            if (value) {
                this.setState({ hasAudio: true });
            }
            //this.setState({ audioUrl: value });
        }
    }
    triggerChange = (changedValue, videoUrl, resourceType) => {
        // Should provide an event to pass value to Form.
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(changedValue, videoUrl, resourceType);
        }
    }

    getLocalAudio(audioFile, callback) {
        var localUrl = URL.createObjectURL(audioFile);
        this.setState({ audioUrl: localUrl });
        this.onShowMediaPlayer(3, localUrl);
    }
    handleChange = (info) => {
        if (info.file.status === 'uploading') {
            this.setState({ percent: info.file.percent.toFixed(0), loading: true })
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            this.getLocalAudio(info.file.originFileObj, audioUrl => this.setState({ audioUrl }));
            if (false === info.file.response.result) {
                message.error(info.file.response.message);
            }
            else {
                this.setState({
                    loading: false,
                    percent: 0,
                });
                var ResourceType = 3;//视频
                if (info.file.response.data.type == ".mp3") {
                    ResourceType = 2;//音频
                }
                this.triggerChange(info.file.response.data.url, info.file.response.data.fullUrl, ResourceType);//上传回调
            }
        }
    }
    onShowAudioLibrary = () => {
        this.setState({ modalVisible: true });
    }
    onSelectedAudioLibrary = (obj) => {
        this.triggerChange("resource://" + obj.ResourceID, obj.FileUrl, obj.ResourceType);
        this.setState({ audioUrl: obj.FileUrl, modalVisible: false })
    }

    onShowMediaPlayer = (mediaType, url) => {
        this.setState({ currentMedia: { object_type: mediaType, media_info: { media_url: url } }, showPlayMedia: true });
    }
    onCancelPlay = () => {
        this.setState({ currentMedia: null, showPlayMedia: false });
    }
    render() {
        const audioUrl = this.state.audioUrl;
        let token = getToken();
        let uploadUrl = `${serverURL}/Admin/UploadFile?token=${token}`;
        if (this.props.functionType) {
            let functionType = this.props.functionType;
            uploadUrl = `${serverURL}/Admin/UploadFile?token=${token}&functionType=${functionType}`;
        }
        return (
            <div className="AudioUpload">
                {
                    this.state.currentMedia ? <ModalPlayer lecture_info={this.state.currentMedia} visible={this.state.showPlayMedia} onCancel={this.onCancelPlay} /> : ''
                }
                <Modal className='imageLibrary' width={'80%'}
                    title={this.props.SupportVideoAndAudio ? '视频/音频库中选择' : '视频库中选择'}
                    wrapClassName="vertical-center-modal"
                    visible={this.state.modalVisible}
                    onCancel={() => { this.setState({ modalVisible: false }) }}
                    footer={null}
                >
                    <VideoLibraryManage callback={this.onSelectedAudioLibrary} SupportVideoAndAudio={this.props.SupportVideoAndAudio || false} />
                </Modal>
                <Upload style={{ ...this.props.avatarStyle }}
                    className="avatar-uploader"
                    name="avatar"
                    // accept={'video/mp4,video/m4v,video/mov,video/rmvb,video/wmv,video/mpg,video/avi,video/flv'}
                    accept={'video/*'}
                    showUploadList={false}
                    action={uploadUrl}
                    beforeUpload={beforeUpload}
                    onChange={this.handleChange}
                >
                    {this.state.loading && <div style={{ margin: 4 }}><Progress percent={this.state.percent} size="small" /></div>}
                    <Icon type="plus" className="avatar-uploader-trigger" />
                </Upload>
                {
                    this.state.hasAudio &&
                    <a onClick={(e) => { this.onShowMediaPlayer(3, this.state.audioUrl) }} ><Icon type="play-circle-o" />播放文件</a>
                }
                {
                    this.state.hasAudio &&
                    <a style={{ marginLeft: 5 }} href={this.state.audioUrl} target="_blank">下载文件</a>
                }
                {/* {!this.props.hideLibrary && <a style={{ marginLeft: 5 }} onClick={this.onShowAudioLibrary}>{this.props.SupportVideoAndAudio ? '视频/音频库中选择' : '视频库中选择'}</a>} */}
            </div>
        );
    }
}


export default VideoUpload;
