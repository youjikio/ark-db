// ARK公式Wiki（ark.wiki.gg）から全生物のインフォボックスを取り、
// 「どのマップに出るか」「テイム方法」「騎乗可否」などを data/creature_index.json にまとめる。
//   使い方: node tools/fetch_creatures.js
// ※ wiki.gg の API はレート制限が厳しいので、50件ずつ・User-Agent を付けて順番に取得する。
const fs = require("fs"), path = require("path"), https = require("https");
const root = path.join(__dirname, "..");
const UA = "ARKPersonalRefTool/1.0 (personal reference tool)";

const EXCLUDE = /(\(Alpha\)|\(Beta\)|\(Gamma\)|Ghost|Skeletal|Zombie|Bunny|Party |Valentines|Love |Reindeer|Elf|Santa|GachaClaus|Slidy|Eerie|Zomdodo|\/tr$|Tentacle|Node|Minion|Drone$|Spawn$|Skill\)|^Human$|^Cat |^Pirate [A-Z]|^Thrall [A-Z]|^Revenant [A-Z]|^Astral |^Lightning |^Abyssal |^Succumbed|^Bloated|^Hulking|^Injured|^Experimental|^Golden Striped|^Rare |^Summoned)/;

function get(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { "User-Agent": UA } }, r => {
      let b = ""; r.on("data", c => b += c); r.on("end", () => res(b));
    }).on("error", rej);
  });
}
const F = (t, k) => { const m = t.match(new RegExp("\\|\\s*" + k + "\\s*=\\s*([^\\n]*)")); return m ? m[1].trim() : ""; };

(async () => {
  const names = fs.readFileSync(path.join(__dirname, "all_creature_pages.txt"), "utf8")
    .split("\n").map(s => s.trim()).filter(Boolean).filter(n => !EXCLUDE.test(n));
  console.log("対象ページ:", names.length);

  const out = {};
  for (let i = 0; i < names.length; i += 50) {
    const batch = names.slice(i, i + 50);
    const url = "https://ark.wiki.gg/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&titles=" +
      encodeURIComponent(batch.join("|"));
    const body = await get(url);
    let d;
    try { d = JSON.parse(body); } catch (e) { console.error("JSON parse失敗 @", i, body.slice(0, 200)); break; }
    if (d.error) { console.error("APIエラー:", d.error.info); break; }
    Object.values(d.query.pages).forEach(pg => {
      if (pg.missing !== undefined || !pg.revisions) return;
      const t = pg.revisions[0].slots.main["*"];
      if (!/\{\{Infobox creature/i.test(t)) return;
      out[pg.title] = {
        maps: F(t, "dlc"), group: F(t, "group"), diet: F(t, "diet"),
        temperament: F(t, "temperament"), knockout: F(t, "knockouttame"),
        passive: F(t, "nonviolenttame"), tameable: F(t, "tameable"),
        rideable: F(t, "rideable"), breedable: F(t, "breedable"), kibble: F(t, "kibble"),
        habitat: F(t, "habitat")
      };
    });
    console.log("  取得", Math.min(i + 50, names.length), "/", names.length, "→ 累計", Object.keys(out).length);
  }

  fs.writeFileSync(path.join(root, "data", "creature_index.json"),
    JSON.stringify({ _meta: { source: "ark.wiki.gg Infobox creature", fetched: new Date().toISOString().slice(0, 10) }, creatures: out }, null, 1), "utf8");
  console.log("書き出し: data/creature_index.json（", Object.keys(out).length, "件）");
})();
