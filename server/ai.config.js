// ============= server/ai.config.js =============
// AI模型配置文件 - 支持多种大模型提供商

const AI_PROVIDERS = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GEMINI: "gemini",
  ZHIPU: "zhipu",
  QWEN: "qwen",
  BAIDU: "baidu",
  CUSTOM: "custom",
};

const AI_MODELS = {
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

const DEFAULT_CONFIG = {
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
const PROVIDER_CONFIGS = {
  [AI_PROVIDERS.OPENAI]: {
    baseURL: "https://api.openai.com/v1",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer {API_KEY}",
    },
    chatEndpoint: "/chat/completions",
    streamingSupported: true,
  },

  [AI_PROVIDERS.ANTHROPIC]: {
    baseURL: "https://api.anthropic.com",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "{API_KEY}",
      "anthropic-version": "2023-06-01",
    },
    chatEndpoint: "/v1/messages",
    streamingSupported: true,
  },

  [AI_PROVIDERS.GEMINI]: {
    baseURL: "https://generativelanguage.googleapis.com/v1beta",
    headers: {
      "Content-Type": "application/json",
    },
    chatEndpoint: "/models/{model}:streamGenerateContent?key={API_KEY}",
    streamingSupported: true,
  },

  [AI_PROVIDERS.ZHIPU]: {
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer {API_KEY}",
    },
    chatEndpoint: "/chat/completions",
    streamingSupported: true,
  },

  [AI_PROVIDERS.QWEN]: {
    baseURL: "https://dashscope.aliyuncs.com/api/v1",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer {API_KEY}",
      "X-DashScope-SSE": "enable",
    },
    chatEndpoint: "/services/aigc/text-generation/generation",
    streamingSupported: true,
  },

  [AI_PROVIDERS.BAIDU]: {
    baseURL: "https://aip.baidubce.com",
    headers: {
      "Content-Type": "application/json",
    },
    chatEndpoint: "/rpc/2.0/ai/v1/chat/eb-instant",
    streamingSupported: true,
    requiresAccessToken: true,
  },

  [AI_PROVIDERS.CUSTOM]: {
    baseURL: "",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer {API_KEY}",
    },
    chatEndpoint: "/chat/completions",
    streamingSupported: true,
  },
};

module.exports = {
  AI_PROVIDERS,
  AI_MODELS,
  DEFAULT_CONFIG,
  PROVIDER_CONFIGS,
};