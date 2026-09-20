# ARK: Survival Ascended マップ別データベース

自宅のASA専用サーバー（The Island / Astraeos MOD版）で遊ぶための攻略・設定リファレンス。
作成日：2026-09-18 ／ 最終更新：2026-09-20

公開ページ：https://youjikio.github.io/ark-db/

## 使い方

`index.html` をダブルクリックしてブラウザで開くだけ。サーバーもネットも要らない。

- 開くと最初に **🏠 目次（ホーム）**。**やりたいこと別の入口**（初めて遊ぶ／生き物を調べる／資源の場所／
  仕組みが分からない／動作が重い／サーバー設定／MOD・DLC／最新事情）から入るのが一番速い
- ホームの索引：**マップ一覧**／**アーティファクト索引**（座標つき逆引き）／
  **資源から探す**（📍をクリックすると資源マップでその資源だけ表示）／
  **エングラムから探す**（レベル帯・分類・出典から辞典へ直行）／**生き物から探す**（用途タグから図鑑へ）／
  **マップ選びの指針**／**このDBの見かた**
- 左のナビは4グループ（まず読む／調べる／マップ11／サーバーを動かす人向け）
- 各マップページの上部に**ページ内目次**。タイトルをクリックすると目次に戻る
- 各マップページの構成：地図（ピン）→ **進行ルート**（そのマップの攻め方5段階）→ **注意・ギミック**（死因と仕掛け）
  → 地域 → 拠点候補 → 資源 → おすすめ生物 → 出現生物一覧 → 洞窟・アーティファクト →
  **ボス（＋召喚に必要な素材をγ/β/αの3段階で表示）** → コツ → マップ別設定
- 上の検索ボックスは**全ページ横断検索**（例：`金属` `沼洞窟` `ワイバーン` `クライオ` `UE5.8`）。
  **`/` キーで検索窓にジャンプ**、`Esc` で解除。右下の `↑` でページ先頭へ
- ページ間の導線：マップ→資源マップ／マップ→図鑑（そのマップの生き物だけ）／図鑑→マップ／
  初心者ガイド→図鑑・資源マップ
- **🗺 資源マップ**（資源の座標だけを出す専用ページ）… 11マップ・約1,870ノード。金属／水晶／黒曜石／石油／シリカ真珠／硫黄などを色分けピンで表示し、種類ごとにON/OFF。下に座標一覧（開閉式）つき
- **📜 エングラム辞典**（684件・MOD込み）… 何レベルで何が解禁されるか。必要Lv／EP／**効果・説明**／分類／**必要な素材**／作る場所／前提エングラム。
  素材は公式Wikiのレシピから取得して日本語化（671件・残り13件はMODのまとめ行など）、説明は全684件が日本語。素材名は公式Wikiへリンク。
  レベル帯・出典（本体／DLC／MOD）・名前・**素材名**で絞り込み（例：「黒真珠」で黒真珠を使うエングラムを全部出す）
- **🦕 恐竜図鑑**（196種）… **おすすめ度★**（★5＝いないと詰まる／0＝テイム不可・ボス）で絞り込み・並べ替えができる。**名前・能力での絞り込み**＋用途タグ＋マップ絞り込み。
  テイム方法／**準備するもの**／**特殊能力・攻撃方法**／好きな餌／用途／得意な採取／
  サドルの解禁レベル／出現マップ。用途タグとマップで絞り込み。先頭に**テイムの基本ガイド**（4つの方法の手順と共通の道具）。
  文中のアイテム名（麻酔矢・キブル・ハザードスーツ・素材名等156種）は**公式Wikiへのリンク**になる
- **📐 システム解説** … プレイヤーと恐竜のステータス、エングラム（レシピ開放）の仕組みと覚える順番、制作アイテムの用途一覧
- **🧩 MOD・DLCの話** … MODの仕組み（CurseForge・クライアント自動DL）と入れ方、おすすめMOD、**有料DLC・パック一覧**（どのパックに何の生き物が入っているか）
- **📘 初心者ガイド**（ARKが初めての友達に読んでもらう用）。このサーバーの設定に合わせた
  「最初の30分 → レベル上げ → 初テイム → 死因対策 → 拠点 → 資源早見表 → 中盤 → 約束事 → Q&A → 用語集」
  ＋**便利恐竜リスト**（48種／7グループ：まずこの3体・移動・採取・暮らし・肩乗り・戦闘・**Astraeos（MOD）限定**）。
  各行に★おすすめ度と「出る場所（Island／Astraeos／両方）」が付く（出現生物データから自動）。
  各行から恐竜図鑑と公式Wikiへ飛べる。元データは `tools/utility_dinos.json`（`node tools/add_utility_dinos.js` で反映）
- 各マップページの先頭に **地図（座標ピン付き）**。洞窟・拠点・資源・オベリスクを色分けしたピンで表示し、
  チェックボックスで種類ごとに表示/非表示。ピンにカーソルを合わせると名前と座標、地図上をなぞると座標が出る
- **出現生物一覧**（延べ1,339種／陸・空・水中・有料パック由来・アルファ・コラプト・機械・ボス・イベントに分類、日本語名＋英名）。
  名前をクリックすると**恐竜図鑑のその1種**へ、`↗` で**公式Wiki**のページへ飛べる（図鑑519件／Wiki881件）。
  図鑑カードの「出現：」のマップ名からは、そのマップのページへ戻れる
- 「⚙️ サーバー設定・コマンド」に ini 設定と管理者コマンド（コピーボタン付き）
- 「🖥 個人PCのコマンド」は各自のPCで打つ描画コマンド（`r.VolumetricCloud 0` で雲を切る等）。おすすめ3セット＋一覧＋Engine.iniで恒久化する方法
- 「🌍 海外情報メモ」は英語圏ソースから拾った最新事情（UE5.8アップグレード／ASAの新生物／海外の定番レート／サーバー要件）

## ⚠ 直近の注意：2026-09-30 の UE5.8 アップグレード

ASA本体が Unreal Engine 5.8 に上がる。MODとサーバープラグインは再コンパイルが必要になる見込みで、
**Astraeos（MOD版）が一時的に動かなくなる可能性がある**。9/30より前に
`D:\ARKServer\ASA\ShooterGame\Saved\SavedArks\` をフォルダごとバックアップしておくこと。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` | ビューア本体（1枚完結・ライブラリなし） |
| `data/ark_maps.json` | **データの本体。編集するのはここ** |
| `data/ark_spawns.json` | 出現生物一覧（`tools/build_spawns.js` が生成） |
| `data/creature_index.json` | 公式Wikiの全生物インフォボックス562件（出現マップ・食性・騎乗可否など）。`tools/fetch_creatures.js` が生成 |
| `data/ark_creatures.json` | 恐竜図鑑196種（サドルLv・テイム方法は公式Wikiで確認した値） |
| `data/ark_engrams.json` | エングラム辞典684件（`tools/fetch_engrams.js`→`build_engrams.js` で生成。MOD分は build_engrams.js 内） |
| `data/ark_items.json` | アイテム名→公式Wikiのリンク156件（`tools/build_item_links.js` が実在確認して生成＋素材名を追加）。`prose_skip` に入れた語（石・皮・水など短い語）は本文中ではリンクしない（詤見防止。素材欄の完全一致はリンク） |
| `data/ark_systems.json` | システム解説とMOD解説 |
| `data/ark_resource_nodes.json` | 資源ノードの座標（資源マップ用・約1,870件） |
| `tools/selftest.js` | ビューアの自己テスト。全ページ描画・ピン数・リンク数・検索・トリビュート表を確認 |
| `tools/fetch_engrams.js` / `tools/build_engrams.js` | エングラムの取得と、日本語名づけ・MOD分の追加 |
| `tools/creatures_add.json` / `tools/add_creatures3.js` | 出現一覧にいるのに図鑑が無かった種の追加（`lint_links.js` で検出→公式Wikiで確認して追記） |
| `tools/add_aliases.js` | 図鑑の別名（英語の変種名・日本語の表記ゆれ）。表記ゆれ検索に使う |
| `tools/recommend.json` / `tools/build_recommend.js` | 恐竜図鑑の**おすすめ度**（196種を手動で格付け）。JSONを直して `node tools/build_recommend.js` で `data/ark_creatures.json` に反映 |
| `tools/utility_dinos_add.json` / `tools/merge_utility_dinos.js` | 便利恐竜リストへの**追加分**。`merge_utility_dinos.js` で本体JSONに取り込む（重複は入らない） |
| `tools/utility_dinos.json` / `tools/add_utility_dinos.js` | 初心者ガイドの**便利恐竜リスト**（35種）。JSONを直して `node tools/add_utility_dinos.js` を実行すると `data/ark_maps.json` に反映（何度でも実行可・図鑑との突き合わせつき） |
| `tools/desc_extra.json` | エングラムの効果説明（手書き107件・英名キー）。分類からの自動説明で足りないものをここに書く |
| `tools/lint_ja.js` | **日本語化の残り**を洗い出す（英語のまま残っている名前・分類・作る場所など） |
| `tools/ja_artifacts.js` | マップのアーティファクト名を日本語化（何度実行しても二重にならない） |
| `tools/lint_links.js` | **リンクと整合性の粗さがし**（出現一覧→図鑑に繋がらない種／テイム不可なのに★が付いている等の矛盾／出現一覧に出てこない種）。index.html の判定をそのまま読み込んで検査する |
| `tools/lint_data.js` | **データの粗さがし**（空欄・座標の範囲外・重複・Wikiとの不一致・「要確認」の残り） |
| `tools/verify_saddles.js` | サドル必要レベルを公式Wikiと照合（`--fix` で自動修正） |
| `tools/fetch_boss_tributes.js` | ボスの召喚に必要なもの（γ/β/α）を公式Wikiから取得 → `data/ark_bosses.json` |
| `tools/attach_tributes.js` | 上で取ったトリビュートを各マップのボス表に紐づける |
| `data/ark_bosses.json` | ボス12体のトリビュート要件（公式Wiki由来） |
| `data/ark_maps.js` / `data/ark_spawns.js` | ビューアが読む自動生成ファイル（JSONを `window.ARK_DATA` / `window.ARK_SPAWNS` に入れただけ） |
| `images/*.jpg` | 各マップの地形図（ARK公式コミュニティWikiから取得。**個人利用のみ・再配布しない**） |
| `tools/build_spawns.js` | ①スポーン図カテゴリ ②生物インフォボックスの出現マップ欄 を統合して出現生物一覧を生成 |
| `tools/fetch_creatures.js` | 公式Wikiから全生物の情報を取得（レート制限あり。連続実行しない） |
| `tools/enrich_maps.js` | 各マップの洞窟データ・進行ルート・注意ギミックを生成（何度実行しても増えない） |
| `tools/add_creatures2.js` | 図鑑の追加分と「特殊能力・攻撃方法」を付与（まとめ項目の別名＝aliasもここ） |
| `tools/add_prep.js` | 図鑑の「準備するもの」とテイム基本ガイドを生成（特別な準備が要る生き物は同ファイルの OVERRIDE で上書き） |
| `tools/build_item_links.js` | アイテム名→Wikiリンクの辞書を生成（存在しないページは自動で除外） |
| `tools/spawn_raw.json` / `tools/all_creature_pages.txt` | Wikiから抽出した生データ（再生成の入力） |
| `build.ps1` | JSON → JS を生成＋JSON検証（2ファイルまとめて） |

`file://` でHTMLを直接開くとブラウザが `fetch()` でJSONを読めない（CORS制限）ため、
`ark_maps.js` を経由して読み込んでいる。

## 更新のしかた

1. `data/` の中の該当JSONを編集する（マップ＝`ark_maps.json`／図鑑＝`ark_creatures.json`／
   資源座標＝`ark_resource_nodes.json`／解説とMOD＝`ark_systems.json`）
2. PowerShell で `.\build.ps1` を実行（JSON検証 → `data/*.js` を再生成）
3. ブラウザを再読み込み
4. 仕上げに `node tools/selftest.js`（描画・リンク・検索の自動チェック）と
   `node tools/lint_data.js`（データの粗さがし）

```powershell
D:\Users\youji\Desktop\Claude\ARK\build.ps1
```

## 収録マップ（2026-09-20 時点の公式配信済み）

The Island / Scorched Earth / The Center / Aberration / Extinction / Ragnarok / Valguero /
Astraeos（無料MOD版・公式DLC版の両方）/ Lost Colony / Genesis Part 1

未配信：Genesis Part 2、Fjordur、Crystal Isles、Lost Island ほか。

## データの信頼度について

- **座標は「目安」**。攻略サイト由来で、ASAのリマスターで位置が微妙にズレている場合がある。
  現地で少し周囲を探すつもりで使う。
- 「要確認」と書いてある項目（Astraeos無料MOD版の洞窟実装状況など）は、実機で確かめてから JSON を直す。
- **地図のピンは JSON に座標が書いてあるものだけ出る。** 資源は「🗺 資源マップ」に全11マップ分（1,867ヵ所）、
  洞窟・拠点は各マップページの地図に出る。座標を JSON に足せば、そのままピンが増える。
- 出現生物一覧は**2つの情報源の和集合**（①スポーン図カテゴリ ②各生物ページの出現マップ欄）。
  2026-09-20に全807ページと突き合わせて漏れを補正した（858→1,339種）。
  ただし②はWikiの記入もれがあり得るので「載っていない＝絶対いない」ではない。
- **Astraeos の一覧は公式（有料DLC版）のデータ**。無料MOD版は縮小版なので全部はいない（画面にも警告を表示）。
- 出典は `meta.sources`（ビューアの「設定・コマンド集」ページ末尾にも表示）。

## 関連

- サーバー本体：`D:\ARKServer\ASA`、起動バッチ `D:\ARKServer\start_ark.bat` / `start_ark_astraeos.bat`
- 設定ファイル：`D:\ARKServer\ASA\ShooterGame\Saved\Config\WindowsServer\GameUserSettings.ini` / `Game.ini`

## 出典・クレジット（公開版）

- ゲーム本体『ARK: Survival Ascended』は **Studio Wildcard** の著作物。このリポジトリは非公式・非営利のファン資料です。
- データは **公式Wiki [ark.wiki.gg](https://ark.wiki.gg/)**（ライセンス CC BY-NC-SA 3.0）を参照してまとめ、日本語化したもの。
  各ページの末尾と `meta.sources` に出典を書いています。同ライセンスに従い、**非営利・表示・継承**の条件で公開します。
- `images/` の地図画像はゲーム内／公式Wiki由来の画像です。権利者から指摘があれば差し替え・削除します。
- 攻略情報の一部は海外コミュニティ（Reddit / Steamガイド等）を参照。誤りがあれば Issue で教えてください。

## Web公開（GitHub Pages）

このリポジトリは **ルートの `index.html` をそのまま GitHub Pages で配信**できる構成です（`.nojekyll` 済み）。

1. GitHub で **Public** のリポジトリを作る（README は付けない）
2. このフォルダで `git remote add origin <リポジトリのURL>` → `git push -u origin main`
3. リポジトリの **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `/ (root)`** → Save
4. 数分待つと `https://<ユーザー名>.github.io/<リポジトリ名>/` で誰でも見られるようになる

更新するときは、`build.ps1` → `node tools/selftest.js` のあとに

```
git add -A
git commit -m "内容を更新"
git push
```

で、数分後に公開ページへ反映されます。
