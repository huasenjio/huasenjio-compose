/*
 * @Autor: huasenjio
 * @Date: 2023-04-15 02:10:24
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-06-17 00:12:17
 * @Description:
 */

// npm install fs-extra -g
const fs = require("fs-extra");

async function copyFiles(srcPath, destPath) {
  await fs.copy(srcPath, destPath, {
    filter: (src) => {
      return (
        !src.includes("node_modules") &&
        !src.includes(".vscode") &&
        !src.includes(".git")
      );
    },
  });
}

module.exports = {
  copyFiles,
};
