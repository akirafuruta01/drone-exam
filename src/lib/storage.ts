import type { Question } from "./types";

const KEY = "drone-exam:v1";

export interface QuestionRecord {
  attempts: number;
  correct: number;
  lastCorrect: boolean;
  /** 連続正解数（2回連続正解で苦手から外れる） */
  streak: number;
}

export interface Settings {
  shuffleChoices: boolean;
  verifiedOnly: boolean;
}

export interface ExamResult {
  date: string;
  score: number;
  total: number;
}

/** 途中の模擬試験（画面を閉じても続きから再開するため保存する） */
export interface ExamState {
  items: { id: string; order: number[] }[];
  /** 選んだ選択肢（元の番号）。未解答は null */
  answers: (number | null)[];
  flags: boolean[];
  current: number;
  endsAt: number;
}

export interface Store {
  records: Record<string, QuestionRecord>;
  bookmarks: string[];
  settings: Settings;
  exams: ExamResult[];
  exam: ExamState | null;
  /** 読み込んだオリジナル問題 */
  customQuestions: Question[];
}

const empty = (): Store => ({
  records: {},
  bookmarks: [],
  settings: { shuffleChoices: true, verifiedOnly: false },
  exams: [],
  exam: null,
  customQuestions: [],
});

export function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const s = JSON.parse(raw);
    const e = empty();
    return {
      records: s.records ?? e.records,
      bookmarks: s.bookmarks ?? e.bookmarks,
      settings: { ...e.settings, ...s.settings },
      exams: s.exams ?? e.exams,
      exam: s.exam ?? e.exam,
      customQuestions: s.customQuestions ?? e.customQuestions,
    };
  } catch {
    return empty();
  }
}

export function save(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* 保存できない環境では何もしない */
  }
}

export function recordAnswer(s: Store, id: string, ok: boolean): Store {
  const r = s.records[id] ?? { attempts: 0, correct: 0, lastCorrect: false, streak: 0 };
  return {
    ...s,
    records: {
      ...s.records,
      [id]: {
        attempts: r.attempts + 1,
        correct: r.correct + (ok ? 1 : 0),
        lastCorrect: ok,
        streak: ok ? r.streak + 1 : 0,
      },
    },
  };
}

/** 苦手問題：一度でも間違えて、まだ2回連続正解していない問題 */
export const isWeak = (r?: QuestionRecord) =>
  !!r && r.attempts > r.correct && r.streak < 2;

export function toggleBookmark(s: Store, id: string): Store {
  const has = s.bookmarks.includes(id);
  return {
    ...s,
    bookmarks: has ? s.bookmarks.filter((b) => b !== id) : [...s.bookmarks, id],
  };
}
