// 初心者ガイドに「便利恐竜リスト」を入れる（tools/utility_dinos.json が元データ）
//   使い方: node tools/add_utility_dinos.js   → data/ark_maps.json の beginner_guide.utility_dinos を更新
// 何度実行しても同じ結果になる（丸ごと置き換え）。
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const mapsPath = path.join(root, "data", "ark_maps.json");
const src = JSON.parse(fs.readFileSync(path.join(__dirname, "utility_dinos.json"), "utf8"));
const maps = JSON.parse(fs.readFileSync(mapsPath, "utf8"));
if (!maps.beginner_guide) { console.error("beginner_guide が見つかりません"); process.exit(1); }

const u = src.utility_dinos;
maps.beginner_guide.utility_dinos = u;
fs.writeFileSync(mapsPath, JSON.stringify(maps, null, 1), "utf8");

const n = u.groups.reduce((s, g) => s + g.items.length, 0);
console.log("便利恐竜リストを更新: " + u.groups.length + "グループ / のべ" + n + "種");

// 図鑑とリンクできるかの確認
const dex = JSON.parse(fs.readFileSync(path.join(root, "data", "ark_creatures.json"), "utf8")).creatures;
const ng = [];
u.groups.forEach(g => g.items.forEach(it => {
  const m = it.n.match(/（([^（）]+)）\s*$/);
  const en = m && m[1].trim();
  const c = en && (dex.find(d => d.en === en) || dex.find(d => d.alt && d.alt.indexOf(en) >= 0));
  if (!c) ng.push(it.n);
}));
console.log(ng.length ? "図鑑に無い名前: " + ng.join(" / ") : "全種が恐竜図鑑とリンクします");
