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
