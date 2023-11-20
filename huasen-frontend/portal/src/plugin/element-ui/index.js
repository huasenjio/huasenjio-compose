/*
 * @Autor: huasenjio
 * @Date: 2021-10-30 14:15:08
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-22 15:09:14
 * @Description: 优化引入Element
 */

// 引入element-ui相关组件
import Vue from 'vue';

// 全局引入
// @import "~element-ui/packages/theme-chalk/src/index";

// 按需引入样式文件
import './style/element-variables-simple.scss';

let HLoading = null;
let HLoadingCount = 0;

// 无需babel设置手动按需引入
import Button from 'element-ui/lib/button';
import Input from 'element-ui/lib/input';
import Dropdown from 'element-ui/lib/dropdown';
import DropdownMenu from 'element-ui/lib/dropdown-menu';
import DropdownItem from 'element-ui/lib/dropdown-item';
import Upload from 'element-ui/lib/upload';
import Tabs from 'element-ui/lib/tabs';
import TabPane from 'element-ui/lib/tab-pane';
import Collapse from 'element-ui/lib/collapse';
import CollapseItem from 'element-ui/lib/collapse-item';
import ColorPicker from 'element-ui/lib/color-picker';
import Slider from 'element-ui/lib/slider';
import Select from 'element-ui/lib/select';
import Option from 'element-ui/lib/option';
import OptionGroup from 'element-ui/lib/option-group';
import Tooltip from 'element-ui/lib/tooltip';
import Notification from 'element-ui/lib/notification';
import Message from 'element-ui/lib/message';
import Form from 'element-ui/lib/form';
import FormItem from 'element-ui/lib/form-item';
import Row from 'element-ui/lib/row';
import Col from 'element-ui/lib/col';
import Table from 'element-ui/lib/table';
import TableColumn from 'element-ui/lib/table-column';
import Popconfirm from 'element-ui/lib/popconfirm';
import Pagination from 'element-ui/lib/pagination';
import Drawer from 'element-ui/lib/drawer';
import Loading from 'element-ui/lib/loading';
import Switch from 'element-ui/lib/switch';
import Dialog from 'element-ui/lib/dialog';
import Empty from 'element-ui/lib/empty';
import Popover from 'element-ui/lib/popover';
import { InfiniteScroll } from 'element-ui';

Vue.use(Button);
Vue.use(Input);
Vue.use(Dropdown);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Upload);
Vue.use(Collapse);
Vue.use(CollapseItem);
Vue.use(ColorPicker);
Vue.use(Slider);
Vue.use(Select);
Vue.use(Option);
Vue.use(OptionGroup);
Vue.use(Tooltip);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Row);
Vue.use(Col);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Popconfirm);
Vue.use(Pagination);
Vue.use(Drawer);
Vue.use(Switch);
Vue.use(Dialog);
Vue.use(Empty);
Vue.use(Popover);
Vue.use(Loading.directive);
Vue.use(InfiniteScroll);

Vue.prototype.$loading = Loading.service;
Vue.prototype.$notify = Notification;
Vue.prototype.$message = Message;

Vue.prototype.$startLoading = function(text) {
  HLoadingCount++;
  HLoading = Loading.service({
    lock: true,
    text: text || '连接中',
    // spinner: 'el-icon-loading',
    background: 'rgba(255, 255, 255)',
    customClass: 'request-loading',
  });
};
Vue.prototype.$stopLoading = function() {
  HLoadingCount--;
  if (HLoadingCount <= 0) {
    HLoading.close();
  }
};
Vue.prototype.$resetLoading = function() {
  HLoadingCount = 0;
  HLoading && HLoading.close();
};

Vue.prototype.$tips = function(type, msg, position, time, callback) {
  // 初始化参数
  let title = '';
  type = type || 'info';
  msg = msg || '';
  position = position || 'top-right';
  time = time || 1200;
  switch (type) {
    case 'success':
      title = '成功';
      break;
    case 'error':
      title = '失败';
      break;
    case 'warning':
      title = '警告';
      break;
    default:
      type = 'info';
      title = '提示';
      break;
  }
  Notification({
    title: title,
    message: msg,
    type: type,
    position: position,
    duration: time,
  });
  if (callback) {
    setTimeout(() => {
      callback();
    }, time);
  }
};
