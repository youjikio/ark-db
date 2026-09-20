// リンクと整合性の粗さがし
//   ① 出現生物一覧 → 恐竜図鑑 に繋がらない種（index.html と同じ判定で確認）
//   ② 図鑑の中の矛盾（テイム不可なのにおすすめ度が付いている／騎乗不可なのにサドルLvがある など）
//   ③ 図鑑にあるのに、どのマップの出現一覧にも出てこない種
// 使い方: node tools/lint_links.js
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const J = n => JSON.parse(fs.readFileSync(path.join(root, "data", n), "utf8"));
const DEX = J("ark_creatures.json").creatures;
const S = J("ark_spawns.json").maps;

// index.html の判定をそのまま取り込む（二重管理にしない）
const src = fs.readFileSync(path.join(root, "index.html"), "utf8");
const block = src.match(/const DEX_PREFIX[\s\S]*?\nfunction dexFind[\s\S]*?\n\}/);
if (!block) { console.error("index.html の dexFind が見つかりません"); process.exit(1); }
eval(block[0]);

const uniq = new Map();
Object.entries(S).forEach(([id, m]) => Object.entries(m.groups).forEach(([g, a]) => a.forEach(x => {
  const t = String(x).replace(/〔[^〕]*〕\s*$/,"").trim().match(/（([^（）]+)）\s*$/); if (!t) return;
  const en = t[1].split("／")[0].trim();
  if (!uniq.has(en)) uniq.set(en, { maps: new Set(), label: String(x), grp: g });
  uniq.get(en).maps.add(id);
})));

const fail = [], info = [];
const miss = [...uniq.entries()].filter(([en]) => !dexFind(en));
console.log("=== ① 出現一覧 → 図鑑 ===");
console.log("英名 " + uniq.size + " 種 ／ 図鑑に繋がらない " + miss.length + " 種");
miss.sort((a, b) => b[1].maps.size - a[1].maps.size)
    .forEach(([en, v]) => fail.push("図鑑に繋がらない: " + v.label + "（" + v.maps.size + "マップ）"));

console.log("\n=== ② 図鑑の中の矛盾 ===");
DEX.forEach(c => {
  const MAT = /素材|資源|食料|便利/.test((c.tags || []).join(""));   // 倒して資源にする種
  if (c.tame === "不可" && c.rec > 0 && !MAT)
    fail.push("テイム不可なのに★が付いている: " + c.ja + "（★" + c.rec + "）");
  if (c.tame === "不可" && c.rec > 0 && MAT && !/倒す|素材|資源|供給源|入手源|集め/.test(c.rec_why || ""))
    info.push("テイム不可＋★だが、理由文に『倒して使う』と分かる言葉が無い: " + c.ja);
  if (c.tame !== "不可" && c.rec === 0 && !/ボス/.test((c.tags || []).join("")))
    info.push("テイムできるのに対象外(0)扱い: " + c.ja);
  if (!c.ride && c.saddle) fail.push("騎乗不可なのにサドルLvがある: " + c.ja);
  if (c.rec >= 4 && !c.rec_why) fail.push("★4以上なのに理由が無い: " + c.ja);
  ["ja", "en", "role", "tame", "prep", "ability"].forEach(k => {
    if (!c[k]) fail.push("項目が空: " + (c.ja || c.en) + " の " + k);
  });
});
console.log("矛盾チェック完了");

console.log("\n=== ③ 出現一覧に出てこない図鑑の種 ===");
const inSpawn = new Set();
uniq.forEach((v, en) => { const c = dexFind(en); if (c) inSpawn.add(c.en); });
const lonely = DEX.filter(c => !inSpawn.has(c.en));
console.log(lonely.length + " 種: " + lonely.map(c => c.ja).join("・"));

console.log("\n=== 結果 ===");
if (fail.length) { console.log("要対応（" + fail.length + "件）"); fail.forEach(x => console.log("  ・" + x)); }
else console.log("要対応なし");
if (info.length) { console.log("参考（" + info.length + "件）"); info.forEach(x => console.log("  ・" + x)); }
process.exitCode = fail.length ? 1 : 0;
