/** 問題が切り替わるときのアニメーション（index.css の q-anim-*） */
const ANIMS = ["q-anim-up", "q-anim-left", "q-anim-right", "q-anim-zoom", "q-anim-flip", "q-anim-blur", "q-anim-drop", "q-anim-tilt"];

/** 前回と同じにならないよう、毎回ちがうアニメーションを選ぶ */
let last = "";
export function randomAnim() {
  const pool = ANIMS.filter((a) => a !== last);
  last = pool[Math.floor(Math.random() * pool.length)];
  return last;
}
