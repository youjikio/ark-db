// 公式Wikiの Category:Engrams（832ページ）から、エングラム辞典のもとデータを作る。
//   使い方: node tools/fetch_engrams.js   → data/ark_engrams.json
// 取るもの: 必要レベル / EP / 分類 / 作る場所 / 前提エングラム / DLC
const fs = require("fs"), path = require("path"), https = require("https");
const root = path.join(__dirname, "..");
const UA = "ARKPersonalRefTool/1.0 (personal reference tool)";

function get(url){ return new Promise((res,rej)=>{ https.get(url,{headers:{"User-Agent":UA}},r=>{
  let b=""; r.on("data",c=>b+=c); r.on("end",()=>res(b)); }).on("error",rej); }); }
function F(t, k){
  const m = t.match(new RegExp("\\|\\s*" + k + "\\s*=\\s*([^\\n]*)"));
  return m && m[1] !== undefined ? m[1].replace(/\{\{|\}\}|\[\[|\]\]/g,"").trim() : "";
}

(async () => {
  const names = fs.readFileSync(path.join(__dirname, "engram_pages.txt"), "utf8")
    .split("\n").map(s => s.trim()).filter(Boolean)
    .filter(n => !/\/tr$|^Category:/.test(n));
  console.log("対象:", names.length, "ページ");

  const out = [];
  for (let i = 0; i < names.length; i += 50) {
    const batch = names.slice(i, i + 50);
    const body = await get("https://ark.wiki.gg/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&titles=" +
      encodeURIComponent(batch.join("|")));
    let d; try { d = JSON.parse(body); } catch(e){ console.error("JSON失敗 @", i); break; }
    if (d.error) { console.error("APIエラー:", d.error.info); break; }
    Object.values(d.query.pages).forEach(p => {
      if (p.missing !== undefined || !p.revisions) return;
      const t = p.revisions[0].slots.main["*"];
      const lv = F(t, "requiredlevel"), ep = F(t, "engrampoints");
      if (!lv && !ep) return;                      // エングラムでないページは捨てる
      // 説明文（本文の最初の一文）を拾う
      let desc = "";
      const body = t.split("\n").filter(l => !/^\s*[|{}]/.test(l)).join("\n");
      const dm = body.match(/'''[^']+'''([\s\S]{0,400}?)\./);
      if (dm) {
        desc = ("The " + p.title + dm[1] + ".")
          .replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, "$2")
          .replace(/\{\{[^}]*\}\}|'''|''|<[^>]+>/g, "")
          .replace(/\s+/g, " ").trim();
        if (desc.length > 220) desc = desc.slice(0, 220) + "…";
      }
      const pre = [F(t,"prerequisite1"), F(t,"prerequisite2"), F(t,"prerequisite3")].filter(Boolean);
      // 素材（ingredient1..12 / quantity1..12）
      const mats = [];
      for (let k = 1; k <= 12; k++) {
        const n = F(t, "ingredient" + k);
        if (!n) continue;
        mats.push({ n: n.split("|")[0].trim(), q: (F(t, "quantity" + k) || "").split("|")[0].trim() });
      }
      out.push({
        en: p.title,
        lv: parseInt(lv, 10) || 0,
        ep: parseInt(ep, 10) || 0,
        cat: F(t, "category") || F(t, "type") || "",
        made: F(t, "craftedin") || "",
        pre: pre,
        mats: mats,
        yield: F(t, "yield") || "",
        desc: desc,
        dlc: F(t, "dlc") || ""
      });
    });
    console.log("  " + Math.min(i + 50, names.length) + "/" + names.length + " → 取得 " + out.length);
  }
  out.sort((a, b) => a.lv - b.lv || a.en.localeCompare(b.en));
  fs.writeFileSync(path.join(root, "data", "ark_engrams_raw.json"),
    JSON.stringify({ _meta: { source: "ARK公式Wiki Category:Engrams の各ページ", fetched: new Date().toISOString().slice(0,10) }, engrams: out }, null, 1), "utf8");
  console.log("書き出し: data/ark_engrams_raw.json（" + out.length + "件）");
  const cats = {}; out.forEach(e => cats[e.cat] = (cats[e.cat]||0)+1);
  console.log("分類:", Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([k,v])=>k+":"+v).join(" / "));
  const dlcs = {}; out.forEach(e => { if(e.dlc) dlcs[e.dlc] = (dlcs[e.dlc]||0)+1; });
  console.log("DLC欄:", Object.entries(dlcs).slice(0,12).map(([k,v])=>k+":"+v).join(" / ") || "（空）");
})();
