import { useEffect, useRef } from "react";
import { Headphones } from "lucide-react";
import podcasts from "../data/podcasts.json";
import type { Question } from "./types";

const titles = podcasts as Record<string, string>;

/** ポッドキャストの再生・停止を、アプリ全体に知らせる（模擬試験の時間を止めるため） */
export const PODCAST_EVENT = "podcast-playing";
const announce = (playing: boolean) =>
  window.dispatchEvent(new CustomEvent<boolean>(PODCAST_EVENT, { detail: playing }));

/** 難しい問題にだけある、2人の会話のポッドキャスト（答えたあとに表示） */
export default function Podcast({ q }: { q: Question }) {
  const title = titles[q.id];
  const playing = useRef(false);
  const set = (v: boolean) => {
    if (playing.current === v) return;
    playing.current = v;
    announce(v);
  };
  // 次の問題へ進むなどでプレーヤーが消えたら、止まったことにする
  useEffect(() => () => {
    if (playing.current) announce(false);
  }, []);
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
        onPlay={() => set(true)}
        onPause={() => set(false)}
        onEnded={() => set(false)}
      />
      <p className="text-xs text-slate-500">音声：VOICEVOX:青山龍星（詳しい人）／VOICEVOX:玄野武宏（初心者）</p>
    </div>
  );
}
