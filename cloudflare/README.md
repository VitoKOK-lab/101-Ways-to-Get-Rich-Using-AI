# Cloudflare 價格 API 接線

目前 GitHub Pages 只有公開價格規劃，`/#/admin/pricing` 不能儲存。這裡是將價格管理接到 Cloudflare Workers + D1 的程式，尚未部署；付費課程內容、會員登入與金流仍屬下一階段。

1. 在 Cloudflare 建立 D1 資料庫，執行 `migrations/0001_course_prices.sql`。資料庫 binding 名稱使用 `PRICES_DB`。
2. 部署 `pricing-worker.ts` 到正式網站的 `/api/*` 路徑。Worker 需有三個環境變數：`ACCESS_TEAM_DOMAIN`（例如 `your-team.cloudflareaccess.com`）、`ACCESS_AUD`（Access 應用程式的 audience tag）、`ADMIN_EMAILS`（以逗號分隔的管理員 email）。這些值從 Cloudflare 設定注入，不能提交至 Git。
3. 在 Cloudflare Access 建立僅允許管理員的 `/api/admin/*` 政策；`GET /api/prices` 保持公開。Worker 仍會驗證 Access JWT 及 email 白名單。工作人員與客人不能改價。
4. 將 React 網站部署到與 API **相同來源**的 Cloudflare 網域，建置時設 `VITE_PRICING_API_URL=/api`。目前 GitHub Pages 的價格後台不能直接跨站使用 Access cookie。
5. 前台讀取 API 價格；API 暫停時會退回明示「規劃中」的價格建議。管理員進入 `/#/admin/pricing` 可修改定價與現在售價；促銷欄位暫不呈現。儲存時 D1 更新版本並留下稽核紀錄。

價格 API 不是付款 API。正式結帳需從 D1 在伺服器重新計算當下有效售價，建立訂單價格快照，並接上金流 webhook 與課程授權。詳見 [`docs/membership-commerce-plan.md`](../docs/membership-commerce-plan.md)。
