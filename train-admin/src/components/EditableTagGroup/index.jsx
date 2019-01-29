import React from 'react';
import { Tag, Input, Tooltip, Button } from 'antd';

class EditableTagGroup extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tags: this.convertStringToArray(props.value),
            inputVisible: false,
            inputValue: '',
        };
        if (props.value && props.value != '') {
            setTimeout(() => {
                this.triggerChange(this.convertArrayToString(this.convertStringToArray(props.value)));//编辑内容回调
            }, 200);
        }
    }
    convertArrayToString(list) {
        let joinChar = this.props.joinChar || ',';
        return (list || []).join(joinChar);
    }
    convertStringToArray(strValue) {
        if (typeof (strValue) == 'object') {
            return strValue;
        }
        let joinChar = this.props.joinChar || ',';
        return (strValue || '').split(joinChar).filter(A => A != '');
    }
    componentWillReceiveProps(nextProps) {
        // Should be a controlled component.
        if ('value' in nextProps) {
            const value = nextProps.value;
            this.setState({ tags: this.convertStringToArray(value) });
        }
    }
    triggerChange = (changedValue) => {
        // Should provide an event to pass value to Form.
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(changedValue);
        }
    }

    handleClose = (removedTag) => {
        const tags = this.state.tags.filter(tag => tag !== removedTag);
        console.log(tags);
        this.setState({ tags });
        this.triggerChange(this.convertArrayToString(tags));//编辑内容回调
    }

    showInput = () => {
        this.setState({ inputVisible: true }, () => this.input.focus());
    }

    handleInputChange = (e) => {
        this.setState({ inputValue: e.target.value });
    }
    handleInputConfirm = () => {
        const state = this.state;
        const inputValue = state.inputValue;
        //如果inputValue中有空格分割，则自动完成拆词
        var newTags = inputValue.split(' ').filter(A => A != '');
        let tags = state.tags;
        newTags.map((newTag) => {
            if (newTag && tags.indexOf(newTag) === -1) {
                tags = [...tags, newTag];
            }
        })

        console.log(tags);
        this.setState({
            tags,
            inputVisible: false,
            inputValue: '',
        });
        this.triggerChange(this.convertArrayToString(tags));//编辑内容回调
    }

    saveInputRef = input => this.input = input

    render() {
        const { tags, inputVisible, inputValue } = this.state;
        return (
            <div style={{ marginTop: 5 }}>
                {tags.map((tag, index) => {
                    const isLongTag = tag.length > 20;
                    const tagElem = (
                        <Tag key={tag} closable afterClose={() => this.handleClose(tag)}>
                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                        </Tag>
                    );
                    return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                })}
                {inputVisible && (
                    <Input
                        ref={this.saveInputRef}
                        type="text"
                        size="small"
                        style={{ width: this.props.styleWidth || 78 }}
                        value={inputValue}
                        onChange={this.handleInputChange}
                        onBlur={this.handleInputConfirm}
                        onPressEnter={this.handleInputConfirm}
                    />
                )}
                {inputVisible && (<span style={{ color: '#f04134' }}>可快速通过空格完成拆词</span>)}
                {!inputVisible && <Button size="small" type="dashed" onClick={this.showInput}>+ 新标签</Button>}
            </div>
        );
    }
}



export default EditableTagGroup;