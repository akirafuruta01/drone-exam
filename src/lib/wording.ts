import { hashOf } from "./AnswerInput";
import type { Question } from "./types";
import { seededRandom, varyText } from "./vary";

/** 言い換え版の文章で出すかどうか（およそ50%）。模擬試験と結果画面で同じになるよう、問題と順番から決める */
export const useAltFor = (q: Question, index: number) => !!q.alt && hashOf(`alt-${q.id}-${index}`) % 2 === 1;

/** 言い換え版を使う場合は、問題文と選択肢を差し替えた問題を返す（正解の位置や解説は同じ） */
export function worded(q: Question, useAlt: boolean, seed?: number): Question {
  const base = useAlt && q.alt ? { ...q, question: q.alt.question, choices: q.alt.choices } : q;
  if (seed === undefined) return base;
  // さらに、出題のたびに言い回しを少し変える
  const r = seededRandom(seed);
  return {
    ...base,
    question: varyText(base.question, r, true),
    choices: base.choices.map((c) => varyText(c, r)) as Question["choices"],
  };
}

/** 模擬試験と結果画面で同じ言い回しにするための数 */
export const variationSeed = (q: Question, index: number) => hashOf(`vary-${q.id}-${index}`);
