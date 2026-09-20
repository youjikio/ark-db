// エングラム辞典のデータを組み立てる（Wiki由来の本体＋DLC、そこにMOD分を手動で追加）
//   使い方: node tools/build_engrams.js  → data/ark_engrams.json
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const raw = JSON.parse(fs.readFileSync(path.join(root, "data", "ark_engrams_raw.json"), "utf8")).engrams;
const items = JSON.parse(fs.readFileSync(path.join(root, "data", "ark_items.json"), "utf8")).items;
const dex = JSON.parse(fs.readFileSync(path.join(root, "data", "ark_creatures.json"), "utf8")).creatures;

// --- 日本語名のもと ------------------------------------------------------
const EN2JA = {};                                   // 既存のアイテム辞書（79件）を逆引き
Object.entries(items).forEach(([ja, url]) => {
  const en = decodeURIComponent(url.split("/wiki/")[1] || "").replace(/_/g, " ");
  if (en) EN2JA[en] = ja;
});
const DEX_JA = {};                                  // 生き物の和名（サドル名に使う）
dex.forEach(c => { DEX_JA[c.en] = c.ja.replace(/（.*$/, ""); (c.alt||[]).forEach(a => DEX_JA[a] = c.ja.replace(/（.*$/, "")); });
const SADDLE_SHORT = { "Trike":"Triceratops","Ankylo":"Ankylosaurus","Quetz":"Quetzal","Stego":"Stegosaurus",
  "Bronto":"Brontosaurus","Paracer":"Paraceratherium","Mosa":"Mosasaurus","Rex":"Rex","Carno":"Carnotaurus",
  "Spino":"Spino","Thyla":"Thylacoleo","Direbear":"Dire Bear","Sarco":"Sarco","Megalodon":"Megalodon",
  "Argentavis":"Argentavis","Acro":"Acrocanthosaurus","Theri":"Therizinosaur","Giga":"Giganotosaurus" };

// 建材は「素材＋部位」で自動生成できる
const MAT = { "Thatch":"わら","Wood":"木","Stone":"石","Metal":"金属","Adobe":"アドベ","Tek":"テック",
  "Greenhouse":"温室","Glass":"ガラス","Wooden":"木","Stone ":"石" };
const PART = { "Wall":"壁","Ceiling":"天井","Foundation":"土台","Door":"ドア","Doorframe":"ドア枠",
  "Ramp":"傾斜路","Staircase":"階段","Pillar":"支柱","Window":"窓","Windowframe":"窓枠","Railing":"手すり",
  "Hatchframe":"ハッチ枠","Trapdoor":"ハッチ","Fence Foundation":"フェンス土台","Gate":"門","Gateway":"門枠",
  "Dinosaur Gate":"恐竜用の門","Dinosaur Gateway":"恐竜用の門枠","Sign":"看板","Ladder":"はしご",
  "Catwalk":"キャットウォーク","Staircase ":"階段","Cage":"檻","Elevator Track":"エレベーターの軌道",
  "Behemoth Gate":"巨大な門","Behemoth Gateway":"巨大な門枠","Triangle Foundation":"三角の土台",
  "Triangle Ceiling":"三角の天井","Triangle Roof":"三角の屋根","Roof":"屋根","Bridge":"橋" };

const MANUAL_JA = {
  "Stone Pick":"石のツルハシ","Stone Hatchet":"石の斧","Metal Pick":"金属のツルハシ","Metal Hatchet":"金属の斧",
  "Torch":"松明","Campfire":"たき火","Sleeping Bag":"寝袋","Simple Bed":"シンプルなベッド","Bed":"ベッド",
  "Spear":"槍","Pike":"パイク","Bola":"ボーラ","Slingshot":"パチンコ","Wooden Club":"こん棒",
  "Bow":"弓","Crossbow":"クロスボウ","Compound Bow":"コンパウンドボウ","Tranquilizer Arrow":"麻酔矢",
  "Stone Arrow":"石の矢","Tranquilizer Dart":"麻酔ダーツ","Longneck Rifle":"ライフル","Shotgun":"ショットガン",
  "Simple Pistol":"シンプルピストル","Fabricated Pistol":"製造ピストル","Assault Rifle":"アサルトライフル",
  "Rocket Launcher":"ロケットランチャー","Grenade":"手榴弾","C4 Charge":"C4","Improvised Explosive Device":"即席爆弾",
  "Storage Box":"保管箱","Large Storage Box":"大きな保管箱","Vault":"金庫","Preserving Bin":"保存庫",
  "Refrigerator":"冷蔵庫","Mortar And Pestle":"臼（すりつぶし器）","Cooking Pot":"調理鍋",
  "Industrial Cooker":"産業用調理器","Refining Forge":"精錬炉","Industrial Forge":"産業用精錬炉",
  "Smithy":"鍛冶場","Fabricator":"製作台","Chemistry Bench":"化学台","Tek Replicator":"テックレプリケーター",
  "Feeding Trough":"餌箱","Cryopod":"クライオポッド","Cryofridge":"クライオ冷蔵庫",
  "Electrical Generator":"発電機","Electrical Outlet":"電源コンセント","Electrical Cable":"電線",
  "Standing Torch":"立て松明","Wall Torch":"壁掛け松明","Lamppost":"街灯","Omnidirectional Lamppost":"全方向街灯",
  "Air Conditioner":"エアコン","Water Jar":"ウォータージャー","Canteen":"キャンティーン","Waterskin":"水筒",
  "Crop Plot":"作物畑","Small Crop Plot":"小さな作物畑","Medium Crop Plot":"中くらいの作物畑",
  "Large Crop Plot":"大きな作物畑","Compost Bin":"堆肥箱","Water Reservoir":"貯水槽","Water Tank":"水タンク",
  "Cloth Shirt":"布の服","Hide Shirt":"皮の服","Fur Chestpiece":"毛皮の胴当て","Chitin Chestpiece":"キチンの胴当て",
  "Metal Chestpiece":"金属の胴当て","Flak Armor":"フラック装備","Riot Chestpiece":"暴動鎮圧用の胴当て",
  "Hazard Suit Shirt":"ハザードスーツ","SCUBA Tank":"スキューバタンク","Glider Suit Skin":"グライダースーツ",
  "Parachute":"パラシュート","Grappling Hook":"グラップリングフック","Zip-Line Anchor":"ジップラインのアンカー",
  "Climbing Pick":"クライミングピッケル","Spyglass":"望遠鏡","GPS":"GPS","Compass":"コンパス",
  "Radio":"無線機","Taxidermy Base":"剥製の台","Gas Collector":"ガスコレクター","Charge Station":"チャージステーション",
  "Narcotic":"麻酔薬","Stimulant":"覚醒剤","Medical Brew":"回復薬","Energy Brew":"スタミナ薬",
  "Cementing Paste":"セメント","Gunpowder":"火薬","Gasoline":"ガソリン","Metal Ingot":"金属インゴット",
  "Sparkpowder":"火花粉","Charcoal":"木炭","Mindwipe Tonic":"マインドワイプ・トニック",
  "Bug Repellant":"虫除け","Lesser Antidote":"解毒剤","Soap":"石鹸","Propellant":"推進剤",
  "Tent":"テント","Wardrums":"戦太鼓","Bunk Bed":"二段ベッド","Toilet":"トイレ","Beer Barrel":"醸造樽",
  "Cannon":"大砲","Ballista Turret":"バリスタ","Catapult":"カタパルト","Auto Turret":"オートタレット",
  "Heavy Auto Turret":"重オートタレット","Plant Species X Seed":"植物種Xの種","Bear Trap":"トラバサミ",
  "Large Bear Trap":"大きなトラバサミ","Wooden Cage":"木の檻","Wooden Raft":"イカダ","Motorboat":"モーターボート",
  "Note":"メモ","Paintbrush":"絵筆","Training Dummy":"練習用ダミー","Flare Gun":"信号銃",
  "Fishing Rod":"釣り竿","Gravestone":"墓石","Rope Ladder":"縄ばしご","Scissors":"はさみ",
  "Blood Extraction Syringe":"採血器","Painting Canvas":"カンバス","Decor Box":"装飾箱",
  "Single Panel Flag":"旗（1枚）","Multi-Panel Flag":"旗（複数枚）","Hide Sleeping Bag":"皮の寝袋",
  "Hyaenodon Meatpack":"ハイエノドンの肉袋","Tranq Arrow":"麻酔矢","Tranq Spear Bolt":"麻酔スピアボルト",
  "Magnifying Glass":"虫めがね","Whip":"ムチ","Handcuffs":"手錠","Pheromone Dart":"フェロモンダーツ",
  "Net Projectile":"ネット弾","Harpoon Launcher":"ハープーンランチャー","Chainsaw":"チェーンソー",
  "Mining Drill":"削岩機","Cruise Missile":"巡航ミサイル","Metal Sign":"金属の看板",
  "Homing Underwater Mine":"追尾式水中機雷","Tek Generator":"テック発電機","Tek Teleporter":"テック転送装置",
  "Tek Forcefield":"テックフォースフィールド","Tek Cloning Chamber":"テック クローン装置",
  "Tek Bed":"テックベッド","Tek Trough":"テック餌箱","Vacuum Compartment":"真空区画",
  "Pressure Plate":"感圧板","Remote Keypad":"リモートキーパッド","Wind Turbine":"風力発電機",
  "Industrial Grill":"産業用グリル","Industrial Grinder":"産業用粉砕機","Oil Pump":"石油ポンプ",
  "Charge Battery":"チャージバッテリー","Zip-Line Motor Attachment":"ジップライン用モーター",
  "Flamethrower":"火炎放射器","Fabricated Sniper Rifle":"製造スナイパーライフル",
  "Fabricated Shotgun":"製造ショットガン","Pump-Action Shotgun":"ポンプアクション・ショットガン",
  "Tek Rifle":"テックライフル","Tek Sword":"テックソード","Tek Shoulder Cannon":"テック肩部キャノン",
  "Sword":"剣","Shield":"盾","Metal Shield":"金属の盾","Riot Shield":"暴動鎮圧用の盾",
  "Lance":"ランス","Boomerang":"ブーメラン","Sickle":"鎌","Improvised Explosive Device ":"即席爆弾",
  // --- 追加の日本語名（2026-09-20の見直し分） ---
  "Clay":"粘土","Canoe":"カヌー","Fish Net":"魚網","Glow Stick":"発光スティック","Air Jar":"空気瓶",
  "Boot Weights":"重りブーツ","Steam Forge":"蒸気炉","Mini Charge Battery":"小型チャージバッテリー",
  "Unassembled Exo-Mek":"未組立のエクソメック","Taxidermy Tool":"剥製道具","Small Taxidermy Base":"小さな剥製台",
  "Medium Taxidermy Base":"中くらいの剥製台","Large Taxidermy Base":"大きな剥製台",
  "Coffin":"棺","Fancy Sofa":"豪華なソファ","Fancy Armchair":"豪華な肘掛け椅子","Chair":"椅子",
  "Table":"テーブル","Rug":"じゅうたん","Mirror":"鏡","Clock":"時計","Vase":"花瓶","Barrel":"樽",
  "Bunk Bed ":"二段ベッド","Cage":"檻","Ladder":"はしご","Ramp":"傾斜路","Pillar":"支柱",
  "Metal Ladder":"金属のはしご","Wooden Ladder":"木のはしご","Rope Ladder ":"縄ばしご",
  "Gate":"門","Gateway":"門枠","Fence Foundation":"フェンス土台","Trapdoor":"ハッチ",
  "Keypad":"キーパッド","Alarm Trap":"警報トラップ","Tripwire Alarm Trap":"仕掛け線の警報トラップ",
  "Tripwire Narcotic Trap":"仕掛け線の麻酔トラップ","Trophy Wall-Mount":"トロフィーの壁掛け",
  "Artifact Pedestal":"アーティファクトの台座","Stone Fireplace":"石の暖炉","Fur Cap":"毛皮の帽子",
  "Smoke Grenade":"発煙手榴弾","Spear Bolt":"スピアボルト","Metal Sickle":"金属の鎌",
  "Wooden Windowframe":"木の窓枠","Wooden Window":"木の窓","Stone Window":"石の窓",
  "Metal Window":"金属の窓","Greenhouse Wall":"温室の壁","Greenhouse Ceiling":"温室の天井",
  "Greenhouse Door":"温室のドア","Greenhouse Doorframe":"温室のドア枠","Greenhouse Window":"温室の窓",
  "Wall Sconce":"壁付けの燭台","Standing Sign":"立て看板","Wooden Billboard":"木の大看板",
  "Metal Billboard":"金属の大看板","Wardrum":"戦太鼓","Tek Light":"テックライト",
  "Tek Sensor":"テックセンサー","Tek Turret":"テックタレット","Tek Dedicated Storage":"テック専用ストレージ",
  "Cryofridge ":"クライオ冷蔵庫","Dinosaur Gate":"恐竜用の門","Dinosaur Gateway":"恐竜用の門枠",
  "Monodon Saddle":"モノドンのサドル","Ocepechelon Saddle":"オケペケロンのサドル",
  "Malleocephalus Saddle":"マレオケファルスのサドル","Homarus Saddle":"ホマルスのサドル",
  "Seahorse Saddle":"タツノオトシゴのサドル","Onchopristis Saddle":"オンコプリスティスのサドル",
  "Amargasaurus Saddle":"アマルガサウルスのサドル","Tidepup Saddle":"タイドパップのサドル",
  "Burrowbuck Saddle":"バローバックのサドル","Yi Ling Saddle":"イーリンのサドル",
  "Grand Tortugar Saddle":"グランド・トルトゥガーのサドル",
  "Grand Tortugar Platform Saddle":"グランド・トルトゥガーのプラットフォームサドル",
  "Megachelon Platform Saddle":"メガケロンのプラットフォームサドル",
  "Astrocetus Tek Saddle":"アストロケタスのテックサドル","Maeguana Saddle":"マエグアナのサドル",
  "Bison Saddle":"バイソンのサドル","Deinosuchus Saddle":"デイノスクスのサドル",
  "Archelon Saddle":"アーケロンのサドル","Xiphactinus Saddle":"クシファクティヌスのサドル",
  "Shastasaurus Saddle":"シャスタサウルスのサドル","Dreadnoughtus Saddle":"ドレッドノータスのサドル",
  "Palaeoctopus Saddle":"パラエオクトパスのサドル","Megaraptor Saddle":"メガラプトルのサドル",
  "Ceratosaurus Saddle":"ケラトサウルスのサドル","Concavenator Saddle":"コンカベナトルのサドル",
  "Fasolasuchus Saddle":"ファソラスクスのサドル","Deinotherium Saddle":"デイノテリウムのサドル",
  "Helicoprion Saddle":"ヘリコプリオンのサドル","Gigantoraptor Saddle":"ギガントラプトルのサドル",
  "Acrocanthosaurus Saddle":"アクロカントサウルスのサドル","Cryolophosaurus Saddle":"クリオロフォサウルスのサドル",
  "Elderclaw Saddle":"エルダークローのサドル","Pyromane Saddle":"ピュロメインのサドル",
  "Dreadmare Saddle":"ドレッドメアのサドル","Oasisaur Saddle":"オアシサウルのサドル",
  "Aureliax Saddle":"アウレリアクスのサドル","Ossidon Saddle":"オシドンのサドル",
  "Gigadesmodus Saddle":"ギガデスモダスのサドル"
};

// 2026-09-20 の日本語化見直しで追加した分（DLC・パック由来が中心）
const MANUAL_JA2 = {
  "Carving Knife":"彫刻ナイフ","Infectarium":"感染培養器","Underwater Crop Plot":"水中の作物畑",
  "Fish Basket":"魚かご","Vessel":"容器","Shootable Bottle":"投擲用の瓶","Portable Rope Ladder":"携帯用の縄ばしご",
  "Water Well":"井戸","Delivery Crate":"配達用コンテナ","Shag Rug":"毛足の長いじゅうたん","Bookshelf":"本棚",
  "Aqualyrium":"アクアリリウム","Hydrosphere":"ハイドロスフィア","Shovel":"シャベル",
  "Small Wood Elevator Platform":"木のエレベーター台（小）","Medium Wood Elevator Platform":"木のエレベーター台（中）",
  "Large Wood Elevator Platform":"木のエレベーター台（大）","Wood Elevator Top Switch":"木のエレベーターの上部スイッチ",
  "Small Elevator Platform":"エレベーター台（小）","Medium Elevator Platform":"エレベーター台（中）",
  "Large Elevator Platform":"エレベーター台（大）",
  "Companion Ammo Box":"相棒用の弾薬箱","Companion Bait Trap":"相棒用の囮トラップ",
  "Companion Battle-Spikes":"相棒用の戦闘スパイク","Companion Camping Gear":"相棒用のキャンプ道具",
  "Companion Chibi-Carrier":"相棒用のチビキャリア","Companion Extra Armor":"相棒用の追加装甲",
  "Companion Medpack":"相棒用の救急キット","Companion Oxygen Tank":"相棒用の酸素タンク",
  "Companion Picnic Set":"相棒用のピクニックセット","Companion Rucksack":"相棒用のリュック",
  "Companion Speed Booster":"相棒用のスピードブースター","Companion Spykit":"相棒用の偵察キット",
  "Drawing Paper":"画用紙","Kibble Mash":"キブルマッシュ","Dino Leash":"恐竜用リード",
  "Platform Cart":"荷車","Barrel Storage":"樽の収納","Loadout Mannequin":"装備マネキン",
  "Oil Jar":"油の壺","Wood Ocean Platform":"木の海上プラットフォーム","Aquarium":"水槽",
  "Flame Arrow":"火矢","Template Hammer":"テンプレートハンマー","Dipping Net (Ammo)":"すくい網（弾）",
  "Dipping Net (Weapon)":"すくい網","Desert Goggles and Hat":"砂漠用ゴーグルと帽子","Ammo Box":"弾薬箱",
  "Thalassian Ammo":"タラシアン弾","Thalassian Pistol":"タラシアン・ピストル",
  "Tranq Thalassian Ammo":"タラシアン麻酔弾","Thalassian Rifle":"タラシアン・ライフル",
  "Catapult Turret":"カタパルト砲台","Saloon Piano":"酒場のピアノ","Frontier Lamp":"フロンティアのランプ",
  "Wooden Tree Platform":"木のツリープラットフォーム","Metal Tree Platform":"金属のツリープラットフォーム",
  "Cannon Ball":"砲弾","Grapeshot":"散弾（ぶどう弾）","Hand Cannon":"ハンドキャノン",
  "Simple Bullet":"シンプル弾","Display Case":"陳列ケース","Jar of Pitch":"ピッチの壺",
  "Scope Attachment":"スコープ","Simple Rifle Ammo":"シンプルライフル弾","Tree Sap Tap":"樹液採取器",
  "Stone Cliff Platform":"石の崖プラットフォーム","Metal Cliff Platform":"金属の崖プラットフォーム",
  "Re-Fertilizer":"再肥料","Simple Shotgun Ammo":"シンプルショットガン弾","Poison Grenade":"毒ガス手榴弾",
  "Metal Water Reservoir":"金属の貯水槽","Silencer Attachment":"サイレンサー","Shipyard":"造船所",
  "Sloop":"スループ（小型船）","Brigantine":"ブリガンティン（中型船）","Galleon":"ガレオン（大型船）",
  "Tribe Tower":"トライブタワー","Trireme":"三段櫂船","Train Engine":"機関車","Pliers":"ペンチ",
  "Electronics":"電子部品","Lost Colony Lights":"ロストコロニーの照明","Polymer":"ポリマー",
  "Steam Lights & Lamps":"スチームパンクの照明","Wasteland Lights":"ウェイストランドの照明",
  "Electrical Cable Intersection":"電線の分岐","Flexible Electrical Cable":"可動する電線",
  "Inclined Electrical Cable":"傾斜の電線","Straight Electrical Cable":"直線の電線",
  "Vertical Electrical Cable":"縦の電線","BattleRig Garage":"バトルリグのガレージ","Camera":"カメラ",
  "Greenhouse Double Door":"温室の両開きドア","Greenhouse Double Doorframe":"温室の両開きドア枠",
  "Chain Bola":"チェーンボーラ","Library Storage":"書庫","War Map":"作戦地図",
  "Flashlight Attachment":"フラッシュライト","Metal Ocean Platform":"金属の海上プラットフォーム",
  "Spray Painter":"スプレーペインター","Water Reservoir (Frontier Showdown)":"貯水槽（フロンティア）",
  "Zip-Line Motor Attachment Skin":"ジップラインモーターのスキン","Advanced Bullet":"上級弾",
  "Unstable Element Shard":"不安定なエレメントシャード","Unstable Element":"不安定なエレメント",
  "Windmill":"風車","Drake Claw":"ドレイククロー","Advanced Rifle Bullet":"上級ライフル弾",
  "Corrosive Ship Cannonball":"腐食する艦砲弾","Explosive Spear":"爆発する槍",
  "Extinguisher Grenade":"消火手榴弾","Fabricated Crossbow":"製造クロスボウ","Goo Gun":"グーガン",
  "Incendiary Ship Cannonball":"焼夷の艦砲弾","Reinforced Ship Cannonball":"強化艦砲弾",
  "Laser Attachment":"レーザーサイト","Pet Display":"ペットの展示台",
  "Heavy Miner's Helmet":"重採掘ヘルメット","Tinkering Desk":"工作机","Warbench":"戦闘用作業台",
  "C4 Remote Detonator":"C4の起爆装置","Flamethrower Ammo":"火炎放射器の燃料",
  "Transponder Node":"発信機ノード","Transponder Tracker":"発信機トラッカー",
  "Industrial Preserving Bin":"産業用保存庫","Bloodforge":"ブラッドフォージ","Cryo Hospital":"クライオ病棟",
  "Holo-Scope Attachment":"ホロスコープ","Metal Arrow":"金属の矢","Tek Gravity Grenade":"テック重力手榴弾",
  "Charge Lantern":"チャージランタン","Cluster Grenade":"クラスター手榴弾",
  "Advanced Sniper Bullet":"上級スナイパー弾","Absorbent Substrate":"吸収基質","Bio-Grinder":"バイオ粉砕機",
  "Gene Scanner":"遺伝子スキャナー","Gene Storage":"遺伝子ストレージ","Night Vision Goggles":"暗視ゴーグル",
  "Unassembled Sir 5rM8":"未組立のSIR-5rM8","Rocket Propelled Grenade":"ロケット擲弾",
  "Egg Incubator":"卵の孵化器","Embryo Incubator":"胚の培養器","Bladewasp Hive":"ブレードワスプの巣",
  "Rocket Homing Missile":"追尾ロケット弾","Clockface":"時計盤","Little Ratfish Treats":"リトルラットフィッシュ・トリート",
  "Unassembled Mek":"未組立のメック","Makeshift Megalab":"簡易メガラボ","Zeppelin":"飛行船",
  "M.D.S.M.":"メック用 M.D.S.M.","M.R.L.M.":"メック用 M.R.L.M.","M.S.C.M.":"メック用 M.S.C.M.",
  "Minigun":"ミニガン","Minigun Turret":"ミニガン砲台","Electric Prod":"電気棒",
  "Rocket Pod":"ロケットポッド","Shocking Tranquilizer Dart":"強力麻酔ダーツ","Cannon Shell":"大砲の砲弾",
  "Rocket Turret":"ロケット砲台","Tesla Coil":"テスラコイル","Tek Surveillance Console":"テック監視コンソール",
  "Tek Hoversail":"テック ホバーセイル","Tek Phase Pistol":"テック フェイズピストル","Tek Jump Pad":"テック ジャンプ台",
  "Pearl Boots":"パールのブーツ","Pearl Chestpiece":"パールの胴当て","Pearl Gauntlets":"パールの手甲",
  "Pearl Helmet":"パールの兜","Pearl Leggings":"パールのレギンス",
  // サドル（辞書に無かった分）
  "Maewing Saddle":"メイウィングのサドル","Tropeognathus Saddle":"トロペオグナトゥスのサドル",
  "Lumina Saddle":"ルミナのサドル","Umbra Saddle":"ウンブラのサドル","Conca Saddle":"コンカベナトルのサドル",
  "Therizinosaurus Saddle":"テリジノサウルスのサドル","Rock Golem Saddle":"ロックエレメンタルのサドル",
  "Andrewsarchus Saddle":"アンドリューサルクスのサドル","Dakosaurus Saddle":"ダコサウルスのサドル",
  "Dakosaurus Platform Saddle":"ダコサウルスのプラットフォームサドル","Mosasaur Saddle":"モササウルスのサドル",
  "Mosasaur Platform Saddle":"モササウルスのプラットフォームサドル","Carcharo Saddle":"カルカロドントサウルスのサドル",
  "Shastasaurus Submarine Saddle":"シャスタサウルスの潜水サドル",
  "Astrodelphis Starwing Saddle":"アストロデルフィスのスターウィングサドル"
};

// 防具（素材＋部位）
const ARMOR_MAT = { "Cloth":"布","Hide":"皮","Fur":"毛皮","Chitin":"キチン","Metal":"金属","Flak":"フラック",
  "Riot":"暴動鎮圧用","Tek":"テック","Ghillie":"ギリー","Desert Cloth":"砂漠布","Hazard Suit":"ハザードスーツ",
  "SCUBA":"スキューバ","Gas Mask":"ガスマスク","Miner":"採掘者" };
const ARMOR_PART = { "Shirt":"の服","Chestpiece":"の胴当て","Pants":"のズボン","Leggings":"のレギンス",
  "Boots":"のブーツ","Gloves":"の手袋","Gauntlets":"の手甲","Hat":"の帽子","Helmet":"の兜","Mask":"のマスク",
  "Shoes":"の靴","Flippers":"のフィン","Goggles":"のゴーグル","Tank":"のタンク" };
const FURNITURE = { "Bench":"ベンチ","Chair":"椅子","Table":"テーブル","Billboard":"看板","Wall Sign":"壁看板",
  "Bookshelf":"本棚","Stairs":"階段","Shield":"盾","Spike Wall":"杭の壁","Fence Support":"フェンス支柱",
  "Double Door":"両開きドア","Double Doorframe":"両開きドア枠","Cage":"檻","Raft":"イカダ","Bed":"ベッド" };
const PIPE = { "Straight":"直管","Inclined":"傾斜管","Intersection":"分岐","Vertical":"縦管",
  "Flexible":"可動管","Intake":"取水口","Tap":"蛇口" };

function jaName(en, depth){
  depth = depth || 0;
  if (MANUAL_JA[en]) return MANUAL_JA[en];
  if (MANUAL_JA2[en]) return MANUAL_JA2[en];
  if (EN2JA[en]) return EN2JA[en];
  // 防具： "Cloth Boots" → 布のブーツ
  for (const [m, mj] of Object.entries(ARMOR_MAT)) {
    if (en.startsWith(m + " ")) {
      const rest = en.slice(m.length + 1);
      if (ARMOR_PART[rest]) return mj + ARMOR_PART[rest];
    }
  }
  // 配管： "Stone Irrigation Pipe - Tap" → 石の水道管（蛇口）
  const pm = en.match(/^(Stone|Metal)\s+Irrigation Pipe\s*-\s*(.+)$/);
  if (pm) return (pm[1] === "Stone" ? "石" : "金属") + "の水道管（" + (PIPE[pm[2]] || pm[2]) + "）";
  // 傾斜建材： "Sloped Wood Wall Left" → 木の傾斜壁（左）
  const sm2 = en.match(/^Sloped\s+(Thatch|Wood|Wooden|Stone|Metal|Adobe|Tek|Greenhouse)\s+(Wall|Roof)(?:\s+(Left|Right))?$/);
  if (sm2) {
    const mj = { Thatch:"わら", Wood:"木", Wooden:"木", Stone:"石", Metal:"金属", Adobe:"アドベ", Tek:"テック", Greenhouse:"温室" }[sm2[1]];
    return mj + "の傾斜" + (sm2[2] === "Wall" ? "壁" : "屋根") + (sm2[3] ? "（" + (sm2[3] === "Left" ? "左" : "右") + "）" : "");
  }
  // 家具など： "Wooden Bench" → 木のベンチ
  const fm = en.match(/^(Wooden|Wood|Stone|Metal|Adobe|Tek|Large Wooden|Large Metal)\s+(.+)$/);
  if (fm && FURNITURE[fm[2]]) {
    const mj = { Wooden:"木", Wood:"木", Stone:"石", Metal:"金属", Adobe:"アドベ", Tek:"テック",
      "Large Wooden":"大きな木", "Large Metal":"大きな金属" }[fm[1]];
    return mj + "の" + FURNITURE[fm[2]];
  }
  // サドル： "◯◯ Saddle" / "◯◯ Platform Saddle" / "Tek ◯◯ Saddle"
  const sm = en.match(/^(?:Tek\s+)?(.+?)\s+(Platform\s+)?Saddle$/);
  if (sm) {
    const base = SADDLE_SHORT[sm[1]] || sm[1];
    const ja = DEX_JA[base] || DEX_JA[sm[1]];
    if (ja) return ja + (sm[2] ? "のプラットフォームサドル" : "のサドル") + (/^Tek\s/.test(en) ? "（テック）" : "");
  }
  // 建材： "Stone Wall" → 石の壁
  for (const [m, mj] of Object.entries(MAT)) {
    if (en.startsWith(m + " ")) {
      const rest = en.slice(m.length + 1);
      if (PART[rest]) return mj + "の" + PART[rest];
    }
  }
  if (PART[en]) return PART[en];
  // 接頭辞つき： "Reinforced Wooden Door" → 補強された木のドア
  const PREFIX = { "Reinforced ":"補強された", "Behemoth ":"巨大な", "Giant ":"大型の", "Large ":"大きな",
    "Heavy ":"重", "Double ":"両開きの", "Tek ":"テックの" };
  for (const [p, pj] of Object.entries(PREFIX)) {
    if (en.startsWith(p) && depth < 2) {
      const inner = jaName(en.slice(p.length), depth + 1);
      if (inner) return pj + inner;
    }
  }
  return null;                                     // 分からなければ英語のまま出す
}

// --- 素材の日本語化 -------------------------------------------------------
const MATERIAL = {
  "Fiber":"繊維","Wood":"木材","Fungal Wood":"菌糸の木材","Thatch":"わら","Stone":"石","Flint":"火打石",
  "Hide":"皮","Pelt":"毛皮","Wool":"羊毛","Silk":"絹","Chitin":"キチン","Keratin":"角質",
  "Shell Fragment":"貝殻の欠片","Metal":"金属","Metal Ingot":"金属インゴット",
  "Scrap Metal Ingot":"スクラップ金属インゴット","Hardened Steel Ingot":"強化鋼インゴット","Iron":"鉄",
  "Cementing Paste":"セメント","Achatina Paste":"アキャティナのペースト","Crystal":"水晶",
  "Primal Crystal":"プライマルクリスタル","Obsidian":"黒曜石","Oil":"石油","Oil (Tusoteuthis)":"石油（イカ由来）",
  "Polymer":"ポリマー","Organic Polymer":"有機ポリマー","Corrupted Nodule":"コラプトノジュール",
  "Silica Pearls":"シリカ真珠","Silicate":"ケイ酸塩","Black Pearl":"黒真珠","Electronics":"電子部品",
  "Gunpowder":"火薬","Sparkpowder":"火花粉","Charcoal":"木炭","Gasoline":"ガソリン","Propellant":"推進剤",
  "Element":"エレメント","Element Dust":"エレメントダスト","Red Element":"レッドエレメント",
  "Red Element Dust":"レッドエレメントダスト","Blue Gem":"青い宝石","Red Gem":"赤い宝石","Green Gem":"緑の宝石",
  "Fragmented Green Gem":"緑の宝石の欠片","Congealed Gas Ball":"凝縮ガスボール","Sulfur":"硫黄",
  "Raw Meat":"生肉","Prime Meat":"プライムミート","Spoiled Meat":"腐肉","Fish Scale":"魚の鱗",
  "Narcotic":"麻酔薬","Narcoberry":"ナルコベリー","Stimberry":"スティムベリー","Medical Brew":"回復薬",
  "Bio Toxin":"バイオトキシン","Leech Blood":"ヒルの血","AnglerGel":"アングラージェル",
  "Ammonite Bile":"アンモナイトの胆汁","Cactus Sap":"サボテンの樹液","Sap":"樹液",
  "Blue Crystalized Sap":"青い結晶樹液","Red Crystalized Sap":"赤い結晶樹液","Blood Sap":"ブラッドサップ",
  "Crystallized Wood":"結晶化した木","Clay":"粘土","Sand":"砂","Water":"水","Seaweed":"海藻",
  "Rare Flower":"希少花","Rare Mushroom":"希少キノコ","Ascerbic Mushroom":"苦いキノコ",
  "Giant Bee Honey":"ハチミツ","Fertilizer":"肥料","Seeds":"種","Mejoberry":"メジョベリー",
  "Amarberry":"アマーベリー","Azulberry":"アズールベリー","Tintoberry":"ティントベリー",
  "Citronal":"シトロナル","Rockarrot":"ロックキャロット","Cucumis":"キューカミス","Oryraise":"オリレイズ",
  "Dodo Egg":"ドードーの卵","Hair":"髪","Horns":"角","Earthworms":"ミミズ","Barnacle":"フジツボ",
  "Absorbent Substrate":"吸収基質","Charge Battery":"チャージバッテリー","Manganese":"マンガン",
  "Raw Salt":"岩塩","Gasbags bladder":"ガスバッグの浮袋","Tusoteuthis Tentacle":"トゥソテウティスの触手",
  "Amargasaurus Spike":"アマルガサウルスの棘","Auto Turret":"オートタレット","Note":"メモ",
  "Simple Bullet":"シンプル弾","Simple Rifle Ammo":"シンプルライフル弾","Stone Arrow":"石の矢",
  "Spear Bolt":"スピアボルト","Tranquilizer Dart":"麻酔ダーツ","Thalassian Ammo":"タラシアン弾"
};
function matJA(s){
  const parts = String(s).split(/,\s*|\s+or\s+/).map(x => x.trim().replace(/^or\s+/i, "")).filter(Boolean);
  if (!parts.length) return "";
  const out = parts.map(p => MATERIAL[p] || MATERIAL[p.replace(/Wip$/, "")] || p);
  return [...new Set(out)].join("／");
}
function cleanMats(arr){
  return (arr || []).map(m => ({ n: matJA(m.n), q: String(m.q || "").replace(/[^0-9]/g, "") }))
    .filter(m => m.n && !/^[0-9]+$/.test(m.n));
}

// --- 作る場所（クラフト台）の日本語化 -------------------------------------
const STATION = { "Inventory":"手元","Smithy":"鍛冶場","smithy":"鍛冶場","Fabricator":"製作台",
  "Tek Replicator":"テックレプリケーター","Mortar and Pestle":"臼","Mortar And Pestle":"臼",
  "Chemistry Bench":"化学台","Refining Forge":"精錬炉","Industrial Forge":"産業用精錬炉",
  "Cooking Pot":"調理鍋","Industrial Cooker":"産業用調理器","Campfire":"たき火","Beer Barrel":"醸造樽",
  "Industrial Grill":"産業用グリル","Industrial Grinder":"産業用粉砕機","Tek Forge":"テックフォージ",
  "Steam Forge":"蒸気炉","Cauldron":"大鍋","Castoroides Saddle":"ビーバーのサドル",
  "Argentavis Saddle":"アルゲンのサドル","Thorny Dragon Saddle":"ソーニードラゴンのサドル",
  "Equus Saddle":"エクウスのサドル","Anvil":"金床","Shipyard":"造船所","Obelisk":"オベリスク","fabricator":"製作台","Loom":"織機","Preserving Bin":"保存庫" };
// Wikiの1行infoboxが混ざることがあるので、パイプ以降と「=」を含む値は捨てる
function station(s){
  if (!s) return "";
  const head = String(s).split("|")[0].trim();
  if (!head || head.indexOf("=") >= 0) return "";
  return STATION[head] || head;
}
function cleanPre(arr){
  return (arr || []).map(s => String(s).split("|")[0].trim())
    .filter(s => s && s.indexOf("=") < 0 && !/^[0-9]+$/.test(s));
}

// --- 分類を日本語に -------------------------------------------------------
const CAT = { "Saddles":"サドル","Structures":"建築","Structure":"建築","Metal":"建材（金属）","Wood":"建材（木）",
  "Stone":"建材（石）","Adobe":"建材（アドベ）","Thatch":"建材（わら）","Tek":"建材・装備（テック）",
  "Tools":"道具","Ammunition":"弾薬","Melee weapons":"近接武器","Guns":"銃","Weapons":"武器",
  "Irrigation":"水・灌漑","Containers":"収納","Resource":"素材","Resources":"素材","Armor":"防具",
  "Consumables":"消耗品","Crafting":"作業台","Crafting Stations":"作業台","Electrical":"電気",
  "Furniture":"家具","Utility":"便利道具","Vehicles":"乗り物","Sets":"装備セット",
  // 防具は素材ごとに分かれているので「防具（素材）」に統一する
  "Cloth armor":"防具（布）","Hide armor":"防具（皮）","Fur armor":"防具（毛皮）",
  "Chitin armor":"防具（キチン）","Flak armor":"防具（フラック）","Riot armor":"防具（暴動鎮圧）",
  "Pearl Armor":"防具（パール）","Desert cloth":"防具（砂漠布）","Ghillie suit":"防具（ギリー）",
  "Hazard suit":"防具（ハザードスーツ）","Tek armor":"防具（テック）","SCUBA":"防具（スキューバ）",
  "Armor sets":"防具セット",
  // そのほかの実データに出てくる分類
  "Greenhouse":"建材（温室）","Explosives":"爆発物","Platform Saddles":"プラットフォームサドル",
  "Emplacements":"設置兵器","Electricity":"電気","Cooking structures":"調理設備","Farming":"農業",
  "Attachments":"銃のアタッチメント","Bows":"弓","Arrows":"矢","Storage":"収納",
  "Lighting":"照明","Signs":"看板","Doors":"扉","Beds":"寝具","Traps":"トラップ",
  "Tek":"テック","Tek Structures":"建材（テック）","Boats":"船","Rafts":"イカダ","Container":"収納",
  "Skins":"スキン（見た目）","Ranged weapons":"遠距離武器","Shields":"盾","Mek modules":"メックの装備",
  "Weapon":"武器","tool":"道具","Items":"アイテム","Buildings":"建築","Melee":"近接武器" };

// --- MOD由来のエングラム（手動。CurseForgeのMODは公式Wikiに載らない） -----
const MODS = [
  { mod:"Awesome SpyGlass!", id:"928548", items:[
    { en:"Awesome Spyglass", ja:"オーサム・スパイグラス", lv:1, ep:0, note:"恐竜のレベル・ステータス・テイム進行度が見える望遠鏡。材料も軽い" } ] },
  { mod:"Super Spyglass Plus", id:"—", items:[
    { en:"Super Spyglass", ja:"スーパー・スパイグラス", lv:1, ep:0, note:"上と同系統。必要な餌の数や残り時間まで表示" } ] },
  { mod:"Structures Plus (S+)", id:"928546", items:[
    { en:"S+ Foundation / Wall / Ceiling ほか建材一式", ja:"S+ の建材一式", lv:1, ep:0, note:"スナップ（吸着）が快適。既存建材の置き換え" },
    { en:"S+ Item Collector", ja:"S+ アイテムコレクター", lv:0, ep:0, note:"周囲のアイテムを自動回収" },
    { en:"S+ Tek Transmitter / Dedicated Storage", ja:"S+ 転送機・専用ストレージ", lv:0, ep:0, note:"素材の一括管理" },
    { en:"S+ Multi Lamp / Crop Plot", ja:"S+ ランプ・作物畑", lv:0, ep:0, note:"電源不要の照明、自動給水の畑など" } ] },
  { mod:"Dino Storage v2 / v3", id:"—", items:[
    { en:"Soul Trap / Soul Terminal", ja:"ソウルボール・ソウル端末", lv:1, ep:0, note:"恐竜をボール化して保管。**サーバー負荷が下がる**" },
    { en:"Soul Gun", ja:"ソウルガン", lv:0, ep:0, note:"離れた恐竜をまとめて回収" } ] },
  { mod:"Castles, Keeps and Forts: Remastered", id:"927084", items:[
    { en:"CKF 建材一式（石壁・木壁・屋根・窓・門）", ja:"中世風の建材一式", lv:1, ep:0, note:"見た目重視の建築。種類が非常に多い" } ] },
  { mod:"HG Stacks 等のスタック系", id:"—", items:[
    { en:"（エングラム追加なし）", ja:"エングラムは増えない", lv:0, ep:0, note:"アイテムのスタック数を増やすだけ。**負荷対策にもなる**" } ] },
  { mod:"Automated Ark", id:"—", items:[
    { en:"AA Auto Crafter / Auto Farmer / Nanny", ja:"自動クラフト・自動収穫・子育て乳母", lv:1, ep:0, note:"餌やり・収穫・整理を自動化。**重いので少人数向け**" } ] },
  { mod:"Astraeos（無料MOD版・ID 988598）", id:"988598", items:[
    { en:"Astraeos structures / wardrobe", ja:"Astraeos の建材・衣装", lv:0, ep:0, note:"別MODとして無料配布。マップMOD本体とは別に入れる" } ] }
];

// --- 効果・説明（日本語） -------------------------------------------------
const MANUAL_DESC = {
  "Campfire":"暖を取り、生肉を焼く。夜の寒さ対策の基本",
  "Sleeping Bag":"1回だけ使える復活地点。遠出の前に置いておく",
  "Simple Bed":"何度でも使える復活地点。拠点に必須",
  "Bola":"小〜中型を数秒その場に縛る。初テイムの必需品",
  "Wooden Club":"殴って気絶させる。ダメージが低く殺しにくいのでテイム向き",
  "Slingshot":"少し離れた位置から気絶値を稼げる。小型テイム用",
  "Bow":"矢を撃つ基本の遠距離武器。麻酔矢と組み合わせる",
  "Tranquilizer Arrow":"当てると気絶値が大きく上がる。中型以上のテイムはこれが本命",
  "Narcotic":"気絶中の相手に食べさせて眠らせ続ける。テイムの生命線",
  "Stimulant":"気絶から早く目覚める。自分が気絶した時の回復に",
  "Medical Brew":"体力を素早く回復。洞窟とボス戦の必需品",
  "Mortar And Pestle":"麻酔薬・セメント・火薬などを作る序盤の心臓部",
  "Preserving Bin":"保存塩で肉が腐りにくくなる。冷蔵庫までのつなぎ",
  "Refrigerator":"電気式の保存庫。肉と卵を長期保存できる",
  "Refining Forge":"金属を金属インゴットに、石油をガソリンに精錬する",
  "Smithy":"金属装備・サドル・上位道具を作る作業台",
  "Fabricator":"銃や弾薬、上位の部品を作る。ガソリンで動く",
  "Chemistry Bench":"臼の上位。火薬や薬を大量かつ高効率で作る",
  "Feeding Trough":"範囲内の恐竜が自動で食べる。留守中の餓死を防ぐ",
  "Cryopod":"恐竜をボール化して持ち運ぶ。サーバー負荷も下がる",
  "Air Conditioner":"周囲の温度を一定に保つ。卵の孵化に使う",
  "Electrical Generator":"ガソリンで発電。電線でつないで照明や冷蔵庫を動かす",
  "Crop Plot":"作物を育てる。キブルやケーキの材料になる",
  "Water Jar":"水を持ち運ぶ。砂漠では命綱",
  "Climbing Pick":"崖や壁を登る。アベレーションの必需品",
  "Grappling Hook":"引っ掛けて移動する。洞窟や崖で便利",
  "Zip-Line Anchor":"ジップラインを張って高速移動する",
  "Parachute":"高所から安全に降りる。落下死の保険",
  "Spyglass":"遠くの生き物を確認する。レベルを見るならMODの望遠鏡が便利",
  "GPS":"現在の座標を表示する。このDBの座標と照らし合わせて使う",
  "Vault":"大容量の頑丈な収納。壊されにくい",
  "Auto Turret":"自動で敵を撃つ砲台。拠点防衛の要",
  "Plant Species X Seed":"植物の砲台。敵を遅くする弾を撃つ",
  "Bear Trap":"踏んだ相手を足止めする。テイムや防衛に",
  "Mindwipe Tonic":"ステータスとエングラムを振り直す。使用には制限あり",
  "Beer Barrel":"ビールを作る。カリコテリウムとデイノテリウムのテイムに必要",
  "Taxidermy Base":"倒した生き物を剥製にして飾る",
  "Tek Replicator":"最上位の装備を作る設備。ボス撃破で解放",
  "Cooking Pot":"スープや染料、キブルを作る",
  "Compost Bin":"糞とわらから肥料を作る",
  "Industrial Forge":"精錬炉の上位。金属を大量にさばける",
  "Industrial Cooker":"調理鍋の上位。キブルを大量生産できる",
  "Charge Station":"アベレーションのチャージを補給する設備"
};
// 名前と分類から説明を自動で作る
const DESC_EXTRA = JSON.parse(fs.readFileSync(path.join(__dirname, "desc_extra.json"), "utf8"));

function autoDesc(e, ja){
  const cat = e.cat || "";
  if (/^サドル|プラットフォームサドル/.test(cat)) {
    const who = (ja || "").replace(/の(プラットフォーム)?サドル.*$/, "");
    return who ? who + "に乗るためのサドル" + (/プラットフォーム/.test(ja) ? "。背中に建築できる" : "") : "騎乗用のサドル";
  }
  const TIER = { "わら":"一晩しのぎ。ほぼ何にでも壊される", "木":"序盤の拠点向け。中型恐竜には壊される",
    "石":"多くの野生恐竜が壊せない実質的な安全ライン", "金属":"大型恐竜の攻撃にも耐える中盤以降の本命",
    "テック":"最上位の建材。ボス撃破で解放", "アドベ":"石と同程度の硬さで、暑さに強い",
    "温室":"日光を通し、中の作物の成長が早まる" };
  const cm = cat.match(/建材（(.+?)）/);
  if (cm && TIER[cm[1]]) return "建材。" + TIER[cm[1]];
  const tm = (ja || "").match(/^(わら|木|石|金属|テック|アドベ|温室)の/);
  if (tm && /建材|建築/.test(cat)) return "建材。" + TIER[tm[1]];
  if (/防具/.test(cat)) {
    const am = cat.match(/防具（(.+?)）/);
    const NOTE = { "布":"暑さに強い。序盤と砂漠向け", "皮":"寒さに強い。夜と雪原の基本",
      "毛皮":"極寒に耐える。雪山・氷の洞窟用", "キチン":"防御力が高い。暑い場所には向かない",
      "フラック":"高い防御力。中盤以降の主力", "暴動鎮圧":"最高クラスの防御力。重い",
      "ハザードスーツ":"放射線とガスを防ぐ。アベレーションと沼洞窟に必須",
      "スキューバ":"水中の呼吸と視界を確保する", "ギリー":"見つかりにくくなる。暑さにも強い",
      "テック":"最上位の装備。特殊能力つき", "パール":"水中向けの防具", "砂漠布":"砂漠の暑さ対策" };
    return "防具。" + (NOTE[am && am[1]] || "身を守る");
  }
  if (/弾薬|矢|弾/.test(cat)) return "弾薬。対応する武器で使う";
  if (/近接武器|遠距離武器|銃|武器|盾/.test(cat)) return "武器";
  if (/作業台/.test(cat)) return "ものを作るための設備";
  if (/収納/.test(cat)) return "アイテムをしまう入れ物";
  if (/電気|照明/.test(cat)) return "電気まわりの設備";
  if (/水・灌漑/.test(cat)) return "水を引くための配管";
  if (/農業/.test(cat)) return "作物を育てるための設備";
  if (/家具|看板|スキン/.test(cat)) return "見た目・内装用";
  if (/乗り物|船|イカダ/.test(cat)) return "乗り物";
  if (/爆発物|設置兵器|トラップ/.test(cat)) return "攻撃・防衛用";
  if (/素材|消耗品/.test(cat)) return "素材・消耗品";
  return "";
}

// --- 組み立て -------------------------------------------------------------
const out = [];
raw.forEach(e => {
  if (/Primitive Plus/i.test(e.dlc)) return;        // ASAには無い旧DLC
  let src = "本体";
  if (e.dlc) {
    if (/Bob's Tall Tales/i.test(e.dlc)) src = "有料パック（Bob's Tall Tales）";
    else if (/Aquatica/i.test(e.dlc)) src = "Aquatica";
    else if (/Genesis: Part 2|Crystal Isles|Lost Island|Fjordur/i.test(e.dlc) && !/Scorched|Aberration|Extinction|Genesis: Part 1|Ragnarok|Valguero/i.test(e.dlc)) src = "ASA未配信マップ";
    else src = "DLCマップ";
  }
  const catJa = (function(c){ c = (c || "").split("|")[0].trim(); return CAT[c] || c || "その他"; })(e.cat);
  const nameJa = jaName(e.en);
  out.push({
    en: e.en, ja: nameJa, lv: e.lv, ep: e.ep,
    cat: catJa,
    made: station(e.made),
    mats: cleanMats(e.mats),
    desc: MANUAL_DESC[e.en] || DESC_EXTRA[e.en] || autoDesc({ cat: catJa }, nameJa) || "",
    desc_en: e.desc || "",
    pre: cleanPre(e.pre), src: src, maps: e.dlc || "",
    url: "https://ark.wiki.gg/wiki/" + encodeURIComponent(e.en.replace(/ /g, "_"))
  });
});
MODS.forEach(m => m.items.forEach(it => out.push({
  en: it.en, ja: it.ja, lv: it.lv, ep: it.ep, cat: "MOD", made: "", pre: [], mats: [], desc: it.note || "",
  src: "MOD：" + m.mod, maps: "", note: it.note, url: ""
})));

// 前提エングラムも日本語名に置き換える（名前の辞書ができてから）
const NAME_JA = { "Thatch Roof":"わらの屋根","Wood Bench":"木のベンチ","Wood Chair":"木の椅子",
  "Town Bell":"町の鐘","Mortar And Pestle":"臼","refrigerator":"冷蔵庫","Wood Table":"木のテーブル" };
out.forEach(e => { if (e.ja) NAME_JA[e.en] = e.ja; });
out.forEach(e => { e.pre = (e.pre || []).map(p => NAME_JA[p] ? NAME_JA[p] + "（" + p + "）" : p); });

out.sort((a, b) => a.lv - b.lv || (a.ja||a.en).localeCompare(b.ja||b.en, "ja"));
fs.writeFileSync(path.join(root, "data", "ark_engrams.json"), JSON.stringify({
  _meta: {
    source: "ARK公式Wiki Category:Engrams（本体＋DLC）＋ MOD分は手動まとめ",
    note: "必要レベル・EP・作る場所・前提エングラムは公式Wikiの各ページより。Primitive Plus（ASA未実装）は除外。MODのエングラムは公式Wikiに載らないため手動で、レベル/EPは目安。",
    updated: new Date().toISOString().slice(0, 10)
  }, engrams: out
}, null, 1), "utf8");

const ja = out.filter(e => e.ja).length;
console.log("エングラム:", out.length, "件（うち日本語名つき", ja, "件）");
const bysrc = {}; out.forEach(e => bysrc[e.src] = (bysrc[e.src]||0)+1);
console.log("出典:", Object.entries(bysrc).map(([k,v])=>k+":"+v).join(" / "));
const bycat = {}; out.forEach(e => bycat[e.cat] = (bycat[e.cat]||0)+1);
console.log("分類:", Object.entries(bycat).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,v])=>k+":"+v).join(" / "));
