import { useMemo, useState } from "react";
import { CheckCircle2, Star, XCircle } from "lucide-react";
import { choiceOrder, shuffle } from "../lib/questions";
import { recordAnswer, toggleBookmark, type Store } from "../lib/storage";
import { categoryName, type Question } from "../lib/types";

interface Props {
  title: string;
  questions: Question[];
  store: Store;
  setStore: (s: Store) => void;
  onExit: () => void;
}

export default function Practice({ title, questions, store, setStore, onExit }: Props) {
  // 開始時に出題順と選択肢の順番を決める
  const items = useMemo(
    () => shuffle(questions).map((q) => ({ q, order: choiceOrder(store.settings.shuffleChoices) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  if (i >= items.length) {
    return (
      <div className="space-y-4 rounded-lg bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-bold text-blue-950">{title}：おつかれさまでした</h1>
        <p className="text-3xl font-bold">
          {score} / {items.length}問 正解
        </p>
        <button onClick={onExit} className="rounded-lg bg-blue-900 px-6 py-3 font-bold text-white">
          トップへ戻る
        </button>
      </div>
    );
  }

  const { q, order } = items[i];
  const answered = picked !== null;
  const ok = picked === q.answerIndex;
  const marked = store.bookmarks.includes(q.id);

  const choose = (orig: number) => {
    if (answered) return;
    setPicked(orig);
    const good = orig === q.answerIndex;
    if (good) setScore(score + 1);
    setStore(recordAnswer(store, q.id, good));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {title}　{i + 1} / {items.length}
        </span>
        <button onClick={onExit} className="underline">
          やめる
        </button>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs">
          <span className="text-blue-700">{categoryName(q.category)}</span>
          <div className="flex items-center gap-2">
            {!q.verified && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800">教則と未照合</span>
            )}
            <button
              onClick={() => setStore(toggleBookmark(store, q.id))}
              aria-label="ブックマーク"
              className={marked ? "text-amber-500" : "text-slate-300"}
            >
              <Star size={22} fill={marked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
        <p className="font-semibold leading-relaxed">{q.question}</p>
      </div>

      <div className="space-y-2">
        {order.map((orig, n) => {
          let style = "border-slate-200 bg-white hover:border-blue-400";
          if (answered && orig === q.answerIndex) style = "border-green-500 bg-green-50";
          else if (answered && orig === picked) style = "border-red-500 bg-red-50";
          return (
            <button
              key={orig}
              onClick={() => choose(orig)}
              disabled={answered}
              className={`flex w-full gap-3 rounded-lg border-2 p-4 text-left ${style}`}
            >
              <span className="font-bold text-blue-900">{n + 1}</span>
              <span>{q.choices[orig]}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
          <div className={`flex items-center gap-2 text-lg font-bold ${ok ? "text-green-600" : "text-red-600"}`}>
            {ok ? <CheckCircle2 /> : <XCircle />} {ok ? "正解" : "不正解"}
          </div>
          <p className="leading-relaxed">{q.explanation}</p>
          <p className="text-sm text-slate-500">参照：{q.reference}</p>
          <button
            onClick={() => {
              setPicked(null);
              setI(i + 1);
            }}
            className="w-full rounded-lg bg-blue-900 py-3 font-bold text-white"
          >
            {i + 1 < items.length ? "次の問題へ" : "結果を見る"}
          </button>
        </div>
      )}
    </div>
  );
}
