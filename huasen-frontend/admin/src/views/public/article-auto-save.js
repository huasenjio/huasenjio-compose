const { Validator } = require('huasen-lib');

const TITLE_MIN_LENGTH = 2;
const TITLE_MAX_LENGTH = 20;
const LOCAL_DRAFT_PREFIX = 'article-auto-save';
const ARTICLE_TITLE_RULES = [
  { strategy: 'isNonEmpty', errMsg: '必填项' },
  { strategy: `minLength:${TITLE_MIN_LENGTH}`, errMsg: '标题长度不小于2' },
  { strategy: `maxLength:${TITLE_MAX_LENGTH}`, errMsg: '标题长度不大于20' },
];
const titleValidator = new Validator();

function padTime(value) {
  return String(value).padStart(2, '0');
}

function getTrimmedTitle(title) {
  return String(title || '').trim();
}

function getArticleTitleValidationError(title) {
  return titleValidator.verify([
    {
      value: getTrimmedTitle(title),
      rules: ARTICLE_TITLE_RULES,
    },
  ]);
}

function isValidArticleTitle(title) {
  return !getArticleTitleValidationError(title);
}

function buildDraftTitle(date = new Date()) {
  const year = date.getFullYear();
  const month = padTime(date.getMonth() + 1);
  const day = padTime(date.getDate());
  const hour = padTime(date.getHours());
  const minute = padTime(date.getMinutes());
  return `我的草稿${year}${month}${day}${hour}${minute}`;
}

function resolveAutoSaveTarget(articleForm, options = {}) {
  const title = getTrimmedTitle(articleForm && articleForm.title);
  const hasArticleId = Boolean(options.hasArticleId);
  if (!title && !hasArticleId) {
    return {
      target: 'server',
      title: buildDraftTitle(options.now),
      forceDraft: true,
    };
  }
  if (!isValidArticleTitle(title)) {
    return {
      target: 'local',
      reason: 'invalidTitle',
    };
  }
  return {
    target: 'server',
    title,
    forceDraft: !hasArticleId,
  };
}

function buildLocalDraftKey(manageId, articleId) {
  return [LOCAL_DRAFT_PREFIX, manageId || 'anonymous', articleId || 'new'].join(':');
}

module.exports = {
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  getTrimmedTitle,
  getArticleTitleValidationError,
  isValidArticleTitle,
  buildDraftTitle,
  resolveAutoSaveTarget,
  buildLocalDraftKey,
};
