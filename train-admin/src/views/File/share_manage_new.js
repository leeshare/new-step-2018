//公共文件资料管理/查看

import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button,
  Icon, Table, Pagination, Card, Upload, Modal, Divider, Popover
} from 'antd';
const FormItem = Form.Item;
import copy from 'copy-to-clipboard';
import { DefaultPlayer as Video } from 'react-html5video';
const Search = Input.Search;

import ButtonGroup from '@/components/ButtonGroup';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onSearchToggle, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';
//工具类方法引入
import { YSI18n, getDictionaryTitle, timestampToTime } from '@/utils';
import { _download } from '@/utils/download';
import { serverURL, getToken } from '../../api/env';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//业务接口方法引入
import {
  folderShareListQuery, folderShareListByParentQuery,
  folderShareSave, fileShareSave, folderDelete,
  fileDelete, fileNameUpdate, fileCollectSave,
  fileSearchByName, moveFolder
} from '@/actions/file';
//业务数据视图（增、删、改、查)
//import ChannelView from './ChannelView';
import FolderTree from '@/views/File/folder_tree';

class ShareManage extends React.Component {
  constructor(props) {
    super(props);

    //组件状态初始化过程
    this.state = {
      expand: false,
      currentDataModel: null,
      pagingSearch: { PageIndex: 1, PageSize: 999, parentFolderId: "" },
      data_list: [],
      curr_data_list: [],
      root_data_list: [],
      loading: false,
      uploadList: [],
      uploadListOfFolder: [],
      auth_list: [],    //当前用户授权的文件夹的列表

      menus: [],
      //menu_names: [],

      curr_folder: {},  //data_list中的某一项
      curr_id: '',    //当前目录的id

      curr_file: {},
    };

    this._download = _download.bind(this);
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    (this: any).getDataByParent = this.getDataByParent.bind(this);

    (this: any).gotoFolder = this.gotoFolder.bind(this);
    (this: any).gotoFile = this.gotoFile.bind(this);
    (this: any).onCreateFolder = this.onCreateFolder.bind(this);
    (this: any).onCommitFolder = this.onCommitFolder.bind(this);
    (this: any).onCancelFolder = this.onCancelFolder.bind(this);
    (this: any).onFolderChange = this.onFolderChange.bind(this);
    (this: any).searchFile = this.searchFile.bind(this);

    (this: any).onFileDownload = this.onFileDownload.bind(this);
    (this: any).changeName = this.changeName.bind(this);
    (this: any).copyUrl = this.copyUrl.bind(this);
    (this: any).deleteFolderFile = this.deleteFolderFile.bind(this);

    (this: any).addFileOrFolderToList = this.addFileOrFolderToList.bind(this);
    (this: any).replaceFileOrFolderToList = this.replaceFileOrFolderToList.bind(this);
    (this: any).removeFileOrFolderFromList = this.removeFileOrFolderFromList.bind(this);
    (this: any).setUploadResult = this.setUploadResult.bind(this);
    //移动文件夹/文件
    (this: any).moveFolderOrFile = this.moveFolderOrFile.bind(this);
    (this: any).moveCallback = this.moveCallback.bind(this);
    (this: any).confirmMove = this.confirmMove.bind(this);
  }

  componentWillMount() {
    //载入需要的字典项
    this.loadBizDictionary(['dic_Status']);
    this.getDataByParent();
  }

  //table 输出列定义
  columns = [
    {
      title: YSI18n.get('目录名称'),
      dataIndex: 'name',
      render: (text, record) => {
        if (!record.id) {
          return <Row>
            <Input placeholder="输入文件夹名"
              defaultValue={record.name}
              style={{ width: '200px', marginRight: 5 }}
              onChange={this.onFolderChange}
            />
            <Button type="primary" icon="check" onClick={this.onCommitFolder} style={{ marginRight: 4 }}></Button>
            <Button type="primary" icon="close" onClick={this.onCancelFolder}></Button>
          </Row>
        } else if (record.edit) {
          return <Row>
            <Input placeholder={record.name}
              defaultValue={record.name}
              style={{ width: '200px', marginRight: 5 }}
              onChange={(e) => this.onFolderChange(e, record)}
            />
            <Button type="primary" icon="check" onClick={() => this.onCommitFolder(null, record)} style={{ marginRight: 4 }}></Button>
            <Button type="primary" icon="close" onClick={() => this.onCancelFolder(null, record)}></Button>
          </Row>
        }
        else {
          if (record.f_type == 'folder') {
            return <a onClick={() => { this.gotoFolder(record) }}><span className='icon_folder' />{text}</a>
          } else {
            let file_ico = '';
            switch (record.file_type) {
              case '.mp3':
                file_ico = 'ico_mp3';
                break;
              case '.mp4':
                file_ico = 'ico_mp4';
                break;
              case '.jpg':
              case '.png':
                file_ico = 'ico_png';
                break;
              case '.pdf':
                file_ico = 'ico_pdf';
                break;
              case '.ppt':
                file_ico = 'ico_ppt';
                break;
              case '.doc':
              case '.docx':
                file_ico = 'ico_doc';
                break;
              case '.zip':
              case '.rar':
                file_ico = 'ico_zip';
                break;
              case '.xls':
              case '.xlsx':
                file_ico = 'ico_xls';
                break;
              default:
                file_ico = 'ico_other';
                break;
            }
            return <Row>
              {(record.meta_type == 'video'
                || record.meta_type == 'picture'
              ) ? <a onClick={() => { this.gotoFile(record) }}><span className={file_ico} />{text}</a>
                : <span><span className={file_ico} />{text}</span>
              }
              {!!record.show_download &&  <a href={record.file_url} download={record.name}><Icon type='download' className='icon_button' style={{fontSize: '20px'}}  /></a>}
              {/* {!!record.show_download && <Button icon="download" style={{ marginLeft: 10 }} onClick={() => { this.onFileDownload(record) }}></Button>} */}
            </Row>
          }
        }

      },
      //defaultSortOrder: 'descend',
      defaultSortOrder: 'ascend',
      sorter: (a, b) => {
        if(a && b){
          //debugger
        }
        return a.name.localeCompare(b.name,"zh")
      }
    },
    {
      title: YSI18n.get('大小'),
      width: 180,
      dataIndex: 'file_size_str',
      render: (text, record) => {
        if (record.f_type == 'file') {
          return <span>{text}</span>
        }
        else {
          return <span>-</span>
        }
      },
      sorter: (a, b) => (a.f_type == 'file' ? a.file_size : 0) - (b.f_type == 'file' ? b.file_size : 0),
    },
    {
      title: YSI18n.get('更新时间'),
      width: 200,
      dataIndex: 'updatedDateStr',
      sorter: (a, b) => Date.parse(new Date(a.updatedDateStr)) - Date.parse(new Date(b.updatedDateStr)),
    },
    {
      title: YSI18n.get('操作'),
      width: 100,
      render: (text, record) => {
        let popmenu = <div className='block_popmentu'>
          <a onClick={() => this.changeName(record)}>重命名</a>
          {/* {record.f_type != 'folder' && <a onClick={() => this.onFileDownload(record)}>下载</a>} */}
          {record.f_type != 'folder' && <a href={record.file_url} download={record.name}>下载</a>}
          <a onClick={() => this.deleteFolderFile(record)}>删除</a>
          {<a onClick={() => this.copyUrl(record)}>复制链接</a>}
          {record.f_type != 'folder' && <a onClick={() => this.collectFile(record)}>收藏</a>}
          <a onClick={() => this.moveFolderOrFile(record)}>移动到</a>
        </div>

        let popmenu2 = <div className='block_popmentu'>
          {record.f_type != 'folder' && <a href={record.file_url} download={record.name}>下载</a>}
          {/* {record.f_type != 'folder' && <a onClick={() => this.onFileDownload(record)}>下载</a>} */}
          {record.f_type != 'folder' && <a onClick={() => this.copyUrl(record)}>复制链接</a>}
          {record.f_type != 'folder' && <a onClick={() => this.collectFile(record)}>收藏</a>}
        </div>

        let block_opertion = this.state.is_auth ?
          <Popover placement="bottom" title={null} content={popmenu} trigger="click">
            <Icon type='ellipsis' className='ico_ellipsis' />
          </Popover>
          : record.f_type != 'folder' ?
          <Popover placement="bottom" title={null} content={popmenu2} trigger="click">
            <Icon type='ellipsis' className='ico_ellipsis' />
          </Popover>
          : null
          {/*<ButtonGroup>
            {record.f_type != 'folder' && <a onClick={()=>this.onFileDownload(record)}><Icon type='download' style={{fontSize: '20px'}} /></a>}
            {false && <a className='ico-download-success' />}
            {false && <a className='ico-collect-success' />}
          </ButtonGroup>*/}

        return (
          block_opertion
        )

      }
    },
  ];

  getDataByParent(id){
    var that = this;
    this.setState({loading: true})
    this.props.folderShareListByParentQuery({parentFolderId: id}).payload.promise.then((response) => {
      let data = response.payload.data;
      if(data.result){
        //------------------
        var parent = data.parent_folder;
        /*var isMenuExist = false;
        var menus = that.state.menus;
        if(!parent){
          menus = [];
        }else {
          var _index = -1;
          menus.map((a, i) => {
            if(a.id == id){
              isMenuExist = true;
              _index = i;
            }
          })
          if(!isMenuExist){
            if(id && parent)
              menus.push({id: id, name: parent.name});
          }else if(_index >= 0){
            menus = menus.splice(0, _index + 1);
          }
        }*/
        //-------------------
        if(data.auth_list.length && !that.state.auth_list.length){
          that.setState({
            loading: false,
            curr_data_list: data.data_list,
            auth_list: data.auth_list,
            root_data_list: !id ? data.data_list : that.state.root_data_list,
            //menus: menus,
            menus: data.paths || [],
            curr_id: id,
            curr_parent_id: parent ? parent.parent_id : '',
            is_search: false,
          })
        }else {
          var _is_auth = false;
          var _auth = that.state.auth_list;
          var _root_id = data.paths.length ? data.paths[0].id : '';
          for(var i = 0; i < _auth.length; i++){
            if(_auth[i].folderId == _root_id){
              _is_auth = true;
              break;
            }
          }
          that.setState({
            loading: false,
            curr_data_list: data.data_list,
            root_data_list: !id ? data.data_list : that.state.root_data_list,
            //menus: menus,
            menus: data.paths,
            curr_id: id,
            curr_parent_id: parent ? parent.parent_id : '',
            is_search: false,
            is_auth: _is_auth
          })
        }
      }else {
        that.setState({loading: false})
        message.error(data.message);
      }
    })
  }

  gotoFolder(record, id) {
    var that = this;
    if(record && !id){
      id = record.id;
      this.setState({
        curr_parent_id: record.parent_id
      })
    }else if(id && !record){
    }else {
      this.setState({
        curr_data_list: this.state.root_data_list,
        menus: [],
        is_auth: false,
        curr_id: ''
      })
      return;
    }
    var isSecondRoot = false;
    var rootId = '';
    for(var i = 0; i < this.state.root_data_list.length; i++){
      var root = this.state.root_data_list[i];
      if(root.id == id){
        isSecondRoot = true;
        rootId = root.id;
        break;
      }
    }
    if(isSecondRoot){
      for(var i = 0; i < this.state.auth_list.length; i++){
        var auth = this.state.auth_list[i];
        if(auth.folderId == id){
          that.setState({
            is_auth: true,
            rootId: rootId,
          })
          break;
        }
      }
    }
    this.getDataByParent(id);
  }

  //播放文件
  gotoFile(record) {
    if (!record) {
      message.error('没有选择文件');
      return;
    }
    this.setState({
      curr_file: record,
      show_modal: true
    })
  }
  //点击路径的跳转
  gotoMenu(id, type) {
    if (type == 'curr') {
      this.gotoFolder('', id);
      return;
    } else if (type == 'last') {
      id = this.state.curr_parent_id;
      this.gotoFolder('', id);
      return;
    } else if (type == 'all') {
      this.gotoFolder('', '');
      return;
    }
    alert('未选择任何文件夹');
  }
  onCreateFolder() {
    if (this.state.is_auth && this.state.curr_id) {
      var curr_list = this.state.curr_data_list;
      if (curr_list.length && !curr_list[0].id) {
      } else {
        curr_list.splice(0, 0, {
          name: '新建文件夹',
          parent_id: this.state.curr_id,
          f_type: 'folder',
        });
        this.setState({
          curr_data_list: curr_list
        });
      }

    }
  }
  onFolderChange(e, record) {
    if (!e || !e.target.value) {
      return;
    }
    var curr_list = this.state.curr_data_list;
    var value = e.target.value;
    if (record) {
      //文件或文件夹改名
      for (var i = 0; i < curr_list.length; i++) {
        if (record.id == curr_list[i].id) {
          curr_list[i]._name = value;
          break;
        }
      }
    } else {
      if (curr_list.length) {
        curr_list[0]._name = value;

      }
    }
    this.setState({
      curr_data_list: curr_list
    })
  }
  onCommitFolder(e, record) {
    if (!this.state.curr_data_list.length) {
      return;
    }
    if (!record) {
      var name = this.state.curr_data_list[0]._name;
      var parent_id = this.state.curr_id;
      if (name && !this.state.curr_data_list[0].id && parent_id) {
        this.props.folderShareSave({ parentId: parent_id, folderName: name }).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            this.setState({ loading: false })
            message.error(data.message);
          }
          else {
            var currs = this.state.curr_data_list;
            if (currs.length && !currs[0].id) {
              currs[0].id = data.folderId;
              currs[0].key = data.folderId;
              currs[0].name=name;
              this.replaceFileOrFolderToList(currs[0])
            }
          }
        })
      }
    }
    if (record) {
      //重命名提交
      //var root_id = this.state.curr_folder.id;
      var root_id = this.state.rootId;
      this.props.fileNameUpdate({ id: record.id, newName: record._name, fType: record.f_type, rootId: root_id }).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.result === false) {
          this.setState({ loading: false })
          message.error(data.message);
        }
        else {
          var currs = this.state.curr_data_list || [];
          for (var i = 0; i < currs.length; i++) {
            if (record.id == currs[i].id) {
              currs[i].edit = false;
              currs[i].name=currs[i]._name;
              this.replaceFileOrFolderToList(currs[i]);
              break;
            }
          }
        }
      })
    }
  }
  onCancelFolder(e, record) {
    var curr_list = this.state.curr_data_list;
    if (!record) {
      if (curr_list.length && !curr_list[0].id) {
        curr_list.splice(0, 1);
      }
    } else {
      for (var i = 0; i < curr_list.length; i++) {
        if (curr_list[i].id == record.id) {
          curr_list[i].edit = false;
          break;
        }
      }
    }
    this.setState({
      curr_data_list: curr_list
    });
  }

  handleOk = (e) => {
    this.setState({
      show_modal: false,
    });
  }
  handleCancel = (e) => {
    this.setState({
      show_modal: false,
    });
  }

  //搜索
  searchFile(value) {
    if(!value){
      return;
    }
    this.setState({loading: true})
    if(!this.state.is_search){
      this.setState({
        last_menus: this.state.menus,
        last_curr_data_list: this.state.curr_data_list,
        is_search: true
      })
    }
    var that = this;
    this.props.fileSearchByName({selfOrShare: 1, text: value}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      } else {
        //data.folder_list
        //data.file_list
        var list = [];
        data.folder_list.map(f => {
          f.key = f.id;
          list.push(f);
        })
        data.file_list.map(f => {
          f.key = f.id;
          list.push(f)
        })
        //setTimeout(function(){
          that.setState({
            curr_data_list: list,
            menus: [],
            is_search: true,
            loading: false
          })
        //}, 200);

      }
    })

    //this.setState({ curr_data_list: currs })
  }
  cancelSearch(){
    this.setState({
      is_search: false,
      curr_data_list: this.state.last_curr_data_list,
      menus: this.state.last_menus,
      last_curr_data_list: [],
      last_menus: []
    })
  }
  //下载文件
  onFileDownload = (record) => {
    var that = this;
    if (record && record.f_type == 'file') {
      try {

        var url = record.file_url;
        var name = record.name;
        var x = new XMLHttpRequest();
        x.open("GET", url, true);
        x.responseType = 'blob';
        x.onload = function (e) {
          that._download(x.response, name, "application/file");
        }
        x.send();

      } catch (e) {

      }
      return false;
    }
  }
  changeName(record) {
    var curr_list = this.state.curr_data_list;
    for (var i = 0; i < curr_list.length; i++) {
      if (curr_list[i].id == record.id) {
        curr_list[i].edit = true;
        break;
      }
    }
    this.setState({
      curr_data_list: curr_list
    });
  }
  copyUrl(record, type) {
    //alert(record.file_url)
    var url = record.file_url;
    //url += '?id=' + (record.f_type == 'file' ? record.parent_id : record.id);
    url += '?id=' + record.id + '|' + record.parent_id + '|' + (record.f_type == 'file' ? 2 : 1);
    copy(url);
    /*if(type == 1)
      copy(url);
    else if(type == 2){
      if(record.f_type == 'file')
        copy(record.parent_id + '_folder' + '_' + record.id);
      else
        copy(record.id + '_folder');
    }*/
    message.success('复制成功，如果失败，请在输入框内手动复制.');
  }
  collectFile(record) {
    this.props.fileCollectSave({fileId: record.id, isDel: false}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      } else {
        message.success("收藏成功");
        //this.removeFileOrFolderFromList(record);
      }
    })
  }
  deleteFolderFile(record) {
    var id = record.id;
    if (record.f_type == 'file') {
      this.props.fileDelete({ fileId: id }).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.result === false) {
          this.setState({ loading: false })
          message.error(data.message || '无法删除');
        } else {
          message.success("删除成功");
          this.removeFileOrFolderFromList(record);
        }
      })
    }
    if (record.f_type == 'folder') {
      this.props.folderDelete({ folderId: id }).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.result === false) {
          this.setState({ loading: false })
          message.error(data.message);
        } else {
          message.success("删除成功");
          this.removeFileOrFolderFromList(record);
        }
      })
    }
  }
  //选中一个文件夹或文件，准备移动位置
  moveFolderOrFile(record) {
    if(this.state.rootId){
      var id = record.id;
      this.setState({
        moveFId: id,
        isShowOnlyFolderModel: true
      });
    }

  }
  moveCallback(folderId){
    //alert(folderId);
    //if(folderId){
      this.setState({
        moveToFolderId: folderId
      })
    //}
  }
  confirmMove(){
    var moveId = this.state.moveFId;
    var moveToId = this.state.moveToFolderId;
    if(moveId && moveToId){
      if(moveId == moveToId){
        message.info("不能移动到自己！");
        return;
      }

      this.setState({ loading: true })
      this.props.moveFolder({ fId: moveId, folderId: moveToId }).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            this.setState({ loading: false })
            message.error(data.message);
          }
          else {
            message.info("移动成功");
            this.setState({
              isShowOnlyFolderModel: false,
              moveFId: '',
              moveToFolderId: '',
              loading: false
            })
            this.getDataByParent(this.state.curr_id);

          }
      })

    }
  }
  //-----------------------------操作某一项到当前列表中（新增/修改/删除）
  addFileOrFolderToList(record) {
    //var alls = this.state.data_list || [];
    //var curr_folder = this.state.curr_folder || {};
    var currs = this.state.curr_data_list || [];
    //if (!curr_folder.id) {
    //  return;
    //}
    currs.splice(0, 0, record);
    /*if (record.f_type == 'file') {
      curr_folder.file_list.splice(0, 0, record);
    } else if (record.f_type == 'folder') {
      curr_folder.folder_list.splice(0, 0, record);
    }
    for (var i = 0; i < alls.length; i++) {
      if (alls[i].id == curr_folder.id) {
        alls[i] = curr_folder;
        break;
      }
    }*/
    this.setState({
      curr_data_list: currs,
      //curr_folder: curr_folder,
      //data_list: alls
    })
  }
  replaceFileOrFolderToList(record) {
    var id = record.id;
    //var alls = this.state.data_list || [];
    //var curr_folder = this.state.curr_folder || {};
    var currs = this.state.curr_data_list || [];
    for (var i = 0; i < currs.length; i++) {
      if (currs[i].id == id) {
        currs.splice(i, 1, record);
        break;
      }
    }
    /*var _list = [];
    if (record.f_type == 'file') {
      _list = curr_folder.file_list;
    } else if (record.f_type == 'folder') {
      _list = curr_folder.folder_list;
    }

    if(record.f_type == 'folder'){
      var isExist = false;
      for (var i = 0; i < _list.length; i++) {
        if (_list[i].id == id) {
          _list.splice(i, 1, record);
          isExist = true;
          break;
        }
      }
      if(!isExist){
        _list.splice(0, 1, record);
      }
      curr_folder.folder_list = _list;
    }*/

    //这里应该已经把 curr_folder给更新了吧
    /*for (var i = 0; i < alls.length; i++) {
      if (alls[i].id == curr_folder.id) {
        alls[i] = curr_folder;
        break;
      }
    }*/
    this.setState({
      curr_data_list: currs,
      //curr_folder: curr_folder,
      //all_data_list: alls
    })
  }
  removeFileOrFolderFromList(record) {
    var id = record.id;
    //var alls = this.state.data_list || [];
    //var curr_folder = this.state.curr_folder || {};
    var currs = this.state.curr_data_list || [];
    for (var i = 0; i < currs.length; i++) {
      if (currs[i].id == id) {
        currs.splice(i, 1);
        break;
      }
    }
    /*var _list = [];
    if (record.f_type == 'file') {
      _list = curr_folder.file_list;
    } else if (record.f_type == 'folder') {
      _list = curr_folder.folder_list;
    }
    for (var i = 0; i < _list.length; i++) {
      if (_list[i].id == id) {
        _list.splice(i, 1);
        break;
      }
    }
    //这里应该已经把 curr_folder给更新了吧
    for (var i = 0; i < alls.length; i++) {
      if (alls[i].id == curr_folder.id) {
        alls[i] = curr_folder;
        break;
      }
    }*/

    this.setState({
      curr_data_list: currs,
      //curr_folder: curr_folder,
      //data_list: alls,
    })
  }
  //-----------------------------END 操作某一项到当前列表中（新增/修改/删除）
  setUploadResult(info, isFolder){
      var that = this;
      let fileList = info.fileList;

      // fileList = fileList.slice(-2);
      fileList = fileList.map((file) => {
        if (file.response) {
          file.url = file.response.url;
        }
        return file;
      });
      fileList = fileList.filter((file) => {
        if (file.response) {
          return file.response.status === 'success';
        }
        return true;
      });
      //if(fileList.length && fileList[0].originFileObj.webkitRelativePath.indexOf('/') > 0)
      if(isFolder)
      {
        that.setState({ uploadListOfFolder: fileList });
      }else {
        that.setState({ uploadList: fileList });
      }

      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {

        // Get this url from response in real world.
        var localUrl = URL.createObjectURL(info.file.originFileObj);
        if (!info.file.response.data.result){
          if(info.file.response.message)
            message.error(`${info.file.name} ${info.file.response.message}`);
        }
        else {
          message.success(`${info.file.name} 上传成功.`);
          var file = info.file.response.data.data || {};
          if(file.id){
            file.key = file.id;
            if(isFolder){
              that.getDataByParent(that.state.curr_id);
            }else {
              that.addFileOrFolderToList(file);
            }
          }else{
            message.error("无返回文件");
          }
        }

      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败.`);
      }
  }

  //渲染，根据模式不同控制不同输出
  render() {
    var that = this;
    let block_content = <div></div>
    let token = getToken();
    let functionType = 'DepartFiles';
    let folderId = this.state.curr_id;
    var action_url = `${serverURL}/DeptFile/Upload?token=${token}&functionType=${functionType}&folderId=${folderId}&folderType=1`;
    var action_folder_url = `${serverURL}/DeptFile/Upload?token=${token}&functionType=${functionType}&folderId=${folderId}&folderType=1&isFolder=true`;
    let upload_props = {
      name: 'file',
      action: action_url,
      headers: { authorization: 'authorization-text', },
      multiple: true,
      onChange(info) {
        return that.setUploadResult(info);
      },
    };
    let upload_folder_props = {
      name: 'file',
      action: action_folder_url,
      headers: { authorization: 'authorization-text', },
      multiple: true,
      onChange(info) {
        return that.setUploadResult(info, true);
      },
    };

    block_content = (
      <div className='search-form-wrap'>
        <Form className="search-form">
          {this.state.is_auth && <Row style={{ marginBottom: '10' }}>
            <Col span={2}  >
              <Upload
                {...upload_props}
                fileList={this.state.uploadList}
                //directory={true}
                //action={action_url}
              >
                <Button type='primary'>{YSI18n.get('上传文件')}</Button>
              </Upload>
            </Col>
            <Col span={2}>
              <Upload
                {...upload_folder_props}
                fileList={this.state.uploadListOfFolder}
                directory={true}
              >
                <Button type='primary'>{YSI18n.get('上传文件夹')}</Button>
              </Upload>
            </Col>
            <Col span={12} style={{ textAlign: 'left' }}>
              <div className='dv_createrButton'>
                <Button type="primary" ghost onClick={() => this.onCreateFolder()} className='button_newfolder'>{YSI18n.get('新建文件夹')}</Button>
              </div>
            </Col>

            <Col span={8}>
              <div className='search_input_wrap'><Search
                placeholder="搜索文件"
                onSearch={value => this.searchFile(value)}
                style={{ width: 236 }}
              /></div>
            </Col>
          </Row>}
          <Row>
            <Col span={16}>
               {this.state.menus.length > 0 ?
                <div>
                  <a onClick={() => { this.gotoMenu('', 'last') }}>返回上一级</a>
                  <span> > </span>
                  <a onClick={() => { this.gotoMenu('', 'all') }}>文件资料</a>
                  <span> > </span>
                  {this.state.menus.map((m, i) => {
                    if (i == this.state.menus.length - 1)
                      return <span>{m.name}</span>
                    else
                      return <a onClick={() => { this.gotoMenu(m.id, 'curr') }}>{m.name} > </a>
                  })}

                </div>
                : <span>文件资料</span>
              }
            </Col>
           {!this.state.is_auth &&  <Col span={8}>
              <div className='search_input_wrap'>
                <Search
                placeholder="搜索文件"
                onSearch={value => this.searchFile(value)}
                style={{ width: 236 }}
                onChange={e=>this.setState({keywords:e.target.value})}
              />
             {!!this.state.is_search ? <Button type="primary" onClick={() => this.cancelSearch()} className='button_newfolder'>取消搜索</Button>:<Button type="primary" onClick={() =>this.searchFile(this.state.keywords)} className='button_newfolder'>搜索</Button>}
              </div>

            </Col>}
          </Row>

        </Form>
        <div className="search-result-list">
          <Table
            loading={this.state.loading}
            pagination={false}
            columns={this.columns} //列定义
            dataSource={this.state.curr_data_list}//数据
          />
        </div>
        <Modal
          title={this.state.curr_file.name}
          visible={this.state.show_modal}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={'55%'}
          footer={null}
        >
          {this.state.curr_file.meta_type == 'picture' &&
            <img src={this.state.curr_file.file_url} style={{ width: '100%', height: 'auto' }} />
          }

          {this.state.curr_file.meta_type == 'video' &&
            <Video key={`video_${this.state.curr_file.id}`}
              controls={['PlayPause', 'Seek', 'Time', 'Volume', 'Fullscreen']}
              onCanPlay={this.onVideoLoaded}
              onCanPlayThrough={this.onVideoLoaded}
              onPlaying={() => { this.setState({ videoError: '' }) }}
              onError={this.onVideoError}
            >
              <source src={this.state.curr_file.file_url} type="video/mp4" />
            </Video>
          }

        </Modal>
        {!!this.state.isShowOnlyFolderModel &&
          <Modal width={400}
            title="移动到"
            closable={true}
            wrapClassName="vertical-center-modal"
            visible={true}
            okText="确认"
            cancelText="取消"
            onOk={this.confirmMove}
            onCancel={() => {
              this.setState({ isShowOnlyFolderModel: false, moveFId: '' });
            }}
            //footer={null}
          >
            <FolderTree parentId={this.state.rootId} moveCallback={this.moveCallback} />
          </Modal>
        }
        <iframe id="ifile" style={{ display: 'none' }}></iframe>
      </div>
    );
    return block_content;
  }
}
//表单组件 封装
const WrappedShareManage = Form.create()(ShareManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    folderShareListQuery: bindActionCreators(folderShareListQuery, dispatch),
    folderShareListByParentQuery: bindActionCreators(folderShareListByParentQuery, dispatch),
    folderShareSave: bindActionCreators(folderShareSave, dispatch),
    fileShareSave: bindActionCreators(fileShareSave, dispatch),
    folderDelete: bindActionCreators(folderDelete, dispatch),
    fileDelete: bindActionCreators(fileDelete, dispatch),
    fileNameUpdate: bindActionCreators(fileNameUpdate, dispatch),
    fileCollectSave: bindActionCreators(fileCollectSave, dispatch),
    fileSearchByName: bindActionCreators(fileSearchByName, dispatch),
    moveFolder: bindActionCreators(moveFolder, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedShareManage);
