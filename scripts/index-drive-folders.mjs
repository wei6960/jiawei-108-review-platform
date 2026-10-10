import { mkdir, readFile, writeFile } from "node:fs/promises";

const roots = [
  { id: "1Ea7fEvSqPZyJ2EKXW892y3sZlgPH84Zs", title: "翰林", kind: "folder" },
  { id: "1Y9vIE9vlixQWWu81lII3NeOq0-T_Lqe8", title: "康軒", kind: "folder" },
  { id: "1a8fu2VuOOJD2fekyEwfa21zaN_rJd5KG", title: "翰林壓縮檔", kind: "archive-folder" },
  { id: "1cAjfllTfelrcf79b3tCP7YyZMM8xa4jM", title: "南一", kind: "folder" },
  { id: "1qRCmq8clVH-fCswM_XsKvigVBitXYHsm", title: "南一壓縮檔", kind: "archive-folder" },
  { id: "1urRWPhc4X_Lf6_66_D-Zuche5u1Ffu87", title: "康軒壓縮檔", kind: "archive-folder" },
];

const maxDepth = Number(process.env.DRIVE_INDEX_DEPTH ?? 2);
const output = process.argv[2] ?? "public/data/drive-question-bank-index.json";
const cacheDir = "work/drive-cache";
const seen = new Set();

function urlFor(id) {
  return `https://drive.google.com/drive/folders/${id}?usp=drive_link`;
}

function decodeEntities(value) {
  return value
    .replaceAll("&quot;", "\"")
    .replaceAll("&amp;", "&")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]+>/g, "").trim());
}

function parseRows(html) {
  const rows = [];
  const re = /<tr[^>]+data-id="([^"]+)"[\s\S]*?<strong class="DNoYtb">([\s\S]*?)<\/strong>[\s\S]*?aria-label="Modified ([^"]*)"[\s\S]*?<td class="NYP1ee M3pype" data-column-field="3"[\s\S]*?<div class="JxSEve" aria-label="([^"]*)"/g;
  let match;

  while ((match = re.exec(html))) {
    const id = match[1];
    const name = stripTags(match[2]);
    const modified = decodeEntities(match[3]);
    const sizeLabel = decodeEntities(match[4]);
    const isArchive = /\.(7z|rar|zip)$/i.test(name);
    const isFolder = !isArchive && /Size not available/i.test(sizeLabel);
    rows.push({
      id,
      name,
      url: isFolder ? urlFor(id) : `https://drive.google.com/file/d/${id}/view`,
      kind: isFolder ? "folder" : "file",
      modified,
      size: sizeLabel.replace(/^Size:\s*/i, "").replace(/\s*Storage used:.*$/is, "").trim(),
    });
  }

  return rows;
}

async function fetchFolder(id) {
  await mkdir(cacheDir, { recursive: true });
  const cachePath = `${cacheDir}/${id}.html`;

  try {
    return await readFile(cachePath, "utf8");
  } catch {
    const response = await fetch(urlFor(id), {
      headers: {
        "user-agent": "jiawei-108-review-platform/1.0 (+https://github.com/wei6960/jiawei-108-review-platform)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${id}: ${response.status}`);
    }

    const html = await response.text();
    await writeFile(cachePath, html, "utf8");
    return html;
  }
}

async function crawlFolder(folder, depth = 0, parent = null) {
  if (seen.has(folder.id)) {
    return [];
  }

  seen.add(folder.id);
  const html = await fetchFolder(folder.id);
  const children = parseRows(html);
  const record = {
    id: folder.id,
    title: folder.title,
    kind: folder.kind ?? "folder",
    parent,
    depth,
    url: urlFor(folder.id),
    children,
  };
  const records = [record];

  if (depth < maxDepth) {
    for (const child of children.filter((item) => item.kind === "folder")) {
      records.push(...await crawlFolder({ id: child.id, title: child.name, kind: "folder" }, depth + 1, folder.id));
    }
  }

  return records;
}

const records = [];

for (const root of roots) {
  records.push(...await crawlFolder(root));
}

const fileCount = records.reduce((sum, folder) => sum + folder.children.filter((item) => item.kind === "file").length, 0);
const folderCount = records.length;

await writeFile(
  output,
  `${JSON.stringify({
    updated: new Date().toISOString(),
    policy: "Index only. Do not redistribute publisher-owned question bank contents unless redistribution rights are confirmed.",
    maxDepth,
    folderCount,
    fileCount,
    roots,
    folders: records,
  }, null, 2)}\n`,
  "utf8",
);

console.log(`Indexed ${folderCount} folders and ${fileCount} files to ${output}`);
