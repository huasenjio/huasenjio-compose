async function migrateColumnSiteRelation() {
  // 1. 查询所有 column 和 site
  const [err1, columns] = await req.working([
    {
      schemaName: 'column',
      methodName: 'find',
      payloads: [],
    },
  ]);
  if (err1) {
    return global.huasen.responseData(res, null, 'ERROR', '查询column异常');
  }
  const [err2, sites] = await req.working([
    {
      schemaName: 'site',
      methodName: 'find',
      payloads: [],
    },
  ]);
  if (err2) {
    return global.huasen.responseData(res, null, 'ERROR', '查询site异常');
  }

  // 2. 构建 site ID 集合
  const siteIdSet = new Set(sites.map(site => site._id.toString()));

  // 3. 查询已存在的 column2site 关系
  const [err3, existingRelations] = await req.working([
    {
      schemaName: 'column2site',
      methodName: 'find',
      payloads: [],
    },
  ]);
  if (err3) {
    return global.huasen.responseData(res, null, 'ERROR', '查询已存在关系异常');
  }

  // 4. 构建已存在关系的 Set，格式: "columnId_siteId"
  const existingSet = new Set(existingRelations.map(rel => `${rel.columnId}_${rel.siteId}`));

  // 5. 构建待插入的关系数组
  const relationsToInsert = [];
  const stats = {
    totalColumns: columns.length,
    totalSites: sites.length,
    parsedColumns: 0,
    emptyColumns: 0,
    invalidSiteRefs: 0,
    duplicateRelations: 0,
    newRelations: 0,
    invalidEntries: [],
  };

  for (const column of columns) {
    const columnId = column._id.toString();
    let siteStore = [];
    // 解析 siteStore
    try {
      siteStore = JSON.parse(column.siteStore || '[]');
    } catch (parseErr) {
      stats.invalidEntries.push({
        columnId,
        error: 'siteStore解析失败',
        value: column.siteStore,
      });
      continue;
    }
    if (!Array.isArray(siteStore) || siteStore.length === 0) {
      stats.emptyColumns++;
      continue;
    }
    stats.parsedColumns++;
    for (let i = 0; i < siteStore.length; i++) {
      const siteId = siteStore[i];
      // 验证 site 是否存在
      if (!siteIdSet.has(siteId)) {
        stats.invalidSiteRefs++;
        continue;
      }
      // 检查关系是否已存在
      const relationKey = `${columnId}_${siteId}`;
      if (existingSet.has(relationKey)) {
        stats.duplicateRelations++;
        continue;
      }
      // 添加到待插入列表，保留顺序
      relationsToInsert.push({
        columnId,
        siteId,
      });
      // 更新已存在集合，防止同一批数据重复
      existingSet.add(relationKey);
      stats.newRelations++;
    }
  }

  // 6. 批量插入新关系
  if (relationsToInsert.length > 0) {
    req.epWorking(
      [
        {
          schemaName: 'column2site',
          methodName: 'insertMany',
          payloads: [relationsToInsert],
        },
      ],
      result => {
        stats.insertResult = result;
        global.huasen.responseData(res, stats, 'SUCCESS', '栏目和站点关系数据迁移完成');
      },
    );
  } else {
    global.huasen.responseData(res, stats, 'SUCCESS', '无新数据需要迁移');
  }
}

// 执行迁移
migrateColumnSiteRelation();
