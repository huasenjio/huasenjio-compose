const fs = require('fs');
const path = require('path');

/**
 * 支持的文档格式，暂不支持 .ppt/.xls/.odt/.ods/.odp
 *
 * 解析库映射：
 *   .pdf   → pdf-parse (基于 pdf.js，纯 JS)
 *   .docx  → mammoth (纯 JS)
 *   .doc   → word-extractor (纯 JS)
 *   .xlsx  → exceljs (已有依赖，纯 JS)
 *   .pptx  → 内置 zip + XML 解析（纯 JS）
 *   .txt/.md/.rtf/.json/.sh/.html/.css → fs 直读
 */
const SUPPORTED_FORMATS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.pptx', '.txt', '.md', '.rtf', '.json', '.sh', '.html', '.css'];

/**
 * 检查文件格式是否支持
 * @param {string} ext - 文件扩展名（如 .pdf）
 * @returns {boolean}
 */
function isSupportedFormat(ext) {
  return SUPPORTED_FORMATS.includes((ext || '').toLowerCase());
}

// ──────────────────── 各格式解析器 ────────────────────

/**
 * 解析纯文本文件 (.txt / .md / .rtf)
 */
async function parsePlainText(filePath) {
  const buffer = fs.readFileSync(filePath);
  return buffer.toString('utf-8');
}

/**
 * 解析 PDF 文件
 * 使用 pdf-parse（基于 Mozilla pdf.js）
 */
async function parsePDF(filePath) {
  const pdfParse = require('pdf-parse');
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text || '';
}

/**
 * 解析 DOCX 文件
 * 使用 mammoth（纯 JS）
 */
async function parseDOCX(filePath) {
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value || '';
}

/**
 * 解析 DOC 文件（旧版 Word 二进制格式）
 * 使用 word-extractor
 */
async function parseDOC(filePath) {
  const WordExtractor = require('word-extractor');
  const extractor = new WordExtractor();
  const doc = await extractor.extract(filePath);
  // getBody() 返回正文文本，getHeaders()/getFootnotes() 可选
  return doc.getBody() || '';
}

/**
 * 解析 XLSX 文件
 * 使用 exceljs
 */
async function parseXLSX(filePath) {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheets = [];
  workbook.eachSheet((worksheet, sheetId) => {
    const rows = [];
    rows.push(`[工作表: ${worksheet.name}]`);

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const cells = [];
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        let value = '';
        if (cell.value !== null && cell.value !== undefined) {
          if (typeof cell.value === 'object') {
            // 处理富文本、公式、日期等
            if (cell.value.result !== undefined) {
              value = String(cell.value.result);
            } else if (cell.value.text) {
              value = cell.value.text;
            } else if (cell.value instanceof Date) {
              value = cell.value.toISOString().split('T')[0];
            } else {
              value = JSON.stringify(cell.value);
            }
          } else {
            value = String(cell.value);
          }
        }
        cells.push(value);
      });
      rows.push(cells.join('\t'));
    });

    sheets.push(rows.join('\n'));
  });

  return sheets.join('\n\n');
}

/**
 * 解析 XLS 文件
 */
async function parseXLS(filePath) {
  try {
    // exceljs 对部分 .xls 格式有一定支持
    return await parseXLSX(filePath);
  } catch (err) {
    throw new Error('旧版 .xls 格式解析失败，建议转换为 .xlsx 后重试: ' + err.message);
  }
}

/**
 * 解析 PPTX 文件，PPTX 本质是 ZIP 包，内含 ppt/slides/slide*.xml
 */
async function parsePPTX(filePath) {
  // PPTX 是标准 ZIP 格式，使用 jszip 解析
  const JSZip = require('jszip');
  const buffer = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(buffer);

  // 收集所有 slide 文件
  const slideFiles = [];
  zip.forEach((relativePath, zipEntry) => {
    if (/^ppt\/slides\/slide\d+\.xml$/i.test(relativePath)) {
      slideFiles.push({ path: relativePath, entry: zipEntry });
    }
  });

  // 按 slide 编号排序
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.path.match(/slide(\d+)/)[1], 10);
    const numB = parseInt(b.path.match(/slide(\d+)/)[1], 10);
    return numA - numB;
  });

  const slides = [];
  for (const sf of slideFiles) {
    const xml = await sf.entry.async('text');
    // 从 XML 中提取所有 <a:t> 文本节点内容
    const textParts = [];
    const regex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      const text = match[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
      textParts.push(text);
    }
    if (textParts.length > 0) {
      const slideNum = sf.path.match(/slide(\d+)/)[1];
      slides.push(`[幻灯片 ${slideNum}]\n${textParts.join(' ')}`);
    }
  }

  return slides.join('\n\n');
}

// ──────────────────── 格式 → 解析器映射 ────────────────────

const PARSER_MAP = {
  '.pdf': parsePDF,
  '.docx': parseDOCX,
  '.doc': parseDOC,
  '.xlsx': parseXLSX,
  '.xls': parseXLS,
  '.pptx': parsePPTX,
  '.txt': parsePlainText,
  '.md': parsePlainText,
  '.rtf': parsePlainText,
  '.json': parsePlainText,
  '.sh': parsePlainText,
  '.html': parsePlainText,
  '.css': parsePlainText,
};

// ──────────────────── 统一入口 ────────────────────

/**
 * 统一文档解析入口
 * @param {string} filePath - 文件绝对路径
 * @param {string} ext - 文件扩展名（如 .pdf）
 * @param {Object} options - 解析选项
 * @param {number} options.maxLength - 最大文本长度（默认 100000 字符）
 * @returns {Promise<string>} 解析后的纯文本
 */
async function parseDocument(filePath, ext, options = {}) {
  const { maxLength = 100000 } = options;
  const lowerExt = (ext || '').toLowerCase();

  if (!isSupportedFormat(lowerExt)) {
    throw new Error(`不支持的文件格式: ${ext}`);
  }

  const parser = PARSER_MAP[lowerExt];
  if (!parser) {
    throw new Error(`缺少格式 ${ext} 的解析器实现`);
  }

  try {
    let text = await parser(filePath);

    // 清理文本
    text = cleanText(text);

    // 限制长度，避免超过模型 token 限制
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '\n\n[文档内容过长，已截断...]';
    }

    return text;
  } catch (err) {
    throw new Error(`文档解析失败 (${path.basename(filePath)}): ${err.message}`);
  }
}

/**
 * 清理提取的文本
 * @param {string} text - 原始文本
 * @returns {string} 清理后的文本
 */
function cleanText(text) {
  if (!text) return '';

  return (
    text
      // 移除多余的空白行（保留最多 2 个连续换行）
      .replace(/\n{3,}/g, '\n\n')
      // 移除行首行尾空白
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      // 移除首尾空白
      .trim()
  );
}

/**
 * 批量解析多个文档
 * @param {Array<{path: string, ext: string}>} files - 文件列表
 * @param {Object} options - 解析选项
 * @returns {Promise<Array<{path: string, text: string, error?: string}>>}
 */
async function parseDocuments(files, options = {}) {
  const results = [];

  for (const file of files) {
    try {
      const text = await parseDocument(file.path, file.ext, options);
      results.push({ path: file.path, text });
    } catch (err) {
      results.push({ path: file.path, text: '', error: err.message });
    }
  }

  return results;
}

module.exports = {
  parseDocument,
  parseDocuments,
  isSupportedFormat,
  SUPPORTED_FORMATS,
};
