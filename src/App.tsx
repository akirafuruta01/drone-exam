import { useEffect, useState } from "react";
import { load, save, type Store } from "./lib/storage";
import type { Question } from "./lib/types";
import Home from "./pages/Home";
import Practice from "./pages/Practice";

export type View = { name: "home" } | { name: "practice"; title: string; questions: Question[] };

export default function App() {
  const [store, setStore] = useState<Store>(load);
  const [view, setView] = useState<View>({ name: "home" });

  useEffect(() => {
    save(store);
  }, [store]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  return (
    <div className="min-h-screen text-slate-800">
      <header className="bg-blue-950 text-white">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <button className="font-bold" onClick={() => setView({ name: "home" })}>
            ドローン二等 学科対策
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        {view.name === "home" && <Home store={store} setStore={setStore} go={setView} />}
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
      </main>
    </div>
  );
}
