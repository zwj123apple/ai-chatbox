import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    // env: {
    //   browser: true, // 浏览器环境（Vite 项目最终运行在浏览器）
    //   es2021: true, // 支持 ES2021 语法
    //   node: true, // 关键：声明 Node 环境，让 ESLint 识别 process
    // },
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      //"no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "no-unused-vars": 0,
      "react-refresh/only-export-components": "off",
    },
  },
]);
