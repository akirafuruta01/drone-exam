import { CATEGORIES, type CategoryId, type Question } from "./types";

const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as string[];

export interface ImportResult {
  questions: Question[];
  errors: string[];
}

/** 読み込んだ JSON を確認し、正しい問題だけを取り出す */
export function parseQuestions(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { questions: [], errors: ["JSON の形式が正しくありません。"] };
  }
  const list = Array.isArray(raw) ? raw : [raw];
  const questions: Question[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  list.forEach((item, k) => {
    const where = `${k + 1}件目`;
    const e: string[] = [];
    const o = (item ?? {}) as Record<string, unknown>;
    const isStr = (v: unknown) => typeof v === "string" && v.trim() !== "";
    const nullableStr = (v: unknown) => v == null || typeof v === "string";

    if (!isStr(o.id)) e.push("id がありません");
    else if (seen.has(o.id as string)) e.push(`id「${o.id}」が重複しています`);
    if (!CATEGORY_IDS.includes(o.category as string))
      e.push(`category は ${CATEGORY_IDS.join(" / ")} のどれかにしてください`);
    if (!isStr(o.question)) e.push("question（問題文）がありません");
    if (!Array.isArray(o.choices) || o.choices.length !== 3 || !o.choices.every(isStr))
      e.push("choices（選択肢）は3つの文字列にしてください");
    if (![0, 1, 2].includes(o.answerIndex as number)) e.push("answerIndex は 0・1・2 のどれかにしてください");
    if (!isStr(o.explanation)) e.push("explanation（解説）がありません");
    if (o.reference != null && typeof o.reference !== "string") e.push("reference は文字列にしてください");
    if (o.origin != null && o.origin !== "kyosoku" && o.origin !== "original")
      e.push("origin は kyosoku か original にしてください（省略可）");
    if (o.verified != null && typeof o.verified !== "boolean") e.push("verified は true か false にしてください");
    if (!nullableStr(o.verifiedAt) || !nullableStr(o.sourceVersion))
      e.push("verifiedAt・sourceVersion は文字列か null にしてください");

    if (e.length) {
      errors.push(`${where}（${isStr(o.id) ? o.id : "id不明"}）：${e.join("、")}`);
      return;
    }
    seen.add(o.id as string);
    questions.push({
      id: o.id as string,
      category: o.category as CategoryId,
      question: o.question as string,
      choices: o.choices as [string, string, string],
      answerIndex: o.answerIndex as number,
      explanation: o.explanation as string,
      reference: (o.reference as string) ?? "",
      verified: (o.verified as boolean) ?? false,
      verifiedAt: (o.verifiedAt as string) ?? null,
      sourceVersion: (o.sourceVersion as string) ?? null,
      ...(o.origin ? { origin: o.origin as Question["origin"] } : {}),
    });
  });
  return { questions, errors };
}

/** JSON ファイルとしてダウンロードさせる */
export function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
