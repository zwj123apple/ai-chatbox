// ============= src/App.jsx =============
import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import AuthScreen from "./components/auth/AuthScreen";
import Sidebar from "./components/sidebar/Sidebar";
import ChatArea from "./components/chat/ChatArea";

function ChatApp() {
  const { currentUser, userData, updateUserData } = useApp();

  const darkMode = userData?.settings.darkMode || false;

  const toggleDarkMode = () => {
    if (userData) {
      const newData = { ...userData };
      newData.settings.darkMode = !darkMode;
      updateUserData(newData);
    }
  };

  // 未登录显示认证界面
  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div
      className={`flex h-screen ${
        darkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      <Sidebar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <ChatArea darkMode={darkMode} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ChatApp />
    </AppProvider>
  );
}
