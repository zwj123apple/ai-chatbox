// ============= src/components/chat/TypingIndicator.jsx =============
import React from "react";
import { Bot } from "lucide-react";

export default function TypingIndicator({ darkMode }) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          darkMode ? "bg-green-600 text-white" : "bg-green-500 text-white"
        }`}
      >
        <Bot size={16} />
      </div>
      <div
        className={`p-4 rounded-2xl ${
          darkMode
            ? "bg-gray-700 text-gray-100 border border-gray-600"
            : "bg-white text-gray-800 border border-gray-200 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div
              className={`w-2 h-2 rounded-full animate-bounce ${
                darkMode ? "bg-gray-400" : "bg-gray-500"
              }`}
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className={`w-2 h-2 rounded-full animate-bounce ${
                darkMode ? "bg-gray-400" : "bg-gray-500"
              }`}
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className={`w-2 h-2 rounded-full animate-bounce ${
                darkMode ? "bg-gray-400" : "bg-gray-500"
              }`}
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
          <span
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            AI正在思考...
          </span>
        </div>
      </div>
    </div>
  );
}
