/*
 * @Autor: huasenjio
 * @Date: 2026-04-28 00:00:00
 * @LastEditors: huasenjio
 * @LastEditTime: 2026-04-28 00:00:00
 * @Description: 简易 SFC 解析器，将 .vue 单文件组件字符串拆分为 template / script / style
 */

/**
 * 解析 Vue SFC 源码字符串
 * @param {string} source - .vue 文件源码
 * @returns {{ template: string, script: string, styles: string[] }}
 */
export function parseSFC(source) {
  const templateMatch = source.match(/<template>([\s\S]*?)<\/template>/i);
  const scriptMatch = source.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  const styles = [];
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styleMatch;
  while ((styleMatch = styleRegex.exec(source)) !== null) {
    styles.push(styleMatch[1].trim());
  }

  return {
    template: templateMatch ? templateMatch[1].trim() : '',
    script: scriptMatch ? scriptMatch[1].trim() : '',
    styles,
  };
}
