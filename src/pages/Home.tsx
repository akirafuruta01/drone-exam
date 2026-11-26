import { BookOpen, Clock, Database, Headphones, PenLine, Target, TriangleAlert } from "lucide-react";
import type { View } from "../App";
import podcasts from "../data/podcasts.json";
import { getQuestions, examSpec, PASS_RATE, SESSION_SIZES } from "../lib/questions";
import { isWeak, type Store } from "../lib/storage";
import { CATEGORIES } from "../lib/types";

interface Props {
  store: Store;
  setStore: (s: Store) => void;
  go: (v: View) => void;
  startExam: (type: "short" | "full") => void;
  resumeExam: () => void;
}

export default function Home({ store, setStore, go, startExam, resumeExam }: Props) {
  const { records, bookmarks, settings, exams, exam } = store;
  const pool = settings.verifiedOnly ? getQuestions().filter((q) => q.verified) : getQuestions();
  const answered = getQuestions().filter((q) => records[q.id]).length;
  const recent = store.recent;
  const recentRate = recent.length ? Math.round((recent.filter(Boolean).length / recent.length) * 100) : null;
  const weak = pool.filter((q) => isWeak(records[q.id]) || bookmarks.includes(q.id));
  const unverified = getQuestions().filter((q) => !q.verified).length;

  const setSetting = (k: keyof Store["settings"], v: boolean) =>
    setStore({ ...store, settings: { ...settings, [k]: v } });

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-3 gap-3">
        <Stat label="解答済み" value={`${answered} / ${getQuestions().length}`} />
        <Stat
          label={`直近${recent.length || ""}回の正答率`}
          value={recentRate === null ? "—" : `${recentRate}%`}
        />
        <Stat label="苦手問題" value={`${getQuestions().filter((q) => isWeak(records[q.id])).length}問`} />
      </section>

      <section className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm">
        <span className="font-bold text-blue-950">1回の問題数</span>
        <div className="flex gap-1" role="group" aria-label="1回の問題数">
          {SESSION_SIZES.map((n) => (
            <button
              key={n}
              onClick={() => setStore({ ...store, settings: { ...settings, sessionSize: n } })}
              aria-pressed={settings.sessionSize === n}
              className={`rounded-md px-4 py-1.5 font-bold ${settings.sessionSize === n ? "bg-blue-900 text-white" : "bg-slate-100 text-blue-900"}`}
            >
              {n}問
            </button>
          ))}
        </div>
      </section>
      <p className="-mt-4 text-xs text-slate-500">ミニ模擬試験と分野別演習・弱点克服に使います（本番模擬試験は50問）</p>

      <section className="space-y-3">
        {exam && (
          <ModeButton
            icon={<Clock size={22} />}
            title="模擬試験を続きから再開"
            note={`解答済み ${exam.answers.filter((a) => a !== null).length} / ${exam.items.length}問`}
            onClick={resumeExam}
          />
        )}
        {(["short", "full"] as const).map((type) => {
          const t = examSpec(type, settings.sessionSize);
          return (
            <ModeButton
              key={type}
              icon={<Clock size={22} />}
              title={t.title}
              recommended={type === "short"}
              note={
                pool.length < t.size
                  ? `今は問題が ${pool.length} 問なので、全問を出題します`
                  : `ランダムに${t.size}問を出題します`
              }
              disabled={!pool.length}
              onClick={() => {
                if (exam && !window.confirm("途中の試験を破棄して、新しく始めますか？")) return;
                startExam(type);
              }}
            />
          );
        })}
        <ModeButton
          icon={<PenLine size={22} />}
          title="書く・穴埋めチャレンジ（10問）"
          note="書いて答える5問＋穴埋め5問をランダムに出題"
          onClick={() => go({ name: "challenge" })}
        />
        <ModeButton
          icon={<Target size={22} />}
          title="弱点克服"
          note={weak.length ? `間違えた問題・★の問題 ${weak.length}問から${Math.min(settings.sessionSize, weak.length)}問` : "まだ対象の問題はありません"}
          disabled={!weak.length}
          onClick={() => go({ name: "practice", title: "弱点克服", questions: weak })}
        />
      </section>

      {exams.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 font-bold text-blue-950">模擬試験の成績（最近5回）</h2>
          <ul className="space-y-1 text-sm">
            {exams.slice(0, 5).map((e) => {
              const pass = e.score / e.total >= PASS_RATE;
              return (
                <li key={e.date} className="flex items-center justify-between">
                  <span className="text-slate-500">{new Date(e.date).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  <span>
                    {e.score} / {e.total}問（{Math.round((e.score / e.total) * 100)}%）
                  </span>
                  <span className={`font-bold ${pass ? "text-green-600" : "text-red-600"}`}>
                    {pass ? "合格" : "不合格"}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-slate-500">合格ライン：正答率80%以上（本番は50問中40問以上）</p>
        </section>
      )}

      <section>
        <h2 className="mb-2 flex items-center gap-2 font-bold text-blue-950">
          <BookOpen size={18} /> 分野別演習
        </h2>
        <div className="space-y-2">
          {CATEGORIES.map((c) => {
            const qs = pool.filter((q) => q.category === c.id);
            return (
              <button
                key={c.id}
                disabled={!qs.length}
                onClick={() => go({ name: "practice", title: c.name, questions: qs })}
                className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-blue-400 disabled:opacity-50"
              >
                <div className="font-semibold text-blue-950">{c.name}</div>
                <div className="text-sm text-slate-500">
                  {c.detail}・全{qs.length}問から{Math.min(settings.sessionSize, qs.length)}問
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <button
        onClick={() => go({ name: "podcasts" })}
        className="flex w-full items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 text-left text-blue-950 shadow-sm hover:border-blue-400"
      >
        <Headphones size={18} />
        <span className="font-semibold">ポッドキャスト集（{Object.keys(podcasts).length}話）</span>
      </button>

      <button
        onClick={() => go({ name: "data" })}
        className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-left text-blue-950 shadow-sm hover:border-blue-400"
      >
        <Database size={18} />
        <span className="font-semibold">問題データの管理（読み込み・書き出し）</span>
      </button>

      <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <h2 className="font-bold text-blue-950">設定</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.shuffleChoices}
            onChange={(e) => setSetting("shuffleChoices", e.target.checked)}
          />
          選択肢の順番を入れ替える
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.verifiedOnly}
            onChange={(e) => setSetting("verifiedOnly", e.target.checked)}
          />
          教則と照合済みの問題だけ出す
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.examInstantFeedback}
            onChange={(e) => setSetting("examInstantFeedback", e.target.checked)}
          />
          模擬試験でも、答えたらすぐ正解と解説を出す
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.varyAnswerMode}
            onChange={(e) => setSetting("varyAnswerMode", e.target.checked)}
          />
          答え方（タップ・チェック・ドラッグ・長押し）を問題ごとに変える
        </label>
        {unverified > 0 && (
          <p className="text-amber-700">
            <TriangleAlert size={14} className="inline" /> 教則と未照合の問題が {unverified} 問あります。
          </p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-bold text-blue-950">{value}</div>
    </div>
  );
}

function ModeButton(p: {
  icon: React.ReactNode;
  title: string;
  note: string;
  disabled?: boolean;
  recommended?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      disabled={p.disabled}
      onClick={p.onClick}
      className={`flex w-full items-center gap-3 rounded-lg bg-blue-900 p-4 text-left text-white shadow hover:bg-blue-800 disabled:bg-slate-300 disabled:text-slate-600 ${p.recommended ? "ring-4 ring-yellow-400" : ""}`}
    >
      {p.icon}
      <div>
        <div className="flex items-center gap-2 font-bold">
          {p.title}
          {p.recommended && (
            <span className="rounded bg-yellow-400 px-2 py-0.5 text-xs text-blue-950">おすすめ</span>
          )}
        </div>
        <div className="text-sm opacity-80">{p.note}</div>
      </div>
    </button>
  );
}
