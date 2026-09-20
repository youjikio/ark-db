// マップ別の出現生物一覧をつくる（2つの情報源を統合）
//   ①「<マップ名> SVG spawning maps」カテゴリのファイル名（旧マップに強い）→ tools/spawn_raw.json
//   ② 各生物ページの Infobox の dlc 欄＝出現マップ一覧（新マップ・新生物に強い）→ data/creature_index.json
//   使い方: node tools/build_spawns.js
// 出力: data/ark_spawns.json
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, "spawn_raw.json"), "utf8"));
const index = JSON.parse(fs.readFileSync(path.join(root, "data", "creature_index.json"), "utf8")).creatures;

// 当DBのマップID → Wiki上のマップ名
const MAP_NAME = {
  the_island: "The Island", scorched_earth: "Scorched Earth", the_center: "The Center",
  aberration: "Aberration", extinction: "Extinction", ragnarok: "Ragnarok",
  valguero: "Valguero", genesis1: "Genesis: Part 1",
  astraeos_mod: "Astraeos", astraeos_dlc: "Astraeos", lost_colony: "Lost Colony"
};
// 有料パック（マップ欄にパック名が入っている＝そのパックの生き物）
const PACKS = ["Fantastic Tames", "ARK: Bob's Tall Tales", "Bob's True Tales", "Tides of Fortune",
               "Aquatica", "Dragontopia", "Club ARK"];
// Infoboxにパック名が書かれていない生き物を手動で補う（所属パックは公式WikiのDLC一覧より）
const PACK_MEMBERS = {
  "Pyromane":"Fantastic Tames", "Dreadmare":"Fantastic Tames", "Elderclaw":"Fantastic Tames",
  "Burrowbuck":"Fantastic Tames", "Cerberax":"Fantastic Tames", "Enigmasaur":"Fantastic Tames",
  "Drakeling":"Fantastic Tames（Drakelings）",
  "Oasisaur":"Bob's Tall Tales（Frontier Showdown）",
  "Cosmo":"Bob's Tall Tales（Steampunk Ascent）", "Sir-5rM8":"Bob's Tall Tales（Steampunk Ascent）",
  "Armadoggo":"Bob's Tall Tales（Wasteland War）",
  "Tidepup":"Tides of Fortune", "Parrot":"Tides of Fortune", "Pirate":"Tides of Fortune",
  "Lumina":"Dragontopia", "Umbra":"Dragontopia", "Gargantar":"Dragontopia"
};

// --- 日本語名（ベース名） -------------------------------------------------
const JA = {
  "Achatina":"アキャティナ（カタツムリ）","Allosaurus":"アロサウルス","Ammonite":"アンモナイト",
  "Anglerfish":"アンコウ","Ankylosaurus":"アンキロサウルス","Araneo":"アラネオ（蜘蛛）",
  "Archaeopteryx":"始祖鳥","Argentavis":"アルゲンタヴィス","Arthropluera":"アースロプレウラ（ムカデ）",
  "Baryonyx":"バリオニクス","Basilisk":"バジリスク","Basilosaurus":"バシロサウルス",
  "Beelzebufo":"ベルゼブフォ（カエル）","Brontosaurus":"ブロントサウルス","Broodmother Lysrix":"ブルードマザー（ボス）",
  "Bulbdog":"バルブドッグ","Carbonemys":"カルボネミス（カメ）","Carcharodontosaurus":"カルカロドントサウルス",
  "Carnotaurus":"カルノタウルス","Castoroides":"カストロイデス（ビーバー）","Chalicotherium":"カリコテリウム",
  "Chalk Golem":"チョークゴーレム","Cnidaria":"クラゲ","Coelacanth":"シーラカンス","Compy":"コンプソグナトゥス",
  "Daeodon":"ダエオドン（イノシシ）","Deathworm":"デスワーム","Defense Unit":"ディフェンスユニット",
  "Deinonychus":"ディノニクス","Dilophosaur":"ディロフォサウルス","Dimetrodon":"ディメトロドン",
  "Dimorphodon":"ディモルフォドン","Diplocaulus":"ディプロカウルス","Diplodocus":"ディプロドクス",
  "Dire Bear":"ダイアベア","Dire Polar Bear":"ダイアポーラーベア","Direwolf":"ダイアウルフ","Dodo":"ドードー",
  "Doedicurus":"ドエディクルス","Dung Beetle":"フンコロガシ","Dunkleosteus":"ダンクルオステウス",
  "Electrophorus":"エレクトロフォルス（電気ウナギ）","Enforcer":"エンフォーサー","Equus":"エクウス（馬）",
  "Eurypterid":"ウミサソリ","Featherlight":"フェザーライト","Fire Wyvern":"ファイアワイバーン",
  "Gacha":"ガチャ","Gallimimus":"ガリミムス","Gasbags":"ガスバッグ","Giant Bee":"ジャイアントビー（蜂）",
  "Giganotosaurus":"ギガノトサウルス","Gigantopithecus":"ギガントピテクス","Glowbug":"グローバグ",
  "Glowtail":"グロウテイル","Griffin":"グリフィン","Hesperornis":"ヘスペロルニス","Hyaenodon":"ハイエノドン",
  "Ice Golem":"アイスゴーレム","Ice Wyvern":"アイスワイバーン","Iceworm Male":"アイスワーム",
  "Ichthyornis":"イクチオルニス","Ichthyosaurus":"イクチオサウルス","Iguanodon":"イグアノドン",
  "Jerboa":"ジェルボア","Kairuku":"カイルク（ペンギン）","Kaprosuchus":"カプロスクス","Karkinos":"カルキノス（カニ）",
  "Kentrosaurus":"ケントロサウルス","Lamprey":"ヤツメウナギ","Leech":"ヒル","Leedsichthys":"リードシクティス",
  "Lightning Wyvern":"ライトニングワイバーン","Liopleurodon":"リオプレウロドン","Lymantria":"リマントリア（蛾）",
  "Lystrosaurus":"リストロサウルス","Mammoth":"マンモス","Managarmr":"マナガルム","Manta":"マンタ",
  "Mantis":"マンティス","Megalania":"メガラニア","Megaloceros":"メガロケロス（鹿）","Megalodon":"メガロドン",
  "Megalosaurus":"メガロサウルス","Meganeura":"メガニューラ（トンボ）","Megatherium":"メガテリウム（ナマケモノ）",
  "Mesopithecus":"メソピテクス（猿）","Microraptor":"ミクロラプトル","Morellatops":"モレラトプス（ラクダ）",
  "Mosasaurus":"モササウルス","Mosasaur":"モササウルス","Moschops":"モスコプス","Nameless":"ナメーレス",
  "Onyc":"オニク（コウモリ）","Otter":"カワウソ","Oviraptor":"オヴィラプトル","Ovis":"オヴィス（羊）",
  "Pachy":"パキケファロサウルス","Pachyrhinosaurus":"パキリノサウルス","Paraceratherium":"パラケラテリウム",
  "Parasaur":"パラサウロロフス","Pegomastax":"ペゴマスタクス","Pelagornis":"ペラゴルニス","Phiomia":"フィオミア",
  "Phoenix":"フェニックス","Piranha":"ピラニア","Plesiosaur":"プレシオサウルス","Poison Wyvern":"ポイズンワイバーン",
  "Polar Bear":"ポーラーベア","Polar Purlovia":"ポーラープルロヴィア","Procoptodon":"プロコプトドン（カンガルー）",
  "Pteranodon":"プテラノドン","Pulmonoscorpius":"サソリ","Purlovia":"プルロヴィア","Quetzal":"ケツァルコアトルス",
  "Raptor":"ラプター","Ravager":"ラベジャー","Reaper Queen":"リーパークイーン","Reaper King":"リーパーキング",
  "Reaper":"リーパー","Rex":"ティラノサウルス（レックス）","T-Rex":"ティラノサウルス（レックス）",
  "Rock Drake":"ロックドレイク","Rock Elemental":"ロックエレメンタル","Roll Rat":"ロールラット",
  "Rubble Golem":"ラブルゴーレム","Sabertooth":"サーベルタイガー","Sabertooth Salmon":"サーベルサーモン",
  "Sarco":"サルコスクス","Scout":"スカウト","Seeker":"シーカー","Shinehorn":"シャインホーン",
  "Snow Owl":"スノーオウル","Spino":"スピノサウルス","Stegosaurus":"ステゴサウルス",
  "Surface Reaper King":"サーフェスリーパーキング","Tapejara":"タペヤラ","Terror Bird":"テラーバード",
  "Therizinosaur":"テリジノサウルス","Thorny Dragon":"ソーニードラゴン","Thylacoleo":"ティラコレオ",
  "Titanoboa":"ティタノボア","Titanomyrma":"ティタノミルマ（アリ）","Titanosaur":"ティタノサウルス",
  "Triceratops":"トリケラトプス","Trilobite":"三葉虫","Troodon":"トロオドン","Tusoteuthis":"トゥソテウティス（イカ）",
  "Unicorn":"ユニコーン","Velonasaur":"ヴェロナサウルス","Vulture":"ハゲワシ","Water Jug Bug":"ジャグバグ（水）",
  "Jug Bug":"ジャグバグ","Oil Jug Bug":"ジャグバグ（油）",
  "Woolly Rhino":"ウーリーライノ（サイ）","Wyvern":"ワイバーン","Yeti":"イエティ","Yutyrannus":"ユティラヌス",
  "Enraged Corrupted Rex":"激昂コラプトレックス","Enraged Triceratops":"激昂トリケラトプス",
  "Stego":"ステゴサウルス","Trike":"トリケラトプス","Bronto":"ブロントサウルス",
  // --- ASAで追加された生物 ---
  "Ceratosaurus":"ケラトサウルス","Gigantoraptor":"ギガントラプトル","Deinosuchus":"デイノスクス",
  "Archelon":"アーケロン","Xiphactinus":"クシファクティヌス","Helicoprion":"ヘリコプリオン",
  "Acrocanthosaurus":"アクロカントサウルス","Scorched Acrocanthosaurus":"アクロカントサウルス（灼熱）",
  "Deinotherium":"デイノテリウム","Concavenator":"コンカベナトル","Fasolasuchus":"ファソラスクス",
  "Oasisaur":"オアシサウル","Yi Ling":"イーリン","Cosmo":"コスモ","Sir-5rM8":"SIR-5rM8",
  "Shastasaurus":"シャスタサウルス","Dreadnoughtus":"ドレッドノータス","Armadoggo":"アルマドッゴ",
  "Bison":"バイソン","Megaraptor":"メガラプトル","Elderclaw":"エルダークロー","Palaeoctopus":"パラエオクトパス",
  "Burrowbuck":"バローバック","Cerberax":"ケルベラックス","Enigmasaur":"エニグマサウル",
  "Pyromane":"ピュロメイン","Dreadmare":"ドレッドメア","Tidepup":"タイドパップ","Parrot":"オウム",
  "Rhyniognatha":"リニオグナタ","Maewing":"メイウィング","Sinomacrops":"シノマクロプス",
  "Dinopithecus":"ディノピテクス","Desmodus":"デスモダス","Fjordhawk":"フィヨルドホーク",
  "Shadowmane":"シャドウメイン","Noglin":"ノグリン","Astrodelphis":"アストロデルフィス",
  "Voidwyrm":"ヴォイドワーム","Andrewsarchus":"アンドリューサルクス","Amargasaurus":"アマルガサウルス",
  "Tropeognathus":"トロペオグナトゥス","Dakosaurus":"ダコサウルス","Tiktaalik":"ティクターリク",
  "Monodon":"モノドン（イッカク）","Ocepechelon":"オケペケロン","Homarus":"ホマルス（ロブスター）",
  "Malleocephalus":"マレオケファルス","Seahorse":"タツノオトシゴ","Onchopristis":"オンコプリスティス",
  "Takifugu":"フグ","Thunnus":"マグロ","Tridacna":"シャコガイ","Istiophorus":"バショウカジキ",
  "Chrysaora":"クリサオラ（クラゲ）","Qarmoutus":"カルモウタス","Stereolepis":"イシナギ",
  "Pygocentrus":"ピゴケントルス（ピラニア）","Cymathoa":"キマトア","Mantis Shrimp":"シャコ",
  "Mudpuppy":"マッドパピー","Kathreptis":"カトレプティス","Vulcanite":"ヴァルカナイト",
  "Shark":"サメ","Squid":"イカ","Insect Swarm":"虫の群れ","Drakeling":"ドレイクリング",
  "Lumina":"ルミナ","Umbra":"ウンブラ","Gargantar":"ガーガンター","Flovis":"フロヴィス",
  // --- Genesis / 各種 ---
  "Bloodstalker":"ブラッドストーカー","Ferox":"フェロックス","Magmasaur":"マグマサウルス",
  "Megachelon":"メガケロン","Astrocetus":"アストロケタス","Attack Drone":"アタックドローン",
  "Hover Skiff":"ホバースキッフ","Mek":"メック","Exo-Mek":"エクソメック","Macrophage":"マクロファージ",
  // --- Astraeos ---
  "Maeguana":"マエグアナ","Grand Tortugar":"グランド・トルトゥガー","Boaratos":"ボアラトス",
  "Thodes":"トーデス（キュクロプス）","Natrix":"ナトリクス（ゴルゴン）","Hydraskos":"ヒュドラスコス",
  "Minotarchos":"ミノタルコス","Abyssalus":"アビュッサルス","Shallocis":"シャロキス",
  "Colossus":"コロッソス","Kroaratos":"クロアラトス","Thanatos":"タナトス","Vulcanithys":"ウルカニテュス",
  "Erymanthian & Kalydonios":"エリュマントス＆カリュドニオス","Minotaur":"ミノタウロス",
  // --- Lost Colony ---
  "Veilwyn":"ヴェイルウィン","Malwyn":"マルウィン","Solwyn":"ソルウィン","Ossidon":"オシドン",
  "Gloon":"グルーン","Aureliax":"アウレリアクス","Gigadesmodus":"ギガデスモダス",
  "Cryolophosaurus":"クリオロフォサウルス","Revenant":"レヴナント","Thrall":"スラル",
  "Lost King":"ロストキング（ボス）","Lost Queen":"ロストクイーン（ボス）","Neophyte":"ネオファイト",
  "Kirayli":"キライリ","Mouser":"マウサー","Riftcrawler":"リフトクローラー","Riftwalker":"リフトウォーカー",
  "Skeleton":"スケルトン","Summoner":"サモナー","Vulpite":"ヴァルパイト",
  // --- ボス ---
  "Megapithecus":"メガピテクス（ボス）","Dragon":"ドラゴン（ボス）","Overseer":"オーバーシーア（ボス）",
  "Rockwell":"ロックウェル（ボス）","Rockwell Prime":"ロックウェル・プライム（ボス）",
  "Manticore":"マンティコア（ボス）","King Titan":"キングタイタン（ボス）",
  "Forest Titan":"フォレストタイタン","Ice Titan":"アイスタイタン","Desert Titan":"デザートタイタン",
  "Desert Titan Flock":"デザートタイタンの群れ","Moeder, Master of the Ocean":"モエダー（海のボス）",
  "Corrupted Master Controller":"コラプト・マスター・コントローラー（ボス）",
  "Dinopithecus King":"ディノピテクス・キング（ボス）","Crystal Wyvern Queen":"クリスタルワイバーン・クイーン（ボス）",
  "Nunatak":"ヌナタク（ボス）","Grendel":"グレンデル（ボス）","Iceworm Queen":"アイスワーム・クイーン",
  "Lava Elemental":"ラヴァエレメンタル","DodoRex":"ドードーレックス","Dodo Wyvern":"ドードーワイバーン",
  "Forest Wyvern":"フォレストワイバーン","Elemental Reaper King":"エレメンタル・リーパーキング",
  "Subterranean Reaper King":"地下のリーパーキング","Pulmonoscorpius Monarch":"サソリの女王",
  "Salmon":"サーモン","Avatar":"アバター","Master Controller":"マスター・コントローラー",
  "Cat":"ネコ","Super Turkey":"スーパーターキー","Turkey":"ターキー","Zomdodo":"ゾンビドードー",
  "Parakeet Fish School":"インコ魚の群れ","Insect Swarm":"虫の群れ","Shark":"サメ","Squid":"イカ",
  "Mega Mek":"メガメック","Reaper Prince":"リーパープリンス","Skeleton":"スケルトン",
  "Skeleton Piercer":"スケルトン（射手）","Skeleton Snarer":"スケルトン（捕縛）","Skeleton Warden":"スケルトン（守護）",
  "Thrall":"スラル","Revenant":"レヴナント","Neophyte":"ネオファイト","Kirayli":"キライリ",
  "Jerboa Elf":"エルフのジェルボア","Reindeer":"トナカイ","GachaClaus":"ガチャクロース",
  "Dire Polar Bear":"ダイアポーラーベア","Polar Purlovia":"ポーラープルロヴィア"
};

// --- 分類 ------------------------------------------------------------------
const FLY = new Set(["Pteranodon","Argentavis","Quetzal","Tapejara","Griffin","Wyvern","Fire Wyvern","Poison Wyvern",
  "Lightning Wyvern","Ice Wyvern","Forest Wyvern","Dodo Wyvern","Snow Owl","Pelagornis","Ichthyornis","Archaeopteryx",
  "Microraptor","Dimorphodon","Onyc","Vulture","Lymantria","Meganeura","Managarmr","Rock Drake","Featherlight",
  "Phoenix","Giant Bee","Glowbug","Seeker","Gasbags","Tek Quetzal","Rhyniognatha","Sinomacrops","Desmodus",
  "Fjordhawk","Tropeognathus","Astrodelphis","Voidwyrm","Drakeling","Lumina","Umbra","Parrot","Maewing",
  "Attack Drone","Hover Skiff","Cerberax","Gargantar"]);
const SEA = new Set(["Megalodon","Mosasaurus","Mosasaur","Plesiosaur","Ichthyosaurus","Tusoteuthis","Basilosaurus",
  "Manta","Dunkleosteus","Anglerfish","Coelacanth","Piranha","Sabertooth Salmon","Trilobite","Ammonite","Eurypterid",
  "Leedsichthys","Cnidaria","Electrophorus","Liopleurodon","Hesperornis","Diplocaulus","Lamprey","Salmon",
  "Archelon","Xiphactinus","Helicoprion","Shastasaurus","Dakosaurus","Monodon","Ocepechelon","Homarus",
  "Malleocephalus","Seahorse","Onchopristis","Takifugu","Thunnus","Tridacna","Istiophorus","Chrysaora",
  "Qarmoutus","Stereolepis","Pygocentrus","Cymathoa","Mantis Shrimp","Mudpuppy","Tiktaalik","Kathreptis",
  "Megachelon","Palaeoctopus","Shark","Squid","Tidepup","Abyssalus","Shallocis"]);
const ROBOT = new Set(["Enforcer","Scout","Defense Unit","Mek","Exo-Mek","Attack Drone","Hover Skiff"]);
const BOSSY = /(Broodmother|Megapithecus|^Dragon$|Overseer|Rockwell|Manticore|(Forest|Ice|Desert|King) Titan|Titanosaur|Reaper Queen|Reaper King|Golem|Deathworm|Iceworm|Yeti|Basilisk|Karkinos|Nameless|Rock Elemental|Moeder|Master Controller|Lost King|Lost Queen|Thodes|Natrix|Hydraskos|Minotarchos|Colossus|Kroaratos|Thanatos|Vulcanithys|Erymanthian|Nunatak|Grendel|Dinopithecus King|Crystal Wyvern Queen|DodoRex|Lava Elemental|Monarch)/;
const EVENT = /(Ghost|Skeletal|Bunny|Zombie|Super Turkey|Party |Valentines|Love |Reindeer|Elf|Santa|GachaClaus|Eerie)/;
const PREFIX = /^(Aberrant|Corrupted|Alpha|Beta|Gamma|Tek|Enraged Corrupted|Enraged|Brute|Malfunctioned|X-|R-|VR |Summoned |Injured |Subterranean |Elemental |Surface )\s*/;

function ja(name){
  // イベント系（幽霊・スケルトン・バニーなど）も日本語にする
  const jaOnly = s => ja(s).replace(/（[^（）]*）$/, "");   // 和名部分だけ取り出す
  const gm = name.match(/^(.+?)\s+Ghost$/);
  if (gm) return jaOnly(gm[1]) + "の幽霊（" + name + "）";
  const EV = [[/^Skeletal\s+/, "スケルトン"], [/^Zombie\s+/, "ゾンビ"], [/^Bunny\s+/, "バニー"],
              [/^Party\s+/, "パーティー"], [/^Valentines\s+/, "バレンタイン"], [/^Love\s+/, "ラブ"],
              [/^Eerie\s+/, "不気味な"], [/^Spirit\s+/, "スピリット"], [/^Summer\s+/, "サマー"],
              [/^Spring\s+/, "スプリング"], [/^Autumn\s+/, "オータム"], [/^Winter\s+/, "ウィンター"]];
  for (const [re, head] of EV) {
    if (re.test(name)) return head + jaOnly(name.replace(re, "")) + "（" + name + "）";
  }
  // 接頭辞は重なることがある（例: Brute X-Rex）ので、はがしながら和名を組み立てる
  const HEADS = [[/^Aberrant\s+/,"アベラント"],[/^Corrupted\s+/,"コラプト"],[/^Alpha\s+/,"アルファ"],
    [/^Beta\s+/,"ベータ"],[/^Gamma\s+/,"ガンマ"],[/^Tek\s+/,"テック"],[/^Brute\s+/,"ブルート"],
    [/^Malfunctioned\s+/,"故障した"],[/^X-/,"X-"],[/^R-/,"R-"],[/^VR\s+/,"VR"],
    [/^Enraged\s+/,"激昂"],[/^Surface\s+/,"地表の"],[/^Subterranean\s+/,"地下の"],
    [/^Elemental\s+/,"エレメンタル"],[/^Injured\s+/,"傷ついた"],[/^Summoned\s+/,"召喚された"],
    [/^Golden Striped\s+/,"金縞の"],[/^Rare\s+/,"レア"],[/^Lightning\s+/,"ライトニング"],
    [/^Hulking\s+/,"巨大"],[/^Bloated\s+/,"膨れた"],[/^Astral\s+/,"アストラル"],
    [/^Abyssal\s+/,"アビサル"],[/^Succumbed\s+/,"堕ちた"],[/^Experimental\s+/,"実験体"]];
  let rest = name, head = "";
  for (let i = 0; i < 3; i++) {
    const hit = HEADS.find(([re]) => re.test(rest));
    if (!hit) break;
    head += hit[1]; rest = rest.replace(hit[0], "");
  }
  let tail = "";
  const lg = rest.match(/^(.+?)\s*\((Large|Small)\)$/);
  if (lg) { rest = lg[1]; tail = lg[2] === "Large" ? "（大）" : "（小）"; }
  const j = JA[name] || JA[rest] || JA[rest.replace(/^(Polar|Dire)\s+/, "")] || null;
  return (j ? head + j + tail : name) + "（" + name + "）";
}
function packOf(name){
  const base = name.replace(PREFIX, "");
  if (PACK_MEMBERS[name]) return PACK_MEMBERS[name];
  if (PACK_MEMBERS[base]) return PACK_MEMBERS[base];
  const maps = (index[name] && index[name].maps) || "";
  return PACKS.find(p => maps.indexOf(p) >= 0) || null;
}
function bucket(name){
  if (EVENT.test(name)) return "event";
  if (packOf(name)) return "pack";
  if (/^Alpha /.test(name)) return "alpha";
  if (/^Corrupted |^Enraged Corrupted /.test(name)) return "corrupted";
  if (ROBOT.has(name)) return "robot";
  const base = name.replace(PREFIX, "");
  if (BOSSY.test(name) && !FLY.has(base) && !SEA.has(base)) return "boss";
  if (FLY.has(base)) return "air";
  if (SEA.has(base)) return "sea";
  return "land";
}

const LABEL = { land:"陸上", air:"空・飛行", sea:"水中", alpha:"アルファ種（強化個体）",
  corrupted:"コラプト（テイム不可）", robot:"機械", boss:"ボス・特殊・大型脅威",
  pack:"有料パック・DLC由来", event:"イベント限定" };
const ORDER = ["land","air","sea","pack","alpha","corrupted","robot","boss","event"];

const out = { _meta: {
  source: "①ARK公式Wikiの『<マップ名> SVG spawning maps』カテゴリ ②各生物ページのInfobox（出現マップ欄）の2つを統合",
  note: "①は旧マップの網羅性が高く、②は新マップ・新生物に強い。両方の和集合。アベラント種・アルファ種・イベント限定・ボス・有料パック由来も含む。",
  generated: new Date().toISOString().slice(0, 10)
}, maps: {} };

Object.keys(MAP_NAME).forEach(id => {
  const wikiName = MAP_NAME[id];
  const set = new Set(raw[id] || []);
  Object.keys(index).forEach(n => {
    const maps = (index[n].maps || "").split(",").map(s => s.trim());
    if (maps.indexOf(wikiName) >= 0) set.add(n);
  });
  const names = [...set];
  const groups = {};
  names.forEach(n => {
    const b = bucket(n);
    const p = b === "pack" ? packOf(n) : null;
    (groups[b] = groups[b] || []).push(ja(n) + (p ? "〔" + p + "〕" : ""));
  });
  Object.values(groups).forEach(a => a.sort((x, y) => x.localeCompare(y, "ja")));
  const ordered = {};
  ORDER.forEach(k => { if (groups[k]) ordered[LABEL[k]] = groups[k]; });
  out.maps[id] = { count: names.length, groups: ordered };
});

// 無料MOD版Astraeosは縮小版なので注意書きを添える
if (out.maps.astraeos_mod) out.maps.astraeos_mod.warn =
  "この一覧は公式（有料DLC版）Astraeos のデータです。無料MOD版は地表約30%・地下0%の縮小版なので、ここに載っている生き物が全部いるとは限りません。";

const dst = path.join(root, "data", "ark_spawns.json");
fs.writeFileSync(dst, JSON.stringify(out, null, 1), "utf8");
console.log("書き出し:", dst);
Object.entries(out.maps).forEach(([id, v]) => {
  console.log((id + "              ").slice(0, 16), v.count + "種",
    Object.entries(v.groups).map(([k, a]) => k + ":" + a.length).join(" / "));
});
