# AI RICH 101

繁體中文的「100 種用 AI 賺錢的方法」課程平台原型。首波上架 13 門課：紫微斗數一門完整影片課，另有 12 門具體接案方向的文字實作課。平台名稱為 **AI RICH 101**；視覺沿用使用者提供的 Luxkey CIS 色彩與字體，不使用舊 Luxkey 字標。

## 本機執行

需要 Node.js 20.19+ 或 22.12+。

```bash
npm ci
npm run dev
```

`npm run typecheck` 執行 TypeScript 檢查，`npm run check:highlights` 核對紫微課每段重點與原文，`npm run build -- --mode pages` 建立 GitHub Pages 正式版本，`npm run preview -- --mode pages` 可在儲存庫路徑預覽建置結果。
在限制 npm 預設快取寫入的雲端環境，可改用 `npm ci --cache /tmp/ai-rich-npm-cache`。

## 線上版本

`main` 分支推送後由 GitHub Actions 部署到 [AI RICH 101](https://vitokok-lab.github.io/101-Ways-to-Get-Rich-Using-AI/)。GitHub Pages 來源設為 GitHub Actions。網站與儲存庫均公開。

## 課程範圍

- [13 門課程](https://vitokok-lab.github.io/101-Ways-to-Get-Rich-Using-AI/#/explore)各有主題照片、服務定位、示例價格、學習成果與課堂練習。02–13 是每門四個文字單元的企劃示範，尚無講師影片或人工評閱。
- [紫微斗數課](https://vitokok-lab.github.io/101-Ways-to-Get-Rich-Using-AI/#/courses/ziwei-foundations)保留原 20 堂影片、課文與表格，並提供本站作業、排盤對答案工具、六次檢核及結業作品草稿。全 20 堂課文以藍綠底色標示宮位、朱紅淺底加粗標示教學關鍵句；窄螢幕的表格可橫向滑動。
- 展示價格是服務或商品的**示例定價**，不是學完保證收入。未完成真人試案、作品評閱、成本與需求驗證前，不宜把價格當作學員可取得的收入。
- 學習進度、作業、測驗答案、結業作品及筆記存於目前瀏覽器的 `localStorage`。清除瀏覽器資料後無法復原。登入、雲端同步、購買、付款和付費課權限控管尚未接入。

紫微課內容取自使用者指定的 `VitoKOK-lab/Ziwei-Doushu` 儲存庫 `knowledge/ziwei/course/` 與 20 個課文頁面，匯入版本為 `8fc6dd481877ccb61b32689a96ea3e83773f05dc`。影片從 `video.ziweiuniverse.com` 播放；排盤引擎與對答案介面沿用該儲存庫的瀏覽器端程式並整合到本站。詳見[課程企劃與製作缺口](docs/course-strategy.md)與[全平台課文重點標示規範](docs/course-content-standard.md)。

## 品牌與圖片

`src/luxkey.css` 來自使用者上傳的 Luxkey Design System `colors_and_type.css`。AI RICH 101 字標另行設計，畫面沿用白、銀灰、朱紅、藍綠、青藍及墨黑。`public/images/` 的女性工作情境圖片均為本平台生成的示意素材，不代表真實講師或學員。正式課程仍需要真實講師與服務案例素材。
