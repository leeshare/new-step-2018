module.exports = {
  menus: [
    {
      key: 0,
      name: '首页',
      icon: 'home',
      url: '/teach/home'
    },
    {
      key: 1,
      name: '机构管理',
      icon: 'user',
      child: [
        {
          name: '课程表',
          key: 101,
          url: '/teach/schedule'
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
      name: '讲师管理',
      icon: 'home',
      url: '/teach/home'
    },
    {
      key: 3,
      name: '课程管理',
      icon: 'home',
      url: '/teach/home'
    }
  ],
};

//module.exports = {
//  'GET /api/local_menu': menus,
//};
