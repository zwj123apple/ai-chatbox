// ============= src/services/ai.service.js =============
import { getCurrentConfig } from "../config/ai.config";

export class AIService {
  static async sendMessage(messages, onChunk, onComplete, onError) {
    const { model, config: { apiKey } } = getCurrentConfig();

    if (!apiKey) {
      onError(new Error("API密钥未配置，请在设置中配置相应的API密钥"));
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: messages,
          apiKey: apiKey,
          model: model,
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

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        onChunk(chunk, fullContent);
      }

      onComplete(fullContent);
    } catch (error) {
      onError(error);
    }
  }
}
