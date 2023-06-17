/*
 * @Autor: huasenjio
 * @Date: 2022-10-10 00:36:28
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-24 20:14:28
 * @Description: 订阅表控制器
 */
function findAllByPage(req, res, next) {
  let { pageNo, pageSize, name, code } = req.huasenParams;
  // 模糊查询参数
  let params = { name: { $regex: new RegExp(name) } };
  // 处理权限码模糊查询
  if (code !== '' && code !== undefined && code !== null) {
    params.code = code;
  }
  req.epWorking(
    [
      {
        schemaName: 'Journal',
        methodName: 'findAllByPage',
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
      global.huasen.responseData(res, result, 'SUCCESS', '分页查询成功', false);
    },
  );
}

function add(req, res, next) {
  req.epWorking(
    [
      {
        schemaName: 'Journal',
        methodName: 'insertMany',
        payloads: [req.huasenParams],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '添加订阅源成功', false);
    },
  );
}

function remove(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'Journal',
        methodName: 'deleteOne',
        payloads: [
          {
            _id,
          },
        ],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '删除订阅源成功', false);
    },
  );
}

function update(req, res, next) {
  let { _id } = req.huasenParams;
  req.epWorking(
    [
      {
        schemaName: 'Journal',
        methodName: 'updateOne',
        payloads: [{ _id }, { $set: req.huasenParams }, { runValidators: true }],
      },
    ],
    result => {
      global.huasen.responseData(res, result, 'SUCCESS', '更新订阅源成功', false);
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
        schemaName: 'Journal',
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
    takes => {
      global.huasen.responseData(res, takes, 'SUCCESS', '查询订阅源成功', false);
    },
  );
}

function findAll(req, res, next) {
  req.epWorking(
    [
      {
        schemaName: 'Journal',
        methodName: 'find',
        payloads: [
          {
            enabled: true,
          },
        ],
      },
    ],
    takes => {
      let temp = takes.map(item => {
        let { _id, name, expand, code } = item;
        return { _id, name, expand, code };
      });
      global.huasen.responseData(res, temp, 'SUCCESS', '查询站点成功', false);
    },
  );
}

// 查询订阅源下的栏目和站点
function findJournalInformationById(req, res, next) {
  let { _id } = req.huasenParams;
  let { proof } = req.huasenJWT;
  req.epWorking(
    [
      {
        schemaName: 'Journal',
        methodName: 'find',
        payloads: [
          {
            _id,
          },
        ],
      },
      {
        schemaName: 'Column',
        methodName: 'find',
        payloads: [
          {
            code: { $lte: proof.code },
            enabled: true,
          },
        ],
      },
      {
        schemaName: 'Site',
        methodName: 'find',
        payloads: [
          {
            code: { $lte: proof.code },
            enabled: true,
          },
        ],
      },
    ],
    (journals, columns, siteList) => {
      if (journals.length !== 0) {
        let journal = journals.shift();
        let columnStore = JSON.parse(journal.columnStore);
        let displayColumns = [];
        columnStore.forEach(colId => {
          let column;
          columns.some(colItem => {
            if (colItem._id == colId) {
              column = colItem;
              return true;
            }
          });
          if (column) {
            let typeName = column.name;
            let sites = [];
            let siteStore = JSON.parse(column.siteStore);
            siteStore.forEach(sitId => {
              siteList.some(sitItem => {
                if (sitItem._id == sitId) {
                  let { _id, name, url, icon, code, expand, description, remarks } = sitItem;
                  sites.push({
                    _id,
                    name,
                    url,
                    icon,
                    code,
                    expand,
                    description,
                    remarks,
                    describe: description,
                    remark: remarks,
                  });
                  return true;
                }
              });
            });
            displayColumns.push({
              typeName,
              sites,
            });
          }
        });
        global.huasen.responseData(
          res,
          {
            _id: journal._id,
            name: journal.name,
            code: journal.code,
            expand: journal.expand,
            series: displayColumns,
          },
          'SUCCESS',
          '查询订阅成功',
          false,
        );
      } else {
        global.huasen.responseData(res, {}, 'ERROR', '订阅源已废弃', false);
      }
    },
  );
}

module.exports = {
  findAllByPage,
  add,
  update,
  remove,
  findByCode,
  findAll,
  findJournalInformationById,
};
