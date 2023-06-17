/*
 * @Autor: huasenjio
 * @Date: 2022-10-29 13:01:52
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-12 11:13:53
 * @Description: 初始化日志
 */

global.huasen.createEpWorking(
  [
    {
      schemaName: 'Record',
      methodName: 'init',
      payloads: [
        {
          id: '0123456789abcdef',
          time: '19700101',
          log: {
            7233432065233333:
              '{"uid":"7233432065233333","url":"/manage/diskOverview","method":"POST","originalUrl":"/manage/diskOverview","ip":"::ffff:127.0.0.1","host":"localhost","referer":"http://localhost:9000/","agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36","time":"1970-01-01 00:00:00"}',
          },
        },
      ],
      self: true,
    },
  ],
  data => {
    if (data) {
      console.log('初始化日志成功：', data);
    }
  },
);
