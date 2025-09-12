// ============= src/components/auth/QuickLoginButton.jsx =============
import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function QuickLoginButton({ user }) {
  const { login } = useApp();
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = async () => {
    setLoading(true);
    await login(user.username, "123456");
    setLoading(false);
  };

  return (
    <button
      onClick={handleQuickLogin}
      disabled={loading}
      className="w-full p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left disabled:opacity-50"
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
          {user.username[0].toUpperCase()}
        </div>
        <div>
          <div className="font-medium text-sm text-gray-800">
            {user.username}
          </div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
        {loading && (
          <div className="ml-auto w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
    </button>
  );
}
