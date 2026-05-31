async function migrateJournalColumnRelation() {
  // 1. 查询所有 journal 和 column
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
  // 2. 构建 column ID 集合
  const columnIdSet = new Set(columns.map(col => col._id.toString()));
  // 3. 查询已存在的 journal2column 关系
  const [err3, existingRelations] = await req.working([
    {
      schemaName: 'journal2column',
      methodName: 'find',
      payloads: [],
    },
  ]);
  if (err3) {
    return global.huasen.responseData(res, null, 'ERROR', '查询已存在关系异常');
  }
  // 4. 构建已存在关系的 Set，格式: "journalId_columnId"
  const existingSet = new Set(existingRelations.map(rel => `${rel.journalId}_${rel.columnId}`));

  // 5. 构建待插入的关系数组
  const relationsToInsert = [];
  const stats = {
    totalJournals: journals.length,
    totalColumns: columns.length,
    parsedJournals: 0,
    emptyJournals: 0,
    invalidColumnRefs: 0,
    duplicateRelations: 0,
    newRelations: 0,
    invalidEntries: [],
  };

  for (const journal of journals) {
    const journalId = journal._id.toString();
    let columnStore = [];
    // 解析 columnStore
    try {
      columnStore = JSON.parse(journal.columnStore || '[]');
    } catch (parseErr) {
      stats.invalidEntries.push({
        journalId,
        error: 'columnStore解析失败',
        value: journal.columnStore,
      });
      continue;
    }
    if (!Array.isArray(columnStore) || columnStore.length === 0) {
      stats.emptyJournals++;
      continue;
    }
    stats.parsedJournals++;
    for (let i = 0; i < columnStore.length; i++) {
      const columnId = columnStore[i];
      // 验证 column 是否存在
      if (!columnIdSet.has(columnId)) {
        stats.invalidColumnRefs++;
        continue;
      }
      // 检查关系是否已存在
      const relationKey = `${journalId}_${columnId}`;
      if (existingSet.has(relationKey)) {
        stats.duplicateRelations++;
        continue;
      }
      // 添加到待插入列表
      relationsToInsert.push({
        journalId,
        columnId,
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
          schemaName: 'journal2column',
          methodName: 'insertMany',
          payloads: [relationsToInsert],
        },
      ],
      result => {
        stats.insertResult = result;
        global.huasen.responseData(res, stats, 'SUCCESS', '订阅和栏目关系数据迁移完成');
      },
    );
  } else {
    global.huasen.responseData(res, stats, 'SUCCESS', '无新数据需要迁移');
  }
}
// 执行迁移
migrateJournalColumnRelation();
