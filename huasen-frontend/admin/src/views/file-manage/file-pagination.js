const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_CURRENT_PAGE = 1;

function normalizePositiveInteger(value, fallback) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return fallback;
  }
  return numberValue;
}

function clampFilePagination(options = {}) {
  const pageSize = normalizePositiveInteger(options.pageSize, DEFAULT_PAGE_SIZE);
  const total = Math.max(0, Number(options.total) || 0);
  const maxPage = Math.max(DEFAULT_CURRENT_PAGE, Math.ceil(total / pageSize));
  const currentPage = normalizePositiveInteger(options.currentPage, DEFAULT_CURRENT_PAGE);
  return {
    currentPage: Math.min(currentPage, maxPage),
    pageSize,
  };
}

function getFileExtension(filePath = '') {
  const fileName = String(filePath).split(/\/|\\/).slice(-1).join('');
  const index = fileName.lastIndexOf('.');
  if (index <= -1 || index === fileName.length - 1) {
    return '';
  }
  return fileName.slice(index + 1).toLowerCase();
}

function buildExtensionFilters(files = []) {
  const extensions = files
    .map(item => item && item.ext)
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index)
    .sort();
  return extensions.map(ext => {
    return {
      text: ext,
      value: ext,
    };
  });
}

function filterFilesByExtensions(files = [], extensions = []) {
  if (!Array.isArray(extensions) || extensions.length === 0) {
    return files;
  }
  return files.filter(item => extensions.includes(item.ext));
}

module.exports = {
  DEFAULT_PAGE_SIZE,
  DEFAULT_CURRENT_PAGE,
  clampFilePagination,
  getFileExtension,
  buildExtensionFilters,
  filterFilesByExtensions,
};
