<div align="center">
  <img src="public/logo.svg" alt="OGame Vue TS Logo" width="128" height="128">

  # OGame Vue TS

  Vue 3とTypeScriptで構築されたモダンな宇宙戦略ゲーム。

  [![GitHub Release](https://img.shields.io/github/v/release/setube/ogame-vue-ts?style=flat&logo=github&label=Release)](https://github.com/setube/ogame-vue-ts/releases/latest)
  [![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0)
  [![Tap Tap](https://img.shields.io/badge/TapTap-OGame%20Vue%20Ts-18d6e0)](https://www.taptap.cn/app/801190)

  [简体中文](README.md) | [繁體中文](README-zh-TW.md) | [English](README-EN.md) | [Deutsch](README-DE.md) | [Русский](README-RU.md) | [Español](README-ES.md) | [한국어](README-KO.md) | 日本語

</div>

## プロジェクトについて

OGame Vue TSは、クラシックなOGameにインスパイアされたシングルプレイヤー向けブラウザベースの宇宙戦略ゲームです。銀河に帝国を築き、テクノロジーを研究し、宇宙船を建造し、壮大な宇宙戦闘に参加しましょう。このプロジェクトはモダンなWeb技術で構築されており、ブラウザ内で完全に動作し、すべてのデータはローカルに保存されます。

## 主な機能

- **建物管理** - 惑星と月で様々な建物を建設・アップグレード
- **技術研究** - 先進技術をアンロックして帝国を強化
- **艦隊管理** - 宇宙船を建造し、ミッションを派遣し、戦術的な宇宙戦闘に参加
- **防衛システム** - 防衛施設を配置してコロニーを守る
- **士官システム** - 士官を雇用して戦略的優位性を獲得
- **戦闘シミュレーター** - 資源を投入する前に戦闘シナリオをテスト
- **銀河ビュー** - 宇宙を探索し、他の惑星と交流
- **ローカルデータ永続化** - すべてのゲームデータは暗号化されブラウザにローカル保存
- **ダーク/ライトテーマ** - お好みのビジュアルテーマを選択
- **キュー管理** - 複数の建設・研究キューを管理
- **月の生成** - デブリフィールドからの確率ベースの月生成メカニズム

## 技術スタック

- **フロントエンドフレームワーク:** [Vue 3](https://vuejs.org) + Composition API (`<script setup>` 構文)
- **開発言語:** [TypeScript](https://www.typescriptlang.org) (厳密な型チェック有効)
- **ビルドツール:** [Vite](https://vitejs.dev) (カスタムRolldown-Vite 7.2.5)、[Golang](https://golang.org) (クロスプラットフォームWebサーバー)、[Electron](https://www.electronjs.org) (クロスプラットフォームビジュアルインターフェース)
- **状態管理:** [Pinia](https://pinia.vuejs.org) + 永続化プラグイン
- **ルーティング:** [Vue Router 4](https://router.vuejs.org)
- **UIコンポーネント:** [shadcn-vue](https://www.shadcn-vue.com) (New Yorkスタイル)
- **スタイリング:** [Tailwind CSS v4](https://tailwindcss.com) + CSS変数
- **アイコン:** [Lucide Vue Next](https://lucide.dev)
- **アニメーション:** [tw-animate-css](https://www.npmjs.com/package/tw-animate-css)
- **国際化:** カスタムi18n実装

## クイックスタート

### 必要条件

- [Node.js](https://nodejs.org) (バージョン18以上推奨)
- [pnpm](https://pnpm.io) (バージョン10.13.1以上)
- [Go](https://golang.org) (バージョン1.21以上) (オプション)

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/setube/ogame-vue-ts.git

# プロジェクトディレクトリに移動
cd ogame-vue-ts

# 依存関係をインストール
pnpm install
```

### 開発

```bash
# 開発サーバーを起動 (ポート25121)
pnpm dev
```

ブラウザで `http://localhost:25121` にアクセス

### 本番ビルド

```bash
# アプリケーションをビルド
pnpm build

# 本番ビルドをプレビュー
pnpm preview
```

## データセキュリティ

すべてのゲームデータは、ブラウザのローカルストレージに保存される前にAESで自動的に暗号化されます。ゲームの進行状況は安全でプライベートです。

## カスタマイズ

アプリケーションは`src/style.css`で定義されたTailwind CSS変数による完全なテーマカスタマイズをサポートしています。ライトモードとダークモードを簡単に切り替えることができます。

## 貢献

貢献は大歓迎です！お気軽にissueやpull requestを提出してください。

## ライセンス

この作品は[クリエイティブ・コモンズ 表示-非営利 4.0 国際ライセンス](https://creativecommons.org/licenses/by-nc/4.0)の下でライセンスされています。

### あなたは自由に：
- **共有** — どのようなメディアやフォーマットでも資料をコピー・再配布できます
- **翻案** — 資料をリミックス、変形、加工できます

### 以下の条件に従う必要があります：
- **表示** — 適切なクレジットを表示し、ライセンスへのリンクを提供し、変更があったかどうかを示す必要があります
- **非営利** — 資料を営利目的で使用することはできません

## 謝辞

このプロジェクトはオリジナルの[OGame](https://ogame.org)ブラウザゲームにインスパイアされています。すべてのゲームメカニクスとデザイン要素は、教育およびエンターテイメント目的で再実装されています。

## 免責事項

このプロジェクトはGameforge AGや公式OGameゲームとは一切関係がなく、承認や接続もありません。これは教育と個人的なエンターテイメントのみを目的として作成された独立したファンプロジェクトです。

---

<div align="center">
  ❤️を込めて作成 by <a href="https://github.com/setube">setube</a>
  <br>
  © 2025 - All rights reserved (CC BY-NC 4.0ライセンスで付与された権利を除く)
</div>
