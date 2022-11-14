/*
 * @Autor: huasenjio
 * @Date: 2022-10-01 10:38:33
 * @LastEditors: huasenjio
 * @LastEditTime: 2022-11-05 11:09:16
 * @Description: 初始化文章信息
 */
global.huasen.working(
  [
    {
      schemaName: 'Article',
      methodName: 'init',
      payloads: [
        {
          time: '1970-01-01',
          content:
            "# 标题1\n> 批注批注批注\n标题一标题一标题一标题一标题一标题一标题一标题一标题一标题一标题一\n\n## 标题2\n标题2标题2标题2标题2标题2标题2标题2标题2标题2标题2\n\n### 标题3\n1. 条目1；\n2. 条目2；\n3. 条目3；\n\n#### 标题4\n- 第一条；\n- 第二条；\n\n## 测试图片\nimage image image image image image\n![](https://s2.loli.net/2022/11/05/CYQcWTBhr1fRlZE.png)\n\n## 图表\n| Col1 | Col2 | Col3 |\n| ---- | ---- | ---- |\n| 1    | 2    | 3    |\n\n### 代码块\n```javascript\n你好 //普通话\nnmwngz ndei //壮语\nhello //英语\nconsole.log('你好') //JS\n```\n\n### 着重\n着重着重着重着重着重着重着**重着**重着重着`重着`重着重着重着重着重着重着重着重着重\n\n# 免责声明\n严格遵守中华人民共和国相关法律，不存在破解、串改、贩卖数据等违法行为，一切资源均来源于各大免费论坛社区，包括提供的体验账号，仅供大家学习参考，请勿用于商业用途，违反者造成损失及法律责任与本人无关。如有不幸侵犯到您的权益，请联系小森，我们将全面积极配合！\n\n# 联系我们\n企鹅🐧：184820911\n\n邮箱📮：[184820911@qq.com](184820911@qq.com)\n\n哔哩哔哩：[花森酱JioJio]('https://space.bilibili.com/241546158')",
          bannerImg: 'https://s2.loli.net/2022/11/05/QKCF9zH3dfEXY7B.png',
          isDraft: false,
          manageId: '184820911@qq.com',
          title: '演示文档',
          tag: '测试/内容/文档',
          code: 0,
        },
      ],
      self: true,
    },
  ],
  data => {
    if (data) {
      console.log('初始化文章数据成功：', data);
    }
  },
);
