// ============= src/components/chat/MessageBubble.jsx =============
import React from "react";
import { User, Bot } from "lucide-react";

export default function MessageBubble({ message, darkMode }) {
  const isUser = message.type === "user";

  return (
    <div
      className={`flex items-start gap-4 mb-6 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-blue-500 text-white"
            : darkMode
            ? "bg-green-600 text-white"
            : "bg-green-500 text-white"
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className={`max-w-[80%] ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block p-4 rounded-2xl ${
            isUser
              ? darkMode
                ? "bg-blue-600 text-white"
                : "bg-blue-500 text-white"
              : darkMode
              ? "bg-gray-700 text-gray-100 border border-gray-600"
              : "bg-white text-gray-800 border border-gray-200 shadow-sm"
          }`}
        >
          <p className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>
        <div
          className={`text-xs mt-2 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {message.timestamp.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
