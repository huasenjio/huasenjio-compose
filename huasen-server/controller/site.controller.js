/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 00:36:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-04-25 00:21:58
 * @Description: 站点表控制器
 */
const fs = require('fs');
const ExcelJS = require('exceljs');
const { fetchFavicons } = require('@meltwater/fetch-favicon');
const { MixtureUpload } = require('../plugin/mixture-upload/index.js');
const { downloadAndConvertToBase64 } = require('../utils/tool.js');
const { Site, Column } = require('../service/index.js').schemaMap;

function findByPage(req, res, next) {
  let { pageNo, pageSize, name, code, tag } = req.huasenParams;
  // 模糊查询参数
  let params = { name: { $regex: new RegExp(name, 'i') } };
  // 处理权限码参数
  if (code !== '' && code !== undefined && code !== null) {
    params.code = code;
  }
  // 处理标签参数
  if (tag) {
    params.expand = { $regex: new RegExp(`"tag":\\s*\\[[\\s\\S]*?"${tag}"[\\s\\S]*?\\]`, 'i') };
  }
  req.epWorking(
    [
      {
        schemaName: 'Site',
        methodName: 'findByPage',
        payloads: [
          {
            $and: [params],
          },
          pageNo,
          pageSize,
        ],
        self: true,
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '分页查询站点成');
    },
  );
}

function add(req, res, next) {
  req.epWorking(
    [
      {
        schemaName: 'Site',
        methodName: 'insertMany',
        payloads: [req.huasenParams],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '添加站点');
    },
  );
}

function addMany(req, res, next) {
  let { sites } = req.huasenParams;
  if (!Array.isArray(sites)) {
    global.huasen.responseData(res, {}, 'ERROR', '导入数据异常');
  } else {
    req.epWorking(
      [
        {
          schemaName: 'Site',
          methodName: 'insertMany',
          payloads: [sites],
        },
      ],
      result => {
        global.huasen.responseData(res, result, 'SUCCESS', '导入站点');
      },
    );
  }
}

function remove(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'Site',
        methodName: 'deleteOne',
        payloads: [
          {
            _id,
          },
        ],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '删除站点');
    },
  );
}

function removeMany(req, res, next) {
  let { _ids } = req.huasenParams;
  if (!Array.isArray(_ids)) {
    global.huasen.responseData(res, {}, 'ERROR', '参数异常');
  } else {
    req.epWorking(
      [
        {
          schemaName: 'Site',
          methodName: 'deleteMany',
          payloads: [{ _id: { $in: _ids } }],
        },
      ],
      result => {
        global.huasen.responseData(res, result, 'SUCCESS', '删除站点');
      },
    );
  }
}

function update(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'Site',
        methodName: 'updateOne',
        payloads: [{ _id }, { $set: req.huasenParams }, { runValidators: true }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '更新站点');
    },
  );
}

// $gt:大于
// $lt:小于
// $gte:大于或等于
// $lte:小于或等于
function findByCode(req, res, next) {
  let { proof } = req.huasenJWT;
  req.epWorking(
    [
      {
        schemaName: 'Site',
        methodName: 'find',
        payloads: [
          {
            // 筛选出小于等于用户权限的订阅源
            code: { $lte: proof.code },
            // 可订阅
            enabled: true,
          },
        ],
      },
    ],
    sites => {
      global.huasen.responseData(res, sites, 'SUCCESS', '查询站点');
    },
  );
}

function findByList(req, res, next) {
  req.epWorking(
    [
      {
        schemaName: 'Site',
        methodName: 'find',
        payloads: [],
      },
    ],
    sites => {
      global.huasen.responseData(res, sites, 'SUCCESS', '查询站点');
    },
  );
}

function findSiteTagByList(req, res, next) {
  req.epWorking(
    [
      {
        schemaName: 'Site',
        methodName: 'find',
        payloads: [],
      },
    ],
    sites => {
      let tags = [];
      sites.map(item => {
        try {
          if (!item.expand || item.expand === '{}') return;
          let expandObj = JSON.parse(item.expand);
          if (Array.isArray(expandObj.tag)) {
            tags = tags.concat(expandObj.tag);
          }
        } catch (err) {
          global.huasen.responseData(res, {}, 'ERROR', '数据异常');
        }
      });
      // 数据去重
      tags = Array.from(new Set(tags));
      global.huasen.responseData(res, tags, 'SUCCESS', '查询站点');
    },
  );
}

function findSiteColumnByList(req, res, next) {
  let { siteId } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'Column',
        methodName: 'find',
        payloads: [],
      },
    ],
    list => {
      let columnIdList = [];
      list.map(item => {
        if (item.siteStore.includes(siteId)) {
          columnIdList.push(item._id);
        }
      });
      global.huasen.responseData(res, columnIdList, 'SUCCESS', '查询链接所属栏目');
    },
  );
}

function bindColumn(req, res, next) {
  let { columnId, sites } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'Site',
        methodName: 'find',
        payloads: [{ _id: { $in: sites } }],
      },
    ],
    async list => {
      try {
        if (list.length) {
          let bulkUpdates = [];
          // 遍历合入站点数据
          list.forEach(item => {
            try {
              let expand = JSON.parse(item.expand);
              expand.columnStore = expand.columnStore || [];
              // 判断是否需要绑定
              if (expand.columnStore.indexOf(columnId) === -1) {
                expand.columnStore.push(columnId);
              }
              bulkUpdates.push({
                updateOne: {
                  filter: { _id: item._id },
                  update: { $set: { expand: JSON.stringify(expand) } },
                },
              });
            } catch (err) {
              global.huasen.responseData(res, {}, 'ERROR', '数据异常');
            }
          });
          let updateResult = await Site.bulkWrite(bulkUpdates);
          global.huasen.responseData(res, updateResult, 'SUCCESS', '链接已绑定栏目');
        }
      } catch (err) {}
    },
  );
}

function unbindColumn(req, res, next) {
  let { columnId, sites } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'Site',
        methodName: 'find',
        payloads: [{ _id: { $in: sites } }],
      },
    ],
    async list => {
      try {
        if (list.length) {
          let bulkUpdates = [];
          // 遍历合入站点数据
          list.forEach(item => {
            try {
              let expand = JSON.parse(item.expand);
              expand.columnStore = expand.columnStore || [];
              expand.columnStore = expand.columnStore.filter(el => el !== columnId);
              bulkUpdates.push({
                updateOne: {
                  filter: { _id: item._id },
                  update: { $set: { expand: JSON.stringify(expand) } },
                },
              });
            } catch (err) {
              global.huasen.responseData(res, {}, 'ERROR', '数据异常');
            }
          });
          let updateResult = await Site.bulkWrite(bulkUpdates);
          global.huasen.responseData(res, updateResult, 'SUCCESS', '链接已解绑栏目');
        }
      } catch (err) {}
    },
  );
}

function importSite(req, res, next) {
  const mixtureUpload = new MixtureUpload({
    onSuccess: (data, fileMap) => {
      const columns = JSON.parse(data.columns);
      const { file } = fileMap;
      // 查询绑定的栏目
      req.epWorking(
        [
          {
            schemaName: 'Column',
            methodName: 'find',
            payloads: [{ _id: { $in: columns } }],
          },
        ],
        columns => {
          // 获取全部栏目id，用于绑定站点
          let columnsIds = columns.map(el => el._id);
          // 即将解析excel文件的站点数据
          const workbook = new ExcelJS.Workbook();
          workbook.xlsx
            .readFile(file.path)
            .then(() => {
              const sites = [];
              // 获取第一个工作表
              const worksheet = workbook.getWorksheet(1);
              // 解析xlsx文件的内容
              worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                  let rowData = row.values;
                  let site = {
                    name: rowData[1] || '花森小窝',
                    url: typeof rowData[2] === 'object' ? rowData[2].text : rowData[2] || 'www.huasenjio.top',
                    code: Number(rowData[3]) || 0,
                    enabled: rowData[4] === '是',
                    icon: typeof rowData[5] === 'object' ? rowData[5].text : rowData[5] || 'https://n.huasenjio.top/huasen-store/icon/logo.png',
                    description: rowData[6] || '',
                    remarks: rowData[9] || '',
                    pv: Number(rowData[10]) || 0,
                    detail: rowData[11] || '',
                  };
                  let tags = [];
                  let pins = [];
                  let columnStore = [];
                  let tagStr = rowData[7];
                  let pinStr = rowData[8];
                  // 解析tag
                  if (tagStr && tagStr.trim() !== '') {
                    tags = tagStr.split('&');
                  }
                  // 解析pin
                  if (pinStr && pinStr.trim() !== '') {
                    pinStr.split('&').forEach(el => {
                      let code = global.hsDic.getDicValueByLabel('pin', el);
                      if (code) pins.push(code);
                    });
                  }
                  // 添加绑定的栏目
                  if (columnsIds.length) {
                    columnStore = [...columnsIds];
                  }
                  let expand = {
                    tag: tags,
                    pin: pins,
                    columnStore,
                  };
                  site.expand = JSON.stringify(expand);
                  sites.push(site);
                }
              });
              // 批量插入站点，获取全部站点id，用于绑定栏目
              req.epWorking(
                [
                  {
                    schemaName: 'Site',
                    methodName: 'insertMany',
                    payloads: [sites],
                  },
                ],
                async siteList => {
                  let siteIds = siteList.map(el => el._id);
                  let bulkUpdates = [];
                  columns.forEach(column => {
                    let siteStore = JSON.parse(column.siteStore);
                    siteStore = Array.from(new Set([...siteStore, ...siteIds]));
                    bulkUpdates.push({
                      updateOne: {
                        filter: { _id: column._id },
                        update: { $set: { siteStore: JSON.stringify(siteStore) } },
                      },
                    });
                  });
                  let updateResult = await Column.bulkWrite(bulkUpdates);
                  global.huasen.responseData(res, siteList, 'SUCCESS', '导入站点');
                },
              );
            })
            .catch(err => {
              global.huasen.responseData(res, {}, 'ERROR', 'excel解析异常：' + err.toString());
            })
            .finally(() => {
              // 删除临时文件
              fs.unlinkSync(file.path);
            });
        },
      );
    },
    onError: err => {
      global.huasen.responseData(res, {}, 'ERROR', err.msg);
    },
  });
  mixtureUpload.uploader(req, res, next);
}

async function exportSite(req, res, next) {
  const columns = JSON.parse(req.huasenParams.columns || '[]');
  let sites = [];
  if (Array.isArray(columns) && columns.length) {
    let siteIds = [];
    let columnList = await Column.find({ _id: { $in: columns } });
    columnList.map(el => {
      siteIds = siteIds.concat(JSON.parse(el.siteStore));
    });
    siteIds = Array.from(new Set(siteIds));
    sites = await Site.find({ _id: { $in: siteIds } });
  } else {
    sites = await Site.find();
  }
  // 创建一个工作簿
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');
  // 添加列和行
  worksheet.columns = [
    { header: '网站名称', key: 'name', width: 20 },
    { header: '网站链接', key: 'url', width: 60 },
    { header: '权限码', key: 'code' },
    { header: '是否启用', key: 'enabledStr' },
    { header: '图标链接', key: 'icon', width: 60 },
    { header: '描述', key: 'description', width: 20 },
    { header: '网站标签', key: 'tagStr', width: 20 },
    { header: '置顶标记', key: 'pinStr' },
    { header: '备注', key: 'remarks' },
    { header: '访问量', key: 'pv' },
    { header: '详情页', key: 'detail', width: 60 },
  ];
  // 处理网站字段，映射xlsx字段
  sites.forEach(site => {
    let expand = JSON.parse(site.expand || '{}');
    // 真实有效的标记
    let realPins = (expand.pin || []).filter(code => global.hsDic.getDicLabelByValue('pin', Number(code)));
    let pinStr = realPins.map(code => global.hsDic.getDicLabelByValue('pin', Number(code))).join('&');
    let tagStr = (expand.tag || []).join('&');
    site.enabledStr = site.enabled ? '是' : '否';
    site.pinStr = pinStr;
    site.tagStr = tagStr;
    site.pv = site.pv || 0;
    worksheet.addRow(site);
  });
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.alignment = { wrapText: true, vertical: 'middle' }; // 设置自动换行
    });
  });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=' + 'sites.xlsx');
  const buffer = await workbook.xlsx.writeBuffer();
  res.send(buffer);
}

/**
 * 获取网站域名
 * @param {String} urlString - 网站链接地址
 * @returns domain - 域名
 */
function getDomainFromURL(urlString) {
  try {
    // 创建URL对象
    const url = new URL(urlString);
    // 获取域名
    return url.hostname;
  } catch (error) {
    // 如果URL格式不正确，则返回错误信息
    console.error('Invalid URL:', error);
    return null;
  }
}

/**
 * 获取favicon.im图标
 * @param {String} siteUrl - 网站链接地址
 */
function getFaviconByUrl(siteUrl) {
  let domain = getDomainFromURL(siteUrl);
  if (!domain) return;
  return `https://favicon.im/${domain}?larger=true`;
}

async function findSiteFavicon(req, res, next) {
  let { url } = req.huasenParams;
  const faviconBase64s = [];
  try {
    const icons = await fetchFavicons(url);
    console.log(`网链 ${url} 推荐图标列表：`, icons);
    for (let i = 0; i < icons.length; i++) {
      try {
        let base64 = await downloadAndConvertToBase64(icons[i].href);
        faviconBase64s.push(base64);
      } catch (err) {
        console.error('下载图片捕获到错误', err);
      }
    }
    const iconUrl = getFaviconByUrl(url);
    if (iconUrl) {
      try {
        let iconUrlBase64 = await downloadAndConvertToBase64(iconUrl);
        faviconBase64s.unshift(iconUrlBase64);
      } catch (err) {
        console.error('下载favicon.im图片捕获到错误', err);
      }
    }
    global.huasen.responseData(res, faviconBase64s, 'SUCCESS', '推荐图标');
  } catch (err) {
    global.huasen.responseData(res, [], 'ERROR', '推荐图标异常');
  }
}

async function findSiteDetail(req, res, next) {
  let { _id } = req.huasenParams;
  let { proof } = req.huasenJWT;
  req.epWorking(
    [
      {
        schemaName: 'Site',
        methodName: 'findOne',
        payloads: [
          {
            _id,
            // 筛选出小于等于用户权限的订阅源
            code: { $lte: proof.code },
            // 可订阅
            enabled: true,
          },
        ],
      },
      {
        schemaName: 'Site',
        methodName: 'upPV',
        payloads: [_id],
        self: true,
      },
    ],
    site => {
      if (site) {
        global.huasen.responseData(res, site, 'SUCCESS', '查询站点详情');
      } else {
        global.huasen.responseData(res, null, 'ERROR', '站点不存在或权限不足');
      }
    },
  );
}

module.exports = {
  findByPage,
  add,
  update,
  remove,
  findByCode,
  findByList,
  removeMany,
  addMany,
  findSiteTagByList,
  findSiteColumnByList,
  bindColumn,
  unbindColumn,
  importSite,
  exportSite,
  findSiteFavicon,
  findSiteDetail,
};
