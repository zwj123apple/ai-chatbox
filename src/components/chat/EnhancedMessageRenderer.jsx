import React, { useState, useMemo } from "react";
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
import remarkBreaks from "remark-breaks";
import {
  Copy,
  Check,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import "katex/dist/katex.min.css";

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Markdown rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} />
            <span className="font-medium">渲染错误</span>
          </div>
          <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
            {this.props.fallbackContent || "内容渲染失败"}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// 代码块组件 - 增强版
const CodeBlock = ({ children, className, darkMode, ...props }) => {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const code = String(children).replace(/\n$/, "");
  const lines = code.split("\n");
  const shouldCollapse = lines.length > 20;

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
    try {
      const blob = new Blob([code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `code.${language || "txt"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("下载失败:", err);
    }
  };

  const displayCode = collapsed
    ? lines.slice(0, 10).join("\n") + "\n..."
    : code;

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
            {lines.length} 行
          </span>
          {code.length > 1000 && (
            <span
              className={`text-xs px-2 py-1 rounded ${
                darkMode
                  ? "bg-blue-700 text-blue-300"
                  : "bg-blue-200 text-blue-600"
              }`}
            >
              {(code.length / 1024).toFixed(1)}KB
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {shouldCollapse && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`p-1 rounded transition-colors text-xs px-2 ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
              }`}
              title={collapsed ? "展开" : "收起"}
            >
              {collapsed ? "展开" : "收起"}
            </button>
          )}

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
            {displayCode}
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
            {displayCode}
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
const Link = ({ href, children, darkMode }) => {
  const isInternal = href?.startsWith("#") || href?.startsWith("/");

  return (
    <a
      href={href}
      target={isInternal ? "_self" : "_blank"}
      rel={isInternal ? "" : "noopener noreferrer"}
      className={`inline-flex items-center gap-1 ${
        darkMode
          ? "text-blue-400 hover:text-blue-300"
          : "text-blue-600 hover:text-blue-500"
      } underline transition-colors break-words`}
    >
      {children}
      {!isInternal && <ExternalLink size={12} />}
    </a>
  );
};

// 图片组件
const Image = ({ src, alt, darkMode }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="my-4">
      <div
        className={`rounded-lg overflow-hidden border ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        {loading && (
          <div
            className={`animate-pulse h-48 ${
              darkMode ? "bg-gray-800" : "bg-gray-200"
            } flex items-center justify-center`}
          >
            <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
              加载中...
            </span>
          </div>
        )}
        {error ? (
          <div
            className={`h-48 ${
              darkMode
                ? "bg-gray-800 text-gray-400"
                : "bg-gray-200 text-gray-500"
            } flex items-center justify-center`}
          >
            <span>图片加载失败</span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt || "图片"}
            className={`max-w-full h-auto ${loading ? "hidden" : "block"}`}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        )}
      </div>
      {alt && !error && (
        <p
          className={`text-center text-sm mt-2 italic ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {alt}
        </p>
      )}
    </div>
  );
};

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
    className={`border-b ${
      darkMode
        ? "border-gray-700 hover:bg-gray-750"
        : "border-gray-200 hover:bg-gray-50"
    } transition-colors`}
  >
    {children}
  </tr>
);

const TableCell = ({ children, darkMode, isHeader, align = "left" }) => {
  const Tag = isHeader ? "th" : "td";
  const alignClass =
    {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }[align] || "text-left";

  return (
    <Tag
      className={`px-4 py-2 ${alignClass} ${
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
const List = ({ children, ordered, darkMode, start }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={`my-4 pl-6 space-y-1 ${
        ordered ? "list-decimal" : "list-disc"
      } ${darkMode ? "text-gray-300" : "text-gray-700"} ${
        darkMode ? "marker:text-gray-500" : "marker:text-gray-400"
      }`}
      start={start}
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

  // 生成锚点ID
  const id =
    typeof children === "string"
      ? children
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "")
      : "";

  return React.createElement(
    Tag,
    {
      id,
      className: `${sizes[level]} ${
        darkMode ? "text-gray-100" : "text-gray-800"
      } border-b ${
        level <= 2
          ? darkMode
            ? "border-gray-600"
            : "border-gray-300"
          : "border-transparent"
      } pb-2 scroll-mt-16`,
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
    style={{ listStyle: "none", marginLeft: "-1.5rem" }}
  >
    <input
      type="checkbox"
      checked={checked}
      readOnly
      className={`mt-1 rounded ${
        darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
      } cursor-default`}
    />
    <span className={checked ? "line-through opacity-75" : ""}>{children}</span>
  </li>
);

// 警告框组件
const Alert = ({ type = "info", children, darkMode }) => {
  const styles = {
    info: {
      bg: darkMode
        ? "bg-blue-900 border-blue-700"
        : "bg-blue-50 border-blue-200",
      text: darkMode ? "text-blue-300" : "text-blue-700",
      icon: <Info size={16} />,
    },
    warning: {
      bg: darkMode
        ? "bg-yellow-900 border-yellow-700"
        : "bg-yellow-50 border-yellow-200",
      text: darkMode ? "text-yellow-300" : "text-yellow-700",
      icon: <AlertCircle size={16} />,
    },
    success: {
      bg: darkMode
        ? "bg-green-900 border-green-700"
        : "bg-green-50 border-green-200",
      text: darkMode ? "text-green-300" : "text-green-700",
      icon: <CheckCircle size={16} />,
    },
    error: {
      bg: darkMode ? "bg-red-900 border-red-700" : "bg-red-50 border-red-200",
      text: darkMode ? "text-red-300" : "text-red-700",
      icon: <XCircle size={16} />,
    },
  };

  const style = styles[type] || styles.info;

  return (
    <div className={`my-4 p-4 border rounded-lg ${style.bg} ${style.text}`}>
      <div className="flex items-start gap-2">
        {style.icon}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

// 键盘按键组件
const Kbd = ({ children, darkMode }) => (
  <kbd
    className={`px-2 py-1 text-sm font-mono rounded border ${
      darkMode
        ? "bg-gray-800 border-gray-600 text-gray-300"
        : "bg-gray-100 border-gray-300 text-gray-700"
    } shadow-sm`}
  >
    {children}
  </kbd>
);

// 主要的消息渲染器组件
const EnhancedMessageRenderer = ({ content, darkMode }) => {
  // 内容预处理
  const processedContent = useMemo(() => {
    if (!content) return "";

    // 处理特殊的markdown语法
    let processed = content;

    // 处理警告框语法 :::warning 等
    processed = processed.replace(
      /:::(\w+)\s*\n([\s\S]*?)\n:::/g,
      (match, type, content) => {
        return `<div class="alert alert-${type}">\n\n${content.trim()}\n\n</div>`;
      }
    );

    // 处理键盘按键 [[Ctrl+C]]
    processed = processed.replace(
      /\[\[([^\]]+)\]\]/g,
      (match, key) => `<kbd>${key}</kbd>`
    );

    return processed;
  }, [content]);

  if (!processedContent) return null;

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

    // 图片
    img({ src, alt }) {
      return <Image src={src} alt={alt} darkMode={darkMode} />;
    },

    // 表格相关
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
    th({ children, align }) {
      return (
        <TableCell darkMode={darkMode} isHeader align={align}>
          {children}
        </TableCell>
      );
    },
    td({ children, align }) {
      return (
        <TableCell darkMode={darkMode} align={align}>
          {children}
        </TableCell>
      );
    },

    // 引用块
    blockquote({ children }) {
      return <Blockquote darkMode={darkMode}>{children}</Blockquote>;
    },

    // 列表
    ul({ children }) {
      return <List darkMode={darkMode}>{children}</List>;
    },
    ol({ children, start }) {
      return (
        <List ordered darkMode={darkMode} start={start}>
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

    // 段落 - 修复嵌套问题
    p({ children, node }) {
      // 检查是否包含块级元素
      const hasBlockElements = React.Children.toArray(children).some(
        (child) => {
          if (React.isValidElement(child)) {
            const type = child.type;
            // 检查原生块级元素
            if (typeof type === "string") {
              return [
                "div",
                "table",
                "ul",
                "ol",
                "blockquote",
                "pre",
                "hr",
                "form",
              ].includes(type);
            }
            // 检查自定义组件
            if (typeof type === "function") {
              const name = type.name || type.displayName || "";
              return ["CodeBlock", "Table", "List", "Alert"].includes(name);
            }
          }
          return false;
        }
      );

      // 检查节点类型
      const hasBlockChild = node?.children?.some((child) => {
        return (
          child.type === "element" &&
          ["div", "table", "ul", "ol", "blockquote", "pre", "hr"].includes(
            child.tagName
          )
        );
      });

      // 如果包含块级元素，使用div
      if (hasBlockElements || hasBlockChild) {
        return (
          <div
            className={`my-3 leading-relaxed ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {children}
          </div>
        );
      }

      // 否则使用p标签
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

    // 上标
    sup({ children }) {
      return <sup className="text-xs">{children}</sup>;
    },

    // 下标
    sub({ children }) {
      return <sub className="text-xs">{children}</sub>;
    },

    // 标记/高亮
    mark({ children }) {
      return (
        <mark
          className={`px-1 rounded ${
            darkMode
              ? "bg-yellow-700 text-yellow-100"
              : "bg-yellow-200 text-yellow-800"
          }`}
        >
          {children}
        </mark>
      );
    },

    // 任务列表项
    li({ children, className }) {
      // 检查是否是任务列表项
      if (className && className.includes("task-list-item")) {
        // 查找checkbox的checked状态
        const checkbox = React.Children.toArray(children).find(
          (child) =>
            React.isValidElement(child) &&
            child.type === "input" &&
            child.props.type === "checkbox"
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

    // 自定义div处理 - 用于警告框等
    div({ className, children }) {
      if (className?.includes("alert")) {
        const type =
          className
            .split(" ")
            .find((c) => c.startsWith("alert-"))
            ?.replace("alert-", "") || "info";
        return (
          <Alert type={type} darkMode={darkMode}>
            {children}
          </Alert>
        );
      }
      return <div className={className}>{children}</div>;
    },

    // 键盘按键
    kbd({ children }) {
      return <Kbd darkMode={darkMode}>{children}</Kbd>;
    },

    // 详情/摘要元素
    details({ children }) {
      return (
        <details
          className={`my-4 p-4 border rounded-lg ${
            darkMode
              ? "border-gray-600 bg-gray-800"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          {children}
        </details>
      );
    },

    summary({ children }) {
      return (
        <summary
          className={`cursor-pointer font-medium ${
            darkMode
              ? "text-gray-200 hover:text-gray-100"
              : "text-gray-700 hover:text-gray-800"
          } transition-colors`}
        >
          {children}
        </summary>
      );
    },
  };

  return (
    <ErrorBoundary fallbackContent={content}>
      <div
        className={`enhanced-message-renderer prose prose-sm max-w-none ${
          darkMode ? "prose-invert" : ""
        }`}
        style={{
          // 确保数学公式正确显示
          lineHeight: "1.6",
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={components}
          skipHtml={false}
          urlTransform={(url) => {
            // 安全的URL转换
            if (url.startsWith("javascript:") || url.startsWith("data:")) {
              return "#";
            }
            return url;
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    </ErrorBoundary>
  );
};

export default EnhancedMessageRenderer;
