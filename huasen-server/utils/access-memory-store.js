const accessMemoryStore = new Map();

function addAccessRecord(uid, record) {
  if (!uid || !record) return;
  accessMemoryStore.set(uid, record);
}

function getAccessRecords() {
  return Array.from(accessMemoryStore.values());
}

function getAccessRecordCount() {
  return accessMemoryStore.size;
}

function clearAccessRecords() {
  accessMemoryStore.clear();
}

module.exports = {
  addAccessRecord,
  clearAccessRecords,
  getAccessRecordCount,
  getAccessRecords,
};
