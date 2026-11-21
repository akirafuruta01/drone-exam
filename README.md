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
- `verified`: 最新版の教則と照らし合わせて確認したか。確認前は `false`
- `verifiedAt` / `sourceVersion`: 確認した日と、照らし合わせた教則の版
- 選択肢は順番が入れ替わるので、「上記すべて」のような選択肢は使わない
