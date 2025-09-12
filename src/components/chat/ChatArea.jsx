// ============= src/components/chat/ChatArea.jsx (Updated with Streaming) =============
import React, { useState, useRef, useEffect } from "react";
import { Menu, MessageSquare, Settings } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { StorageService } from "../../services/storage.service";
import { AIService } from "../../services/ai.service";
import StreamingMessageBubble from "./StreamingMessageBubble";
import MessageInput from "./MessageInput";

export default function ChatArea({ darkMode }) {
  const { currentUser, userData, updateUserData } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [currentStreamingContent, setCurrentStreamingContent] = useState("");
  const messagesEndRef = useRef(null);

  const activeConversation = userData?.conversations.find(
    (c) => c.id === userData.activeConversationId
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, currentStreamingContent]);

  const handleSendMessage = async (content) => {
    if (!activeConversation || !currentUser) return;

    // 添加用户消息
    const userMessage = { type: "user", content };
    StorageService.addMessage(
      currentUser.id,
      activeConversation.id,
      userMessage
    );
    let newData = StorageService.getUserData(currentUser.id);
    updateUserData(newData);

    setIsLoading(true);
    setCurrentStreamingContent("");

    // 创建临时的AI消息用于流式显示
    const tempAiMessage = {
      id: `streaming_${Date.now()}`,
      type: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };
    setStreamingMessage(tempAiMessage);

    // 准备对话历史
    const messages = activeConversation.messages.map((msg) => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    // 添加系统提示（可选）
    const systemMessage = {
      role: "system",
      content: "你是一个有帮助的AI助手，请用中文回答用户的问题。",
    };
    const fullMessages = [systemMessage, ...messages];

    // 调用AI服务
    await AIService.sendMessage(
      fullMessages,
      // onChunk - 处理流式数据块
      (chunk, fullContent) => {
        setCurrentStreamingContent(fullContent);
        setStreamingMessage((prev) => ({
          ...prev,
          content: fullContent,
        }));
      },
      // onComplete - 完成回调
      (finalContent) => {
        setIsLoading(false);
        setStreamingMessage(null);
        setCurrentStreamingContent("");

        // 保存最终的AI回复
        const aiMessage = {
          type: "assistant",
          content: finalContent || "抱歉，我现在无法回答您的问题。",
        };

        StorageService.addMessage(
          currentUser.id,
          activeConversation.id,
          aiMessage
        );
        const updatedData = StorageService.getUserData(currentUser.id);
        updateUserData(updatedData);
      },
      // onError - 错误处理
      (error) => {
        setIsLoading(false);
        setStreamingMessage(null);
        setCurrentStreamingContent("");

        console.error("AI API调用失败:", error);

        // 添加错误消息
        const errorMessage = {
          type: "assistant",
          content: `抱歉，发生了错误：${error.message}\n\n请检查您的网络连接和API配置。`,
          error: true,
        };

        StorageService.addMessage(
          currentUser.id,
          activeConversation.id,
          errorMessage
        );
        const updatedData = StorageService.getUserData(currentUser.id);
        updateUserData(updatedData);
      }
    );
  };

  const toggleSidebar = () => {
    const newData = { ...userData };
    newData.settings.sidebarOpen = !newData.settings.sidebarOpen;
    updateUserData(newData);
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div
          className={`text-center ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <MessageSquare size={64} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">没有活动的对话</h3>
          <p>请创建一个新对话开始聊天</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-b px-6 py-4 flex items-center gap-4`}
      >
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg transition-colors ${
            darkMode
              ? "hover:bg-gray-700 text-gray-300"
              : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <Menu size={20} />
        </button>

        <div className="flex-1">
          <h1
            className={`text-xl font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {activeConversation.title}
          </h1>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {activeConversation.messages.length} 条消息 • 更新于{" "}
            {activeConversation.updatedAt.toLocaleDateString()}
          </p>
        </div>

        {/* AI状态指示器 */}
        <div className="flex items-center gap-2">
          {isLoading && (
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                darkMode
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  darkMode ? "bg-green-400" : "bg-green-500"
                }`}
              />
              <span className="text-sm">AI思考中...</span>
            </div>
          )}

          <div
            className={`text-right text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <div>创建时间</div>
            <div>{activeConversation.createdAt.toLocaleDateString()}</div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {/* 历史消息 */}
          {activeConversation.messages.map((message) => (
            <StreamingMessageBubble
              key={message.id}
              message={message}
              darkMode={darkMode}
              isStreaming={false}
            />
          ))}

          {/* 流式消息 */}
          {streamingMessage && (
            <StreamingMessageBubble
              key={streamingMessage.id}
              message={streamingMessage}
              darkMode={darkMode}
              isStreaming={true}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        darkMode={darkMode}
      />
    </div>
  );
}
