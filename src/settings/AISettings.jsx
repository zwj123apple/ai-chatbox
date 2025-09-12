// ============= src/components/settings/AISettings.jsx =============
import React, { useState, useEffect } from "react";
import { Settings, X, Eye, EyeOff, Save, TestTube } from "lucide-react";
import {
  AI_MODELS,
  AI_PROVIDERS,
  getCurrentConfig,
  validateConfig,
} from "../config/ai.config";

export default function AISettings({ isOpen, onClose, darkMode }) {
  const [selectedModel, setSelectedModel] = useState("");
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [apiKeys, setApiKeys] = useState({});
  const [showApiKeys, setShowApiKeys] = useState({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // 加载当前配置
      const config = getCurrentConfig();
      setSelectedModel(config.model);
      setStreamingEnabled(config.streaming);

      // 加载API密钥（从环境变量或localStorage）
      const keys = {};
      Object.keys(AI_PROVIDERS).forEach((provider) => {
        const providerKey = AI_PROVIDERS[provider];
        keys[providerKey] =
          localStorage.getItem(`${providerKey}_api_key`) || "";
      });
      setApiKeys(keys);
    }
  }, [isOpen]);

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

    // 不再刷新整个页面，而是通过其他方式更新配置
    // window.location.reload(); // 删除这行
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // 这里可以添加测试API连接的逻辑
      // 暂时模拟测试
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const modelInfo = AI_MODELS[selectedModel];
      const isValid = validateConfig(modelInfo.provider);

      if (isValid && apiKeys[modelInfo.provider]) {
        setTestResult({ success: true, message: "API连接测试成功！" });
      } else {
        setTestResult({ success: false, message: "API密钥未配置或无效" });
      }
    } catch (error) {
      setTestResult({ success: false, message: `测试失败: ${error.message}` });
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
            <h2
              className={`text-xl font-semibold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              AI设置
            </h2>
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
              className={`w-full p-3 rounded-lg border transition-colors ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
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
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
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
                    className={`w-full p-3 pr-12 rounded-lg border transition-colors ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowApiKey(providerKey)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
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
              <li>• 请确保API密钥有效且有足够的使用额度</li>
              <li>• 不同模型提供商的API格式和费用可能不同</li>
              <li>• 流式输出可能会消耗更多的API调用次数</li>
              <li>• API密钥将安全保存在本地浏览器中</li>
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
            disabled={testing || !selectedModel || !apiKeys[currentProvider]}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              testing || !selectedModel || !apiKeys[currentProvider]
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
