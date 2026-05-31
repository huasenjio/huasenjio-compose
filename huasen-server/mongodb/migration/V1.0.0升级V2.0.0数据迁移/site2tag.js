async function migrateSiteTagRelation() {
  // 1. 查询所有 site
  const [err1, sites] = await req.working([
    {
      schemaName: 'site',
      methodName: 'find',
      payloads: [],
    },
  ]);
  if (err1) {
    return global.huasen.responseData(res, null, 'ERROR', '查询site异常');
  }

  // 2. 查询已存在的 tag 记录（按名称建立映射）
  const [err2, existingTags] = await req.working([
    {
      schemaName: 'tag',
      methodName: 'find',
      payloads: [],
    },
  ]);
  if (err2) {
    return global.huasen.responseData(res, null, 'ERROR', '查询tag异常');
  }

  // 名称到ID的映射
  const tagNameToIdMap = new Map();
  for (const tag of existingTags) {
    tagNameToIdMap.set(tag.name, tag._id.toString());
  }

  // 3. 查询已存在的 site2tag 关系
  const [err3, existingRelations] = await req.working([
    {
      schemaName: 'site2tag',
      methodName: 'find',
      payloads: [],
    },
  ]);
  if (err3) {
    return global.huasen.responseData(res, null, 'ERROR', '查询已存在关系异常');
  }

  // 4. 构建已存在关系的 Set，格式: "siteId_tagId"
  const existingSet = new Set(existingRelations.map(rel => `${rel.siteId}_${rel.tagId}`));

  // 5. 收集所有需要创建的 tag 名称
  const tagNamesToCreate = new Set();
  const siteTagMappings = []; // 存储 siteId -> tagNames 的映射

  const stats = {
    totalSites: sites.length,
    parsedSites: 0,
    emptySites: 0,
    newTagsCreated: 0,
    newRelations: 0,
    duplicateRelations: 0,
    invalidEntries: [],
  };

  // 第一遍：收集所有需要创建的 tag
  for (const site of sites) {
    const siteId = site._id.toString();
    let expand = {};
    try {
      expand = JSON.parse(site.expand || '{}');
    } catch (parseErr) {
      stats.invalidEntries.push({
        siteId,
        error: 'expand解析失败',
        value: site.expand,
      });
      continue;
    }

    const tagNames = expand.tag || [];
    if (!Array.isArray(tagNames) || tagNames.length === 0) {
      stats.emptySites++;
      continue;
    }

    stats.parsedSites++;
    const validTagNames = [];
    for (const tagName of tagNames) {
      if (typeof tagName === 'string' && tagName.trim()) {
        const trimmedName = tagName.trim();
        validTagNames.push(trimmedName);
        // 如果 tag 不存在，记录需要创建
        if (!tagNameToIdMap.has(trimmedName)) {
          tagNamesToCreate.add(trimmedName);
        }
      }
    }
    if (validTagNames.length > 0) {
      siteTagMappings.push({ siteId, tagNames: validTagNames });
    }
  }

  // 6. 批量创建不存在的 tag
  if (tagNamesToCreate.size > 0) {
    const tagsToInsert = Array.from(tagNamesToCreate).map(name => ({ name }));
    const [err4, insertResult] = await req.working([
      {
        schemaName: 'tag',
        methodName: 'insertMany',
        payloads: [tagsToInsert],
      },
    ]);
    if (err4) {
      return global.huasen.responseData(res, null, 'ERROR', '创建tag记录异常');
    }
    stats.newTagsCreated = insertResult.length;
    // 更新名称到ID的映射
    for (const newTag of insertResult) {
      tagNameToIdMap.set(newTag.name, newTag._id.toString());
    }
  }

  // 7. 构建待插入的关系数组
  const relationsToInsert = [];
  for (const { siteId, tagNames } of siteTagMappings) {
    for (const tagName of tagNames) {
      const tagId = tagNameToIdMap.get(tagName);
      if (!tagId) continue;

      const relationKey = `${siteId}_${tagId}`;
      if (existingSet.has(relationKey)) {
        stats.duplicateRelations++;
        continue;
      }

      relationsToInsert.push({ siteId, tagId });
      existingSet.add(relationKey);
      stats.newRelations++;
    }
  }

  // 8. 批量插入新关系
  if (relationsToInsert.length > 0) {
    req.epWorking(
      [
        {
          schemaName: 'site2tag',
          methodName: 'insertMany',
          payloads: [relationsToInsert],
        },
      ],
      result => {
        stats.insertResult = result;
        global.huasen.responseData(res, stats, 'SUCCESS', '站点和标签关系数据迁移完成');
      },
    );
  } else {
    global.huasen.responseData(res, stats, 'SUCCESS', '无新数据需要迁移');
  }
}

// 执行迁移
migrateSiteTagRelation();
