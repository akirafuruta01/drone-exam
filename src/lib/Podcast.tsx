import { Headphones } from "lucide-react";
import podcasts from "../data/podcasts.json";
import type { Question } from "./types";

const titles = podcasts as Record<string, string>;

/** 難しい問題にだけある、2人の会話のポッドキャスト（答えたあとに表示） */
export default function Podcast({ q }: { q: Question }) {
  const title = titles[q.id];
  if (!title) return null;
  return (
    <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
      <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
        <Headphones size={18} /> ポッドキャストで詳しく聞く：{title}
      </div>
      <audio
        controls
        preload="none"
        className="w-full"
        src={`${import.meta.env.BASE_URL}podcast/${q.id}.mp3`}
      />
      <p className="text-xs text-slate-500">音声：VOICEVOX:青山龍星（詳しい人）／VOICEVOX:玄野武宏（初心者）</p>
    </div>
  );
}
