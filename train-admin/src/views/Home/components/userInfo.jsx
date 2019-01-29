import { Card, Row, Col } from 'antd';
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { recordUserFunLoad } from '@/actions/menu'
import './userInfo.less'
class UserInfo extends React.Component {

    componentWillMount() {
        this.props.recordUserFunLoad();
    }

    render() {
        let showDailyFuns = [];
        this.props.dailyFuns.map((item, index) => {
            this.props.all_menus.map((firstMenu) => {
                if (firstMenu.child) {
                    let findMenu = firstMenu.child.find((subMenu) => {
                        return subMenu.url.toLowerCase() == item.url.toLowerCase();
                    });
                    if (findMenu != null) {
                        showDailyFuns.push(findMenu)
                    }
                }
            })
        })
        let blockMenus = showDailyFuns.map((menu, menuIndex) => {
            return <Col lg={12} md={6} >
                <p style={{ paddingBottom: 10, color: '#8fc9fb' }}><a href={`#${menu.url}`}>{menu.name}</a></p>
            </Col>;
        });
        return (
            <div className={'user'}>
                <div className={'header'}>
                    <div className={'headerinner'}>
                        <div className={'avatar'} style={{ backgroundImage: `url(${this.props.user.icon})` }} />
                        <h5 className={'name'}>{this.props.user.name}</h5>
                        <p>{this.props.user.email}</p>
                    </div>
                </div>
                {blockMenus.length > 0 && <Card title={'常用功能'} bordered={false}>
                    <Row gutter={24}>
                        {blockMenus}
                    </Row>
                </Card>
                }
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    let user = state.auth.user;
    let dailyFuns = state.menu.dailyFuns || [];
    let all_menus = state.menu.items || [];
    return { dailyFuns: dailyFuns, all_menus: all_menus, user: user };
};

function mapDispatchToProps(dispatch) {
    return {
        recordUserFunLoad: bindActionCreators(recordUserFunLoad, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(UserInfo);