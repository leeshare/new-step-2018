import React from 'react';
import { Tag, Input, Tooltip, Button, AutoComplete } from 'antd';

class EditableUserTagGroup extends React.Component {
    input = null
    constructor(props) {
        super(props)
        this.state = {
            maxTags: (props.maxTags || 100),//标签最大数量
            tags: (props.value || []),
            showEmail: props.showEmail || false,
            inputVisible: false,
            inputValue: '',
            dataSource: []
        };
    }
    componentWillReceiveProps(nextProps) {
        // Should be a controlled component.
        if ('value' in nextProps) {
            const value = nextProps.value || [];
            this.setState({ tags: (value) });
        }
    }

    renderOption(item) {
        return `${item.chinese_name == item.name ? item.name : item.chinese_name + ' ' + item.name}(${item.username})`;
    }
    handleSearch = (value) => {
        var searchOptions = this.props.searchOptions || {};
        this.props.smartInputSearchUserList({ keyword: value, ...searchOptions }).payload.promise.then((response) => {
            let data = response.payload.data;
            this.setState({ dataSource: data.data_list })
        })
    }
    onSelect = (value, option) => {
        const state = this.state;
        let tags = state.tags;
        var userInfo = this.state.dataSource[option.props.index];
        if (tags.find(A => A.uid == userInfo.uid) == null) {
            tags = [...tags, userInfo];
        }
        console.log(tags);
        this.setState({
            tags,
            inputVisible: false,
            inputValue: '',
            dataSource: []
        });
        this.triggerChange((tags));//编辑内容回调
    }


    triggerChange = (changedValue) => {
        // Should provide an event to pass value to Form.
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(changedValue);
        }
    }

    handleClose = (removedTag) => {
        const tags = this.state.tags.filter(tag => tag.uid !== removedTag.uid);
        console.log(tags);
        this.setState({ tags });
        this.triggerChange((tags));//编辑内容回调
    }

    showInput = () => {
        this.setState({ inputVisible: true });
    }
    render() {
        const { tags, inputVisible, inputValue } = this.state;
        return (
            <div style={{ marginTop: 5 }}>
                {tags.map((tag, index) => {
                    const isLongTag = tag.length > 20;
                    const tagElem = (
                        <Tag key={tag.uid} closable afterClose={() => this.handleClose(tag)}>
                            {isLongTag ? `${(tag.name == tag.chinese_name ? (this.state.showEmail ? tag.email : tag.name) : tag.chinese_name + ' ' + (this.state.showEmail ? tag.email : tag.name)).slice(0, 20)}...` : (tag.name == tag.chinese_name ? (this.state.showEmail ? tag.email : tag.name) : tag.chinese_name + ' ' + (this.state.showEmail ? tag.email : tag.name))}
                        </Tag>
                    );
                    return isLongTag ? <Tooltip title={tag.name}>{tagElem}</Tooltip> : tagElem;
                })}
                {inputVisible && (
                    <AutoComplete
                        dataSource={this.state.dataSource.map(this.renderOption)}
                        style={{ width: 200 }}
                        onSelect={this.onSelect}
                        onSearch={this.handleSearch}
                        placeholder="支持账号、姓名模糊搜索"
                    />
                )}
                {!inputVisible && this.state.tags.length < this.state.maxTags && <Button size="small" type="dashed" onClick={this.showInput}>+ 用户</Button>}
            </div>
        );
    }
}



export default EditableUserTagGroup;