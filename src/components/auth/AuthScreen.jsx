// ============= src/components/auth/AuthScreen.jsx =============
import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useApp } from "../../context/AppContext";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import QuickLoginButton from "./QuickLoginButton";

export default function AuthScreen() {
  const { allUsers } = useApp();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">AI Chat</h1>
          <p className="text-gray-600">
            {isLogin ? "登录您的账户" : "创建新账户"}
          </p>
        </div>

        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}

        {/* 快速登录区域 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">快速登录（演示用户）：</p>
          <div className="space-y-2">
            {allUsers.slice(0, 3).map((user) => (
              <QuickLoginButton key={user.id} user={user} />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">默认密码：123456</p>
        </div>
      </div>
    </div>
  );
}
