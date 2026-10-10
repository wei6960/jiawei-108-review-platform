import { readFile, writeFile } from "node:fs/promises";

const [, , input = "public/data/question-bank-template.csv", output = "public/data/question-bank.json"] = process.argv;

function parseCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }

  cells.push(cell);
  return cells;
}

const csv = await readFile(input, "utf8");
const [headerLine, ...rows] = csv.trim().split(/\r?\n/);
const headers = parseCsvLine(headerLine);
const items = rows.filter(Boolean).map((row) => {
  const values = parseCsvLine(row);
  const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  return {
    id: record.id,
    source: record.source,
    license: record.license,
    year: Number(record.year),
    grade: Number(record.grade),
    book: record.book,
    version: record.version,
    subject: record.subject,
    unit: record.unit,
    topic: record.topic,
    difficulty: record.difficulty,
    type: record.type,
    prompt: record.prompt,
    choices: [record.choice_a, record.choice_b, record.choice_c, record.choice_d].filter(Boolean),
    answer: record.answer,
    explanation: record.explanation,
    tags: record.tags ? record.tags.split(";").filter(Boolean) : [],
  };
});

await writeFile(output, `${JSON.stringify({ updated: new Date().toISOString(), items }, null, 2)}\n`, "utf8");
console.log(`Imported ${items.length} questions to ${output}`);
