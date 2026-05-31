/**
 * 旧数据字段清理脚本
 *
 * 清理以下冗余字段：
 * - journal.columnStore（删除字段）
 * - column.siteStore（删除字段）
 * - site.expand.pin（从expand对象中移除）
 * - site.expand.tag（从expand对象中移除）
 * - site.expand.columnStore（从expand对象中移除）
 *
 * 注意：执行前请确保迁移脚本已成功执行，并已验证新关系表数据完整
 */

async function cleanupOldFields() {
  const stats = {
    journal: { total: 0, cleaned: 0, errors: [] },
    column: { total: 0, cleaned: 0, errors: [] },
    site: { total: 0, cleaned: 0, pinRemoved: 0, tagRemoved: 0, columnStoreRemoved: 0, errors: [] },
  };

  // 1. 删除 journal.columnStore 字段
  const [err1, journals] = await req.working([
    {
      schemaName: 'journal',
      methodName: 'find',
      payloads: [],
    },
  ]);
  if (err1) {
    return global.huasen.responseData(res, null, 'ERROR', '查询journal异常');
  }

  stats.journal.total = journals.length;
  for (const journal of journals) {
    if (journal.columnStore !== undefined) {
      const [updateErr] = await req.working([
        {
          schemaName: 'journal',
          methodName: 'updateOne',
          payloads: [{ _id: journal._id }, { $unset: { columnStore: '' } }],
        },
      ]);
      if (updateErr) {
        stats.journal.errors.push({ journalId: journal._id.toString(), error: '更新失败' });
      } else {
        stats.journal.cleaned++;
      }
    }
  }

  // 2. 删除 column.siteStore 字段
  const [err2, columns] = await req.working([
    {
      schemaName: 'column',
      methodName: 'find',
      payloads: [],
    },
  ]);
  if (err2) {
    return global.huasen.responseData(res, null, 'ERROR', '查询column异常');
  }

  stats.column.total = columns.length;
  for (const column of columns) {
    if (column.siteStore !== undefined) {
      const [updateErr] = await req.working([
        {
          schemaName: 'column',
          methodName: 'updateOne',
          payloads: [{ _id: column._id }, { $unset: { siteStore: '' } }],
        },
      ]);
      if (updateErr) {
        stats.column.errors.push({ columnId: column._id.toString(), error: '更新失败' });
      } else {
        stats.column.cleaned++;
      }
    }
  }

  // 3. 清理 site.expand 中的 pin、tag、columnStore 字段
  const [err3, sites] = await req.working([
    {
      schemaName: 'site',
      methodName: 'find',
      payloads: [],
    },
  ]);
  if (err3) {
    return global.huasen.responseData(res, null, 'ERROR', '查询site异常');
  }

  stats.site.total = sites.length;
  for (const site of sites) {
    let expand = {};
    let needUpdate = false;

    // 解析 expand
    try {
      expand = JSON.parse(site.expand || '{}');
    } catch (parseErr) {
      stats.site.errors.push({ siteId: site._id.toString(), error: 'expand解析失败' });
      continue;
    }

    // 移除 pin 字段
    if (expand.hasOwnProperty('pin')) {
      delete expand.pin;
      stats.site.pinRemoved++;
      needUpdate = true;
    }

    // 移除 tag 字段
    if (expand.hasOwnProperty('tag')) {
      delete expand.tag;
      stats.site.tagRemoved++;
      needUpdate = true;
    }

    // 移除 columnStore 字段
    if (expand.hasOwnProperty('columnStore')) {
      delete expand.columnStore;
      stats.site.columnStoreRemoved++;
      needUpdate = true;
    }

    // 更新数据
    if (needUpdate) {
      const [updateErr] = await req.working([
        {
          schemaName: 'site',
          methodName: 'updateOne',
          payloads: [{ _id: site._id }, { $set: { expand: JSON.stringify(expand) } }],
        },
      ]);
      if (updateErr) {
        stats.site.errors.push({ siteId: site._id.toString(), error: '更新失败' });
      } else {
        stats.site.cleaned++;
      }
    }
  }

  global.huasen.responseData(res, stats, 'SUCCESS', '旧数据清理完成');
}

// 执行清理
cleanupOldFields();
