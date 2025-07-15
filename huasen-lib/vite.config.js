import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "lib/main.js"),
      name: "huasenLib",
      fileName: (format) => `huasen-lib.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["crypto", "constants", "core-js"],
    },
    // 添加目标环境配置
    target: "es2015",
  },
});
