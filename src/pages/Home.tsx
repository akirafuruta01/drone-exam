import { BookOpen, Clock, Target, TriangleAlert } from "lucide-react";
import type { View } from "../App";
import { allQuestions } from "../lib/questions";
import { isWeak, type Store } from "../lib/storage";
import { CATEGORIES } from "../lib/types";

interface Props {
  store: Store;
  setStore: (s: Store) => void;
  go: (v: View) => void;
}

export default function Home({ store, setStore, go }: Props) {
  const { records, bookmarks, settings } = store;
  const pool = settings.verifiedOnly ? allQuestions.filter((q) => q.verified) : allQuestions;
  const answered = allQuestions.filter((q) => records[q.id]).length;
  const attempts = Object.values(records).reduce((a, r) => a + r.attempts, 0);
  const correct = Object.values(records).reduce((a, r) => a + r.correct, 0);
  const rate = attempts ? Math.round((correct / attempts) * 100) : 0;
  const weak = pool.filter((q) => isWeak(records[q.id]) || bookmarks.includes(q.id));
  const unverified = allQuestions.filter((q) => !q.verified).length;

  const setSetting = (k: keyof Store["settings"], v: boolean) =>
    setStore({ ...store, settings: { ...settings, [k]: v } });

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-3 gap-3">
        <Stat label="解答済み" value={`${answered} / ${allQuestions.length}`} />
        <Stat label="正答率" value={`${rate}%`} />
        <Stat label="苦手問題" value={`${allQuestions.filter((q) => isWeak(records[q.id])).length}問`} />
      </section>

      <section className="space-y-3">
        <ModeButton
          icon={<Clock size={22} />}
          title="本番模擬試験（50問・30分）"
          note="次回の作業で追加します"
          disabled
        />
        <ModeButton
          icon={<Target size={22} />}
          title="弱点克服"
          note={weak.length ? `間違えた問題・★の問題 ${weak.length}問` : "まだ対象の問題はありません"}
          disabled={!weak.length}
          onClick={() => go({ name: "practice", title: "弱点克服", questions: weak })}
        />
      </section>

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
                  {c.detail}・{qs.length}問
                </div>
              </button>
            );
          })}
        </div>
      </section>

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
  onClick?: () => void;
}) {
  return (
    <button
      disabled={p.disabled}
      onClick={p.onClick}
      className="flex w-full items-center gap-3 rounded-lg bg-blue-900 p-4 text-left text-white shadow hover:bg-blue-800 disabled:bg-slate-300 disabled:text-slate-600"
    >
      {p.icon}
      <div>
        <div className="font-bold">{p.title}</div>
        <div className="text-sm opacity-80">{p.note}</div>
      </div>
    </button>
  );
}
