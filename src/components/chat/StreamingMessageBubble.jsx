// ============= src/components/chat/StreamingMessageBubble.jsx (Complete Enhanced Version) =============
import React, { useState, useEffect } from "react";
import {
  User,
  Bot,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Download,
  Share2,
  Bookmark,
} from "lucide-react";
import EnhancedMessageRenderer from "./EnhancedMessageRenderer";

export default function StreamingMessageBubble({
  message,
  darkMode,
  isStreaming = false,
  onRegenerate,
  onFeedback,
  onShare,
  onBookmark,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const isUser = message.type === "user";
  const content = message.content || "";

  // 流式显示效果
  useEffect(() => {
    if (isStreaming && !isUser && content) {
      setDisplayText("");
      setCurrentIndex(0);

      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= content.length) {
            clearInterval(timer);
            return prev;
          }
          setDisplayText(content.slice(0, prev + 1));
          return prev + 1;
        });
      }, 15); // 更快的打字速度

      return () => clearInterval(timer);
    } else {
      setDisplayText(content);
    }
  }, [content, isStreaming, isUser]);

  // 复制功能
  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("复制失败:", err);
      // 备用复制方法
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err2) {
        console.error("备用复制方法也失败:", err2);
      }
      document.body.removeChild(textArea);
    }
  };

  // 导出功能
  const handleExport = (format = "txt") => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    let content = displayText;
    let mimeType = "text/plain";
    let extension = "txt";

    switch (format) {
      case "md":
        content = `# AI回复 - ${new Date().toLocaleString()}\n\n${displayText}`;
        mimeType = "text/markdown";
        extension = "md";
        break;
      case "json":
        content = JSON.stringify(
          {
            id: message.id,
            type: message.type,
            content: displayText,
            timestamp: message.timestamp,
            metadata: {
              exported: new Date().toISOString(),
              wordCount: displayText.split(/\s+/).filter((w) => w.length > 0)
                .length,
              charCount: displayText.length,
            },
          },
          null,
          2
        );
        mimeType = "application/json";
        extension = "json";
        break;
      case "html":
        content = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>AI回复 - ${new Date().toLocaleString()}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            margin: 40px; 
            line-height: 1.6; 
            color: #333;
        }
        .message { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid #e9ecef;
        }
        pre { 
            background: #1e1e1e; 
            color: #f8f8f2; 
            padding: 16px; 
            border-radius: 6px; 
            overflow-x: auto; 
            font-family: 'Monaco', 'Menlo', monospace;
        }
        code { 
            background: #f1f3f4; 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-family: 'Monaco', 'Menlo', monospace;
        }
        blockquote {
            border-left: 4px solid #007acc;
            background: #f0f8ff;
            padding: 16px;
            margin: 16px 0;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <h1>AI回复</h1>
    <div class="message">
        <div>${displayText.replace(/\n/g, "<br>")}</div>
    </div>
    <p><small>导出时间: ${new Date().toLocaleString()}</small></p>
</body>
</html>`;
        mimeType = "text/html";
        extension = "html";
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-message-${timestamp}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 反馈功能
  const handleFeedback = (type) => {
    setFeedback(feedback === type ? null : type);
    if (onFeedback) {
      onFeedback(message.id, type);
    }
  };

  // 书签功能
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (onBookmark) {
      onBookmark(message.id, !isBookmarked);
    }
  };

  // 分享功能
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI回复分享",
          text:
            displayText.substring(0, 200) +
            (displayText.length > 200 ? "..." : ""),
          url: window.location.href,
        });
      } catch (err) {
        console.log("分享已取消");
      }
    } else {
      // 备用分享方案 - 复制到剪贴板
      await handleCopy(
        `AI回复分享:\n\n${displayText}\n\n来源: ${window.location.href}`,
        `share-${message.id}`
      );
    }

    if (onShare) {
      onShare(message.id);
    }
  };

  // 统计信息
  const stats = {
    characters: displayText.length,
    words: displayText.split(/\s+/).filter((word) => word.length > 0).length,
    lines: displayText.split("\n").length,
    codeBlocks: (displayText.match(/```[\s\S]*?```/g) || []).length,
    links: (displayText.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length,
  };

  return (
    <div
      className={`flex items-start gap-4 mb-6 group ${
        isUser ? "flex-row-reverse" : ""
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 头像 */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative ${
          isUser
            ? "bg-blue-500 text-white"
            : darkMode
            ? "bg-green-600 text-white"
            : "bg-green-500 text-white"
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}

        {/* 流式状态指示器 */}
        {isStreaming && !isUser && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
        )}
      </div>

      <div className={`max-w-[85%] min-w-0 ${isUser ? "text-right" : ""}`}>
        {/* 消息内容 */}
        <div
          className={`relative inline-block p-4 rounded-2xl ${
            isUser
              ? darkMode
                ? "bg-blue-600 text-white"
                : "bg-blue-500 text-white"
              : darkMode
              ? "bg-gray-800 text-gray-100 border border-gray-700"
              : "bg-white text-gray-800 border border-gray-200 shadow-sm"
          }`}
        >
          {/* 消息文本 */}
          <div className="leading-relaxed">
            {isUser ? (
              // 用户消息保持简单文本显示
              <div className="whitespace-pre-wrap break-words">
                {displayText}
              </div>
            ) : (
              // AI消息使用增强渲染器
              <div className="prose prose-sm max-w-none">
                <EnhancedMessageRenderer
                  content={displayText}
                  darkMode={darkMode}
                />
              </div>
            )}

            {/* 流式输出时的光标 */}
            {isStreaming && !isUser && currentIndex < content.length && (
              <span
                className={`inline-block w-0.5 h-5 ml-1 animate-pulse ${
                  darkMode ? "bg-green-400" : "bg-green-600"
                }`}
              />
            )}
          </div>

          {/* 快速复制按钮 */}
          {!isUser && displayText && (
            <button
              onClick={() => handleCopy(displayText, message.id)}
              className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white bg-gray-800/80"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700 bg-white/80"
              } backdrop-blur-sm`}
              title="快速复制"
            >
              {copiedId === message.id ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          )}
        </div>

        {/* 消息统计和状态 */}
        <div
          className={`text-xs mt-2 flex items-center gap-2 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          } ${isUser ? "justify-end flex-row-reverse" : ""}`}
        >
          {/* 时间戳 */}
          <span>
            {message.timestamp ? message.timestamp.toLocaleString() : ""}
          </span>

          {/* AI消息统计 */}
          {!isUser && displayText && (
            <>
              <span>•</span>
              <span
                title={`${stats.characters} 字符, ${stats.words} 词, ${stats.lines} 行`}
              >
                {stats.words} 词
              </span>
              {stats.codeBlocks > 0 && (
                <>
                  <span>•</span>
                  <span title="代码块数量">{stats.codeBlocks} 代码块</span>
                </>
              )}
              {stats.links > 0 && (
                <>
                  <span>•</span>
                  <span title="链接数量">{stats.links} 链接</span>
                </>
              )}
            </>
          )}

          {/* 流式状态 */}
          {isStreaming && !isUser && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <div
                  className={`w-1 h-1 rounded-full animate-pulse ${
                    darkMode ? "bg-green-400" : "bg-green-500"
                  }`}
                />
                <span
                  className={`${
                    darkMode ? "text-green-400" : "text-green-500"
                  }`}
                >
                  生成中...
                </span>
              </div>
            </>
          )}

          {/* 错误状态 */}
          {message.error && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-red-500" />
                <span className="text-red-500">发送失败</span>
              </div>
            </>
          )}
        </div>

        {/* 消息操作按钮 */}
        {!isUser && displayText && !isStreaming && (
          <div
            className={`flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity ${
              isUser ? "justify-end" : ""
            }`}
          >
            {/* 反馈按钮 */}
            <button
              onClick={() => handleFeedback("like")}
              className={`p-1.5 rounded transition-colors ${
                feedback === "like"
                  ? "text-green-500 bg-green-100 dark:bg-green-900"
                  : darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-green-400"
                  : "hover:bg-gray-100 text-gray-500 hover:text-green-600"
              }`}
              title="有用"
            >
              <ThumbsUp size={14} />
            </button>

            <button
              onClick={() => handleFeedback("dislike")}
              className={`p-1.5 rounded transition-colors ${
                feedback === "dislike"
                  ? "text-red-500 bg-red-100 dark:bg-red-900"
                  : darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-red-400"
                  : "hover:bg-gray-100 text-gray-500 hover:text-red-600"
              }`}
              title="不够好"
            >
              <ThumbsDown size={14} />
            </button>

            {/* 分隔线 */}
            <div
              className={`w-px h-4 ${darkMode ? "bg-gray-600" : "bg-gray-300"}`}
            />

            {/* 书签按钮 */}
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded transition-colors ${
                isBookmarked
                  ? "text-yellow-500 bg-yellow-100 dark:bg-yellow-900"
                  : darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-yellow-400"
                  : "hover:bg-gray-100 text-gray-500 hover:text-yellow-600"
              }`}
              title={isBookmarked ? "取消收藏" : "收藏"}
            >
              <Bookmark
                size={14}
                fill={isBookmarked ? "currentColor" : "none"}
              />
            </button>

            {/* 分享按钮 */}
            <button
              onClick={handleShare}
              className={`p-1.5 rounded transition-colors ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
              title="分享"
            >
              <Share2 size={14} />
            </button>

            {/* 分隔线 */}
            <div
              className={`w-px h-4 ${darkMode ? "bg-gray-600" : "bg-gray-300"}`}
            />

            {/* 重新生成按钮 */}
            {onRegenerate && (
              <button
                onClick={() => onRegenerate(message.id)}
                className={`p-1.5 rounded transition-colors ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-400 hover:text-blue-400"
                    : "hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                }`}
                title="重新生成"
              >
                <RotateCcw size={14} />
              </button>
            )}

            {/* 导出菜单 */}
            <ExportDropdown
              onExport={handleExport}
              darkMode={darkMode}
              stats={stats}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// 导出下拉菜单组件
const ExportDropdown = ({ onExport, darkMode, stats }) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportOptions = [
    {
      format: "txt",
      label: "纯文本 (.txt)",
      icon: "📄",
      description: "无格式纯文本",
    },
    {
      format: "md",
      label: "Markdown (.md)",
      icon: "📝",
      description: "保留所有格式",
    },
    {
      format: "html",
      label: "HTML (.html)",
      icon: "🌐",
      description: "网页格式",
    },
    {
      format: "json",
      label: "JSON (.json)",
      icon: "📊",
      description: "包含元数据",
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded transition-colors ${
          darkMode
            ? "hover:bg-gray-700 text-gray-400 hover:text-white"
            : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
        }`}
        title="导出选项"
      >
        <Download size={14} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute right-0 top-full mt-1 z-20 min-w-64 rounded-lg border shadow-lg ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {/* 菜单头部 */}
            <div
              className={`p-3 border-b ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                导出消息
              </div>
              <div
                className={`text-xs mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {stats.words} 词 • {stats.characters} 字符 • {stats.lines} 行
              </div>
            </div>

            {/* 导出选项 */}
            <div className="py-1">
              {exportOptions.map((option) => (
                <button
                  key={option.format}
                  onClick={() => {
                    onExport(option.format);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                      : "hover:bg-gray-50 text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <span className="text-lg">{option.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{option.label}</div>
                    <div
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {option.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {/* 菜单底部 */}
            <div
              className={`p-2 border-t text-center ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                导出内容包含完整格式和样式
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
