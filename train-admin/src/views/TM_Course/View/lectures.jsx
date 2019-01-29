import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Spin, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, Tabs, Carousel, Timeline, InputNumber, Tag, Upload, Checkbox } from 'antd';

import './index.less'
import { getDictionaryTitle, getViewEditModeTitle, getDictionaryTitleByCode } from '@/utils';
import { getCourseUnitList, loadPdfDocuments } from '@/actions/tm';

import ModalPlayer from '@/components/ModalPlayer';
import AudioPlayer from '@/components/AudioPlayer';
import VideoUpload from '@/components/VideoUpload';
import AudioUpload from '@/components/AudioUpload';
import ImageUpload from '@/components/ImageUpload';
import EditableTagGroup from '@/components/EditableTagGroup'
import CourseWare from '../CourseWare';
import ModalSearchDialog from '../ModalSearchDialog';
import ModalSearchChant from '../ModalSearchChant';
import ModalSearchPattern from '../ModalSearchPattern';
import ModalSearchWriting from '../ModalSearchWriting';
import ModalSearchReader from '../ModalSearchReader';
import ModalSearchTalk from '../ModalSearchTalk';
import ModalSearchLecture from '../ModalSearchLecture';
import ModalSearchBaseLibrary from '../ModalSearchBaseLibrary'
import { serverURL, getToken } from '@/api/env';
const FormItem = Form.Item;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
};
//初始化控件状态
const initControlState = {
    showAddDialogTag: false,
    showAddSentenceTag: false,
    showAddCharacterTag: false,
    showAddChantTag: false,
    showAddPatternTag: false,
    showAddWritingTag: false,
    showAddReaderTag: false,
    showChooseDialogWindow: false,
    showChooseSentenceWindow: false,
    showChooseCharacterWindow: false,
    showChooseChantWindow: false,
    showChoosePatternWindow: false,
    showChooseWritingWindow: false,
    showChooseReaderWindow: false,
    showChooseTalkWindow: false,
    showChooseLectureWindow: false,
}
/*
必要属性输入
editMode [Create/Edit/View/Delete/Design]
currentDataModel [数据模型]
viewCallback [回调]
*/
const DefaultUnit_Cover_Part_1_Words = {
    UnitID: '',
    Type: 10,
    Title: 'Part 1',
    Summary: '看图识字',
}
const DefaultUnit_Word = {
    UnitId: '',
    Type: 1,
    Word: "",
    Word_En: "",
    WordVoice: "",
    Phonetic: "",
    SideCharactor: "",
    ConfusedWords: "",
    Strokes: 1,
    StructureType: "",
    WritingGif: "",
    Image: "",
    SentenceVoice: "",
    English: "",
    Chinese: "",
    ChineseSegments: [],
    IsFixedFirstSegment: 0
}
const DefaultUnit_Dialog = {
    UnitId: "",
    Type: 2,
    ContentType: 2,
    Content: "",
    Content_En: "",
    SceneImage: "",
    SceneVoice: "",
    SceneVideo: "",
    Actors: {},
    Scripts: []
}
const DefaultUnit_Chant = {
    UnitId: "",
    Type: 3,
    ContentType: 2,
    Content: "",
    SceneImage: "",
    SceneVoice: "",
    SceneVideo: ""
}
const DefaultUnit_Pattern = {
    UnitId: "",
    Type: 4,
    ContentType: 2,
    Content: "",
    SceneImage: "",
    SceneVoice: "",
    SceneVideo: ""
}
const DefaultUnit_Writing = {
    UnitId: "",
    Type: 5,
    WritingContent: '',
    WritingObjects: []
}
const DefaultUnit_Reader = {
    UnitId: "",
    Type: 6,
    Content: "",
    SceneImage: "",
    SceneVoice: "",
}
const DefaultUnit_Talk = {
    UnitId: "",
    Title: '',
    Type: 7,
    Talks: [],
}
const DefaultUnit_Lecture = {
    UnitId: "",
    Title: '',
    Type: 8,
    SceneImage: "",
    SceneVideo: "",
    SceneVoice: "",
    FormSceneImage: "",
    FormSceneVideo: "",
    FormSceneVoice: "",
    Remark: '',
}
class LectureCourseView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型 
            courseUnits: [],//课程单元信息,
            currentUnitIndex: 0,//当前单元
            ...initControlState,
            PdfPages: null,
            loadingPdfPage: false,
            ChoosePdfPages: [],//勾选的pdf页面
            FormKey: 0,
        };
    }
    loadPdfPages = (data) => {
        this.setState({ loadingPdfPage: true });
        this.props.loadPdfDocuments({ FormPdfPath: data.url }).payload.promise.then((response) => {
            let data = response.payload.data;
            this.setState({ loadingPdfPage: false });
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                this.setState({ PdfPages: data, ChoosePdfPages: data.map((item, index) => { return index; }) });
            }
        })
    }

    onChoosePdfPage = (index, checked) => {
        this.state.ChoosePdfPages = this.state.ChoosePdfPages.filter(A => A != index);
        if (checked) {
            this.state.ChoosePdfPages = [...this.state.ChoosePdfPages, index];
        }
        this.setState({ ChoosePdfPages: this.state.ChoosePdfPages.sort((A, B) => { if (A > B) return 0; else return 1; }) });
    }

    componentWillMount() {
        if (this.props.editMode != 'Create') {
            this.props.getCourseUnitList(this.state.dataModel.CourseID).payload.promise.then((response) => {
                let data = response.payload.data;
                data.map((item, index) => item.OrderNo = index + 1)
                this.setState({ courseUnits: data, isLoaded: true });
                if (this.props.editMode == 'Design' && data.length == 0) {
                    this.onAddUnit('Lecture');
                }
            })
        }
    }
    switchUnit(index) {
        this.setState({
            currentUnitIndex: index,
            currentTempObject: { ...this.state.courseUnits[index] },//暂存数据，服务于修改变动后用户重置恢复
            currentTempWordObject: { ...this.state.courseUnits[index] },
            ...initControlState
        });
    }
    getUnitTitle(unitInfo, index) {
        let title = "";
        title = getDictionaryTitleByCode(this.props.dic_courseWareTypes, unitInfo.Type, '未知');
        switch (unitInfo.Type) {
            case 10://words
            case 11://dialog
            case 12://chant
            case 13://pattern
            case 14://writing
            case 15://reader
            case 16://talk
                return `${index + 1}.${unitInfo.Title} ${unitInfo.Summary}`;
            case 1:
                return `${index + 1}.${title} ${unitInfo.Word} - ${unitInfo.Chinese}`;
            case 2:
                return `${index + 1}.${title} ${unitInfo.Content}`;
            case 3:
                return `${index + 1}.${title} ${unitInfo.Content}`;
            case 4:
                return `${index + 1}.${title} ${unitInfo.Content}`;
            case 5:
                return `${index + 1}.${title} ${unitInfo.WritingContent}`;
            case 6:
                return `${index + 1}.${title} ${unitInfo.CourseWareName}`;
            case 7:
                return `${index + 1}.${title} ${unitInfo.Title}`;
            case 8:
                return `${index + 1}.${title} ${unitInfo.Title}`;
            default:
                return `${title}`;
        }
    }
    getUnitTitle2(unitInfo, index) {
        let title = "";
        switch (unitInfo.Type) {
            case 10://words
            case 11://dialog
            case 12://chant
                title = `${unitInfo.Title}`;
                break;
            default:
                title = getDictionaryTitleByCode(this.props.dic_courseWareTypes, unitInfo.Type, '未知');
                break;
        }
        return `${title}(${index + 1}/${this.state.courseUnits.length})`;
    }
    //选中后预览
    onUnitPreView = (type, selectedObj) => {
        this.setState({ hasChange: true });//有数据变动
        if (type == 2) {
            this.setState({ currentTempObject: { ...this.state.courseUnits[this.state.currentUnitIndex] } });
            this.state.courseUnits[this.state.currentUnitIndex] = { ...this.state.courseUnits[this.state.currentUnitIndex], ...selectedObj }
            this.setState({ showChooseDialogWindow: false, showAddDialogTag: false });
        }
        else if (type == 3) {
            this.setState({ currentTempObject: { ...this.state.courseUnits[this.state.currentUnitIndex] } });
            this.state.courseUnits[this.state.currentUnitIndex] = { ...this.state.courseUnits[this.state.currentUnitIndex], ...selectedObj }
            this.setState({ showChooseChantWindow: false, showAddChantTag: false });
        }
        else if (type == 4) {
            this.setState({ currentTempObject: { ...this.state.courseUnits[this.state.currentUnitIndex] } });
            this.state.courseUnits[this.state.currentUnitIndex] = { ...this.state.courseUnits[this.state.currentUnitIndex], ...selectedObj }
            this.setState({ showChoosePatternWindow: false, showAddPatternTag: false });
        }
        else if (type == 5) {
            this.setState({ currentTempObject: { ...this.state.courseUnits[this.state.currentUnitIndex] } });
            this.state.courseUnits[this.state.currentUnitIndex] = { ...this.state.courseUnits[this.state.currentUnitIndex], ...selectedObj }
            this.setState({ showChooseWritingWindow: false, showAddWritingTag: false });
        }
        else if (type == 6) {
            this.setState({ currentTempObject: { ...this.state.courseUnits[this.state.currentUnitIndex] } });
            this.state.courseUnits[this.state.currentUnitIndex] = { ...this.state.courseUnits[this.state.currentUnitIndex], ...selectedObj }
            this.setState({ showChooseReaderWindow: false, showAddReaderTag: false });
        }
        else if (type == 7) {
            this.setState({ currentTempObject: { ...this.state.courseUnits[this.state.currentUnitIndex] } });
            var unitInfo = this.state.courseUnits[this.state.currentUnitIndex];
            var find = unitInfo.Talks.find(A => A.CourseWareID == selectedObj.CourseWareID);
            if (!find) {
                unitInfo.Talks.push(selectedObj);
                this.state.courseUnits[this.state.currentUnitIndex] = { ...unitInfo };
                this.setState({ showChooseTalkWindow: false });
            }
        }
        else if (type == 8) {
            this.setState({ currentTempObject: { ...this.state.courseUnits[this.state.currentUnitIndex] } });
            this.state.courseUnits[this.state.currentUnitIndex] = { ...this.state.courseUnits[this.state.currentUnitIndex], ...selectedObj }
            this.setState({ showChooseLectureWindow: false, showAddLectureTag: false, FormKey: this.state.FormKey + 1 });
        }
        else if (type == 91) {
            this.setState({ currentTempObject: { ...this.state.courseUnits[this.state.currentUnitIndex] } });
            this.state.courseUnits[this.state.currentUnitIndex] = { ...this.state.courseUnits[this.state.currentUnitIndex], ...selectedObj }
            this.setState({ showChooseCharacterWindow: false, showAddCharacterTag: false, currentCharacter: selectedObj.Name });
            //为实现连贯性操作，自动切换到词句选择
            if (!this.state.courseUnits[this.state.currentUnitIndex].SentenceID) {
                this.setState({ showAddSentenceTag: true, showChooseSentenceWindow: true });//显示选择字、词入口
            }
        }
        else if (type == 92) {
            this.setState({ currentTempObject: { ...this.state.courseUnits[this.state.currentUnitIndex] } });
            this.state.courseUnits[this.state.currentUnitIndex] = { ...this.state.courseUnits[this.state.currentUnitIndex], ...selectedObj }
            this.setState({ showChooseSentenceWindow: false, showAddSentenceTag: false });
        }
    }
    //重置修改
    onUnitReset = () => {
        //重置表单
        this.props.form.resetFields();
        if (this.state.currentTempObject && this.state.currentTempObject != null) {
            if (this.state.currentTempObject.Type == 1) {
                this.state.courseUnits[this.state.currentUnitIndex] = { ...this.state.currentTempWordObject }
            }
            else {
                this.state.courseUnits[this.state.currentUnitIndex] = { ...this.state.currentTempObject }
            }
        }
        this.setState({
            FormKey: 0,
            currentTempObject: null,//清空临时对象
            ...initControlState
        })
    }
    onUnitSaveAll() {
        //校验数据完整性后提交服务器
        let msgList = [];
        let unitCover = [0, 0, 0];
        let preCoverUnit = null;
        this.state.courseUnits.map((item, index) => {
            if (item.Type >= 10) {
                preCoverUnit = item;
            }
            else {
                /*
                if (item.Type == 1 && (preCoverUnit == null || preCoverUnit.Type != 10)) {
                    msgList.push(`第${index + 1}单元前缺失“Words”类型封面！`)
                }
                else if (item.Type == 2 && (preCoverUnit == null || preCoverUnit.Type != 11)) {
                    msgList.push(`第${index + 1}单元前缺失“Dialog”类型封面！`)
                }
                else if (item.Type == 3 && (preCoverUnit == null || preCoverUnit.Type != 12)) {
                    msgList.push(`第${index + 1}单元前缺失“Chant”类型封面！`)
                }*/
            }
            if (item.Type == 1 && (!item.CharacterID || !item.SentenceID)) {
                msgList.push(`第${index + 1}单元，未完成字、词句内容！`)
            }
            else if (item.Type == 2 && !item.CourseWareID) {
                msgList.push(`第${index + 1}单元，未设置对话内容！`)
            }
            else if (item.Type == 3 && !item.CourseWareID) {
                msgList.push(`第${index + 1}单元，未设置跟唱内容！`)
            }
            else if (item.Type == 4 && !item.CourseWareID) {
                msgList.push(`第${index + 1}单元，未设置句型内容！`)
            }
            else if (item.Type == 5 && !item.CourseWareID) {
                msgList.push(`第${index + 1}单元，未设置听写内容！`)
            }
            else if (item.Type == 6 && !item.CourseWareID) {
                msgList.push(`第${index + 1}单元，未设置朗读内容！`)
            }
            else if (item.Type == 7) {
                if (item.Title == '') {
                    msgList.push(`第${index + 1}单元，未设置练习词语！`)
                }
                if (item.Talks.length == 0) {
                    msgList.push(`第${index + 1}单元，至少需设置一个练习场景！`)
                }
                //设置Summary
                item.Summary = item.Talks.map((item, index) => { return item.CourseWareID }).join(',');
                item.CourseWareID = '';
            }
            /*
            else {
                //校验单元类型是否重复
                if (item.Type == 10) {
                    unitCover[0] = unitCover[0] + 1;
                    if (unitCover[0] > 1) {
                        msgList.push(`第${index + 1}单元类型封面重复！`)
                    }
                }
                if (item.Type == 11) {
                    unitCover[1] = unitCover[1] + 1; 
                    if (unitCover[0] > 1) {
                        msgList.push(`第${index + 1}单元类型封面重复！`)
                    }
                }
                if (item.Type == 12) {
                    unitCover[2] = unitCover[2] + 1;
                     if (unitCover[0] > 1) {
                        msgList.push(`第${index + 1}单元类型封面重复！`)
                    }
                }
            }*/
        })
        if (msgList.length > 0) {
            message.error(msgList[0]);
        }
        else {
            this.setState({ btnSaveLoading: true });
            setTimeout(() => {
                this.setState({ btnSaveLoading: false });
            }, 5000);//合并保存数据
            this.props.viewCallback(this.state.courseUnits);//保存数据
        }
    }
    onUnitDelete() {
        Modal.confirm({
            title: '你确定要删除此单元内容吗？',
            content: '请仔细核实单元内容后，决定是否继续此操作！',
            onOk: () => {
                let courseUnits = this.state.courseUnits.filter((item, index) => { return index != this.state.currentUnitIndex; });
                courseUnits.map((item, index) => {
                    item.OrderNo = index + 1;
                });
                this.setState({ courseUnits: courseUnits });
                this.switchUnit(courseUnits.length > this.state.currentUnitIndex ? this.state.currentUnitIndex : courseUnits.length - 1);
            },
            onCancel: () => {

            },
        });
        return false;
    }
    onAddUnit(unitType) {
        this.setState({ hasChange: true });//有数据变动
        let courseUnits = this.state.courseUnits;
        let newUnitInfo = {};
        let controlState = null;
        switch (unitType) {
            case 'Cover':
                newUnitInfo = { ...DefaultUnit_Cover_Part_1_Words };
                break;
            case 'Words':
                newUnitInfo = { ...DefaultUnit_Word }
                controlState = { showAddCharacterTag: true, showAddSentenceTag: true, showChooseCharacterWindow: true };
                break;
            case 'Dialog':
                newUnitInfo = { ...DefaultUnit_Dialog }
                controlState = { showAddDialogTag: true, showChooseDialogWindow: true };
                break;
            case 'Chant':
                newUnitInfo = { ...DefaultUnit_Chant }
                controlState = { showAddChantTag: true, showChooseChantWindow: true };
                break;
            case 'Pattern':
                newUnitInfo = { ...DefaultUnit_Pattern }
                controlState = { showAddPatternTag: true, showChoosePatternWindow: true };
                break;
            case 'Writing':
                newUnitInfo = { ...DefaultUnit_Writing }
                controlState = { showAddWritingTag: true, showChooseWritingWindow: true };
                break;
            case 'Reader':
                newUnitInfo = { ...DefaultUnit_Reader }
                controlState = { showAddReaderTag: true, showChooseReaderWindow: true };
                break;
            case 'Talk':
                newUnitInfo = { ...DefaultUnit_Talk }
                //controlState = { showChooseTalkWindow: true };
                break;
            case 'Lecture':
                newUnitInfo = { ...DefaultUnit_Lecture }
                //controlState = { showAddLectureTag: true, showChooseLectureWindow: true };
                break;
        }

        if (this.state.currentUnitIndex + 1 == this.state.courseUnits.length) {//末尾添加
            courseUnits.push(newUnitInfo);
            courseUnits.map((item, index) => {
                item.OrderNo = index + 1;
            })
            this.setState({ courseUnits: courseUnits })
            setTimeout(() => {
                this.switchUnit(courseUnits.length - 1);//切换到指定单元
                if (controlState != null) {
                    this.setState({ ...controlState });
                }
            }, 100);
        }
        else if (this.state.courseUnits.length == 0) {
            newUnitInfo.OrderNo = 1;
            courseUnits.push(newUnitInfo);
            setTimeout(() => {
                this.switchUnit(0);//切换到指定单元
                if (controlState != null) {
                    this.setState({ ...controlState });
                }
            }, 100);
        }
        else {//中间位置添加
            courseUnits.splice(this.state.currentUnitIndex + 1, 0, newUnitInfo);
            courseUnits.map((item, index) => {
                item.OrderNo = index + 1;
            })
            this.setState({ courseUnits: courseUnits })
            setTimeout(() => {
                this.switchUnit(this.state.currentUnitIndex + 1);//切换到指定单元
                if (controlState != null) {
                    this.setState({ ...controlState });
                }
            }, 100);
        }
    }
    onCloseTag(tagType, selectedObj) {
        if (tagType == "Character") {
            this.setState({ showAddCharacterTag: true, showChooseCharacterWindow: true })
        }
        else if (tagType == "Sentence") {
            this.setState({ showAddSentenceTag: true, showChooseSentenceWindow: true })
        }
        else if (tagType == "Dialog") {
            this.setState({ showAddDialogTag: true, showChooseDialogWindow: true })
        }
        else if (tagType == "Chant") {
            this.setState({ showAddChantTag: true, showChooseChantWindow: true })
        }
        else if (tagType == "Pattern") {
            this.setState({ showAddPatternTag: true, showChoosePatternWindow: true })
        }
        else if (tagType == "Writing") {
            this.setState({ showAddWritingTag: true, showChooseWritingWindow: true })
        }
        else if (tagType == "Reader") {
            this.setState({ showAddReaderTag: true, showChooseReaderWindow: true })
        }
        else if (tagType == "Talk") {
            var unitInfo = this.state.courseUnits[this.state.currentUnitIndex];
            var filter = unitInfo.Talks.filter(A => A.CourseWareID != selectedObj.CourseWareID);
            this.state.courseUnits[this.state.currentUnitIndex] = { ...unitInfo, Talks: filter };
        }
        else if (tagType == "Lecture") {
            this.setState({ showAddLectureTag: true, showChooseLectureWindow: true })
        }
    }
    onShowChooseWindow(tagType) {
        if (tagType == "Character") {
            this.setState({ showChooseCharacterWindow: true })
        }
        else if (tagType == "Sentence") {
            this.setState({ showChooseSentenceWindow: true })
        }
        else if (tagType == "Dialog") {
            this.setState({ showChooseDialogWindow: true })
        }
        else if (tagType == "Chant") {
            this.setState({ showChooseChantWindow: true })
        }
        else if (tagType == "Pattern") {
            this.setState({ showChoosePatternWindow: true })
        }
        else if (tagType == "Writing") {
            this.setState({ showChooseWritingWindow: true })
        }
        else if (tagType == "Reader") {
            this.setState({ showChooseReaderWindow: true })
        }
        else if (tagType == "Talk") {
            this.setState({ showChooseTalkWindow: true })
        }
        else if (tagType == "Lecture") {
            this.setState({ showChooseLectureWindow: true })
        }
    }

    onPlayAudio(audioUrl) {
        this.refs.audioPlayer.play(audioUrl);
    }
    onCancel = () => {
        if (this.state.hasChange) {
            Modal.confirm({
                title: '发现教学任务单元内容有修改，是否需要保存？',
                content: '无需保存请点击‘取消’！',
                onOk: () => {
                    this.onUnitSaveAll();//保存
                },
                onCancel: () => {
                    this.props.viewCallback();
                },
            });
        }
        else {
            this.props.viewCallback();
        }
    }
    onSubmit = () => {
        if (this.props.editMode == "Delete") {
            Modal.confirm({
                title: '你确认要删除该教学任务吗?',
                content: '教学任务删除后，无法恢复！',
                onOk: () => {
                    this.props.viewCallback(this.state.dataModel);//保存数据
                },
                onCancel: () => {
                    console.log('Cancel');
                },
            });
            return false;
        }
        else {
            //表单验证后，合并数据提交
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    this.setState({ loading: true });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 10000);//合并保存数据                 
                    let formChoosePdfPages = this.state.ChoosePdfPages.map((item) => {
                        return this.state.PdfPages[item].BizUrl;
                    });
                    let formPdfPath = values.FormPdfPath1 ? values.FormPdfPath1.file.response.data.url : '';
                    this.props.viewCallback({
                        ...this.state.dataModel,
                        ...values,
                        FormIsLecture: true,
                        FormPdfPath: formPdfPath,
                        FormChoosePdfPages: formChoosePdfPages,
                        SupportUnitType: 8,//默认类型
                    });//合并保存数据
                }
            });
            return false;
        }
    }
    onChangeUnitOrderNo = (value) => {
        //交换顺序
        var temp = this.state.courseUnits[this.state.currentUnitIndex].OrderNo;
        this.state.courseUnits[this.state.currentUnitIndex].OrderNo = value;
        this.state.courseUnits[value - 1].OrderNo = temp;
        //重新排序
        var sortCourseUnits = this.state.courseUnits.sort((a, b) => { if (a.OrderNo > b.OrderNo) { return 1; } else { return 0; } });
        this.setState({ courseUnits: sortCourseUnits, currentUnitIndex: value - 1 });//更新内容
    }
    onTalkTitleChange = (e) => {
        let title = (e.target.value);
        this.state.courseUnits[this.state.currentUnitIndex].Title = title;
        this.setState({ TempTalkTitle: title, courseUnits: this.state.courseUnits });//更新内容
    }
    onTeachRemarkChange = (e) => {
        let remark = (e.target.value);
        this.state.courseUnits[this.state.currentUnitIndex].Remark = remark;
        this.setState({ TempRemark: remark, courseUnits: this.state.courseUnits });//更新内容
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}教学任务`;
    }
    renderUnitDesigner(unitInfo, index) {
        const { getFieldDecorator } = this.props.form;
        let block_unit = <div></div>;
        switch (unitInfo.Type) {
            case 10://words
            case 11://dialog
            case 12://chant
            case 13://pattern
            case 14://writing
            case 15://reader
            case 16://talk
                block_unit = <Form layout={'vertical'}>
                    <FormItem label="单元部分">
                        {getFieldDecorator('Title ', { initialValue: unitInfo.Title })(
                            <Select onChange={(value) => { this.state.courseUnits[this.state.currentUnitIndex].Title = value; }}>
                                {this.props.dic_unitPartTypes.map((item) => {
                                    return <Option value={item.title}>{item.title}</Option>
                                })}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="单元类型">
                        {getFieldDecorator('Summary ', { initialValue: unitInfo.Summary })(
                            <Select onChange={(value) => {
                                this.state.courseUnits[this.state.currentUnitIndex].Summary = value;
                                //获取选中的下拉列表对应的项（根据标题查找对应编码）
                                var selectItem = this.props.dic_courseWareTypes.find(A => A.title == value);
                                if (selectItem.value == 'Words') {
                                    this.state.courseUnits[this.state.currentUnitIndex].Type = 10;
                                }
                                else if (selectItem.value == 'Dialog') {
                                    this.state.courseUnits[this.state.currentUnitIndex].Type = 11;
                                }
                                else if (selectItem.value == 'Chant') {
                                    this.state.courseUnits[this.state.currentUnitIndex].Type = 12;
                                }
                                else if (selectItem.value == 'Pattern') {
                                    this.state.courseUnits[this.state.currentUnitIndex].Type = 13;
                                }
                                else if (selectItem.value == 'Writing') {
                                    this.state.courseUnits[this.state.currentUnitIndex].Type = 14;
                                }
                                else if (selectItem.value == 'Reader') {
                                    this.state.courseUnits[this.state.currentUnitIndex].Type = 15;
                                }
                                else if (selectItem.value == 'Talk') {
                                    this.state.courseUnits[this.state.currentUnitIndex].Type = 16;
                                }
                            }}>
                                {this.props.dic_courseWareTypes
                                    .filter((item) => {
                                        if (this.state.dataModel.SupportUnitType == 0) {
                                            return true;
                                        }
                                        else {
                                            return item.code == this.state.dataModel.SupportUnitType.toString();
                                        }
                                    })
                                    .map((item) => {
                                        return <Option value={item.title}>{item.title}</Option>
                                    })}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="单元顺序">
                        <Select onChange={this.onChangeUnitOrderNo} value={unitInfo.OrderNo}>
                            {this.state.courseUnits.map((item, index) => {
                                return <Option value={index + 1}>{index + 1}</Option>
                            })}
                        </Select>
                    </FormItem>
                    <FormItem>
                        <Button icon={'reload'} onClick={this.onUnitReset}>重置</Button> <Button icon={'delete'} onClick={() => { this.onUnitDelete() }}>删除</Button>
                    </FormItem>
                </Form>
                break;
            case 1:
                block_unit = <Form layout={'vertical'}>
                    <FormItem label="字">
                        {this.state.showAddCharacterTag || (!unitInfo.CharacterID) ? <Button size="small" type="dashed" onClick={() => { this.onShowChooseWindow('Character') }}>+ 选择字</Button> : <Tag closable onClose={() => { this.onCloseTag('Character') }}>{unitInfo.Word}</Tag>}
                    </FormItem>
                    <FormItem label="词句">
                        {this.state.showAddSentenceTag || (!unitInfo.SentenceID) ? <Button size="small" type="dashed" onClick={() => { this.onShowChooseWindow('Sentence') }}>+ 选择词句</Button> : <Tag closable onClose={() => { this.onCloseTag('Sentence') }}>{unitInfo.Chinese}</Tag>}
                    </FormItem>
                    <FormItem label="单元顺序">
                        <Select onChange={this.onChangeUnitOrderNo} value={unitInfo.OrderNo}>
                            {this.state.courseUnits.map((item, index) => {
                                return <Option value={index + 1}>{index + 1}</Option>
                            })}
                        </Select>
                    </FormItem>
                    <FormItem>
                        <Button icon={'reload'} onClick={this.onUnitReset}>重置</Button> <Button icon={'delete'} onClick={() => { this.onUnitDelete() }}>删除</Button>
                    </FormItem>
                </Form>
                break;
            case 2:
                block_unit = <Form layout={'vertical'}>
                    <FormItem label="对话">
                        {this.state.showAddDialogTag || (!unitInfo.CourseWareID) ? <Button size="small" type="dashed" onClick={() => { this.onShowChooseWindow('Dialog') }} >+ 选择对话</Button> : <Tag closable onClose={() => { this.onCloseTag('Dialog') }}>{unitInfo.Content}</Tag>}
                    </FormItem>
                    <FormItem label="单元顺序">
                        <Select onChange={this.onChangeUnitOrderNo} value={unitInfo.OrderNo}>
                            {this.state.courseUnits.map((item, index) => {
                                return <Option value={index + 1}>{index + 1}</Option>
                            })}
                        </Select>
                    </FormItem>
                    <FormItem>
                        <Button icon={'reload'} onClick={this.onUnitReset}>重置</Button> <Button icon={'delete'} onClick={() => { this.onUnitDelete() }}>删除</Button>
                    </FormItem>
                </Form>
                break;
            case 3:
                block_unit = <Form layout={'vertical'}>
                    <FormItem label="跟唱">
                        {this.state.showAddChantTag || (!unitInfo.CourseWareID) ? <Button size="small" type="dashed" onClick={() => { this.onShowChooseWindow('Chant') }} >+ 选择跟唱</Button> : <Tag closable onClose={() => { this.onCloseTag('Chant') }}>{unitInfo.Content.split('', 35).join('')}</Tag>}
                    </FormItem>
                    <FormItem label="单元顺序">
                        <Select onChange={this.onChangeUnitOrderNo} value={unitInfo.OrderNo}>
                            {this.state.courseUnits.map((item, index) => {
                                return <Option value={index + 1}>{index + 1}</Option>
                            })}
                        </Select>
                    </FormItem>
                    <FormItem>
                        <Button icon={'reload'} onClick={this.onUnitReset}>重置</Button> <Button icon={'delete'} onClick={() => { this.onUnitDelete() }}>删除</Button>
                    </FormItem>
                </Form>
                break;
            case 4:
                block_unit = <Form layout={'vertical'}>
                    <FormItem label="句型">
                        {this.state.showAddPatternTag || (!unitInfo.CourseWareID) ? <Button size="small" type="dashed" onClick={() => { this.onShowChooseWindow('Pattern') }} >+ 选择句型</Button> : <Tag closable onClose={() => { this.onCloseTag('Pattern') }}>{unitInfo.Content}</Tag>}
                    </FormItem>
                    <FormItem label="单元顺序">
                        <Select onChange={this.onChangeUnitOrderNo} value={unitInfo.OrderNo}>
                            {this.state.courseUnits.map((item, index) => {
                                return <Option value={index + 1}>{index + 1}</Option>
                            })}
                        </Select>
                    </FormItem>
                    <FormItem>
                        <Button icon={'reload'} onClick={this.onUnitReset}>重置</Button> <Button icon={'delete'} onClick={() => { this.onUnitDelete() }}>删除</Button>
                    </FormItem>
                </Form>
                break;
            case 5:
                block_unit = <Form layout={'vertical'}>
                    <FormItem label="听写">
                        {this.state.showAddWritingTag || (!unitInfo.CourseWareID) ? <Button size="small" type="dashed" onClick={() => { this.onShowChooseWindow('Writing') }} >+ 选择听写</Button> : <Tag closable onClose={() => { this.onCloseTag('Writing') }}>{unitInfo.WritingContent}</Tag>}
                    </FormItem>
                    <FormItem label="单元顺序">
                        <Select onChange={this.onChangeUnitOrderNo} value={unitInfo.OrderNo}>
                            {this.state.courseUnits.map((item, index) => {
                                return <Option value={index + 1}>{index + 1}</Option>
                            })}
                        </Select>
                    </FormItem>
                    <FormItem>
                        <Button icon={'reload'} onClick={this.onUnitReset}>重置</Button> <Button icon={'delete'} onClick={() => { this.onUnitDelete() }}>删除</Button>
                    </FormItem>
                </Form>
                break;
            case 6:
                block_unit = <Form layout={'vertical'}>
                    <FormItem label="朗读">
                        {this.state.showAddReaderTag || (!unitInfo.CourseWareID) ? <Button size="small" type="dashed" onClick={() => { this.onShowChooseWindow('Reader') }} >+ 选择朗读</Button> : <Tag closable onClose={() => { this.onCloseTag('Reader') }}>{unitInfo.CourseWareName}</Tag>}
                    </FormItem>
                    <FormItem label="单元顺序">
                        <Select onChange={this.onChangeUnitOrderNo} value={unitInfo.OrderNo}>
                            {this.state.courseUnits.map((item, index) => {
                                return <Option value={index + 1}>{index + 1}</Option>
                            })}
                        </Select>
                    </FormItem>
                    <FormItem>
                        <Button icon={'reload'} onClick={this.onUnitReset}>重置</Button> <Button icon={'delete'} onClick={() => { this.onUnitDelete() }}>删除</Button>
                    </FormItem>
                </Form>
                break;
            case 7:
                block_unit = <Form layout={'vertical'}>
                    <FormItem label="练习词语">
                        <input onChange={this.onTalkTitleChange} value={unitInfo.Title} style={{ width: '100%' }} />
                    </FormItem>
                    {
                        unitInfo.Talks.map((item, index) => {
                            return (
                                <FormItem label={`练习场景${index + 1}.`}>
                                    <Tag closable onClose={() => { this.onCloseTag('Talk', item) }}>{item.Content}</Tag>
                                </FormItem>
                            );
                        })
                    }
                    <FormItem label="添加练习场景">
                        <Button size="small" type="dashed" onClick={() => { this.onShowChooseWindow('Talk') }} >+ 选择看图说话</Button>
                    </FormItem>
                    <FormItem label="单元顺序">
                        <Select onChange={this.onChangeUnitOrderNo} value={unitInfo.OrderNo}>
                            {this.state.courseUnits.map((item, index) => {
                                return <Option value={index + 1}>{index + 1}</Option>
                            })}
                        </Select>
                    </FormItem>
                    <FormItem>
                        <Button icon={'reload'} onClick={this.onUnitReset}>重置</Button> <Button icon={'delete'} onClick={() => { this.onUnitDelete() }}>删除</Button>
                    </FormItem>
                </Form>
                break;
            case 8:
                block_unit = <Form layout={'vertical'} key={`${this.state.currentUnitIndex}_${this.state.FormKey}`} >
                    {/* <FormItem label="标题">
                        <input onChange={this.onTalkTitleChange} value={unitInfo.Title} style={{ width: '100%' }} />
                    {/* </FormItem> */}
                    {/* <FormItem label="讲稿内容">
                        {this.state.showAddLectureTag || (!unitInfo.CourseWareID) ? <Button size="small" type="dashed" onClick={() => { this.onShowChooseWindow('Lecture') }} >+ 讲稿库中选择</Button> : <Tag closable onClose={() => { this.onCloseTag('Lecture') }}>{unitInfo.Title}</Tag>}
                    </FormItem> */}
                    <FormItem label={<Row><Col span={24}>上传文稿图(点击图片可以重新上传) <Button size="small" type="dashed" onClick={() => { this.onShowChooseWindow('Lecture') }} >+ 讲稿库中选择</Button></Col></Row>}>
                        <ImageUpload value={unitInfo.SceneImage} onChange={(value, url) => {
                            unitInfo.SceneImage = url;
                            unitInfo.FormSceneImage = value;
                            this.setState({ courseUnits: this.state.courseUnits })
                        }} />
                    </FormItem>
                    <FormItem label="上传视频mp4(点击图标可以重新上传)">
                        <VideoUpload value={unitInfo.SceneVideo} onChange={(value, url, resourceType) => {
                            unitInfo.SceneVideo = url;
                            unitInfo.FormSceneVideo = value;
                            this.setState({ courseUnits: this.state.courseUnits })
                        }} />
                    </FormItem>
                    <FormItem label="音频mp3(点击图标可以重新上传)">
                        <AudioUpload value={unitInfo.SceneVoice} onChange={(value, url, resourceType) => {
                            unitInfo.SceneVoice = url;
                            unitInfo.FormSceneVoice = value;
                            this.setState({ courseUnits: this.state.courseUnits })
                        }} />
                    </FormItem>
                    <FormItem label="教学批注">
                        <TextArea rows={4} onChange={this.onTeachRemarkChange} value={unitInfo.Remark} />
                    </FormItem>
                    <FormItem label="单元顺序">
                        <Select onChange={this.onChangeUnitOrderNo} value={unitInfo.OrderNo}>
                            {this.state.courseUnits.map((item, index) => {
                                return <Option value={index + 1}>{index + 1}</Option>
                            })}
                        </Select>
                    </FormItem>
                    <FormItem>
                        <Button icon={'reload'} onClick={this.onUnitReset}>重置</Button> <Button icon={'delete'} onClick={() => { this.onUnitDelete() }}>删除</Button>
                    </FormItem>
                </Form >
                break;
            default:
                block_unit = <div>未知类型</div>;
                break;
        }
        return block_unit;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button> <Button onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else {
            return <FormItem className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} >返回</Button>
            </FormItem>
        }
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;

        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                let auditStatus = this.props.dic_courseAuditStatus.filter(A => A.value < 2);
                let _this = this;
                //文件上次参数设定
                let UploadProps = {
                    name: 'file',
                    multiple: false,
                    accept: 'application/pdf',
                    action: `${serverURL}/Admin/UploadFile?token=${getToken()}`,
                    onChange(info) {
                        if (info.file.status === 'done') {
                            if (!info.file.response.result) {
                                message.error(info.file.response.message);
                            }
                            else {
                                //上传成功后，显示加载动画（加载pdf预览页内容）
                                _this.setState({ loadingPdfPage: true });
                                _this.setState({ UploadFileInfo: info.file.response.data })
                                _this.loadPdfPages(info.file.response.data);
                            }
                        }
                    },
                }

                block_content = (<div className="course-edit">
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="教学任务名称"
                        >
                            {getFieldDecorator('CourseName', {
                                initialValue: this.state.dataModel.CourseName,
                                rules: [{
                                    required: true, message: '请输入教学任务名称!',
                                }],
                            })(
                                <Input />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="关键字"
                        >
                            {getFieldDecorator('Keywords', {
                                initialValue: this.state.dataModel.Keywords,
                                rules: [{
                                    required: true, message: '至少设置一个关键字!',
                                }]
                            })(
                                <EditableTagGroup />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="适用对象"
                        >
                            {getFieldDecorator('ApplicableScopes', { initialValue: this.state.dataModel.ApplicableScopes })(
                                <Select><Option value={''}>不指定</Option>
                                    {this.props.dic_courseApplicableScopes.map((item) => {
                                        return <Option value={item.value}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        {
                            this.props.editMode == 'Create' ? <FormItem
                                {...formItemLayout}
                                label="上传PDF文稿"
                            >
                                {getFieldDecorator('FormPdfPath1', {
                                    rules: [{
                                        required: false, message: '请您上传pdf文稿!',
                                    }]
                                })(
                                    <Upload {...UploadProps}><Icon className='file-pdf' style={{ margin: 10, fontSize: 16 }} type="upload" /></Upload>
                                    )}</FormItem> : ""
                        }
                        {
                            ((this.state.PdfPages || this.state.loadingPdfPage) && this.props.editMode == 'Create') ? <FormItem
                                {...formItemLayout}
                                label="选择文档"
                            >
                                {this.state.loadingPdfPage && <div className='showloading'>
                                    <Spin size="large" />
                                </div>
                                }
                                {!this.state.loadingPdfPage && getFieldDecorator('FormPdfPages', {
                                    initialValue: true,
                                    rules: [{
                                        required: true, message: '请您至少选择一页文档!',
                                    }]
                                })(
                                    <div>
                                        <Row gutter={24} >
                                            <Col span={24}>{`共${this.state.ChoosePdfPages.length}/${this.state.PdfPages.length}页`}</Col>
                                        </Row>
                                        <Row gutter={24} style={{ maxHeight: 500, overflowY: 'auto', overflowX: 'none', backgroundColor: '#eee' }}>
                                            {
                                                this.state.PdfPages.map((item, index) => {
                                                    return <Col style={{ marginBottom: 10 }} span={12}>
                                                        <Checkbox onChange={(e) => {
                                                            this.onChoosePdfPage(index, e.target.checked);
                                                        }} checked={this.state.ChoosePdfPages.find(A => A == index) != null} >{`第${index + 1}页`}</Checkbox>
                                                        <br />
                                                        <img style={{ height: 'auto', width: '100%' }} src={item.ImageUrl} />
                                                    </Col>
                                                })
                                            }
                                        </Row>
                                    </div>
                                    )}</FormItem> : ""
                        }
                        {
                            this.props.editMode == 'Create' ? "" : <FormItem
                                {...formItemLayout}
                                label="提交审核"
                            >
                                {getFieldDecorator('AuditStatus', {
                                    rules: [{
                                        required: true, message: '请选择提交审核状态!',
                                    }]
                                })(
                                    <Select>
                                        {auditStatus.map((item) => {
                                            return <Option value={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}</FormItem>
                        }
                        {
                            this.props.editMode == 'Create' ? "" : <FormItem
                                {...formItemLayout}
                                label="修改描述"
                            >
                                {getFieldDecorator('AuditRemark', {
                                    rules: [{
                                        required: true, message: '请对本次教学任务修改进行说明!',
                                    }]
                                })(
                                    <TextArea rows={4} />
                                    )}
                            </FormItem>
                        }
                        {this.renderBtnControl()}
                    </Form>
                </div>
                );
                break;
            case "View":
            case "Delete":
                let block_content_tab1 = this.state.dataModel.CreatedUserInfo ? (
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="教学任务"
                        >
                            <span className="ant-form-text">{this.state.dataModel.CourseName}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="关键字"
                        >
                            <span className="ant-form-text">{this.state.dataModel.Keywords}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="适用对象"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_courseApplicableScopes, this.state.dataModel.ApplicableScopes)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="状态"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_courseStatus, this.state.dataModel.Status)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="审核状态"
                        >
                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_courseAuditStatus, this.state.dataModel.AuditStatus)}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="创建信息"
                        >
                            <span className="ant-form-text">{this.state.dataModel.CreatedDate} by {this.state.dataModel.CreatedUserInfo.name}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="修改信息"
                        >
                            <span className="ant-form-text">{this.state.dataModel.UpdatedDate} by {this.state.dataModel.UpdatedUserInfo.name}</span>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="审核信息"
                        >
                            <span className="ant-form-text">{this.state.dataModel.AuditRemark.map((item) => {
                                return <div>{item}</div>
                            })}</span>
                        </FormItem>

                        {this.renderBtnControl()}
                    </Form>
                ) : '';

                let block_CarouselItems = this.state.courseUnits.length == 0 ? <div></div> : <Carousel dots={false} slickGoTo={this.state.currentUnitIndex}>
                    {this.state.courseUnits.map((unitInfo, index) => {
                        return <Card title={this.getUnitTitle2(unitInfo, index)} bordered={false} className='courseware-swipe'>
                            <CourseWare unitInfo={unitInfo} />
                        </Card>
                    })}
                </Carousel>;
                let block_content_tab2 = (
                    <Row type="flex" justify="center" gutter={16}>
                        <Col span={8}>
                            {block_CarouselItems}
                        </Col>
                        <Col span={4} style={{ maxHeight: 640, overflowY: 'auto', overflowX: 'hidden' }}>
                            <Row gutter={24}>
                                {this.state.courseUnits.map((unitInfo, index) => {
                                    return <Col span={6} style={{ textAlign: 'center', margin: '10 0' }}>
                                        {this.state.currentUnitIndex != index && <Button onClick={() => { this.switchUnit(index) }} type="dashed" >{index + 1}</Button>}
                                        {this.state.currentUnitIndex == index && <Button onClick={() => { this.switchUnit(index) }} type="primary" >{index + 1}</Button>}
                                    </Col>
                                })}
                            </Row>
                        </Col>
                    </Row>
                )
                block_content = (
                    <div className={'course-tabs'}>
                        <AudioPlayer ref="audioPlayer" />
                        {this.state.dataModel.CreatedUserInfo && <Tabs>
                            <TabPane tab="基本信息" key="tab1">{block_content_tab1}</TabPane>
                            <TabPane tab="教学单元" key="tab2">{block_content_tab2}</TabPane>
                        </Tabs>
                        }
                        {!this.state.dataModel.CreatedUserInfo && block_content_tab2}
                    </div>
                )
                break;
            case "Design":
                {
                    if (this.state.courseUnits.length == 0 && !this.state.isLoaded) {
                        return <div className='course-designer showloading'>
                            <Spin size="large" />
                        </div>
                    }
                    let block_CarouselItems = this.state.courseUnits.length == 0 ? <div></div> : <Carousel dots={false} slickGoTo={this.state.currentUnitIndex}>
                        {this.state.courseUnits.map((unitInfo, index) => {
                            return <Card title={this.getUnitTitle2(unitInfo, index)} bordered={false}>
                                <CourseWare unitInfo={unitInfo} />
                            </Card>
                        })}
                    </Carousel>;
                    block_content = <div className={'course-tabs'}>
                        <Modal width={800}
                            title="从字库选择"
                            wrapClassName="vertical-center-modal"
                            visible={this.state.showChooseCharacterWindow}
                            onOk={() => {
                                this.setState({ showChooseCharacterWindow: false });
                            }}
                            onCancel={() => {
                                this.setState({ showChooseCharacterWindow: false });
                            }}
                            footer={null}
                        >
                            <ModalSearchBaseLibrary {...this.props.currentDataModel} LibraryType={1} callback={this.onUnitPreView} />
                        </Modal>
                        <Modal width={800}
                            title="从词句库中选择"
                            wrapClassName="vertical-center-modal"
                            visible={this.state.showChooseSentenceWindow}
                            onOk={() => {
                                this.setState({ showChooseSentenceWindow: false });
                            }}
                            onCancel={() => {
                                this.setState({ showChooseSentenceWindow: false });
                            }}
                            footer={null}
                        >
                            <ModalSearchBaseLibrary {...this.props.currentDataModel} LibraryType={2} Keyword={this.state.currentCharacter} callback={this.onUnitPreView} />
                        </Modal>
                        <Modal width={800}
                            title="从对话库中选择"
                            wrapClassName="vertical-center-modal"
                            visible={this.state.showChooseDialogWindow}
                            onOk={() => {
                                this.setState({ showChooseDialogWindow: false });
                            }}
                            onCancel={() => {
                                this.setState({ showChooseDialogWindow: false });
                            }}
                            footer={null}
                        >
                            <ModalSearchDialog {...this.props.currentDataModel} callback={this.onUnitPreView} />
                        </Modal>
                        <Modal width={800}
                            title="从跟唱库中选择"
                            wrapClassName="vertical-center-modal"
                            visible={this.state.showChooseChantWindow}
                            onOk={() => {
                                this.setState({ showChooseChantWindow: false });
                            }}
                            onCancel={() => {
                                this.setState({ showChooseChantWindow: false });
                            }}
                            footer={null}
                        >
                            <ModalSearchChant {...this.props.currentDataModel} callback={this.onUnitPreView} />
                        </Modal>
                        <Modal width={800}
                            title="从句型库中选择"
                            wrapClassName="vertical-center-modal"
                            visible={this.state.showChoosePatternWindow}
                            onOk={() => {
                                this.setState({ showChoosePatternWindow: false });
                            }}
                            onCancel={() => {
                                this.setState({ showChoosePatternWindow: false });
                            }}
                            footer={null}
                        >
                            <ModalSearchPattern {...this.props.currentDataModel} callback={this.onUnitPreView} />
                        </Modal>
                        <Modal width={800}
                            title="从听写库中选择"
                            wrapClassName="vertical-center-modal"
                            visible={this.state.showChooseWritingWindow}
                            onOk={() => {
                                this.setState({ showChooseWritingWindow: false });
                            }}
                            onCancel={() => {
                                this.setState({ showChooseWritingWindow: false });
                            }}
                            footer={null}
                        >
                            <ModalSearchWriting {...this.props.currentDataModel} callback={this.onUnitPreView} />
                        </Modal>
                        <Modal width={800}
                            title="从朗读库中选择"
                            wrapClassName="vertical-center-modal"
                            visible={this.state.showChooseReaderWindow}
                            onOk={() => {
                                this.setState({ showChooseReaderWindow: false });
                            }}
                            onCancel={() => {
                                this.setState({ showChooseReaderWindow: false });
                            }}
                            footer={null}
                        >
                            <ModalSearchReader {...this.props.currentDataModel} callback={this.onUnitPreView} />
                        </Modal>
                        <Modal width={800}
                            title="从看图说话库中选择"
                            wrapClassName="vertical-center-modal"
                            visible={this.state.showChooseTalkWindow}
                            onOk={() => {
                                this.setState({ showChooseTalkWindow: false });
                            }}
                            onCancel={() => {
                                this.setState({ showChooseTalkWindow: false });
                            }}
                            footer={null}
                        >
                            <ModalSearchTalk {...this.props.currentDataModel} Keyword={this.state.TempTalkTitle || ''} callback={this.onUnitPreView} />
                        </Modal>
                        <Modal width={800}
                            title="从讲稿库中选择"
                            wrapClassName="vertical-center-modal"
                            visible={this.state.showChooseLectureWindow}
                            onOk={() => {
                                this.setState({ showChooseLectureWindow: false });
                            }}
                            onCancel={() => {
                                this.setState({ showChooseLectureWindow: false });
                            }}
                            footer={null}
                        >
                            <ModalSearchLecture {...this.props.currentDataModel} callback={this.onUnitPreView} />
                        </Modal>
                        <Row type="flex" justify="center" gutter={16}>
                            <Col span={7}>
                                {block_CarouselItems}
                            </Col>
                            <Col span={13}>
                                {this.state.courseUnits.length == 0 ? <div></div> :
                                    <Card className='course-designer' title={'单元设计器'}>
                                        {this.renderUnitDesigner(this.state.courseUnits[this.state.currentUnitIndex], this.state.currentUnitIndex)}
                                    </Card>
                                }
                            </Col>
                            <Col span={4} style={{ maxHeight: 780, overflowY: 'auto', overflowX: 'hidden' }}>
                                <Row gutter={24}>
                                    {this.state.courseUnits.map((unitInfo, index) => {
                                        return <Col span={6} style={{ textAlign: 'center', margin: '10 0' }}>
                                            {this.state.currentUnitIndex != index && <Button onClick={() => { this.switchUnit(index) }} type="dashed" >{index + 1}</Button>}
                                            {this.state.currentUnitIndex == index && <Button onClick={() => { this.switchUnit(index) }} type="primary" >{index + 1}</Button>}
                                        </Col>
                                    })}
                                </Row>
                            </Col>
                        </Row>
                    </div>
                }
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        return (
            <Card title={title} extra={
                <div>
                    {this.props.editMode == 'Design' && <div className='course-designer-control'>
                        {false && <Button style={{ marginRight: 10 }} type="dashed" icon="plus" onClick={() => { this.onAddUnit('Cover') }}>单元封面</Button>}
                        {
                            this.props.dic_courseWareTypes
                                .filter((item) => {
                                    if (this.state.dataModel.SupportUnitType == 0) {
                                        return true;
                                    }
                                    else {
                                        return item.code == this.state.dataModel.SupportUnitType.toString();
                                    }
                                })
                                .map((item) => {
                                    return <Button style={{ marginRight: 10 }} type="dashed" icon="plus" onClick={() => { this.onAddUnit(item.value) }}>{item.title}</Button>
                                })
                        }
                        <Button style={{ marginRight: 10 }} type="primary" icon="save" loading={this.state.btnSaveLoading} onClick={() => { this.onUnitSaveAll() }}>保存</Button></div>}
                    <a style={{ marginRight: 10 }} onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>
                </div>
            }>
                {block_editModeView}
            </Card>
        );
    }
}

const WrappedLectureCourseView = Form.create()(LectureCourseView);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getCourseUnitList: bindActionCreators(getCourseUnitList, dispatch),
        loadPdfDocuments: bindActionCreators(loadPdfDocuments, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedLectureCourseView);