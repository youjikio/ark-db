// ビューア（index.html）の自己テスト：全ページが描画できるか、ピンが出ているかを確認する
//   使い方: node tools/selftest.js
const fs = require("fs"), vm = require("vm"), path = require("path");
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const src = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).pop();

const load = f => JSON.parse(fs.readFileSync(path.join(root, "data", f), "utf8"));
const W = {
  ARK_DATA: load("ark_maps.json"), ARK_SPAWNS: load("ark_spawns.json"),
  ARK_CREATURES: load("ark_creatures.json"), ARK_SYS: load("ark_systems.json"),
  ARK_NODES: load("ark_resource_nodes.json"), ARK_ITEMS: load("ark_items.json"),
  ARK_ENGRAMS: load("ark_engrams.json")
};

function el() {
  return { innerHTML: "", value: "", textContent: "", style: {}, dataset: {},
    addEventListener() {}, querySelectorAll() { return []; }, querySelector() { return null; },
    focus() {}, blur() {}, setSelectionRange() {},
    classList: { add() {}, remove() {}, toggle() {} },
    getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 100 }; } };
}
const nodes = { "#q": el(), "#nav": el(), "#main": el(), "#upd": el(), "#home-link": el() };
const doc = { querySelector: s => nodes[s] || el(), getElementById: () => null, addEventListener() {} };
W.addEventListener = () => {};
W.scrollTo = () => {};
const ctx = { window: W, document: doc, console,
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  fetch: () => Promise.reject(new Error("no fetch")) };
ctx.window.document = doc;

// index.html が読み込む .js が全部そろっているか（build.ps1 の設定もれを検出する）
const missingSrc = [...html.matchAll(/<script\s+src="([^"]+)"/g)]
  .map(m => m[1]).filter(p => !fs.existsSync(path.join(root, p)));
if (missingSrc.length) {
  console.log("NG:");
  missingSrc.forEach(p => console.log("  - 読み込むファイルが無い: " + p + "（build.ps1 に追加されている？）"));
  process.exit(1);
}
console.log("読み込みファイル: " + [...html.matchAll(/<script\s+src="([^"]+)"/g)].length + "件 すべて存在");

const test = `
;(function(){
  const fail = [];
  const ids = ["home","guide","dex","resmap","engrams","sys","mods"]
    .concat(DATA.maps.map(m=>m.id)).concat(["server","client","notes"]);
  for (const id of ids) {
    view = id; buildNav(); render();
    const L = document.querySelector("#main").innerHTML.length;
    if (L < 500) fail.push("薄すぎる描画: " + id + " (" + L + ")");
  }
  console.log("ページ描画: " + ids.length + "件 OK");

  let totalPins = 0;
  Object.keys(NODES).forEach(mid => {
    resMapId = mid; view = "resmap"; render();
    const H = document.querySelector("#main").innerHTML;
    const pins = (H.match(/class="pin[ "]/g) || []).length;
    // ※このテスト本文はテンプレート文字列なので \\w などのエスケープは使わない（[a-z] で書く）
    const shapes = new Set((H.match(/class="pin ([a-z]+)"/g) || []).map(s => s.split(" ")[1]));
    let declared = 0;
    Object.keys(NODES[mid]).forEach(k => declared += NODES[mid][k].length);
    totalPins += pins;
    console.log("  " + mid + ": ピン " + pins + " / 座標 " + declared + " ／ 形の種類 " + shapes.size);
    if (pins === 0) fail.push("ピンが0件: " + mid);
    // 色分けの確認：資源ごとに違う色が振られているか
    const colors = new Set((H.match(/background:(#[0-9a-f]{6})/gi) || []).map(s => s.toLowerCase()));
    if (Object.keys(NODES[mid]).length >= 4 && colors.size < 4)
      fail.push("色分けが効いていない: " + mid + "（色 " + colors.size + "種）");
  });
  console.log("資源ピン合計: " + totalPins);

  // 出現一覧のリンク（図鑑リンク / Wikiリンク）
  view = "the_island"; render();
  const IS = document.querySelector("#main").innerHTML;
  const dexLinks = (IS.match(/class="dexlink"/g) || []).length;
  const wikiLinks = (IS.match(/class="wlink"/g) || []).length;
  console.log("The Island 出現一覧のリンク: 図鑑 " + dexLinks + " / Wiki " + wikiLinks);
  if (dexLinks < 20) fail.push("図鑑リンクが少なすぎる: " + dexLinks);
  if (wikiLinks < 100) fail.push("Wikiリンクが少なすぎる: " + wikiLinks);
  if (IS.indexOf('href="https://ark.wiki.gg/wiki/Rex"') < 0) fail.push("Rex の Wiki リンクが無い");

  // 図鑑の1種フォーカス
  dexFocus = "rex"; view = "dex"; render();
  const F = document.querySelector("#main").innerHTML;
  if (F.indexOf("1種だけ表示中") < 0) fail.push("図鑑の1種表示が効いていない");
  if ((F.match(/class="card"/g) || []).length !== 1) fail.push("1種表示なのにカードが1枚ではない");
  dexFocus = null;

  // 図鑑：準備するもの＋テイム基本ガイド
  view = "dex"; render();
  const DX = document.querySelector("#main").innerHTML;
  const preps = (DX.match(/class="prep"/g) || []).length;
  console.log("図鑑の『準備するもの』表示: " + preps + " / " + DEX.length + " 件");
  if (preps < DEX.length) fail.push("prepが欠けている図鑑カードがある: " + preps + "/" + DEX.length);
  if (DX.indexOf("テイムの基本") < 0) fail.push("テイム基本ガイドが出ていない");
  if (DEX.filter(c => !c.prep).length) fail.push("prep未設定の生き物がJSONにある");
  const abil = (DX.match(/class="abil"/g) || []).length;
  const ilinks = (DX.match(/class="ilink"/g) || []).length;
  console.log("図鑑の『特殊能力・攻撃』表示: " + abil + " / " + DEX.length + " 件 ／ アイテムリンク " + ilinks + " 個");
  if (abil < DEX.length) fail.push("abilityが欠けている図鑑カードがある: " + abil + "/" + DEX.length);
  if (ilinks < 50) fail.push("アイテムリンクが少なすぎる: " + ilinks);
  if (DEX.filter(c => !c.ability).length) fail.push("ability未設定の生き物がJSONにある");
  view = "sys"; render();
  if ((document.querySelector("#main").innerHTML.match(/class="ilink"/g) || []).length < 20)
    fail.push("システム解説にアイテムリンクが出ていない");

  // 恐竜図鑑のおすすめ度
  view = "dex"; dexFilter = { tag:"", map:"", q:"", rec:0 }; dexSort = ""; render();
  const DX2 = document.querySelector("#main").innerHTML;
  const recChips = (DX2.match(/class="chip rec/g) || []).length;
  const noRec = DEX.filter(c => c.rec === undefined || c.rec === null).length;
  const why = DEX.filter(c => c.rec >= 4 && !c.rec_why).length;
  const dist = {}; DEX.forEach(c => dist[c.rec] = (dist[c.rec] || 0) + 1);
  console.log("おすすめ度: ★5 " + (dist[5]||0) + " / ★4 " + (dist[4]||0) + " / ★3 " + (dist[3]||0) +
    " / ★2 " + (dist[2]||0) + " / 対象外 " + (dist[0]||0) + "（カード表示 " + recChips + " 件）");
  if (noRec) fail.push("おすすめ度が無い生き物がいる: " + noRec + "件");
  if (why) fail.push("★4以上なのにおすすめ理由が無い: " + why + "件");
  if (recChips < 100) fail.push("図鑑カードにおすすめ度が出ていない: " + recChips);
  if (DX2.indexOf("おすすめ度で絞る") < 0) fail.push("おすすめ度の絞り込みUIが無い");
  dexFilter.rec = 5; render();
  const only5 = document.querySelector("#main").innerHTML;
  if ((only5.match(/class="card"/g) || []).length !== (dist[5]||0))
    fail.push("★5の絞り込み件数が合わない");
  dexFilter.rec = 0; dexSort = "rec"; render();
  const sorted = document.querySelector("#main").innerHTML;
  const firstJa = DEX.slice().sort((a,b)=>(b.rec||0)-(a.rec||0))[0].ja;
  if (sorted.indexOf(firstJa) < 0) fail.push("おすすめ順の並べ替えが効いていない");
  dexSort = ""; dexFilter = { tag:"", map:"", q:"", rec:0 };

  // 便利恐竜リストの出現マップ表示
  {
    const U2 = (DATA.beginner_guide && DATA.beginner_guide.utility_dinos) || { groups: [] };
    const all = [].concat.apply([], U2.groups.map(g => g.items));
    const noWhere = all.filter(i => !i.where).length;
    const ast = all.filter(i => i.where === "Astraeos").length;
    console.log("便利恐竜リストの出現: Island " + all.filter(i=>i.where==="Island").length +
      " / 両方 " + all.filter(i=>i.where==="両方").length + " / Astraeos " + ast);
    if (noWhere) fail.push("出る場所が入っていない便利恐竜がいる: " + noWhere + "件");
    if (!ast) fail.push("MOD（Astraeos）の便利恐竜が入っていない");
    if (all.filter(i => (i.rec||0) < 3).length) fail.push("便利恐竜リストに★2以下が混ざっている");
  }
  // 初心者ガイドの便利恐竜リスト
  view = "guide"; render();
  const GD = document.querySelector("#main").innerHTML;
  const U = (DATA.beginner_guide && DATA.beginner_guide.utility_dinos) || null;
  if (!U) fail.push("便利恐竜リストのデータが無い");
  else {
    const rows = (GD.match(/class="uwhen"/g) || []).length;
    const want = U.groups.reduce((n, g) => n + g.items.length, 0);
    const links = (GD.match(/class="dexlink"/g) || []).length;
    console.log("便利恐竜リスト: " + rows + " / " + want + " 種（図鑑リンク " + links + " 個・" + U.groups.length + "グループ）");
    if (rows < want) fail.push("便利恐竜リストの行が足りない: " + rows + "/" + want);
    if (links < want) fail.push("便利恐竜リストから図鑑へのリンクが足りない: " + links + "/" + want);
    if (GD.indexOf("gd-dinos") < 0) fail.push("便利恐竜リストの見出し(gd-dinos)が無い");
    U.groups.forEach(g => g.items.forEach(it => {
      const m = it.n.match(/（([^（）]+)）s*$/);
      const en = m && m[1].trim();
      const c = en && (DEX.find(d => d.en === en) || DEX.find(d => d.alt && d.alt.indexOf(en) >= 0));
      if (!c) fail.push("便利恐竜リストの「" + it.n + "」が図鑑に無い");
    }));
  }
  // エングラム辞典
  view = "engrams"; render();
  const EG = document.querySelector("#main").innerHTML;
  const rows = (EG.match(/<tr>/g) || []).length;
  console.log("エングラム辞典の行数: " + rows + " ／ データ " + ENG.length + " 件");
  if (rows < 100) fail.push("エングラム辞典の行が少ない: " + rows);
  if (EG.indexOf("MOD") < 0) fail.push("エングラム辞典にMODの出典が出ていない");
  if (EG.indexOf("序盤の道しるべ") < 0) fail.push("エングラム辞典の『序盤の道しるべ』が出ていない");
  // 素材・効果の表示
  const edesc = (EG.match(/class="edesc"/g) || []).length;
  const mcell = (EG.match(/class="mats"/g) || []).length;
  const noJa = ENG.filter(e => !e.desc).length;
  const noMats = ENG.filter(e => !e.mats || !e.mats.length).length;
  console.log("エングラムの効果欄: " + edesc + " 行・素材欄: " + mcell + " 行（日本語説明無し " + noJa + " 件・素材無し " + noMats + " 件）");
  if (edesc < 50) fail.push("エングラムの効果・説明が表示されていない: " + edesc);
  if (mcell < 50) fail.push("エングラムの必要な素材が表示されていない: " + mcell);
  if (noJa) fail.push("日本語説明が無いエングラムがある: " + noJa + "件");
  if (noMats > 15) fail.push("素材が無いエングラムが多い: " + noMats + "件");
  engFilter = { lv:"", src:"", q:"金属インゴット" }; render();
  if ((document.querySelector("#main").innerHTML.match(/<tr>/g) || []).length < 10)
    fail.push("素材名（金属インゴット）での検索が効いていない");
  engFilter = { lv:"1-20", src:"", q:"" }; render();
  const EG2 = document.querySelector("#main").innerHTML;
  if ((EG2.match(/<tr>/g) || []).length >= rows) fail.push("レベル帯の絞り込みが効いていない");
  engFilter = { lv:"", src:"", q:"" };
  // 左メニューのエングラム一覧
  buildNav();
  const NV0 = document.querySelector("#nav").innerHTML;
  const navEng = (NV0.match(/data-engnav/g) || []).length;
  console.log("左メニューのエングラム項目: " + navEng + " 個");
  if (navEng < 10) fail.push("左メニューのエングラム一覧が足りない: " + navEng);
  if (NV0.indexOf("エングラム一覧") < 0) fail.push("左メニューに「エングラム一覧」の見出しが無い");

  // ホームの導線
  view = "home"; render();
  const HM = document.querySelector("#main").innerHTML;
  ["hm-task","hm-now","hm-list","hm-art","hm-res","hm-eng","hm-dex","hm-goal","hm-data",
   "data-resgo","data-enggo","data-dexgo"].forEach(k => {
    if (HM.indexOf(k) < 0) fail.push("ホームに " + k + " が無い");
  });
  if (HM.indexOf("エングラムから探す") < 0) fail.push("ホームのエングラム索引が無い");
  if (HM.indexOf("data-dexrec") < 0) fail.push("ホームにおすすめ度の入口が無い");
  if (HM.indexOf("data-guidego") < 0) fail.push("ホームから便利恐竜リストへの入口が無い");
  if (HM.indexOf("生き物から探す") < 0) fail.push("ホームの生き物索引が無い");
  if (HM.indexOf("2026-09-30") < 0) fail.push("ホームにUE5.8の注意が出ていない");

  // ナビのグループ分け
  buildNav();
  const NV = document.querySelector("#nav").innerHTML;
  ["まず読む","調べる","マップ（","サーバーを動かす人向け"].forEach(k => {
    if (NV.indexOf(k) < 0) fail.push("ナビに見出し「" + k + "」が無い");
  });

  // 図鑑の名前フィルタ
  dexFilter = { tag:"", map:"", q:"レックス" }; view = "dex"; render();
  const QD = document.querySelector("#main").innerHTML;
  const cards = (QD.match(/class="card"/g) || []).length;
  console.log("図鑑『レックス』で絞り込み: " + cards + " 件");
  if (cards === 0 || cards > 12) fail.push("名前フィルタの結果が不自然: " + cards + "件");
  if (QD.indexOf('id="dexq"') < 0) fail.push("図鑑の絞り込み入力欄が無い");
  dexFilter = { tag:"", map:"", q:"" };

  // ボスのトリビュート表
  view = "the_island"; render();
  const BS = document.querySelector("#main").innerHTML;
  if (BS.indexOf("の必要素材") < 0) fail.push("ボスのトリビュート表が出ていない");
  if (BS.indexOf("クレバーの遺物") < 0) fail.push("トリビュートの中身が描画されていない");
  const tribCount = DATA.maps.reduce((a,m)=>a+m.bosses.filter(b=>b.tribute).length,0);
  console.log("トリビュート付きボス: " + tribCount + " 体");
  if (tribCount < 12) fail.push("トリビュート付きボスが少ない: " + tribCount);
  // ボスの必要アーティファクトの整合（The Island の10種が重複なく割り振られているか）
  const isl = DATA.maps.find(m=>m.id==="the_island");
  const used = isl.bosses.map(b=>b.artifacts).join(" ");
  ["Clever","Hunter","Massive","Brute","Devourer","Pack","Cunning","Immune","Skylord","Strong"].forEach(a=>{
    const c = (used.match(new RegExp(a,"g"))||[]).length;
    if (c !== 1) fail.push("The Island のアーティファクト割り当てが不正: " + a + " が " + c + "回");
  });

  // マップページの充実度（進行ルート・注意・洞窟・拠点）
  let thin = [];
  DATA.maps.forEach(m => {
    view = m.id; render();
    const H = document.querySelector("#main").innerHTML;
    if (!m.route || m.route.length < 3) thin.push(m.id + "：進行ルート不足");
    if (!m.hazards || m.hazards.length < 3) thin.push(m.id + "：注意・ギミック不足");
    if (H.indexOf('id="s-route"') < 0) thin.push(m.id + "：ルート欄が描画されていない");
    if (H.indexOf('id="s-haz"') < 0) thin.push(m.id + "：注意欄が描画されていない");
  });
  console.log("マップ別の洞窟/拠点/資源: " + DATA.maps.map(m =>
    m.id.slice(0,6) + " " + m.caves.length + "/" + m.bases.length + "/" + m.resources.length).join(" | "));
  if (thin.length) fail.push(...thin);

  // ページ間の導線（マップ→資源マップ／マップ→図鑑／ガイド→各ページ）
  view = "the_island"; render();
  const MP = document.querySelector("#main").innerHTML;
  if ((MP.match(/class="goresmap"/g) || []).length < 2) fail.push("マップページに資源マップへの導線が足りない");
  if (MP.indexOf('class="godex"') < 0) fail.push("マップページに図鑑への導線が無い");
  view = "guide"; render();
  const GD2 = document.querySelector("#main").innerHTML;
  if (GD2.indexOf('class="godex"') < 0 || GD2.indexOf('class="goresmap"') < 0)
    fail.push("初心者ガイドから図鑑／資源マップへの導線が無い");

  // 資源索引からの1資源表示（クラッシュしないこと）
  resSolo = "硫黄"; view = "resmap"; render(); resSolo = null;

  ["金属","黒曜石","硫黄","ワイバーン","エングラム","SpyGlass","麻酔矢","ビールジャー"].forEach(q => {
    document.querySelector("#q").value = q; render();
    if (document.querySelector("#main").innerHTML.indexOf("該当なし") >= 0) fail.push("検索ヒット無し: " + q);
  });
  document.querySelector("#q").value = "";

  if (fail.length) { console.log("NG:"); fail.forEach(f => console.log("  - " + f)); process.exit(1); }
  console.log("ALL OK");
})();
`;
vm.createContext(ctx);
vm.runInContext(src + test, ctx);
