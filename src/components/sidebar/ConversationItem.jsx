// ============= src/components/sidebar/ConversationItem.jsx =============
import React, { useState } from "react";
import { MessageSquare, Eye } from "lucide-react";

export default function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
  darkMode,
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`relative group transition-all hover:scale-[1.02] ${
        isActive
          ? darkMode
            ? "bg-blue-600 shadow-lg"
            : "bg-blue-500 shadow-lg"
          : darkMode
          ? "hover:bg-gray-700"
          : "hover:bg-gray-100"
      } rounded-xl`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <button
        onClick={onClick}
        className={`w-full text-left p-3 rounded-xl transition-all ${
          isActive ? "text-white" : darkMode ? "text-gray-300" : "text-gray-600"
        }`}
      >
        <div className="flex items-center gap-3">
          <MessageSquare size={18} />
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{conversation.title}</div>
            <div
              className={`text-sm flex items-center gap-2 ${
                isActive
                  ? "text-blue-200"
                  : darkMode
                  ? "text-gray-400"
                  : "text-gray-400"
              }`}
            >
              <span>{conversation.updatedAt.toLocaleDateString()}</span>
              <span>•</span>
              <span>{conversation.messages.length} 条消息</span>
            </div>
          </div>
        </div>
      </button>

      {showActions && !isActive && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className={`p-1 rounded transition-colors ${
              darkMode
                ? "hover:bg-gray-600 text-gray-400 hover:text-white"
                : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            }`}
            title="查看对话"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("确定要删除这个对话吗？")) {
                onDelete(conversation.id);
              }
            }}
            className={`p-1 rounded transition-colors ${
              darkMode
                ? "hover:bg-red-600 text-gray-400 hover:text-white"
                : "hover:bg-red-100 text-gray-500 hover:text-red-600"
            }`}
            title="删除对话"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
