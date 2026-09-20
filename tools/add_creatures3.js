// 出現一覧にいるのに図鑑が無かった種を追加する（tools/creatures_add.json が元データ）
//   使い方: node tools/add_creatures3.js  → data/ark_creatures.json に追加＋別名(alt)を付与
// 何度実行しても重複しない。
const fs = require("fs"), path = require("path");
const file = path.join(__dirname, "..", "data", "ark_creatures.json");
const add = JSON.parse(fs.readFileSync(path.join(__dirname, "creatures_add.json"), "utf8"));
const data = JSON.parse(fs.readFileSync(file, "utf8"));

let n = 0;
(add.creatures || []).forEach(c => {
  if (data.creatures.find(d => d.en === c.en || d.id === c.id)) return;
  data.creatures.push(c); n++;
});
let a = 0;
Object.entries(add.alt || {}).forEach(([en, list]) => {
  const c = data.creatures.find(d => d.en === en);
  if (!c) { console.log("図鑑に無い: " + en); return; }
  const cur = c.alt || [];
  list.forEach(x => { if (cur.indexOf(x) < 0) { cur.push(x); a++; } });
  c.alt = cur;
});
fs.writeFileSync(file, JSON.stringify(data, null, 1), "utf8");
console.log("図鑑に追加: " + n + " 種 / 別名を追加: " + a + " 個 → 合計 " + data.creatures.length + " 種");
