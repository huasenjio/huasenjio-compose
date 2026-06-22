function getDisplayTabs(tabs, pageNo, pageSize) {
  const startIndex = (pageNo - 1) * pageSize;
  const endIndex = pageNo * pageSize;
  return tabs.slice(startIndex, endIndex);
}

function createTabClosePlan(options = {}) {
  const tabs = Array.isArray(options.tabs) ? options.tabs : [];
  const currentTabKey = options.currentTabKey;
  const path = options.path;
  const pageNo = options.pageNo || 1;
  const pageSize = options.pageSize || 1;

  if (tabs.length === 1) {
    return {
      canClose: false,
      needNavigate: false,
      targetTab: null,
      removedTab: null,
      getNextState() {
        return {
          tabs,
          pageNo,
          removedTab: null,
        };
      },
    };
  }

  const index = tabs.findIndex(tab => tab.path === path);
  if (index <= -1) {
    return {
      canClose: false,
      needNavigate: false,
      targetTab: null,
      removedTab: null,
      getNextState() {
        return {
          tabs,
          pageNo,
          removedTab: null,
        };
      },
    };
  }

  const preTab = tabs[index - 1];
  const nextTab = tabs[index + 1];
  const removedTab = tabs[index];
  const needNavigate = currentTabKey === path;
  const targetTab = needNavigate ? nextTab || preTab || null : null;

  return {
    canClose: true,
    needNavigate,
    targetTab,
    removedTab,
    getNextState() {
      const nextTabs = tabs.slice();
      nextTabs.splice(index, 1);
      let nextPageNo = pageNo;
      if (nextPageNo > 1 && getDisplayTabs(nextTabs, nextPageNo, pageSize).length === 0) {
        nextPageNo--;
      }
      return {
        tabs: nextTabs,
        pageNo: nextPageNo,
        removedTab,
      };
    },
  };
}

module.exports = {
  createTabClosePlan,
};
