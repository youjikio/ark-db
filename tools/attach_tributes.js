// ボスのトリビュート（召喚に必要なもの）を各マップのボス表に紐づける。
//   使い方: node tools/attach_tributes.js
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const maps = JSON.parse(fs.readFileSync(path.join(root, "data", "ark_maps.json"), "utf8"));
const boss = JSON.parse(fs.readFileSync(path.join(root, "data", "ark_bosses.json"), "utf8")).bosses;

const LINK = {
  the_island: [[/ブルードマザー/, "Broodmother Lysrix"], [/メガピテクス/, "Megapithecus"],
               [/^ドラゴン/, "Dragon"], [/オーバーシーア/, "Overseer"]],
  scorched_earth: [[/マンティコア/, "Manticore"]],
  aberration: [[/ロックウェル/, "Rockwell"]],
  extinction: [[/タイタン（フォレスト/, "Forest Titan"], [/キングタイタン/, "King Titan"]],
  ragnarok: [[/ドラゴン/, "Dragon"]],
  the_center: [[/ブルードマザー/, "Broodmother Lysrix"]],
  valguero: [[/ブルードマザー/, "Broodmother Lysrix"]],
  astraeos_dlc: [[/トーデス/, "Thodes"], [/ナトリクス/, "Natrix"], [/ヒュドラスコス/, "Hydraskos"], [/マンティコア/, "Manticore"]],
  astraeos_mod: [[/トーデス/, "Thodes"], [/ナトリクス/, "Natrix"]]
};

let n = 0;
Object.entries(LINK).forEach(([id, rules]) => {
  const m = maps.maps.find(x => x.id === id); if (!m) return;
  m.bosses.forEach(b => {
    const r = rules.find(([re]) => re.test(b.name));
    if (!r || !boss[r[1]]) return;
    b.tribute = boss[r[1]];
    b.tribute_src = r[1];
    n++;
  });
});
fs.writeFileSync(path.join(root, "data", "ark_maps.json"), JSON.stringify(maps, null, 1), "utf8");
console.log("トリビュートを紐づけたボス:", n, "件");
maps.maps.forEach(m => { const t = m.bosses.filter(b => b.tribute).length;
  if (t) console.log("  " + m.id + ": " + t + "/" + m.bosses.length); });
