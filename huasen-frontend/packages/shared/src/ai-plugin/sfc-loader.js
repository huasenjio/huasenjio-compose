/*
 * @Autor: huasenjio
 * @Date: 2026-04-28 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-05-01 00:00:00
 * @Description: 从 SFC 源码字符串动态创建 Vue 2 组件
 */
import Vue from 'vue';
import { parseSFC } from './sfc-parser';

/**
 * 清理旧版本注入的样式标签
 * @param {string} currentVersion - 当前版本号
 */
export function removeOldPluginStyles(currentVersion) {
  document.head.querySelectorAll('style[data-ai-plugin-version]').forEach(el => {
    if (el.getAttribute('data-ai-plugin-version') !== currentVersion) {
      el.remove();
    }
  });
}

/**
 * 从 SFC 源码字符串动态创建 Vue 2 组件
 * @param {string} sfcSource - Vue SFC 源码字符串
 * @param {string} version - 版本号
 * @returns {Promise<object|null>} Vue 组件选项对象，解析失败返回 null
 */
export async function createPluginComponent(sfcSource, version) {
  if (!sfcSource) return null;

  // 1. 清理旧版本样式
  if (version) {
    removeOldPluginStyles(version);
  }

  // 2. 解析 SFC
  const { template, script, styles } = parseSFC(sfcSource);
  if (!template) {
    console.error('SFC 缺少 <template> 块');
    return null;
  }

  // 3. 注入样式到 document head，带版本标记，便于后续清理
  styles.forEach(css => {
    const styleEl = document.createElement('style');
    if (version) {
      styleEl.setAttribute('data-ai-plugin-version', version);
    }
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  });

  // 4. Vue 2 运行时编译模板字符串 → render 函数
  const { render, staticRenderFns } = Vue.compile(template);

  // 5. 执行 script 段获取组件选项对象
  let componentOptions = {};
  if (script) {
    try {
      const wrappedScript = script.replace(/export\s+default\s*\{/, 'return {');
      const scriptFn = new Function('Vue', wrappedScript);
      componentOptions = scriptFn(Vue) || {};
    } catch (err) {
      console.error('script 执行失败：', err.message);
      return null;
    }
  }

  // 6. 合并 render 函数与组件选项，返回完整 Vue 组件定义
  return {
    ...componentOptions,
    render,
    staticRenderFns,
  };
}
