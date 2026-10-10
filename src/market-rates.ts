export type MarketRate = {
  price: string
  unit?: string
  scope: string
  sourceName?: string
  sourceUrl?: string
  comparable: boolean
}

// Published prices from external providers. These are not AI RICH 101 tuition,
// quotes to our learners, or evidence of what a beginner will earn.
export const marketRates: Record<string, MarketRate> = {
  'ziwei-foundations': {
    price: '公開可比報價不足',
    scope: '紫微諮詢須先固定時長、是否提供書面命盤與後續答疑，再比較報價。',
    comparable: false,
  },
  'tarot-practice': {
    price: '公開可比報價不足',
    scope: '塔羅諮詢須先固定時長、題數、文字或視訊形式，再比較報價。',
    comparable: false,
  },
  'website-building': {
    price: 'NT$15,000–50,000', unit: '／案',
    scope: '固定版型形象網站；客製功能、網域與維護另計。',
    sourceName: 'PRO360 網頁設計費用', sourceUrl: 'https://www.pro360.com.tw/price/web_design', comparable: true,
  },
  'social-graphic-editor': {
    price: 'NT$500–2,000', unit: '／則',
    scope: '單則社群圖文；每月篇數、排程與留言回覆另談。',
    sourceName: 'PRO360 社群代操費用', sourceUrl: 'https://www.pro360.com.tw/price/social_marketing', comparable: true,
  },
  'facebook-ads': {
    price: '廣告預算的 15–25%', unit: '／月',
    scope: '廣告代操服務費；實際投放給 Meta 的廣告費另計。',
    sourceName: 'PRO360 廣告代操行情', sourceUrl: 'https://www.pro360.com.tw/price/advertising', comparable: true,
  },
  'short-video-filming': {
    price: 'NT$6,000–50,000', unit: '／支',
    scope: '相近服務：完整影片拍攝與製作；單純現場帶拍需另詢價。',
    sourceName: 'PRO360 影片拍攝報價', sourceUrl: 'https://www.pro360.com.tw/price/short_video_production', comparable: false,
  },
  'ai-video-editing': {
    price: 'NT$1,000–7,000', unit: '／支',
    scope: '約 30 秒短片的基礎至進階剪輯；拍攝素材另計。',
    sourceName: 'PRO360 30 秒影片報價', sourceUrl: 'https://www.pro360.com.tw/price/30mins_edit_fee', comparable: true,
  },
  'ai-copy-design': {
    price: 'NT$500–2,000', unit: '／則',
    scope: '社群圖文一則；多圖、長文、素材授權與修改輪次另談。',
    sourceName: 'PRO360 社群代操費用', sourceUrl: 'https://www.pro360.com.tw/price/social_marketing', comparable: true,
  },
  'ai-resume-service': {
    price: 'NT$450–3,000', unit: '／頁',
    scope: '相近服務：履歷代寫；本課的履歷健檢與修改建議需另詢價。',
    sourceName: 'PRO360 文案寫作費用', sourceUrl: 'https://www.pro360.com.tw/price/writing_service', comparable: false,
  },
  'online-course-building': {
    price: '公開可比報價不足',
    scope: '試課企劃、影片製作、平台設定與金流串接差異大，應逐項估價。',
    comparable: false,
  },
  'ai-still-to-video': {
    price: 'NT$500–1,300', unit: '／支',
    scope: '相近服務：30 秒照片剪輯影片；AI 動態生成與商用授權不在此報價內。',
    sourceName: 'PRO360 30 秒影片報價', sourceUrl: 'https://www.pro360.com.tw/price/30mins_edit_fee', comparable: false,
  },
  'ai-digital-presenter': {
    price: '公開可比報價不足',
    scope: '需依數字人授權、配音、時長、商用範圍與修改次數詢價。',
    comparable: false,
  },
  'private-domain-operations': {
    price: 'NT$10,000–25,000', unit: '／月',
    scope: '相近服務：LINE OA 基礎代操；ManyChat、預約串接與一次性建置另詢價。',
    sourceName: 'PRO360 社群代操費用', sourceUrl: 'https://www.pro360.com.tw/price/social_marketing', comparable: false,
  },
}
