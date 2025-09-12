// ============= src/components/sidebar/Sidebar.jsx (Fixed) =============
import React, { useState, useEffect } from "react";
import { Plus, MessageSquare, LogOut, Settings, Sun, Moon } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { StorageService } from "../../services/storage.service";
import { getCurrentConfig, onConfigUpdate } from "../../config/ai.config";
import ConversationItem from "./ConversationItem";
import AISettings from "../../settings/AISettings";

export default function Sidebar({ darkMode, onToggleDarkMode }) {
  const { currentUser, userData, updateUserData, logout } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [aiConfig, setAiConfig] = useState(() => getCurrentConfig());

  // 监听配置更新
  useEffect(() => {
    const updateConfig = () => {
      setAiConfig(getCurrentConfig());
    };

    // 监听 localStorage 变化
    const handleStorageChange = () => {
      updateConfig();
    };

    window.addEventListener("storage", handleStorageChange);

    // 设置定时器定期更新配置（防止某些情况下 storage 事件不触发）
    const intervalId = setInterval(updateConfig, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // 当设置面板关闭时，更新配置
  const handleSettingsClose = () => {
    setShowSettings(false);
    // 延迟更新配置，确保 localStorage 已经更新
    setTimeout(() => {
      setAiConfig(getCurrentConfig());
    }, 100);
  };

  const createNewConversation = () => {
    const newConv = StorageService.createConversation(currentUser.id);
    const newData = StorageService.getUserData(currentUser.id);
    updateUserData(newData);
  };

  const switchConversation = (convId) => {
    const newData = { ...userData };
    newData.activeConversationId = convId;
    updateUserData(newData);
  };

  const deleteConversation = (convId) => {
    StorageService.deleteConversation(currentUser.id, convId);
    const newData = StorageService.getUserData(currentUser.id);
    updateUserData(newData);
  };

  const conversationsWithStats =
    userData?.conversations
      .map((conv) => ({
        ...conv,
        messageCount: conv.messages.length,
      }))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) || [];

  // 检查API密钥是否已配置
  const hasApiKey = Boolean(aiConfig.config?.apiKey);

  return (
    <>
      <div
        className={`${
          userData?.settings.sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-r flex flex-col overflow-hidden`}
      >
        {/* User Info */}
        <div
          className={`p-4 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {currentUser?.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {currentUser?.username}
              </div>
              <div
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {currentUser?.email}
              </div>
            </div>
            <button
              onClick={logout}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-red-400"
                  : "hover:bg-gray-100 text-gray-500 hover:text-red-500"
              }`}
              title="退出登录"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* AI模型状态 */}
          <div
            className={`mb-4 p-3 rounded-lg ${
              darkMode ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                当前模型
              </span>
              <div
                className={`flex items-center gap-1 ${
                  hasApiKey ? "text-green-500" : "text-red-500"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-current" />
                <span className="text-xs">
                  {hasApiKey ? "已配置" : "未配置"}
                </span>
              </div>
            </div>
            <div
              className={`text-sm truncate ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
              title={aiConfig.modelInfo?.name || "未知模型"}
            >
              {aiConfig.modelInfo?.name || "未知模型"}
            </div>
            <div
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {aiConfig.streaming ? "流式输出" : "标准输出"} •{" "}
              {aiConfig.provider || "unknown"}
            </div>
          </div>

          <button
            onClick={createNewConversation}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-105 ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
            }`}
          >
            <Plus size={20} />
            <span className="font-medium">新建对话</span>
          </button>
        </div>

        {/* Conversations Header */}
        <div
          className={`px-4 py-3 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h3
            className={`text-sm font-medium ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            历史对话 ({conversationsWithStats.length})
          </h3>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversationsWithStats.length === 0 ? (
            <div
              className={`text-center py-8 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>还没有对话记录</p>
              <p className="text-sm mt-1">创建新对话开始聊天吧！</p>
            </div>
          ) : (
            conversationsWithStats.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === userData.activeConversationId}
                onClick={() => switchConversation(conv.id)}
                onDelete={deleteConversation}
                darkMode={darkMode}
              />
            ))
          )}
        </div>

        {/* Settings */}
        <div
          className={`p-4 border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-yellow-400"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
              title={darkMode ? "切换到浅色模式" : "切换到深色模式"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
              title="AI设置"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* 状态提示 */}
          {!hasApiKey ? (
            <div
              className={`mt-3 p-2 rounded-lg text-xs text-center ${
                darkMode
                  ? "bg-red-900 text-red-200 border border-red-800"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              ⚠️ 请配置API密钥以使用AI功能
            </div>
          ) : (
            <div
              className={`mt-3 p-2 rounded-lg text-xs text-center ${
                darkMode
                  ? "bg-green-900 text-green-200 border border-green-800"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              ✅ AI功能已就绪，开始对话吧！
            </div>
          )}
        </div>
      </div>

      {/* AI Settings Modal */}
      <AISettings
        isOpen={showSettings}
        onClose={handleSettingsClose}
        darkMode={darkMode}
      />
    </>
  );
}
