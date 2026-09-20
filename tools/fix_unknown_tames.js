// 「要確認」だったテイム方法を、公式Wikiの Taming セクションの内容で確定させる。
//   使い方: node tools/fix_unknown_tames.js
const fs = require("fs"), path = require("path");
const file = path.join(__dirname, "..", "data", "ark_creatures.json");
const doc = JSON.parse(fs.readFileSync(file, "utf8"));
const set = (id, patch) => {
  const c = doc.creatures.find(x => x.id === id);
  if (!c) { console.log("見つからない:", id); return; }
  Object.assign(c, patch); console.log("更新:", c.ja);
};

set("gigantoraptor", { tame:"特殊",
  prep:"**受精卵**（親の気を逸らす囮に投げる）／ギリースーツ（見つかりにくくなる）／赤ちゃんを育てる餌と餌箱／※**成体はテイム不可**",
  tip:"野生の巣で『成体＋赤ちゃん』がいる所を探す。受精卵を投げて親を引き離し、赤ちゃんを確保して育てる。親が生きていないとテイムできない。",
  ability:"赤ちゃん恐竜の刷り込みを肩代わりできる／羽毛の大型ラプター" });

set("elderclaw", { tame:"特殊", food:"雑食",
  prep:"倒すための戦力（成体はテイム不可）／赤ちゃんを育てる餌と餌箱／※〔Fantastic Tames〕の購入が必要",
  tip:"成体はテイムできない。①親を倒して赤ちゃんを確保して育てる ②倒すと入手できる『種』を使う、の2通り。刷り込みにギガントラプトルがいると育ちが良い。",
  ability:"大きな爪の近接攻撃／赤ちゃんから育てる前提の大型枠" });

set("ossidon", { tame:"特殊", ride:true,
  prep:"**麻酔矢**（気絶値50%まで削る）／乗るためのサドル不要／根気（複数回の騎乗が必要）",
  tip:"手順が特殊：麻酔で気絶値50%まで→乗る（最低4回）→右クリックでボーラスを作り、オシドンが撃つ氷柱を規定数キャッチする。",
  ability:"氷柱を飛ばす遠距離攻撃／大型霊長類の近接" });

set("gloon", { tame:"手渡し", ride:false,
  prep:"雑食の餌／**しゃがんで近づく**（浮いている時に気づかれない）／周囲のレヴナントを先に排除",
  tip:"気絶テイム不可。浮遊中に目が光っている間は見つからないようにしゃがみ、寄ってきたレヴナントを片付けてから餌を渡す。",
  ability:"浮遊して移動／粘着系の攻撃" });

set("gigadesmodus", { tame:"卵", ride:true,
  prep:"**ロストキング／ロストクイーンの討伐**（受精卵嚢が手に入る）／孵化と育成の設備",
  tip:"野生には存在しない。ボス討伐の報酬として受精卵嚢を得て、孵化・育成する。参加者それぞれに1個配られ、レベルはランダム。",
  ability:"デスモダスの巨大種。吸血と滑空" });

set("aureliax", { tame:"特殊", ride:true,
  prep:"速い飛行（デスモダスやスノーオウル）／贈り物として渡す餌／**肩乗りペットを外しておく**（テイムが中断される）",
  tip:"卵から育てる方式。高空を飛び続けて着地しないので、速い飛行で近づいて騎乗し、贈り物を繰り返して卵を得る。",
  ability:"高空を飛び続ける東洋龍。範囲ブレス" });

set("dragontopia_dragons", { tame:"特殊",
  prep:"ルミナ＝**銃（ショットガン推奨）で体力20%まで削る**→ミニゲーム3種をクリア／ウンブラ＝**ドレイククロー**＋餌（エクセプショナルキブルや焼いたラムチョップ）でフェーズ制の手渡し",
  tip:"Dragontopia（有料マップ）専用。ルミナは弱らせてから掴まれ、乗ったままミニゲームを3つ突破する。ウンブラは麻酔不要のフェーズ制パッシブ。ガーガンターは資料が少なく要確認。",
  ability:"光（ルミナ）・闇（ウンブラ）・巨獣（ガーガンター）のブレスと飛行" });

fs.writeFileSync(file, JSON.stringify(doc, null, 1), "utf8");
const left = doc.creatures.filter(c => c.tame === "要確認").map(c => c.ja);
console.log("残りの「要確認」:", left.length ? left.join(" / ") : "なし");
