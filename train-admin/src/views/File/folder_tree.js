//

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Tree, message, Form } from 'antd';
const { TreeNode } = Tree;

import {
  folderShareListByParentQuery
} from '@/actions/file';

class FolderTree extends React.Component {
  state = {
  }
  constructor(props){
    super(props);
    this.state = {
      treeData: [
        /*{ title: 'Expand to load', key: '0' },
        { title: 'Expand to load', key: '1' },
        { title: 'Tree Node', key: '2', isLeaf: true },*/
      ],
    };
    (this: any).getDataByParent = this.getDataByParent.bind(this);
    (this: any).nodeSelected = this.nodeSelected.bind(this);
  }
  componentWillMount(){
    var id = this.props.parentId;
    if(id){
      this.getDataByParent(null, id);
    }
  }

  getDataByParent(treeNode, id, callback){
    var that = this;
    if(!id){
      return;
    }
    this.setState({loading: true});
    this.props.folderShareListByParentQuery({parentFolderId: id, isOnlyFolder: true}).payload.promise.then((response) => {
      let data = response.payload.data;
      if(data.result){
        var list = [];
        data.data_list.map(d => {
          list.push(
            { title: d.name, key: d.id }
          )
        })
        if(!treeNode){
          that.setState({ treeData: list });
        }else {
          treeNode.props.dataRef.children = list;
          this.setState({
            treeData: [...this.state.treeData],
          });
          if(callback){
            callback();
          }
        }
      }else {
        that.setState({loading: false})
        message.error(data.message);
      }
    })
  }

  onLoadData = treeNode => new Promise((resolve) => {
    if (treeNode.props.children) {
      resolve();
      return;
    }
    this.getDataByParent(treeNode, treeNode.props.dataRef.key, function(){
      resolve();
    });
    return;

  })

  nodeSelected(folderId){
    if(folderId && folderId.length){
      this.props.moveCallback(folderId[0]);
    }else {
      this.props.moveCallback('');
    }
  }

  renderTreeNodes = data => data.map((item) => {
    if (item.children) {
      return (
        <TreeNode title={item.title} key={item.key} dataRef={item}>
          {this.renderTreeNodes(item.children)}
        </TreeNode>
      );
    }
    return <TreeNode {...item} dataRef={item} />;
  })

  render() {
    return (
      <Tree loadData={this.onLoadData} onSelect={this.nodeSelected}>
        {this.renderTreeNodes(this.state.treeData)}
      </Tree>
    );
  }
}

//表单组件 封装
const WrappedShareManage = Form.create()(FolderTree);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    //loadDictionary: bindActionCreators(loadDictionary, dispatch),
    folderShareListByParentQuery: bindActionCreators(folderShareListByParentQuery, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedShareManage);
