// 初心者ガイドに「便利恐竜リスト」を入れる（tools/utility_dinos.json が元データ）
//   使い方: node tools/add_utility_dinos.js   → data/ark_maps.json の beginner_guide.utility_dinos を更新
// ついでに自動で付ける情報：
//   where … このサーバーの2マップ（The Island / Astraeos）のどちらに出るか（出現生物データから）
//   rec   … 恐竜図鑑のおすすめ度（tools/recommend.json → build_recommend.js で付けた値）
// 何度実行しても同じ結果になる。
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const J = n => JSON.parse(fs.readFileSync(path.join(root, "data", n), "utf8"));
const mapsPath = path.join(root, "data", "ark_maps.json");
const src = JSON.parse(fs.readFileSync(path.join(__dirname, "utility_dinos.json"), "utf8"));
const maps = J("ark_maps.json");
const dex = J("ark_creatures.json").creatures;
const spawns = J("ark_spawns.json").maps;
if (!maps.beginner_guide) { console.error("beginner_guide が見つかりません"); process.exit(1); }

function nameSet(mapId) {
  const set = new Set();
  const m = spawns[mapId]; if (!m) return set;
  Object.values(m.groups).forEach(a => a.forEach(x => {
    const g = String(x).match(/（([^（）]+)）\s*$/);
    if (g) set.add(g[1].split("／")[0].trim());
  }));
  return set;
}
const ISL = nameSet("the_island"), AST = nameSet("astraeos_mod");

const u = src.utility_dinos;
let noDex = [];
u.groups.forEach(g => g.items.forEach(it => {
  const en = ((it.n.match(/（([^（）]+)）\s*$/) || [])[1] || "").trim();
  const c = dex.find(d => d.en === en) || dex.find(d => d.alt && d.alt.indexOf(en) >= 0);
  if (!c) noDex.push(it.n);
  it.rec = c ? (c.rec || 0) : 0;
  const i = ISL.has(en), a = AST.has(en);
  it.where = i && a ? "両方" : i ? "Island" : a ? "Astraeos" : "他マップ";
}));
maps.beginner_guide.utility_dinos = u;
fs.writeFileSync(mapsPath, JSON.stringify(maps, null, 1), "utf8");
// 元データ側にも書き戻して、次回の差分が分かるようにする
fs.writeFileSync(path.join(__dirname, "utility_dinos.json"), JSON.stringify(src, null, 1), "utf8");

const n = u.groups.reduce((s, g) => s + g.items.length, 0);
const w = {}; u.groups.forEach(g => g.items.forEach(it => w[it.where] = (w[it.where] || 0) + 1));
console.log("便利恐竜リストを更新: " + u.groups.length + "グループ / のべ" + n + "種");
console.log("出現: " + Object.entries(w).map(([k, v]) => k + " " + v).join(" / "));
console.log(noDex.length ? "図鑑に無い名前: " + noDex.join(" / ") : "全種が恐竜図鑑とリンクします");
const low = []; u.groups.forEach(g => g.items.forEach(it => { if (it.rec < 3) low.push(it.n + "(★" + it.rec + ")"); }));
console.log(low.length ? "おすすめ度が低いのに載っている種: " + low.join(" / ") : "載っている種はすべて★3以上");
