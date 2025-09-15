// ============= src/components/settings/AISettings.jsx (Updated for Backend) =============
import React, { useState, useEffect } from "react";
import {
  Settings,
  X,
  Eye,
  EyeOff,
  Save,
  TestTube,
  Wifi,
  WifiOff,
  Server,
} from "lucide-react";
import {
  AI_MODELS,
  AI_PROVIDERS,
  getCurrentConfig,
  validateConfig,
} from "../config/ai.config";
import { AIService } from "../services/ai.service";

export default function AISettings({ isOpen, onClose, darkMode }) {
  const [selectedModel, setSelectedModel] = useState("");
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [apiKeys, setApiKeys] = useState({});
  const [showApiKeys, setShowApiKeys] = useState({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [backendStatus, setBackendStatus] = useState({ status: "checking" });

  useEffect(() => {
    if (isOpen) {
      // 检查后端服务状态
      checkBackendStatus();

      // 加载当前配置
      const config = getCurrentConfig();
      setSelectedModel(config.model);
      setStreamingEnabled(config.streaming);

      // 加载API密钥（从localStorage）
      const keys = {};
      Object.keys(AI_PROVIDERS).forEach((provider) => {
        const providerKey = AI_PROVIDERS[provider];
        keys[providerKey] =
          localStorage.getItem(`${providerKey}_api_key`) || "";
      });
      setApiKeys(keys);
    }
  }, [isOpen]);

  const checkBackendStatus = async () => {
    setBackendStatus({ status: "checking" });
    const health = await AIService.checkBackendHealth();
    setBackendStatus(health);
  };

  const handleSave = () => {
    // 保存模型选择
    localStorage.setItem("selectedModel", selectedModel);
    localStorage.setItem("streamingEnabled", streamingEnabled.toString());

    // 保存API密钥
    Object.entries(apiKeys).forEach(([provider, key]) => {
      if (key.trim()) {
        localStorage.setItem(`${provider}_api_key`, key.trim());
      } else {
        localStorage.removeItem(`${provider}_api_key`);
      }
    });

    // 显示保存成功提示
    setTestResult({ success: true, message: "设置已保存成功！" });

    // 延迟关闭弹窗，让用户看到成功提示
    setTimeout(() => {
      onClose();
      setTestResult(null);
    }, 1500);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    const modelInfo = AI_MODELS[selectedModel];
    const apiKey = apiKeys[modelInfo.provider];

    if (!apiKey) {
      setTestResult({ success: false, message: "API密钥未配置" });
      setTesting(false);
      return;
    }

    try {
      const result = await AIService.testConnection(modelInfo.provider, apiKey);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: AIService.getErrorMessage(error),
      });
    } finally {
      setTesting(false);
    }
  };

  const toggleShowApiKey = (provider) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const updateApiKey = (provider, value) => {
    setApiKeys((prev) => ({
      ...prev,
      [provider]: value,
    }));
  };

  if (!isOpen) return null;

  const selectedModelInfo = AI_MODELS[selectedModel];
  const currentProvider = selectedModelInfo?.provider;

  // 后端状态指示器
  const BackendStatusIndicator = () => {
    const getStatusColor = () => {
      switch (backendStatus.status) {
        case "online":
          return "text-green-500";
        case "offline":
          return "text-red-500";
        case "error":
          return "text-yellow-500";
        default:
          return "text-gray-500";
      }
    };

    const getStatusIcon = () => {
      switch (backendStatus.status) {
        case "online":
          return <Wifi size={16} />;
        case "offline":
          return <WifiOff size={16} />;
        case "error":
          return <Server size={16} />;
        default:
          return <Server size={16} className="animate-spin" />;
      }
    };

    const getStatusText = () => {
      switch (backendStatus.status) {
        case "online":
          return "后端服务正常";
        case "offline":
          return "后端服务离线";
        case "error":
          return "后端服务异常";
        default:
          return "检查中...";
      }
    };

    return (
      <div className={`flex items-center gap-2 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm">{getStatusText()}</span>
        <button
          onClick={checkBackendStatus}
          className={`p-1 rounded transition-colors ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
          title="刷新状态"
        >
          <Server size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          } flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <Settings
              className={darkMode ? "text-blue-400" : "text-blue-500"}
              size={24}
            />
            <div>
              <h2
                className={`text-xl font-semibold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                AI设置
              </h2>
              <BackendStatusIndicator />
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* 后端服务状态警告 */}
          {backendStatus.status !== "online" && (
            <div
              className={`p-4 rounded-lg ${
                darkMode
                  ? "bg-red-900 border border-red-800"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div
                className={`font-medium mb-2 ${
                  darkMode ? "text-red-200" : "text-red-800"
                }`}
              >
                后端服务不可用
              </div>
              <div
                className={`text-sm ${
                  darkMode ? "text-red-300" : "text-red-700"
                }`}
              >
                {backendStatus.status === "offline"
                  ? "无法连接到后端服务，请确保后端服务器正在运行。"
                  : `后端服务异常：${backendStatus.error}`}
              </div>
              <div
                className={`text-xs mt-2 ${
                  darkMode ? "text-red-400" : "text-red-600"
                }`}
              >
                启动命令：npm run dev (在server目录下)
              </div>
            </div>
          )}

          {/* 模型选择 */}
          <div>
            <label
              className={`block text-sm font-medium mb-3 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              选择AI模型
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={backendStatus.status !== "online"}
              className={`w-full p-3 rounded-lg border transition-colors ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {Object.entries(AI_MODELS).map(([modelId, modelInfo]) => (
                <option key={modelId} value={modelId}>
                  {modelInfo.name} ({modelInfo.provider})
                </option>
              ))}
            </select>
          </div>

          {/* 流式输出设置 */}
          <div>
            <label
              className={`flex items-center gap-3 text-sm font-medium ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              <input
                type="checkbox"
                checked={streamingEnabled}
                onChange={(e) => setStreamingEnabled(e.target.checked)}
                disabled={backendStatus.status !== "online"}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              启用流式输出
            </label>
            <p
              className={`text-xs mt-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              启用后，AI回复将逐字显示，提供更好的交互体验
            </p>
          </div>

          {/* API密钥配置 */}
          <div>
            <h3
              className={`text-lg font-medium mb-4 ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              API密钥配置
            </h3>

            {Object.entries(AI_PROVIDERS).map(([providerName, providerKey]) => (
              <div key={providerKey} className="mb-4">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {providerName} API密钥
                  {currentProvider === providerKey && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      当前使用
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showApiKeys[providerKey] ? "text" : "password"}
                    value={apiKeys[providerKey] || ""}
                    onChange={(e) => updateApiKey(providerKey, e.target.value)}
                    placeholder={`输入${providerName} API密钥`}
                    disabled={backendStatus.status !== "online"}
                    className={`w-full p-3 pr-12 rounded-lg border transition-colors ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowApiKey(providerKey)}
                    disabled={backendStatus.status !== "online"}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-700"
                    } disabled:opacity-50`}
                  >
                    {showApiKeys[providerKey] ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 配置说明 */}
          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-gray-700" : "bg-blue-50"
            }`}
          >
            <h4
              className={`font-medium mb-2 ${
                darkMode ? "text-gray-200" : "text-blue-800"
              }`}
            >
              配置说明
            </h4>
            <ul
              className={`text-sm space-y-1 ${
                darkMode ? "text-gray-300" : "text-blue-700"
              }`}
            >
              <li>• 所有API请求通过后端服务器转发，支持代理配置</li>
              <li>• 请确保API密钥有效且有足够的使用额度</li>
              <li>• 后端服务器会自动处理不同提供商的API格式差异</li>
              <li>• API密钥安全保存在浏览器本地，不会上传到服务器</li>
            </ul>
          </div>

          {/* 测试结果 */}
          {testResult && (
            <div
              className={`p-4 rounded-lg ${
                testResult.success
                  ? darkMode
                    ? "bg-green-900 text-green-200"
                    : "bg-green-50 text-green-800"
                  : darkMode
                  ? "bg-red-900 text-red-200"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {testResult.message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t ${
            darkMode
              ? "border-gray-700 bg-gray-750"
              : "border-gray-200 bg-gray-50"
          } flex items-center justify-between`}
        >
          <button
            onClick={handleTest}
            disabled={
              testing ||
              !selectedModel ||
              !apiKeys[currentProvider] ||
              backendStatus.status !== "online"
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              testing ||
              !selectedModel ||
              !apiKeys[currentProvider] ||
              backendStatus.status !== "online"
                ? "bg-gray-400 text-gray-300 cursor-not-allowed"
                : darkMode
                ? "bg-gray-600 hover:bg-gray-500 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            <TestTube size={16} />
            {testing ? "测试中..." : "测试连接"}
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-colors ${
                darkMode
                  ? "bg-gray-600 hover:bg-gray-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Save size={16} />
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
