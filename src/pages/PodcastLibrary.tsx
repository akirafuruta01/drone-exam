import { useRef, useState } from "react";
import { Headphones } from "lucide-react";
import podcasts from "../data/podcasts.json";
import { PODCAST_EVENT } from "../lib/Podcast";
import { findQuestion } from "../lib/questions";
import { categoryName } from "../lib/types";

interface Script {
  id: string;
  title: string;
  lines: [string, string][];
}

// 台本（podcast/scripts/*.json）をまとめて読み込む
const scripts = Object.values(
  import.meta.glob<Script>("../../podcast/scripts/*.json", { eager: true, import: "default" }),
);
const byId = new Map(scripts.map((s) => [s.id, s]));
const episodes = Object.entries(podcasts as Record<string, string>).map(([id, title]) => ({
  id,
  title,
  q: findQuestion(id),
  script: byId.get(id),
}));

const announce = (playing: boolean) =>
  window.dispatchEvent(new CustomEvent<boolean>(PODCAST_EVENT, { detail: playing }));

/** ポッドキャストだけを聞ける一覧 */
export default function PodcastLibrary({ onExit }: { onExit: () => void }) {
  const players = useRef<(HTMLAudioElement | null)[]>([]);
  const [continuous, setContinuous] = useState(true);

  const onPlay = (k: number) => {
    // ほかの話が流れていたら止める
    players.current.forEach((a, j) => j !== k && a && !a.paused && a.pause());
    announce(true);
  };
  const onEnded = (k: number) => {
    announce(false);
    const next = players.current[k + 1];
    if (continuous && next) {
      next.scrollIntoView({ behavior: "smooth", block: "center" });
      void next.play();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold text-blue-950">
          <Headphones /> ポッドキャスト集
        </h1>
        <button onClick={onExit} className="text-sm underline">
          トップへ戻る
        </button>
      </div>
      <p className="text-sm text-slate-600">
        難しい問題を、詳しい人と初心者の会話で解説します（全{episodes.length}話・各2〜3分）。
      </p>
      <label className="flex items-center gap-2 rounded-lg bg-white p-3 text-sm shadow-sm">
        <input type="checkbox" checked={continuous} onChange={(e) => setContinuous(e.target.checked)} />
        1話が終わったら、次の話を続けて再生する
      </label>

      <ol className="space-y-3">
        {episodes.map((ep, k) => (
          <li key={ep.id} className="space-y-2 rounded-lg bg-white p-4 shadow-sm">
            <div className="text-xs text-blue-700">
              第{k + 1}話{ep.q ? `・${categoryName(ep.q.category)}` : ""}
            </div>
            <div className="font-bold text-blue-950">{ep.title}</div>
            <audio
              ref={(el) => {
                players.current[k] = el;
              }}
              controls
              preload="none"
              className="w-full"
              src={`${import.meta.env.BASE_URL}podcast/${ep.id}.mp3`}
              onPlay={() => onPlay(k)}
              onPause={() => announce(false)}
              onEnded={() => onEnded(k)}
            />
            {ep.script && (
              <details className="text-sm">
                <summary className="cursor-pointer text-blue-800">台本を読む</summary>
                <div className="mt-2 space-y-2">
                  {ep.script.lines.map(([who, text], n) => (
                    <p key={n} className="leading-relaxed">
                      <b className={who === "expert" ? "text-blue-900" : "text-amber-700"}>
                        {who === "expert" ? "詳しい人" : "初心者"}：
                      </b>
                      {text}
                    </p>
                  ))}
                </div>
              </details>
            )}
          </li>
        ))}
      </ol>
      <p className="text-xs text-slate-500">音声：VOICEVOX:青山龍星（詳しい人）／VOICEVOX:玄野武宏（初心者）</p>
    </div>
  );
}
