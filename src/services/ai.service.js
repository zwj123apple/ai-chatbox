// ============= src/services/ai.service.js (Enhanced Debug Version) =============
import { getCurrentConfig } from "../config/ai.config";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export class AIService {
  static async sendMessage(messages, onChunk, onComplete, onError) {
    const config = getCurrentConfig();

    if (!config.config.apiKey) {
      onError(new Error("API密钥未配置，请在设置中配置相应的API密钥"));
      return;
    }

    // 添加调试日志
    console.log("=== AIService Debug ===");
    console.log("发送的消息数量:", messages.length);
    console.log(
      "消息内容:",
      messages.map((m) => ({
        role: m.role,
        content: m.content.substring(0, 100) + "...",
      }))
    );
    console.log("当前配置:", {
      provider: config.provider,
      model: config.model,
      streaming: config.streaming,
    });

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
      // 格式化消息并确保正确传递
      const formattedMessages = this.formatMessages(messages);

      const requestBody = {
        messages: formattedMessages,
        model: config.model,
        stream: true,
        apiKey: config.config.apiKey,
        temperature: 0.7,
        max_tokens: 2000,
      };

      console.log("发送到后端的请求体:", {
        ...requestBody,
        apiKey: "***hidden***",
        messages: requestBody.messages.map((m) => ({
          role: m.role,
          content: m.content.substring(0, 100) + "...",
        })),
      });

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("🔥 Response status:", response.status);
      console.log(
        "🔥 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔥 Error response text:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }

        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";
      let chunkCount = 0;

      console.log("🔥 开始读取流式响应...");

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("🔥 流式响应结束，总chunk数:", chunkCount);
          // 处理最后的缓冲区内容
          if (buffer.trim()) {
            console.log("🔥 处理最终缓冲区内容:", buffer);
            const result = this.processStreamLine(
              buffer,
              config,
              fullContent,
              onChunk,
              onComplete
            );
            if (result.done) {
              return;
            }
            fullContent = result.fullContent;
          }
          break;
        }

        chunkCount++;
        const chunk = decoder.decode(value, { stream: true });
        console.log(
          `🔥 Chunk ${chunkCount}:`,
          chunk.substring(0, 200) + (chunk.length > 200 ? "..." : "")
        );

        buffer += chunk;

        // 按行分割处理
        const lines = buffer.split("\n");
        // 保留最后一个可能不完整的行
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            console.log(
              "🔥 处理行:",
              line.substring(0, 150) + (line.length > 150 ? "..." : "")
            );
            const result = this.processStreamLine(
              line,
              config,
              fullContent,
              onChunk,
              onComplete
            );
            if (result.done) {
              console.log(
                "🔥 流式处理完成，最终内容长度:",
                result.fullContent.length
              );
              return;
            }
            fullContent = result.fullContent;
          }
        }
      }

      // 如果没有收到完成信号，手动调用完成回调
      console.log("🔥 手动完成回调，内容长度:", fullContent.length);
      onComplete(fullContent);
    } catch (error) {
      console.error("🔥 流式请求失败:", error);
      onError(error);
    }
  }

  // 处理单行流式数据
  static processStreamLine(line, config, fullContent, onChunk, onComplete) {
    if (line.startsWith("data: ")) {
      const data = line.slice(6).trim();

      if (data === "[DONE]") {
        console.log("🔥 收到完成信号 [DONE]");
        onComplete(fullContent);
        return { done: true, fullContent };
      }

      try {
        const parsed = JSON.parse(data);
        console.log("🔥 解析的数据:", parsed);

        let content = "";

        // 处理不同提供商的响应格式
        if (
          config.provider === "openai" ||
          config.provider === "zhipu" ||
          config.provider === "custom"
        ) {
          content = parsed.choices?.[0]?.delta?.content || "";
          console.log("🔥 OpenAI格式提取内容:", content);
        } else if (config.provider === "anthropic") {
          if (parsed.type === "content_block_delta") {
            content = parsed.delta?.text || "";
            console.log("🔥 Anthropic格式提取内容:", content);
          } else if (parsed.type === "message_stop") {
            console.log("🔥 Anthropic完成信号");
            onComplete(fullContent);
            return { done: true, fullContent };
          }
        } else if (config.provider === "qwen") {
          // 通义千问的处理方式
          if (parsed.choices?.[0]?.delta?.content) {
            content = parsed.choices[0].delta.content;
            console.log("🔥 Qwen格式提取内容(delta):", content);
          } else if (parsed.output?.text) {
            const newText = parsed.output.text;
            if (newText && newText !== fullContent) {
              content = newText.slice(fullContent.length);
              fullContent = newText;
              console.log(
                "🔥 Qwen格式提取内容(output):",
                content,
                "总长度:",
                fullContent.length
              );
              if (content) {
                onChunk(content, fullContent);
              }
              return { done: false, fullContent };
            }
          } else if (parsed.output?.finish_reason) {
            console.log("🔥 Qwen完成信号:", parsed.output.finish_reason);
            onComplete(fullContent);
            return { done: true, fullContent };
          }
        } else if (config.provider === "gemini") {
          const newText =
            parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (newText && newText !== fullContent) {
            content = newText.slice(fullContent.length);
            fullContent = newText;
            console.log("🔥 Gemini格式提取内容:", content);
            if (content) {
              onChunk(content, fullContent);
            }
            return { done: false, fullContent };
          }
        }

        if (content) {
          fullContent += content;
          console.log(
            "🔥 调用onChunk，新内容:",
            content,
            "总长度:",
            fullContent.length
          );
          onChunk(content, fullContent);
        } else {
          console.log("🔥 未提取到内容，原始数据:", parsed);
        }
      } catch (e) {
        console.warn("🔥 解析流式数据失败:", e, "数据:", data);
      }
    } else {
      console.log("🔥 非data行:", line);
    }

    return { done: false, fullContent };
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
      // 格式化消息并确保正确传递
      const formattedMessages = this.formatMessages(messages);

      const requestBody = {
        messages: formattedMessages,
        model: config.model,
        stream: false,
        apiKey: config.config.apiKey,
        temperature: 0.7,
        max_tokens: 2000,
      };

      console.log("发送到后端的非流式请求体:", {
        ...requestBody,
        apiKey: "***hidden***",
        messages: requestBody.messages.map((m) => ({
          role: m.role,
          content: m.content.substring(0, 100) + "...",
        })),
      });

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("🔥 非流式响应数据:", data);

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

      console.log("🔥 接收到的响应内容长度:", content.length);
      console.log("🔥 响应内容预览:", content.substring(0, 200));
      onComplete(content);
    } catch (error) {
      console.error("🔥 非流式请求失败:", error);
      onError(error);
    }
  }

  // 格式化消息 - 确保消息格式正确且包含完整对话历史
  static formatMessages(messages) {
    const formatted = messages
      .filter((msg) => msg && msg.role && msg.content) // 过滤无效消息
      .map((msg) => ({
        role: msg.role,
        content: String(msg.content).trim(), // 确保内容是字符串且去除首尾空格
      }))
      .filter((msg) => msg.content.length > 0); // 过滤空内容

    // 确保消息按时间顺序排列，并且角色交替
    const validatedMessages = [];
    let lastRole = null;

    for (const msg of formatted) {
      // 避免连续的相同角色消息（除了system消息）
      if (msg.role !== lastRole || msg.role === "system") {
        validatedMessages.push(msg);
        lastRole = msg.role;
      } else {
        // 如果是连续的相同角色，合并内容
        const lastMsg = validatedMessages[validatedMessages.length - 1];
        lastMsg.content += "\n\n" + msg.content;
      }
    }

    console.log(
      "格式化后的消息:",
      validatedMessages.map((msg, index) => ({
        index,
        role: msg.role,
        contentPreview: msg.content.substring(0, 50) + "...",
        contentLength: msg.content.length,
      }))
    );

    return validatedMessages;
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
