// 便利恐竜リストの追加分（tools/utility_dinos_add.json）を tools/utility_dinos.json に取り込む。
//   使い方: node tools/merge_utility_dinos.js  → utility_dinos.json を更新（重複は入れない）
// そのあと node tools/add_utility_dinos.js で data/ark_maps.json に反映する。
const fs = require("fs"), path = require("path");
const base = path.join(__dirname, "utility_dinos.json");
const addP = path.join(__dirname, "utility_dinos_add.json");
const U = JSON.parse(fs.readFileSync(base, "utf8"));
const A = JSON.parse(fs.readFileSync(addP, "utf8"));
const u = U.utility_dinos;
const key = n => (String(n).match(/（([^（）]+)）\s*$/) || [])[1] || n;
const have = new Set();
u.groups.forEach(g => g.items.forEach(i => have.add(g.g + "|" + key(i.n))));

let added = 0;
(A.extra_items || []).forEach(it => {
  const g = u.groups.find(x => x.g === it.group);
  if (!g) { console.log("グループが見つからない: " + it.group); return; }
  if (have.has(g.g + "|" + key(it.n))) return;
  const { group, ...rest } = it;
  g.items.push(rest); have.add(g.g + "|" + key(it.n)); added++;
});
(A.groups || []).forEach(ng => {
  let g = u.groups.find(x => x.g === ng.g);
  if (!g) { g = { g: ng.g, note: ng.note, items: [] }; u.groups.push(g); }
  else if (ng.note) g.note = ng.note;
  ng.items.forEach(it => {
    if (have.has(g.g + "|" + key(it.n))) return;
    g.items.push(it); have.add(g.g + "|" + key(it.n)); added++;
  });
});
fs.writeFileSync(base, JSON.stringify(U, null, 1), "utf8");
const n = u.groups.reduce((s, g) => s + g.items.length, 0);
console.log("追加 " + added + " 件 → 合計 " + u.groups.length + "グループ / のべ" + n + "種");
