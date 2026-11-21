import { useEffect } from "react";

/** 問題ごとに変える、やわらかいグラデーションの背景 */
export const BACKGROUNDS = [
  "linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%)",
  "linear-gradient(135deg, #dcfce7 0%, #cffafe 100%)",
  "linear-gradient(135deg, #ffedd5 0%, #fce7f3 100%)",
  "linear-gradient(135deg, #fef9c3 0%, #dcfce7 100%)",
  "linear-gradient(135deg, #e0e7ff 0%, #fae8ff 100%)",
  "linear-gradient(135deg, #cffafe 0%, #e0e7ff 100%)",
  "linear-gradient(135deg, #fce7f3 0%, #e0f2fe 100%)",
];

/** 表示中の問題に合わせて、ページ全体の背景を変える（画面を離れたら元に戻す） */
export function usePageBackground(index: number | null) {
  useEffect(() => {
    const body = document.body;
    if (index === null) return;
    body.style.backgroundImage = BACKGROUNDS[index % BACKGROUNDS.length];
    body.style.backgroundAttachment = "fixed";
    return () => {
      body.style.backgroundImage = "";
    };
  }, [index]);
}
