/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-09-19 21:52:11
 * @Description:
 */
import Vue from 'vue';
import Router from 'vue-router';
import state from '@/store/state/state';
import routes from '@/config/router.config.json';

// 获得路由原型
const originalPush = Router.prototype.push;
// 重写router的push方法，避免压入当前展示路由引起的报错
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

import Nprogress from 'nprogress';
import 'nprogress/nprogress.css';

Vue.use(Router);

// 创建路由节点
const createRoute = routes => {
  return routes.reduce((processedRoutes, currentRoute) => {
    processedRoutes.push(processRouteObj(currentRoute));
    return processedRoutes;
  }, []);
};

// 传入对象作为参数，并且经过对象解构的方式获得变量。
const processRouteObj = ({ menuCode, children, component, title, ...args }) => {
  return Object.assign(
    {
      meta: { menuCode, children, title },
      // 引入路由对应的组件
      component: () => import(/* webpackInclude: /\.(js|vue)$/ */ `@/views/${component}`),
      // 通过递归调用的方式进行都子路由的处理
      children: children ? createRoute(children) : [],
    },
    args,
  );
};

// 创建路由实例对象
const router = new Router({
  mode: 'hash',
  routes: createRoute(routes),
});

// 数组扁平化
function flatten(arr, parentPath) {
  let res = [];
  arr.map(item => {
    if (item.children && item.children.length != 0) {
      // 有子路由
      item.path = parentPath ? `${parentPath}/${item.path}` : item.path;
      res.push(item.path);
      res = res.concat(flatten(item.children, item.path));
    } else {
      if (parentPath) {
        res.push(`${parentPath}/${item.path}`);
      } else {
        res.push(item.path);
      }
    }
  });
  return res;
}
const routePaths = flatten(router.options.routes);

// 路由前置守卫
router.beforeEach((to, form, next) => {
  Nprogress.start();
  document.title = to.meta.title ? to.meta.title : '花森屿你'; // 将路由中的属性赋值到title中
  let userCode = state.user.code;
  // 判断权限
  if (!routePaths.includes(to.path)) {
    // 过滤动态路由
    let toPaths = to.path.split('/');
    let isDynamicRouterPath = routePaths.some(item => {
      let pathTemps = item.split('/');
      // 长度相等
      if (toPaths.length == pathTemps.length) {
        for (let i = 0; i < pathTemps.length; i++) {
          if (/^:/.test(pathTemps[i])) {
            pathTemps[i] = false;
            if (toPaths[i]) toPaths[i] = false;
          }
        }
        // 整理数组后做差集，如果数组为空，说明相等
        return Vue.prototype.LODASH.xor(toPaths, pathTemps).length == 0;
      }
    });
    if (isDynamicRouterPath) {
      // 动态路由，放行
      next();
    } else {
      // 页面不存在
      next({ path: '/error404' });
    }
  } else if (Number(to.meta.menuCode) <= 0) {
    next();
  } else if (!Number(userCode)) {
    next({ path: '/login' }); // 用户未登录
  } else if (Number(userCode) < Number(to.meta.menuCode)) {
    next({ path: '/error403' }); // 没有权限
  } else {
    next(); //无异常情况放行
  }
});

// 路由后置守卫
router.afterEach((to, from) => {
  Nprogress.done();
});

export default router;
