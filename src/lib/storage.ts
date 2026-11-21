import type { Question } from "./types";

const KEY = "drone-exam:v1";
/** 直近の正答率に使う回答数 */
export const RECENT_MAX = 50;

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
  /** 模擬試験でも1問ごとに正解と解説を表示する */
  examInstantFeedback: boolean;
  /** 答え方（タップ・チェック・ドラッグ・長押し）を問題ごとに変える */
  varyAnswerMode: boolean;
  /** 1回に解く問題数（ミニ模擬試験と分野別演習） */
  sessionSize: 5 | 10 | 15;
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
  /** ポッドキャスト再生中で時間を止めている場合、止めた時刻 */
  pausedAt?: number | null;
}

export interface Store {
  records: Record<string, QuestionRecord>;
  bookmarks: string[];
  settings: Settings;
  exams: ExamResult[];
  exam: ExamState | null;
  /** 読み込んだオリジナル問題 */
  customQuestions: Question[];
  /** 直近の回答の正誤（新しいものが後ろ、最大 RECENT_MAX 件） */
  recent: boolean[];
}

const empty = (): Store => ({
  records: {},
  bookmarks: [],
  settings: { shuffleChoices: true, verifiedOnly: false, examInstantFeedback: true, varyAnswerMode: true, sessionSize: 10 },
  exams: [],
  exam: null,
  customQuestions: [],
  recent: [],
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
      recent: s.recent ?? e.recent,
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
    recent: [...s.recent, ok].slice(-RECENT_MAX),
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
