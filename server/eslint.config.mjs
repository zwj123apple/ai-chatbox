// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 1. 浏览器 + React 文件
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser, // 保留浏览器全局
        ...globals.node, // 追加 Node 全局（require、process…）
      },
    },
  },

  // 2. 纯 CommonJS 文件
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs" },
  },

  // 3. React 推荐规则
  pluginReact.configs.flat.recommended,
]);
