import type { Question } from "./types";

/** 問題文の下に出す用語メモ */
export function TermsMemo({ q }: { q: Question }) {
  if (!q.terms?.length) return null;
  return (
    <dl className="mt-3 space-y-1 rounded bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
      <div className="font-bold text-slate-500">用語メモ</div>
      {q.terms.map((t) => (
        <div key={t.term}>
          <dt className="inline font-semibold text-slate-700">{t.term}</dt>
          <dd className="inline">：{t.meaning}</dd>
        </div>
      ))}
    </dl>
  );
}

/** 答えたあとに、選択肢の下に出す「なぜ違うか」 */
export function ChoiceNote({ q, orig }: { q: Question; orig: number }) {
  const note = q.choiceNotes?.[orig];
  if (!note) return null;
  return <span className="mt-1 block text-sm text-slate-600">→ {note}</span>;
}
