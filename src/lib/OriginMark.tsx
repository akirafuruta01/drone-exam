import type { Question } from "./types";

/** 問題文の前に付ける印（教則の文／AIオリジナル） */
export default function OriginMark({ q }: { q: Question }) {
  if (q.origin === "kyosoku")
    return <span className="mr-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-bold text-blue-800">教則の文</span>;
  if (q.origin === "original")
    return <span className="mr-2 rounded bg-purple-100 px-1.5 py-0.5 text-xs font-bold text-purple-800">AIオリジナル</span>;
  return null;
}
