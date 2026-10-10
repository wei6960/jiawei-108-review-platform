"use client";

import { useMemo, useState } from "react";

type Subject = {
  name: string;
  subtitle: string;
  accent: string;
  icon: string;
  versions: string[];
  units: Record<string, string[]>;
  examFocus: string;
  questions: number;
  updated: string;
};

const books = [
  { id: "B1", label: "七上", scope: "基礎概念" },
  { id: "B2", label: "七下", scope: "延伸應用" },
  { id: "B3", label: "八上", scope: "圖表判讀" },
  { id: "B4", label: "八下", scope: "跨域整合" },
  { id: "B5", label: "九上", scope: "會考核心" },
  { id: "B6", label: "九下", scope: "總複習" },
];

const subjects: Subject[] = [
  {
    name: "國文",
    subtitle: "閱讀素養、文言判讀、寫作策略",
    accent: "#9b6731",
    icon: "文",
    versions: ["翰林", "康軒", "南一"],
    units: {
      B1: ["現代散文閱讀", "語文常識", "古典詩詞入門"],
      B2: ["小說情節分析", "修辭辨識", "議論文結構"],
      B3: ["文言文句讀", "人物形象", "閱讀策略"],
      B4: ["古今文本比較", "圖文轉譯", "寫作取材"],
      B5: ["會考閱讀題組", "國學常識", "混合題練習"],
      B6: ["歷屆會考統整", "長文速讀", "作文審題"],
    },
    examFocus: "長文題組與跨文本比較比重提高",
    questions: 1280,
    updated: "2026.10",
  },
  {
    name: "英文",
    subtitle: "單字文法、閱讀理解、生活情境",
    accent: "#637f58",
    icon: "Aa",
    versions: ["翰林", "康軒", "南一"],
    units: {
      B1: ["be 動詞與代名詞", "現在簡單式", "生活對話"],
      B2: ["過去式", "比較級", "短文閱讀"],
      B3: ["不定詞與動名詞", "連接詞", "圖表閱讀"],
      B4: ["完成式", "關係子句", "篇章推論"],
      B5: ["被動語態", "假設語氣", "會考克漏字"],
      B6: ["歷屆閱讀題", "整合文法", "聽讀策略"],
    },
    examFocus: "情境閱讀與推論題穩定增加",
    questions: 1460,
    updated: "2026.10",
  },
  {
    name: "數學",
    subtitle: "觀念拆解、題型演練、素養題",
    accent: "#c08a3d",
    icon: "∑",
    versions: ["翰林", "康軒", "南一"],
    units: {
      B1: ["整數與分數", "一元一次方程式", "坐標平面"],
      B2: ["二元一次聯立方程式", "比例", "線型函數"],
      B3: ["乘法公式", "平方根", "畢氏定理"],
      B4: ["因式分解", "二次方根", "統計圖表"],
      B5: ["二次函數", "圓", "機率"],
      B6: ["相似形", "三角比", "會考綜合題"],
    },
    examFocus: "圖表、幾何推理與多步驟運算是關鍵",
    questions: 1720,
    updated: "2026.10",
  },
  {
    name: "生物",
    subtitle: "生命現象、遺傳、生態系統",
    accent: "#557b5d",
    icon: "生",
    versions: ["翰林", "康軒", "南一"],
    units: {
      B1: ["細胞構造", "養分與能量", "植物運輸"],
      B2: ["神經與內分泌", "遺傳", "演化"],
      B3: ["生態系", "環境變遷", "科學探究"],
      B4: ["實驗變因", "資料判讀", "跨冊整合"],
      B5: ["會考生物題組", "圖表推論", "生活應用"],
      B6: ["自然科總複習", "混合題", "弱點補強"],
    },
    examFocus: "實驗設計與資料判讀題最需要反覆練",
    questions: 920,
    updated: "2026.09",
  },
  {
    name: "理化",
    subtitle: "物質、能量、力與化學反應",
    accent: "#4b7d86",
    icon: "H₂",
    versions: ["翰林", "康軒", "南一"],
    units: {
      B1: ["基本測量", "物質三態", "密度"],
      B2: ["波動與聲音", "光", "熱"],
      B3: ["原子與分子", "化學反應", "酸鹼鹽"],
      B4: ["力與運動", "功與能", "電與磁"],
      B5: ["氧化還原", "有機化合物", "實驗推論"],
      B6: ["自然科整合", "計算題", "會考模擬"],
    },
    examFocus: "實驗圖、計算與生活情境整合題是主軸",
    questions: 1180,
    updated: "2026.10",
  },
  {
    name: "歷史",
    subtitle: "臺灣史、中國史、世界史",
    accent: "#8a6b48",
    icon: "史",
    versions: ["翰林", "康軒", "南一"],
    units: {
      B1: ["史前與原住民族", "荷西明鄭", "清領臺灣"],
      B2: ["日治臺灣", "戰後臺灣", "民主化"],
      B3: ["古代中國", "秦漢到隋唐", "宋元明清"],
      B4: ["近代中國", "世界古文明", "歐洲近代"],
      B5: ["世界大戰", "冷戰", "全球化"],
      B6: ["時序判讀", "史料分析", "會考題組"],
    },
    examFocus: "史料閱讀與時間軸排序題持續重要",
    questions: 860,
    updated: "2026.08",
  },
  {
    name: "地理",
    subtitle: "地形氣候、產業人口、區域比較",
    accent: "#5e7c71",
    icon: "地",
    versions: ["翰林", "康軒", "南一"],
    units: {
      B1: ["地圖判讀", "臺灣地形", "臺灣氣候"],
      B2: ["人口與產業", "區域特色", "環境議題"],
      B3: ["中國地理", "東亞與東南亞", "南亞西亞"],
      B4: ["歐洲非洲", "美洲大洋洲", "全球議題"],
      B5: ["圖表分析", "區域比較", "會考題組"],
      B6: ["跨冊整合", "環境永續", "模擬測驗"],
    },
    examFocus: "地圖、氣候圖與統計圖的判讀要熟",
    questions: 910,
    updated: "2026.09",
  },
  {
    name: "公民",
    subtitle: "法律制度、民主政治、經濟生活",
    accent: "#90764f",
    icon: "法",
    versions: ["翰林", "康軒", "南一"],
    units: {
      B1: ["自我與家庭", "社會規範", "人權"],
      B2: ["民主政治", "地方自治", "公共參與"],
      B3: ["法律責任", "少年事件", "消費權益"],
      B4: ["市場經濟", "政府職能", "全球公民"],
      B5: ["時事素養題", "案例判讀", "會考題組"],
      B6: ["法政經總複習", "混合題", "命題趨勢"],
    },
    examFocus: "情境案例與時事概念連結更常出現",
    questions: 840,
    updated: "2026.10",
  },
  {
    name: "地科",
    subtitle: "地球系統、天文、天然災害",
    accent: "#677a97",
    icon: "◎",
    versions: ["翰林", "康軒", "南一"],
    units: {
      B1: ["地球內部", "板塊運動", "岩石循環"],
      B2: ["大氣與天氣", "海洋", "水循環"],
      B3: ["太陽系", "月相與潮汐", "宇宙觀測"],
      B4: ["天然災害", "氣候變遷", "能源資源"],
      B5: ["圖表判讀", "實測資料", "會考整合"],
      B6: ["自然科總複習", "跨單元題", "模擬測驗"],
    },
    examFocus: "天文週期與災害資料判讀適合用題組練習",
    questions: 760,
    updated: "2026.09",
  },
];

const updateItems = [
  { type: "年度更新", title: "115 年會考命題趨勢預備版上線", date: "2026.10.10" },
  { type: "題庫新增", title: "B5 九上理化與公民新增素養題 180 題", date: "2026.10.02" },
  { type: "版本對照", title: "翰林、康軒、南一 B1-B6 單元索引完成校正", date: "2026.09.21" },
  { type: "會考專區", title: "歷屆試題弱點標籤與解析重整", date: "2026.09.05" },
];

const examCards = [
  { title: "歷屆試題", detail: "依年份、科目、能力指標快速回放" },
  { title: "模擬測驗", detail: "混合冊次與版本，產生 45 分鐘練習卷" },
  { title: "錯題整理", detail: "自動標記弱點單元，安排複習節奏" },
  { title: "趨勢分析", detail: "每年更新題型比重與高頻概念" },
];

export default function Home() {
  const [activeBook, setActiveBook] = useState("B1");
  const [activeSubject, setActiveSubject] = useState(subjects[0].name);
  const [activeVersion, setActiveVersion] = useState("翰林");
  const [practiceMode, setPracticeMode] = useState("單元練習");

  const subject = useMemo(
    () => subjects.find((item) => item.name === activeSubject) ?? subjects[0],
    [activeSubject],
  );

  const units = subject.units[activeBook] ?? [];
  const questionEstimate = Math.round(
    subject.questions * (0.12 + books.findIndex((book) => book.id === activeBook) * 0.018),
  );

  return (
    <main>
      <nav className="topbar" aria-label="主要導覽">
        <a className="brand" href="#top" aria-label="嘉偉 108 課綱複習平台首頁">
          <img src="/jiawei-logo.png" alt="" />
        </a>
        <div className="navlinks">
          <a href="#practice">題庫練習</a>
          <a href="#exam">會考專區</a>
          <a href="#books">B1-B6</a>
          <a href="#updates">年度更新</a>
        </div>
        <button className="login-button" type="button">登入 / 註冊</button>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">108 課綱複習平台</p>
          <h1>國中三年完整複習，陪你穩穩迎戰會考</h1>
          <p className="hero-text">
            依各版本、各冊次與各科單元整理題庫，從 B1 到 B6 補齊觀念、練熟題型，並依每年會考趨勢持續更新。
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#practice">開始練習</a>
            <a className="secondary-action" href="#exam">查看會考專區</a>
          </div>
          <div className="hero-stats" aria-label="平台特色">
            <span><strong>9</strong> 科完整題庫</span>
            <span><strong>B1-B6</strong> 全冊複習</span>
            <span><strong>每年</strong> 趨勢更新</span>
          </div>
        </div>
        <div className="hero-panel" aria-label="今日複習摘要">
          <div className="study-card main-study-card">
            <p>今日建議</p>
            <h2>{activeSubject} {activeBook} 題組</h2>
            <span>{activeVersion}版本 · {units[0]}</span>
          </div>
          <div className="mini-grid">
            <div><strong>75%</strong><span>整體進度</span></div>
            <div><strong>128</strong><span>本週練習題</span></div>
            <div><strong>23</strong><span>弱點待補強</span></div>
            <div><strong>12</strong><span>連續學習天</span></div>
          </div>
        </div>
      </section>

      <section className="book-strip" id="books" aria-label="冊次切換">
        <div>
          <p>國中三年完整複習</p>
          <h2>B1 - B6 全冊掌握</h2>
        </div>
        <div className="book-tabs" role="tablist" aria-label="選擇冊次">
          {books.map((book) => (
            <button
              aria-selected={activeBook === book.id}
              className={activeBook === book.id ? "active" : ""}
              key={book.id}
              onClick={() => setActiveBook(book.id)}
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
            <p className="eyebrow">Subject Practice</p>
            <h2>學科題庫練習</h2>
          </div>
          <p>先選科目，再依版本、冊次與單元建立練習卷；未來新增題庫時只要更新資料表，就能同步調整內容。</p>
        </div>

        <div className="practice-layout">
          <div className="subject-grid" aria-label="科目列表">
            {subjects.map((item) => (
              <button
                className={`subject-card ${activeSubject === item.name ? "selected" : ""}`}
                key={item.name}
                onClick={() => {
                  setActiveSubject(item.name);
                  setActiveVersion(item.versions[0]);
                }}
                style={{ "--accent": item.accent } as React.CSSProperties}
                type="button"
              >
                <span className="subject-icon">{item.icon}</span>
                <strong>{item.name}</strong>
                <small>{item.subtitle}</small>
                <em>{item.questions.toLocaleString("zh-TW")} 題</em>
              </button>
            ))}
          </div>

          <aside className="builder" aria-label="練習設定">
            <div className="builder-top">
              <span style={{ background: subject.accent }}>{subject.icon}</span>
              <div>
                <p>{activeBook} · {books.find((book) => book.id === activeBook)?.label}</p>
                <h3>{subject.name}練習卷</h3>
              </div>
            </div>

            <label>
              教材版本
              <select value={activeVersion} onChange={(event) => setActiveVersion(event.target.value)}>
                {subject.versions.map((version) => (
                  <option key={version}>{version}</option>
                ))}
              </select>
            </label>

            <div className="mode-group" aria-label="練習模式">
              {["單元練習", "混合題組", "會考模擬"].map((mode) => (
                <button
                  className={practiceMode === mode ? "active" : ""}
                  key={mode}
                  onClick={() => setPracticeMode(mode)}
                  type="button"
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="unit-list">
              <p>本冊單元</p>
              {units.map((unit, index) => (
                <button key={unit} type="button">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {unit}
                </button>
              ))}
            </div>

            <div className="builder-summary">
              <span>預估可練習題數</span>
              <strong>{questionEstimate}</strong>
              <small>{activeVersion}版 · {practiceMode} · {subject.updated} 更新</small>
            </div>
          </aside>
        </div>
      </section>

      <section className="exam-section" id="exam">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Exam Center</p>
            <h2>會考專區</h2>
          </div>
          <p>搭配每年命題狀況調整題目標籤、難度與解析，讓複習不只是刷題，而是看見自己下一步要補哪裡。</p>
        </div>
        <div className="exam-grid">
          {examCards.map((card) => (
            <article className="exam-card" key={card.title}>
              <span>→</span>
              <h3>{card.title}</h3>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <article className="progress-panel">
          <div className="ring" aria-label="整體進度 75%">75%</div>
          <div>
            <p className="eyebrow">My Progress</p>
            <h2>我的學習進度</h2>
            <p>本週已完成 18 / 24 份練習，最需要補強的是「{subject.examFocus}」。</p>
          </div>
        </article>
        <article className="updates-panel" id="updates">
          <div className="panel-title">
            <div>
              <p className="eyebrow">Updates</p>
              <h2>最新消息 · 年度更新</h2>
            </div>
            <a href="#practice">立即練習</a>
          </div>
          <div className="update-list">
            {updateItems.map((item) => (
              <div key={item.title}>
                <span>{item.type}</span>
                <strong>{item.title}</strong>
                <time>{item.date}</time>
              </div>
            ))}
          </div>
        </article>
      </section>

      <footer>
        <img src="/jiawei-logo.png" alt="嘉偉 108 課綱複習平台" />
        <nav aria-label="頁尾導覽">
          <a href="#practice">題庫練習</a>
          <a href="#exam">會考專區</a>
          <a href="#books">B1-B6</a>
          <a href="#updates">年度更新</a>
        </nav>
        <p>Better Knowledge. Brighter Future.</p>
      </footer>
    </main>
  );
}
