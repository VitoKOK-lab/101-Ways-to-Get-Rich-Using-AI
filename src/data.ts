import ziweiLessons from './ziwei-lessons.json'
import ziweiKeyIdeas from './ziwei-key-ideas.json'
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
  sections: { heading: string; body: string; keyIdea: string; blocks?: LessonBlock[] }[]
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
  coverImage?: string
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
  lessons: ziweiLessons.map((lesson, lessonIndex) => ({
    ...lesson,
    sections: lesson.sections.map((section, sectionIndex) => ({
      ...section,
      keyIdea: ziweiKeyIdeas[lessonIndex][sectionIndex].quote,
    })),
  })) as Lesson[],
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
    coverWord: '塔羅 / 諮詢',
    aiUse: 'AI 協助整理匿名提問、諮詢紀錄和預約說明；解牌與服務界線由本人負責。',
    outcomes: ['完成一份 30 分鐘諮詢流程', '寫出服務範圍、價格與預約說明', '用試行回饋改進第一次服務'],
    lessons: [
      { title: '先練會問，再練解牌', time: '10 分鐘導讀', summary: '從開放問題和傾聽開始，不替對方決定人生。', sections: [{ heading: '把問題問清楚', keyIdea: '先請對方描述眼前的情境與想探索的選項。', body: '先請對方描述眼前的情境與想探索的選項。用「這件事你最在意什麼？」代替要求牌卡給出絕對答案，並取得對方同意後再開始。' }, { heading: '保留解讀空間', keyIdea: '將牌意當作討論的提示，分清觀察、你的解釋與對方的感受；不要做醫療、法律或投資保證。', body: '將牌意當作討論的提示，分清觀察、你的解釋與對方的感受；不要做醫療、法律或投資保證。' }], exercise: '寫下三個開放式提問，和朋友做一次 10 分鐘練習，記錄對方覺得有幫助的部分。' },
      { title: '設計一次讓人安心的諮詢', time: '10 分鐘導讀', summary: '約定流程、隱私、時間與結束方式。', sections: [{ heading: '把 30 分鐘切成三段', keyIdea: '前 5 分鐘確認主題與界線；中間 20 分鐘共同探索牌意與選項；最後 5 分鐘由對方說出自己願意嘗試的一步。', body: '前 5 分鐘確認主題與界線；中間 20 分鐘共同探索牌意與選項；最後 5 分鐘由對方說出自己願意嘗試的一步。AI 可在取得同意後協助整理匿名諮詢摘要，但不能替你解牌。' }, { heading: '提前說清楚界線', keyIdea: '在預約頁寫明時長、費用、取消規則、保密方式與不提供的專業建議。', body: '在預約頁寫明時長、費用、取消規則、保密方式與不提供的專業建議。讓第一次接觸的人知道會發生什麼事。' }], exercise: '完成一頁服務說明，包含適合對象、30 分鐘流程、價格、取消規則與服務界線。' },
      { title: '用小規模試行找到真實需求', time: '12 分鐘導讀', summary: '收集具體回饋，避免只問「喜不喜歡」。', sections: [{ heading: '邀請合適的試行者', keyIdea: '向少量願意給具體意見的人說明試行條件。', body: '向少量願意給具體意見的人說明試行條件。區分朋友支持與願意付費的需求，明確標註體驗價或正式價。' }, { heading: '問可改善的細節', keyIdea: '結束後問：哪一刻最清楚？哪裡太快或太模糊？如果再預約一次，你期待什麼不同？', body: '結束後問：哪一刻最清楚？哪裡太快或太模糊？如果再預約一次，你期待什麼不同？得到許可才可引用評語。' }], exercise: '設計五題試行回饋表，邀請一位合適對象實測。' },
      { title: '把服務放上預約頁', time: '10 分鐘導讀', summary: '讓詢問、付款與確認步驟一眼看懂。', sections: [{ heading: '只保留必要資訊', keyIdea: '預約頁的順序可以是：服務成果、適合對象、時間與價格、可選時段、付款與取消規則、常見問題。', body: '預約頁的順序可以是：服務成果、適合對象、時間與價格、可選時段、付款與取消規則、常見問題。先用一個方案測試，避免選項太多。' }, { heading: '對每個預約有一致回覆', keyIdea: '確認訊息應包括日期、時區、形式、準備事項與聯絡方式；結束後再寄一份簡短的回顧問題。', body: '確認訊息應包括日期、時區、形式、準備事項與聯絡方式；結束後再寄一份簡短的回顧問題。' }], exercise: '寫一版 150 字服務介紹與一封預約確認訊息，請不熟悉服務的人找出他仍有的疑問。' },
    ],
  },

]

export const courses: Course[] = [ziweiCourse, ...previewCourses, ...newCourses]

export const categories = ['全部', '自我探索', '網站與內容', '廣告與影音', 'AI 接案服務', '客戶經營']
