//私有部门文件管理

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

import ButtonGroup from '@/components/ButtonGroup';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
  searchFormItemLayout, searchFormItemLayout24,
  loadBizDictionary, onSearch, onSearchToggle, onPageIndexChange,
  onShowSizeChange
} from '@/utils/componentExt';
//工具类方法引入
import { YSI18n, getDictionaryTitle, timestampToTime } from '@/utils';
import { _download } from '@/utils/download';

//业务接口方法引入
import {
  folderSelfListQuery, folderSelfSave,
  folderDelete, fileDelete, fileNameUpdate
} from '@/actions/file';
//业务数据视图（增、删、改、查)
//import ChannelView from './ChannelView';

import { DefaultPlayer as Video } from 'react-html5video';
import { serverURL, getToken } from '../../api/env';
const Search = Input.Search;
class SelfManage extends React.Component {
  constructor(props) {
    super(props)

    //组件状态初始化过程
    this.state = {
      expand: false,
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: { PageIndex: 1, PageSize: 999, Keyword: '', GroupName: '', Status: "-1" },
      all_data_list: [],
      curr_data_list: [],
      loading: false,
      isupload: false,
      uploadList: [],
      menus: [],
      //curr_folder: {},  //data_list中的某一项
      curr_id: '',    //当前目录的id

      curr_file: {},
    };

    this._download = _download.bind(this);
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    (this: any).gotoFolder = this.gotoFolder.bind(this);
    (this: any).gotoFile = this.gotoFile.bind(this);
    (this: any).onCreateFolder = this.onCreateFolder.bind(this);
    (this: any).onCommitFolder = this.onCommitFolder.bind(this);
    (this: any).onCancelFolder = this.onCancelFolder.bind(this);
    (this: any).onFolderChange = this.onFolderChange.bind(this);
    (this: any).onAddFileToList = this.onAddFileToList.bind(this);
    (this: any).onMouseEnterRow = this.onMouseEnterRow.bind(this);
    (this: any).onMouseOutRow = this.onMouseOutRow.bind(this);
    (this: any).filterList = this.filterList.bind(this);

    (this: any).onFileDownload = this.onFileDownload.bind(this);
    (this: any).changeName = this.changeName.bind(this);
    (this: any).copyUrl = this.copyUrl.bind(this);
    (this: any).deleteFolderFile = this.deleteFolderFile.bind(this);
    (this: any).setUploadResult = this.setUploadResult.bind(this);

    (this: any).addFileOrFolderToList = this.addFileOrFolderToList.bind(this);
    (this: any).replaceFileOrFolderToList = this.replaceFileOrFolderToList.bind(this);
    (this: any).removeFileOrFolderFromList = this.removeFileOrFolderFromList.bind(this);
  }

  componentWillMount() {
    //载入需要的字典项
    this.loadBizDictionary(['dic_Status']);
    //首次进入搜索，加载服务端字典项内容
    this.onSearch();
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
              case '.rar':
              case '.zip':
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
              {!!record.show_download && <Button style={{ marginLeft: 10 }} icon="download" onClick={() => { this.onFileDownload(record) }}></Button>}
            </Row>
          }
        }
      },
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
      width: 200,//可预知的数据长度，请设定固定宽度
      dataIndex: 'updatedDateStr',
      sorter: (a, b) => Date.parse(new Date(a.updatedDateStr)) - Date.parse(new Date(b.updatedDateStr)),
    },
    {
      title: YSI18n.get('操作'),
      width: 180,
      render: (text, record) => {
        let popmenu = <div className='block_popmentu'>
          <a onClick={() => this.changeName(record)}>重命名</a>
          {/* <a onClick={() => this.onFileDownload(record)}>下载</a> */}
          <a href={record.file_url} download={record.name}>下载</a>
          <a onClick={() => this.deleteFolderFile(record)}>删除</a>
          <a onClick={() => this.copyUrl(record)}>复制链接</a>
        </div>
        /*return (
            <Popover placement="bottom" title={null} content={popmenu} trigger="click">
              <Icon type='ellipsis' className='ico_ellipsis' />
            </Popover>
        )*/
        return (
          <ButtonGroup>
            <a onClick={() => this.changeName(record)}><Icon type="edit" className='icon_button' /></a>
            {record.f_type != 'folder' && <a href={record.file_url} download={record.name}><Icon type='download' className='icon_button' style={{fontSize: '20px'}}  /></a>}
            {/* {record.f_type != 'folder' && <a href={record}><Icon type='download' className='icon_button' style={{fontSize: '20px'}} onClick={() => this.onFileDownload(record)} /></a>} */}
            {false && <a className='ico-download-success' />}
            <a><Icon type="delete" className='icon_button' onClick={() => this.deleteFolderFile(record)} /></a>

          </ButtonGroup>
        )

      }
    },
  ];

  fetch = (pagingSearch) => {
    this.setState({ loading: true })
    this.props.folderSelfListQuery().payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        var data_list = [];
        var root_list = [];
        data.data_list.map(a => {
          a.folder_list.map(b => {
            b.key = b.id;
            b.f_type = 'folder';
            data_list.push(b);
            if (b.parent_id == '' || b.parent_id == '00000000-0000-0000-0000-000000000000') {
              root_list.push(b);
            }
          })
          a.file_list.map(b => {
            b.key = b.id;
            b.f_type = 'file';
            data_list.push(b);
            if (b.parent_id == '' || b.parent_id == '00000000-0000-0000-0000-000000000000') {
              root_list.push(b);
            }
          })
        })
        this.setState({
          pagingSearch,
          loading: false,
          all_data_list: data_list,
          root_list: root_list,
          curr_data_list: root_list,
        })
      }
    })
  }
  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  //进入文件夹
  // [上一级目录]，[某一级目录]，[根目录]
  gotoFolder(record, id) {
    //1. 点击第一级目录时 选择根文件夹
    //var curr_folder = null;
    /*if(record){
      for(var i = 0; i < this.state.data_list.length; i++){
        var f = this.state.data_list[i];
        if(f.id == record.id){
          //----------------------------------------------------//
          //这里相当，说明点击的是根目录，就可以设置 curr_folder了--//
          //----------------------------------------------------//
          curr_folder = f;
          break;
        }
      }
      if(curr_folder){
        this.setState({
          curr_folder: curr_folder, //设置根文件夹
        })
      }
    }*/

    //2. [进入上一级目录]
    //curr_folder = curr_folder || this.state.curr_folder;
    if (id && !record) {
      for (var i = 0; i < this.state.all_data_list.length; i++) {
        var f = this.state.all_data_list[i];
        if (f.id == id && f.f_type == 'folder') {
          record = f;
          break;
        }
      }
    }
    if (record) {
      id = record.id;
      var isExist = false;
      var menus = this.state.menus;
      //var menu_names = this.state.menu_names;
      var _index = -1;
      menus.map((a, i) => {
        if (a.id == id) {
          isExist = true;
          _index = i;
        }
      });
      if (!isExist) {
        menus.push({ id: id, name: record.name });
      } else if (_index >= 0) {
        menus = menus.splice(0, _index + 1);
      }
      var currs = [];
      this.state.all_data_list.map(d => {
        if (d.parent_id == id) {
          d.key = d.id;
          currs.push(d);
          /*currs.push({
            name: d.name,
            id: d.id,
            key: d.id,
            f_type: d.f_type,
            updatedDateStr: d.updatedDateStr,
            parent_id: id,
          })*/
        }
      });

      this.setState({
        menus: menus,
        curr_data_list: currs,
        curr_id: id,
      })

    }
    if (!id && !record) {
      //[进入根目录]
      this.setState({
        menus: [],
        curr_data_list: this.state.root_list,
        curr_id: '',
      })
    }

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
      id = this.state.curr_id;
      var curr;
      for (var i = 0; i < this.state.all_data_list.length; i++) {
        var m = this.state.all_data_list[i];
        if (m.id == id && m.f_type == 'folder') {
          curr = m;
          break;
        }
      }
      if (curr) {
        if (!curr.parent_id || curr.parent_id == '00000000-0000-0000-0000-000000000000') {
          this.gotoFolder('', '');
          return;
        }
        for (var i = 0; i < this.state.all_data_list.length; i++) {
          var m = this.state.all_data_list[i];
          if (m.id == curr.parent_id) {
            this.gotoFolder('', curr.parent_id);
            return;
          }
        }
      }

    } else if (type == 'all') {
      this.gotoFolder('', '');
      return;
    }
    alert('未选择任何文件夹');
  }
  onCreateFolder() {
    //if(this.state.curr_id){
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

    //}
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
          //curr_list[i].name = value;
          curr_list[i]._name = value;
          break;
        }
      }
    } else {
      //新建文件夹
      if (curr_list.length) {
        //curr_list[0].name = value;
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
      //新建文件夹 提交
      var name = this.state.curr_data_list[0]._name;
      var parent_id = this.state.curr_id;
      if (name && !this.state.curr_data_list[0].id) {
        this.props.folderSelfSave({ parentId: parent_id, folderName: name }).payload.promise.then((response) => {
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
              this.replaceFileOrFolderToList(currs[0]);
            }
          }
        })
      }
    }
    if (record) {
      //重命名提交
      this.props.fileNameUpdate({ id: record.id, newName: record._name, fType: record.f_type }).payload.promise.then((response) => {
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
  onAddFileToList(fileInfo: any, folderName: string) {
    if (!fileInfo) {
      message.error('文件信息不全！');
      return;
    }
    var currs = this.state.curr_data_list;
    var all_data_list = this.state.all_data_list;
    if(folderName){
      var isExist = false;
      for(var i = 0; i < currs.length; i++){
        if(currs[i].id == fileInfo.parent_id){
          isExist = true;
          break;
        }
      }
      if(!isExist){
        currs.splice(0, 0, {
          name: folderName,
          id: fileInfo.parent_id,
          key: fileInfo.parent_id,
          f_type: 'folder',
          parent_id: this.state.curr_id
        });
      }
      all_data_list.splice(0, 0, {
        name: fileInfo.name,
        id: fileInfo.id,
        key: fileInfo.id,
        f_type: 'file',
        updatedDateStr: fileInfo.updated_date_str,
        parent_id: fileInfo.parent_id,
        size: fileInfo.file_size,
        file_size: fileInfo.file_size,
        file_size_str: fileInfo.file_size_str,
        file_url: fileInfo.file_url,
        file_type: fileInfo.file_type
      });
    }else {
      currs.splice(0, 0, {
        name: fileInfo.fileName,
        id: fileInfo.fileId,
        key: fileInfo.fileId,
        f_type: 'file',
        updatedDateStr: fileInfo.modate,
        parent_id: fileInfo.folderId || fileInfo.parent_id,
        size: fileInfo.size,
        file_size: fileInfo.size,
        file_size_str: fileInfo.file_size_str,
        file_url: fileInfo.fileUrl,
        file_type: fileInfo.fileType
      })
      all_data_list.splice(0, 0, currs[0]);
    }
    //这里还要把新加的目录填入 curr_folder中
    //var curr_folder = this.state.curr_folder;
    //var _folder_list = curr_folder.folder_list;
    //curr_folder.folder_list.splice(0, 1, currs[0]);
    this.setState({
      curr_data_list: currs,
      //curr_folder: curr_folder
      all_data_list: all_data_list
    })
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
  onMouseEnterRow = (record) => {
    this.mouseEnterId = record.id;
    if (record.f_type == 'file') {
      for (var i = 0; i < this.state.curr_data_list.length; i++) {
        var c = this.state.curr_data_list[i];
        if (c.id == record.id) {
          c.show_download = true;
          break;
        }
      }
      this.setState({
        curr_data_list: this.state.curr_data_list
      })
    }
  }
  onMouseOutRow = (record) => {
    this.mouseEnterId = record.id;
    if (record.f_type == 'file') {
      for (var i = 0; i < this.state.curr_data_list.length; i++) {
        var c = this.state.curr_data_list[i];
        if (c.id == record.id) {
          c.show_download = false;
          break;
        }
      }
      this.setState({
        curr_data_list: this.state.curr_data_list
      })
    }
  }
  setRowClassName = (record) => {
    return record.id === this.mouseEnterId ? 'clickRowStyl' : '';
  }

  filterList(value) {
    if (!value) {
      //使用原始的
      var currs = this.state.root_list;
      this.setState({
        curr_data_list: currs
      })
    } else {
      var alls = this.state.all_data_list;
      var currs = [];
      for (var i = 0; i < alls.length; i++) {
        if (alls[i].name.indexOf(value) >= 0) {
          currs.push(alls[i]);
        }
      }
      this.setState({
        curr_data_list: currs
      })
    }
  }

  onFileDownload = (record) => {
    var that = this;
    if (record && record.f_type == 'file') {
      // try {
          var url = record.file_url;
        window.open(url, 'window name', 'window settings');

      //   var name = record.name;
      //   //window.open(url, 'window name', 'window settings');
      //   var x = new XMLHttpRequest();
      //   x.open("GET", url, false);
      //   x.responseType = 'blob';
      //   x.onload = function (e) {
      //     that._download(x.response, name, "application/octet-stream");
      //   }
      //   x.send();

      // } catch (e) {

      // }
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
  copyUrl(record) {
    //alert(record.file_url)
    copy(record.file_url);
    message.success('复制成功，如果失败，请在输入框内手动复制.');
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
          message.error(data.message || '无法删除');
        } else {
          message.success("删除成功");
          this.removeFileOrFolderFromList(record);
        }
      })
    }
  }

  addFileOrFolderToList(record) {
    var alls = this.state.all_data_list || [];
    var currs = this.state.curr_data_list || [];
    currs.splice(0, 0, record);
    alls.splice(0, 0, record);
    this.setState({
      curr_data_list: currs,
      all_data_list: alls
    })
  }
  replaceFileOrFolderToList(record) {
    var id = record.id;
    var alls = this.state.all_data_list || [];
    var currs = this.state.curr_data_list || [];
    for (var i = 0; i < alls.length; i++) {
      if (alls[i].id == id) {
        alls.splice(i, 1, record);
        break;
      }
    }
    for (var i = 0; i < currs.length; i++) {
      if (currs[i].id == id) {
        currs.splice(i, 1, record);
        break;
      }
    }
    this.setState({
      curr_data_list: currs,
      all_data_list: alls
    })
  }
  removeFileOrFolderFromList(record) {
    var id = record.id;
    var alls = this.state.all_data_list || [];
    var currs = this.state.curr_data_list || [];
    for (var i = 0; i < alls.length; i++) {
      if (alls[i].id == id) {
        alls.splice(i, 1);
        break;
      }
    }
    for (var i = 0; i < currs.length; i++) {
      if (currs[i].id == id) {
        currs.splice(i, 1);
        break;
      }
    }
    this.setState({
      all_data_list: alls,
      curr_data_list: currs
    })
  }

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
              //that.getDataByParent(that.state.curr_id);
              //that.onSearch();
              var full = info.file.originFileObj.webkitRelativePath;
              var folderName = full.substr(0, full.indexOf('/'));
              that.onAddFileToList(file, folderName);//上传回调
            }else {
              //that.addFileOrFolderToList(file);
              that.onAddFileToList(file);//上传回调
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
    switch (this.state.editMode) {
      case "Create":
      case "Edit":
      case "View":
      case "Delete":
        //                block_content = <ChannelView viewCallback={this.onViewCallback} {...this.state} />
        break;
      case "Manage":
      default:
        let that = this;
        let token = getToken();
        let functionType = 'DepartFiles';
        let folderId = this.state.curr_id;
        var action_url = `${serverURL}/DeptFile/Upload?token=${token}&functionType=${functionType}&folderId=${folderId}&folderType=2`;
        var action_folder_url = `${serverURL}/DeptFile/Upload?token=${token}&functionType=${functionType}&folderId=${folderId}&folderType=2&isFolder=true`;
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
          <div >
            <Form className="search-form">
              <Row style={{ marginBottom: '10' }}>
                <Col span={2}>
                  <Upload {...upload_props} fileList={this.state.uploadList}>
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
                      <Button type="primary" ghost onClick={this.onCreateFolder} className='button_newfolder'>{YSI18n.get('新建文件夹')}</Button>
                    </div>
                </Col>

                <Col span={8}>
                  <div className='search_input_wrap'><Search
                    placeholder="搜索文件"
                    onSearch={value => this.filterList(value)}
                    style={{ width: 236 }}
                  /></div>
                </Col>
              </Row>
              <Row>
                <Col span={24} style={{ textAlign: 'left' }}>
                  {this.state.menus.length > 0 ?
                    <div>
                      <a onClick={() => { this.gotoMenu('', 'last') }}>返回上一级</a>
                      <span> > </span>
                      <a onClick={() => { this.gotoMenu('', 'all') }}>全部文件</a>
                      <span> > </span>
                      {this.state.menus.map((m, i) => {
                        if (i == this.state.menus.length - 1)
                          return <span>{m.name}</span>
                        else
                          return <a onClick={() => { this.gotoMenu(m.id, 'curr') }}>{m.name} > </a>
                      })}

                    </div>
                    : <span>全部文件</span>
                  }
                </Col>
              </Row>
            </Form>
            <div className="search-result-list">
              <Table
                loading={this.state.loading}
                pagination={false}
                columns={this.columns} //列定义
                dataSource={this.state.curr_data_list}//数据
              //rowClassName={this.setRowClassName}
              /*onRow={(record) => {
                return {
                  onMouseEnter: () => that.onMouseEnterRow(record),
                  onMouseLeave: () => that.onMouseOutRow(record),
                }
              }}*/
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
            <iframe id="ifile" style={{ display: 'none' }}></iframe>
          </div>
        );
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedSelfManage = Form.create()(SelfManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    folderSelfListQuery: bindActionCreators(folderSelfListQuery, dispatch),
    folderSelfSave: bindActionCreators(folderSelfSave, dispatch),

    folderDelete: bindActionCreators(folderDelete, dispatch),
    fileDelete: bindActionCreators(fileDelete, dispatch),
    fileNameUpdate: bindActionCreators(fileNameUpdate, dispatch),

  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedSelfManage);
