import { useEffect, useState } from "react";
import { getQuestions, findQuestion, choiceOrder, setCustomQuestions, EXAM_TYPES, pickExam, type ExamType } from "./lib/questions";
import { load, recordAnswer, save, type ExamState, type Store } from "./lib/storage";
import type { Question } from "./lib/types";
import DataManager from "./pages/DataManager";
import Exam from "./pages/Exam";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import Result from "./pages/Result";

export type View =
  | { name: "home" }
  | { name: "practice"; title: string; questions: Question[] }
  | { name: "exam" }
  | { name: "result"; exam: ExamState }
  | { name: "data" };


export default function App() {
  const [store, setStore] = useState<Store>(load);
  const [view, setView] = useState<View>({ name: "home" });
  setCustomQuestions(store.customQuestions);

  useEffect(() => {
    save(store);
  }, [store]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view.name]);

  const startExam = (type: ExamType) => {
    const { size, seconds } = EXAM_TYPES[type];
    const pool = store.settings.verifiedOnly ? getQuestions().filter((q) => q.verified) : getQuestions();
    const qs = pickExam(pool, size);
    const exam: ExamState = {
      items: qs.map((q) => ({ id: q.id, order: choiceOrder(store.settings.shuffleChoices) })),
      answers: qs.map(() => null),
      flags: qs.map(() => false),
      current: 0,
      endsAt: Date.now() + seconds * 1000,
    };
    setStore({ ...store, exam });
    setView({ name: "exam" });
  };

  const finishExam = (exam: ExamState) => {
    setStore((s) => {
      let next = s;
      exam.items.forEach((it, k) => {
        next = recordAnswer(next, it.id, exam.answers[k] === findQuestion(it.id)!.answerIndex);
      });
      const score = exam.items.filter((it, k) => exam.answers[k] === findQuestion(it.id)!.answerIndex).length;
      const result = { date: new Date().toISOString(), score, total: exam.items.length };
      return { ...next, exam: null, exams: [result, ...next.exams].slice(0, 20) };
    });
    setView({ name: "result", exam });
  };

  return (
    <div className="min-h-screen text-slate-800">
      <header className="bg-blue-950 text-white">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <button
            className="font-bold"
            onClick={() => {
              if (view.name === "exam" && !window.confirm("試験を中断してトップへ戻りますか？（続きから再開できます）")) return;
              setView({ name: "home" });
            }}
          >
            ドローン二等 学科対策
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        {view.name === "home" && (
          <Home
            store={store}
            setStore={setStore}
            go={setView}
            startExam={startExam}
            resumeExam={() => setView({ name: "exam" })}
          />
        )}
        {view.name === "practice" && (
          <Practice
            key={view.title}
            title={view.title}
            questions={view.questions}
            store={store}
            setStore={setStore}
            onExit={() => setView({ name: "home" })}
          />
        )}
        {view.name === "exam" && store.exam && (
          <Exam store={store} setStore={setStore} onFinish={finishExam} />
        )}
        {view.name === "data" && (
          <DataManager store={store} setStore={setStore} onExit={() => setView({ name: "home" })} />
        )}
        {view.name === "result" && <Result exam={view.exam} onExit={() => setView({ name: "home" })} />}
      </main>
    </div>
  );
}
