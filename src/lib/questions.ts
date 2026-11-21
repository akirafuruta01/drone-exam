import data from "../data/questions.json";
import type { Question } from "./types";

export const allQuestions = data as Question[];

/** 配列をシャッフルした新しい配列を返す */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 選択肢の表示順（元の番号の並び）を作る */
export function choiceOrder(doShuffle: boolean): number[] {
  return doShuffle ? shuffle([0, 1, 2]) : [0, 1, 2];
}

export const EXAM_SIZE = 50;
export const EXAM_SECONDS = 30 * 60;

/** 模擬試験の種類：短い版（おすすめ）と本番と同じ版 */
export const EXAM_TYPES = {
  short: { size: 15, seconds: 10 * 60, title: "ミニ模擬試験（15問・10分）" },
  full: { size: EXAM_SIZE, seconds: EXAM_SECONDS, title: "本番模擬試験（50問・30分）" },
} as const;
export type ExamType = keyof typeof EXAM_TYPES;
export const PASS_RATE = 0.8;

/** 模擬試験の問題を選ぶ。分野ごとの問題数の割合をできるだけ保つ */
export function pickExam(pool: Question[], size = EXAM_SIZE): Question[] {
  if (pool.length <= size) return shuffle(pool);
  const groups = new Map<string, Question[]>();
  for (const q of shuffle(pool)) groups.set(q.category, [...(groups.get(q.category) ?? []), q]);
  const picked: Question[] = [];
  const rest: Question[] = [];
  for (const g of groups.values()) {
    const n = Math.floor((g.length / pool.length) * size);
    picked.push(...g.slice(0, n));
    rest.push(...g.slice(n));
  }
  picked.push(...shuffle(rest).slice(0, size - picked.length));
  return shuffle(picked);
}
