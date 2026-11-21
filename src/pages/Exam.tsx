import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Flag, XCircle } from "lucide-react";
import { findQuestion } from "../lib/questions";
import type { ExamState, Store } from "../lib/storage";
import { categoryName } from "../lib/types";
import OriginMark from "../lib/OriginMark";
import { ChoiceNote, TermsMemo } from "../lib/QuestionParts";

interface Props {
  store: Store;
  setStore: (s: Store) => void;
  onFinish: (exam: ExamState) => void;
}


export default function Exam({ store, setStore, onFinish }: Props) {
  const exam = store.exam!;
  const [now, setNow] = useState(Date.now());
  const left = Math.max(0, Math.ceil((exam.endsAt - now) / 1000));

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // 時間切れで自動採点
  useEffect(() => {
    if (left === 0) onFinish(exam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const update = (patch: Partial<ExamState>) => setStore({ ...store, exam: { ...exam, ...patch } });
  const { items, answers, flags, current } = exam;
  const q = findQuestion(items[current].id)!;
  const order = items[current].order;
  const unanswered = answers.filter((a) => a === null).length;
  // すぐ解説を出す設定なら、答えた問題は答えを変えられないようにする
  const instant = store.settings.examInstantFeedback;
  const shown = instant && answers[current] !== null;
  const ok = answers[current] === q.answerIndex;

  const finish = () => {
    const msg = unanswered
      ? `未解答が ${unanswered} 問あります。採点しますか？`
      : "採点しますか？";
    if (window.confirm(msg)) onFinish(exam);
  };

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between bg-slate-50/95 px-4 py-2">
        <span className={`flex items-center gap-1 text-lg font-bold ${left < 300 ? "text-red-600" : "text-blue-950"}`}>
          <Clock size={20} /> 残り {mm}:{ss}
        </span>
        <button onClick={finish} className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-bold text-white">
          採点する
        </button>
      </div>

      <div className="gap-6 md:flex">
        <div className="flex-1 space-y-4">
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-blue-700">
                問{current + 1} / {items.length}・{categoryName(q.category)}
              </span>
              {!q.verified && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800">教則と未照合</span>
              )}
            </div>
            <p className="font-semibold leading-relaxed">
              <OriginMark q={q} />
              {q.question}
            </p>
            <TermsMemo q={q} />
          </div>

          <div className="space-y-2">
            {order.map((orig, n) => {
              const sel = answers[current] === orig;
              let style = sel ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white";
              if (shown && orig === q.answerIndex) style = "border-green-500 bg-green-50";
              else if (shown && sel) style = "border-red-500 bg-red-50";
              return (
                <label
                  key={orig}
                  className={`flex gap-3 rounded-lg border-2 p-4 ${shown ? "" : "cursor-pointer"} ${style}`}
                >
                  <input
                    type="radio"
                    name={`q${current}`}
                    checked={sel}
                    disabled={shown}
                    onChange={() => update({ answers: answers.map((a, k) => (k === current ? orig : a)) })}
                    className="mt-1"
                  />
                  <span className="font-bold text-blue-900">{n + 1}</span>
                  <span>
                    {q.choices[orig]}
                    {shown && <ChoiceNote q={q} orig={orig} />}
                  </span>
                </label>
              );
            })}
          </div>

          {shown && (
            <div className="space-y-2 rounded-lg bg-white p-4 shadow-sm">
              <div className={`flex items-center gap-2 font-bold ${ok ? "text-green-600" : "text-red-600"}`}>
                {ok ? <CheckCircle2 size={20} /> : <XCircle size={20} />} {ok ? "正解" : "不正解"}
              </div>
              <p className="text-sm leading-relaxed">{q.explanation}</p>
              <p className="text-xs text-slate-500">参照：{q.reference}</p>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={flags[current]}
              onChange={(e) => update({ flags: flags.map((f, k) => (k === current ? e.target.checked : f)) })}
            />
            <Flag size={16} className="text-amber-500" /> あとで見直す
          </label>

          <div className="flex gap-3">
            <button
              disabled={current === 0}
              onClick={() => update({ current: current - 1 })}
              className="flex-1 rounded-lg border border-blue-900 py-3 font-bold text-blue-900 disabled:opacity-40"
            >
              前の問題
            </button>
            <button
              disabled={current === items.length - 1}
              onClick={() => update({ current: current + 1 })}
              className="flex-1 rounded-lg bg-blue-900 py-3 font-bold text-white disabled:opacity-40"
            >
              次の問題
            </button>
          </div>
        </div>

        <aside className="mt-6 md:mt-0 md:w-56">
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-2 text-sm font-bold text-blue-950">問題一覧</div>
            <div className="grid grid-cols-5 gap-1.5">
              {items.map((_, k) => {
                let c = "bg-white border-slate-300 text-slate-600";
                if (answers[k] !== null) c = "bg-blue-900 border-blue-900 text-white";
                if (flags[k]) c = "bg-amber-400 border-amber-400 text-white";
                return (
                  <button
                    key={k}
                    onClick={() => update({ current: k })}
                    className={`h-9 rounded border text-sm font-bold ${c} ${k === current ? "ring-2 ring-blue-400 ring-offset-1" : ""}`}
                  >
                    {k + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 space-y-1 text-xs text-slate-600">
              <Legend c="bg-blue-900" t="解答済み" />
              <Legend c="bg-white border border-slate-300" t="未解答" />
              <Legend c="bg-amber-400" t="見直し" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Legend({ c, t }: { c: string; t: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-3 w-3 rounded ${c}`} /> {t}
    </div>
  );
}
