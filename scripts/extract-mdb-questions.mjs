import { readFile, writeFile } from "node:fs/promises";
import MDBReader from "mdb-reader";

const manifestPath = process.argv[2] ?? "work/drive-mdb/manifest.json";
const outputPath = process.argv[3] ?? "public/data/imported-drive-questions.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const subjectMap = [
  ["國文", "國文"],
  ["英語", "英文"],
  ["英文", "英文"],
  ["數學", "數學"],
  ["自然", "自然"],
  ["社會", "社會"],
];

const bookMap = new Map([
  ["1501", "B1"],
  ["1502", "B2"],
  ["1503", "B3"],
  ["1504", "B4"],
  ["1505", "B5"],
  ["1506", "B6"],
  ["1551", "B1"],
  ["1552", "B2"],
  ["1553", "B3"],
  ["1554", "B4"],
  ["1555", "B5"],
  ["1556", "B6"],
]);

function detectSubject(context) {
  return subjectMap.find(([needle]) => context.includes(needle))?.[1] ?? "未分類";
}

function detectPublisher(context) {
  if (context.includes("康軒")) return "康軒";
  if (context.includes("南一")) return "南一";
  if (context.includes("翰林")) return "翰林";
  return "未知";
}

function normalizedTerm(term = "") {
  return String(term).replace(/^155/, "150").replace(/^151/, "150");
}

function cleanText(value = "") {
  return String(value)
    .replace(/\r?\n+/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function splitExplanation(detail = "") {
  const text = cleanText(detail);
  const answerIndex = text.indexOf("《答案》");
  const explainIndex = text.indexOf("詳解：");
  return {
    prompt: answerIndex >= 0 ? text.slice(0, answerIndex).trim() : text,
    embeddedAnswer: answerIndex >= 0 && explainIndex >= 0 ? text.slice(answerIndex + 4, explainIndex).trim() : "",
    explanation: explainIndex >= 0 ? text.slice(explainIndex + 3).trim() : "",
  };
}

function choicesFromPrompt(prompt) {
  const matches = [...prompt.matchAll(/\(([A-D])\)([^()《]+?)(?=\([A-D]\)|$)/g)];
  if (matches.length < 2) return [];
  return matches.map((match) => cleanText(match[2]));
}

function lookup(rows, key) {
  return new Map(rows.map((row) => [row[key], row]));
}

function extractKangxuan(file) {
  const reader = new MDBReader(readFileSyncCompat(file.path));
  const tableNames = new Set(reader.getTableNames());
  if (!tableNames.has("QuesMaster") || !tableNames.has("QuesDetail")) return [];

  const master = reader.getTable("QuesMaster").getData();
  const detailByNo = lookup(reader.getTable("QuesDetail").getData(), "QUES_NO");
  const answerByNo = tableNames.has("QuesAnswer") ? lookup(reader.getTable("QuesAnswer").getData(), "QUES_NO") : new Map();
  const chapterByKey = new Map(
    (tableNames.has("CodeChapter") ? reader.getTable("CodeChapter").getData() : [])
      .map((row) => [`${row.CLASS_TERM}:${row.LESN_NUM}`, row]),
  );
  const difficultyByCode = lookup(tableNames.has("CodeDifEasy") ? reader.getTable("CodeDifEasy").getData() : [], "DIFC_CODE");
  const typeByCode = lookup(tableNames.has("CodeQuesType") ? reader.getTable("CodeQuesType").getData() : [], "QUES_TYPE");

  return master.map((row) => {
    const detail = detailByNo.get(row.QUES_NO)?.QUES_DETL ?? "";
    const parts = splitExplanation(detail);
    const answer = cleanText(answerByNo.get(row.QUES_NO)?.QUES_ANSW ?? parts.embeddedAnswer);
    const chapter = chapterByKey.get(`${row.CLASS_TERM}:${row.LESN_NUM}`) ?? chapterByKey.get(`${normalizedTerm(row.CLASS_TERM)}:${row.LESN_NUM}`);
    const subject = detectSubject(file.context);
    const publisher = detectPublisher(file.context);

    return {
      id: `${publisher}-${row.QUES_NO}`,
      source: file.context,
      sourceFileId: file.id,
      license: "user-authorized",
      year: row.QUES_DATE || "2026",
      publisher,
      version: publisher,
      subject,
      book: bookMap.get(row.CLASS_TERM) ?? bookMap.get(normalizedTerm(row.CLASS_TERM)) ?? row.CLASS_TERM ?? "",
      unit: chapter?.LESN_NAME ?? chapter?.LESN_DESC ?? row.LESN_NUM ?? "",
      topic: row.QUES_TOPIC ?? "",
      difficulty: difficultyByCode.get(row.DIFC_CODE)?.DIFC_DESC ?? row.DIFC_CODE ?? "",
      type: typeByCode.get(row.QUES_TYPE)?.QUES_TYPE_DESC ?? row.QUES_TYPE ?? "",
      prompt: parts.prompt,
      choices: choicesFromPrompt(parts.prompt),
      answer,
      explanation: parts.explanation,
      tags: [publisher, subject, bookMap.get(row.CLASS_TERM) ?? bookMap.get(normalizedTerm(row.CLASS_TERM)) ?? "", chapter?.LESN_DESC ?? ""].filter(Boolean),
    };
  }).filter((item) => item.prompt);
}

function readFileSyncCompat(path) {
  return Buffer.from(globalThis.__readFiles.get(path));
}

const loaded = await Promise.all(manifest.files.map(async (file) => [file.path, await readFile(file.path)]));
globalThis.__readFiles = new Map(loaded);

const items = [];
const stats = [];
for (const file of manifest.files) {
  try {
    const extracted = extractKangxuan(file);
    items.push(...extracted);
    stats.push({ context: file.context, count: extracted.length });
  } catch (error) {
    stats.push({ context: file.context, count: 0, error: error.message });
  }
}

await writeFile(
  outputPath,
  `${JSON.stringify({
    updated: new Date().toISOString(),
    source: "Google Drive publisher question-bank MDB files",
    license: "user-authorized",
    count: items.length,
    stats,
    items,
  }, null, 2)}\n`,
  "utf8",
);

console.log(`Extracted ${items.length} questions to ${outputPath}`);
