// ============= src/components/chat/EnhancedMessageRenderer.jsx (Fixed) =============
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import {
  Copy,
  Check,
  Download,
  Play,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import "katex/dist/katex.min.css";

// 代码块组件
const CodeBlock = ({ children, className, darkMode, ...props }) => {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const code = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${language || "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const canRunCode = ["javascript", "html", "css", "python"].includes(language);

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
          <span className="font-mono font-medium">{language || "text"}</span>
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
            {showRaw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>

          {canRunCode && (
            <button
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
        {showRaw ? (
          <pre
            className={`p-4 overflow-x-auto text-sm font-mono leading-relaxed ${
              darkMode
                ? "text-gray-300 bg-gray-900"
                : "text-gray-800 bg-gray-50"
            }`}
          >
            {code}
          </pre>
        ) : (
          <SyntaxHighlighter
            style={darkMode ? oneDark : oneLight}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              background: "transparent",
              fontSize: "14px",
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            }}
            showLineNumbers={true}
            lineNumberStyle={{
              minWidth: "3em",
              paddingRight: "1em",
              color: darkMode ? "#6b7280" : "#9ca3af",
              borderRight: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
              marginRight: "1em",
            }}
          >
            {code}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
};

// 内联代码组件
const InlineCode = ({ children, darkMode }) => (
  <code
    className={`px-2 py-1 rounded text-sm font-mono ${
      darkMode
        ? "bg-gray-800 text-pink-300 border border-gray-700"
        : "bg-pink-50 text-pink-700 border border-pink-200"
    }`}
  >
    {children}
  </code>
);

// 链接组件
const Link = ({ href, children, darkMode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center gap-1 ${
      darkMode
        ? "text-blue-400 hover:text-blue-300"
        : "text-blue-600 hover:text-blue-500"
    } underline transition-colors`}
  >
    {children}
    <ExternalLink size={12} />
  </a>
);

// 表格组件
const Table = ({ children, darkMode }) => (
  <div
    className={`my-4 overflow-x-auto rounded-lg border ${
      darkMode ? "border-gray-700" : "border-gray-200"
    }`}
  >
    <table className={`w-full ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      {children}
    </table>
  </div>
);

const TableHead = ({ children, darkMode }) => (
  <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
    {children}
  </thead>
);

const TableRow = ({ children, darkMode }) => (
  <tr
    className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}
  >
    {children}
  </tr>
);

const TableCell = ({ children, darkMode, isHeader }) => {
  const Tag = isHeader ? "th" : "td";
  return (
    <Tag
      className={`px-4 py-2 text-left ${
        isHeader
          ? darkMode
            ? "font-semibold text-gray-200"
            : "font-semibold text-gray-700"
          : darkMode
          ? "text-gray-300"
          : "text-gray-600"
      }`}
    >
      {children}
    </Tag>
  );
};

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
const List = ({ children, ordered, darkMode }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={`my-4 pl-6 space-y-1 ${
        ordered ? "list-decimal" : "list-disc"
      } ${darkMode ? "text-gray-300" : "text-gray-700"} ${
        darkMode ? "marker:text-gray-500" : "marker:text-gray-400"
      }`}
    >
      {children}
    </Tag>
  );
};

// 标题组件
const Heading = ({ level, children, darkMode }) => {
  const Tag = `h${level}`;
  const sizes = {
    1: "text-3xl font-bold mb-4 mt-6",
    2: "text-2xl font-bold mb-3 mt-5",
    3: "text-xl font-bold mb-3 mt-4",
    4: "text-lg font-bold mb-2 mt-3",
    5: "text-base font-bold mb-2 mt-3",
    6: "text-sm font-bold mb-2 mt-3",
  };

  return React.createElement(
    Tag,
    {
      className: `${sizes[level]} ${
        darkMode ? "text-gray-100" : "text-gray-800"
      } border-b ${
        level <= 2
          ? darkMode
            ? "border-gray-600"
            : "border-gray-300"
          : "border-transparent"
      } pb-2`,
    },
    children
  );
};

// 水平线组件
const HorizontalRule = ({ darkMode }) => (
  <hr
    className={`my-6 border-t-2 ${
      darkMode ? "border-gray-600" : "border-gray-300"
    }`}
  />
);

// 任务列表项组件
const TaskListItem = ({ children, checked, darkMode }) => (
  <li
    className={`flex items-start gap-2 my-1 ${
      darkMode ? "text-gray-300" : "text-gray-700"
    }`}
    style={{ listStyle: "none" }}
  >
    <input
      type="checkbox"
      checked={checked}
      readOnly
      className={`mt-1 rounded ${
        darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
      }`}
    />
    <span className={checked ? "line-through opacity-75" : ""}>{children}</span>
  </li>
);

// 主要的消息渲染器组件
const EnhancedMessageRenderer = ({ content, darkMode }) => {
  if (!content) return null;

  // 自定义组件映射
  const components = {
    // 代码块
    code({ node, inline, className, children, ...props }) {
      if (inline) {
        return <InlineCode darkMode={darkMode}>{children}</InlineCode>;
      }
      return (
        <CodeBlock className={className} darkMode={darkMode} {...props}>
          {children}
        </CodeBlock>
      );
    },

    // 链接
    a({ href, children }) {
      return (
        <Link href={href} darkMode={darkMode}>
          {children}
        </Link>
      );
    },

    // 表格
    table({ children }) {
      return <Table darkMode={darkMode}>{children}</Table>;
    },
    thead({ children }) {
      return <TableHead darkMode={darkMode}>{children}</TableHead>;
    },
    tbody({ children }) {
      return <tbody>{children}</tbody>;
    },
    tr({ children }) {
      return <TableRow darkMode={darkMode}>{children}</TableRow>;
    },
    th({ children }) {
      return (
        <TableCell darkMode={darkMode} isHeader>
          {children}
        </TableCell>
      );
    },
    td({ children }) {
      return <TableCell darkMode={darkMode}>{children}</TableCell>;
    },

    // 引用块
    blockquote({ children }) {
      return <Blockquote darkMode={darkMode}>{children}</Blockquote>;
    },

    // 列表
    ul({ children }) {
      return <List darkMode={darkMode}>{children}</List>;
    },
    ol({ children }) {
      return (
        <List ordered darkMode={darkMode}>
          {children}
        </List>
      );
    },

    // 标题
    h1({ children }) {
      return (
        <Heading level={1} darkMode={darkMode}>
          {children}
        </Heading>
      );
    },
    h2({ children }) {
      return (
        <Heading level={2} darkMode={darkMode}>
          {children}
        </Heading>
      );
    },
    h3({ children }) {
      return (
        <Heading level={3} darkMode={darkMode}>
          {children}
        </Heading>
      );
    },
    h4({ children }) {
      return (
        <Heading level={4} darkMode={darkMode}>
          {children}
        </Heading>
      );
    },
    h5({ children }) {
      return (
        <Heading level={5} darkMode={darkMode}>
          {children}
        </Heading>
      );
    },
    h6({ children }) {
      return (
        <Heading level={6} darkMode={darkMode}>
          {children}
        </Heading>
      );
    },

    // 水平线
    hr() {
      return <HorizontalRule darkMode={darkMode} />;
    },

    // 段落
    p({ children }) {
      return (
        <p
          className={`my-3 leading-relaxed ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {children}
        </p>
      );
    },

    // 强调
    strong({ children }) {
      return (
        <strong
          className={`font-bold ${
            darkMode ? "text-gray-100" : "text-gray-800"
          }`}
        >
          {children}
        </strong>
      );
    },

    // 斜体
    em({ children }) {
      return <em className="italic">{children}</em>;
    },

    // 删除线
    del({ children }) {
      return <del className="line-through opacity-75">{children}</del>;
    },

    // 任务列表项
    li({ children, className }) {
      // 检查是否是任务列表项
      if (className && className.includes("task-list-item")) {
        // 查找checkbox的checked状态
        const checkbox = React.Children.toArray(children).find(
          (child) => child.type === "input" && child.props.type === "checkbox"
        );
        const checked = checkbox ? checkbox.props.checked : false;

        return (
          <TaskListItem checked={checked} darkMode={darkMode}>
            {children}
          </TaskListItem>
        );
      }
      return (
        <li className={`my-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          {children}
        </li>
      );
    },
  };

  return (
    <div
      className={`enhanced-message-renderer prose prose-sm max-w-none ${
        darkMode ? "prose-invert" : ""
      }`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default EnhancedMessageRenderer;
