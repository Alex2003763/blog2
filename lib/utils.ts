export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 將空格替換為連字符
    .replace(/--+/g, '-') // 將多個連字符替換為單個
    .trim();
}

export function generateExcerpt(content: string, maxLength: number = 150): string {
  // 移除 markdown 標記
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // 移除標題標記
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗體標記
    .replace(/\*(.*?)\*/g, '$1') // 移除斜體標記
    .replace(/`(.*?)`/g, '$1') // 移除行內代碼標記
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除連結標記，保留文字
    .replace(/\n/g, ' ') // 將換行替換為空格
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + '...';
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // 至少 8 個字符
  return password.length >= 8;
}

export function validateTitle(title: string): boolean {
  return title.trim().length >= 3 && title.trim().length <= 200;
}

export function validateContent(content: string): boolean {
  return content.trim().length >= 10;
}

export function createApiResponse(success: boolean, data?: any, error?: string) {
  return {
    success,
    data: data || null,
    error: error || null,
    timestamp: new Date().toISOString(),
  };
}