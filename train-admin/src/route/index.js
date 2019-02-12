import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import Layout from '../views/Layout';
import Login from '../views/Login';
import Register from '../views/Register';

import Home from '@/views/Home';
import { authHOC } from '@/utils/auth';


//权限管理模块
import roleManage from '@/views/Authority/RoleManage';
import adminUserManage from '@/views/Authority/AdminUserManage';
//系统字典
import dictionaryManage from '@/views/Dictionary/Manage';
//资讯
import zixun_HomeIndex from '@/views/Zixun/Home/index';
import zixun_ManageIndex from '@/views/Zixun/Manage/index';
import zixun_VideoManageIndex from '@/views/Zixun/VideoManage/index';
import zixun_ChannelIndex from '@/views/Zixun/Channel/index';
import zixun_AudioManageIndex from '@/views/Zixun/AudioManage/index';
//文件管理
import file_auth_manage from '@/views/File/auth_manage.js';
//import file_share_manage from '@/views/File/share_manage.js';
import file_share_manage from '@/views/File/share_manage_new.js';
import file_self_manage from '@/views/File/self_manage.js';
//import file_hq from '@/views/File/hq_manage.js'; //盟校校长等在总部看的资料
import file_hq from '@/views/File/hq_manage_new.js'; //盟校校长等在总部看的资料
import file_collect_manage from '@/views/File/collect_manage.js';
//导入 学生
//import import_student from '@/views/Import/student.js';
import import_student from '@/views/Import/templet.js';
import import_studentSignup from '@/views/Import/templetSignup.js';
//轮播图
import other_rotation from '@/views/Rotation/Manage/index';
import other_xuetang_rotation from '@/views/Rotation/XuetangManage/index';
//广告图
import other_linkInfo from '@/views/LinkInfo/Manage/index';

//-------------2019-01-30
//机构
import org_list from '@/views/org/org_index';
//用户
import user_list from '@/views/user/user_index';

//-------------END 2019-01-30
const adminRoutes = [
  {
    path: '/org/list',
    component: org_list
  },
  {
    path: '/user/list',
    component: user_list
  },
  {
    path: '/System/DictionaryManage',
    component: dictionaryManage
  },
  {
    path: '/OU/RoleManage',
    component: roleManage
  },
  {
    path: '/OU/UserManage',
    component: adminUserManage
  },
  {
    path:'/Information/Home',
    component:zixun_HomeIndex
  },
  {
    path:'/Information/Channel',
    component:zixun_ChannelIndex
  },
  {
    path:'/Information/Manage',
    component:zixun_ManageIndex
  },
  {
    path:'/Information/VideoManage',
    component:zixun_VideoManageIndex
  },
  {
    path:'/Information/AudioManage',
    component:zixun_AudioManageIndex
  },
  {
    path:'/FileSystem/AuthManage',
    component: file_auth_manage
  },
  {
    path:'/FileSystem/ShareManage',
    component: file_share_manage
  },
  {
    path:'/FileSystem/SelfManage',
    component: file_self_manage
  },
  {
    path:'/FileSystem/HQ',
    component: file_hq
  },
  {
    path: '/FileSystem/CollectManage',
    component: file_collect_manage
  },
  {
    path:'/ExcelImport/Student',
    component: import_student
  },
  {
    path:'/ExcelImport/StudentSignup',
    component: import_studentSignup
  },
  {
    path:'/Rotation/Manage',
    component: other_rotation
  },
  {
    path:'/Rotation/XTManage',
    component: other_xuetang_rotation
  },
  {
    path:'/LinkInfo/Manage',
    component: other_linkInfo
  },
];
//教学安排
import teachClassRoomManage from '@/views/Teach_ClassRoom/Manage';
import teachClassRoomSchedule from '@/views/Teach_ClassRoom/Schedule';
import teachClassManage from '@/views/Teach_Class/Manage';
import experienceTeacherManage from '@/views/Teach_Class/ExperienceTeacherManage';
import teachClassMemberManage from '@/views/Teach_Class/Member';
import teachClassSchedule from '@/views/Teach_Class/Schedule';
import teachClassScheduleCourseClass from '@/views/Teach_ClassSchedule/CourseClass';
import teachClassScheduleVIP from '@/views/Teach_ClassSchedule/VIP';
import teachClassScheduleExperience from '@/views/Teach_ClassSchedule/Experience';
import teachClassScheduleQuery from '@/views/Teach_ClassSchedule/Query';
import teachClassScheduleChart from '@/views/Teach_ClassSchedule/Schedule';
import teachAgentSignupManage from '@/views/Teach_Signup/AgentSignupManage.jsx';
import teachAdvSignupManage from '@/views/Teach_Signup/AdvSignupManage.jsx';
import teachAdvExperienceManage from '@/views/Teach_Experience/AdvExperienceManage.jsx';
import teachSignupPriceManage from '@/views/Teach_SignupPrice/Manage';
import teachSignupBatchManage from '@/views/Teach_SignupBatch/Manage';
import teachSignupTimeRangeManage from '@/views/Teach_SignupTimeRange/Manage';
import teachTeacherScheduleManage from '@/views/Teach_TeacherSchedule/Manage';
import teachSignupProductManage from '@/views/Teach_SignupProduct/Manage';
import teachSignupProductAudit from '@/views/Teach_SignupProduct/Audit';
const teachRoutes = [
  //教室信息管理
  {
    path: '/Teach_ClassRoom/Manage',
    component: teachClassRoomManage
  },
  {
    path: '/Teach_ClassRoom/Schedule',
    component: teachClassRoomSchedule
  },
  //试听教师管理
  {
    path: '/Teach_Class/ExperienceTeacherManage',
    component: experienceTeacherManage
  },
  //授课班级及成员管理
  {
    path: '/Teach_Class/Manage',
    component: teachClassManage
  },
  {
    path: '/Teach_Class/Member',
    component: teachClassMemberManage
  },
  {
    path: '/Teach_Class/Schedule',
    component: teachClassSchedule
  },
  //授课安排管理
  {
    path: '/Teach_ClassSchedule/CourseClass',
    component: teachClassScheduleCourseClass
  },
  {
    path: '/Teach_ClassSchedule/VIP',
    component: teachClassScheduleVIP
  },
  {
    path: '/Teach_ClassSchedule/Experience',
    component: teachClassScheduleExperience
  },
  {
    path: '/Teach_ClassSchedule/Query',
    component: teachClassScheduleQuery
  },
  {
    path: '/Teach_ClassSchedule/Schedule',
    component: teachClassScheduleChart
  },
  {
    path: '/Teach_Signup/AgentSignup',
    component: teachAgentSignupManage
  },
  {
    path: '/Teach_Signup/AdvSignup',
    component: teachAdvSignupManage
  },
  {
    path: '/Teach_Experience/AdvExperience',
    component: teachAdvExperienceManage
  },
  {
    path: '/Teach_SignupPrice/Manage',
    component: teachSignupPriceManage
  },
  {
    path: '/Teach_SignupBatch/Manage',
    component: teachSignupBatchManage
  },
  {
    path: '/Teach_TeacherSchedule/Manage',
    component: teachTeacherScheduleManage
  },
  {
    path: '/Teach_SignupTimeRange/Manage',
    component: teachSignupTimeRangeManage
  },
  {
    path: '/Teach_SignupProduct/Manage',
    component: teachSignupProductManage
  },
  {
    path: '/Teach_SignupProduct/Audit',
    component: teachSignupProductAudit
  },

];

export const childRoutes = [
  {
    'path': '/home',
    'component': Home,
    'exactly': true
  },
  ...adminRoutes,//权限管理部分
  ...teachRoutes,
];

const routes = (
  <Switch>
    <Route path="/login" component={Login} />
    <Route path="/register" component={Register} />
    <Route path="/" component={authHOC(Layout)} />
  </Switch>
);

export default routes
