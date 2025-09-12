# 定义要创建的目录结构
$directories = @(
    "src/components/auth",
    "src/components/chat",
    "src/components/sidebar",
    "src/components/ui",
    "src/components/layout",
    "src/context",
    "src/hooks",
    "src/services",
    "src/utils",
    "src/styles",
    "src/types"
)

# 定义要创建的空文件（每个目录下的示例文件）
$files = @(
    "src/components/auth/AuthScreen.jsx",
    "src/components/auth/LoginForm.jsx",
    "src/components/auth/RegisterForm.jsx",
    "src/components/chat/ChatArea.jsx",
    "src/components/chat/MessageBubble.jsx",
    "src/components/chat/MessageInput.jsx",
    "src/components/chat/TypingIndicator.jsx",
    "src/components/sidebar/Sidebar.jsx",
    "src/components/sidebar/ConversationItem.jsx",
    "src/components/sidebar/UserProfile.jsx",
    "src/components/ui/Button.jsx",
    "src/components/ui/Input.jsx",
    "src/components/ui/Modal.jsx",
    "src/components/ui/LoadingSpinner.jsx",
    "src/components/layout/Layout.jsx",
    "src/components/layout/Header.jsx",
    "src/context/AppContext.jsx",
    "src/context/AuthContext.jsx",
    "src/hooks/useAuth.js",
    "src/hooks/useChat.js",
    "src/hooks/useLocalStorage.js",
    "src/hooks/useTheme.js",
    "src/services/api.js",
    "src/services/auth.service.js",
    "src/services/chat.service.js",
    "src/services/storage.service.js",
    "src/utils/constants.js",
    "src/utils/helpers.js",
    "src/utils/formatters.js",
    "src/utils/validators.js",
    "src/styles/globals.css",
    "src/styles/components.css",
    "src/types/auth.types.js",
    "src/types/chat.types.js",
    "src/types/user.types.js"
)

# 创建所有目录
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "Created directory: $dir"
    }
}

# 创建所有空文件
foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        New-Item -ItemType File -Path $file | Out-Null
        Write-Host "Created file: $file"
    }
}

Write-Host "Project structure created successfully!"