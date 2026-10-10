import { readFile, writeFile } from "node:fs/promises";

const manifestPath = "public/data/public-sources.json";
const outputPath = "public/data/public-source-index.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const index = [];

for (const source of manifest.sources) {
  const response = await fetch(source.url, {
    headers: {
      "user-agent": "jiawei-108-review-platform/1.0 (+https://github.com/wei6960/jiawei-108-review-platform)",
    },
  });
  const html = await response.text();
  const links = [...html.matchAll(/href=["']([^"']+\.(?:pdf|zip|docx?|xlsx?)[^"']*)["']/gi)]
    .map((match) => new URL(match[1], source.url).href);

  index.push({
    sourceId: source.id,
    title: source.title,
    url: source.url,
    fetchedAt: new Date().toISOString(),
    status: response.status,
    files: [...new Set(links)],
  });
}

await writeFile(outputPath, `${JSON.stringify({ updated: new Date().toISOString(), index }, null, 2)}\n`, "utf8");
console.log(`Indexed ${index.reduce((sum, source) => sum + source.files.length, 0)} public files.`);
