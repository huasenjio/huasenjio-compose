const markdownFenceLangs = ['', 'markdown', 'md', 'mdown', 'mkd'];
function getFenceInfo(line) {
  const match = /^(\s{0,3})(`{3,}|~{3,})([^`~]*)$/.exec(line);
  if (!match) {
    return null;
  }
  const rawInfo = (match[3] || '').trim();
  return {
    indent: match[1],
    markerChar: match[2][0],
    markerLength: match[2].length,
    rawSuffix: match[3] || '',
    info: rawInfo,
    lang: rawInfo.split(/\s+/)[0].toLowerCase(),
    isClosing: rawInfo === '',
  };
}

function updateFenceMarker(line, markerLength) {
  const fence = getFenceInfo(line);
  if (!fence) {
    return line;
  }
  return fence.indent + new Array(markerLength + 1).join(fence.markerChar) + fence.rawSuffix;
}

function looksLikeMarkdownLine(line) {
  return /^#{1,6}\s+\S/.test(line) || /^\s*[-*+]\s+\S/.test(line) || /^\s*\d+\.\s+\S/.test(line) || /^\s*>\s+\S/.test(line) || /^\|.+\|$/.test(line);
}

function isMarkdownFence(fence) {
  return fence && markdownFenceLangs.indexOf(fence.lang) >= 0;
}

function findLooseFenceEnd(lines, fenceInfos, startIndex, startFence) {
  let hasMarkdownSignal = false;
  let hasNestedFence = false;
  let maxInnerMarkerLength = 0;
  const stack = [];

  for (let i = startIndex + 1; i < lines.length; i++) {
    if (looksLikeMarkdownLine(lines[i])) {
      hasMarkdownSignal = true;
    }

    const fence = fenceInfos[i];
    if (!fence) {
      continue;
    }

    if (stack.length === 0 && fence.isClosing && fence.markerChar === startFence.markerChar && fence.markerLength >= startFence.markerLength) {
      if (hasNestedFence && hasMarkdownSignal) {
        return {
          endIndex: i,
          markerLength: maxInnerMarkerLength >= startFence.markerLength ? maxInnerMarkerLength + 1 : startFence.markerLength,
        };
      }
      return null;
    }

    hasNestedFence = true;
    if (fence.markerChar === startFence.markerChar) {
      maxInnerMarkerLength = Math.max(maxInnerMarkerLength, fence.markerLength);
    }

    if (stack.length) {
      const innerFence = stack[stack.length - 1];
      if (fence.isClosing && fence.markerChar === innerFence.markerChar && fence.markerLength >= innerFence.markerLength) {
        stack.pop();
      } else if (!fence.isClosing) {
        stack.push(fence);
      }
      continue;
    }

    if (!fence.isClosing) {
      stack.push(fence);
    }
  }

  return null;
}

export function normalizeLooseMarkdownCodeFences(source) {
  if (!source || source.indexOf('```') < 0) {
    return source;
  }

  const lines = source.split('\n');
  const fenceInfos = lines.map(getFenceInfo);
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const fence = fenceInfos[i];
    if (!isMarkdownFence(fence)) {
      continue;
    }

    const looseFence = findLooseFenceEnd(lines, fenceInfos, i, fence);
    if (!looseFence) {
      continue;
    }

    if (looseFence.markerLength !== fence.markerLength) {
      lines[i] = updateFenceMarker(lines[i], looseFence.markerLength);
      lines[looseFence.endIndex] = updateFenceMarker(lines[looseFence.endIndex], looseFence.markerLength);
      changed = true;
    }
    i = looseFence.endIndex;
  }

  return changed ? lines.join('\n') : source;
}
