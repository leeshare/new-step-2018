//机构列表

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
import { searchFormItemLayout, searchFormItemLayout24,
  loadBizDictionary, onSearch, onSearchToggle,
  onPageIndexChange, onShowSizeChange
} from '@/utils/componentExt';
//工具类方法引入
import { YSI18n, getDictionaryTitle, timestampToTime
} from '@/utils';
import { _download } from '@/utils/download';
import { serverURL, getToken } from '../../api/env';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//业务接口方法引入
import {
  fileCollectListQuery, fileCollectSave
} from '@/actions/file';
import {
  train_org_list
} from '@/actions/org';


class OrgManage extends React.Component {
  constructor(props) {
    super(props);

    //组件状态初始化过程
    this.state = {
      expand: false,
      currentDataModel: null,
      data_list: [],
      curr_data_list: [],
      loading: false,
      curr_file: {},
    };

    this._download = _download.bind(this);
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);

    (this: any).gotoFile = this.gotoFile.bind(this);
    (this: any).filterList = this.filterList.bind(this);

    (this: any).onFileDownload = this.onFileDownload.bind(this);
    (this: any).copyUrl = this.copyUrl.bind(this);

    (this: any).removeFileOrFolderFromList = this.removeFileOrFolderFromList.bind(this);
    (this: any).collectFile = this.collectFile.bind(this);
  }

  componentWillMount() {
    //载入需要的字典项
    //this.loadBizDictionary(['dic_Status']);
    this.onSearch();
  }

  //table 输出列定义
  columns = [
    {
      title: YSI18n.get('文件名称'),
      dataIndex: 'name',
      render: (text, record) => {

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
      }
    },
    {
      title: YSI18n.get('更新时间'),
      width: 200,
      dataIndex: 'updatedDateStr',
    },
    {
      title: YSI18n.get('操作'),
      width: 100,
      render: (text, record) => {
        let popmenu = <div className='block_popmentu'>
          <a href={record.file_url} download={record.name}>下载</a>
          <a onClick={() => this.copyUrl(record)}>复制链接</a>
          <a onClick={() => this.collectFile(record)}>取消收藏</a>
        </div>

        let block_opertion =
          <Popover placement="bottom" title={null} content={popmenu} trigger="click">
            <Icon type='ellipsis' className='ico_ellipsis' />
          </Popover>

        return (
          block_opertion
        )

      }
    },
  ];

  fetch = (pagingSearch) => {
    this.setState({ loading: true })
    this.props.train_org_list({a: 2}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        var _curr_list = [];
        data.data_list.map(a => {
          a.key = a.id;
          _curr_list.push(a);
        })
        this.setState({
          loading: false,
          //data_list: data.data_list,
          curr_data_list: _curr_list,
        })
      }
    })
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
  filterList(value) {
    var curr_folder = this.state.curr_folder;
    if (!curr_folder) {
      return;
    }
    var currs = [];
    if (!value) {
      //使用
      var root_id = curr_folder.id;
      curr_folder.folder_list.map(d => {
        if (d.parent_id == root_id) {
          d.key = d.id;
          currs.push(d);
        }
      });
      var index = currs.length > 0 ? currs.length : 0;
      curr_folder.file_list.map((d, i) => {
        if (d.parent_id == root_id) {
          d.key = d.id;
          currs.push(d);
        }
      });
    } else {
      var alls = this.state.data_list;
      curr_folder.folder_list.map(d => {
        if (d.name.indexOf(value) >= 0) {
          d.key = d.id;
          currs.push(d);
        }
      });
      var index = currs.length > 0 ? currs.length : 0;
      curr_folder.file_list.map((d, i) => {
        if (d.name.indexOf(value) >= 0) {
          d.key = d.id;
          currs.push(d);
        }
      });
    }

    this.setState({
      curr_data_list: currs
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
  copyUrl(record) {
    //alert(record.file_url)
    copy(record.file_url);
    message.success('复制成功，如果失败，请在输入框内手动复制.');
  }
  collectFile(record) {
    this.props.fileCollectSave({fileId: record.id, isDel: true}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      } else {
        message.success("取消收藏成功");
        this.removeFileOrFolderFromList(record);
      }
    })
  }

  //-----------------------------操作某一项到当前列表中（新增/修改/删除）
  removeFileOrFolderFromList(record) {
    var id = record.id;
    var currs = this.state.curr_data_list || [];
    for (var i = 0; i < currs.length; i++) {
      if (currs[i].id == id) {
        currs.splice(i, 1);
        break;
      }
    }

    this.setState({
      curr_data_list: currs,
      //data_list: alls,
    })
  }
  //-----------------------------END 操作某一项到当前列表中（新增/修改/删除）

  //渲染，根据模式不同控制不同输出
  render() {
    var that = this;
    let block_content = <div></div>
    let token = getToken();
    let functionType = 'DepartFiles';
    let folderId = this.state.curr_id;

    block_content = (
      <div>
        <Form className="search-form">
          <Row>
            <Col span={24} style={{ textAlign: 'left' }}>
              <span>文件收藏</span>
            </Col>
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
        <iframe id="ifile" style={{ display: 'none' }}></iframe>
      </div>
    );
    return block_content;
  }
}
//表单组件 封装
const WrappedOrgManage = Form.create()(OrgManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    fileCollectListQuery: bindActionCreators(fileCollectListQuery, dispatch),
    fileCollectSave: bindActionCreators(fileCollectSave, dispatch),

    train_org_list: bindActionCreators(train_org_list, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedOrgManage);
