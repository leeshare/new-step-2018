import React from 'react';
import { Row, Col, Button, Icon, Collapse, Alert } from 'antd';
const Panel = Collapse.Panel;
import { convertTextToHtml } from '@/utils';
import AudioPlayer from '@/components/AudioPlayer';
import ModalPlayer from '@/components/ModalPlayer';
import PinyinView from '../../TM_Reader/Pinyin'
export default class CourseWare extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showPlayMedia: false,
            currentMedia: null,
        };
    }
    onShowMediaPlayer = (mediaType, url) => {
        this.setState({ currentMedia: { object_type: mediaType, media_info: { media_url: url } }, showPlayMedia: true });
    }
    onCancelPlay = () => {
        this.setState({ currentMedia: null, showPlayMedia: false });
    }
    onPlayAudio(audioUrl) {
        this.refs.audioPlayer.play(audioUrl);
    }
    render() {
        let { unitInfo } = this.props;
        let block_unit = <div></div>;
        switch (unitInfo.Type) {
            case 10://words
            case 11://dialog
            case 12://chant
            case 13://pattern
            case 14://writing
            case 15://reader
            case 16://talk
                block_unit = <div style={{ height: '80%' }}>
                    <Row type="flex" justify="center" align="middle" style={{ height: '100%' }}>
                        <Col span={8} className={'center'}><h2>{unitInfo.Summary}</h2></Col>
                    </Row>
                </div>
                break;
            case 1:
                block_unit = <div>
                    <Row type="flex" justify="center">
                        {unitInfo.Word == '' ? <Col span={24}></Col> : <Col span={24} className={'center'}>{unitInfo.Word} <a onClick={() => { this.onPlayAudio(unitInfo.WordVoice) }}><Icon type="sound" /></a></Col>}
                        {unitInfo.Chinese == '' ? <Col span={24}></Col> : <Col span={24} className={'center'}><img src={unitInfo.Image} className={'unit-image'} /></Col>}
                        {unitInfo.Chinese == '' ? <Col span={24}></Col> : <Col span={24} className={'center'}>{unitInfo.Chinese} <a onClick={() => { this.onPlayAudio(unitInfo.SentenceVoice) }}><Icon type="sound" /></a></Col>}
                        {unitInfo.English == '' ? <Col span={24} className={'center'}></Col> : <Col span={24} className={'center'}>{unitInfo.English}</Col>}
                        {unitInfo.Chinese == '' ? <Col span={24}></Col> : <Col span={24} className={'center'}>拆字:[{unitInfo.ChineseSegments.join(',')}]</Col>}
                        {unitInfo.Word == '' ? <Col span={24}></Col> : <Col span={24} className={'center'}>读音:[{unitInfo.Phonetic}]</Col>}
                        {unitInfo.Word == '' ? <Col span={24}></Col> : <Col span={24} className={'center'}>混淆字:[{unitInfo.ConfusedWords}]</Col>}
                        {unitInfo.Word == '' ? <Col span={24}></Col> : <Col span={24} className={'center'}>偏旁:[{unitInfo.SideCharactor}]</Col>}
                        {unitInfo.Word == '' ? <Col span={24}></Col> : <Col span={24} className={'center'}>笔画数:[{unitInfo.Strokes}]</Col>}
                        {unitInfo.Word == '' ? <Col span={24}></Col> : <Col span={24} className={'center'}>字结构:[{unitInfo.StructureType}]</Col>}
                        {unitInfo.Word == '' ? <Col span={6}></Col> : <Col span={6}><img src={unitInfo.WritingGif} className={'unit-image'} /></Col>}
                    </Row>
                </div>;
                break;
            case 2:
                let lastActor = "";
                let justify = ""
                block_unit = <div>
                    <Row type="flex" justify="center">
                        {unitInfo.SceneImage == '' ? <Col span={24}></Col> : <Col span={24} className={'center'}><img src={unitInfo.SceneImage} className={'unit-image'} /></Col>}
                        <Col span={24}>{unitInfo.Knowledges}</Col>
                        {unitInfo.Content == '' ? <Col span={24}></Col> : <Col span={24} className={'center'}>{unitInfo.Content} <a onClick={() => { this.onPlayAudio(unitInfo.SceneVoice) }}><Icon type="sound" /></a></Col>}
                        {unitInfo.Content_En != '' ? <Col span={24} className={'center'}>{unitInfo.Content_En}</Col> : <span></span>}
                        {unitInfo.Scripts.map((item) => {
                            if (item.Actor != lastActor) {
                                lastActor = item.Actor;
                                if (justify == 'end') {
                                    justify = "start";
                                }
                                else {
                                    justify = "end"
                                }
                            }
                            if (justify == 'end') {
                                return <Col span={24}>
                                    <Row type="flex" justify={justify}>
                                        <Col span="20" className={'right'}>
                                            <div><a onClick={() => { this.onPlayAudio(item.Audio) }}><Icon type="sound" /></a>{item.Script} </div>
                                            <div>{item.Script_En}</div>
                                        </Col>
                                        <Col span="2"><img src={unitInfo.Actors[item.Actor]} style={{ width: 25, height: 25 }} />
                                            <div className={'center'}>{item.Actor}</div></Col>
                                    </Row>
                                </Col>
                            }
                            else {
                                return <Col span={24}>
                                    <Row type="flex" justify={justify}>
                                        <Col span="2"><img src={unitInfo.Actors[item.Actor]} style={{ width: 25, height: 25 }} /><div className={'center'}>{item.Actor}</div></Col>
                                        <Col span="20" className={'left'}>
                                            <div>{item.Script} <a onClick={() => { this.onPlayAudio(item.Audio) }}><Icon type="sound" /></a></div>
                                            <div>{item.Script_En}</div>
                                        </Col>
                                    </Row>
                                </Col>
                            }
                        })}
                    </Row>
                </div>
                break;
            case 3:
                block_unit = <div>
                    <Row type="flex" justify="center">
                        <Col span={24} className={'center'}>{this.props.currentDataModel ? <img src={this.props.currentDataModel.Cover} className={'unit-image'} /> : <div></div>}</Col>
                        <Col span={16} className={'center'} ><div dangerouslySetInnerHTML={{ __html: convertTextToHtml(unitInfo.Content) }}></div> <a onClick={() => { this.onPlayAudio(unitInfo.SceneVoice) }}><Icon type="sound" /></a></Col>
                    </Row>
                </div>;
                break;
            case 4://句型
                block_unit = <div>
                    <Row type="flex" justify="center">
                        {unitInfo.SceneImage == '' ? <Col span={24}></Col> : <Col span={24} className={'center'}><img src={unitInfo.SceneImage} className={'unit-image'} /></Col>}
                        <Col span={24}>{unitInfo.Knowledges}</Col>
                        {unitInfo.Content == '' ? <Col span={24}></Col> : <Col span={24} className={'center'}>{unitInfo.Content} <a onClick={() => { this.onPlayAudio(unitInfo.SceneVoice) }}><Icon type="sound" /></a></Col>}
                        {unitInfo.Content_En != '' ? <Col span={24} className={'center'}>{unitInfo.Content_En}</Col> : <span></span>}
                    </Row>
                </div>
                break;
            case 5://听写
                block_unit = <div>
                    <Row type="flex" justify="center">
                        {
                            unitInfo.WritingContent.split(',').map((item, index) => {
                                return item != '' && <Col span={8} style={{ textAlign: 'center', margin: 5, padding: 15, border: 'solid 1px #ccc' }}>{item}</Col>
                            })
                        }
                    </Row>
                </div>
                break;
            case 6://朗读
                block_unit = <div style={{ backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', paddingTop: 30, color: (unitInfo.SceneImage != '' ? "#fff" : "#000"), height: '100%', backgroundImage: (unitInfo.SceneImage != '' ? `url(${unitInfo.SceneImage})` : 'none') }}>
                    <Row type="flex" justify="center">
                        <Col className="center" span={24}>{unitInfo.CourseWareName}</Col>
                        <Col className="center" span={24}>字数:{unitInfo.WordCount} <a onClick={() => { this.onPlayAudio(unitInfo.SceneVoice) }}><Icon type="sound" />{unitInfo.Duration}</a></Col>
                        {/* {unitInfo.Content == '' ? <Col span={24}></Col> : <Col span={24} className={unitInfo.ContentLayout == 1 ? 'conent-left' : 'center'}>{unitInfo.Content}</Col>} */}
                        <Col span={24}>
                            {unitInfo.Content != '' && <PinyinView PinyinSpan={3} value={unitInfo} />}
                        </Col>
                    </Row>
                </div>
                break;
            case 7://看图说话
                block_unit = <div>
                    <Row type="flex" justify="center">
                        <Col className="center" span={24}>{unitInfo.Title}</Col>
                        <Col span={24}>
                            {
                                unitInfo.Talks.length > 0 && <Collapse accordion defaultActiveKey={'talk0'}>
                                    {
                                        unitInfo.Talks.map((item, index) => {
                                            return <Panel header={`练习场景${index + 1}.`} key={'talk' + index}>
                                                <div>{item.Content}</div>
                                                {item.SceneImage && <img src={item.SceneImage} className={'unit-image'} />}
                                            </Panel>;
                                        })
                                    }
                                </Collapse>
                            }
                        </Col>
                    </Row>
                </div>
                break;
            case 8:
                block_unit = <div style={{ backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', height: 590, backgroundImage: (unitInfo.SceneImage != '' ? `url(${unitInfo.SceneImage})` : 'none') }}>
                    {unitInfo.Remark && <Row>
                        <Col span={24}>
                            <Alert
                                description={<span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(unitInfo.Remark) }}></span>}
                                type="warning"
                            /></Col>
                    </Row>
                    }
                    <Row style={{ height: '10%', position: 'absolute', bottom: 1, textAlign: 'center', left: '33%' }}>
                        {/* <Col className="center" span={24}>{unitInfo.Title}</Col> */}
                        {unitInfo.SceneVoice != '' && <Col className="center" span={24}><a onClick={() => { this.onShowMediaPlayer(2, unitInfo.SceneVoice) }}> <Icon type="sound" />播放音频</a></Col>}
                        {unitInfo.SceneVideo != '' && <Col className="center" span={24}><a onClick={() => { this.onShowMediaPlayer(3, unitInfo.SceneVideo) }}> <Icon type="play-circle-o" />播放视频</a></Col>}
                    </Row>
                </div>
                break;
            case 91://字预览
                block_unit = <div>
                    <Row type="flex" justify="center">
                        <Col span={22}><img src={unitInfo.WritingGif} style={{ margin: '20px 0' }} className={'unit-image'} /></Col>
                        <Col span={24} className={'center'}>{unitInfo.Word} <a onClick={() => { this.onPlayAudio(unitInfo.WordVoice) }}><Icon type="sound" /></a></Col>
                        {unitInfo.Word_En != '' ? <Col span={24} className={'center'}>{unitInfo.Word_En}</Col> : <span></span>}
                        <Col span={24} className={'center'}>读音:[{unitInfo.Phonetic}]</Col>
                        <Col span={24} className={'center'}>混淆字:[{unitInfo.ConfusedWords}]</Col>
                        <Col span={24} className={'center'}>偏旁:[{unitInfo.SideCharactor}]</Col>
                        <Col span={24} className={'center'}>笔画数:[{unitInfo.Strokes}]</Col>
                        <Col span={24} className={'center'}>字结构:[{unitInfo.StructureType}]</Col>
                    </Row>
                </div>;
                break;
            case 92://词句预览
                block_unit = <div>
                    <Row type="flex" justify="center">
                        <Col span={24} className={'center'}><img src={unitInfo.Image} className={'unit-image'} /></Col>
                        <Col span={24} className={'center'}>{unitInfo.Chinese} <a onClick={() => { this.onPlayAudio(unitInfo.SentenceVoice) }}><Icon type="sound" /></a></Col>
                        {unitInfo.English != '' ? <Col span={24} className={'center'}>{unitInfo.English}</Col> : <span></span>}
                        <Col span={24} className={'center'}>拆字:[{unitInfo.ChineseSegments.join(',')}]</Col>
                    </Row>
                </div>;
                break;
            default:
                block_unit = <div>未知类型</div>;
                break;
        }
        return (
            <div style={{ backgroundColor: "#eee" }}>
                {
                    this.state.currentMedia ? <ModalPlayer lecture_info={this.state.currentMedia} visible={this.state.showPlayMedia} onCancel={this.onCancelPlay} /> : ''
                }
                {block_unit}
            </div>
        );
    }
}