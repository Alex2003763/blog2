# Next.js 雲端部落格平台

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Amazon DynamoDB](https://img.shields.io/badge/Amazon_DynamoDB-4053D6?style=for-the-badge&logo=amazon-dynamodb)](https://aws.amazon.com/dynamodb/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

一個基於 Next.js 和 Amazon DynamoDB 的現代化、高效能、易於部署的部落格平台，內建完整的 Markdown 編輯與管理功能。

## 🌟 核心功能

- **🚀 現代化技術棧**: 使用 Next.js 14、React 18 和 Tailwind CSS 打造流暢的使用者體驗。
- **✍️ Markdown 支援**: 內建 `@uiw/react-md-editor` 編輯器，支援語法高亮和即時預覽。
- **☁️ 雲端原生**: 採用 Amazon DynamoDB 作為無伺服器資料庫，具備高擴展性和可靠性。
- **🔐 管理員後台**: 提供完整的文章管理功能，包括新增、編輯、發佈和刪除。
- **📱 響應式設計**: 完美適應各種裝置，從手機到桌面電腦。
- **🔍 SEO 友好**: 利用 Next.js 的伺服器端渲染 (SSR) 和靜態網站生成 (SSG) 優化搜尋引擎排名。
- **💨 簡易部署**: 提供一鍵部署到 Cloudflare Pages 或 Netlify 的完整指南。

## 🏗️ 系統架構

```mermaid
graph TD
    subgraph "使用者端"
        A[訪客] -->|瀏覽文章| B(Next.js 前端)
        C[管理員] -->|登入 & 管理| D(Next.js 管理後台)
    end

    subgraph "伺服器端 (Next.js API Routes)"
        B -->|請求文章列表| E{API /api/posts}
        D -->|CRUD 操作| F{API /api/posts/:id}
        D -->|登入請求| G{API /api/auth/login}
    end

    subgraph "雲端服務 (AWS)"
        E -->|讀取| H[(Amazon DynamoDB)]
        F -->|寫入/更新/刪除| H
        G -->|驗證| I{JWT & 環境變數}
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#ccf,stroke:#333,stroke-width:2px
```

## 🛠️ 本地開發設置

### 1. 取得專案

```bash
git clone https://github.com/your-username/nextjs-blog-platform.git
cd nextjs-blog-platform
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 設定環境變數

複製範例檔案並填入您的 AWS 和管理員憑證。

```bash
cp .env.local.example .env.local
```

**`.env.local` 內容:**

| 變數名稱                      | 說明                               | 範例值                        |
| ----------------------------- | ---------------------------------- | ------------------------------- |
| `NETLIFY_AWS_ACCESS_KEY_ID`     | 您的 AWS Access Key ID             | `AKIAIOSFODNN7EXAMPLE`          |
| `NETLIFY_AWS_SECRET_ACCESS_KEY` | 您的 AWS Secret Access Key         | `wJalrXUtnFEMI/K7MDENG/bPxRfiCY` |
| `NETLIFY_AWS_REGION`          | 您的 AWS 區域                      | `ap-southeast-2`                |
| `DYNAMODB_TABLE_NAME`         | DynamoDB 表名稱                    | `posts`                         |
| `ADMIN_USERNAME`              | 管理員登入帳號                     | `admin`                         |
| `ADMIN_PASSWORD`              | 管理員登入密碼 (建議使用強密碼)    | `your_secure_password`          |
| `JWT_SECRET`                  | 用於簽署 JWT 的密鑰 (請保持機密) | `your_super_secret_jwt_key`     |

### 4. 設定 AWS DynamoDB

在 AWS 管理控制台中建立一個 DynamoDB 表：

- **表名稱**: `posts`
- **分區鍵**: `id` (類型: `String`)
- **排序鍵**: (無)
- **計費模式**: 按需 (On-demand)

### 5. 啟動開發伺服器

```bash
npm run dev
```

現在，您可以在 [http://localhost:3000](http://localhost:3000) 看到您的部落格。

## 🚀 部署指南

您可以輕鬆將此專案部署到任何支援 Next.js 的平台。

### 一鍵部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Alex2003763/blog2)


**部署設定:**

| 平台             | 構建命令        | 輸出目錄 |
| ---------------- | --------------- | -------- |
| **Cloudflare Pages** | `npm run build` | `.next`  |
| **Netlify**      | `npm run build` | `.next`  |

**重要**: 部署後，請務必在平台的儀表板中設定與 `.env.local` 相同的環境變數。

## 🛡️ 安全建議

- **環境變數**: 絕不將 `.env.local` 檔案提交到版本控制中。
- **AWS IAM**: 建立一個專用的 IAM 使用者，並僅授予其對所需 DynamoDB 表的最小權限。
- **密碼強度**: 在生產環境中使用強密碼和定期更換的 JWT 密鑰。
- **進階認證**: 考慮整合如 AWS Cognito、Auth0 或 NextAuth.js 等更安全的認證方案。

## 🤝 如何貢獻

歡迎提交 Issue 和 Pull Request！您的貢獻將使這個專案變得更好。

## 📄 許可證

本專案採用 [MIT License](LICENSE) 授權。
