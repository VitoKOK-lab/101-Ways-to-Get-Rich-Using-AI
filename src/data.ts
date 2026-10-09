import ziweiLessons from './ziwei-lessons.json'
import { newCourses } from './new-courses'

export type LessonBlock = {
  type: string
  text?: string
  caption?: string
  rows?: string[][]
}

export type Lesson = {
  title: string
  time: string
  summary: string
  sections: { heading: string; body: string; blocks?: LessonBlock[] }[]
  exercise: string
  sourceUrl?: string
  videoUrl?: string
  videoDuration?: string
}

export type CourseChapter = { title: string; start: number; end: number; image: string; goal?: string }

export type Course = {
  slug: string
  number: string
  category: string
  level: '入門' | '進階'
  title: string
  shortTitle: string
  subtitle: string
  description: string
  duration: string
  theme: 'teal' | 'ink' | 'vermilion' | 'silver'
  coverWord: string
  imagePanel?: { sheet: 'a' | 'b'; col: 0 | 1 | 2; row: 0 | 1 }
  offer?: { amount: string; unit: string; label: string }
  aiUse?: string
  outcomes: string[]
  lessons: Lesson[]
  chapters?: CourseChapter[]
  provider?: string
  sourceUrl?: string
}

export const ziweiCourse: Course = {
  slug: 'ziwei-foundations',
  number: '01',
  category: '自我探索',
  level: '入門',
  title: '紫微斗數入門，掌握完整大架構。',
  shortTitle: '紫微斗數入門',
  subtitle: '學完立刻可做線上紫微命理師',
  description: '紫微宇宙提供的完整入門課。從出生資料、命宮與主星開始，逐步完成手排命盤，再練習解讀與年度規劃。影片、課文和表格皆在本站閱讀；每階段有作業、檢核與清楚的學習成果。',
  duration: '約 7–10 小時',
  theme: 'ink',
  coverWord: '紫微 / 入門',
  offer: { amount: 'NT$1,200', unit: '／次', label: '諮詢示例起價' },
  aiUse: '可用 AI 整理匿名解盤草稿與諮詢重點；命盤計算和解讀需由本人核對。',
  outcomes: ['完成一張基本手排命盤', '依序辨識十二宮、主星、四化與大限', '寫出一份有保留空間的自我觀察與年度規劃'],
  provider: '紫微宇宙',
  sourceUrl: 'https://ziweiuniverse.com/knowledge/ziwei/course/',
  chapters: [
    { title: '準備資料與盤面', start: 0, end: 3, image: '/images/luxkey-ziwei.webp', goal: '整理出生資料，畫出可使用的空白命盤。' },
    { title: '建立命盤骨架', start: 4, end: 6, image: '/images/luxkey-ziwei-chart.webp', goal: '標出命身宮、十二宮與五行局。' },
    { title: '排出十四主星', start: 7, end: 9, image: '/images/luxkey-ziwei-chart.webp', goal: '依步驟把紫微與天府星系放進盤面。' },
    { title: '補齊星曜與時間線', start: 10, end: 14, image: '/images/luxkey-ziwei-chart.webp', goal: '加入吉煞、四化與大限，完成第一次手排。' },
    { title: '練習解讀', start: 15, end: 17, image: '/images/luxkey-ziwei-read.webp', goal: '按照固定順序閱讀，不急著下定論。' },
    { title: '做自己的年度規劃', start: 18, end: 19, image: '/images/luxkey-ziwei-plan.webp', goal: '把觀察整理成可以回顧的計畫。' },
  ],
  lessons: ziweiLessons as Lesson[],
}

const previewCourses: Course[] = [
  {
    slug: 'tarot-practice',
    number: '02',
    category: '自我探索',
    level: '入門',
    title: '塔羅諮詢：從練習到第一位預約者',
    shortTitle: '塔羅諮詢',
    subtitle: '學完立刻可試辦線上塔羅諮詢',
    description: '先練提問與解讀，再設計諮詢流程、服務範圍及試行方案。這是課程企劃示範，現有內容為四個文字導讀與練習，正式講師影片尚未製作。',
    duration: '約 45 分鐘',
    theme: 'vermilion',
    coverWord: 'TAROT / TALK',
    offer: { amount: 'NT$800', unit: '／次', label: '諮詢示例起價' },
    aiUse: 'AI 協助整理匿名提問、諮詢紀錄和預約說明；解牌與服務界線由本人負責。',
    outcomes: ['完成一份 30 分鐘諮詢流程', '寫出服務範圍、價格與預約說明', '用試行回饋改進第一次服務'],
    lessons: [
      { title: '先練會問，再練解牌', time: '10 分鐘導讀', summary: '從開放問題和傾聽開始，不替對方決定人生。', sections: [{ heading: '把問題問清楚', body: '先請對方描述眼前的情境與想探索的選項。用「這件事你最在意什麼？」代替要求牌卡給出絕對答案，並取得對方同意後再開始。' }, { heading: '保留解讀空間', body: '將牌意當作討論的提示，分清觀察、你的解釋與對方的感受；不要做醫療、法律或投資保證。' }], exercise: '寫下三個開放式提問，和朋友做一次 10 分鐘練習，記錄對方覺得有幫助的部分。' },
      { title: '設計一次讓人安心的諮詢', time: '10 分鐘導讀', summary: '約定流程、隱私、時間與結束方式。', sections: [{ heading: '把 30 分鐘切成三段', body: '前 5 分鐘確認主題與界線；中間 20 分鐘共同探索牌意與選項；最後 5 分鐘由對方說出自己願意嘗試的一步。AI 可在取得同意後協助整理匿名諮詢摘要，但不能替你解牌。' }, { heading: '提前說清楚界線', body: '在預約頁寫明時長、費用、取消規則、保密方式與不提供的專業建議。讓第一次接觸的人知道會發生什麼事。' }], exercise: '完成一頁服務說明，包含適合對象、30 分鐘流程、價格、取消規則與服務界線。' },
      { title: '用小規模試行找到真實需求', time: '12 分鐘導讀', summary: '收集具體回饋，避免只問「喜不喜歡」。', sections: [{ heading: '邀請合適的試行者', body: '向少量願意給具體意見的人說明試行條件。區分朋友支持與願意付費的需求，明確標註體驗價或正式價。' }, { heading: '問可改善的細節', body: '結束後問：哪一刻最清楚？哪裡太快或太模糊？如果再預約一次，你期待什麼不同？得到許可才可引用評語。' }], exercise: '設計五題試行回饋表，邀請一位合適對象實測。' },
      { title: '把服務放上預約頁', time: '10 分鐘導讀', summary: '讓詢問、付款與確認步驟一眼看懂。', sections: [{ heading: '只保留必要資訊', body: '預約頁的順序可以是：服務成果、適合對象、時間與價格、可選時段、付款與取消規則、常見問題。先用一個方案測試，避免選項太多。' }, { heading: '對每個預約有一致回覆', body: '確認訊息應包括日期、時區、形式、準備事項與聯絡方式；結束後再寄一份簡短的回顧問題。' }], exercise: '寫一版 150 字服務介紹與一封預約確認訊息，請不熟悉服務的人找出他仍有的疑問。' },
    ],
  },
  {
    slug: 'booking-marketing',
    number: '03',
    category: '品牌與行銷',
    level: '入門',
    title: '讓詢問變成預約：服務業行銷',
    shortTitle: '預約行銷',
    subtitle: '學完立刻可上架預約流程優化服務',
    description: '適合諮詢、美業、教學與其他預約型服務。用明確方案、可信頁面與有溫度的跟進，把流量接到可衡量的預約流程。課程企劃示範，現有四個文字單元。',
    duration: '約 45 分鐘',
    theme: 'teal',
    coverWord: 'BOOK / MORE',
    offer: { amount: 'NT$6,000', unit: '／案', label: '單案示例起價' },
    aiUse: 'AI 協助整理顧客疑問、預約頁文案和回覆草稿；實際時段與價格需人工核對。',
    outcomes: ['畫出從發現到預約的四步路徑', '完成一頁服務與預約文案', '設定可衡量的詢問與預約指標'],
    lessons: [
      { title: '先定義你要服務誰', time: '9 分鐘導讀', summary: '用情境與需求描述客戶，不用模糊的大眾標籤。', sections: [{ heading: '記下真實的預約動機', body: '查看過去詢問、評論與對話，找出反覆出現的問題、想得到的結果及常見疑慮。選一個最能服務好的情境，先為它設計訊息。AI 可幫你歸類匿名詢問，但結論要回到真實對話核對。' }], exercise: '整理三段真實詢問，寫出對方來找你的時刻、目標與疑慮。' },
      { title: '把方案、價格與流程說清楚', time: '12 分鐘導讀', summary: '減少需要私訊猜測的細節。', sections: [{ heading: '一頁回答六個問題', body: '說明服務適合誰、會做什麼、時長、價格、地點或線上方式、取消與改期規則。客戶越容易比較，越能放心決定。' }], exercise: '寫一版服務頁：標題、成果、流程、時長與價格、預約按鈕、常見問題。' },
      { title: '把內容導到預約，而非只追讚數', time: '10 分鐘導讀', summary: '每則內容只回答一個疑問，給一個下一步。', sections: [{ heading: '用三種內容建立信任', body: '分享服務過程、常見問題的解答、取得同意的客戶故事。每篇只放一個清楚動作，例如查看服務頁或選擇時段；避免誇大效果。' }], exercise: '規劃三篇內容，每篇各寫一個客戶疑問、一個證據與一個預約連結。' },
      { title: '追蹤詢問、預約與到店', time: '10 分鐘導讀', summary: '先用簡單表格找出真正卡住的步驟。', sections: [{ heading: '分段看轉換', body: '每週記錄看見服務頁的人、提出詢問的人、完成預約的人與實際到場的人。若詢問多而預約少，先檢查價格、時段和回覆速度。' }], exercise: '建立四欄週報，設定下一週只改善一個預約障礙。' },
    ],
  },
  {
    slug: 'personal-brand',
    number: '04',
    category: '品牌與行銷',
    level: '入門',
    title: '個人品牌內容：被對的人看見',
    shortTitle: '個人品牌',
    subtitle: '學完立刻可提供個人品牌定位服務',
    description: '從客戶語言、可信證據與簡單的內容節奏出發，建立能長期維持的個人品牌。不是每天大量發文，而是讓適合的人知道你能幫什麼忙。課程企劃示範，現有四個文字單元。',
    duration: '約 40 分鐘',
    theme: 'ink',
    coverWord: 'BE / SEEN',
    offer: { amount: 'NT$5,000', unit: '／案', label: '單案示例起價' },
    aiUse: 'AI 協助整理訪談、產生定位句草稿和內容主題；案例與專業證據人工核對。',
    outcomes: ['寫出清楚的個人服務定位', '規劃三種可持續內容欄目', '完成一週發文與回覆流程'],
    lessons: [
      { title: '說出你幫誰解決什麼事', time: '8 分鐘導讀', summary: '用具體客戶與成果取代空泛標籤。', sections: [{ heading: '一句話說明服務', body: '試著寫「我協助哪一類人，在什麼情境下，透過什麼服務，得到什麼具體改變」。向陌生人讀一次，確認他能說出你提供什麼。' }], exercise: '寫三版定位句，請一位不熟悉你的人說出他的理解。' },
      { title: '用證據讓人信任', time: '10 分鐘導讀', summary: '展示做事方式與案例，不靠誇大的承諾。', sections: [{ heading: '收集可以公開的素材', body: '整理工作過程、方法示範、常見問題與取得同意的案例。用可核對的事實說明你的判斷，不使用未授權的客戶隱私。' }], exercise: '列出五件能展示專業的方法或素材，選一件做成簡短案例。' },
      { title: '設計三個內容欄目', time: '10 分鐘導讀', summary: '建立可重複的節奏。', sections: [{ heading: '讓主題回答常見問題', body: '例如「第一次預約會發生什麼」「我如何做決定」「服務後如何練習」。每個欄目都有固定讀者問題與下一步，製作時較不容易卡住。可以請 AI 先列題，但案例與主張必須由你核對。' }], exercise: '為三個欄目各寫一個標題、重點與行動邀請。' },
      { title: '從內容接到對話', time: '9 分鐘導讀', summary: '把回覆、私訊與預約串成自然流程。', sections: [{ heading: '設計一致的回覆方式', body: '先回答問題，再給合適資源；只有對方表達需求時才邀請預約。記下反覆出現的問題，反過來更新服務頁與內容。' }], exercise: '排出一週兩篇內容和每天 15 分鐘回覆的節奏，寫一則不施壓的預約邀請。' },
    ],
  },
  {
    slug: 'ai-solo-business',
    number: '05',
    category: 'AI 商務服務',
    level: '入門',
    title: '用 AI 打理一人事業的日常',
    shortTitle: 'AI 一人事業',
    subtitle: '學完立刻可提供一人事業 AI 流程試案',
    description: '選一件重複工作，建立可檢查的 AI 協作流程：整理詢問、準備內容、回覆草稿與每週回顧。涉及客戶資料時先去識別化。課程企劃示範，現有四個文字單元。',
    duration: '約 40 分鐘',
    theme: 'silver',
    coverWord: 'MAKE / SPACE',
    offer: { amount: 'NT$3,000', unit: '／案', label: '流程試案起價' },
    aiUse: 'AI 協助處理重複整理、回覆草稿與每週回顧；涉及個資先去識別化。',
    outcomes: ['找出最值得節省的一項工作', '寫出可重用的 AI 任務簡報', '建立人工確認與資料保護清單'],
    lessons: [
      { title: '找出最耗時的重複工作', time: '8 分鐘導讀', summary: '先看頻率、耗時與錯誤風險。', sections: [{ heading: '從一週的事務挑選', body: '記下詢問整理、內容初稿、行程確認與回顧等工作。第一個任務最好有固定輸入、明確輸出，而且你能快速檢查結果。' }], exercise: '列出三件每週重複的工作，選一件可以在 10 分鐘內核對結果的任務。' },
      { title: '寫一份可重用的任務簡報', time: '10 分鐘導讀', summary: '把背景、語氣、輸入與不可猜測的地方寫清楚。', sections: [{ heading: '要求可檢查的輸出', body: '描述目標對象、原始資料、回覆格式與品質標準。要求 AI 標記缺少的資訊，不能自己補造價格、時段或服務承諾。' }], exercise: '為上一單元選的工作寫出「背景、輸入、輸出、待人工確認」四欄提示。' },
      { title: '保護客戶資料並人工把關', time: '10 分鐘導讀', summary: '把個資和承諾留在可控範圍。', sections: [{ heading: '先去識別化', body: '不要把姓名、生日、電話、完整諮詢紀錄直接放進不適合處理個資的工具。檢查平台設定與使用條款，必要時只提供匿名摘要。' }, { heading: '公開前逐項確認', body: '對價格、預約時間、效果描述、法規與來源回到原始資料核對。AI 草稿可以加速，對客戶的承諾仍由你決定。' }], exercise: '做一張五項檢查表，拿一段匿名資料試跑，記下所有需修改的地方。' },
      { title: '每週回顧是否真的省時', time: '9 分鐘導讀', summary: '看交付品質與時間，不只看產出量。', sections: [{ heading: '比較前後的工作量', body: '記下原本耗時、AI 協作後耗時、人工修改次數與客戶是否更容易理解。若修正時間變多，就縮小任務範圍或改善輸入。' }], exercise: '完成一張一週紀錄：節省時間、修改次數、錯誤與下一次只改的一件事。' },
    ],
  },
]

export const courses: Course[] = [ziweiCourse, ...previewCourses, ...newCourses]

export const categories = ['全部', '自我探索', '品牌與行銷', 'AI 內容接案', 'AI 商務服務', '電商與數位商品']
