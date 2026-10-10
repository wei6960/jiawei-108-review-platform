"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";

type ImportedQuestion = {
  id: string;
  source: string;
  sourceFileId?: string;
  license: string;
  year: string;
  publisher: string;
  version: string;
  subject: string;
  book?: string;
  unit?: string;
  topic?: string;
  difficulty?: string;
  type?: string;
  prompt: string;
  choices?: string[];
  answer: string;
  explanation?: string;
  tags?: string[];
};

type QuestionFile = {
  updated: string;
  source: string;
  license: string;
  subject: string;
  count: number;
  items: ImportedQuestion[];
};

type QuizQuestion = ImportedQuestion & {
  cleanedPrompt: string;
  normalizedChoices: string[];
  normalizedAnswer: string;
};

const books = [
  { id: "B1", label: "七上" },
  { id: "B2", label: "七下" },
  { id: "B3", label: "八上" },
  { id: "B4", label: "八下" },
  { id: "B5", label: "九上" },
  { id: "B6", label: "九下" },
];

const subjects = [
  { label: "國文", bank: "國文", accent: "#8a6b42" },
  { label: "英文", bank: "英文", accent: "#4f7880" },
  { label: "數學", bank: "數學", accent: "#bc8241" },
  { label: "生物", bank: "自然", accent: "#667454" },
  { label: "理化", bank: "自然", accent: "#537f83" },
  { label: "歷史", bank: "社會", accent: "#a46b50" },
  { label: "地理", bank: "社會", accent: "#6f7f58" },
  { label: "公民", bank: "社會", accent: "#75608a" },
  { label: "地科", bank: "自然", accent: "#4d6b88" },
];

const importedStats = [
  { subject: "國文", count: 11974, file: "/data/imported/kangxuan-國文.json" },
  { subject: "英文", count: 6344, file: "/data/imported/kangxuan-英文.json" },
  { subject: "數學", count: 14417, file: "/data/imported/kangxuan-數學.json" },
  { subject: "自然", count: 9231, file: "/data/imported/kangxuan-自然.json" },
  { subject: "社會", count: 18331, file: "/data/imported/kangxuan-社會.json" },
];

const answerLetters = ["A", "B", "C", "D"];

function normalizeAnswer(answer: string) {
  return answer
    .replace(/[ＡＡ]/g, "A")
    .replace(/[ＢＢ]/g, "B")
    .replace(/[ＣＣ]/g, "C")
    .replace(/[ＤＤ]/g, "D")
    .replace(/[（(]([A-D])[）)]/i, "$1")
    .trim()
    .slice(0, 1)
    .toUpperCase();
}

function extractChoices(prompt: string, choices?: string[]) {
  const cleanedChoices = (choices ?? []).map((choice) => choice.trim()).filter(Boolean);
  if (cleanedChoices.length >= 2) {
    return { prompt, choices: cleanedChoices.slice(0, 4) };
  }

  const marker = /[（(]?[A-DＡ-Ｄ][）)]/g;
  const matches = [...prompt.matchAll(marker)];
  if (matches.length < 2) {
    return { prompt, choices: cleanedChoices };
  }

  const parsed = matches.slice(0, 4).map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? prompt.length;
    return prompt.slice(start, end).replace(/[。；;，,]\s*$/, "").trim();
  });

  const questionText = prompt.slice(0, matches[0].index).trim() || prompt;
  return { prompt: questionText, choices: parsed.filter(Boolean) };
}

function prepareQuestion(question: ImportedQuestion): QuizQuestion | null {
  const normalizedAnswer = normalizeAnswer(question.answer);
  const { prompt, choices } = extractChoices(question.prompt, question.choices);

  if (!answerLetters.includes(normalizedAnswer) || choices.length < 2) {
    return null;
  }

  return {
    ...question,
    cleanedPrompt: prompt,
    normalizedChoices: choices.slice(0, 4),
    normalizedAnswer,
  };
}

function shuffle<T>(items: T[]) {
  return [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function fileForBank(bank: string) {
  return `/data/imported/kangxuan-${bank}.json`;
}

export default function Home() {
  const [activeSubject, setActiveSubject] = useState(subjects[0]);
  const [activeBook, setActiveBook] = useState("B1");
  const [activeUnit, setActiveUnit] = useState("全部單元");
  const [bankQuestions, setBankQuestions] = useState<QuizQuestion[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    setActiveUnit("全部單元");
    setQuizQuestions([]);
    setAnswers({});

    fetch(fileForBank(activeSubject.bank))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`題庫載入失敗：${response.status}`);
        }
        return response.json() as Promise<QuestionFile>;
      })
      .then((data) => {
        if (!alive) return;
        const prepared = data.items.map(prepareQuestion).filter(Boolean) as QuizQuestion[];
        setBankQuestions(prepared);
      })
      .catch((caught: Error) => {
        if (!alive) return;
        setBankQuestions([]);
        setError(caught.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [activeSubject]);

  const bookPool = useMemo(() => {
    const direct = bankQuestions.filter((question) => question.book === activeBook);
    return direct.length >= 25 ? direct : bankQuestions;
  }, [activeBook, bankQuestions]);

  const units = useMemo(() => {
    const unique = new Map<string, number>();
    for (const question of bookPool) {
      const unit = question.unit?.trim() || "未標示單元";
      unique.set(unit, (unique.get(unit) ?? 0) + 1);
    }
    return [...unique.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 80)
      .map(([name, count]) => ({ name, count }));
  }, [bookPool]);

  const eligibleQuestions = useMemo(() => {
    if (activeUnit === "全部單元") return bookPool;
    return bookPool.filter((question) => (question.unit?.trim() || "未標示單元") === activeUnit);
  }, [activeUnit, bookPool]);

  const answeredCount = Object.keys(answers).length;
  const correctCount = quizQuestions.filter((question) => answers[question.id] === question.normalizedAnswer).length;

  function startRandomQuiz() {
    const primaryPool = eligibleQuestions.length >= 25 ? eligibleQuestions : bookPool;
    const nextQuestions = shuffle(primaryPool).slice(0, 25);
    setQuizQuestions(nextQuestions);
    setAnswers({});
    if (nextQuestions.length === 0) {
      setError("目前這個科目還沒有可作答的選擇題，請先切換科目或更新題庫。");
    }
  }

  function chooseAnswer(questionId: string, answer: string) {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="嘉偉 108 課綱複習平台">
          <img src="/jiawei-logo.png" alt="嘉偉 108 課綱複習平台" />
        </a>
        <nav className="navlinks" aria-label="主要導覽">
          <a href="#practice">題庫練習</a>
          <a href="#quiz">立即測驗</a>
          <a href="#sources">題庫來源</a>
          <a href="#updates">年度更新</a>
        </nav>
        <a className="login-button" href="#quiz">進入測驗</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">108 課綱複習平台</p>
          <h1>嘉偉題庫練習，段考與會考都能直接刷題。</h1>
          <p className="hero-text">
            已匯入授權康軒題庫 60,297 題，依照 B1-B6、科目、單元建立練習入口。每次測驗隨機抽 25 題，
            點選答案後立刻看正確與否、答案和解析，錯題可以當下重看。
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#quiz">開始 25 題隨機</a>
            <a className="secondary-action" href="#practice">選科目與單元</a>
          </div>
          <div className="hero-stats" aria-label="題庫統計">
            <span><strong>60,297</strong> 真題匯入</span>
            <span><strong>25</strong> 題隨機測驗</span>
            <span><strong>B1-B6</strong> 冊別入口</span>
            <span><strong>每題</strong> 即時解析</span>
          </div>
        </div>
      </section>

      <section className="book-strip" aria-label="冊別選擇">
        <div>
          <p>國中三年完整複習</p>
          <h2>B1 - B6 依冊別進入題庫</h2>
        </div>
        <div className="book-tabs">
          {books.map((book) => (
            <button
              className={activeBook === book.id ? "active" : ""}
              key={book.id}
              onClick={() => {
                setActiveBook(book.id);
                setActiveUnit("全部單元");
                setQuizQuestions([]);
                setAnswers({});
              }}
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
            <p className="eyebrow">單元題庫練習</p>
            <h2>選科目、選冊別、選單元，再進入測驗。</h2>
          </div>
          <p>
            國文、英文、數學、生物、理化、歷史、地理、公民、地科都保留獨立入口；目前匯入題庫以康軒授權資料為核心，
            自然科入口共用自然題庫，社會科入口共用社會題庫，之後可逐年補上其他版本與年度題目。
          </p>
        </div>

        <div className="subject-rail" aria-label="科目選擇">
          {subjects.map((subject) => (
            <button
              className={activeSubject.label === subject.label ? "active" : ""}
              key={subject.label}
              onClick={() => setActiveSubject(subject)}
              style={{ "--accent": subject.accent } as CSSProperties}
              type="button"
            >
              <span>{subject.label.slice(0, 1)}</span>
              {subject.label}
            </button>
          ))}
        </div>

        <div className="quiz-setup">
          <label>
            單元
            <select
              onChange={(event) => {
                setActiveUnit(event.target.value);
                setQuizQuestions([]);
                setAnswers({});
              }}
              value={activeUnit}
            >
              <option>全部單元</option>
              {units.map((unit) => (
                <option key={unit.name} value={unit.name}>
                  {unit.name}（{unit.count} 題）
                </option>
              ))}
            </select>
          </label>
          <div className="quiz-meta">
            <strong>{activeSubject.label}</strong>
            <span>{activeBook} · {activeUnit}</span>
            <span>可抽題數：{eligibleQuestions.length.toLocaleString("zh-TW")}</span>
          </div>
          <button className="primary-action" disabled={loading || bankQuestions.length === 0} onClick={startRandomQuiz} type="button">
            {loading ? "題庫載入中" : "開始 25 題隨機"}
          </button>
        </div>

        {error ? <p className="quiz-error">{error}</p> : null}
        <p className="muted-note">
          若指定冊別或單元不足 25 題，系統會以同科授權題庫補足，確保進入測驗後每次都能抽出一組可作答題目。
        </p>
      </section>

      <section className="quiz-section" id="quiz">
        <div className="section-heading">
          <div>
            <p className="eyebrow">立即作答 / 看解析</p>
            <h2>每次 25 題隨機，按一次就知道有沒有正確。</h2>
          </div>
          <p>
            作答後會立即顯示正確答案與解析；答錯會標出你的選項，方便學生段考前針對單元補強。
          </p>
        </div>

        <div className="quiz-board">
          <aside className="quiz-status">
            <strong>{correctCount}/{answeredCount || 0}</strong>
            <span>已作答 {answeredCount} / {quizQuestions.length || 25} 題</span>
            <span>{activeSubject.label} · {activeBook} · {activeUnit}</span>
            <button disabled={loading || bankQuestions.length === 0} onClick={startRandomQuiz} type="button">
              重新抽 25 題
            </button>
            <button onClick={() => setAnswers({})} type="button">
              清除作答
            </button>
          </aside>

          <div className="question-list">
            {quizQuestions.length === 0 ? (
              <article className="question-card">
                <div className="question-head">
                  <span>尚未開始</span>
                  <small>真題庫隨機抽題</small>
                </div>
                <p>
                  請先在上方選擇科目、冊別與單元，再按「開始 25 題隨機」。開始後才會從授權匯入題庫抽出真正題目。
                </p>
              </article>
            ) : (
              quizQuestions.map((question, index) => {
                const selected = answers[question.id];
                const isCorrect = selected === question.normalizedAnswer;

                return (
                  <article className="question-card" key={question.id}>
                    <div className="question-head">
                      <span>第 {index + 1} 題</span>
                      <small>{question.version} · {question.book || activeBook} · {question.unit || "未標示單元"} · {question.difficulty || "未標示難度"}</small>
                    </div>
                    <p>{question.cleanedPrompt}</p>
                    <div className="choice-grid">
                      {question.normalizedChoices.map((choice, choiceIndex) => {
                        const letter = answerLetters[choiceIndex];
                        const buttonClass = [
                          selected === letter ? "selected" : "",
                          selected && question.normalizedAnswer === letter ? "correct" : "",
                          selected === letter && !isCorrect ? "wrong" : "",
                        ].filter(Boolean).join(" ");

                        return (
                          <button className={buttonClass} key={`${question.id}-${letter}`} onClick={() => chooseAnswer(question.id, letter)} type="button">
                            <b>{letter}.</b> {choice}
                          </button>
                        );
                      })}
                    </div>
                    {selected ? (
                      <div className={`analysis ${isCorrect ? "correct" : ""}`}>
                        <strong className="answer-status">{isCorrect ? "答對" : "答錯"}</strong>
                        <span>你的答案：{selected}</span>
                        <span>正確答案：{question.normalizedAnswer}</span>
                        <p>{question.explanation?.trim() || "此題原始題庫未提供解析，請先對照答案與題幹關鍵字複習。"}</p>
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="sources-section" id="sources">
        <div className="section-heading">
          <div>
            <p className="eyebrow">題庫來源</p>
            <h2>目前已接入授權 Drive 題庫。</h2>
          </div>
          <p>
            題目以分科 JSON 載入，網站公開使用時不需要登入，也不需要儲存個人進度；每個人進入都能直接玩、直接練。
          </p>
        </div>

        <div className="imported-bank-panel">
          <div>
            <h3>康軒匯入題庫</h3>
            <p className="muted-note">共 60,297 題，依科目分檔，後續可用相同流程更新年度題庫、會考趨勢與各版本內容。</p>
          </div>
          <div className="imported-stat-grid">
            {importedStats.map((stat) => (
              <a href={stat.file} key={stat.subject}>
                <strong>{stat.count.toLocaleString("zh-TW")}</strong>
                <span>{stat.subject}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="exam-section" id="updates">
        <div className="section-heading">
          <div>
            <p className="eyebrow">會考與年度更新</p>
            <h2>年度題庫可以持續覆蓋，不用重做網站。</h2>
          </div>
          <p>
            Drive 題庫索引、MDB 解析、分科 JSON 都已經放進專案流程；之後只要更新題庫檔，就能重新匯入並部署新版。
          </p>
        </div>
        <div className="exam-grid">
          <article className="exam-card">
            <span>1</span>
            <h3>段考單元</h3>
            <p>依冊別與單元抽題，適合學校小考、段考前集中練習。</p>
          </article>
          <article className="exam-card">
            <span>2</span>
            <h3>會考複習</h3>
            <p>使用全科題庫混合練習，建立跨冊、跨單元的答題手感。</p>
          </article>
          <article className="exam-card">
            <span>3</span>
            <h3>錯題回看</h3>
            <p>每題作答後立即顯示答錯原因與解析，不等到整份交卷。</p>
          </article>
          <article className="exam-card">
            <span>4</span>
            <h3>年度更新</h3>
            <p>題庫來源可依 114、115、116 年度持續更新，保留同一套前端入口。</p>
          </article>
        </div>
      </section>

      <footer>
        <img src="/jiawei-logo.png" alt="嘉偉" />
        <nav>
          <a href="#practice">題庫練習</a>
          <a href="#quiz">立即測驗</a>
          <a href="https://github.com/wei6960/jiawei-108-review-platform">GitHub</a>
        </nav>
        <p>Better Knowledge. Brighter Future.</p>
      </footer>
    </main>
  );
}
