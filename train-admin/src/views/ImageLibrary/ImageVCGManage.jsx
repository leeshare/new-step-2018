import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Card, Tabs } from 'antd';
const TabPane = Tabs.TabPane;
import './index.less';
import { switchMenuCollapse } from '@/actions/menu'
import ImageVCGLibrary from './ImageVCGLibrary'
import ImageDownloadLibrary from './ImageDownloadLibrary'
import ImageResourceLibrary from './ImageResourceLibrary'
class ImageVCGManage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        };
    }

    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.props.switchMenuCollapse(true);
    }
    //渲染，根据模式不同控制不同输出
    render() {
        return <div className="card-container">
            <Tabs type="card">
                <TabPane tab="视觉中国在线图库" key="1">
                    <ImageVCGLibrary onSelectedResourceImage={this.props.onSelectedResourceImage} />
                </TabPane>
                <TabPane tab="视觉中国下载图库" key="2">
                    <ImageDownloadLibrary onSelectedResourceImage={this.props.onSelectedResourceImage} />
                </TabPane>
                <TabPane tab="资源图库" key="3">
                    <ImageResourceLibrary onSelectedResourceImage={this.props.onSelectedResourceImage} />
                </TabPane>
            </Tabs>
        </div>

    }
}
//表单组件 封装
const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        switchMenuCollapse: bindActionCreators(switchMenuCollapse, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(ImageVCGManage);