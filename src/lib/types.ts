export type CategoryId = "rules" | "system" | "operation" | "risk";

export interface Question {
  id: string;
  category: CategoryId;
  question: string;
  choices: [string, string, string];
  answerIndex: number;
  explanation: string;
  reference: string;
  /** 最新版の教則と照らし合わせて確認済みか */
  verified: boolean;
  verifiedAt: string | null;
  sourceVersion: string | null;
  /** 問題の作り方：kyosoku＝教則の文をほぼそのまま使った問題、original＝AIが考えたオリジナル問題 */
  origin?: "kyosoku" | "original";
  /** 選択肢ごとの解説（元の並び順。正解の選択肢は空文字） */
  choiceNotes?: string[];
  /** 問題文の下に出す用語メモ */
  terms?: { term: string; meaning: string }[];
  /** 言い換え版（語順や表現を変えた問題文と選択肢。選択肢の並びと意味は元と同じ） */
  alt?: { question: string; choices: [string, string, string] };
}

export const CATEGORIES: { id: CategoryId; name: string; detail: string }[] = [
  { id: "rules", name: "無人航空機に関する規則", detail: "航空法・小型無人機等飛行禁止法など" },
  { id: "system", name: "無人航空機のシステム", detail: "機体構造・バッテリー・電波・センサー" },
  { id: "operation", name: "無人航空機の操縦者及び運航体制", detail: "ヒューマンファクター・CRM・点検" },
  { id: "risk", name: "運航上のリスク管理", detail: "気象・飛行計画・緊急時対応" },
];

export const categoryName = (id: CategoryId) =>
  CATEGORIES.find((c) => c.id === id)?.name ?? id;
