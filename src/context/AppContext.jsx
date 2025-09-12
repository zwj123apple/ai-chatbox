// ============= src/context/AppContext.jsx =============
import React, { createContext, useContext, useState } from "react";
import { StorageService } from "../services/storage.service";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState(StorageService.getAllUsers());

  const login = async (username, password) => {
    try {
      const user = StorageService.authenticate(username, password);
      if (user) {
        setCurrentUser(user);
        const data = StorageService.getUserData(user.id);
        setUserData(data);
        return { success: true };
      } else {
        return { success: false, error: "用户名或密码错误" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const newUser = StorageService.register(userData);
      setAllUsers(StorageService.getAllUsers());
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUserData(null);
  };

  const updateUserData = (newData) => {
    if (currentUser) {
      StorageService.saveUserData(currentUser.id, newData);
      setUserData({ ...newData });
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        userData,
        allUsers,
        login,
        register,
        logout,
        updateUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
