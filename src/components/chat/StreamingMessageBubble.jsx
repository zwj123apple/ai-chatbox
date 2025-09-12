// ============= src/components/chat/StreamingMessageBubble.jsx =============
import React, { useState, useEffect } from "react";
import { User, Bot, Copy, Check } from "lucide-react";

export default function StreamingMessageBubble({
  message,
  darkMode,
  isStreaming = false,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const isUser = message.type === "user";
  const content = message.content || "";

  // 流式显示效果（仅在流式输出时使用）
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
      }, 20); // 调整速度，数值越小越快

      return () => clearInterval(timer);
    } else {
      setDisplayText(content);
    }
  }, [content, isStreaming, isUser]);

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

  return (
    <div
      className={`flex items-start gap-4 mb-6 group ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* 头像 */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-blue-500 text-white"
            : darkMode
            ? "bg-green-600 text-white"
            : "bg-green-500 text-white"
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className={`max-w-[80%] ${isUser ? "text-right" : ""}`}>
        {/* 消息内容 */}
        <div
          className={`relative inline-block p-4 rounded-2xl ${
            isUser
              ? darkMode
                ? "bg-blue-600 text-white"
                : "bg-blue-500 text-white"
              : darkMode
              ? "bg-gray-700 text-gray-100 border border-gray-600"
              : "bg-white text-gray-800 border border-gray-200 shadow-sm"
          }`}
        >
          {/* 消息文本 */}
          <div className="whitespace-pre-wrap leading-relaxed">
            {displayText}
            {/* 流式输出时的光标 */}
            {isStreaming && !isUser && currentIndex < content.length && (
              <span
                className={`inline-block w-0.5 h-5 ml-1 animate-pulse ${
                  darkMode ? "bg-gray-300" : "bg-gray-600"
                }`}
              />
            )}
          </div>

          {/* 复制按钮 */}
          {!isUser && displayText && (
            <button
              onClick={() => handleCopy(displayText, message.id)}
              className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                darkMode
                  ? "hover:bg-gray-600 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
              title="复制消息"
            >
              {copiedId === message.id ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          )}
        </div>

        {/* 时间戳和状态 */}
        <div
          className={`text-xs mt-2 flex items-center gap-2 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          } ${isUser ? "justify-end" : ""}`}
        >
          <span>
            {message.timestamp ? message.timestamp.toLocaleString() : ""}
          </span>

          {/* 流式输出状态指示器 */}
          {isStreaming && !isUser && (
            <div className="flex items-center gap-1">
              <div
                className={`w-1 h-1 rounded-full animate-pulse ${
                  darkMode ? "bg-green-400" : "bg-green-500"
                }`}
              />
              <span
                className={`text-xs ${
                  darkMode ? "text-green-400" : "text-green-500"
                }`}
              >
                正在输入...
              </span>
            </div>
          )}

          {/* 错误状态 */}
          {message.error && (
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-red-500" />
              <span className="text-xs text-red-500">发送失败</span>
            </div>
          )}

          {/* 消息长度指示器（调试用） */}
          {!isUser && displayText && process.env.NODE_ENV === "development" && (
            <span
              className={`text-xs ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {displayText.length} 字符
            </span>
          )}
        </div>

        {/* 消息操作按钮区域 */}
        {!isUser && displayText && (
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* 重新生成按钮 */}
            <button
              className={`text-xs px-2 py-1 rounded transition-colors ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
              title="重新生成回答"
            >
              重新生成
            </button>

            {/* 点赞按钮 */}
            <button
              className={`text-xs px-2 py-1 rounded transition-colors ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
              title="这个回答很有用"
            >
              👍
            </button>

            {/* 点踩按钮 */}
            <button
              className={`text-xs px-2 py-1 rounded transition-colors ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
              title="这个回答不够好"
            >
              👎
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
