# LUXKEY Academy

繁體中文的線上課程平台前端原型。它參考 [MasterClass](https://www.masterclass.com/) 公開頁面的資訊結構，轉成 Luxkey 自己的視覺語言，並沿用使用者提供的 `colors_and_type.css` 色彩與字體 token。

## 執行

需要 Node.js 20.19+ 或 22.12+。

```bash
npm ci
npm run dev
```

在終端顯示的本機網址開啟網站。執行 `npm run build` 可以完成 TypeScript 檢查並建立正式靜態檔；`npm run preview` 可檢視建置結果。在受限雲端環境中若 npm 預設快取無法寫入，可使用 `npm ci --cache /tmp/luxkey-npm-cache`。

## 線上預覽

`main` 分支上的 GitHub Actions 會建立並部署靜態網站至 [GitHub Pages](https://vitokok-lab.github.io/101-Ways-to-Get-Rich-Using-AI/)。儲存庫的 **Settings → Pages → Build and deployment** 來源為 **GitHub Actions**。部署時使用儲存庫路徑作為 Vite `base`；本機開發仍從 `/` 開啟。網站與原始碼儲存庫均公開。

## 原型範圍

- 首頁、目標選課引導、課程搜尋與分類、課程詳情、影片與文字課堂、我的學習。
- 四門示範課程，以及從 `VitoKOK-lab/Ziwei-Doushu` 匯入的「紫微斗數入門」完整 20 堂課。紫微課分四階段，保留課文段落、表格、影片與來源連結。
- 學習進度與課堂筆記存於目前瀏覽器的 `localStorage`。
- 桌機與手機版面，以及鍵盤焦點樣式。

紫微課的文字來源為原儲存庫 `knowledge/ziwei/course/` 和 `lesson-01` 至 `lesson-20` 的頁面，匯入時的來源版本為 `8fc6dd481877ccb61b32689a96ea3e83773f05dc`。影片直接從 `video.ziweiuniverse.com` 播放，沒有複製影片檔到本站。「對答案」計算工具仍在[紫微宇宙原課頁](https://ziweiuniverse.com/knowledge/ziwei/course/)，每堂課都提供連結。除了這門匯入課，其餘四門仍是示範內容。登入、雲端同步、購買與付款尚未接入正式服務。

## 品牌來源

`src/luxkey.css` 複製自使用者上傳的 Luxkey Design System 中的 `colors_and_type.css`。字體透過其原始 Google Fonts 設定載入；標誌使用系統指定的 Jost Light `LUXKEY` 字標。首頁、課程封面及紫微課的四個章節海報是為此原型產生的 AI 圖像，位於 `public/images/`；它們是示意素材，不代表真實講師。沒有使用 MasterClass 圖片、紫微宇宙舊照片或附件中標示不得使用的參考圖。正式上線前，建議換成真實講師及課程拍攝素材。
