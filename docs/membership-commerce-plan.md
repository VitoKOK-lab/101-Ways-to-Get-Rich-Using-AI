# Free & Wealthy 自由至富 付費會員與 Cloudflare 上線規劃

研究日期：2026-10-10。這是下一階段的產品與技術規格；目前線上版仍是公開的 GitHub Pages 原型，尚未提供登入、付款或付費課權限。

## 從 MasterClass 公開頁面學到的流程

- [MasterClass 首頁](https://www.masterclass.com/)把「瀏覽課程」、「查看方案」和「登入」分開；[公開結帳頁](https://www.masterclass.com/checkout)清楚標出 **Membership → Account → Payment** 三步，並在付款前說明會員能取得什麼。這是目前可公開觀察的前台流程，不代表我們知道它的內部系統。
- [課程說明](https://www.masterclass.com/help-center/masterclass/answers/about-master-class-classes--id--GfYxwjzXQuSxglxsayS8Hg)指出一般課程依序觀看、可自主調整進度；部分課程有練習與輔助材料。[Certificate Course 說明](https://www.masterclass.com/help-center/certificates/answers/what-will-master-class-certificate-courses-include--id---cx4IVBHTMW5z8xA-ub1PQ)另外列出閱讀、評量、結業作品與回饋。Free & Wealthy 自由至富 現有「影片／課文 → 本課重點 → 練習 → 階段測驗 → 作品」可沿用，但評閱標準與真人回饋仍需製作。
- MasterClass 公開結帳頁採年度全站會員。Free & Wealthy 自由至富 各課對應不同接案服務，**首版建議單課買斷、每課明確列出課綱／教材／作業／更新範圍**，之後再評估全站會員；這是本站的產品建議，不是 MasterClass 的做法。正式定價與退費規則由經營者決定。

## 顧客怎麼買與學

1. 未登入者可看首頁、課程介紹、完整課綱、講師資訊、試看片段及價格；付費正文和完整影片不得送進公開頁面的前端程式碼。
2. 顧客點「購買課程」，先註冊／登入，再確認課程、幣別、總價、包含內容、退款條件與聯絡方式。登錄後應返回原課程及未完成的結帳。
3. 伺服器建立 `pending` 訂單，交由選定的金流服務提供者完成付款；付款頁的金流憑證不進本站程式碼或資料庫。Cloudflare 提供網站與 API 基礎設施，**不是金流商**。
4. 金流以簽章驗證的伺服器端 webhook 回報成功。伺服器冪等地將訂單標為 `paid`，建立課程 `entitlement`，通知顧客；不能只憑瀏覽器「付款成功」跳轉就開課。
5. 「我的課程」顯示已購買課程、目前進度、繼續學習、作業與測驗。每次取正文、影片播放憑證、下載檔或交作業都由伺服器檢查身分與授權。
6. 付款失敗顯示重試；付款成功但 webhook 延遲時顯示「確認中」並自動查詢；退款／撤銷付款時依退款政策停用授權，保留法規要求的訂單紀錄。客服有人工核對與處理入口，所有變更留稽核紀錄。

## 三種身分的權限

| 功能 | 管理員 | 工作人員 | 顧客 |
| --- | --- | --- | --- |
| 看公開課程介紹／試看 | 可以 | 可以 | 可以 |
| 看付費課程與提交作業 | 以測試授權檢視 | 僅授權的課程 | 僅自己已購買的課程 |
| 草擬課程、上傳影片與教材 | 可以 | 被指派課程可以 | 不可以 |
| 發布／下架課程、改價格與退款規則 | 可以 | 不可以 | 不可以 |
| 批改作業／回覆問題 | 可以 | 被指派課程可以 | 僅看自己的回饋 |
| 查訂單與協助退款 | 可以 | 僅必要欄位及授權操作 | 僅自己的訂單 |
| 指派員工角色／授予或撤銷課程權限 | 可以，需留紀錄 | 不可以 | 不可以 |

「工作人員」首版應再以課程指派限制可見範圍；管理員帳號使用多因素驗證。所有權限在 API 判斷，前台隱藏按鈕只能改善介面，不能當安全邊界。

## Cloudflare 串接建議

| 需求 | 建議服務 | 上線條件 |
| --- | --- | --- |
| 公開網站與會員介面 | [Workers 靜態資源與 API](https://developers.cloudflare.com/workers/)（或 Cloudflare Pages 前端接 Workers API） | 保留目前 React 介面，設定正式網域與 preview 環境 |
| 訂單、授權、進度、作業與稽核資料 | [D1](https://developers.cloudflare.com/d1/) | 建 schema、備份與還原演練；訂單與授權有唯一索引及交易／冪等處理 |
| 作業附件、PDF、受保護素材 | [R2](https://developers.cloudflare.com/r2/) 私有儲存桶 | API 驗證授權後發短效存取網址；不開公開 bucket |
| 付費影片 | [Stream 私有影片與短效 signed URL](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/) | 影片設為要求簽名，播放前由 API 查授權後簽發；現有外部公開影片網址不能當付費保護 |
| 員工後台 | 可評估 [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-apps/) 加一道入口保護 | 客戶仍需要消費者登入與課程授權系統；Access 不代替購買紀錄 |
| 註冊／登入防濫用 | [Turnstile](https://developers.cloudflare.com/turnstile/) 搭配速率限制 | 伺服器驗證 token，不能只靠前端元件 |
| 客戶登入 | 選一個支援消費者登入、郵件驗證、重設密碼及工作階段管理的 OIDC 身分服務，與 Workers API 串接 | 提供 HttpOnly、Secure cookie；分清登入身分與課程授權；不可把登入狀態只放 `localStorage` |
| 付款與發票 | 另選台灣金流或國際金流服務 | 確認幣別、付款方式、電子發票、退款與 webhook 文件後才能接實際結帳 |

最低資料表：`users`、`staff_assignments`、`courses`、`course_revisions`、`orders`、`order_items`、`payment_events`、`entitlements`、`lesson_progress`、`submissions`、`assessment_attempts`、`audit_logs`。訂單記住購買當下的品名與價格；授權獨立於訂單，才能處理退款、贈送、手動補課與未來會員方案。

## 價格後台的已備妥部分

- [學費調查與 13 門價格規劃](course-tuition-benchmark.md)是目前前台的預設資料。畫面只列定價與現在售價，並標明「規劃中／尚未開放購買」。促銷價格暫不呈現。`/#/admin/pricing` 是價格編輯介面；在 GitHub Pages 原型上只能檢視，不能儲存。
- `cloudflare/migrations/0001_course_prices.sql` 建立 D1 價格表、13 門種子資料及變更紀錄表。`cloudflare/pricing-worker.ts` 提供公開讀取 `/api/prices` 和管理員寫入 `/api/admin/prices/:slug`。寫入端會驗證 Cloudflare Access JWT 的簽章、簽發者、受眾、期限與管理員 email 清單，並限制同源請求；不是只靠前端隱藏按鈕。
- 將網站與 Worker 部署在**同一 Cloudflare 網域**後，執行 migration、綁定 D1 為 `PRICES_DB`、設定 `ACCESS_TEAM_DOMAIN`、`ACCESS_AUD`、`ADMIN_EMAILS`（逗號分隔）、對 `/api/admin/*` 建 Cloudflare Access 政策，並在前端建置時設定 `VITE_PRICING_API_URL=/api`。公開 `GET /api/prices` 不要受員工 Access 政策攔住。金流與完整課程移到受保護資料來源後，才能真正開放購買。設定值不可放入公開儲存庫。
- 目前可編輯的價格必須符合 `0 < 現在售價 < 定價`。資料模型保留未來促銷價格與起訖時間，但依經營者決定暫不顯示或設定。API 以 D1 的 `version` 避免舊頁覆蓋新價格，並記錄管理員 email 與前後值。
- 目前 Worker **只處理價格，沒有結帳功能**。未來建立訂單時，伺服器重新讀取有效價格、保存幣別與價格快照，再進入金流。不要接受前端顯示價作為訂單金額；活動到期與同時修改的衝突要由伺服器決定。價格一旦要公開作為實際折扣，請先確認定價代表真實提供的完整課程，並在交易頁清楚揭露所含服務。

## 從目前原型遷移時必須做的事

- 目前 `src/ziwei-lessons.json`、文字課資料、影片網址、測驗題及答案都在公開 GitHub 儲存庫和可下載的前端 bundle。只加登入畫面無法把現有課程變成付費內容。正式版需把完整課文、題目答案及播放憑證移出公開前端，由私有資料來源經 API 依授權送出；公開 Repo 的歷史內容仍可被取得，若要販售獨家內容須使用新製作且受保護的內容，並評估原公開教材的定位。
- 目前進度、筆記、作業與答案只存 `localStorage`。登入上線時要有「將此裝置學習紀錄匯入帳戶」的一次性流程，顯示將匯入的資料、處理重複進度，避免登入後學習成果消失；正式測驗結果以伺服器判分為準。
- 課程後台先做 `draft → review → published → archived`；工作人員可寫草稿，管理員審核發布。編輯中內容不得在顧客頁可見；已購買學員要能看到版本更新說明。
- 功能驗收至少走通：訪客看試看、未購買者無法透過 API 讀正文或影片、顧客下單後由 webhook 開課、重複 webhook 不重複開課、退款撤權、三種身分各自權限、換裝置續看，以及工作人員無法改價格或看無關訂單。

## 等待經營者決定的商業設定

1. 首版採單課買斷，還是全站月／年會員？目前建議先單課買斷；若加會員，要定到期、續費與舊客轉換規則。
2. 主要市場、幣別、付款方式及金流服務商是什麼？這決定結帳頁、電子發票與退費實作。
3. Cloudflare 將接在哪個正式網域？要用 Workers 還是 Pages 部署前端？目前 GitHub Pages 可繼續做公開預覽，但不能作為正式付費課授權層。
4. 紫微課既有 20 支影片與原站課文目前公開；正式付費版要賣哪些新增價值（真人批改、諮詢演練、私有影片、作品回饋等）？這直接決定課程商品頁與授權範圍。
