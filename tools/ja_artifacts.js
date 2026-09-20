// マップデータに残っている英語（アーティファクト名など）を日本語にする。
//   使い方: node tools/ja_artifacts.js     ※何度実行しても二重にならない
const fs = require("fs"), path = require("path");
const file = path.join(__dirname, "..", "data", "ark_maps.json");
const doc = JSON.parse(fs.readFileSync(file, "utf8"));

const A = { "Clever":"クレバー","Hunter":"ハンター","Massive":"マッシブ","Brute":"ブルート",
  "Devourer":"デバウアー","Pack":"パック","Cunning":"カニング","Immune":"イミューン",
  "Skylord":"スカイロード","Strong":"ストロング","Crag":"クラッグ","Destroyer":"デストロイヤー",
  "Gatekeeper":"ゲートキーパー","Depths":"デプス","Shadows":"シャドウ","Stalker":"ストーカー",
  "Chaos":"カオス","Growth":"グロウス","Void":"ヴォイド","Devious":"デビアス" };

let n = 0;
const conv = s => {
  if (!s || /の遺物/.test(s)) return s;                 // すでに日本語化済み
  let out = s.replace(/Artifact of (?:the )?(\w+)/g, (m, k) => A[k] ? A[k] + "の遺物（" + m + "）" : m);
  // ボス表の「Clever / Hunter / Massive」形式
  if (out === s && /^[A-Za-z /]+$/.test(s.trim())) {
    const parts = s.split("/").map(x => x.trim());
    if (parts.length > 1 && parts.every(p => A[p])) out = parts.map(p => A[p] + "（" + p + "）").join("／");
  }
  if (out !== s) n++;
  return out;
};

doc.maps.forEach(m => {
  m.caves.forEach(c => { c.artifact = conv(c.artifact); });
  m.bosses.forEach(b => { b.artifacts = conv(b.artifacts); });
});
fs.writeFileSync(file, JSON.stringify(doc, null, 1), "utf8");
console.log("日本語化した項目:", n, "件");
doc.maps.find(m => m.id === "the_island").bosses.forEach(b => console.log("  " + b.name + " ← " + b.artifacts));
