# PoemApp

詩を書く・保存する・読むためのシンプルなWebアプリです。  
React（Create React App）+ React Router + Supabase（Google OAuth）+ Vercel で動作します。

---

## 機能

### 投稿・編集・閲覧
- 詩の新規作成
- 詩の編集（/edit/:id）
- 詩の閲覧（/view/:id）
- タイトル、本文、感情（emotion）、タグの管理

### タイトル生成・AI評価（任意）
- /api/evaluate-poem によるタイトル候補生成
- 保存時に評価データ（score/comment/emotion/tags など）を付与可能
- AI評価が失敗しても保存自体は継続（評価は「任意」扱い）

### UX（体験の安定化）
- 保存中はボタン文言が「保存しています…」に変化
- 保存成功トースト「✓ 保存しました」表示後に遷移
- エラーは画面内に1行表示（alert 乱用を避ける）
- 新規作成時は localStorage に下書き自動保存
- iOS での viewport 揺れ対策（visualViewport + CSS変数）
- Portal 表示中は body スクロール停止

---

## 技術スタック
- Create React App（CRA）
- React / React Router（BrowserRouter）
- Supabase（Auth + DB）
- Vercel（ホスティング / Functions）
- API: `/api/evaluate-poem`（Vercel Functions想定）

---

## ルーティング構成
- `/` 一覧
- `/edit/:id` 編集
- `/view/:id` 閲覧

注意  
HashRouter（/#/）は使用しません。Supabase OAuth の戻り値と衝突するため、BrowserRouter を採用しています。

---

## 必要な環境変数（例）

CRA のため、クライアント側は `REACT_APP_` 接頭辞が必要です。

`.env`（例）
- `REACT_APP_SUPABASE_URL=...`
- `REACT_APP_SUPABASE_ANON_KEY=...`

注意  
`.env` は Git にコミットしないでください（.gitignore 推奨）。

---

## 開発（ローカル）

依存関係のインストール
```bash
npm install

# PoemApp

PoemApp は、詩を書く・保存する・読むことに特化した Web アプリです。  
Create React App（CRA）をベースに、Supabase（Auth + DB）と Vercel を用いて運用しています。

本 README は **実際のプロジェクト構成・運用前提に即したドキュメント**です。

---

## 概要

- 詩の新規作成 / 編集 / 閲覧
- Google OAuth ログイン（Supabase）
- 下書き自動保存（localStorage）
- 保存時の UX フィードバック最適化
- AI によるタイトル生成・評価（任意・失敗許容）
- iOS Safari 対応（viewport 揺れ対策 / Portal）

---

## 技術スタック

- Create React App（CRA）
- React 18
- React Router（BrowserRouter）
- Supabase
  - Authentication（Google OAuth）
  - Database（PostgreSQL）
  - RLS（Row Level Security）
- Vercel
  - Hosting
  - Serverless Functions（/api）

---

## ルーティング構成

| Path | 内容 |
|---|---|
| `/` | 詩一覧 |
| `/edit/:id` | 詩の編集 |
| `/view/:id` | 詩の閲覧 |

※ HashRouter（/#/）は使用しません。  
Supabase OAuth の戻り値（URL fragment）と衝突するため、**BrowserRouter 前提**です。

---

## 環境変数

### クライアント（CRA）

`.env`
```env
REACT_APP_SUPABASE_URL=xxxxxxxxxxxxxxxxxxxx
REACT_APP_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxx
