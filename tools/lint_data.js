// データの粗さがしツール（中身の整合チェック）
//   使い方: node tools/lint_data.js
// 壊れているものだけでなく「怪しい」ものも出す。0件になることが目標ではなく、把握するための道具。
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const J = f => JSON.parse(fs.readFileSync(path.join(root, "data", f), "utf8"));
const maps = J("ark_maps.json"), dex = J("ark_creatures.json"), nodes = J("ark_resource_nodes.json");
const spawns = J("ark_spawns.json"), items = J("ark_items.json"), idx = J("creature_index.json").creatures;

const warn = [], info = [];
const W = s => warn.push(s), I = s => info.push(s);

// --- マップ ---------------------------------------------------------------
const COORD = /(\d{1,3}(?:\.\d+)?)\s*(?:lat|LAT)?\s*[\/／]\s*(?:lon|LON)?\s*(\d{1,3}(?:\.\d+)?)/g;
maps.maps.forEach(m => {
  ["regions","bases","resources","caves","bosses","tips","map_settings","links"].forEach(k => {
    if (!Array.isArray(m[k]) || !m[k].length) W(`${m.id}: ${k} が空`);
  });
  if (!m.route || m.route.length < 3) W(`${m.id}: 進行ルートが3ステップ未満`);
  if (!m.hazards || m.hazards.length < 3) W(`${m.id}: 注意・ギミックが3件未満`);
  if (!fs.existsSync(path.join(root, m.image || ""))) W(`${m.id}: 地図画像が見つからない (${m.image})`);
  // 座標の範囲チェック
  const bad = [];
  const scan = (label, s) => { if (!s) return; COORD.lastIndex = 0; let x;
    while ((x = COORD.exec(s))) { const a = +x[1], b = +x[2];
      if (a > 100 || b > 100) bad.push(`${label}「${s.slice(0,24)}…」${a}/${b}`); } };
  m.caves.forEach(c => scan("洞窟", c.coord));
  m.bases.forEach(b => scan("拠点", b.coord));
  if (bad.length) W(`${m.id}: 座標が100を超える記述 ${bad.length}件 → ${bad[0]}`);
  // 要確認の数
  const todo = JSON.stringify(m).match(/要確認/g);
  if (todo) I(`${m.id}: 「要確認」が ${todo.length} ヵ所`);
});

// --- 資源ノード -----------------------------------------------------------
Object.entries(nodes.maps).forEach(([id, o]) => {
  if (!maps.maps.find(m => m.id === id)) W(`資源ノード: 知らないマップID ${id}`);
  Object.entries(o).forEach(([k, arr]) => {
    const seen = new Set(), dup = [];
    arr.forEach(s => { if (seen.has(s)) dup.push(s); seen.add(s); });
    if (dup.length) I(`${id} / ${k}: 同じ座標が ${dup.length} 件重複`);
    const out = arr.filter(s => { const p = s.split(/[\/／]/).map(Number); return p[0] > 100 || p[1] > 100; });
    if (out.length) W(`${id} / ${k}: 100超の座標 ${out.length}件（${out[0]}）`);
    const neg = arr.filter(s => s.indexOf("-") >= 0);
    if (neg.length) I(`${id} / ${k}: マイナス座標 ${neg.length}件（地図には出ない）`);
    if (!nodes._meta.legend[k]) W(`凡例に色が無い資源: ${k}`);
  });
});

// --- 図鑑 -----------------------------------------------------------------
const ids = new Set();
dex.creatures.forEach(c => {
  if (ids.has(c.id)) W(`図鑑: IDが重複 ${c.id}`); ids.add(c.id);
  ["ja","en","tame","role","ability","prep","danger"].forEach(k => { if (!c[k]) W(`図鑑 ${c.id}: ${k} が空`); });
  if (!c.ride && c.saddle) W(`図鑑 ${c.ja}: 騎乗不可なのにサドルLvがある`);
  if (!c.tags || !c.tags.length) W(`図鑑 ${c.ja}: タグが無い`);
  if (c.tame === "要確認") I(`図鑑 ${c.ja}: テイム方法が未確定`);
  const v = idx[c.en];
  if (v) {
    const k = (v.knockout||"").toLowerCase(), p = (v.passive||"").toLowerCase();
    const wiki = k.startsWith("yes") ? "気絶" : p.startsWith("yes") ? "手渡し" : null;
    // 「特殊」「卵」は、Wikiの気絶/手渡しフラグでは表せない手順なので不一致扱いにしない
    if (wiki && c.tame !== wiki && ["要確認","特殊","卵","不可"].indexOf(c.tame) < 0)
      W(`図鑑 ${c.ja}: テイム方法がWikiと不一致（DB:${c.tame} / Wiki:${wiki}）`);
    else if (wiki && c.tame !== wiki && ["特殊","卵"].indexOf(c.tame) >= 0)
      I(`図鑑 ${c.ja}: Wikiの分類は「${wiki}」だが、手順が特殊なので当DBは「${c.tame}」で記載`);
  }
});

// --- エングラム辞典と図鑑のサドルLvを突き合わせ ---------------------------
if (fs.existsSync(path.join(root, "data", "ark_engrams.json"))) {
  const eng = J("ark_engrams.json").engrams;
  const byName = {}; eng.forEach(e => byName[e.en] = e);
  const SHORT = { "Triceratops":"Trike","Ankylosaurus":"Ankylo","Quetzal":"Quetz","Stegosaurus":"Stego",
    "Brontosaurus":"Bronto","Paraceratherium":"Paracer","Mosasaurus":"Mosasaur","Carnotaurus":"Carno",
    "Therizinosaur":"Therizinosaurus","Dire Bear":"Direbear" };
  let same = 0, miss = 0;
  dex.creatures.filter(c => c.saddle).forEach(c => {
    const e = byName[c.en + " Saddle"] || byName[(SHORT[c.en]||"") + " Saddle"];
    if (!e) { miss++; return; }
    if (e.lv !== c.saddle) W(`サドルLv不一致: ${c.ja} 図鑑${c.saddle} / エングラム辞典${e.lv}`);
    else same++;
  });
  I(`サドルLvの相互チェック: 一致 ${same} 件 ／ 辞典に該当なし ${miss} 件`);
  const noLv = eng.filter(e => e.src !== "MOD" && e.src.indexOf("MOD：") !== 0 && !e.lv).length;
  if (noLv) I(`エングラム辞典: 必要レベル不明 ${noLv} 件`);
  I(`エングラム辞典: ${eng.length} 件（うち日本語名つき ${eng.filter(e => e.ja).length} 件）`);
}

// --- 出現生物 -------------------------------------------------------------
Object.entries(spawns.maps).forEach(([id, m]) => {
  if (!maps.maps.find(x => x.id === id)) W(`出現生物: 知らないマップID ${id}`);
  if (!m.count || m.count < 20) I(`${id}: 出現生物が ${m.count} 種と少なめ`);
});

// --- アイテムリンク -------------------------------------------------------
Object.entries(items.items).forEach(([ja, url]) => {
  if (!/^https:\/\/ark\.wiki\.gg\/wiki\//.test(url)) W(`アイテムリンクが変: ${ja} → ${url}`);
});

// --- ボスのトリビュート ---------------------------------------------------
let trib = 0;
maps.maps.forEach(m => m.bosses.forEach(b => { if (b.tribute) trib++; }));
I(`トリビュート付きボス: ${trib} 体`);

console.log("== 要対応（" + warn.length + "件） ==");
warn.forEach(s => console.log("  ⚠ " + s));
console.log("== 参考情報（" + info.length + "件） ==");
info.forEach(s => console.log("  ・ " + s));
if (!warn.length) console.log("\n問題なし。");
