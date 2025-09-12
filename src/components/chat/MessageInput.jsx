// ============= src/components/chat/MessageInput.jsx =============
import React, { useState, useRef } from "react";
import { Send } from "lucide-react";

export default function MessageInput({ onSendMessage, isLoading, darkMode }) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border-t px-6 py-4`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的问题..."
            className={`w-full pr-12 pl-4 py-3 rounded-2xl resize-none border-2 transition-all focus:outline-none ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:bg-white"
            }`}
            rows="1"
            style={{ maxHeight: "120px", minHeight: "50px" }}
            disabled={isLoading}
          />

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-xl transition-all ${
              inputValue.trim() && !isLoading
                ? "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 shadow-lg"
                : darkMode
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send size={18} />
          </button>
        </div>

        <div
          className={`text-xs mt-2 text-center ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          按 Enter 发送消息，Shift + Enter 换行
        </div>
      </div>
    </div>
  );
}
