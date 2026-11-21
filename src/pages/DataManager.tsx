import { useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { downloadJson, parseQuestions } from "../lib/importQuestions";
import { builtinQuestions, getQuestions } from "../lib/questions";
import type { Store } from "../lib/storage";
import { CATEGORIES } from "../lib/types";

interface Props {
  store: Store;
  setStore: (s: Store) => void;
  onExit: () => void;
}

const SAMPLE = `[
  {
    "id": "my_001",
    "category": "rules",
    "question": "問題文",
    "choices": ["選択肢1", "選択肢2", "選択肢3"],
    "answerIndex": 0,
    "explanation": "解説",
    "reference": "教則 3章",
    "verified": false
  }
]`;

export default function DataManager({ store, setStore, onExit }: Props) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState<{ ok: string[]; errors: string[] } | null>(null);
  const custom = store.customQuestions;
  const builtinIds = new Set(builtinQuestions.map((q) => q.id));
  const today = new Date().toISOString().slice(0, 10);

  const runImport = (src: string) => {
    const { questions, errors } = parseQuestions(src);
    const clash = questions.filter((q) => builtinIds.has(q.id));
    const usable = questions.filter((q) => !builtinIds.has(q.id));
    clash.forEach((q) => errors.push(`id「${q.id}」は最初から入っている問題と同じなので、読み込めません`));
    const existing = new Set(custom.map((q) => q.id));
    const updated = usable.filter((q) => existing.has(q.id)).length;
    const added = usable.length - updated;
    const ok: string[] = [];
    if (usable.length) {
      const map = new Map(custom.map((q) => [q.id, q]));
      usable.forEach((q) => map.set(q.id, q));
      setStore({ ...store, customQuestions: [...map.values()] });
      ok.push(`${added}問を追加${updated ? `、${updated}問を上書き` : ""}しました。`);
      setText("");
    }
    setMessage({ ok, errors });
  };

  const onFile = async (f?: File) => {
    if (f) runImport(await f.text());
  };

  const removeAll = () => {
    if (!window.confirm(`読み込んだ問題 ${custom.length} 問をすべて削除しますか？（元に戻せません）`)) return;
    // 途中の模擬試験に削除する問題が入っていると再開できないため、試験も終了する
    setStore({ ...store, customQuestions: [], exam: null });
    setMessage({ ok: ["読み込んだ問題を削除しました。"], errors: [] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-950">問題データの管理</h1>
        <button onClick={onExit} className="text-sm underline">
          トップへ戻る
        </button>
      </div>

      <section className="rounded-lg bg-white p-4 text-sm shadow-sm">
        <div>
          最初から入っている問題：{builtinQuestions.length}問　／　読み込んだ問題：{custom.length}問
        </div>
        <div className="mt-1 text-slate-500">
          教則と照合済み：{getQuestions().filter((q) => q.verified).length} / {getQuestions().length}問
        </div>
      </section>

      <section className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 font-bold text-blue-950">
          <Upload size={18} /> 問題を読み込む
        </h2>
        <label className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-blue-300 p-4 text-center text-blue-900 hover:bg-blue-50">
          JSON ファイルを選ぶ
          <input
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        <div className="text-center text-xs text-slate-500">または、下に貼り付け</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={SAMPLE}
          rows={8}
          className="w-full rounded border border-slate-300 p-2 font-mono text-xs"
        />
        <button
          disabled={!text.trim()}
          onClick={() => runImport(text)}
          className="w-full rounded-lg bg-blue-900 py-3 font-bold text-white disabled:opacity-40"
        >
          貼り付けた問題を読み込む
        </button>

        {message && (
          <div className="space-y-1 text-sm">
            {message.ok.map((m) => (
              <p key={m} className="text-green-700">
                {m}
              </p>
            ))}
            {message.errors.length > 0 && (
              <div className="rounded bg-red-50 p-3 text-red-700">
                <p className="font-bold">読み込めなかった問題：{message.errors.length}件</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {message.errors.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <details className="text-xs text-slate-600">
          <summary className="cursor-pointer">書き方の説明</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              category：
              {CATEGORIES.map((c) => `${c.id}（${c.name}）`).join("、")}
            </li>
            <li>choices は3つ。answerIndex は正解の番号で、1つ目が 0、2つ目が 1、3つ目が 2</li>
            <li>verified：教則と照らし合わせて確認したら true（省略すると false）</li>
            <li>同じ id の問題を読み込むと、上書きされます</li>
            <li>選択肢の順番は入れ替わるので、「上記すべて」のような選択肢は使わない</li>
          </ul>
        </details>
      </section>

      <section className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 font-bold text-blue-950">
          <Download size={18} /> 問題を書き出す
        </h2>
        <button
          onClick={() => downloadJson(`drone-exam-all-${today}.json`, getQuestions())}
          className="w-full rounded-lg border border-blue-900 py-3 font-bold text-blue-900"
        >
          すべての問題を書き出す（{getQuestions().length}問）
        </button>
        <button
          disabled={!custom.length}
          onClick={() => downloadJson(`drone-exam-custom-${today}.json`, custom)}
          className="w-full rounded-lg border border-blue-900 py-3 font-bold text-blue-900 disabled:opacity-40"
        >
          読み込んだ問題だけ書き出す（{custom.length}問）
        </button>
      </section>

      {custom.length > 0 && (
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <button onClick={removeAll} className="flex items-center gap-2 text-sm text-red-600">
            <Trash2 size={16} /> 読み込んだ問題をすべて削除
          </button>
        </section>
      )}
    </div>
  );
}
