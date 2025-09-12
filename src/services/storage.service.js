// ============= src/services/storage.service.js =============
export class StorageService {
  static users = [
    {
      id: "user1",
      username: "alice",
      password: "123456",
      email: "alice@example.com",
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "user2",
      username: "bob",
      password: "123456",
      email: "bob@example.com",
      createdAt: new Date("2024-01-02"),
    },
    {
      id: "user3",
      username: "charlie",
      password: "123456",
      email: "charlie@example.com",
      createdAt: new Date("2024-01-03"),
    },
  ];

  static userSessions = {};

  static authenticate(username, password) {
    const user = this.users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  static register(userData) {
    if (this.users.find((u) => u.username === userData.username)) {
      throw new Error("用户名已存在");
    }

    if (this.users.find((u) => u.email === userData.email)) {
      throw new Error("邮箱已存在");
    }

    const newUser = {
      id: `user_${Date.now()}`,
      username: userData.username,
      password: userData.password,
      email: userData.email,
      createdAt: new Date(),
    };

    this.users.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  static getAllUsers() {
    return this.users.map(({ password: _, ...user }) => user);
  }

  static initUser(userId) {
    if (!this.userSessions[userId]) {
      this.userSessions[userId] = {
        conversations: [
          {
            id: `conv_${Date.now()}`,
            title: "新对话",
            messages: [
              {
                id: `msg_${Date.now()}`,
                type: "assistant",
                content: "您好！我是您的AI助手。有什么我可以帮助您的吗？",
                timestamp: new Date(),
              },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        activeConversationId: null,
        settings: {
          darkMode: false,
          sidebarOpen: true,
        },
      };

      this.userSessions[userId].activeConversationId =
        this.userSessions[userId].conversations[0].id;
    }
  }

  static getUserData(userId) {
    this.initUser(userId);
    return this.userSessions[userId];
  }

  static saveUserData(userId, data) {
    this.userSessions[userId] = { ...data };
  }

  static createConversation(userId, title = null) {
    const userData = this.getUserData(userId);
    const conversationTitle =
      title || `对话 ${userData.conversations.length + 1}`;

    const newConv = {
      id: `conv_${Date.now()}`,
      title: conversationTitle,
      messages: [
        {
          id: `msg_${Date.now()}`,
          type: "assistant",
          content: "您好！我是您的AI助手。有什么我可以帮助您的吗？",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userData.conversations.push(newConv);
    userData.activeConversationId = newConv.id;
    this.saveUserData(userId, userData);
    return newConv;
  }

  static addMessage(userId, conversationId, message) {
    const userData = this.getUserData(userId);
    const conv = userData.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.messages.push({
        ...message,
        id: `msg_${Date.now()}`,
        timestamp: new Date(),
      });
      conv.updatedAt = new Date();

      if (
        message.type === "user" &&
        conv.messages.length === 2 &&
        conv.title.startsWith("对话")
      ) {
        conv.title =
          message.content.slice(0, 20) +
          (message.content.length > 20 ? "..." : "");
      }

      this.saveUserData(userId, userData);
    }
  }

  static deleteConversation(userId, conversationId) {
    const userData = this.getUserData(userId);
    userData.conversations = userData.conversations.filter(
      (c) => c.id !== conversationId
    );

    if (userData.activeConversationId === conversationId) {
      userData.activeConversationId =
        userData.conversations.length > 0 ? userData.conversations[0].id : null;
    }

    this.saveUserData(userId, userData);
  }
}
