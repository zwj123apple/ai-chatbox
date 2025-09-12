// ============= src/config/ai.config.js (Updated) =============
// AI模型配置文件 - 支持多种大模型提供商

export const AI_PROVIDERS = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GEMINI: "gemini",
  ZHIPU: "zhipu",
  QWEN: "qwen",
  BAIDU: "baidu",
  CUSTOM: "custom",
};

export const AI_MODELS = {
  // OpenAI
  "gpt-4": { provider: AI_PROVIDERS.OPENAI, name: "GPT-4" },
  "gpt-4-turbo": { provider: AI_PROVIDERS.OPENAI, name: "GPT-4 Turbo" },
  "gpt-3.5-turbo": { provider: AI_PROVIDERS.OPENAI, name: "GPT-3.5 Turbo" },

  // Anthropic
  "claude-3-opus": { provider: AI_PROVIDERS.ANTHROPIC, name: "Claude 3 Opus" },
  "claude-3-sonnet": {
    provider: AI_PROVIDERS.ANTHROPIC,
    name: "Claude 3 Sonnet",
  },
  "claude-3-haiku": {
    provider: AI_PROVIDERS.ANTHROPIC,
    name: "Claude 3 Haiku",
  },

  // Google Gemini
  "gemini-pro": { provider: AI_PROVIDERS.GEMINI, name: "Gemini Pro" },
  "gemini-pro-vision": {
    provider: AI_PROVIDERS.GEMINI,
    name: "Gemini Pro Vision",
  },

  // 智谱AI
  "glm-4": { provider: AI_PROVIDERS.ZHIPU, name: "智谱GLM-4" },
  "glm-3-turbo": { provider: AI_PROVIDERS.ZHIPU, name: "智谱GLM-3 Turbo" },

  // 阿里通义千问
  "qwen-turbo": { provider: AI_PROVIDERS.QWEN, name: "通义千问 Turbo" },
  "qwen-plus": { provider: AI_PROVIDERS.QWEN, name: "通义千问 Plus" },
  "qwen-max": { provider: AI_PROVIDERS.QWEN, name: "通义千问 Max" },

  // 百度文心一言
  "ernie-bot": { provider: AI_PROVIDERS.BAIDU, name: "文心一言" },
  "ernie-bot-turbo": { provider: AI_PROVIDERS.BAIDU, name: "文心一言 Turbo" },
};

export const DEFAULT_CONFIG = {
  // 默认使用的模型
  defaultModel: "gpt-3.5-turbo",

  // 流式输出配置
  streaming: true,

  // 请求超时时间（毫秒）
  timeout: 30000,

  // 最大重试次数
  maxRetries: 3,

  // 默认参数
  defaultParams: {
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  },
};

// 各个提供商的API配置
export const PROVIDER_CONFIGS = {
  [AI_PROVIDERS.OPENAI]: {
    baseURL:
      import.meta.env.VITE_OPENAI_BASE_URL || "https://api.openai.com/v1",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer {API_KEY}",
    },
    chatEndpoint: "/chat/completions",
    streamingSupported: true,
  },

  [AI_PROVIDERS.ANTHROPIC]: {
    baseURL:
      import.meta.env.VITE_ANTHROPIC_BASE_URL || "https://api.anthropic.com",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "{API_KEY}",
      "anthropic-version": "2023-06-01",
    },
    chatEndpoint: "/v1/messages",
    streamingSupported: true,
  },

  [AI_PROVIDERS.GEMINI]: {
    baseURL:
      import.meta.env.VITE_GEMINI_BASE_URL ||
      "https://generativelanguage.googleapis.com/v1beta",
    headers: {
      "Content-Type": "application/json",
    },
    chatEndpoint: "/models/{model}:streamGenerateContent?key={API_KEY}",
    streamingSupported: true,
  },

  [AI_PROVIDERS.ZHIPU]: {
    baseURL:
      import.meta.env.VITE_ZHIPU_BASE_URL ||
      "https://open.bigmodel.cn/api/paas/v4",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer {API_KEY}",
    },
    chatEndpoint: "/chat/completions",
    streamingSupported: true,
  },

  [AI_PROVIDERS.QWEN]: {
    baseURL:
      import.meta.env.VITE_QWEN_BASE_URL ||
      "https://dashscope.aliyuncs.com/api/v1",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer {API_KEY}",
      "X-DashScope-SSE": "enable",
    },
    chatEndpoint: "/services/aigc/text-generation/generation",
    streamingSupported: true,
  },

  [AI_PROVIDERS.BAIDU]: {
    baseURL: import.meta.env.VITE_BAIDU_BASE_URL || "https://aip.baidubce.com",
    headers: {
      "Content-Type": "application/json",
    },
    chatEndpoint: "/rpc/2.0/ai/v1/chat/eb-instant",
    streamingSupported: true,
    requiresAccessToken: true,
  },

  [AI_PROVIDERS.CUSTOM]: {
    baseURL: import.meta.env.VITE_CUSTOM_BASE_URL || "",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer {API_KEY}",
    },
    chatEndpoint:
      import.meta.env.VITE_CUSTOM_CHAT_ENDPOINT || "/chat/completions",
    streamingSupported: true,
  },
};

// 获取当前配置 - 优先从 localStorage 读取
export const getCurrentConfig = () => {
  const currentModel =
    localStorage.getItem("selectedModel") || DEFAULT_CONFIG.defaultModel;
  const modelInfo = AI_MODELS[currentModel];

  if (!modelInfo) {
    console.warn(`未找到模型配置: ${currentModel}，使用默认模型`);
    return {
      model: DEFAULT_CONFIG.defaultModel,
      modelInfo: AI_MODELS[DEFAULT_CONFIG.defaultModel],
      provider: AI_MODELS[DEFAULT_CONFIG.defaultModel].provider,
      config: {
        ...PROVIDER_CONFIGS[AI_MODELS[DEFAULT_CONFIG.defaultModel].provider],
        apiKey: getApiKey(AI_MODELS[DEFAULT_CONFIG.defaultModel].provider),
      },
      streaming: getStreamingEnabled(),
    };
  }

  const providerConfig = PROVIDER_CONFIGS[modelInfo.provider];

  return {
    model: currentModel,
    modelInfo,
    provider: modelInfo.provider,
    config: {
      ...providerConfig,
      apiKey: getApiKey(modelInfo.provider),
    },
    streaming: getStreamingEnabled(),
  };
};

// 获取API密钥 - 优先从 localStorage，然后是环境变量
export const getApiKey = (provider) => {
  const localKey = localStorage.getItem(`${provider}_api_key`);
  if (localKey) return localKey;

  // 从环境变量获取
  switch (provider) {
    case AI_PROVIDERS.OPENAI:
      return import.meta.env.VITE_OPENAI_API_KEY || "";
    case AI_PROVIDERS.ANTHROPIC:
      return import.meta.env.VITE_ANTHROPIC_API_KEY || "";
    case AI_PROVIDERS.GEMINI:
      return import.meta.env.VITE_GEMINI_API_KEY || "";
    case AI_PROVIDERS.ZHIPU:
      return import.meta.env.VITE_ZHIPU_API_KEY || "";
    case AI_PROVIDERS.QWEN:
      return import.meta.env.VITE_QWEN_API_KEY || "";
    case AI_PROVIDERS.BAIDU:
      return import.meta.env.VITE_BAIDU_API_KEY || "";
    case AI_PROVIDERS.CUSTOM:
      return import.meta.env.VITE_CUSTOM_API_KEY || "";
    default:
      return "";
  }
};

// 获取流式输出配置
export const getStreamingEnabled = () => {
  const stored = localStorage.getItem("streamingEnabled");
  if (stored !== null) {
    return stored === "true";
  }
  return DEFAULT_CONFIG.streaming;
};

// 验证配置是否完整
export const validateConfig = (provider) => {
  const config = PROVIDER_CONFIGS[provider];
  if (!config) return false;

  const apiKey = getApiKey(provider);
  if (!config.baseURL || !apiKey) return false;

  // 百度需要额外的secret key
  if (provider === AI_PROVIDERS.BAIDU) {
    const secretKey =
      localStorage.getItem(`${provider}_secret_key`) ||
      import.meta.env.VITE_BAIDU_SECRET_KEY;
    if (!secretKey) return false;
  }

  return true;
};

// 获取所有可用的模型列表
export const getAvailableModels = () => {
  return Object.entries(AI_MODELS).filter(([modelId, modelInfo]) => {
    return validateConfig(modelInfo.provider);
  });
};

// 更新配置后的回调
export const onConfigUpdate = (callback) => {
  window.addEventListener("storage", (e) => {
    if (
      e.key &&
      (e.key.includes("selectedModel") ||
        e.key.includes("streamingEnabled") ||
        e.key.includes("_api_key"))
    ) {
      callback();
    }
  });
};
