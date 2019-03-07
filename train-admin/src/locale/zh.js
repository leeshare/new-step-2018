//中文
import zhCN from 'antd/lib/locale-provider/zh_CN';

const App = {
  Total: '共${total}条数据',
  Create: '新增',
  Edit: '编辑',
  Save: '提交',
  Delete: '删除',
  View: '查看',
  Detail: '详情',
  Cancel: '取消',
  Back: '返回',
  Search: '搜索',
  All: '全部',
  PleaseChoose: '请选择',
  PleaseInput: '请输入内容',
  Status: '状态',
  Action: '操作',
  OrderNo: '显示顺序',
  Description: '描述',
  CreateInfo: '创建信息',
  UpdateInfo: '修改信息',
  DeleteConfirmTitle: '删除确认',
  DeleteConfirmContent: '你确定要删除该数据吗?',

  //内置字典项
  dic_Status_0: '停用',
  dic_Status_1: '启用',
  dic_YesNo_0: '否',
  dic_YesNo_1: '是',
  dic_Allow_0: '拒绝',
  dic_Allow_1: '允许',
  dic_Sex_1: '男',
  dic_Sex_2: '女',

  acount_login: '用户登录',
  account_login_title: '账号密码登录',
  qrcode_login: '二维码登录',
  qrcode_login_title: '扫一扫登录',
  qrcode_login_tips: '请使用 <a>培训教育APP</a> 扫码登录',
  forget_password: '忘记密码',
  forget_password_title: '忘记密码?',
  forget_password_content: '请您发邮件至<a href="mail:service@train.com">service@train.com</a>完成密码找回！',
  logout: '退出登录',
  login: '登录',
  loginPending: '登录中...',
  loginFailed: '登录失败',
  loginSuccess: '欢迎 {realName}',
  account: '账号',
  account_tips: '请输入账号',
  account_empty: '登录账号不能为空',
  password: '密码',
  password_tips: '请输入密码',
  password_empty: '密码不能为空',
  homePage: '首页',

  //字典管理部分
  Dictionary: '字典',
  DictionaryType: '字典类型',
  DictionaryItemTitle: '字典项名称',
  DictionaryItemValue: '字典项值',
  DictionaryDeleteMsgTitle: '你确认要删除该字典吗?',
  DictionaryDeleteMsgContent: '如果字典已经使用，则不能被删除！',
  DictionaryItemTitleSearchPlaceholder: '字典项名称或字典项值',
  //角色管理
  Role: '角色',
  RoleName: '角色名称',
  RoleFuns: '功能权限',

}

export default {
  ...zhCN,

  locale: 'zh',
  App,
};
