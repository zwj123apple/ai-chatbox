// ============= server/app.js (CORS修复版, 代理选择性应用) =============
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// 修复CORS配置
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// 处理预检请求
app.options("*", cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 代理配置
const PROXY_URL = process.env.PROXY_URL;
// 增强的日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] ${req.method} ${req.path} - Origin: ${
      req.get("Origin") || "none"
    }`
  );
  next();
});

// AI服务配置
const AI_SERVICES = {
  openai: {
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    defaultModel: "gpt-3.5-turbo",
  },
  anthropic: {
    baseURL: process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com",
    defaultModel: "claude-3-sonnet",
  },
  zhipu: {
    baseURL:
      process.env.ZHIPU_BASE_URL || "https://open.bigmodel.cn/api/paas/v4",
    defaultModel: "glm-4",
  },
  qwen: {
    baseURL:
      process.env.QWEN_BASE_URL ||
      "https://dashscope.aliyuncs.com/compatible-mode/v1",
    defaultModel: "qwen-turbo",
  },
  gemini: {
    baseURL:
      process.env.GEMINI_BASE_URL ||
      "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-pro",
  },
};

/**
 * 创建axios实例的工厂函数
 * @param {string} provider - 服务商名称 (e.g., 'openai', 'zhipu')
 * @param {string} baseURL - API的基础URL
 * @param {object} headers - 自定义请求头
 * @returns {axios.AxiosInstance}
 */
const createAxiosInstance = (provider, baseURL, headers = {}) => {
  const config = {
    baseURL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  // 定义哪些服务需要走代理
  const providersNeedingProxy = ["openai", "anthropic", "gemini"];

  // 如果设置了代理URL，并且当前服务商在需要代理的列表中，则应用代理
  if (PROXY_URL && providersNeedingProxy.includes(provider)) {
    const agent = new HttpsProxyAgent(PROXY_URL);
    config.httpsAgent = agent;
    config.httpAgent = agent;
    console.log(`[${provider}] 使用代理: ${PROXY_URL}`);
  } else {
    console.log(`[${provider}] 未使用代理`);
  }

  return axios.create(config);
};

// ============= 健康检查 (增强版) =============
app.get("/api/health", (req, res) => {
  console.log("收到健康检查请求");

  const healthData = {
    status: "ok",
    timestamp: new Date().toISOString(),
    server: {
      port: PORT,
      nodeVersion: process.version,
      uptime: process.uptime(),
    },
    proxy: PROXY_URL ? "enabled" : "disabled",
    services: Object.keys(AI_SERVICES),
    cors: {
      origin: req.get("Origin") || "none",
      method: req.method,
    },
  };

  if (PROXY_URL) {
    healthData.proxyUrl = PROXY_URL;
    healthData.proxyFor = ["openai", "anthropic", "gemini"];
  }

  console.log("返回健康检查数据:", healthData);
  res.json(healthData);
});

// 简单的根路径响应
app.get("/", (req, res) => {
  res.json({
    message: "AI Chat Backend Server",
    version: "1.0.0",
    endpoints: [
      "/api/health",
      "/api/openai/chat",
      "/api/zhipu/chat",
      "/api/anthropic/chat",
      "/api/qwen/chat",
      "/api/gemini/chat",
      "/api/test",
    ],
  });
});

// ============= OpenAI API处理 =============
app.post("/api/openai/chat", async (req, res) => {
  console.log("收到OpenAI聊天请求");

  try {
    const { messages, model, stream = true, apiKey, ...otherParams } = req.body;

    if (!apiKey) {
      console.log("API密钥缺失");
      return res.status(400).json({ error: "API密钥未提供" });
    }

    // === MODIFICATION START: 传入服务商名称 ===
    const axiosInstance = createAxiosInstance(
      "openai",
      AI_SERVICES.openai.baseURL,
      {
        Authorization: `Bearer ${apiKey}`,
      }
    );
    // === MODIFICATION END ===

    const payload = {
      model: model || AI_SERVICES.openai.defaultModel,
      messages,
      stream,
      temperature: 0.7,
      max_tokens: 2000,
      ...otherParams,
    };

    console.log(
      `发送请求到OpenAI: ${AI_SERVICES.openai.baseURL}/chat/completions`
    );

    if (stream) {
      const response = await axiosInstance.post("/chat/completions", payload, {
        responseType: "stream",
      });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Access-Control-Allow-Origin", "*");

      response.data.on("data", (chunk) => {
        res.write(chunk);
      });

      response.data.on("end", () => {
        console.log("OpenAI流式响应完成");
        res.end();
      });

      response.data.on("error", (error) => {
        console.error("OpenAI流式响应错误:", error);
        if (!res.headersSent) {
          res.status(500).json({ error: "流式响应错误" });
        }
      });
    } else {
      const response = await axiosInstance.post("/chat/completions", payload);
      console.log("OpenAI非流式响应成功");
      res.json(response.data);
    }
  } catch (error) {
    console.error("OpenAI API错误:", error.response?.data || error.message);
    if (!res.headersSent) {
      res.status(error.response?.status || 500).json({
        error:
          error.response?.data?.error?.message ||
          error.message ||
          "OpenAI API调用失败",
      });
    }
  }
});

// ============= 智谱AI处理 =============
app.post("/api/zhipu/chat", async (req, res) => {
  console.log("收到智谱AI聊天请求");

  try {
    const { messages, model, stream = true, apiKey, ...otherParams } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: "API密钥未提供" });
    }

    // === MODIFICATION START: 传入服务商名称 ===
    const axiosInstance = createAxiosInstance(
      "zhipu",
      AI_SERVICES.zhipu.baseURL,
      {
        Authorization: `Bearer ${apiKey}`,
      }
    );
    // === MODIFICATION END ===

    const payload = {
      model: model || AI_SERVICES.zhipu.defaultModel,
      messages,
      stream,
      temperature: 0.7,
      max_tokens: 2000,
      ...otherParams,
    };

    if (stream) {
      const response = await axiosInstance.post("/chat/completions", payload, {
        responseType: "stream",
      });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Access-Control-Allow-Origin", "*");

      response.data.pipe(res);
    } else {
      const response = await axiosInstance.post("/chat/completions", payload);
      res.json(response.data);
    }
  } catch (error) {
    console.error("智谱AI错误:", error.response?.data || error.message);
    if (!res.headersSent) {
      res.status(error.response?.status || 500).json({
        error:
          error.response?.data?.error?.message ||
          error.message ||
          "智谱AI调用失败",
      });
    }
  }
});

// ============= Anthropic Claude处理 =============
app.post("/api/anthropic/chat", async (req, res) => {
  try {
    const { messages, model, stream = true, apiKey, ...otherParams } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: "API密钥未提供" });
    }

    // === MODIFICATION START: 传入服务商名称 ===
    const axiosInstance = createAxiosInstance(
      "anthropic",
      AI_SERVICES.anthropic.baseURL,
      {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      }
    );
    // === MODIFICATION END ===

    // 转换消息格式
    const systemMessage = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    const payload = {
      model: model || AI_SERVICES.anthropic.defaultModel,
      max_tokens: 2000,
      messages: chatMessages,
      stream,
      ...otherParams,
    };

    if (systemMessage) {
      payload.system = systemMessage.content;
    }

    if (stream) {
      const response = await axiosInstance.post("/v1/messages", payload, {
        responseType: "stream",
      });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      response.data.pipe(res);
    } else {
      const response = await axiosInstance.post("/v1/messages", payload);
      res.json(response.data);
    }
  } catch (error) {
    console.error("Claude API错误:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error:
        error.response?.data?.error?.message ||
        error.message ||
        "Claude API调用失败",
    });
  }
});

// ============= 通义千问处理 =============
app.post("/api/qwen/chat", async (req, res) => {
  try {
    const { messages, model, stream = true, apiKey, ...otherParams } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: "API密钥未提供" });
    }
    console.log("收到通义千问AI聊天请求", AI_SERVICES.qwen.baseURL);
    const axiosInstance = createAxiosInstance(
      "qwen",
      AI_SERVICES.qwen.baseURL,
      {
        Authorization: `Bearer ${apiKey}`,
        ...(stream && { Accept: "text/event-stream" }),
      }
    );

    const payload = {
      model: model || AI_SERVICES.qwen.defaultModel,
      messages,
      temperature: otherParams.temperature ?? 0.7,
      stream,
      ...otherParams,
    };

    // 关键修正 #2: 使用兼容模式的相对路径 /chat/completions
    const endpoint = "/chat/completions";
    console.log("stream:", stream);

    if (stream) {
      const upstream = await axiosInstance.post(endpoint, payload, {
        responseType: "stream",
      });
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      console.log("通义千问AI流式响应开始", res);
      upstream.data.pipe(res);
    } else {
      const { data } = await axiosInstance.post(endpoint, payload);
      res.json(data);
    }
  } catch (err) {
    console.error("[qwen] 调用失败:", err.response?.data || err.message);
    const status = err.response?.status || 500;
    const msg =
      err.response?.data?.error?.message || // 兼容模式会返回 error.message
      err.response?.data?.message || // 原生模式可能返回 message
      err.message ||
      "通义千问调用失败";
    if (!res.headersSent) res.status(status).json({ error: msg });
  }
});

// ============= Google Gemini处理 =============
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, model, stream = true, apiKey, ...otherParams } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: "API密钥未提供" });
    }

    const modelName = model || AI_SERVICES.gemini.defaultModel;
    const endpoint = stream
      ? `/models/${modelName}:streamGenerateContent?key=${apiKey}`
      : `/models/${modelName}:generateContent?key=${apiKey}`;

    // === MODIFICATION START: 传入服务商名称 ===
    const axiosInstance = createAxiosInstance(
      "gemini",
      AI_SERVICES.gemini.baseURL
    );
    // === MODIFICATION END ===

    // 转换消息格式
    const systemMessage = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    const payload = {
      contents: chatMessages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        ...otherParams,
      },
    };

    if (systemMessage) {
      payload.systemInstruction = {
        parts: [{ text: systemMessage.content }],
      };
    }

    if (stream) {
      const response = await axiosInstance.post(endpoint, payload, {
        responseType: "stream",
      });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      response.data.pipe(res);
    } else {
      const response = await axiosInstance.post(endpoint, payload);
      res.json(response.data);
    }
  } catch (error) {
    console.error("Gemini API错误:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error:
        error.response?.data?.error?.message ||
        error.message ||
        "Gemini API调用失败",
    });
  }
});

// ============= 配置测试 (增强版) =============
app.post("/api/test", async (req, res) => {
  console.log("收到API测试请求");
  try {
    const { provider, apiKey } = req.body;
    if (!provider || !apiKey) {
      return res.status(400).json({ error: "缺少服务商或API Key" });
    }
    console.log(`测试 ${provider} 连接...`);

    let testResult = false;
    let errorMessage = "";
    let axiosInstance;

    switch (provider) {
      case "openai":
        axiosInstance = createAxiosInstance(
          "openai",
          AI_SERVICES.openai.baseURL,
          {
            Authorization: `Bearer ${apiKey}`,
          }
        );
        try {
          await axiosInstance.get("/models");
          testResult = true;
        } catch (e) {
          errorMessage = e.response?.data?.error?.message || e.message;
        }
        break;

      case "zhipu":
        axiosInstance = createAxiosInstance(
          "zhipu",
          AI_SERVICES.zhipu.baseURL,
          {
            Authorization: `Bearer ${apiKey}`,
          }
        );
        try {
          await axiosInstance.post("/chat/completions", {
            model: "glm-3-turbo",
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 1,
          });
          testResult = true;
        } catch (e) {
          errorMessage = e.response?.data?.error?.message || e.message;
        }
        break;

      case "anthropic":
        axiosInstance = createAxiosInstance(
          "anthropic",
          AI_SERVICES.anthropic.baseURL,
          {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          }
        );
        try {
          await axiosInstance.post("/messages", {
            model: AI_SERVICES.anthropic.defaultModel,
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 10,
          });
          testResult = true;
        } catch (e) {
          errorMessage = e.response?.data?.error?.message || e.message;
        }
        break;

      case "qwen":
        axiosInstance = createAxiosInstance("qwen", AI_SERVICES.qwen.baseURL, {
          Authorization: `Bearer ${apiKey}`,
        });
        try {
          await axiosInstance.post("/chat/completions", {
            model: AI_SERVICES.qwen.defaultModel,
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 2,
          });
          testResult = true;
        } catch (e) {
          errorMessage = e.response?.data?.error?.message || e.message;
        }
        break;

      case "gemini":
        try {
          const endpoint = `/models/gemini-pro:generateContent?key=${apiKey}`;
          axiosInstance = createAxiosInstance(
            "gemini",
            AI_SERVICES.gemini.baseURL
          );
          await axiosInstance.post(endpoint, {
            contents: [{ parts: [{ text: "Hi" }] }],
          });
          testResult = true;
        } catch (e) {
          errorMessage = e.response?.data?.error?.message || e.message;
        }
        break;

      default:
        errorMessage = "不支持的服务商";
    }

    if (testResult) {
      res.json({ success: true, message: "API连接测试成功" });
    } else {
      res
        .status(400)
        .json({ success: false, message: `连接失败: ${errorMessage}` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  // <-- Correct: 4 arguments now
  console.error("服务器错误:", error);
  if (!res.headersSent) {
    res.status(500).json({ error: "服务器内部错误", details: error.message });
  }
});
// 404处理
app.use("*", (req, res) => {
  console.log(`404 - 未找到路径: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "接口不存在",
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      "/api/health",
      "/api/openai/chat",
      "/api/zhipu/chat",
      "/api/anthropic/chat",
      "/api/qwen/chat",
      "/api/gemini/chat",
      "/api/test",
    ],
  });
});

// 启动服务器
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("=================================");
  console.log(`🚀 后端服务器运行成功！`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(
    `📡 前端地址: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
  );
  // === MODIFICATION START: 更新代理状态日志 ===
  console.log(
    `🌐 代理配置: ${
      PROXY_URL
        ? `已启用 (${PROXY_URL})，将用于 openai, anthropic, gemini`
        : "未启用"
    }`
  );
  // === MODIFICATION END ===
  console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📋 可用服务: ${Object.keys(AI_SERVICES).join(", ")}`);
  console.log("=================================");
});

// 优雅关闭
process.on("SIGTERM", () => {
  console.log("收到SIGTERM信号，正在优雅关闭服务器...");
  server.close(() => {
    console.log("服务器已关闭");
    process.exit(0);
  });
});

module.exports = app;
