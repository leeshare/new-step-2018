module.exports = {
  menus: [
    {
      key: 0,
      name: '首页',
      icon: 'home',
      url: '/home'
    },
    {
      key: 1,
      name: '机构管理',
      icon: 'team',
      url: '/org/list',
    },
    {
      key: 11,
      name: 'test',
      icon: 'team',
      visible: false,
      child: [
        {
          name: '机构列表',
          key: 101,
          url: '/org/list',
          icon: 'table'
        },
        {
          name: '教师备课',
          key: 102,
          url: '/teach/Prepare'
        },
        {
          name: '课后点评',
          key: 103,
          url: '/teach/comments'
        },
        {
          name: '教学档案',
          key: 104,
          url: '/teach/archives'
        },
        {
          name: '学生信息',
          key: 105,
          url: '/teach/students'
        }
      ]
    },
    {
      key: 2,
      name: '用户管理',
      icon: 'user',
      url: '/user/list'
    },
    /*{
      key: 2,
      name: '讲师管理',
      icon: 'user',
      url: '/teacher'
    },*/
    {
      key: 3,
      name: '课程管理',
      icon: 'book',
      url: '/course/list'
    }
  ],
  menus_of_org: [
    {
      key: 0,
      name: '首页',
      icon: 'home',
      url: '/home'
    },
    {
      key: 2,
      name: '教师管理',
      icon: 'user',
      url: '/user/list'
    },
  ],
  menus_of_teacher: [
    {
      key: 0,
      name: '首页',
      icon: 'home',
      url: '/home'
    },
  ]
};

//module.exports = {
//  'GET /api/local_menu': menus,
//};
