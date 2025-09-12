// ============= src/services/ai.service.js =============
import {
  getCurrentConfig,
  PROVIDER_CONFIGS,
  AI_PROVIDERS,
} from "../config/ai.config";

export class AIService {
  static async sendMessage(messages, onChunk, onComplete, onError) {
    const config = getCurrentConfig();

    if (!config.config.apiKey) {
      onError(new Error("API密钥未配置，请在设置中配置相应的API密钥"));
      return;
    }

    try {
      switch (config.provider) {
        case AI_PROVIDERS.OPENAI:
          return await this.sendOpenAIMessage(
            messages,
            config,
            onChunk,
            onComplete,
            onError
          );
        case AI_PROVIDERS.ANTHROPIC:
          return await this.sendAnthropicMessage(
            messages,
            config,
            onChunk,
            onComplete,
            onError
          );
        case AI_PROVIDERS.GEMINI:
          return await this.sendGeminiMessage(
            messages,
            config,
            onChunk,
            onComplete,
            onError
          );
        case AI_PROVIDERS.ZHIPU:
          return await this.sendZhipuMessage(
            messages,
            config,
            onChunk,
            onComplete,
            onError
          );
        case AI_PROVIDERS.QWEN:
          return await this.sendQwenMessage(
            messages,
            config,
            onChunk,
            onComplete,
            onError
          );
        case AI_PROVIDERS.BAIDU:
          return await this.sendBaiduMessage(
            messages,
            config,
            onChunk,
            onComplete,
            onError
          );
        case AI_PROVIDERS.CUSTOM:
          return await this.sendCustomMessage(
            messages,
            config,
            onChunk,
            onComplete,
            onError
          );
        default:
          onError(new Error(`不支持的AI提供商: ${config.provider}`));
      }
    } catch (error) {
      onError(error);
    }
  }

  // OpenAI格式的API调用（支持OpenAI、自定义兼容API）
  static async sendOpenAIMessage(
    messages,
    config,
    onChunk,
    onComplete,
    onError
  ) {
    const url = `${config.config.baseURL}${config.config.chatEndpoint}`;
    const headers = this.buildHeaders(
      config.config.headers,
      config.config.apiKey
    );

    const payload = {
      model: config.model,
      messages: this.formatMessages(messages, config.provider),
      stream: config.streaming,
      temperature: 0.7,
      max_tokens: 2000,
    };

    if (config.streaming) {
      return await this.handleStreamingResponse(
        url,
        headers,
        payload,
        onChunk,
        onComplete,
        onError
      );
    } else {
      return await this.handleNonStreamingResponse(
        url,
        headers,
        payload,
        onComplete,
        onError
      );
    }
  }

  // 智谱AI (兼容OpenAI格式)
  static async sendZhipuMessage(
    messages,
    config,
    onChunk,
    onComplete,
    onError
  ) {
    return await this.sendOpenAIMessage(
      messages,
      config,
      onChunk,
      onComplete,
      onError
    );
  }

  // 自定义API (兼容OpenAI格式)
  static async sendCustomMessage(
    messages,
    config,
    onChunk,
    onComplete,
    onError
  ) {
    return await this.sendOpenAIMessage(
      messages,
      config,
      onChunk,
      onComplete,
      onError
    );
  }

  // Anthropic Claude API
  static async sendAnthropicMessage(
    messages,
    config,
    onChunk,
    onComplete,
    onError
  ) {
    const url = `${config.config.baseURL}${config.config.chatEndpoint}`;
    const headers = this.buildHeaders(
      config.config.headers,
      config.config.apiKey
    );

    // Anthropic使用不同的消息格式
    const systemMessage = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    const payload = {
      model: config.model,
      max_tokens: 2000,
      messages: chatMessages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
      stream: config.streaming,
    };

    if (systemMessage) {
      payload.system = systemMessage.content;
    }

    if (config.streaming) {
      return await this.handleAnthropicStreamingResponse(
        url,
        headers,
        payload,
        onChunk,
        onComplete,
        onError
      );
    } else {
      return await this.handleAnthropicNonStreamingResponse(
        url,
        headers,
        payload,
        onComplete,
        onError
      );
    }
  }

  // Google Gemini API
  static async sendGeminiMessage(
    messages,
    config,
    onChunk,
    onComplete,
    onError
  ) {
    let url = `${config.config.baseURL}${config.config.chatEndpoint}`;
    url = url
      .replace("{model}", config.model)
      .replace("{API_KEY}", config.config.apiKey);

    const headers = { "Content-Type": "application/json" };

    const payload = {
      contents: messages
        .filter((m) => m.role !== "system")
        .map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    };

    // Gemini的系统消息处理
    const systemMessage = messages.find((m) => m.role === "system");
    if (systemMessage) {
      payload.systemInstruction = {
        parts: [{ text: systemMessage.content }],
      };
    }

    if (config.streaming) {
      return await this.handleGeminiStreamingResponse(
        url,
        headers,
        payload,
        onChunk,
        onComplete,
        onError
      );
    } else {
      return await this.handleGeminiNonStreamingResponse(
        url,
        headers,
        payload,
        onComplete,
        onError
      );
    }
  }

  // 通义千问API
  static async sendQwenMessage(messages, config, onChunk, onComplete, onError) {
    const url = `${config.config.baseURL}${config.config.chatEndpoint}`;
    const headers = this.buildHeaders(
      config.config.headers,
      config.config.apiKey
    );

    const payload = {
      model: config.model,
      input: {
        messages: this.formatMessages(messages, config.provider),
      },
      parameters: {
        temperature: 0.7,
        max_tokens: 2000,
        incremental_output: config.streaming,
      },
    };

    if (config.streaming) {
      return await this.handleQwenStreamingResponse(
        url,
        headers,
        payload,
        onChunk,
        onComplete,
        onError
      );
    } else {
      return await this.handleQwenNonStreamingResponse(
        url,
        headers,
        payload,
        onComplete,
        onError
      );
    }
  }

  // 百度文心一言API
  static async sendBaiduMessage(
    messages,
    config,
    onChunk,
    onComplete,
    onError
  ) {
    // 百度需要先获取access_token
    const accessToken = await this.getBaiduAccessToken(
      config.config.apiKey,
      config.config.secretKey
    );
    const url = `${config.config.baseURL}${config.config.chatEndpoint}?access_token=${accessToken}`;

    const headers = { "Content-Type": "application/json" };

    const payload = {
      messages: this.formatMessages(messages, config.provider),
      stream: config.streaming,
      temperature: 0.7,
      max_output_tokens: 2000,
    };

    if (config.streaming) {
      return await this.handleBaiduStreamingResponse(
        url,
        headers,
        payload,
        onChunk,
        onComplete,
        onError
      );
    } else {
      return await this.handleBaiduNonStreamingResponse(
        url,
        headers,
        payload,
        onComplete,
        onError
      );
    }
  }

  // 构建请求头
  static buildHeaders(headerTemplate, apiKey) {
    const headers = {};
    Object.entries(headerTemplate).forEach(([key, value]) => {
      headers[key] = value.replace("{API_KEY}", apiKey);
    });
    return headers;
  }

  // 格式化消息
  static formatMessages(messages, provider) {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  // 处理流式响应 (OpenAI格式)
  static async handleStreamingResponse(
    url,
    headers,
    payload,
    onChunk,
    onComplete,
    onError
  ) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
            `HTTP ${response.status}: ${response.statusText}`
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
              const content = parsed.choices?.[0]?.delta?.content || "";

              if (content) {
                fullContent += content;
                onChunk(content, fullContent);
              }
            } catch (e) {
              // 忽略解析错误的数据块
            }
          }
        }
      }

      onComplete(fullContent);
    } catch (error) {
      onError(error);
    }
  }

  // 处理非流式响应 (OpenAI格式)
  static async handleNonStreamingResponse(
    url,
    headers,
    payload,
    onComplete,
    onError
  ) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      onComplete(content);
    } catch (error) {
      onError(error);
    }
  }

  // Anthropic流式响应处理
  static async handleAnthropicStreamingResponse(
    url,
    headers,
    payload,
    onChunk,
    onComplete,
    onError
  ) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
            `HTTP ${response.status}: ${response.statusText}`
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

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "content_block_delta") {
                const content = parsed.delta?.text || "";
                if (content) {
                  fullContent += content;
                  onChunk(content, fullContent);
                }
              } else if (parsed.type === "message_stop") {
                onComplete(fullContent);
                return;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      onComplete(fullContent);
    } catch (error) {
      onError(error);
    }
  }

  // Gemini流式响应处理
  static async handleGeminiStreamingResponse(
    url,
    headers,
    payload,
    onChunk,
    onComplete,
    onError
  ) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
            `HTTP ${response.status}: ${response.statusText}`
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

            try {
              const parsed = JSON.parse(data);
              const content =
                parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";

              if (content) {
                const newContent = content.slice(fullContent.length);
                fullContent = content;
                if (newContent) {
                  onChunk(newContent, fullContent);
                }
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      onComplete(fullContent);
    } catch (error) {
      onError(error);
    }
  }

  // 获取百度Access Token
  static async getBaiduAccessToken(apiKey, secretKey) {
    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;

    const response = await fetch(url, { method: "POST" });
    const data = await response.json();

    if (data.access_token) {
      return data.access_token;
    } else {
      throw new Error("获取百度Access Token失败");
    }
  }

  // 通义千问流式响应处理
  static async handleQwenStreamingResponse(
    url,
    headers,
    payload,
    onChunk,
    onComplete,
    onError
  ) {
    // 通义千问的流式处理逻辑
    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
          if (line.startsWith("data:")) {
            const data = line.slice(5).trim();

            try {
              const parsed = JSON.parse(data);
              const content = parsed.output?.text || "";

              if (content && content !== fullContent) {
                const newContent = content.slice(fullContent.length);
                fullContent = content;
                if (newContent) {
                  onChunk(newContent, fullContent);
                }
              }

              if (parsed.output?.finish_reason === "stop") {
                onComplete(fullContent);
                return;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      onComplete(fullContent);
    } catch (error) {
      onError(error);
    }
  }

  // 百度流式响应处理
  static async handleBaiduStreamingResponse(
    url,
    headers,
    payload,
    onChunk,
    onComplete,
    onError
  ) {
    // 类似OpenAI的处理方式
    return await this.handleStreamingResponse(
      url,
      headers,
      payload,
      onChunk,
      onComplete,
      onError
    );
  }
}
