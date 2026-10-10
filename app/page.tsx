"use client";

import { useMemo, useState } from "react";

type BookId = "B1" | "B2" | "B3" | "B4" | "B5" | "B6";

type Unit = {
  title: string;
  scope: string;
  targets: string[];
  skills: string[];
  itemTypes: string[];
  questionCount: number;
  difficulty: "基礎" | "中等" | "進階" | "會考";
};

type Subject = {
  name: string;
  subtitle: string;
  accent: string;
  icon: string;
  versions: string[];
  updated: string;
  examFocus: string;
  books: Record<BookId, Unit[]>;
};

type QuizItem = {
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
  tag: string;
};

const githubUrl = "https://github.com/wei6960/jiawei-108-review-platform";

const publicSources = [
  {
    title: "國中教育會考官方歷屆試題",
    publisher: "臺師大心測中心",
    url: "https://cap.rcpet.edu.tw/examination.html",
    note: "可索引年度題本與參考答案連結，全文匯入需確認再散布授權。",
  },
  {
    title: "國中教育會考官方網站",
    publisher: "臺師大心測中心",
    url: "https://cap.rcpet.edu.tw/",
    note: "追蹤最新公告、年度題本、計分說明、問與答等會考資訊。",
  },
  {
    title: "自建段考題庫 CSV",
    publisher: "嘉偉平台",
    url: "/data/question-bank-template.csv",
    note: "老師或學生可用模板新增單元題、解析、標籤與授權資訊。",
  },
  {
    title: "Google Drive 出版社題庫索引",
    publisher: "Drive folders",
    url: "/data/drive-question-bank-index.json",
    note: "已索引 88 個資料夾與 958 個檔案，包含翰林、康軒、南一 115 上題庫系統與壓縮檔。",
  },
];

const driveSummaries = [
  { publisher: "翰林", folderCount: 6, fileCount: 55, url: "https://drive.google.com/drive/folders/1Ea7fEvSqPZyJ2EKXW892y3sZlgPH84Zs?usp=drive_link" },
  { publisher: "康軒", folderCount: 6, fileCount: 25, url: "https://drive.google.com/drive/folders/1Y9vIE9vlixQWWu81lII3NeOq0-T_Lqe8?usp=drive_link" },
  { publisher: "南一", folderCount: 5, fileCount: 24, url: "https://drive.google.com/drive/folders/1cAjfllTfelrcf79b3tCP7YyZMM8xa4jM?usp=drive_link" },
  { publisher: "壓縮檔", folderCount: 3, fileCount: 15, url: "/data/drive-question-bank-index.json" },
];

const importedStats = [
  { subject: "自然", count: 9231, url: "/data/imported/kangxuan-自然.json" },
  { subject: "社會", count: 18331, url: "/data/imported/kangxuan-社會.json" },
  { subject: "英文", count: 6344, url: "/data/imported/kangxuan-英文.json" },
  { subject: "國文", count: 11974, url: "/data/imported/kangxuan-國文.json" },
  { subject: "數學", count: 14417, url: "/data/imported/kangxuan-數學.json" },
];

const books: { id: BookId; label: string; scope: string }[] = [
  { id: "B1", label: "七上", scope: "國一上段考基礎" },
  { id: "B2", label: "七下", scope: "國一下延伸應用" },
  { id: "B3", label: "八上", scope: "國二上核心觀念" },
  { id: "B4", label: "八下", scope: "國二下整合題型" },
  { id: "B5", label: "九上", scope: "國三上會考核心" },
  { id: "B6", label: "九下", scope: "國三下總複習" },
];

const baseSkills = {
  language: ["概念辨識", "文本判讀", "題幹拆解", "選項比較", "段考手寫題", "會考素養題"],
  math: ["公式理解", "計算熟練", "圖形判讀", "應用建模", "陷阱辨識", "混合題組"],
  science: ["觀念理解", "實驗變因", "圖表判讀", "生活情境", "計算推理", "跨單元整合"],
  social: ["關鍵詞判讀", "時序整理", "圖表判讀", "案例推論", "比較分析", "會考題組"],
};

function unit(title: string, scope: string, questionCount: number, difficulty: Unit["difficulty"], skills: string[]): Unit {
  return {
    title,
    scope,
    questionCount,
    difficulty,
    targets: [
      `能說明「${title}」的核心觀念與常見考法`,
      "能分辨題幹關鍵字、限制條件與干擾選項",
      "能完成段考常見題型並寫出必要推論",
      "能連結會考素養題中的生活或圖表情境",
    ],
    skills,
    itemTypes: ["觀念快篩", "段考選擇題", "題組閱讀", "手寫/計算題", "錯題再練"],
  };
}

const subjects: Subject[] = [
  {
    name: "國文",
    subtitle: "閱讀素養、文言文、語文常識與作文",
    accent: "#9b6731",
    icon: "文",
    versions: ["翰林", "康軒", "南一"],
    updated: "2026.10",
    examFocus: "長文題組、跨文本比較、文言文語意判讀",
    books: {
      B1: ["現代散文閱讀", "新詩與韻文", "語文常識與標點", "修辭判讀", "文言文入門", "作文審題與取材"].map((x, i) => unit(x, "七上國文段考", 92 + i * 8, i > 3 ? "中等" : "基礎", baseSkills.language)),
      B2: ["小說情節與人物", "說明文閱讀", "成語與詞語運用", "古典詩詞", "議論文架構", "作文段落安排"].map((x, i) => unit(x, "七下國文段考", 96 + i * 9, i > 2 ? "中等" : "基礎", baseSkills.language)),
      B3: ["文言文句讀", "寓言與史傳", "閱讀策略", "語法與詞性", "圖文轉譯", "作文立意"].map((x, i) => unit(x, "八上國文段考", 110 + i * 8, i > 2 ? "進階" : "中等", baseSkills.language)),
      B4: ["古今文本比較", "抒情文分析", "論說文判讀", "國學常識", "混合題組", "作文素材統整"].map((x, i) => unit(x, "八下國文段考", 118 + i * 7, i > 3 ? "進階" : "中等", baseSkills.language)),
      B5: ["會考閱讀題組", "文言文翻譯", "長文速讀", "修辭與語感", "國學常識整合", "作文會考模擬"].map((x, i) => unit(x, "九上國文會考", 130 + i * 10, "會考", baseSkills.language)),
      B6: ["歷屆試題回放", "跨文本比較", "弱點單元補強", "閱讀速度訓練", "作文範例拆解", "會考全真模擬"].map((x, i) => unit(x, "九下國文總複習", 138 + i * 10, "會考", baseSkills.language)),
    },
  },
  {
    name: "英文",
    subtitle: "單字文法、克漏字、閱讀理解與生活情境",
    accent: "#637f58",
    icon: "Aa",
    versions: ["翰林", "康軒", "南一"],
    updated: "2026.10",
    examFocus: "篇章推論、文法整合、生活情境閱讀",
    books: {
      B1: ["be 動詞與代名詞", "現在簡單式", "名詞單複數", "疑問句", "生活對話", "短文閱讀"].map((x, i) => unit(x, "七上英文段考", 104 + i * 10, "基礎", baseSkills.language)),
      B2: ["過去式", "助動詞", "比較級", "時間介系詞", "克漏字入門", "圖表閱讀"].map((x, i) => unit(x, "七下英文段考", 112 + i * 9, i > 2 ? "中等" : "基礎", baseSkills.language)),
      B3: ["不定詞", "動名詞", "連接詞", "從屬子句", "閱讀推論", "篇章結構"].map((x, i) => unit(x, "八上英文段考", 124 + i * 9, "中等", baseSkills.language)),
      B4: ["現在完成式", "關係代名詞", "被動語態", "間接問句", "長文閱讀", "混合文法"].map((x, i) => unit(x, "八下英文段考", 128 + i * 10, i > 2 ? "進階" : "中等", baseSkills.language)),
      B5: ["分詞構句", "假設語氣", "會考克漏字", "閱讀測驗", "生活素養題", "聽讀策略"].map((x, i) => unit(x, "九上英文會考", 136 + i * 9, "會考", baseSkills.language)),
      B6: ["歷屆閱讀題", "文法總整理", "高頻單字", "題組推論", "錯題文法補強", "會考全真模擬"].map((x, i) => unit(x, "九下英文總複習", 142 + i * 10, "會考", baseSkills.language)),
    },
  },
  {
    name: "數學",
    subtitle: "觀念拆解、計算熟練、圖形推理與素養題",
    accent: "#c08a3d",
    icon: "∑",
    versions: ["翰林", "康軒", "南一"],
    updated: "2026.10",
    examFocus: "多步驟運算、圖形證明、函數與統計圖表",
    books: {
      B1: ["整數與數線", "分數小數運算", "一元一次方程式", "比例與百分率", "坐標平面", "資料整理"].map((x, i) => unit(x, "七上數學段考", 118 + i * 11, i > 2 ? "中等" : "基礎", baseSkills.math)),
      B2: ["二元一次聯立方程式", "直角坐標", "線型函數", "比與比例式", "幾何圖形", "統計圖表"].map((x, i) => unit(x, "七下數學段考", 126 + i * 11, "中等", baseSkills.math)),
      B3: ["乘法公式", "多項式", "平方根", "畢氏定理", "因式分解入門", "生活應用題"].map((x, i) => unit(x, "八上數學段考", 134 + i * 12, i > 2 ? "進階" : "中等", baseSkills.math)),
      B4: ["因式分解", "一元二次方程式", "等差數列", "幾何證明", "圓與角", "機率入門"].map((x, i) => unit(x, "八下數學段考", 138 + i * 12, "進階", baseSkills.math)),
      B5: ["二次函數", "相似形", "圓的性質", "機率", "統計", "會考混合題"].map((x, i) => unit(x, "九上數學會考", 150 + i * 12, "會考", baseSkills.math)),
      B6: ["三角比", "立體圖形", "函數總複習", "幾何總複習", "計算題補強", "會考全真模擬"].map((x, i) => unit(x, "九下數學總複習", 158 + i * 12, "會考", baseSkills.math)),
    },
  },
  {
    name: "生物",
    subtitle: "細胞、人體、遺傳、演化與生態",
    accent: "#557b5d",
    icon: "生",
    versions: ["翰林", "康軒", "南一"],
    updated: "2026.09",
    examFocus: "實驗設計、圖表判讀、生命現象推論",
    books: {
      B1: ["細胞構造", "養分與能量", "植物運輸", "動物循環", "神經與內分泌", "恆定性"].map((x, i) => unit(x, "七上生物段考", 86 + i * 8, i > 2 ? "中等" : "基礎", baseSkills.science)),
      B2: ["生殖", "遺傳法則", "演化", "分類", "生態系", "環境變遷"].map((x, i) => unit(x, "七下生物段考", 90 + i * 8, i > 2 ? "進階" : "中等", baseSkills.science)),
      B3: ["實驗變因", "顯微鏡判讀", "資料圖表", "探究設計", "跨冊整合", "段考題組"].map((x, i) => unit(x, "八上生物複習", 78 + i * 7, "中等", baseSkills.science)),
      B4: ["人體系統整合", "遺傳圖譜", "生態能量流", "環境議題", "混合題組", "素養題"].map((x, i) => unit(x, "八下生物複習", 82 + i * 8, "進階", baseSkills.science)),
      B5: ["會考生物題組", "實驗題", "圖表推論", "生活應用", "弱點補強", "自然科整合"].map((x, i) => unit(x, "九上生物會考", 94 + i * 8, "會考", baseSkills.science)),
      B6: ["歷屆生物題", "核心觀念回放", "錯題分類", "跨單元整合", "圖表快解", "會考全真模擬"].map((x, i) => unit(x, "九下生物總複習", 102 + i * 8, "會考", baseSkills.science)),
    },
  },
  {
    name: "理化",
    subtitle: "物質、化學反應、力、光、電與能量",
    accent: "#4b7d86",
    icon: "H2",
    versions: ["翰林", "康軒", "南一"],
    updated: "2026.10",
    examFocus: "實驗圖、計算題、生活情境整合",
    books: {
      B1: ["基本測量", "密度", "物質三態", "溶液濃度", "熱與溫度", "科學方法"].map((x, i) => unit(x, "七上理化段考", 92 + i * 9, i > 2 ? "中等" : "基礎", baseSkills.science)),
      B2: ["聲音", "光的反射", "光的折射", "力的作用", "壓力", "浮力"].map((x, i) => unit(x, "七下理化段考", 102 + i * 9, "中等", baseSkills.science)),
      B3: ["原子與分子", "化學式", "化學反應", "酸鹼鹽", "氧化還原", "反應速率"].map((x, i) => unit(x, "八上理化段考", 116 + i * 9, i > 2 ? "進階" : "中等", baseSkills.science)),
      B4: ["運動", "牛頓定律", "功與能", "電流電壓", "電阻", "磁與電磁"].map((x, i) => unit(x, "八下理化段考", 124 + i * 10, "進階", baseSkills.science)),
      B5: ["有機化合物", "能源", "波動", "實驗設計", "會考計算題", "自然科混合題"].map((x, i) => unit(x, "九上理化會考", 132 + i * 10, "會考", baseSkills.science)),
      B6: ["歷屆理化題", "公式總整理", "實驗圖判讀", "計算弱點補強", "跨單元整合", "會考全真模擬"].map((x, i) => unit(x, "九下理化總複習", 140 + i * 10, "會考", baseSkills.science)),
    },
  },
  {
    name: "歷史",
    subtitle: "臺灣史、中國史、世界史與史料判讀",
    accent: "#8a6b48",
    icon: "史",
    versions: ["翰林", "康軒", "南一"],
    updated: "2026.08",
    examFocus: "史料閱讀、時間軸排序、因果關係",
    books: {
      B1: ["史前與原住民族", "荷西與明鄭", "清領臺灣", "日治臺灣", "戰後臺灣", "民主化"].map((x, i) => unit(x, "七上歷史段考", 80 + i * 7, i > 2 ? "中等" : "基礎", baseSkills.social)),
      B2: ["古代中國", "秦漢帝國", "魏晉南北朝", "隋唐盛世", "宋元變遷", "明清發展"].map((x, i) => unit(x, "七下歷史段考", 86 + i * 7, "中等", baseSkills.social)),
      B3: ["近代中國", "清末改革", "民國建立", "世界古文明", "希臘羅馬", "宗教與文化"].map((x, i) => unit(x, "八上歷史段考", 92 + i * 7, "中等", baseSkills.social)),
      B4: ["歐洲近代", "工業革命", "帝國主義", "世界大戰", "冷戰", "全球化"].map((x, i) => unit(x, "八下歷史段考", 98 + i * 8, i > 2 ? "進階" : "中等", baseSkills.social)),
      B5: ["史料題組", "時序判讀", "比較題", "臺灣史總複習", "中國史總複習", "世界史總複習"].map((x, i) => unit(x, "九上歷史會考", 104 + i * 8, "會考", baseSkills.social)),
      B6: ["歷屆歷史題", "年代軸整理", "人物事件配對", "因果推論", "錯題補強", "會考全真模擬"].map((x, i) => unit(x, "九下歷史總複習", 110 + i * 8, "會考", baseSkills.social)),
    },
  },
  {
    name: "地理",
    subtitle: "地圖、氣候、人口產業與區域比較",
    accent: "#5e7c71",
    icon: "地",
    versions: ["翰林", "康軒", "南一"],
    updated: "2026.09",
    examFocus: "地圖、氣候圖、統計圖與區域比較",
    books: {
      B1: ["地圖判讀", "臺灣地形", "臺灣氣候", "人口分布", "產業活動", "環境議題"].map((x, i) => unit(x, "七上地理段考", 84 + i * 7, i > 2 ? "中等" : "基礎", baseSkills.social)),
      B2: ["中國地形", "中國氣候", "東亞", "東南亞", "南亞", "西亞北非"].map((x, i) => unit(x, "七下地理段考", 90 + i * 7, "中等", baseSkills.social)),
      B3: ["歐洲", "非洲", "北美洲", "中南美洲", "大洋洲", "兩極地區"].map((x, i) => unit(x, "八上地理段考", 96 + i * 7, "中等", baseSkills.social)),
      B4: ["全球化", "都市化", "資源與能源", "災害與防治", "環境永續", "區域比較"].map((x, i) => unit(x, "八下地理段考", 102 + i * 8, i > 2 ? "進階" : "中等", baseSkills.social)),
      B5: ["地圖題組", "氣候圖判讀", "統計圖判讀", "產業比較", "環境素養題", "會考整合題"].map((x, i) => unit(x, "九上地理會考", 108 + i * 8, "會考", baseSkills.social)),
      B6: ["歷屆地理題", "臺灣總複習", "世界區域總複習", "圖表快解", "錯題補強", "會考全真模擬"].map((x, i) => unit(x, "九下地理總複習", 114 + i * 8, "會考", baseSkills.social)),
    },
  },
  {
    name: "公民",
    subtitle: "民主政治、法律制度、經濟與公共議題",
    accent: "#90764f",
    icon: "法",
    versions: ["翰林", "康軒", "南一"],
    updated: "2026.10",
    examFocus: "情境案例、法律責任、經濟概念與時事連結",
    books: {
      B1: ["自我與家庭", "社會規範", "人權", "性別平等", "公共參與", "媒體識讀"].map((x, i) => unit(x, "七上公民段考", 78 + i * 7, i > 2 ? "中等" : "基礎", baseSkills.social)),
      B2: ["民主政治", "選舉制度", "地方自治", "中央政府", "政黨與利益團體", "公民參與"].map((x, i) => unit(x, "七下公民段考", 84 + i * 7, "中等", baseSkills.social)),
      B3: ["法律基本概念", "民事責任", "刑事責任", "少年事件", "消費權益", "智慧財產權"].map((x, i) => unit(x, "八上公民段考", 92 + i * 7, i > 2 ? "進階" : "中等", baseSkills.social)),
      B4: ["市場經濟", "供需與價格", "政府職能", "租稅", "國際貿易", "全球公民"].map((x, i) => unit(x, "八下公民段考", 98 + i * 8, "進階", baseSkills.social)),
      B5: ["法政經總整理", "案例判讀", "時事素養題", "會考題組", "錯題補強", "混合模擬"].map((x, i) => unit(x, "九上公民會考", 104 + i * 8, "會考", baseSkills.social)),
      B6: ["歷屆公民題", "法律案例", "政治制度", "經濟概念", "公共議題", "會考全真模擬"].map((x, i) => unit(x, "九下公民總複習", 110 + i * 8, "會考", baseSkills.social)),
    },
  },
  {
    name: "地科",
    subtitle: "地球系統、天文、天氣、海洋與災害",
    accent: "#677a97",
    icon: "◎",
    versions: ["翰林", "康軒", "南一"],
    updated: "2026.09",
    examFocus: "天文週期、天氣圖、災害資料與地球系統",
    books: {
      B1: ["地球內部", "板塊運動", "岩石循環", "地震", "火山", "地質災害"].map((x, i) => unit(x, "七上地科段考", 76 + i * 7, i > 2 ? "中等" : "基礎", baseSkills.science)),
      B2: ["大氣組成", "天氣變化", "鋒面與颱風", "水循環", "海洋", "氣候變遷"].map((x, i) => unit(x, "七下地科段考", 84 + i * 7, "中等", baseSkills.science)),
      B3: ["太陽系", "月相", "潮汐", "日月食", "星空觀測", "宇宙尺度"].map((x, i) => unit(x, "八上地科段考", 90 + i * 7, i > 2 ? "進階" : "中等", baseSkills.science)),
      B4: ["天然資源", "能源轉型", "環境變遷", "災害防治", "資料判讀", "跨域議題"].map((x, i) => unit(x, "八下地科段考", 96 + i * 8, "進階", baseSkills.science)),
      B5: ["天文題組", "天氣圖判讀", "地震資料", "氣候圖表", "自然科整合", "會考素養題"].map((x, i) => unit(x, "九上地科會考", 102 + i * 8, "會考", baseSkills.science)),
      B6: ["歷屆地科題", "地球系統總複習", "天文總複習", "圖表快解", "錯題補強", "會考全真模擬"].map((x, i) => unit(x, "九下地科總複習", 108 + i * 8, "會考", baseSkills.science)),
    },
  },
];

function makeQuiz(subject: Subject, book: BookId, unitData: Unit): QuizItem[] {
  const context = `${subject.name} ${book} ${unitData.title}`;
  return [
    {
      tag: "觀念快篩",
      prompt: `段考前複習「${context}」時，第一步最適合先確認哪一件事？`,
      choices: ["背完所有題目答案", "整理核心觀念與易混淆概念", "只寫最難題", "跳過課本例題"],
      answer: 1,
      explanation: "單元練習要先穩住核心觀念，再進入題型變化，錯題才知道要補哪個概念。",
    },
    {
      tag: "題幹拆解",
      prompt: `遇到「${unitData.title}」題組時，哪個動作最能降低粗心失分？`,
      choices: ["先看選項再猜", "圈出關鍵字、條件與問法", "只看最後一句", "寫越快越好"],
      answer: 1,
      explanation: "段考題常用限制條件設陷阱，先拆題幹可以避免把題目問法看錯。",
    },
    {
      tag: "段考應用",
      prompt: `如果學生在「${unitData.title}」連錯三題，平台應該優先安排什麼？`,
      choices: ["直接進入下一冊", "回到同單元基礎題與解析", "只顯示分數", "改練其他科"],
      answer: 1,
      explanation: "同單元連錯代表觀念或題型尚未穩定，應先補基礎題，再做進階混合題。",
    },
    {
      tag: "素養題",
      prompt: `會考素養題把「${unitData.title}」放進生活情境時，最重要的是什麼？`,
      choices: ["只找題目中的數字", "把情境轉回課本概念", "忽略圖表", "直接套最近背的答案"],
      answer: 1,
      explanation: "素養題不是脫離課本，而是把課本概念換成生活、圖表或文本情境來問。",
    },
    {
      tag: "錯題整理",
      prompt: `完成「${context}」練習後，錯題最應該用哪種方式保存？`,
      choices: ["只記題號", "標記錯因、單元、題型與下次複習日", "刪掉錯題", "只看正確答案"],
      answer: 1,
      explanation: "錯題要能回推弱點，標籤化後才能安排下次複習與段考前衝刺。",
    },
  ];
}

export default function Home() {
  const [activeBook, setActiveBook] = useState<BookId>("B1");
  const [activeSubject, setActiveSubject] = useState(subjects[0].name);
  const [activeVersion, setActiveVersion] = useState("翰林");
  const [unitIndex, setUnitIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showAnalysis, setShowAnalysis] = useState(false);

  const subject = useMemo(
    () => subjects.find((item) => item.name === activeSubject) ?? subjects[0],
    [activeSubject],
  );
  const units = subject.books[activeBook];
  const activeUnit = units[Math.min(unitIndex, units.length - 1)];
  const quiz = useMemo(() => makeQuiz(subject, activeBook, activeUnit), [subject, activeBook, activeUnit]);
  const answeredCount = Object.keys(answers).length;
  const correctCount = quiz.filter((item, index) => answers[index] === item.answer).length;
  const totalQuestions = units.reduce((sum, item) => sum + item.questionCount, 0);

  function switchSubject(name: string) {
    const next = subjects.find((item) => item.name === name) ?? subjects[0];
    setActiveSubject(name);
    setActiveVersion(next.versions[0]);
    setUnitIndex(0);
    setAnswers({});
    setShowAnalysis(false);
  }

  function switchBook(book: BookId) {
    setActiveBook(book);
    setUnitIndex(0);
    setAnswers({});
    setShowAnalysis(false);
  }

  function selectUnit(index: number) {
    setUnitIndex(index);
    setAnswers({});
    setShowAnalysis(false);
  }

  return (
    <main>
      <nav className="topbar" aria-label="主要導覽">
        <a className="brand" href="#top" aria-label="嘉偉 108 課綱複習平台首頁">
          <img src="/jiawei-logo.png" alt="" />
        </a>
        <div className="navlinks">
          <a href="#practice">單元題庫</a>
          <a href="#quiz">立即作答</a>
          <a href="#sources">公開題庫</a>
          <a href="#exam">會考專區</a>
          <a href="#updates">年度更新</a>
        </div>
        <button className="login-button" type="button">登入 / 註冊</button>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">108 課綱複習平台</p>
          <h1>不只選科目，而是深入每一冊、每一個段考單元</h1>
          <p className="hero-text">
            依版本、冊次、單元、題型與弱點標籤建立練習。學生可先看單元重點，再進入題庫作答、看解析、整理錯題；題庫採公開格式，大家都能一起補題。
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#practice">選擇單元</a>
            <a className="secondary-action" href={githubUrl}>GitHub 共編</a>
          </div>
          <div className="hero-stats" aria-label="平台內容摘要">
            <span><strong>9</strong> 科題庫</span>
            <span><strong>60,297</strong> 題已匯入</span>
            <span><strong>每年</strong> 依會考更新</span>
          </div>
        </div>
        <div className="hero-panel" aria-label="目前練習摘要">
          <div className="study-card main-study-card">
            <p>目前練習</p>
            <h2>{subject.name} {activeBook} · {activeUnit.title}</h2>
            <span>{activeVersion}版 · {activeUnit.questionCount} 題 · {activeUnit.difficulty}</span>
          </div>
          <div className="mini-grid">
            <div><strong>{units.length}</strong><span>本冊單元</span></div>
            <div><strong>{totalQuestions}</strong><span>本冊題量</span></div>
            <div><strong>{answeredCount}/5</strong><span>已作答</span></div>
            <div><strong>{correctCount}</strong><span>目前答對</span></div>
          </div>
        </div>
      </section>

      <section className="book-strip" id="books" aria-label="冊次切換">
        <div>
          <p>國中三年完整複習</p>
          <h2>B1 - B6 逐冊段考題庫</h2>
        </div>
        <div className="book-tabs" role="tablist" aria-label="選擇冊次">
          {books.map((book) => (
            <button
              aria-selected={activeBook === book.id}
              className={activeBook === book.id ? "active" : ""}
              key={book.id}
              onClick={() => switchBook(book.id)}
              role="tab"
              type="button"
            >
              <strong>{book.id}</strong>
              <span>{book.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section" id="practice">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Unit Practice</p>
            <h2>單元題庫練習</h2>
          </div>
          <p>每科每冊不只列標題，而是拆成單元目標、子技能、段考題型、題量與難度。未來題庫擴充時，可直接把單元資料接到後台更新。</p>
        </div>

        <div className="subject-rail" aria-label="科目選擇">
          {subjects.map((item) => (
            <button
              className={activeSubject === item.name ? "active" : ""}
              key={item.name}
              onClick={() => switchSubject(item.name)}
              style={{ "--accent": item.accent } as React.CSSProperties}
              type="button"
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>

        <div className="practice-deep-layout">
          <aside className="unit-browser" aria-label="單元列表">
            <div className="unit-browser-head">
              <div>
                <p>{activeVersion}版 · {books.find((book) => book.id === activeBook)?.scope}</p>
                <h3>{subject.name} {activeBook} 單元</h3>
              </div>
              <select value={activeVersion} onChange={(event) => setActiveVersion(event.target.value)} aria-label="教材版本">
                {subject.versions.map((version) => (
                  <option key={version}>{version}</option>
                ))}
              </select>
            </div>
            <div className="unit-stack">
              {units.map((item, index) => (
                <button
                  className={index === unitIndex ? "active" : ""}
                  key={item.title}
                  onClick={() => selectUnit(index)}
                  type="button"
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.title}</strong>
                  <small>{item.questionCount} 題 · {item.difficulty}</small>
                </button>
              ))}
            </div>
          </aside>

          <section className="unit-deep" aria-label="單元深度內容">
            <div className="unit-title-row">
              <div>
                <p className="eyebrow">{subject.name} · {activeBook} · {activeVersion}版</p>
                <h2>{activeUnit.title}</h2>
                <p>{activeUnit.scope}，題庫包含基礎觀念、段考題、手寫題與會考素養題。</p>
              </div>
              <div className="unit-count">
                <strong>{activeUnit.questionCount}</strong>
                <span>題可練</span>
              </div>
            </div>

            <div className="deep-grid">
              <article>
                <h3>學習目標</h3>
                {activeUnit.targets.map((target) => <p key={target}>{target}</p>)}
              </article>
              <article>
                <h3>子技能拆解</h3>
                <div className="chip-list">
                  {activeUnit.skills.map((skill) => <span key={skill}>{skill}</span>)}
                </div>
              </article>
              <article>
                <h3>題型配置</h3>
                <div className="chip-list">
                  {activeUnit.itemTypes.map((type) => <span key={type}>{type}</span>)}
                </div>
              </article>
              <article>
                <h3>段考策略</h3>
                <p>先做 10 題觀念快篩，低於 80% 就回到基礎題；達標後再練題組與手寫題，最後收進錯題本。</p>
              </article>
            </div>
          </section>
        </div>
      </section>

      <section className="quiz-section" id="quiz">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Practice Now</p>
            <h2>立即作答 · 看解析</h2>
          </div>
          <p>這裡先放入可操作的示範題型。正式上題庫時，同一個作答流程可以接真題、段考題、歷屆會考題與老師自建題。</p>
        </div>
        <div className="quiz-board">
          <div className="quiz-status">
            <strong>{correctCount} / {quiz.length}</strong>
            <span>{subject.name} · {activeUnit.title}</span>
            <button type="button" onClick={() => setShowAnalysis(true)}>交卷看解析</button>
            <button type="button" onClick={() => { setAnswers({}); setShowAnalysis(false); }}>重新練習</button>
          </div>
          <div className="question-list">
            {quiz.map((item, index) => {
              const selected = answers[index];
              const isCorrect = selected === item.answer;
              return (
                <article className="question-card" key={item.prompt}>
                  <div className="question-head">
                    <span>{item.tag}</span>
                    <strong>第 {index + 1} 題</strong>
                  </div>
                  <p>{item.prompt}</p>
                  <div className="choice-grid">
                    {item.choices.map((choice, choiceIndex) => (
                      <button
                        className={[
                          selected === choiceIndex ? "selected" : "",
                          showAnalysis && choiceIndex === item.answer ? "correct" : "",
                          showAnalysis && selected === choiceIndex && selected !== item.answer ? "wrong" : "",
                        ].join(" ")}
                        key={choice}
                        onClick={() => setAnswers((prev) => ({ ...prev, [index]: choiceIndex }))}
                        type="button"
                      >
                        {String.fromCharCode(65 + choiceIndex)}. {choice}
                      </button>
                    ))}
                  </div>
                  {showAnalysis && (
                    <div className={isCorrect ? "analysis correct" : "analysis"}>
                      <strong>{isCorrect ? "答對了" : "需要再練一次"}</strong>
                      <span>正解：{String.fromCharCode(65 + item.answer)}</span>
                      <p>{item.explanation}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sources-section" id="sources">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Open Question Bank</p>
            <h2>公開題庫來源與匯入</h2>
          </div>
          <p>平台會優先使用官方公開資料、自建題與明確授權內容。商業題庫、登入後資料、付費內容或未授權教材，只建立來源索引，不搬運全文。</p>
        </div>
        <div className="source-grid">
          {publicSources.map((source) => (
            <article className="source-card" key={source.title}>
              <span>{source.publisher}</span>
              <h3>{source.title}</h3>
              <p>{source.note}</p>
              <a href={source.url}>開啟來源</a>
            </article>
          ))}
        </div>
        <div className="drive-index-panel">
          <div>
            <p className="eyebrow">Drive Index</p>
            <h3>已抓取 Drive 題庫並轉出康軒五科題目</h3>
            <p>目前已從康軒 MDB 題庫解析 60,297 題，包含題目、選項、答案、詳解、難度、題型、冊次與單元。南一與翰林資料庫可用同一套流程繼續解析。</p>
          </div>
          <div className="drive-summary-grid">
            {driveSummaries.map((item) => (
              <a href={item.url} key={item.publisher}>
                <strong>{item.publisher}</strong>
                <span>{item.folderCount} 個資料夾 · {item.fileCount} 個檔案</span>
              </a>
            ))}
          </div>
        </div>
        <div className="imported-bank-panel">
          <div>
            <p className="eyebrow">Imported Bank</p>
            <h3>康軒 115 上題庫匯入統計</h3>
          </div>
          <div className="imported-stat-grid">
            {importedStats.map((item) => (
              <a href={item.url} key={item.subject}>
                <strong>{item.count.toLocaleString("zh-TW")}</strong>
                <span>{item.subject}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="import-panel">
          <div>
            <p className="eyebrow">Question Format</p>
            <h3>題庫欄位已標準化</h3>
            <p>每題包含來源、授權、年份、冊次、版本、科目、單元、題目、選項、答案、解析與標籤。之後要抓官方公開連結、老師批次上題、學生投稿，都走同一套資料格式。</p>
          </div>
          <div className="import-actions">
            <a href="/data/question-bank-template.csv">下載 CSV 模板</a>
            <a href="/data/question-bank.json">查看示範題庫 JSON</a>
            <a href="/data/drive-question-bank-index.json">查看 Drive 索引 JSON</a>
            <a href="/data/imported-drive-summary.json">查看匯入摘要 JSON</a>
            <a href="/data/imported/kangxuan-自然.json">下載康軒自然 JSON</a>
            <a href="/data/imported/kangxuan-社會.json">下載康軒社會 JSON</a>
            <a href={githubUrl}>到 GitHub 貢獻題目</a>
          </div>
        </div>
      </section>

      <section className="exam-section" id="exam">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Exam Center</p>
            <h2>會考與年度更新</h2>
          </div>
          <p>每年依會考題型、命題趨勢與出版社版本異動更新。段考練單元，會考練整合，兩種模式分開追蹤。</p>
        </div>
        <div className="exam-grid">
          {["歷屆會考題", "段考範圍卷", "弱點錯題本", "年度趨勢分析"].map((title) => (
            <article className="exam-card" key={title}>
              <span>→</span>
              <h3>{title}</h3>
              <p>{title}會依科目、冊次、單元與能力指標標記，方便老師與學生快速安排複習。</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section" id="updates">
        <article className="progress-panel">
          <div className="ring" aria-label="目前正確率">{answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0}%</div>
          <div>
            <p className="eyebrow">My Progress</p>
            <h2>單元練習進度</h2>
            <p>目前單元：{subject.name} {activeBook}「{activeUnit.title}」。會考重點：{subject.examFocus}。</p>
          </div>
        </article>
        <article className="updates-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">Updates</p>
              <h2>資料更新規劃</h2>
            </div>
            <a href="#practice">回到單元</a>
          </div>
          <div className="update-list">
            {[
              ["年度更新", "115 年會考趨勢標籤：依新題型補入素養題"],
              ["版本對照", "翰林、康軒、南一 B1-B6 單元索引可逐年調整"],
              ["段考題庫", "每單元可新增基礎、進階、題組、手寫題"],
              ["錯題追蹤", "依錯因標記：觀念不熟、題幹誤讀、計算錯誤"],
            ].map(([type, title]) => (
              <div key={title}>
                <span>{type}</span>
                <strong>{title}</strong>
                <time>2026.10</time>
              </div>
            ))}
          </div>
        </article>
      </section>

      <footer>
        <img src="/jiawei-logo.png" alt="嘉偉 108 課綱複習平台" />
        <nav aria-label="頁尾導覽">
          <a href="#practice">單元題庫</a>
          <a href="#quiz">立即作答</a>
          <a href="#sources">公開題庫</a>
          <a href="#exam">會考專區</a>
          <a href="#updates">年度更新</a>
        </nav>
        <p>Better Knowledge. Brighter Future.</p>
      </footer>
    </main>
  );
}
