// ============= src/utils/helpers.js =============
export const generateId = (prefix = "") => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const scrollToBottom = (element) => {
  if (element) {
    element.scrollTop = element.scrollHeight;
  }
};

export const scrollToTop = (element) => {
  if (element) {
    element.scrollTop = 0;
  }
};

export const scrollToElement = (element) => {
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};
