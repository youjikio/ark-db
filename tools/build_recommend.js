// 恐竜図鑑に「おすすめ度」を入れる（tools/recommend.json が元データ）
//   使い方: node tools/build_recommend.js   → data/ark_creatures.json の各種に rec / rec_why を書く
// 何度実行しても同じ結果になる。recommend.json に無い種はタグから自動で決める。
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const REC = JSON.parse(fs.readFileSync(path.join(__dirname, "recommend.json"), "utf8")).rec;
const file = path.join(root, "data", "ark_creatures.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));

// recommend.json に無い種の自動判定（新しく図鑑に足した種のため）
function auto(c) {
  const t = (c.tags || []).join("/");
  if (/ボス|不可|危険/.test(t) && !/テイム支援/.test(t)) return [0, ""];
  if (/必須/.test(t)) return [5, ""];
  if (/採取|運搬|支援|便利|作業台|生産|回復|肩乗り|移動拠点/.test(t)) return [4, ""];
  if (/戦闘|移動|水中|洞窟|序盤|素材|食料/.test(t)) return [3, ""];
  return [2, ""];
}

let manual = 0, autoN = 0;
data.creatures.forEach(c => {
  const r = REC[c.en];
  if (r) { manual++; c.rec = r[0]; c.rec_why = r[1] || ""; }
  else { autoN++; const a = auto(c); c.rec = a[0]; c.rec_why = a[1]; }
});
data._meta = data._meta || {};
data._meta.rec = "おすすめ度は tools/recommend.json（★5=いないと詰まる〜★1=趣味／0=テイム不可・ボス）。基準はPvE・The Island＋Astraeos・テイム5倍のこのサーバー。";
fs.writeFileSync(file, JSON.stringify(data, null, 1), "utf8");

const dist = {};
data.creatures.forEach(c => dist[c.rec] = (dist[c.rec] || 0) + 1);
console.log("おすすめ度を付与: 手動 " + manual + " 件 / 自動 " + autoN + " 件");
console.log("分布: " + [5,4,3,2,1,0].map(s => (s ? "★" + s : "対象外") + ":" + (dist[s] || 0)).join(" / "));
console.log("★5: " + data.creatures.filter(c => c.rec === 5).map(c => c.ja).join("・"));
