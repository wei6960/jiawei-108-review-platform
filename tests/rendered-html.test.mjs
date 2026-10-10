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

test("server-renders the Jiawei review platform shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>嘉偉 108 課綱複習平台<\/title>/i);
  assert.match(html, /國中三年完整複習/);
  assert.match(html, /學科題庫練習/);
  assert.match(html, /會考專區/);
  assert.match(html, /最新消息/);
  assert.match(html, /B1/);
  assert.match(html, /B6/);
  assert.match(html, /國文/);
  assert.match(html, /地科/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps platform data and starter code aligned with the finished site", async () => {
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

  for (const version of ["翰林", "康軒", "南一"]) {
    assert.match(page, new RegExp(version));
  }

  assert.match(page, /useState/);
  assert.match(page, /activeSubject/);
  assert.match(page, /updateItems/);
  assert.match(layout, /lang="zh-Hant-TW"/);
  assert.match(layout, /國中三年 B1-B6 題庫練習/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
