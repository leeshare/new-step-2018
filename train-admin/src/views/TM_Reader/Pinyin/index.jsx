import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { message, Row, Col, Input, Spin, } from 'antd';

import { transformToPinyin } from '@/actions/tm';

import './index.less';

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class PinyinView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            Content: props.value.Content || '',//数据模型
            ContentPinyins: props.value.ContentPinyins || [],
            ContentLayout: props.value.ContentLayout,
            IsShowPhonetic: props.value.IsShowPhonetic,
            currentIndex: -1,
            currentEditObjtype: 0,
            EditMode: props.EditMode || 'View',
            PinyinSpan: props.PinyinSpan || 1,
        };

    }
    componentWillMount() {
        if (!this.props.value.ContentPinyins || this.props.value.ContentPinyins.length == 0) {
            this.state.Content != '' && this.state.IsShowPhonetic && this.doTransformToPinyin(this.state.Content);
        }
        else if (this.props.EditMode != 'Edit') {
            this.triggerChange();
        }
    }
    componentWillReceiveProps(nextProps) {
        // Should be a controlled component.
        this.setState({ ContentLayout: nextProps.value.ContentLayout, IsShowPhonetic: nextProps.value.IsShowPhonetic })
        if (nextProps.value.Content != this.state.Content) {
            this.setState({ Content: nextProps.value.Content });
            nextProps.value.IsShowPhonetic && this.doTransformToPinyin(nextProps.value.Content);
        }
    }

    doTransformToPinyin(Content) {
        this.setState({ loading: true });
        this.props.transformToPinyin(Content).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ ContentPinyins: data, loading: false })
                this.triggerChange();
            }
        })
    }
    triggerChange = () => {
        // Should provide an event to pass value to Form.
        const onChange = this.props.onChange;
        if (onChange) {
            onChange({
                Content: this.state.Content,
                ContentPinyin: JSON.stringify(this.state.ContentPinyins),
                ContentPinyins: this.state.ContentPinyins,
                ContentLayout: this.state.ContentLayout,
                IsShowPhonetic: this.state.IsShowPhonetic
            });
        }
    }
    onTextChange = (e, editObjType) => {
        e.stopPropagation();

        var value = e.target.value;
        if (editObjType == 1) {
            this.state.ContentPinyins[this.state.currentIndex].Phonetic = value;
        }
        else {
            this.state.ContentPinyins[this.state.currentIndex].Character = value;
        }
        this.setState({ ContentPinyins: this.state.ContentPinyins });
        this.triggerChange();
    }
    onEditMode = (e, index, editObjType) => {
        if (this.state.EditMode == 'View') {
            return;
        }
        e.stopPropagation();
        this.setState({ currentIndex: index, currentEditObjtype: editObjType });
    }
    onCancelEditMode = (e, editObjType) => {
        //更新
        e.stopPropagation();
        this.setState({ currentIndex: -1, currentEditObjtype: 0 });
    }
    render() {
        if (this.state.loading) {
            return <div className='pingyin-designer showloading'>
                <Spin size="large" />
            </div>
        }
        else {
            if (this.state.IsShowPhonetic) {
                var pinyinWrapIndexs = [];
                this.state.ContentPinyins.filter((item, index) => {
                    if (item.Character.charCodeAt() == 10) {
                        pinyinWrapIndexs.push(index);
                    }
                });
                pinyinWrapIndexs.push(this.state.ContentPinyins.length);
                var startPinyinIndex = 0;
                var pinyinBlocks = pinyinWrapIndexs.map((pinyinWrapIndex) => {
                    var paragraphContent = <Row type="flex" justify={this.state.ContentLayout.toString() == '2' ? 'center' : ''}>{
                        this.state.ContentPinyins.map((item, index) => {
                            return (index >= startPinyinIndex && index < pinyinWrapIndex) && <Col span={this.state.PinyinSpan}>
                                {this.state.IsShowPhonetic.toString() == '1' ? <div className="phonetic-item" onClick={(e) => { this.onEditMode(e, index, 1) }}>{(this.state.currentIndex == index && this.state.currentEditObjtype == 1) ? <input key={'txtPhonetic'} value={item.Phonetic} onChange={(e) => { this.onTextChange(e, 1) }} onBlur={(e) => this.onCancelEditMode(e, 1)} /> : (item.Phonetic)}</div> : <div className="phonetic-item">&nbsp;</div>}
                                <div className="charater-item" onClick={(e) => { this.onEditMode(e, index, 2) }}>{(this.state.currentIndex == index && this.state.currentEditObjtype == 2) ? <input key={'txtCharacter'} value={item.Character} onChange={(e) => { this.onTextChange(e, 2) }} onBlur={(e) => this.onCancelEditMode(e, 2)} /> : (item.Character)}</div>
                            </Col>;
                        })
                    }</Row>;
                    startPinyinIndex = pinyinWrapIndex + 1;
                    return paragraphContent;
                });
                return <div onClick={(e) => { this.onCancelEditMode(e, 1) }}>{pinyinBlocks}</div>;
            }
            else {
                return <div>
                    {                        
                        this.state.Content.split('\n').filter(a => a != '').map((item, index) => {
                            return <p className="pageContent">{item}</p>
                        })
                    }
                </div>
            }
        }
    }
}

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        transformToPinyin: bindActionCreators(transformToPinyin, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(PinyinView);