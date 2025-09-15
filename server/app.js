// ============= server/app.js (CORS修复版) =============
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
const agent = PROXY_URL ? new HttpsProxyAgent(PROXY_URL) : undefined;

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
      process.env.QWEN_BASE_URL || "https://dashscope.aliyuncs.com/api/v1",
    defaultModel: "qwen-turbo",
  },
  gemini: {
    baseURL:
      process.env.GEMINI_BASE_URL ||
      "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-pro",
  },
};

// 创建axios实例的工厂函数
const createAxiosInstance = (baseURL, headers = {}) => {
  const config = {
    baseURL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (agent) {
    config.httpsAgent = agent;
    config.httpAgent = agent;
    console.log(`使用代理: ${PROXY_URL}`);
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

    const axiosInstance = createAxiosInstance(AI_SERVICES.openai.baseURL, {
      Authorization: `Bearer ${apiKey}`,
    });

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

    const axiosInstance = createAxiosInstance(AI_SERVICES.zhipu.baseURL, {
      Authorization: `Bearer ${apiKey}`,
    });

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

// ============= 配置测试 (增强版) =============
app.post("/api/test", async (req, res) => {
  console.log("收到API测试请求");

  try {
    const { provider, apiKey } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({ error: "缺少必要参数" });
    }

    console.log(`测试${provider}连接...`);

    let testResult = false;
    let errorMessage = "";

    switch (provider) {
      case "openai":
        try {
          const axiosInstance = createAxiosInstance(
            AI_SERVICES.openai.baseURL,
            {
              Authorization: `Bearer ${apiKey}`,
            }
          );
          await axiosInstance.get("/models", { timeout: 10000 });
          testResult = true;
        } catch (error) {
          errorMessage = error.response?.data?.error?.message || error.message;
          console.log("OpenAI测试失败:", errorMessage);
        }
        break;

      case "zhipu":
        try {
          const axiosInstance = createAxiosInstance(AI_SERVICES.zhipu.baseURL, {
            Authorization: `Bearer ${apiKey}`,
          });
          await axiosInstance.post(
            "/chat/completions",
            {
              model: "glm-4",
              messages: [{ role: "user", content: "hi" }],
              max_tokens: 10,
              stream: false,
            },
            { timeout: 10000 }
          );
          testResult = true;
        } catch (error) {
          errorMessage = error.response?.data?.error?.message || error.message;
          console.log("智谱AI测试失败:", errorMessage);
        }
        break;

      default:
        errorMessage = "不支持的服务商";
    }

    if (testResult) {
      console.log(`${provider} API测试成功`);
      res.json({ success: true, message: "API连接测试成功" });
    } else {
      console.log(`${provider} API测试失败:`, errorMessage);
      res.status(400).json({ success: false, message: errorMessage });
    }
  } catch (error) {
    console.error("测试过程出错:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
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
  console.log(`🌐 代理状态: ${PROXY_URL ? `已启用 (${PROXY_URL})` : "未启用"}`);
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
