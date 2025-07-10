# Next.js 雲端部落格平台

基於 Next.js 和 Amazon DynamoDB 的現代化部落格平台，支援 Markdown 編輯和管理員後台。

## 🚀 功能特色

- **現代化 UI**：使用 Next.js 和 Tailwind CSS 構建
- **Markdown 支援**：內建 Markdown 編輯器，支援即時預覽
- **雲端資料庫**：使用 Amazon DynamoDB 作為無伺服器資料庫
- **管理員後台**：完整的文章管理功能
- **響應式設計**：支援各種裝置和螢幕尺寸
- **SEO 友好**：使用 Next.js SSR/SSG 優化搜尋引擎
- **部署簡易**：可輕鬆部署到 Cloudflare Pages 或 Netlify

## 📦 技術棧

- **前端框架**：Next.js 14
- **UI 庫**：React 18
- **樣式框架**：Tailwind CSS
- **資料庫**：Amazon DynamoDB
- **編輯器**：@uiw/react-md-editor
- **認證**：JWT + 環境變數
- **部署**：Cloudflare Pages / Netlify

## 🏗️ 專案結構

```
nextjs-blog-platform/
├── lib/                    # 核心功能庫
│   ├── auth.ts            # 認證服務
│   ├── dynamodb.ts        # DynamoDB 服務
│   └── utils.ts           # 工具函數
├── pages/                 # Next.js 頁面
│   ├── api/               # API 路由
│   │   ├── auth/          # 認證 API
│   │   └── posts/         # 文章 API
│   ├── admin/             # 管理後台頁面
│   │   ├── posts/         # 文章管理
│   │   ├── index.tsx      # 後台首頁
│   │   └── login.tsx      # 登入頁面
│   ├── posts/             # 前端文章頁面
│   ├── _app.tsx           # App 組件
│   └── index.tsx          # 首頁
├── styles/                # 樣式文件
│   └── globals.css        # 全局樣式
├── public/                # 靜態資源
├── .env.local             # 環境變數（請勿提交到 Git）
├── next.config.js         # Next.js 配置
├── tailwind.config.js     # Tailwind CSS 配置
└── package.json           # 專案依賴
```

## 🛠️ 本地開發設置

### 1. 克隆專案

```bash
git clone <your-repo-url>
cd nextjs-blog-platform
```

### 2. 安裝依賴

```bash
npm install
# 或
yarn install
```

### 3. 設置環境變數

複製 `.env.local` 文件並填入您的配置：

```bash
cp .env.local.example .env.local
```

編輯 `.env.local`：

```env
# AWS DynamoDB 憑證
NETLIFY_AWS_ACCESS_KEY_ID=your_access_key_id
NETLIFY_AWS_SECRET_ACCESS_KEY=your_secret_access_key
NETLIFY_AWS_REGION=ap-southeast-2
DYNAMODB_TABLE_NAME=posts

# 管理員登入憑證
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# JWT 密鑰
JWT_SECRET=your_jwt_secret_key
```

### 4. 設置 DynamoDB 表

在 AWS 控制台中建立名為 `posts` 的 DynamoDB 表：

- **表名稱**：`posts`
- **分區鍵**：`id` (字串)
- **計費模式**：按需計費

表結構範例：
```json
{
  "id": "uuid",
  "title": "文章標題",
  "slug": "article-slug",
  "content": "Markdown 內容",
  "excerpt": "文章摘要",
  "author": "作者名稱",
  "published": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 5. 啟動開發伺服器

```bash
npm run dev
# 或
yarn dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看結果。

## 📝 使用說明

### 前端功能

- **首頁**：瀏覽所有已發佈的文章
- **文章頁面**：查看單篇文章的完整內容
- **響應式設計**：支援手機、平板、桌面裝置

### 管理後台

1. 訪問 `/admin/login` 登入管理後台
2. 使用環境變數中設定的帳號密碼登入
3. 在後台可以：
   - 查看所有文章（包括草稿）
   - 新增文章
   - 編輯文章
   - 發佈/取消發佈文章
   - 刪除文章

### API 端點

- `GET /api/posts` - 獲取已發佈的文章列表
- `GET /api/posts?admin=true` - 獲取所有文章（需要認證）
- `GET /api/posts/:id` - 獲取單篇文章
- `GET /api/posts/slug/:slug` - 通過 slug 獲取文章
- `POST /api/posts` - 建立新文章（需要認證）
- `PUT /api/posts/:id` - 更新文章（需要認證）
- `DELETE /api/posts/:id` - 刪除文章（需要認證）
- `POST /api/auth/login` - 管理員登入
- `POST /api/auth/logout` - 管理員登出

## 🚀 部署指南

### Cloudflare Pages 部署

1. 推送程式碼到 Git 儲存庫
2. 連接 Cloudflare Pages 到您的儲存庫
3. 設置構建配置：
   - **構建命令**：`npm run build`
   - **輸出目錄**：`.next`
4. 在 Cloudflare Pages 設置環境變數
5. 部署完成後，您的部落格將可通過 Cloudflare 的 CDN 全球訪問

### Netlify 部署

1. 推送程式碼到 Git 儲存庫
2. 在 Netlify 中建立新站點
3. 設置構建配置：
   - **構建命令**：`npm run build`
   - **發佈目錄**：`.next`
4. 在 Netlify 設置環境變數
5. 啟用自動部署

### 環境變數配置

在部署平台中設置以下環境變數：

```
NETLIFY_AWS_ACCESS_KEY_ID=your_access_key_id
NETLIFY_AWS_SECRET_ACCESS_KEY=your_secret_access_key
NETLIFY_AWS_REGION=ap-southeast-2
DYNAMODB_TABLE_NAME=posts
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
```

## 🔧 自定義配置

### 修改樣式

- 編輯 `styles/globals.css` 自定義全局樣式
- 修改 `tailwind.config.js` 自定義 Tailwind 配置

### 修改網站資訊

- 在各頁面組件中修改標題、描述等元資料
- 更新 `pages/_app.tsx` 中的全局設置

### 添加新功能

- 在 `pages/api/` 中添加新的 API 路由
- 在 `lib/` 中添加新的服務模組
- 在 `pages/` 中添加新的頁面組件

## 🛡️ 安全注意事項

1. **環境變數安全**：
   - 絕不將 `.env.local` 文件提交到 Git
   - 使用強密碼作為管理員密碼
   - 定期更換 JWT 密鑰

2. **AWS 權限**：
   - 為 DynamoDB 設置最小權限原則
   - 使用 IAM 角色限制訪問範圍

3. **生產環境建議**：
   - 使用更安全的認證方案（如 OAuth、AWS Cognito）
   - 啟用 HTTPS
   - 設置 CORS 策略

## 📄 許可證

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📞 支援

如有問題，請建立 Issue 或聯繫維護者。