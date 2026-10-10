# 嘉偉 108 課綱複習平台

國中三年 B1-B6 單元題庫、段考練習、會考複習與年度更新平台。

Live site: https://jiawei-108-review-platform.wweden4.chatgpt.site

## 功能

- 九科題庫架構：國文、英文、數學、生物、理化、歷史、地理、公民、地科
- B1-B6 冊次切換與各冊單元拆解
- 各單元包含學習目標、子技能、題型配置、段考策略
- 可作答、交卷、看解析、重練
- 公開題庫來源索引與自建題庫 CSV 匯入
- 年度會考趨勢與版本更新欄位

## 題庫資料

目前採「合法可維護」策略：

- 自建題、老師投稿題、明確授權題：可匯入全文。
- 官方公開會考題：先建立來源索引與連結；若要把全文放進平台，需確認再散布授權。
- 商業題庫、登入後內容、付費教材、未授權解析：不抓取、不搬運、不繞過限制。

公開來源清單：

- `public/data/public-sources.json`
- 官方會考歷屆試題入口：https://cap.rcpet.edu.tw/examination.html
- 官方會考網站：https://cap.rcpet.edu.tw/

題庫模板：

- `public/data/question-bank-template.csv`
- 轉換後範例：`public/data/question-bank.json`
- Drive 索引：`public/data/drive-question-bank-index.json`
- 已解析題庫摘要：`public/data/imported-drive-summary.json`
- 已解析完整題庫：`public/data/imported/kangxuan-*.json`

## 新增題目

1. 複製 `public/data/question-bank-template.csv`
2. 填入題目、答案、解析、來源與授權
3. 執行：

```bash
npm run questions:import -- path/to/questions.csv public/data/question-bank.json
```

CSV 欄位：

```text
id,source,license,year,grade,book,version,subject,unit,topic,difficulty,type,prompt,choice_a,choice_b,choice_c,choice_d,answer,explanation,tags
```

## 索引公開來源

只會讀取公開頁面上的檔案連結，不繞過登入、付費牆或網站限制。

```bash
npm run sources:index
```

輸出：

```text
public/data/public-source-index.json
```

## 索引 Google Drive 題庫資料夾

使用者提供的 Drive 資料夾會被整理成索引，不會直接把出版社題庫內容重發佈到網站。

```bash
npm run drive:index
```

目前索引結果：

- 翰林、康軒、南一題庫資料夾
- 翰林、康軒、南一壓縮檔資料夾
- 共 88 個資料夾、958 個檔案

輸出：

```text
public/data/drive-question-bank-index.json
```

## 下載並解析 MDB 題庫

不執行任何題庫 `.exe`，只下載 Google Drive 裡的 Access/MDB 資料庫並轉成 JSON。

```bash
npm run drive:download-mdb
npm run drive:extract-mdb
```

目前已解析康軒 115 上五科：

- 自然：9,231 題
- 社會：18,331 題
- 英文：6,344 題
- 國文：11,974 題
- 數學：14,417 題
- 合計：60,297 題

為了避免單一 JSON 檔過大，完整題庫已依科目切檔：

- `public/data/imported/kangxuan-自然.json`
- `public/data/imported/kangxuan-社會.json`
- `public/data/imported/kangxuan-英文.json`
- `public/data/imported/kangxuan-國文.json`
- `public/data/imported/kangxuan-數學.json`

## 開發

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
npm test
```

## 授權注意

本 repo 的程式碼可公開協作。題庫內容必須逐題保留 `source` 與 `license`，避免混入來源不明或未授權內容。
