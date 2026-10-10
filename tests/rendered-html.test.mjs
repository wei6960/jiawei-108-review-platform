import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the deep unit review platform", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>嘉偉 108 課綱複習平台<\/title>/i);
  assert.match(html, /深入每一冊/);
  assert.match(html, /單元題庫練習/);
  assert.match(html, /立即作答/);
  assert.match(html, /看解析/);
  assert.match(html, /會考與年度更新/);
  assert.match(html, /B1/);
  assert.match(html, /B6/);
  assert.match(html, /國文/);
  assert.match(html, /地科/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("contains subject, book, unit, and quiz data for real practice", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  for (const subject of ["國文", "英文", "數學", "生物", "理化", "歷史", "地理", "公民", "地科"]) {
    assert.match(page, new RegExp(subject));
  }

  for (const book of ["B1", "B2", "B3", "B4", "B5", "B6"]) {
    assert.match(page, new RegExp(book));
  }

  for (const feature of ["makeQuiz", "targets", "questionCount", "showAnalysis", "錯題", "段考"]) {
    assert.match(page, new RegExp(feature));
  }

  assert.match(layout, /lang="zh-Hant-TW"/);
  assert.match(layout, /單元題庫、段考練習/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
