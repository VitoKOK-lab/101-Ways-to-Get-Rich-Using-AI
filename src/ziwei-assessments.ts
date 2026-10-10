export type CheckQuestion = {
  prompt: string
  options: [string, string, string, string]
  answer: number
  explanation: string
}

export const chapterChecks: Record<number, { title: string; questions: CheckQuestion[] }> = {
  3: {
    title: '小測驗 01｜準備盤面',
    questions: [
      { prompt: '紫微命盤的 4×4 格子中，外圈有幾格？', options: ['8 格', '10 格', '12 格', '16 格'], answer: 2, explanation: '外圈十二格是十二宮，中間四格整理出生資料。' },
      { prompt: '閏月十六日之後出生，本課採用哪個月份排盤？', options: ['本月', '下個月', '上個月', '一律正月'], answer: 1, explanation: '課文採閏月初一到十五算本月，十六日起算下個月。' },
      { prompt: '一天十二個時辰，每個時辰約幾小時？', options: ['1 小時', '2 小時', '3 小時', '4 小時'], answer: 1, explanation: '十二個時辰把二十四小時各分成兩小時。' },
    ],
  },
  6: {
    title: '小測驗 02｜建立命盤骨架',
    questions: [
      { prompt: '安命宮時，從生月宮起子時，往哪個方向數到出生時辰？', options: ['逆時針', '順時針', '往中央', '任一方向'], answer: 0, explanation: '從生月宮起子時，逆時針數到生時是命宮；順數是身宮。' },
      { prompt: '十二宮名從命宮開始，依什麼方向排？', options: ['順時針', '逆時針', '由上到下', '按生日決定'], answer: 1, explanation: '宮名從命宮開始逆時針排。' },
      { prompt: '金四局的局數是多少？', options: ['2', '3', '4', '5'], answer: 2, explanation: '金四局的局數是 4，也會決定第一段大限起歲。' },
    ],
  },
  9: {
    title: '小測驗 03｜排出主星',
    questions: [
      { prompt: '安紫微星需要哪兩項資料？', options: ['農曆生月與時辰', '農曆出生日與五行局數', '出生年支與性別', '命宮與對宮'], answer: 1, explanation: '本課用農曆出生日和五行局數求紫微星位置。' },
      { prompt: '紫微星系主星從紫微起，依什麼方向排？', options: ['順時針', '逆時針', '只看對宮', '沒有固定方向'], answer: 1, explanation: '紫微星系從紫微逆時針排；天府星系則從天府順時針排。' },
      { prompt: '兩個星系全部排好，共有幾顆主星？', options: ['6', '8', '12', '14'], answer: 3, explanation: '紫微星系六顆，加上天府星系八顆，共十四顆。' },
    ],
  },
  14: {
    title: '小測驗 04｜完成手排命盤',
    questions: [
      { prompt: '文昌與文曲的位置主要看哪一項出生資料？', options: ['出生時辰', '農曆生月', '出生年支', '五行局'], answer: 0, explanation: '六吉星分組依生月、時辰或年干；文昌文曲看出生時辰。' },
      { prompt: '生年四化應先查哪一項？', options: ['出生年天干', '出生年地支', '農曆生月', '命宮對宮'], answer: 0, explanation: '生年四化依出生年的天干查表。' },
      { prompt: '第一段大限從哪一宮與幾歲開始？', options: ['夫妻宮、1 歲', '命宮、五行局局數歲', '財帛宮、10 歲', '命宮、出生年支歲'], answer: 1, explanation: '第一段大限從命宮開始，起歲就是五行局的局數。' },
    ],
  },
  17: {
    title: '小測驗 05｜練習解讀',
    questions: [
      { prompt: '初讀命盤，本課建議第一步先看什麼？', options: ['流年四化', '命宮主星', '只看煞星', '先看所有宮位'], answer: 1, explanation: '先看命宮主星，再看三方四正、亮度與四化。' },
      { prompt: '空宮沒有十四主星時，先借哪一宮的主星？', options: ['隔壁宮', '命宮', '正對面的宮', '當年的流年宮'], answer: 2, explanation: '空宮借正對面那一宮的主星，仍要看原宮其他星曜。' },
      { prompt: '想看工作主題，應先找哪一宮？', options: ['官祿宮', '夫妻宮', '父母宮', '福德宮'], answer: 0, explanation: '官祿宮是觀察工作與事業的起點，也要結合三方四正。' },
    ],
  },
  19: {
    title: '小測驗 06｜從命盤到規劃',
    questions: [
      { prompt: '對自己的命盤做十年規劃，應先找什麼？', options: ['今年流年四化', '現在虛歲落在哪段大限', '只看出生月份', '只看命宮亮度'], answer: 1, explanation: '先用虛歲找到目前的大限，再看那一宮及三方四正。' },
      { prompt: '找某一年的流年命宮，先看當年哪一項？', options: ['地支', '農曆生日', '出生時辰', '五行局'], answer: 0, explanation: '當年地支對應的宮位，就是那年的流年命宮。' },
      { prompt: '每年的流年四化，查表時使用哪個天干？', options: ['出生年天干', '當年天干', '命宮宮干', '夫妻宮宮干'], answer: 1, explanation: '流年四化依當年的天干查表；生年四化則依出生年天干。' },
      { prompt: '讀感情、工作與財務時，最合理的做法是什麼？', options: ['只看一顆星下定論', '只看煞星', '先找相應宮位，再合看三方四正', '一律看流年命宮'], answer: 2, explanation: '以夫妻、官祿、財帛宮為起點，再結合三方四正。' },
      { prompt: '若準備替客戶解盤，哪一項最重要？', options: ['保證結果一定發生', '清楚說明解讀界線並保護個資', '直接轉傳客戶命盤', '省略資料核對'], answer: 1, explanation: '服務必須保護資料、核對資訊，並避免對健康、法律或財務作保證。' },
    ],
  },
}
