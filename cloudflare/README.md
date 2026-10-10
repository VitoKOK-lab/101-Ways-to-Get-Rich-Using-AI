# Cloudflare 價格 API 接線

目前正式候選網址 `https://101-ways-to-get-rich-using-ai.vitokok.workers.dev/` 已顯示網站，但 `/api/prices` 仍回傳 HTML，價格 API 與 D1 尚未接上；GitHub Pages 也只有公開價格規劃，`/#/admin/pricing` 不能儲存。這裡是將價格管理接到 Cloudflare Workers + D1 的程式，尚未部署；付費課程內容、會員登入與金流仍屬下一階段。

1. 在 Cloudflare 建立 D1 資料庫，執行 `migrations/0001_course_prices.sql`。資料庫 binding 名稱使用 `PRICES_DB`。
2. 將 `pricing-worker.ts` 接到 `101-ways-to-get-rich-using-ai.vitokok.workers.dev` 同一個 Worker 的 `/api/*` 路徑，其他路徑繼續由網站靜態資源回應。Worker 需有三個環境變數：`ACCESS_TEAM_DOMAIN`（例如 `your-team.cloudflareaccess.com`）、`ACCESS_AUD`（Access 應用程式的 audience tag）、`ADMIN_EMAILS`（以逗號分隔的管理員 email）。這些值從 Cloudflare 設定注入，不能提交至 Git。
3. 在 Cloudflare Access 建立僅允許管理員的 `/api/admin/*` 政策；`GET /api/prices` 保持公開。Worker 仍會驗證 Access JWT 及 email 白名單。工作人員與客人不能改價。
4. 將 React 網站與 API 部署到 **同一個** `101-ways-to-get-rich-using-ai.vitokok.workers.dev` 來源，建置時設 `VITE_PRICING_API_URL=/api`。目前 GitHub Pages 的價格後台不能直接跨站使用 Access cookie。
5. 前台讀取 API 價格；API 暫停時會退回明示「規劃中」的價格建議。管理員進入 `/#/admin/pricing` 可修改定價、現在售價或折扣（幾折），售價與折扣連動；促銷欄位暫不呈現。儲存時 D1 更新版本並留下稽核紀錄。

價格 API 不是付款 API。正式結帳需從 D1 在伺服器重新計算當下有效售價，建立訂單價格快照，並接上金流 webhook 與課程授權。詳見 [`docs/membership-commerce-plan.md`](../docs/membership-commerce-plan.md)。

目前雲端開發環境沒有 Cloudflare 部署授權。部署者須在 Cloudflare 後台或安全的環境設定中提供受限於該帳戶的部署權限；不要在聊天、儲存庫或前端設定中貼出 API Token。先確認 `/api/prices` 回傳 JSON，再測試管理員價格儲存與公開讀價。完成 Cloudflare 正式網站驗證後，才關閉 GitHub Pages 並將儲存庫改回私有；單純移除顧客頁連結不會更改公開權限。
