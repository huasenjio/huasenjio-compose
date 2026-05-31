import { tool } from 'huasen-lib';
import CONSTANT from '@/constant/index.js';

export function handleSize(size) {
  return tool.formatSize(size, `${CONSTANT.appMinWidth}px`);
}
