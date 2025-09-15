// ============= src/services/ai.service.js (Updated for Backend) =============
import { getCurrentConfig } from "../config/ai.config";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export class AIService {
  static async sendMessage(messages, onChunk, onComplete, onError) {
    const config = getCurrentConfig();

    if (!config.config.apiKey) {
      onError(new Error("API密钥未配置，请在设置中配置相应的API密钥"));
      return;
    }

    try {
      // 根据不同的提供商调用不同的后端接口
      const endpoint = this.getBackendEndpoint(config.provider);

      if (config.streaming) {
        await this.handleStreamingRequest(
          endpoint,
          messages,
          config,
          onChunk,
          onComplete,
          onError
        );
      } else {
        await this.handleNonStreamingRequest(
          endpoint,
          messages,
          config,
          onComplete,
          onError
        );
      }
    } catch (error) {
      console.error("AI服务调用失败:", error);
      onError(error);
    }
  }

  // 获取后端接口端点
  static getBackendEndpoint(provider) {
    const endpoints = {
      openai: "/api/openai/chat",
      anthropic: "/api/anthropic/chat",
      zhipu: "/api/zhipu/chat",
      qwen: "/api/qwen/chat",
      gemini: "/api/gemini/chat",
      custom: "/api/openai/chat", // 自定义API通常兼容OpenAI格式
    };

    return endpoints[provider] || endpoints.openai;
  }

  // 处理流式请求
  static async handleStreamingRequest(
    endpoint,
    messages,
    config,
    onChunk,
    onComplete,
    onError
  ) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: this.formatMessages(messages),
          model: config.model,
          stream: true,
          apiKey: config.config.apiKey,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              onComplete(fullContent);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              let content = "";

              // 处理不同提供商的响应格式
              if (
                config.provider === "openai" ||
                config.provider === "zhipu" ||
                config.provider === "custom"
              ) {
                content = parsed.choices?.[0]?.delta?.content || "";
              } else if (config.provider === "anthropic") {
                if (parsed.type === "content_block_delta") {
                  content = parsed.delta?.text || "";
                } else if (parsed.type === "message_stop") {
                  onComplete(fullContent);
                  return;
                }
              } else if (config.provider === "qwen") {
                content = parsed.output?.text || "";
                if (content && content !== fullContent) {
                  const newContent = content.slice(fullContent.length);
                  fullContent = content;
                  if (newContent) {
                    onChunk(newContent, fullContent);
                  }
                  continue;
                }
              } else if (config.provider === "gemini") {
                content =
                  parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (content && content !== fullContent) {
                  const newContent = content.slice(fullContent.length);
                  fullContent = content;
                  if (newContent) {
                    onChunk(newContent, fullContent);
                  }
                  continue;
                }
              }

              if (content) {
                fullContent += content;
                onChunk(content, fullContent);
              }
            } catch (e) {
              console.warn("解析流式数据失败:", e, data);
            }
          }
        }
      }

      onComplete(fullContent);
    } catch (error) {
      console.error("流式请求失败:", error);
      onError(error);
    }
  }

  // 处理非流式请求
  static async handleNonStreamingRequest(
    endpoint,
    messages,
    config,
    onComplete,
    onError
  ) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: this.formatMessages(messages),
          model: config.model,
          stream: false,
          apiKey: config.config.apiKey,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      let content = "";

      // 处理不同提供商的响应格式
      if (
        config.provider === "openai" ||
        config.provider === "zhipu" ||
        config.provider === "custom"
      ) {
        content = data.choices?.[0]?.message?.content || "";
      } else if (config.provider === "anthropic") {
        content = data.content?.[0]?.text || "";
      } else if (config.provider === "qwen") {
        content = data.output?.text || "";
      } else if (config.provider === "gemini") {
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }

      onComplete(content);
    } catch (error) {
      console.error("非流式请求失败:", error);
      onError(error);
    }
  }

  // 格式化消息
  static formatMessages(messages) {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  // 测试API连接
  static async testConnection(provider, apiKey) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          apiKey,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("连接测试失败:", error);
      return {
        success: false,
        message: error.message || "连接测试失败",
      };
    }
  }

  // 检查后端服务状态
  static async checkBackendHealth() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`, {
        method: "GET",
        timeout: 5000,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          status: "online",
          data,
        };
      } else {
        return {
          status: "error",
          error: `HTTP ${response.status}`,
        };
      }
    } catch (error) {
      console.error("后端健康检查失败:", error);
      return {
        status: "offline",
        error: error.message,
      };
    }
  }

  // 获取错误信息的友好提示
  static getErrorMessage(error) {
    const message = error.message || "未知错误";

    if (message.includes("fetch")) {
      return "无法连接到后端服务，请检查后端服务是否正常运行";
    } else if (message.includes("401")) {
      return "API密钥无效或已过期，请检查配置";
    } else if (message.includes("429")) {
      return "API调用频率过高，请稍后再试";
    } else if (message.includes("quota")) {
      return "API配额已用完，请检查账户余额";
    } else if (message.includes("timeout")) {
      return "请求超时，请检查网络连接";
    } else {
      return message;
    }
  }
}
