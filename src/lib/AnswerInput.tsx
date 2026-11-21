import { useEffect, useRef, useState } from "react";
import type { Question } from "./types";

export type AnswerMode = "tap" | "check" | "drag" | "hold";
export const ANSWER_MODES: AnswerMode[] = ["tap", "check", "drag", "hold"];

/** 問題の id から決まる、毎回同じ数（模擬試験で、開き直しても同じ見た目にするため） */
export function hashOf(text: string) {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

const GUIDE: Record<AnswerMode, string> = {
  tap: "正しいと思う選択肢をタップしてください",
  check: "正しいと思うものに1つチェックを入れて、「回答する」を押してください",
  drag: "正しいと思う選択肢を、下の「回答エリア」までドラッグしてください",
  hold: "正しいと思う選択肢を、ゲージがいっぱいになるまで長押ししてください",
};

interface Props {
  q: Question;
  order: number[];
  mode: AnswerMode;
  onAnswer: (orig: number) => void;
}

/** 答える前の選択肢。答え方は mode によって変わる */
export default function AnswerInput(props: Props) {
  return (
    <div className="space-y-2">
      <p className="rounded bg-white/70 px-3 py-1.5 text-sm font-semibold text-blue-900">👉 {GUIDE[props.mode]}</p>
      {props.mode === "tap" && <TapMode {...props} />}
      {props.mode === "check" && <CheckMode {...props} />}
      {props.mode === "drag" && <DragMode {...props} />}
      {props.mode === "hold" && <HoldMode {...props} />}
    </div>
  );
}

const card = "flex w-full gap-3 rounded-lg border-2 border-slate-200 bg-white p-4 text-left";

function TapMode({ q, order, onAnswer }: Props) {
  return (
    <>
      {order.map((orig, n) => (
        <button key={orig} onClick={() => onAnswer(orig)} className={`${card} hover:border-blue-400`}>
          <span className="font-bold text-blue-900">{n + 1}</span>
          <span>{q.choices[orig]}</span>
        </button>
      ))}
    </>
  );
}

function CheckMode({ q, order, onAnswer }: Props) {
  const [checked, setChecked] = useState<number | null>(null);
  return (
    <>
      {order.map((orig, n) => (
        <label key={orig} className={`${card} cursor-pointer ${checked === orig ? "border-blue-600" : ""}`}>
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0"
            checked={checked === orig}
            onChange={(e) => setChecked(e.target.checked ? orig : null)}
          />
          <span className="font-bold text-blue-900">{n + 1}</span>
          <span>{q.choices[orig]}</span>
        </label>
      ))}
      <button
        disabled={checked === null}
        onClick={() => checked !== null && onAnswer(checked)}
        className="w-full rounded-lg bg-blue-900 py-3 font-bold text-white disabled:opacity-40"
      >
        回答する
      </button>
    </>
  );
}

function DragMode({ q, order, onAnswer }: Props) {
  const zone = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ orig: number; sx: number; sy: number; dx: number; dy: number } | null>(null);
  const [over, setOver] = useState(false);

  const inZone = (x: number, y: number) => {
    const r = zone.current?.getBoundingClientRect();
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  return (
    <>
      {order.map((orig, n) => {
        const me = drag?.orig === orig;
        return (
          <div
            key={orig}
            role="button"
            tabIndex={0}
            aria-label={`${n + 1}を回答エリアへ`}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onAnswer(orig)}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDrag({ orig, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0 });
            }}
            onPointerMove={(e) => {
              if (!me || !drag) return;
              setDrag({ ...drag, dx: e.clientX - drag.sx, dy: e.clientY - drag.sy });
              setOver(inZone(e.clientX, e.clientY));
            }}
            onPointerUp={(e) => {
              const hit = me && inZone(e.clientX, e.clientY);
              setDrag(null);
              setOver(false);
              if (hit) onAnswer(orig);
            }}
            onPointerCancel={() => {
              setDrag(null);
              setOver(false);
            }}
            style={{
              touchAction: "none",
              transform: me ? `translate(${drag!.dx}px, ${drag!.dy}px) rotate(-1.5deg)` : undefined,
              zIndex: me ? 20 : undefined,
              position: "relative",
            }}
            className={`${card} cursor-grab select-none ${me ? "cursor-grabbing border-blue-500 shadow-xl" : ""}`}
          >
            <span className="font-bold text-blue-900">⠿ {n + 1}</span>
            <span>{q.choices[orig]}</span>
          </div>
        );
      })}
      <div
        ref={zone}
        className={`flex h-24 items-center justify-center rounded-xl border-4 border-dashed text-sm font-bold transition-colors ${over ? "border-blue-600 bg-blue-100 text-blue-800" : "border-blue-300 bg-white/60 text-blue-500"}`}
      >
        {over ? "ここで指を離すと回答" : "回答エリア（ここにドラッグ）"}
      </div>
    </>
  );
}

const HOLD_MS = 900;

function HoldMode({ q, order, onAnswer }: Props) {
  const [holding, setHolding] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const start = (orig: number) => {
    setHolding(orig);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onAnswer(orig), HOLD_MS);
  };
  const stop = () => {
    window.clearTimeout(timer.current);
    setHolding(null);
  };

  return (
    <>
      {order.map((orig, n) => (
        <button
          key={orig}
          onPointerDown={() => start(orig)}
          onPointerUp={stop}
          onPointerLeave={stop}
          onPointerCancel={stop}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onAnswer(orig)}
          style={{ touchAction: "manipulation", WebkitUserSelect: "none", userSelect: "none" }}
          className={`${card} relative overflow-hidden`}
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 bg-blue-200/70"
            style={{
              width: holding === orig ? "100%" : "0%",
              transition: holding === orig ? `width ${HOLD_MS}ms linear` : "none",
            }}
          />
          <span className="relative font-bold text-blue-900">{n + 1}</span>
          <span className="relative">{q.choices[orig]}</span>
        </button>
      ))}
    </>
  );
}
