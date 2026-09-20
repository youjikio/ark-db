// 恐竜図鑑の「別名」を足す
//   alt   … 英語の別名（出現一覧の「ウィンタードレイクリング（Winter Drakeling）」などを図鑑に結びつける）
//   alias … 日本語の表記ゆれ（メイグアナ／ユウティラヌス など）。図鑑の検索に使う
// 使い方: node tools/add_aliases.js   何度実行しても同じ結果になる。
const fs = require("fs"), path = require("path");
const file = path.join(__dirname, "..", "data", "ark_creatures.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));

// 英語の別名（派生種をまとめる）
const ALT = {
  "Drakeling": ["Spring Drakeling", "Summer Drakeling", "Autumn Drakeling", "Winter Drakeling"]
};
// 日本語の表記ゆれ（手動ぶん）
const ALIAS = {
  "Maeguana": ["メイグアナ", "マエイグアナ"],
  "Yutyrannus": ["ユウティラヌス", "ユティ"],
  "Drakeling": ["ドレークリング", "ドレイクリング（春夏秋冬）"],
  "Quetzal": ["ケツァル", "ケツァルコアトル"],
  "Rex": ["レックス", "ティラノ"],
  "Argentavis": ["アルゲン"],
  "Doedicurus": ["ドエディ"],
  "Ankylosaurus": ["アンキロ"],
  "Therizinosaur": ["テリジノ"],
  "Castoroides": ["ビーバー"],
  "Megatherium": ["ナマケモノ"],
  "Beelzebufo": ["カエル"],
  "Giganotosaurus": ["ギガ", "ギガノト"],
  "Carcharodontosaurus": ["カルカロ"],
  "Sarco": ["サルコ", "ワニ"],
  "Equus": ["ウマ", "馬"],
  "Otter": ["カワウソ", "ラッコ"],
  "Achatina": ["カタツムリ"],
  "Oviraptor": ["オビラプトル"],
  "Gigantopithecus": ["ゴリラ"],
  "Mesopithecus": ["サル", "小猿"],
  "Snow Owl": ["フクロウ"],
  "Desmodus": ["デズモダス", "コウモリ"],
  "Rhyniognatha": ["リニオ"],
  "Grand Tortugar": ["トルトゥガー", "巨大ガメ"],
  "Roll Rat": ["ロールラット", "モグラ"],
  "Bulbdog": ["バルブドック"],
  "Archelon": ["アルケロン", "ウミガメ"],
  "Deinotherium": ["ダイノテリウム", "ゾウ"],
  "Mammoth": ["ゾウ", "マンモス"],
  "Wyvern": ["ワイバン"],
  "Dung Beetle": ["フンコロガシ", "糞虫"],
  "Ichthyosaurus": ["イルカ"],
  "Ovis": ["ヒツジ", "羊"]
};
// 「ヴ」を含む名前は、ヴ抜きの書き方でも引けるようにする（アルゲンタヴィス→アルゲンタビス）
function noVu(s) {
  return s.replace(/ヴァ/g, "バ").replace(/ヴィ/g, "ビ").replace(/ヴェ/g, "ベ")
          .replace(/ヴォ/g, "ボ").replace(/ヴ/g, "ブ");
}

let altN = 0, aliasN = 0;
data.creatures.forEach(c => {
  if (ALT[c.en]) {
    const cur = c.alt || [];
    ALT[c.en].forEach(x => { if (cur.indexOf(x) < 0) cur.push(x); });
    c.alt = cur; altN++;
  }
  const set = [];
  (ALIAS[c.en] || []).forEach(x => { if (set.indexOf(x) < 0) set.push(x); });
  const v = noVu(c.ja);
  if (v !== c.ja && set.indexOf(v) < 0) set.push(v);
  if (set.length) { c.alias = set; aliasN++; } else if (c.alias) delete c.alias;
});
fs.writeFileSync(file, JSON.stringify(data, null, 1), "utf8");
console.log("英語の別名: " + altN + " 種 / 日本語の表記ゆれ: " + aliasN + " 種");
console.log("例: " + data.creatures.filter(c => c.alias).slice(0, 8).map(c => c.ja + "→" + c.alias.join("・")).join(" / "));
