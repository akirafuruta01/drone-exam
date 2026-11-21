# drone-exam

無人航空機操縦士（二等）学科試験の対策アプリです。学習の記録はブラウザの中（localStorage）だけに保存します。

## 起動

```bash
npm install
npm run dev
```

## 問題データ

`src/data/questions.json` に入っています。

- `category`: `rules`（規則）/ `system`（システム）/ `operation`（操縦者・運航体制）/ `risk`（リスク管理）
- `origin`: `kyosoku`（教則の文をほぼそのまま使った問題）/ `original`（AIが考えたオリジナル問題）。問題文の前に印が出る（省略可）
- `verified`: 最新版の教則と照らし合わせて確認したか。確認前は `false`
- `verifiedAt` / `sourceVersion`: 確認した日と、照らし合わせた教則の版
- 選択肢は順番が入れ替わるので、「上記すべて」のような選択肢は使わない

## 公開

main に取り込まれると、GitHub Actions が自動でビルドして GitHub Pages に公開します。

- 公開先：https://akirafuruta01.github.io/drone-exam/
- 初回だけ、リポジトリの Settings → Pages → Source を「GitHub Actions」にしておく

## ポッドキャスト（難しい問題だけ）

- 台本：`podcast/scripts/<問題id>.json`（`expert`＝詳しい人、`beginner`＝初心者）
- 音声：`public/podcast/<問題id>.mp3`。`podcast/make_episode.py` で VOICEVOX から作る
- 一覧：`src/data/podcasts.json`（ここにある問題だけ、解説の下にプレーヤーが出る）
- 音声：VOICEVOX:青山龍星（詳しい人）／VOICEVOX:玄野武宏（初心者）。クレジット表示が利用条件
