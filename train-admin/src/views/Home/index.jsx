import React from 'react'
import { Row, Col, Table, Alert, Icon } from 'antd';

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import UserHome  from './UserHome'
import  TeacherHome  from './TeacherHome'
import  StudentHome  from './StudentHome'
import  SchoolHome  from './SchoolHome'
import  BranchSchoolHome  from './BranchSchoolHome'
import  LearnCenterHome  from './LearnCenterHome'
class Home extends React.Component {
  constructor() {
    super()
  }

  componentWillMount() {
  }
 
  render() {
    // let userRoles = this.props.roles;  
    // if(userRoles.length==0){
      return <div></div>
    // }  
    // let block_home = <UserHome {...this.props} />
    // if (userRoles.some((roleId) => { return roleId == "00000000-0000-0000-0000-000000000001"; })){
    //   block_home = <TeacherHome {...this.props} />
    // }
    // else if (userRoles.some((roleId) => { return roleId == "00000000-0000-0000-0000-000000000002"; })){
    //   block_home = <StudentHome {...this.props} />
    // }
    // else if (userRoles.some((roleId) => { return roleId == "4A79E33E-26CC-4B4F-99DD-509DEEB5CC43" || roleId=='9F5204F2-4C70-4818-87F4-502DA4CED78C'; })) {
    //   block_home = <SchoolHome {...this.props} />
    // }
    // else if (userRoles.some((roleId) => { return roleId == "11BE4787-308C-4FB7-B1FA-09BE9A464B1A"; })){
    //   block_home = <BranchSchoolHome {...this.props} />
    // }
    // else if(userRoles.some((roleId) => { return roleId == "DD9E1AE7-FEBE-4736-AFA3-D6147808C39B"; })){
    //   block_home = <LearnCenterHome {...this.props} />
    // }
    // return block_home;
  }
}

function mapStateToProps(state) {
  const { menu } = state;
  return {
    roles: menu ? menu.roles : []
  };
}

function mapDispatchToProps(dispatch) {
  return {
    // getAllMenu: bindActionCreators(getAllMenu, dispatch),
    // switchOrgContext: bindActionCreators(switchOrgContext, dispatch)
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home))