import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, PenLine, XCircle } from "lucide-react";
import data from "../data/challenge.json";
import { randomAnim } from "../lib/anim";
import { BACKGROUNDS, usePageBackground } from "../lib/background";
import { judgeWritten } from "../lib/judge";
import { shuffle } from "../lib/questions";

interface WriteItem {
  id: string;
  type: "write";
  kind: string;
  prompt: string;
  answers: string[];
  numeric: boolean;
  explanation: string;
  reference: string;
}
interface ClozeItem {
  id: string;
  type: "cloze";
  text: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  reference: string;
}
type Item = WriteItem | ClozeItem;

/** 書いて答える5問＋穴埋め5問を、ランダムな順番で出す */
export default function Challenge({ onExit }: { onExit: () => void }) {
  const items = useMemo(() => {
    const w = shuffle(data.write as WriteItem[]).slice(0, 5);
    const c = shuffle(data.cloze as ClozeItem[]).slice(0, 5).map((it) => ({ ...it, order: shuffle([0, 1, 2]) }));
    return shuffle<Item & { order?: number[] }>([...w, ...c]).map((it) => ({
      ...it,
      bg: Math.floor(Math.random() * BACKGROUNDS.length),
    }));
  }, []);
  const [i, setI] = useState(0);
  const [result, setResult] = useState<{ ok: boolean; given: string } | null>(null);
  const [text, setText] = useState("");
  const [score, setScore] = useState(0);
  usePageBackground(i < items.length ? items[i].bg : null);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [i]);
  const anim = useMemo(() => randomAnim(), [i]);

  if (i >= items.length) {
    return (
      <div className="space-y-4 rounded-lg bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-bold text-blue-950">書く・穴埋めチャレンジ：おつかれさまでした</h1>
        <p className="text-3xl font-bold">
          {score} / {items.length}問 正解
        </p>
        <button onClick={onExit} className="rounded-lg bg-blue-900 px-6 py-3 font-bold text-white">
          トップへ戻る
        </button>
      </div>
    );
  }

  const it = items[i];
  const answer = (ok: boolean, given: string) => {
    setResult({ ok, given });
    if (ok) setScore(score + 1);
  };
  const next = () => {
    setResult(null);
    setText("");
    setI(i + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          書く・穴埋めチャレンジ　{i + 1} / {items.length}
        </span>
        <button onClick={onExit} className="underline">
          やめる
        </button>
      </div>

      <div key={i} className={`space-y-4 ${anim}`}>
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-2 text-xs font-bold text-blue-700">
            {it.type === "write" ? `書いて答える（${it.kind}）` : "穴埋め（選択）"}
          </div>
          {it.type === "write" ? (
            <p className="font-semibold leading-relaxed">{it.prompt}</p>
          ) : (
            <p className="font-semibold leading-relaxed">
              {it.text.split("【　】")[0]}
              <span className="mx-1 inline-block min-w-16 rounded border-b-4 border-blue-500 bg-blue-50 px-2 text-center text-blue-700">
                {result ? it.choices[it.answerIndex] : "？"}
              </span>
              {it.text.split("【　】")[1]}
            </p>
          )}
        </div>

        {!result && it.type === "write" && (
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim()) answer(judgeWritten(text, it.answers, it.numeric), text);
            }}
          >
            <p className="rounded bg-white/70 px-3 py-1.5 text-sm font-semibold text-blue-900">
              👉 答えを書いて、「回答する」を押してください（少しの書き間違いは正解になります）
            </p>
            <div className="flex gap-2">
              <PenLine className="mt-3 shrink-0 text-blue-800" size={20} />
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
                aria-label="答え"
                placeholder="ここに答えを書く"
                className="w-full rounded-lg border-2 border-slate-300 bg-white p-3 text-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              disabled={!text.trim()}
              className="w-full rounded-lg bg-blue-900 py-3 font-bold text-white disabled:opacity-40"
            >
              回答する
            </button>
          </form>
        )}

        {!result && it.type === "cloze" && (
          <div className="space-y-2">
            <p className="rounded bg-white/70 px-3 py-1.5 text-sm font-semibold text-blue-900">
              👉 【　】に入るものをタップしてください
            </p>
            {it.order!.map((orig, n) => (
              <button
                key={orig}
                onClick={() => answer(orig === it.answerIndex, it.choices[orig])}
                className="flex w-full gap-3 rounded-lg border-2 border-slate-200 bg-white p-4 text-left hover:border-blue-400"
              >
                <span className="font-bold text-blue-900">{n + 1}</span>
                <span>{it.choices[orig]}</span>
              </button>
            ))}
          </div>
        )}

        {result && (
          <div className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
            <div className={`flex items-center gap-2 text-lg font-bold ${result.ok ? "text-green-600" : "text-red-600"}`}>
              {result.ok ? <CheckCircle2 /> : <XCircle />} {result.ok ? "正解" : "不正解"}
            </div>
            <p className="text-sm">
              あなたの答え：<b>{result.given}</b>
              <br />
              正解：<b>{it.type === "write" ? it.answers.join(" ／ ") : it.choices[it.answerIndex]}</b>
            </p>
            <p className="leading-relaxed">{it.explanation}</p>
            <p className="text-sm text-slate-500">参照：{it.reference}</p>
            <button onClick={next} className="w-full rounded-lg bg-blue-900 py-3 font-bold text-white">
              {i + 1 < items.length ? "次の問題へ" : "結果を見る"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
