import { useEffect, useRef, useState } from "react";

const KEY = "drone-exam:studySeconds";
const IDLE_LIMIT = 3 * 60 * 1000; // 3分間操作がなければ数えない
const SHOW_MS = 5000; // 表示する時間

function loadSeconds(): number {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveSeconds(s: number) {
  try {
    localStorage.setItem(KEY, String(s));
  } catch {
    /* 保存できない環境では何もしない */
  }
}

export function formatTime(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * 合計学習時間を数え、1分ごとに5秒間だけ、ドローンにぶら下がったストップウォッチを表示する。
 * active が true の画面（演習・模擬試験・結果）にいて、画面が見えていて、最近操作があるときだけ数える。
 */
export default function StudyTimer({ active }: { active: boolean }) {
  const seconds = useRef(loadSeconds());
  const lastInput = useRef(Date.now());
  const listening = useRef(false);
  const [shown, setShown] = useState<number | null>(null);
  const hideTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const mark = () => (lastInput.current = Date.now());
    const onPodcast = (e: Event) => (listening.current = (e as CustomEvent<boolean>).detail);
    window.addEventListener("podcast-playing", onPodcast);
    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, mark));
      window.removeEventListener("podcast-playing", onPodcast);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    lastInput.current = Date.now();
    const t = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      // ポッドキャストを聞いている間は、操作がなくても学習中として数える
      if (!listening.current && Date.now() - lastInput.current > IDLE_LIMIT) return;
      seconds.current += 1;
      if (seconds.current % 5 === 0) saveSeconds(seconds.current);
      if (seconds.current % 60 === 0) {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => setShown(null), SHOW_MS);
      }
      // 表示中は秒を進めて見せる
      setShown((prev) => (prev !== null || seconds.current % 60 === 0 ? seconds.current : null));
    }, 1000);
    const save = () => saveSeconds(seconds.current);
    document.addEventListener("visibilitychange", save);
    return () => {
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", save);
      save();
    };
  }, [active]);

  if (shown === null) return null;
  return (
    <div
      className="drone-timer pointer-events-none fixed top-2 right-3 z-50"
      role="status"
      aria-label={`合計学習時間 ${formatTime(shown)}`}
    >
      <DroneWithWatch time={formatTime(shown)} />
    </div>
  );
}

/** インフォグラフィック風のドローンと、ぶら下がったストップウォッチ */
function DroneWithWatch({ time }: { time: string }) {
  return (
    <svg width="150" height="190" viewBox="0 0 150 190" aria-hidden="true">
      {/* ローター（回転しているように見せる） */}
      <g className="drone-rotor">
        <ellipse cx="25" cy="22" rx="20" ry="4" fill="#93c5fd" opacity="0.8" />
        <ellipse cx="125" cy="22" rx="20" ry="4" fill="#93c5fd" opacity="0.8" />
      </g>
      <rect x="23" y="22" width="4" height="10" rx="1" fill="#1e3a8a" />
      <rect x="123" y="22" width="4" height="10" rx="1" fill="#1e3a8a" />
      {/* アーム */}
      <rect x="20" y="30" width="110" height="6" rx="3" fill="#1e3a8a" />
      {/* 胴体 */}
      <rect x="48" y="26" width="54" height="22" rx="8" fill="#172554" />
      <circle cx="75" cy="37" r="5" fill="#facc15" />
      <circle cx="75" cy="37" r="2" fill="#172554" />
      {/* 脚 */}
      <path d="M56 48 L50 58 M94 48 L100 58" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 58 H58 M92 58 H106" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
      {/* ひも */}
      <path d="M75 48 V92" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* ストップウォッチ */}
      <g className="drone-watch">
        <rect x="69" y="88" width="12" height="7" rx="2" fill="#1e3a8a" />
        <rect x="96" y="98" width="9" height="5" rx="2" fill="#1e3a8a" transform="rotate(40 100 100)" />
        <circle cx="75" cy="138" r="42" fill="#1e3a8a" />
        <circle cx="75" cy="138" r="36" fill="#ffffff" />
        <circle cx="75" cy="138" r="36" fill="none" stroke="#facc15" strokeWidth="3" strokeDasharray="4 7.3" />
        <text x="75" y="128" textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="bold">
          合計学習時間
        </text>
        <text
          x="75"
          y="148"
          textAnchor="middle"
          fontSize={time.length > 7 ? 13 : 15}
          fill="#172554"
          fontWeight="bold"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {time}
        </text>
      </g>
    </svg>
  );
}
