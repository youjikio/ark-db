// 図鑑や解説に出てくるアイテム名 → ARK公式Wikiのページ を対応づける。
// 実在しないページは自動で落とすので、リンク切れが出ない。
//   使い方: node tools/build_item_links.js  →  data/ark_items.json
const fs = require("fs"), path = require("path"), https = require("https");
const UA = "ARKPersonalRefTool/1.0 (personal reference tool)";

const MAP = {
  "麻酔矢":"Tranquilizer Arrow","麻酔薬":"Narcotic","ナルコベリー":"Narcoberry","腐肉":"Spoiled Meat",
  "ボーラ":"Bola","こん棒":"Wooden Club","パチンコ":"Slingshot","クロスボウ":"Crossbow",
  "臼":"Mortar and Pestle","生肉":"Raw Meat","生魚":"Raw Fish Meat","メジョベリー":"Mejoberry",
  "キブル":"Kibble","ベーシックキブル":"Basic Kibble","レギュラーキブル":"Regular Kibble",
  "スペリオルキブル":"Superior Kibble","エクセプショナルキブル":"Exceptional Kibble",
  "エクストラオーディナリーキブル":"Extraordinary Kibble",
  "クライオポッド":"Cryopod","餌箱":"Feeding Trough","回復薬":"Medical Brew","覚醒剤":"Stimulant",
  "スキューバ":"SCUBA Tank","ハザードスーツ":"Hazard Suit Armor","ワイバーンミルク":"Wyvern Milk",
  "ビールジャー":"Beer Jar","醸造樽":"Beer Barrel","ロックキャロット":"Rockarrot",
  "スイートベジケーキ":"Sweet Vegetable Cake","デスワームの角":"Deathworm Horn","受精卵":"Fertilized Egg",
  "血液パック":"Blood Pack","エレメント":"Element","たき火":"Campfire","エアコン":"Air Conditioner",
  "寝袋":"Sleeping Bag","ベッド":"Simple Bed","保存庫":"Preserving Bin","保存塩":"Preserving Salt",
  "精錬炉":"Refining Forge","鍛冶場":"Smithy","製作台":"Fabricator","化学台":"Chemistry Bench",
  "発電機":"Electrical Generator","冷蔵庫":"Refrigerator","作物畑":"Crop Plot",
  "グライダースーツ":"Glider Suit Skin","クライミングピッケル":"Climbing Pick",
  "石の斧":"Stone Hatchet","石のツルハシ":"Stone Pick","松明":"Torch","槍":"Spear",
  "保管箱":"Storage Box","調理鍋":"Cooking Pot","マインドワイプ・トニック":"Mindwipe Tonic",
  "有機ポリマー":"Organic Polymer","セメント":"Cementing Paste","黒真珠":"Black Pearl",
  "シリカ真珠":"Silica Pearls","金属インゴット":"Metal Ingot","火打石":"Flint","黒曜石":"Obsidian",
  "水晶":"Crystal","硫黄":"Sulfur","石油":"Oil","毛皮":"Fur Armor","キチン":"Chitin",
  "希少花":"Rare Flower","希少キノコ":"Rare Mushroom","ハチミツ":"Giant Bee Honey",
  "プライムミート":"Raw Prime Meat","サボテンサップ":"Cactus Sap","ウォータージャー":"Water Jar",
  "ガスマスク":"Gas Mask","ガソリン":"Gasoline","火薬":"Gunpowder","ライフル":"Longneck Rifle",
  "弓":"Bow","サドル":"Saddle","毒":"Narcotic"
};

function get(url){ return new Promise((res,rej)=>{ https.get(url,{headers:{"User-Agent":UA}},r=>{
  let b=""; r.on("data",c=>b+=c); r.on("end",()=>res(b)); }).on("error",rej); }); }

(async () => {
  const titles = [...new Set(Object.values(MAP))];
  const ok = new Set();
  for (let i=0;i<titles.length;i+=45){
    const batch=titles.slice(i,i+45);
    const body=await get("https://ark.wiki.gg/api.php?action=query&format=json&titles="+encodeURIComponent(batch.join("|")));
    const d=JSON.parse(body);
    if(d.error){ console.error("APIエラー:",d.error.info); break; }
    Object.values(d.query.pages).forEach(p=>{ if(p.missing===undefined) ok.add(p.title); });
  }
  const out={}, missing=[];
  Object.entries(MAP).forEach(([ja,en])=>{ if(ok.has(en)) out[ja]="https://ark.wiki.gg/wiki/"+encodeURIComponent(en.replace(/ /g,"_")); else missing.push(ja+"→"+en); });
  fs.writeFileSync(path.join(__dirname,"..","data","ark_items.json"),
    JSON.stringify({_meta:{note:"アイテム名→公式Wikiのページ。存在するページだけ残してある",generated:new Date().toISOString().slice(0,10)},items:out},null,1),"utf8");
  console.log("リンク化できるアイテム:",Object.keys(out).length,"件");
  if(missing.length) console.log("ページが見つからず除外:",missing.join(", "));
})();
