// 公式Wikiのボスページから「Tribute Requirements（召喚に必要なもの）」を取り出す。
//   使い方: node tools/fetch_boss_tributes.js   → data/ark_bosses.json
const fs = require("fs"), path = require("path"), https = require("https");
const UA = "ARKPersonalRefTool/1.0 (personal reference tool)";
const TITLES = ["Broodmother Lysrix","Megapithecus","Dragon","Overseer","Rockwell","Manticore",
  "King Titan","Forest Titan","Ice Titan","Desert Titan","Moeder, Master of the Ocean",
  "Corrupted Master Controller","Thodes","Natrix","Hydraskos","Lost King","Lost Queen"];

const JA = {
  "Artifact of the Clever":"クレバーの遺物","Artifact of the Hunter":"ハンターの遺物",
  "Artifact of the Massive":"マッシブの遺物","Artifact of the Brute":"ブルートの遺物",
  "Artifact of the Devourer":"デバウアーの遺物","Artifact of the Pack":"パックの遺物",
  "Artifact of the Cunning":"カニングの遺物","Artifact of the Immune":"イミューンの遺物",
  "Artifact of the Skylord":"スカイロードの遺物","Artifact of the Strong":"ストロングの遺物",
  "Artifact of the Crag":"クラッグの遺物","Artifact of the Destroyer":"デストロイヤーの遺物",
  "Artifact of the Gatekeeper":"ゲートキーパーの遺物","Artifact of the Depths":"デプスの遺物",
  "Artifact of the Shadows":"シャドウの遺物","Artifact of the Stalker":"ストーカーの遺物",
  "Artifact of Chaos":"カオスの遺物","Artifact of Growth":"グロウスの遺物","Artifact of the Void":"ヴォイドの遺物",
  "Argentavis Talon":"アルゲンタヴィスの爪","Sarcosuchus Skin":"サルコスクスの皮",
  "Sauropod Vertebra":"竜脚類の脊椎","Titanoboa Venom":"ティタノボアの毒",
  "Megalodon Tooth":"メガロドンの歯","Tyrannosaurus Arm":"ティラノサウルスの腕",
  "Therizinosaurus Claws":"テリジノサウルスの爪","Allosaurus Brain":"アロサウルスの脳",
  "Basilosaurus Blubber":"バシロサウルスの脂肪","Megalania Toxin":"メガラニアの毒",
  "Spino Sail":"スピノサウルスの帆","Thylacoleo Hook Claw":"ティラコレオの鉤爪",
  "Tusoteuthis Tentacle":"トゥソテウティスの触手","Yutyrannus Lungs":"ユティラヌスの肺",
  "Nameless Venom":"ナメーレスの毒","Reaper Pheromone Gland":"リーパーのフェロモン腺",
  "Rock Drake Feather":"ロックドレイクの羽","Deathworm Horn":"デスワームの角",
  "Fire Talon":"炎のワイバーンの爪","Lightning Talon":"雷のワイバーンの爪","Poison Talon":"毒のワイバーンの爪",
  "Element":"エレメント","Corrupted Heart":"コラプトハート","Player Level":"必要プレイヤーレベル",
  "Alpha Reaper King Barb":"アルファ・リーパーキングの棘","Blood Crystal":"ブラッドクリスタル",
  "Giganotosaurus Heart":"ギガノトサウルスの心臓","Spinosaurus Sail":"スピノサウルスの帆",
  "Therizino Claws":"テリジノサウルスの爪","Thylacoleo Hook-Claw":"ティラコレオの鉤爪",
  "Basilisk Scale":"バジリスクの鱗","Alpha Basilisk Fang":"アルファ・バジリスクの牙",
  "Alpha Karkinos Claw":"アルファ・カルキノスの爪","Desert Titan Trophy":"デザートタイタンのトロフィー",
  "Forest Titan Trophy":"フォレストタイタンのトロフィー","Ice Titan Trophy":"アイスタイタンのトロフィー",
  "King Titan Trophy (Gamma)":"キングタイタンのトロフィー（γ）",
  "King Titan Trophy (Beta)":"キングタイタンのトロフィー（β）",
  "King Titan Trophy (Alpha)":"キングタイタンのトロフィー（α）",
  "Alpha Tusoteuthis Eye":"アルファ・トゥソテウティスの目",
  "Alpha Megalodon Fin":"アルファ・メガロドンのヒレ","Alpha Mosasaur Tooth":"アルファ・モササウルスの歯",
  "Alpha Leedsichthys Blubber":"アルファ・リードシクティスの脂肪",
  "Alpha Raptor Claw":"アルファ・ラプターの爪","Alpha Carnotaurus Arm":"アルファ・カルノの腕",
  "Alpha Rex Trophy":"アルファ・レックスのトロフィー","Argentavis Talon ":"アルゲンタヴィスの爪",
  "Megalania Toxin ":"メガラニアの毒","Sauropod Vertebra ":"竜脚類の脊椎",
  "Tusoteuthis Tentacle ":"トゥソテウティスの触手","Reaper Pheromone Gland ":"リーパーのフェロモン腺"
};

function get(url){ return new Promise((res,rej)=>{ https.get(url,{headers:{"User-Agent":UA}},r=>{
  let b=""; r.on("data",c=>b+=c); r.on("end",()=>res(b)); }).on("error",rej); }); }

function parseTribute(text){
  const i = text.search(/===\s*Tribute Requirements\s*===/i);
  if (i < 0) return null;
  const seg = text.slice(i, i + 4000);
  const start = seg.indexOf("{|");
  if (start < 0) return null;
  const table = seg.slice(start, seg.indexOf("|}", start));
  const clean = s => s.replace(/\{\{|\}\}|\[\[|\]\]/g, "")
    .replace(/colspan\s*=\s*"?\d+"?/gi, "").replace(/style\s*=\s*"[^"]*"/gi, "")
    .replace(/\|\s*$/, "").replace(/^\s*\|+/, "").trim();
  const jaName = n => JA[n] || n
    .replace(/^(Gamma|Beta|Alpha)\s+(.+?)\s+Trophy$/, (m,t,who)=>who+"のトロフィー（"+({Gamma:"γ",Beta:"β",Alpha:"α"}[t])+"）")
    .replace(/^Corrupt Heart$/, "コラプトハート")
    .replace(/^Alpha Tyrannosaur Tooth$/, "アルファ・レックスの歯")
    .replace(/^Alpha Carnotaurus Arm$/, "アルファ・カルノの腕")
    .replace(/^Alpha Rex Trophy$/, "アルファ・レックスのトロフィー");
  const rows = [];
  table.split("\n|-").forEach(r => {
    const cells = r.split("||").map(clean).filter(s => s !== "");
    if (cells.length < 2) return;
    let name = cells[0].replace(/^ItemLink\|/, "").replace(/\|.*$/, "").trim();
    if (!name || /Item Required/i.test(name)) return;
    // 1つの値が3段階にまたがっている表（colspan）は同じ値を3つに展開する
    const v = cells.slice(1).filter(s => s !== "");
    const g = v[0] || "", b = v[1] !== undefined ? v[1] : g, a = v[2] !== undefined ? v[2] : (v[1] !== undefined ? v[1] : g);
    rows.push({ name: jaName(name), g: g, b: b, a: a });
  });
  return rows.length ? rows : null;
}

(async () => {
  const out = {};
  for (let i = 0; i < TITLES.length; i += 12) {
    const batch = TITLES.slice(i, i + 12);
    const body = await get("https://ark.wiki.gg/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&titles=" +
      encodeURIComponent(batch.join("|")));
    const d = JSON.parse(body);
    if (d.error) { console.error("APIエラー:", d.error.info); return; }
    Object.values(d.query.pages).forEach(p => {
      if (!p.revisions) return;
      const rows = parseTribute(p.revisions[0].slots.main["*"]);
      if (rows) out[p.title] = rows;
    });
  }
  fs.writeFileSync(path.join(__dirname, "..", "data", "ark_bosses.json"),
    JSON.stringify({ _meta:{ source:"ARK公式Wiki 各ボスページの Tribute Requirements", fetched:new Date().toISOString().slice(0,10),
      note:"γ（ガンマ）＝一番易しい／β／α＝最難。数字は必要個数、- は不要。" }, bosses: out }, null, 1), "utf8");
  Object.entries(out).forEach(([k,v]) => console.log(k + ": " + v.length + "行  例) " + v.slice(0,3).map(r=>r.name+" "+r.g+"/"+r.b+"/"+r.a).join(" | ")));
  console.log("取得できたボス:", Object.keys(out).length, "／未取得:", TITLES.filter(t=>!out[t]).join(", ") || "なし");
})();
