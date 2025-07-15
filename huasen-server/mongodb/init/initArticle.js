/*
 * @Autor: huasenjio
 * @Date: 2022-10-01 10:38:33
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-12 11:13:14
 * @Description: 初始化文章信息
 */
global.huasen.createEpWorking(
  [
    {
      schemaName: 'Article',
      methodName: 'init',
      payloads: [
        {
          content:
            '# 标题1\n> 批注批注批注\n\n标题一标题一标题一标题一标题一标题一标题一标题一标题一标题一标题一\n\n## 标题2\n标题2标题2标题2标题2标题2标题2标题2标题2标题2标题2\n\n### 标题3\n\n1. 条目1；\n2. 条目2；\n3. 条目3；\n    1. 条目3.1\n    2. 条目3.2\n    3. 条目3.3\n        1. 条目3.3.1\n        2. 条目3.3.2\n\n#### 标题4\n\n- 第一条；\n- 第二条；\n  - 2.1\n  - 2.2\n  - 2.3\n\n## 测试图片\nimage image image image image image\n![](https://s2.loli.net/2022/11/05/CYQcWTBhr1fRlZE.png)\n\n## 图表\n| 名称 | 网址 | 备注 |\n| ---- | ---- | ---- |\n| 起始页    | www.huasenjio.top   | 无   |\n| 个人页    | huasenjio.top    |  无   |\n\n### 代码块\n```javascript\n你好 //普通话\nnmwngz ndei //壮语\nhello //英语\nconsole.log(\'你好\') //JavaScript\n```\n\n### 着重\n着重着重着重着重着重着重着**重着**重着重着`重着`重着重着重着重着重着重着重着重着重\n\n### 删除线\n~~删除线删除线删除线删除线删除线删除线删除线~~\n\n### 上角标和下角标\n二元一次方程：x^2^+2 = y\n\n水化学表达式：H~2~0\n\n### 标记\n==标记==\n\n### 下划线\n++下划线下划线下划线下划线下划线下划线++\n\n### 斜体\n*斜体斜体斜体斜体斜体斜体斜体斜体斜体斜体斜体斜体斜体斜体*\n\n### 视频地址\n<video style="margin: 0 auto; width: 100%" controls crossorigin="anonymous" preload="auto" src="https://a.huasenjio.top/huasen-store/default/%E7%99%BD%E9%BE%99-20250712175651.mp4"></video>\n\n# 免责声明\n严格遵守中华人民共和国的法律，不存在**破解、串改、贩卖数据**等行为。所有资源仅供学习交流，禁止用于商业用途，违反造成损失及法律责任与本站无关！\n\n# 联系我们\n- QQ服务号：184820911\n- 微信服务号：huasencc\n- Bilibili：[前往关注UP](\'https://space.bilibili.com/241546158\')',
          bannerImg: 'https://s2.loli.net/2022/11/05/QKCF9zH3dfEXY7B.png',
          isDraft: false,
          manageId: 'admin',
          title: '演示文档',
          tag: '简约/示例',
          code: 0,
        },
      ],
      self: true,
    },
  ],
  data => {
    if (data) {
      console.log('初始化文章成功：', data);
    }
  },
);
