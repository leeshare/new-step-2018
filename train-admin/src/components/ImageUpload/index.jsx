import React from 'react';
import { Upload, Icon, message, Modal, Button, Progress } from 'antd';
import './index.less';
import { serverURL, getToken } from '../../api/env';
import ImageVCGManage from '@/views/ImageLibrary/ImageVCGManage.jsx'
function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}

function beforeUpload(file) {
    const isJPG = file.type === 'image/jpeg';
    if (!isJPG) {
        message.error('You can only upload JPG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
    }
    return isJPG && isLt2M;
}

class ImageUpload extends React.Component {
    state = {};
    constructor(props) {
        super(props)
        this.state = {
            imageUrl: this.props.value || '',
            modalVisible: false,
            loading: false,
            percent: 0,
        };
    }
    componentWillReceiveProps(nextProps) {
        // Should be a controlled component.
        if ('value' in nextProps) {
            const value = nextProps.value;
            this.setState({ imageUrl: value });
        }
    }
    triggerChange = (changedValue, imageUrl) => {
        // Should provide an event to pass value to Form.
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(changedValue, imageUrl);
        }
    }
    handleChange = (info) => {

        if (info.file.status === 'uploading') {
            this.setState({ percent: info.file.percent.toFixed(0), loading: true })
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            //getBase64(info.file.originFileObj, imageUrl => this.setState({ imageUrl }));
            var localUrl = URL.createObjectURL(info.file.originFileObj);
            this.setState({
                imageUrl: localUrl,
            });
            if (!info.file.response.success) {
                message.error(info.file.response.message);
            }
            else {
                this.triggerChange(info.file.response.filePath, info.file.response.httpUrl);//上传回调
                this.setState({
                    loading: false,
                    percent: 0,
                });
                if (this.props.callback) {
                    this.props.callback(localUrl, info.file.response.filePath);

                }
            }
        }
    }
    deleteImage = (e) => {
        if (e) {
            e.preventDefault();
        }
        if (this.props.onDelete) {
            this.props.onDelete();
        }
    }
    onShowImageLibrary = () => {
        this.setState({ modalVisible: true });
    }
    onSelectedImageLibrary = (obj) => {
        this.triggerChange("resource://" + obj.ResourceID, obj.ImageUrl_Big);
        this.setState({ imageUrl: obj.ImageUrl_Big, modalVisible: false })
    }
    render() {
        const imageUrl = this.state.imageUrl;
        let token = getToken();
        //let uploadUrl = `${serverURL}/Admin/UploadFile?token=${token}`;
        let uploadUrl = `${serverURL}/fastdfs/upload/image/sample?token=${token}`;
        if (this.props.functionType) {
            let functionType = this.props.functionType;
            //uploadUrl = `${serverURL}/Admin/UploadFile?token=${token}&functionType=${functionType}`;
            uploadUrl = `${serverURL}/fastdfs/upload/image/sample?token=${token}&functionType=${functionType}`;
        }
        return (
            <div className="ImageUpload">
                <Modal className='imageLibrary' width={'90%'}
                    title="图库中选择"
                    wrapClassName="vertical-center-modal"
                    visible={this.state.modalVisible}
                    onCancel={() => { this.setState({ modalVisible: false }) }}
                    footer={null}
                >
                    <ImageVCGManage tabIndex={2} onSelectedResourceImage={this.onSelectedImageLibrary} />
                </Modal>
                {
                    !imageUrl && <Upload style={{ ...this.props.avatarStyle }}
                        className="avatar-uploader"
                        name="file"
                        accept={'image/jpg,image/jpeg,image/png,image/bmp,image/gif'}
                        showUploadList={false}
                        action={uploadUrl}
                        onChange={this.handleChange}
                    >
                        {this.state.loading && <div style={{ margin: 4 }}><Progress percent={this.state.percent} size="small" /></div>}
                        <Icon type='upload' className="avatar-uploader-trigger" />

                    </Upload>
                }

                {
                    imageUrl &&
                    <div className='dv_imgwrap'>
                        <img src={imageUrl} alt="" className="preview" />
                        <Button type="primary" shape="circle" icon="close" className='delete' onClick={this.deleteImage} />
                    </div>
                }
                {/* {!this.props.hideLibrary && <a style={{ marginLeft: 5 }} onClick={this.onShowImageLibrary}>从图库中选择</a>} */}
            </div>
        );
    }
}


export default ImageUpload;
