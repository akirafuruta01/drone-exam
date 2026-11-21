import data from "../data/questions.json";
import type { Question } from "./types";

/** アプリに最初から入っている問題 */
export const builtinQuestions = data as Question[];

let all: Question[] = builtinQuestions;
let byId = new Map(all.map((q) => [q.id, q]));

/** 読み込んだ問題（localStorage に保存）を、最初から入っている問題に加える */
export function setCustomQuestions(custom: Question[]) {
  all = [...builtinQuestions, ...custom];
  byId = new Map(all.map((q) => [q.id, q]));
}

export const getQuestions = () => all;
export const findQuestion = (id: string) => byId.get(id);

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
export type ExamType = "short" | "full";
/** 1回に解く問題数（ミニ模擬試験と分野別演習で選べる） */
export const SESSION_SIZES = [5, 10, 15] as const;
export type SessionSize = (typeof SESSION_SIZES)[number];

/** 模擬試験の種類ごとの問題数・時間。ミニは選んだ問題数に合わせて、1問40秒で時間を決める */
export function examSpec(type: ExamType, shortSize: SessionSize) {
  if (type === "full") return { size: EXAM_SIZE, seconds: EXAM_SECONDS, title: "本番模擬試験（50問・30分）" };
  const seconds = shortSize * 40;
  const m = Math.floor(seconds / 60), sec = seconds % 60;
  return { size: shortSize, seconds, title: `ミニ模擬試験（${shortSize}問・${m}分${sec ? `${sec}秒` : ""}）` };
}
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
