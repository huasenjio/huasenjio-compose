/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-10-04 09:57:52
 * @Description: 注册全局指令
 */

import Vue from 'vue';

import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';

// markdown代码高亮
Vue.directive('highlight', function(el) {
  let blocks = el.querySelectorAll('pre code');
  blocks.forEach(block => {
    hljs.highlightBlock(block);
  });
});

// 自动获取焦点指令
Vue.directive('focus', {
  // 当被绑定的元素插入到 DOM 中会获得焦点
  inserted: function(el) {
    // 聚焦元素
    el.focus();
  },
});

// 生成随机背景指令
Vue.directive('randomColor', function(el) {
  let colors = ['#fd7e14', '#ffc107', '#33b86c', '#007bff', '#17a2b8', '#e83e8c'];
  let tempIndex = Math.floor(Math.random() * colors.length);
  el.style.backgroundColor = colors[tempIndex];
});

// 子元素间隔相等
Vue.directive('balance', {
  inserted: function(el) {
    el.style.display = 'flex';
    el.style.flexWrap = 'wrap';
    if (el.childElementCount != 0) {
      handleBalance(el);
    }
    addresize(el, handleBalance);
  },
  componentUpdated(el) {
    handleBalance(el);
  },
});

// 根据可视窗口缩放大小指令
Vue.directive('autoScale', {
  inserted: function(el) {
    el.style.transformOrigin = 'left top';
    // 执行立即缩放
    handleScale(el);
    // 增加缩放监听
    addresize(el, handleScale);
  },
  componentUpdated(el) {
    // 组件更新时缩放
    handleScale(el);
  },
});

// 拖拽指令
Vue.directive('drag', {
  inserted: function(el) {
    el.onmousedown = function(e) {
      const disx = e.pageX - el.offsetLeft;
      const disy = e.pageY - el.offsetTop;
      document.onmousemove = function(event) {
        el.style.left = event.pageX - disx + 'px';
        el.style.top = event.pageY - disy + 'px';
      };
      document.onmouseup = function() {
        document.onmousemove = document.onmouseup = null;
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
      };
    };
  },
});

// 指令辅助函数
function addresize(dom, fn) {
  var w = dom.offsetWidth,
    h = dom.offsetHeight,
    oldfn = window.onresize;
  if (oldfn) {
    window.onresize = function() {
      // 若resize回调存在，则调用绑定window上下午，直接执行一遍
      oldfn.call(window);
      if (dom.offsetWidth != w || dom.offsetHeight != h) {
        w = dom.offsetWidth;
        h = dom.offsetHeight;
        // 执行回调方法
        fn.call(dom, dom);
      }
    };
  } else {
    window.onresize = function() {
      if (dom.offsetWidth != w || dom.offsetHeight != h) {
        w = dom.offsetWidth;
        h = dom.offsetHeight;
        // 执行回调方法
        fn.call(dom, dom);
      }
    };
  }
}

function handleBalance(el) {
  // 排除不存在子节点的问题
  if (el.childElementCount === 0) return;
  // 获取所有的子节点，并且转换成为数组
  let childs = [...el.childNodes];
  let pWidth = el.clientWidth;
  // 找出子节点中最大的宽度
  let childMaxWidth = childs.reduce((pre, cur) => {
    return pre > cur.clientWidth ? pre : cur.clientWidth;
  }, 0);
  // 当父容器或子容器没有宽度时不操作
  if (pWidth <= 0 || childMaxWidth <= 0) return;
  let rowCount = 0;
  // 进入无限循环
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let totalWidth = childMaxWidth * rowCount; // 子的宽度之和
    let residue = pWidth - totalWidth; // 相减后余下的宽度
    if (residue > 0 && childMaxWidth <= residue) {
      rowCount++;
    } else {
      // 没有剩余空间或者剩余空间不足塞入一个
      break;
    }
  }
  // 当rowCount为零时，代表父容器宽度不足以容纳一个子元素，所以不需要调整间距
  if (!rowCount) return;
  let space = pWidth - rowCount * childMaxWidth;
  let margin = Number((space / rowCount / 2).toFixed(2));
  childs.forEach(item => {
    item.style.marginLeft = `${margin}px`;
    item.style.marginRight = `${margin}px`;
  });
}

// 默认认为屏幕尺寸为1920*1080
function handleScale(el) {
  let width = document.body.clientWidth;
  let height = document.body.clientHeight;
  // 台式电脑分辨率
  el.style.transform = `scale(${width / 1920}, ${height / 1080})`;
  // mac电脑屏幕分辨率
  // el.style.transform = `scale(${width / 1440}, ${height / 820})`
}
