export type Lesson = {
  title: string
  time: string
  summary: string
  sections: { heading: string; body: string }[]
  exercise: string
}

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
  outcomes: string[]
  lessons: Lesson[]
}

export const courses: Course[] = [
  {
    slug: 'ai-workflow',
    number: '01',
    category: 'AI 實作',
    level: '入門',
    title: '讓 AI 接手重複工作',
    shortTitle: 'AI 工作流',
    subtitle: '從一件每天都要做的事開始，把時間拿回來。',
    description: '不是收集更多工具，而是找出真正值得交給 AI 的工作。用四個短單元，建立一套可以反覆使用、也知道何時需要人工把關的工作流。',
    duration: '約 45 分鐘',
    theme: 'teal',
    coverWord: 'WORK / FLOW',
    outcomes: ['畫出一個清楚的工作流程', '寫出可重用的任務簡報', '找出自動化與人工審核的分界'],
    lessons: [
      {
        title: '先找出時間流向',
        time: '8 分鐘導讀',
        summary: '把一週的重複工作攤開，找到第一個值得改造的環節。',
        sections: [
          { heading: '從頻率與摩擦開始', body: '不要先問「哪個 AI 工具最強」。先記下你一週做過三次以上、每次都要重來的工作。標記它花費的時間、需要的資料，以及做錯時的代價。' },
          { heading: '選一個小而明確的起點', body: '好的第一個任務有固定輸入、明確輸出，而且結果容易檢查。例如：把會議筆記整理成待辦清單，比「幫我處理整個專案」更容易做好。' },
        ],
        exercise: '寫下你這週最常重複的三件事，圈出其中一件能在 15 分鐘內檢查結果的工作。',
      },
      {
        title: '寫一份能重用的任務簡報',
        time: '10 分鐘導讀',
        summary: '讓工具知道背景、輸入、輸出格式與品質標準。',
        sections: [
          { heading: '給背景，也給邊界', body: '把角色、目標、讀者、可使用的資料與不能自行推測的地方寫在同一份簡報裡。真正有用的指令，像一位同事收到的清楚工作交辦。' },
          { heading: '指定可檢查的成果', body: '要求條列結論、原始依據與待確認事項。固定格式能讓下一次使用更快，也讓你更容易看出錯誤。' },
        ],
        exercise: '替上一單元選出的工作，寫下「背景、輸入、輸出、不可猜測」四個欄位。',
      },
      {
        title: '把流程串起來',
        time: '12 分鐘導讀',
        summary: '拆開輸入、處理、檢查和交付，不急著一次全自動。',
        sections: [
          { heading: '先做半自動版本', body: '把任務分為資料收集、初稿產生、人工檢查和發送四段。先讓 AI 幫你完成其中一段，保留可追溯的原始資料。' },
          { heading: '讓每一步都有交接標準', body: '描述進入下一步之前必須符合的條件：是否有來源、是否缺欄位、是否涉及敏感資訊。這些條件比一條很長的提示更可靠。' },
        ],
        exercise: '畫出四步流程，標註每一步的負責者與完成條件。',
      },
      {
        title: '建立最後一道把關',
        time: '9 分鐘導讀',
        summary: '用簡單的檢查表，決定什麼可以交付。',
        sections: [
          { heading: '對高風險內容留人工確認', body: '涉及數字、承諾、法務、客戶資料和公開發布的內容，應回到原始資料檢查。速度提升的前提，是知道錯誤會在哪裡發生。' },
          { heading: '每週微調一次', body: '記錄哪一步最常需要修改。下一週只改一個條件，觀察是否真的省下時間，而不是只讓流程看起來更複雜。' },
        ],
        exercise: '列出三項交付前必查的項目，並指定誰擁有最終確認權。',
      },
    ],
  },
  {
    slug: 'market-validation',
    number: '02',
    category: '創業',
    level: '入門',
    title: '從想法到第一筆訂單',
    shortTitle: '市場驗證',
    subtitle: '不要先做完整產品。先找到真正願意付費的人。',
    description: '用小規模訪談、明確的提案與一次真實銷售，驗證你以為存在的需求。把模糊的好點子，變成有證據的下一步。',
    duration: '約 35 分鐘',
    theme: 'vermilion',
    coverWord: 'MAKE / IT REAL',
    outcomes: ['界定第一群目標客戶', '設計不帶答案的訪談問題', '提出一個可測試的最小方案'],
    lessons: [
      { title: '找對第一群人', time: '8 分鐘導讀', summary: '從具體情境定義客戶，而不是從廣泛人口標籤開始。', sections: [{ heading: '縮小場景', body: '描述誰在什麼時候遇到什麼問題，以及現在用什麼方法勉強解決。場景愈具體，愈容易找到可以對話的人。' }], exercise: '寫下五位可能正在面對同一問題的人，聯絡其中兩位。' },
      { title: '問出真實需求', time: '10 分鐘導讀', summary: '請對方說過去的行動，不問他會不會買。', sections: [{ heading: '看行為，不收好評', body: '問「上次遇到這件事是什麼時候？」「你怎麼處理？」「花了多少時間或錢？」。真實故事比對未來的客套承諾更可靠。' }], exercise: '準備三個關於過去行為的問題，完成至少一次訪談。' },
      { title: '做一個能成交的提案', time: '12 分鐘導讀', summary: '把成果、交付方式、期限與價格說清楚。', sections: [{ heading: '讓對方能做決定', body: '不必先做完整系統。用一頁提案說明你解決的問題、會交付什麼、何時交付，以及試用或購買的條件。' }], exercise: '寫出 100 字以內的提案，向一位受訪者提出具體邀請。' },
    ],
  },
  {
    slug: 'brand-story',
    number: '03',
    category: '品牌',
    level: '入門',
    title: '說清楚，你為什麼值得被選',
    shortTitle: '品牌敘事',
    subtitle: '一句話讓對的人知道：這就是他要找的。',
    description: '從客戶問題與實際證據出發，整理品牌主張、首頁訊息與可持續使用的語氣規則。讓品牌不只好看，也能清楚說話。',
    duration: '約 40 分鐘',
    theme: 'ink',
    coverWord: 'SAY / IT CLEAR',
    outcomes: ['寫出可理解的品牌主張', '用案例支持承諾', '建立一致的文案語氣'],
    lessons: [
      { title: '先說客戶正在面對什麼', time: '8 分鐘導讀', summary: '把「我們很厲害」換成客戶看得懂的問題。', sections: [{ heading: '從對方的語言寫起', body: '整理訪談、客服與銷售對話中反覆出現的句子。選出一個最迫切的問題，作為訊息的起點。' }], exercise: '從三段真實客戶對話中，摘出對方描述問題的原話。' },
      { title: '把承諾寫成一句話', time: '10 分鐘導讀', summary: '說明對象、成果與方法，減少空泛形容詞。', sections: [{ heading: '用具體成果替代形容詞', body: '試著填空：「我們幫助＿，透過＿，做到＿。」如果每個競品都能說同一句話，就再把方法或成果寫得更具體。' }], exercise: '寫三版品牌主張，請一位不熟悉產品的人說出他的理解。' },
      { title: '讓每個接觸點說同一種話', time: '12 分鐘導讀', summary: '把主張帶到首頁、課程介紹與電子郵件。', sections: [{ heading: '建立簡短語氣規則', body: '決定常用詞、避免的詞、句子長度與證據呈現方式。先修改最常被看到的三個接觸點，再擴展到其他內容。' }], exercise: '用同一語氣重寫一個首頁標題、一段課程摘要與一封歡迎信。' },
    ],
  },
  {
    slug: 'growth-experiments',
    number: '04',
    category: '行銷',
    level: '進階',
    title: '用小實驗找到有效增長',
    shortTitle: '增長實驗',
    subtitle: '少猜一點。讓下一個決定有數據可依。',
    description: '建立能回答問題的實驗，而不是追逐漂亮數字。選一個瓶頸、定義假設與判斷標準，再用小規模測試推進。',
    duration: '約 40 分鐘',
    theme: 'silver',
    coverWord: 'TEST / LEARN',
    outcomes: ['找到漏斗中最重要的瓶頸', '寫出可驗證的假設', '判讀並記錄實驗結果'],
    lessons: [
      { title: '找到值得測試的瓶頸', time: '8 分鐘導讀', summary: '先看整體流程，再決定從哪一段開始。', sections: [{ heading: '選一個會改變決策的數字', body: '把訪客、註冊、開始學習與完成課程放進同一條路徑。找出最多人停下來的地方，確認這個數字是否真的反映使用者價值。' }], exercise: '畫出目前的轉換路徑，選出一個最值得改善的節點。' },
      { title: '寫下可被推翻的假設', time: '10 分鐘導讀', summary: '預先定義要改什麼、期待什麼與如何判斷。', sections: [{ heading: '把想法變成測試', body: '使用「如果我們改變＿，因為＿，我們預期＿」的格式。設定主要指標與觀察期限，也寫下什麼結果會讓你放棄這個想法。' }], exercise: '替選出的瓶頸寫一項假設與一項停止條件。' },
      { title: '記錄學到的事', time: '12 分鐘導讀', summary: '結果不理想時，也要留下可用的學習。', sections: [{ heading: '分開數據與解釋', body: '先記錄樣本、時間、指標與觀察值，再寫可能原因。避免把一個短期波動直接當成確定的結論。' }], exercise: '建立一頁實驗紀錄：假設、變更、結果、限制與下一步。' },
    ],
  },
]

export const categories = ['全部', 'AI 實作', '創業', '品牌', '行銷']
