import { mkdir, readFile, writeFile } from "node:fs/promises";

const indexPath = process.argv[2] ?? "public/data/drive-question-bank-index.json";
const outputDir = process.argv[3] ?? "work/drive-mdb";
const only = process.env.DRIVE_MDB_FILTER ? new RegExp(process.env.DRIVE_MDB_FILTER, "i") : null;
const index = JSON.parse(await readFile(indexPath, "utf8"));

function ancestry(folder) {
  const byId = new Map(index.folders.map((item) => [item.id, item]));
  const names = [folder.title];
  let parent = folder.parent ? byId.get(folder.parent) : null;
  while (parent) {
    names.unshift(parent.title);
    parent = parent.parent ? byId.get(parent.parent) : null;
  }
  return names;
}

function safeName(value) {
  return value.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim();
}

async function downloadFile(fileId, outPath) {
  const first = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`);
  const firstBuffer = Buffer.from(await first.arrayBuffer());
  const firstText = firstBuffer.toString("utf8");
  const uuid = firstText.match(/name="uuid" value="([^"]+)"/)?.[1];
  const confirm = firstText.match(/name="confirm" value="([^"]+)"/)?.[1];

  if (uuid && confirm) {
    const url = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=${encodeURIComponent(confirm)}&uuid=${encodeURIComponent(uuid)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed ${fileId}: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(outPath, buffer);
    return buffer.length;
  }

  await writeFile(outPath, firstBuffer);
  return firstBuffer.length;
}

await mkdir(outputDir, { recursive: true });

const targets = [];
for (const folder of index.folders) {
  const names = ancestry(folder);
  for (const file of folder.children.filter((item) => item.kind === "file" && /\.mdb$/i.test(item.name))) {
    if (/Pic\.mdb$/i.test(file.name)) continue;
    if (/nani\.mdb$/i.test(file.name)) continue;
    const context = [...names, file.name].join(" / ");
    if (only && !only.test(context)) continue;
    targets.push({ folder, file, context });
  }
}

const manifest = [];
for (const target of targets) {
  const names = ancestry(target.folder);
  const outName = `${safeName([...names, target.file.name].join(" - "))}.mdb`;
  const outPath = `${outputDir}/${outName}`;
  console.log(`Downloading ${target.context}`);
  const bytes = await downloadFile(target.file.id, outPath);
  manifest.push({
    id: target.file.id,
    name: target.file.name,
    context: target.context,
    path: outPath,
    bytes,
    driveUrl: target.file.url,
  });
}

await writeFile(`${outputDir}/manifest.json`, `${JSON.stringify({ updated: new Date().toISOString(), files: manifest }, null, 2)}\n`);
console.log(`Downloaded ${manifest.length} MDB files to ${outputDir}`);
