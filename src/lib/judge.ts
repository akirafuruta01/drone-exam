/**
 * 書いて答える問題の判定。少しくらい違っても正解にする。
 * ・全角/半角、ひらがな/カタカナ、大文字/小文字、空白や記号の違いは無視
 * ・「m」「メートル」「年」「%」などの単位や「以上」「以内」は無視
 * ・数字の問題は、数字が合っていれば正解
 * ・ことばの問題は、1〜2文字程度の打ち間違いまで正解（長さに応じて）
 */

const UNIT_WORDS = ["メートル", "めーとる", "キログラム", "きろぐらむ", "グラム", "ぐらむ", "パーセント", "ぱーせんと",
  "分間", "kg", "km", "以上", "以内", "未満", "年間", "年", "分", "m", "g", "%", "か月", "ヶ月", "カテゴリー", "かてごりー"];

const ROMAN: Record<string, string> = { "ⅰ": "1", "ⅱ": "2", "ⅲ": "3", "ⅳ": "4", "i": "1", "ii": "2", "iii": "3" };

export function normalize(text: string) {
  let t = text.normalize("NFKC").toLowerCase().trim();
  // カタカナをひらがなに
  t = t.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
  // 空白・記号を取る
  t = t.replace(/[\s、。・,.()（）「」『』【】\-‐－—ー~〜!?！？:：]/g, "");
  return t;
}

function stripUnits(t: string) {
  let s = t;
  for (const u of UNIT_WORDS) s = s.split(normalize(u)).join("");
  return ROMAN[s] ?? s;
}

function distance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

export function judgeWritten(input: string, answers: string[], numeric: boolean): boolean {
  const given = normalize(input);
  if (!given) return false;
  if (numeric) {
    const digits = stripUnits(given).match(/\d+/g);
    return !!digits && answers.some((a) => digits.includes(normalize(a)));
  }
  const g = stripUnits(given);
  return answers.some((a) => {
    const ans = stripUnits(normalize(a));
    if (g === ans || (ans.length >= 3 && g.includes(ans))) return true;
    const allowed = ans.length >= 7 ? 2 : ans.length >= 4 ? 1 : 0;
    return distance(g, ans) <= allowed;
  });
}
