async function migrateSitePinRelation() {
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

  // 2. 查询已存在的 pin 记录（按名称建立映射）
  const [err2, existingPins] = await req.working([
    {
      schemaName: 'pin',
      methodName: 'find',
      payloads: [],
    },
  ]);
  if (err2) {
    return global.huasen.responseData(res, null, 'ERROR', '查询pin异常');
  }

  // 名称到ID的映射
  const pinNameToIdMap = new Map();
  for (const pin of existingPins) {
    pinNameToIdMap.set(pin.name, pin._id.toString());
  }

  // 3. 查询已存在的 site2pin 关系
  const [err3, existingRelations] = await req.working([
    {
      schemaName: 'site2pin',
      methodName: 'find',
      payloads: [],
    },
  ]);
  if (err3) {
    return global.huasen.responseData(res, null, 'ERROR', '查询已存在关系异常');
  }

  // 4. 构建已存在关系的 Set，格式: "siteId_pinId"
  const existingSet = new Set(existingRelations.map(rel => `${rel.siteId}_${rel.pinId}`));

  // 5. 收集所有需要创建的 pin 名称
  const pinNamesToCreate = new Set();
  const sitePinMappings = []; // 存储 siteId -> pinNames 的映射

  const stats = {
    totalSites: sites.length,
    parsedSites: 0,
    emptySites: 0,
    newPinsCreated: 0,
    newRelations: 0,
    duplicateRelations: 0,
    invalidEntries: [],
  };

  // 第一遍：收集所有需要创建的 pin
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

    const pinNames = expand.pin || [];
    if (!Array.isArray(pinNames) || pinNames.length === 0) {
      stats.emptySites++;
      continue;
    }

    stats.parsedSites++;
    const validPinNames = [];
    for (const pinName of pinNames) {
      if (typeof pinName === 'string' && pinName.trim()) {
        const trimmedName = pinName.trim();
        validPinNames.push(trimmedName);
        // 如果 pin 不存在，记录需要创建
        if (!pinNameToIdMap.has(trimmedName)) {
          pinNamesToCreate.add(trimmedName);
        }
      }
    }
    if (validPinNames.length > 0) {
      sitePinMappings.push({ siteId, pinNames: validPinNames });
    }
  }

  // 6. 批量创建不存在的 pin
  if (pinNamesToCreate.size > 0) {
    const pinsToInsert = Array.from(pinNamesToCreate).map(name => ({ name }));
    const [err4, insertResult] = await req.working([
      {
        schemaName: 'pin',
        methodName: 'insertMany',
        payloads: [pinsToInsert],
      },
    ]);
    if (err4) {
      return global.huasen.responseData(res, null, 'ERROR', '创建pin记录异常');
    }
    stats.newPinsCreated = insertResult.length;
    // 更新名称到ID的映射
    for (const newPin of insertResult) {
      pinNameToIdMap.set(newPin.name, newPin._id.toString());
    }
  }

  // 7. 构建待插入的关系数组
  const relationsToInsert = [];
  for (const { siteId, pinNames } of sitePinMappings) {
    for (const pinName of pinNames) {
      const pinId = pinNameToIdMap.get(pinName);
      if (!pinId) continue;

      const relationKey = `${siteId}_${pinId}`;
      if (existingSet.has(relationKey)) {
        stats.duplicateRelations++;
        continue;
      }

      relationsToInsert.push({ siteId, pinId });
      existingSet.add(relationKey);
      stats.newRelations++;
    }
  }

  // 8. 批量插入新关系
  if (relationsToInsert.length > 0) {
    req.epWorking(
      [
        {
          schemaName: 'site2pin',
          methodName: 'insertMany',
          payloads: [relationsToInsert],
        },
      ],
      result => {
        stats.insertResult = result;
        global.huasen.responseData(res, stats, 'SUCCESS', '站点和置顶标记关系数据迁移完成');
      },
    );
  } else {
    global.huasen.responseData(res, stats, 'SUCCESS', '无新数据需要迁移');
  }
}

// 执行迁移
migrateSitePinRelation();
