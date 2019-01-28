import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Spin, Tabs, Form } from 'antd';
import { getOrganizationList } from '@/actions/org';
import { getDictionaryTitle, dataBind, dateFormat } from '@/utils';
import TeachVideo from '../../Teacher/TeachVideo'
import './index.less'
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
class TeachVideoOrgQuery extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expand: false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: { PageIndex: 1, PageSize: 30, Keyword: '', Status: "1", OrganizationType: 2, DataOrder: 'CreatedDate' },
            data_list: [],
            data_list_total: 0,
            loading: true
        };
    }

    componentWillMount() {
        this.props.getOrganizationList(this.state.pagingSearch).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ ...data, loading: false })
            }
        })
    }

    //渲染，根据模式不同控制不同输出
    render() {
        if (this.state.loading) {
            return <div className='pingyin-designer showloading'>
                <Spin size="large" />
            </div>
        }
        return <div className={'card-container'}>
            <Tabs defaultActiveKey={'tab0'} type="card">
                {
                    this.state.data_list.map((item, index) => {
                        return <TabPane tab={item.OrganizationShortName} key={`tab${index}`}>
                            <TeachVideo OrganizationID={item.OrganizationID} />
                        </TabPane>
                    })
                }
            </Tabs>
        </div>
    }
}
//表单组件 封装
const WrappedTeachClassScheduleQuery = Form.create()(TeachVideoOrgQuery);

const mapStateToProps = (state) => {
    return state;
};

function mapDispatchToProps(dispatch) {
    return {
        getOrganizationList: bindActionCreators(getOrganizationList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachClassScheduleQuery);