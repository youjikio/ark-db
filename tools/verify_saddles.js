// 図鑑に書いてあるサドルの必要レベルを、公式Wikiの各サドルページ（| requiredlevel =）と突き合わせる。
//   使い方: node tools/verify_saddles.js        … 照合して差分を表示
//           node tools/verify_saddles.js --fix  … Wikiの値で図鑑を上書き
const fs = require("fs"), path = require("path"), https = require("https");
const root = path.join(__dirname, "..");
const file = path.join(root, "data", "ark_creatures.json");
const doc = JSON.parse(fs.readFileSync(file, "utf8"));
const FIX = process.argv.indexOf("--fix") >= 0;
const UA = "ARKPersonalRefTool/1.0 (personal reference tool)";

// Wiki のサドルページは短縮名のことがある
const SHORT = {
  "Triceratops":"Trike", "Ankylosaurus":"Ankylo", "Quetzal":"Quetz", "Stegosaurus":"Stego",
  "Brontosaurus":"Bronto", "Paraceratherium":"Paracer", "Mosasaurus":"Mosasaur",
  "Therizinosaur":"Therizinosaurus", "Carnotaurus":"Carno", "Pulmonoscorpius":"Scorpion",
  "Dire Bear":"Direbear", "Woolly Rhino":"Woolly Rhino", "Terror Bird":"Terror Bird"
};
function candidates(en){
  const c = [en + " Saddle"];
  if (SHORT[en]) c.unshift(SHORT[en] + " Saddle");
  return c;
}
function get(url){ return new Promise((res,rej)=>{ https.get(url,{headers:{"User-Agent":UA}},r=>{
  let b=""; r.on("data",x=>b+=x); r.on("end",()=>res(b)); }).on("error",rej); }); }

(async () => {
  const targets = doc.creatures.filter(c => c.saddle);
  const titles = [...new Set([].concat(...targets.map(c => candidates(c.en))))];
  const level = {};
  for (let i = 0; i < titles.length; i += 45) {
    const batch = titles.slice(i, i + 45);
    const body = await get("https://ark.wiki.gg/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&titles=" +
      encodeURIComponent(batch.join("|")));
    const d = JSON.parse(body);
    if (d.error) { console.error("APIエラー:", d.error.info); return; }
    Object.values(d.query.pages).forEach(p => {
      if (p.missing !== undefined || !p.revisions) return;
      const t = p.revisions[0].slots.main["*"];
      const m = t.match(/\|\s*requiredlevel\s*=\s*(\d+)/i);
      if (m) level[p.title] = +m[1];
    });
  }

  let ok = 0, diff = [], notfound = [];
  targets.forEach(c => {
    const hit = candidates(c.en).map(t => level[t]).find(v => v !== undefined);
    if (hit === undefined) { notfound.push(c.ja + "（" + c.en + "）DB:" + c.saddle); return; }
    if (hit === c.saddle) { ok++; return; }
    diff.push({ c: c, ja: c.ja, db: c.saddle, wiki: hit });
  });

  console.log("照合:", targets.length, "件 ／ 一致:", ok, "／ 不一致:", diff.length, "／ ページ無し:", notfound.length);
  diff.forEach(d => console.log("  ⚠ " + d.ja + "  DB:" + d.db + " → Wiki:" + d.wiki));
  if (notfound.length) console.log("  （ページが見つからず未確認）" + notfound.join(" / "));

  if (FIX && diff.length) {
    diff.forEach(d => d.c.saddle = d.wiki);
    fs.writeFileSync(file, JSON.stringify(doc, null, 1), "utf8");
    console.log("→ Wikiの値で", diff.length, "件を修正しました");
  } else if (diff.length) {
    console.log("→ 直すには: node tools/verify_saddles.js --fix");
  }
})();
