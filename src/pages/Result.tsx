import { CheckCircle2, XCircle } from "lucide-react";
import { findQuestion, PASS_RATE } from "../lib/questions";
import type { ExamState } from "../lib/storage";
import { CATEGORIES, categoryName } from "../lib/types";
import OriginMark from "../lib/OriginMark";
import { ChoiceNote, TermsMemo } from "../lib/QuestionParts";
import Podcast from "../lib/Podcast";
import { useAltFor, variationSeed, worded } from "../lib/wording";


export default function Result({ exam, onExit }: { exam: ExamState; onExit: () => void }) {
  const rows = exam.items.map((it, k) => {
    const base = findQuestion(it.id)!;
    const q = worded(base, useAltFor(base, k), variationSeed(base, k));
    return { q, order: it.order, picked: exam.answers[k], ok: exam.answers[k] === q.answerIndex };
  });
  const score = rows.filter((r) => r.ok).length;
  const total = rows.length;
  const pct = Math.round((score / total) * 100);
  const pass = score / total >= PASS_RATE;
  const need = Math.ceil(total * PASS_RATE);

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-6 text-center shadow-sm">
        <div className="text-sm text-slate-500">模擬試験の結果</div>
        <div className="my-2 text-4xl font-bold text-blue-950">
          {score} / {total}問
        </div>
        <div className="text-lg">正答率 {pct}%</div>
        <div
          className={`mx-auto mt-3 inline-block rounded-full px-6 py-2 text-xl font-bold text-white ${pass ? "bg-green-600" : "bg-red-600"}`}
        >
          {pass ? "合格" : "不合格"}
        </div>
        <div className="mt-2 text-sm text-slate-500">
          合格ライン：{need}問以上（{PASS_RATE * 100}%）
        </div>
      </section>

      <section className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="font-bold text-blue-950">分野別の正答率</h2>
        {CATEGORIES.map((c) => {
          const rs = rows.filter((r) => r.q.category === c.id);
          if (!rs.length) return null;
          const ok = rs.filter((r) => r.ok).length;
          const p = Math.round((ok / rs.length) * 100);
          return (
            <div key={c.id}>
              <div className="flex justify-between text-sm">
                <span>{c.name}</span>
                <span>
                  {ok}/{rs.length}（{p}%）
                </span>
              </div>
              <div className="mt-1 h-3 rounded bg-slate-200">
                <div
                  className={`h-3 rounded ${p >= PASS_RATE * 100 ? "bg-blue-700" : "bg-red-500"}`}
                  style={{ width: `${p}%` }}
                />
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-blue-950">ふりかえり</h2>
        {rows.map(({ q, order, picked, ok }, k) => (
          <details key={q.id} className="rounded-lg bg-white p-4 shadow-sm" open={!ok}>
            <summary className="flex cursor-pointer items-start gap-2">
              {ok ? (
                <CheckCircle2 className="shrink-0 text-green-600" size={20} />
              ) : (
                <XCircle className="shrink-0 text-red-600" size={20} />
              )}
              <span className="font-semibold">
                問{k + 1}　<OriginMark q={q} />
                {q.question}
              </span>
            </summary>
            <div className="mt-3 space-y-2 text-sm">
              <div className="text-xs text-blue-700">{categoryName(q.category)}</div>
              <TermsMemo q={q} />
              {order.map((orig, n) => (
                <div
                  key={orig}
                  className={`rounded border p-2 ${orig === q.answerIndex ? "border-green-500 bg-green-50" : orig === picked ? "border-red-500 bg-red-50" : "border-slate-200"}`}
                >
                  {n + 1}. {q.choices[orig]}
                  {orig === q.answerIndex && <b className="ml-2 text-green-700">正解</b>}
                  {orig === picked && orig !== q.answerIndex && <b className="ml-2 text-red-700">あなたの回答</b>}
                  <ChoiceNote q={q} orig={orig} />
                </div>
              ))}
              {picked === null && <div className="text-red-700">未解答</div>}
              <p className="leading-relaxed">{q.explanation}</p>
              <p className="text-slate-500">参照：{q.reference}</p>
              <Podcast q={q} />
            </div>
          </details>
        ))}
      </section>

      <button onClick={onExit} className="w-full rounded-lg bg-blue-900 py-3 font-bold text-white">
        トップへ戻る
      </button>
    </div>
  );
}
