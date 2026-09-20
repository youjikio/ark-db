// 日本語化の残りを洗い出す。英語のまま残っている項目を数えて、代表例を出す。
//   使い方: node tools/lint_ja.js
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const J = f => JSON.parse(fs.readFileSync(path.join(root, "data", f), "utf8"));
// 日本語が1文字も無い＝未翻訳とみなす。記号だけ（—、-）や数字・URLは対象外。
const isEN = s => typeof s === "string" && s.trim() !== "" &&
  !/^[—\-–ー・/／\s0-9.]+$/.test(s) && !/^https?:/.test(s) &&
  !/[ぁ-んァ-ヶ一-龠々]/.test(s);
const head = (a, n) => a.slice(0, n).join(" / ") + (a.length > n ? " …" : "");

console.log("=== エングラム辞典 ===");
const eng = J("ark_engrams.json").engrams;
const noJa = eng.filter(e => !e.ja);
console.log(`名前が英語のまま: ${noJa.length} / ${eng.length} 件`);
console.log("  例) " + head(noJa.map(e => e.en), 12));
const madeEN = [...new Set(eng.map(e => e.made).filter(isEN))];
console.log(`作る場所が英語: ${madeEN.length} 種 → ${head(madeEN, 15)}`);
const preEN = [...new Set([].concat(...eng.map(e => e.pre || [])).filter(isEN))];
console.log(`前提エングラムが英語: ${preEN.length} 種 → ${head(preEN, 10)}`);
const catEN = [...new Set(eng.map(e => e.cat).filter(isEN))];
console.log(`分類が英語: ${catEN.length} 種 → ${head(catEN, 10) || "なし"}`);
const matEN = [...new Set([].concat(...eng.map(e => (e.mats || []).map(m => m.n))).filter(isEN))];
console.log(`素材名が英語: ${matEN.length} 種 → ${head(matEN, 12) || "なし"}`);
const noMats = eng.filter(e => !e.mats || !e.mats.length);
console.log(`素材が未登録: ${noMats.length} / ${eng.length} 件（MODまとめ行は仕様）`);
const descNo = eng.filter(e => !e.desc), descEN = eng.filter(e => e.desc && isEN(e.desc));
console.log(`効果・説明が無い: ${descNo.length} 件 → ${head(descNo.map(e => e.ja || e.en), 10) || "なし"}`);
console.log(`効果・説明が英語のまま: ${descEN.length} 件 → ${head(descEN.map(e => e.ja || e.en), 10) || "なし"}`);

console.log("\n=== 出現生物一覧 ===");
const sp = J("ark_spawns.json").maps;
const spEN = new Set();
Object.values(sp).forEach(m => Object.values(m.groups).forEach(a => a.forEach(x => {
  const m2 = String(x).match(/^(.+?)（([^（）]+)）$/);
  if (m2 && m2[1] === m2[2]) spEN.add(m2[1]);          // 「Name（Name）」＝和名が無い
})));
console.log(`和名が無い生き物: ${spEN.size} 種`);
console.log("  例) " + head([...spEN], 14));

console.log("\n=== ボスのトリビュート ===");
if (fs.existsSync(path.join(root, "data", "ark_bosses.json"))) {
  const bs = J("ark_bosses.json").bosses;
  const tEN = new Set();
  Object.values(bs).forEach(rows => rows.forEach(r => { if (isEN(r.name)) tEN.add(r.name); }));
  console.log(`英語のままの素材: ${tEN.size} 種 → ${head([...tEN], 12) || "なし"}`);
}

console.log("\n=== 恐竜図鑑 ===");
const dex = J("ark_creatures.json").creatures;
["ja","role","ability","prep","tip","harvest","food"].forEach(k => {
  const bad = dex.filter(c => isEN(c[k]));
  if (bad.length) console.log(`${k} が英語: ${bad.length} 件 → ${head(bad.map(c => c.ja || c.en), 6)}`);
});

console.log("\n=== マップ ===");
const maps = J("ark_maps.json").maps;
let mapEN = [];
maps.forEach(m => {
  const walk = (o, p) => {
    if (typeof o === "string") { if (isEN(o) && o.length > 12 && !/^https?:/.test(o)) mapEN.push(m.id + " " + p + ": " + o.slice(0, 40)); return; }
    if (Array.isArray(o)) return o.forEach((v, i) => walk(v, p));
    if (o && typeof o === "object") Object.entries(o).forEach(([k, v]) => {
      // 英語のままで良い項目（ID・英語名・座標・出典のページ名・URL）は見ない
      if (["url","image","map_code","id","name_en","coord","tribute_src","src"].indexOf(k) < 0) walk(v, p + "." + k);
    });
  };
  walk(m, "");
});
console.log(`英語のままの長い文: ${mapEN.length} 件`);
mapEN.slice(0, 8).forEach(s => console.log("  " + s));

console.log("\n=== 資源ノード ===");
const nodes = J("ark_resource_nodes.json");
const resEN = [...new Set([].concat(...Object.values(nodes.maps).map(o => Object.keys(o))).filter(isEN))];
console.log(`資源名が英語: ${resEN.length} 種 → ${head(resEN, 10) || "なし"}`);
