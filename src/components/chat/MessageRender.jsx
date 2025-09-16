// ============= src/components/chat/MessageRenderer.jsx =============
import React, { useState, useMemo } from "react";
import { Copy, Check, Download, Play, Eye } from "lucide-react";

// 代码高亮配置
const CODE_LANGUAGE_MAP = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  rb: "ruby",
  go: "go",
  rs: "rust",
  cpp: "cpp",
  "c++": "cpp",
  c: "c",
  java: "java",
  php: "php",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  fish: "bash",
  ps1: "powershell",
  sql: "sql",
  json: "json",
  xml: "xml",
  html: "html",
  css: "css",
  scss: "scss",
  sass: "sass",
  yml: "yaml",
  yaml: "yaml",
  md: "markdown",
  dockerfile: "dockerfile",
  nginx: "nginx",
  apache: "apache",
};

// 简单的语法高亮函数（不依赖外部库）
const highlightCode = (code, language) => {
  if (!language || !code) return code;

  // 基础的语法高亮规则
  const rules = {
    javascript: [
      {
        pattern:
          /\b(const|let|var|function|class|if|else|for|while|return|import|export|from|default)\b/g,
        className: "keyword",
      },
      { pattern: /\/\/.*$/gm, className: "comment" },
      { pattern: /\/\*[\s\S]*?\*\//g, className: "comment" },
      { pattern: /"([^"\\]|\\.)*"/g, className: "string" },
      { pattern: /'([^'\\]|\\.)*'/g, className: "string" },
      { pattern: /`([^`\\]|\\.)*`/g, className: "string" },
      { pattern: /\b\d+\.?\d*\b/g, className: "number" },
    ],
    python: [
      {
        pattern:
          /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|with|lambda|pass|break|continue)\b/g,
        className: "keyword",
      },
      { pattern: /#.*$/gm, className: "comment" },
      { pattern: /"([^"\\]|\\.)*"/g, className: "string" },
      { pattern: /'([^'\\]|\\.)*'/g, className: "string" },
      { pattern: /\b\d+\.?\d*\b/g, className: "number" },
    ],
    html: [
      { pattern: /<\/?[\w\s="/.':;#-]+[^>/?]+>/g, className: "tag" },
      { pattern: /<!--[\s\S]*?-->/g, className: "comment" },
      { pattern: /="([^"]*)"/g, className: "string" },
    ],
    css: [
      { pattern: /\/\*[\s\S]*?\*\//g, className: "comment" },
      {
        pattern: /[.#]?[a-zA-Z][a-zA-Z0-9_-]*(?=\s*{)/g,
        className: "selector",
      },
      { pattern: /[a-zA-Z-]+(?=\s*:)/g, className: "property" },
      { pattern: /"([^"\\]|\\.)*"/g, className: "string" },
      { pattern: /'([^'\\]|\\.)*'/g, className: "string" },
    ],
  };

  let highlightedCode = code;
  const languageRules = rules[language] || rules.javascript;

  languageRules.forEach((rule) => {
    highlightedCode = highlightedCode.replace(rule.pattern, (match) => {
      return `<span class="syntax-${rule.className}">${match}</span>`;
    });
  });

  return highlightedCode;
};

// 代码块组件
const CodeBlock = ({ code, language, fileName, darkMode }) => {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const displayLanguage =
    CODE_LANGUAGE_MAP[language?.toLowerCase()] || language || "text";
  const highlightedCode = useMemo(
    () => highlightCode(code, displayLanguage),
    [code, displayLanguage]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // 备用复制方法
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err2) {
        console.error("复制失败:", err2);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || `code.${language || "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const canRunCode = ["javascript", "html", "css"].includes(displayLanguage);

  return (
    <div
      className={`my-4 rounded-lg overflow-hidden border ${
        darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"
      }`}
    >
      {/* 代码块头部 */}
      <div
        className={`flex items-center justify-between px-4 py-2 text-sm ${
          darkMode
            ? "bg-gray-800 border-gray-700 text-gray-300"
            : "bg-gray-100 border-gray-200 text-gray-600"
        } border-b`}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <span className="font-mono">{fileName || displayLanguage}</span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              darkMode
                ? "bg-gray-700 text-gray-400"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {code.split("\n").length} 行
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className={`p-1 rounded transition-colors ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            }`}
            title={showRaw ? "显示高亮" : "显示原文"}
          >
            <Eye size={14} />
          </button>

          {canRunCode && (
            <button
              onClick={() => {
                /* 运行代码逻辑 */
              }}
              className={`p-1 rounded transition-colors ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-green-400"
                  : "hover:bg-gray-200 text-gray-500 hover:text-green-600"
              }`}
              title="运行代码"
            >
              <Play size={14} />
            </button>
          )}

          <button
            onClick={handleDownload}
            className={`p-1 rounded transition-colors ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            }`}
            title="下载代码"
          >
            <Download size={14} />
          </button>

          <button
            onClick={handleCopy}
            className={`p-1 rounded transition-colors ${
              copied
                ? "text-green-500"
                : darkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            }`}
            title="复制代码"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* 代码内容 */}
      <div className="relative">
        <pre
          className={`p-4 overflow-x-auto text-sm font-mono leading-relaxed ${
            darkMode ? "text-gray-300" : "text-gray-800"
          }`}
        >
          <code
            dangerouslySetInnerHTML={{
              __html: showRaw ? code : highlightedCode,
            }}
          />
        </pre>

        {/* 行号 */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-12 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-100 border-gray-200"
          } border-r text-xs font-mono leading-relaxed p-4 select-none`}
        >
          {code.split("\n").map((_, index) => (
            <div
              key={index}
              className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}
            >
              {index + 1}
            </div>
          ))}
        </div>

        <style jsx>{`
          .syntax-keyword {
            color: #ff6b6b;
            font-weight: bold;
          }
          .syntax-string {
            color: #4ecdc4;
          }
          .syntax-comment {
            color: #95a5a6;
            font-style: italic;
          }
          .syntax-number {
            color: #f39c12;
          }
          .syntax-tag {
            color: #3498db;
          }
          .syntax-selector {
            color: #e74c3c;
          }
          .syntax-property {
            color: #9b59b6;
          }
        `}</style>
      </div>
    </div>
  );
};

// 内联代码组件
const InlineCode = ({ children, darkMode }) => (
  <code
    className={`px-2 py-1 rounded text-sm font-mono ${
      darkMode
        ? "bg-gray-800 text-gray-300 border border-gray-700"
        : "bg-gray-100 text-gray-800 border border-gray-200"
    }`}
  >
    {children}
  </code>
);

// 表格组件
const Table = ({ headers, rows, darkMode }) => (
  <div
    className={`my-4 overflow-x-auto rounded-lg border ${
      darkMode ? "border-gray-700" : "border-gray-200"
    }`}
  >
    <table className="w-full">
      <thead className={`${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              className={`px-4 py-2 text-left font-medium ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={`${darkMode ? "bg-gray-900" : "bg-white"}`}>
        {rows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={`border-t ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className={`px-4 py-2 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// 引用块组件
const Blockquote = ({ children, darkMode }) => (
  <blockquote
    className={`my-4 pl-4 border-l-4 italic ${
      darkMode
        ? "border-blue-500 bg-gray-800 text-gray-300"
        : "border-blue-500 bg-blue-50 text-gray-700"
    } p-4 rounded-r-lg`}
  >
    {children}
  </blockquote>
);

// 列表组件
const List = ({ items, ordered = false, darkMode }) => {
  const ListTag = ordered ? "ol" : "ul";

  return (
    <ListTag
      className={`my-4 pl-6 space-y-2 ${
        ordered ? "list-decimal" : "list-disc"
      } ${darkMode ? "text-gray-300" : "text-gray-700"}`}
    >
      {items.map((item, index) => (
        <li key={index} className="leading-relaxed">
          <MessageRenderer content={item} darkMode={darkMode} />
        </li>
      ))}
    </ListTag>
  );
};

// 主要的消息渲染器
const MessageRenderer = ({ content, darkMode }) => {
  if (!content) return null;

  // 解析不同类型的内容
  const parseContent = (text) => {
    const elements = [];
    let currentIndex = 0;

    // 代码块正则 (```language\ncode\n```)
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    // 内联代码正则 (`code`)
    const inlineCodeRegex = /`([^`\n]+)`/g;
    // 表格正则 (简单的markdown表格)
    const tableRegex = /^\|(.+)\|\s*\n\|[-\s|:]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm;
    // 引用块正则 (> text)
    const blockquoteRegex = /^>\s*(.+)$/gm;
    // 列表正则
    const unorderedListRegex = /^[-*+]\s+(.+)$/gm;
    const orderedListRegex = /^\d+\.\s+(.+)$/gm;
    // 标题正则
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    // 链接正则
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    // 粗体和斜体
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const italicRegex = /\*([^*]+)\*/g;

    // 收集所有匹配项
    const matches = [];

    let match;

    // 代码块
    while ((match = codeBlockRegex.exec(text)) !== null) {
      matches.push({
        type: "codeblock",
        index: match.index,
        length: match[0].length,
        language: match[1],
        code: match[2].trim(),
        raw: match[0],
      });
    }

    // 内联代码
    codeBlockRegex.lastIndex = 0; // 重置正则
    const tempText = text.replace(codeBlockRegex, ""); // 临时移除代码块
    while ((match = inlineCodeRegex.exec(tempText)) !== null) {
      matches.push({
        type: "inlinecode",
        index: match.index,
        length: match[0].length,
        code: match[1],
        raw: match[0],
      });
    }

    // 表格
    while ((match = tableRegex.exec(text)) !== null) {
      const headers = match[1]
        .split("|")
        .map((h) => h.trim())
        .filter((h) => h);
      const rows = match[2]
        .trim()
        .split("\n")
        .map((row) =>
          row
            .split("|")
            .map((cell) => cell.trim())
            .filter((cell) => cell)
        );

      matches.push({
        type: "table",
        index: match.index,
        length: match[0].length,
        headers,
        rows,
        raw: match[0],
      });
    }

    // 按位置排序
    matches.sort((a, b) => a.index - b.index);

    // 渲染内容
    let renderedElements = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      // 添加匹配项之前的普通文本
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        if (textBefore.trim()) {
          renderedElements.push(
            <span key={`text-${i}`}>
              {renderInlineElements(textBefore, darkMode)}
            </span>
          );
        }
      }

      // 添加匹配的元素
      switch (match.type) {
        case "codeblock":
          renderedElements.push(
            <CodeBlock
              key={`code-${i}`}
              code={match.code}
              language={match.language}
              darkMode={darkMode}
            />
          );
          break;
        case "inlinecode":
          renderedElements.push(
            <InlineCode key={`inline-${i}`} darkMode={darkMode}>
              {match.code}
            </InlineCode>
          );
          break;
        case "table":
          renderedElements.push(
            <Table
              key={`table-${i}`}
              headers={match.headers}
              rows={match.rows}
              darkMode={darkMode}
            />
          );
          break;
      }

      lastIndex = match.index + match.length;
    });

    // 添加剩余的文本
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText.trim()) {
        renderedElements.push(
          <span key="text-end">
            {renderInlineElements(remainingText, darkMode)}
          </span>
        );
      }
    }

    return renderedElements.length > 0
      ? renderedElements
      : renderInlineElements(text, darkMode);
  };

  // 渲染行内元素（粗体、斜体、链接等）
  const renderInlineElements = (text, darkMode) => {
    let processedText = text;

    // 链接
    processedText = processedText.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      `<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 underline">$1</a>`
    );

    // 粗体
    processedText = processedText.replace(
      /\*\*([^*]+)\*\*/g,
      '<strong class="font-bold">$1</strong>'
    );

    // 斜体
    processedText = processedText.replace(
      /\*([^*]+)\*/g,
      '<em class="italic">$1</em>'
    );

    // 标题
    processedText = processedText.replace(
      /^(#{1,6})\s+(.+)$/gm,
      (match, hashes, title) => {
        const level = hashes.length;
        const sizes = [
          "text-3xl",
          "text-2xl",
          "text-xl",
          "text-lg",
          "text-base",
          "text-sm",
        ];
        return `<h${level} class="${sizes[level - 1]} font-bold my-4 ${
          darkMode ? "text-white" : "text-gray-800"
        }">${title}</h${level}>`;
      }
    );

    return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
  };

  return <div className="message-content">{parseContent(content)}</div>;
};

export default MessageRenderer;
