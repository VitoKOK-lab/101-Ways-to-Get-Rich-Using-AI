export type MarketRateTier = {
  label: string
  price: string
  unit?: string
}

export type MarketRate = {
  price: string
  unit?: string
  scope: string
  tiers: MarketRateTier[]
}

// Service-rate estimates supplied by the platform operator on 2026-10-10.
// They are not independently verified market statistics, course tuition,
// learner earnings, or a quote for a particular project.
export const marketRates: Record<string, MarketRate> = {
  'ziwei-foundations': {
    price: 'NT$600–3,600', unit: '／次',
    scope: '本站紫微諮詢參考區間依經營者先前指定；下列單事、全盤和名家方案是不同服務規格，不能視為同一方案的報價。時長與書面命盤另依服務內容確認。',
    tiers: [
      { label: '單項／單事問事', price: 'NT$800–1,500', unit: '／次' },
      { label: '全盤精批／流年運勢', price: 'NT$2,500–6,000', unit: '／次' },
      { label: '名家／十年大運', price: 'NT$8,000–20,000+' },
    ],
  },
  'tarot-practice': {
    price: 'NT$800–1,500', unit: '／30 分鐘',
    scope: '題數、時長與線上或實體形式會影響報價；預約前應寫明服務界線。',
    tiers: [
      { label: '計題', price: 'NT$300–800', unit: '／題' },
      { label: '計時', price: 'NT$800–1,500', unit: '／30 分鐘' },
      { label: '深度諮詢', price: 'NT$1,500–3,000', unit: '／60 分鐘' },
    ],
  },
  'website-building': {
    price: 'NT$10,000–35,000', unit: '／一頁式網站',
    scope: '主機約 NT$3,000–10,000／年及網域續費另計；電商 SaaS 平台年費可能另需 NT$30,000–100,000。',
    tiers: [
      { label: '一頁式網站', price: 'NT$10,000–35,000', unit: '／案' },
      { label: '套版形象官網', price: 'NT$20,000–60,000', unit: '／案' },
      { label: '半客製／客製化官網', price: 'NT$60,000–200,000+', unit: '／案' },
      { label: '電商購物網站', price: 'NT$50,000–200,000+', unit: '／案' },
    ],
  },
  'social-graphic-editor': {
    price: 'NT$800–2,500', unit: '／篇',
    scope: '月費方案需寫明篇數、限動、互動與客服回覆範圍。',
    tiers: [
      { label: '單篇圖文排版', price: 'NT$800–2,500', unit: '／篇' },
      { label: '基礎月費代操，約 8–12 篇', price: 'NT$12,000–25,000', unit: '／月' },
      { label: '深度互動月費代操', price: 'NT$30,000–60,000', unit: '／月' },
    ],
  },
  'facebook-ads': {
    price: 'NT$8,000–25,000', unit: '／月服務費',
    scope: '付給 Meta 的媒體廣告費通常另計；客戶每月廣告預算常需約 NT$20,000–30,000 以上。抽成制以實際廣告花費計算。',
    tiers: [
      { label: '固定代操服務費', price: 'NT$8,000–25,000', unit: '／月' },
      { label: '抽成制', price: '廣告實花預算的 15%–20%' },
      { label: '含素材製作全包方案', price: 'NT$25,000–50,000', unit: '／月' },
    ],
  },
  'short-video-filming': {
    price: 'NT$5,000–15,000', unit: '／支全套',
    scope: '全套通常含企劃、拍攝及剪輯；帶操、演員、平台上片與修改次數應在報價中另列。',
    tiers: [
      { label: '企劃＋拍攝＋剪輯', price: 'NT$5,000–15,000', unit: '／支' },
      { label: '基礎包月，約 8–12 支', price: 'NT$30,000–60,000', unit: '／月' },
      { label: '全包式 IP 打造', price: 'NT$80,000–150,000+', unit: '／月' },
    ],
  },
  'ai-video-editing': {
    price: 'NT$1,500–4,000', unit: '／支',
    scope: 'AI 工具成本、生成素材授權、人工調色與修改輪次需按專案確認。',
    tiers: [
      { label: '模板生成／基礎精修', price: 'NT$1,500–4,000', unit: '／支' },
      { label: '客製腳本＋AI 生成＋人工後製', price: 'NT$5,000–15,000', unit: '／支' },
    ],
  },
  'ai-copy-design': {
    price: 'NT$500–1,500', unit: '／組',
    scope: 'AI 指令調校、品牌風格一致性及人工修圖去瑕疵應納入交付範圍。',
    tiers: [
      { label: '單套圖文與精修', price: 'NT$500–1,500', unit: '／組' },
      { label: '品牌 AI 素材包月', price: 'NT$10,000–30,000', unit: '／月' },
    ],
  },
  'ai-resume-service': {
    price: 'NT$800–1,800', unit: '／份',
    scope: 'ATS 關鍵字、英文翻譯與面試練習不一定包含在基礎方案內，應按交付內容報價。',
    tiers: [
      { label: '基礎 AI 潤飾＋版面調整', price: 'NT$800–1,800', unit: '／份' },
      { label: '一對一諮詢＋履歷重構', price: 'NT$2,500–6,000', unit: '／份' },
    ],
  },
  'online-course-building': {
    price: 'NT$30,000–80,000', unit: '／平台代建置',
    scope: '平台訂閱、影片拍攝、金流、維護與課程企劃須分項確認；SaaS 年費可能約 NT$30,000–50,000，另計。',
    tiers: [
      { label: '平台代建置', price: 'NT$30,000–80,000', unit: '／案' },
      { label: 'WordPress LMS 專屬架設', price: 'NT$60,000–150,000+', unit: '／案' },
      { label: '企劃＋拍攝＋上架全案', price: 'NT$100,000–300,000+', unit: '／案' },
    ],
  },
  'ai-still-to-video': {
    price: 'NT$20,000–60,000', unit: '／廣告短片',
    scope: '此區間指 15–30 秒廣告級 AI 短片，包含腳本、分鏡、動態生成、配音音效與剪輯等服務；簡單圖片轉影片並不等同此規格。',
    tiers: [
      { label: '廣告級 AI 短片，15–30 秒', price: 'NT$20,000–60,000', unit: '／支' },
      { label: '高規格概念片／動畫片', price: 'NT$80,000–200,000+', unit: '／支' },
    ],
  },
  'ai-digital-presenter': {
    price: 'NT$2,000–6,000', unit: '／支影片',
    scope: '真人肖像與聲音須取得授權；建模、平台訂閱、商用範圍與修改次數應另行確認。',
    tiers: [
      { label: '專屬形象／聲音克隆', price: 'NT$10,000–30,000', unit: '／次' },
      { label: '單支數字人影片', price: 'NT$2,000–6,000', unit: '／支' },
      { label: '批量產出，約 10–20 支', price: 'NT$20,000–50,000', unit: '／月' },
    ],
  },
  'private-domain-operations': {
    price: 'NT$15,000–35,000', unit: '／基礎建置',
    scope: 'LINE OA、ManyChat 流程、CRM 標籤、預約系統與會員串接的範圍應分別確認；第三方平台費另計。',
    tiers: [
      { label: 'LINE OA／社群基礎建置', price: 'NT$15,000–35,000', unit: '／案' },
      { label: '月費代操＋自動化腳本', price: 'NT$25,000–60,000', unit: '／月' },
      { label: '私域變現架構顧問', price: 'NT$50,000–150,000', unit: '／專案' },
    ],
  },
}
