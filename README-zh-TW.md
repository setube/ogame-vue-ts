<div align="center">
  <img src="public/logo.svg" alt="OGame Vue TS Logo" width="128" height="128">

  # OGame Vue TS

  一個基於 Vue 3 和 TypeScript 構建的現代化 OGame 太空策略遊戲。

  [![GitHub Release](https://img.shields.io/github/v/release/setube/ogame-vue-ts?style=flat&logo=github&label=Release)](https://github.com/setube/ogame-vue-ts/releases/latest)
  [![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0)
  [![Tap Tap](https://img.shields.io/badge/TapTap-OGame%20Vue%20Ts-18d6e0)](https://www.taptap.cn/app/801190)
  
  [简体中文](README.md) | 繁體中文 | [English](README-EN.md) | [Deutsch](README-DE.md) | [Русский](README-RU.md) | [Español](README-ES.md) | [한국어](README-KO.md) | [日本語](README-JA.md)

</div>

## 關於專案

OGame Vue TS 是一款受經典 OGame 遊戲啟發的單機版、基於瀏覽器的太空策略遊戲。在銀河系中建立你的帝國，研究科技，建造艦船，參與史詩般的太空戰鬥。本專案採用現代 Web 技術構建，完全在瀏覽器中運行，提供流暢且響應迅速的遊戲體驗，所有數據都儲存在本地。

## 核心特性

- **建築管理** - 在行星和月球上建造和升級各種建築
- **科技研究** - 解鎖先進科技來增強你的帝國
- **艦隊管理** - 建造艦船、派遣任務、參與戰術太空戰鬥
- **防禦系統** - 部署防禦設施來保護你的殖民地
- **軍官系統** - 招募軍官以獲得戰略優勢
- **戰鬥模擬器** - 在投入資源前測試戰鬥場景
- **銀河視圖** - 探索宇宙並與其他星球互動
- **本地數據持久化** - 所有遊戲數據都經過加密並儲存在瀏覽器本地
- **深色/淺色主題** - 選擇你喜歡的視覺主題
- **隊列管理** - 管理多個建造和研究隊列
- **月球生成** - 基於概率的月球從殘骸場生成機制

## 技術棧

- **前端框架:** [Vue 3](https://vuejs.org) + Composition API (`<script setup>` 語法)
- **開發語言:** [TypeScript](https://www.typescriptlang.org) (啟用嚴格類型檢查)
- **構建工具:** [Vite](https://vitejs.dev) (自定義 Rolldown-Vite 7.2.5)、[Golang](https://golang.org)(構建跨平台的Web服務端)、[Electron](https://www.electronjs.org)(構建跨平台可視化介面)
- **狀態管理:** [Pinia](https://pinia.vuejs.org) + 持久化插件
- **路由管理:** [Vue Router 4](https://router.vuejs.org)
- **UI 組件:** [shadcn-vue](https://www.shadcn-vue.com) (New York 風格)
- **樣式方案:** [Tailwind CSS v4](https://tailwindcss.com) + CSS 變數
- **圖標庫:** [Lucide Vue Next](https://lucide.dev)
- **動畫效果:** [tw-animate-css](https://www.npmjs.com/package/tw-animate-css)
- **國際化:** 自定義 i18n 實現

## 快速開始

### 環境要求

- [Node.js](https://nodejs.org) (推薦 18 或更高版本)
- [pnpm](https://pnpm.io) (版本 10.13.1 或更高)
- [Go](https://golang.org) (版本 1.21 或更高版本)(可選)

### 安裝

```bash
# 克隆倉庫
git clone https://github.com/setube/ogame-vue-ts.git

# 進入專案目錄
cd ogame-vue-ts

# 安裝依賴
pnpm install
```

### 開發

```bash
# 啟動開發服務器 (運行在端口 25121)
pnpm dev
```

在瀏覽器中訪問 `http://localhost:25121`

### 生產構建

```bash
# 構建應用
pnpm build

# 預覽生產構建
pnpm preview
```

## 數據安全

所有遊戲數據在儲存到瀏覽器的本地存儲之前都會使用 AES 加密自動加密。您的遊戲進度是安全且私密的。

## 自定義

應用支援通過 `src/style.css` 中定義的 Tailwind CSS 變數進行完整的主題自定義。您可以輕鬆地在淺色和深色模式之間切換。

## 貢獻

歡迎貢獻！請隨時提交 issue 或 pull request。

## 許可證

本作品採用 [創用CC 姓名標示-非商業性 4.0 國際 授權條款](https://creativecommons.org/licenses/by-nc/4.0) 授權。

### 您可以自由地：
- **分享** — 以任何媒介或格式重製及散布本素材
- **修改** — 重混、轉換本素材、及依本素材建立新素材

### 惟需遵照下列條件：
- **姓名標示** — 您必須給予適當表彰、提供指向本授權條款的連結，以及指出是否已對本素材進行變更
- **非商業性** — 您不得將本素材用於商業目的

## 致謝

本專案受原版 [OGame](https://ogame.org) 瀏覽器遊戲啟發。所有遊戲機制和設計元素都是為了教育和娛樂目的而重新實現的。

## 免責聲明

本專案與 Gameforge AG 或官方 OGame 遊戲沒有任何關聯、認可或聯繫。這是一個獨立的粉絲專案，創建目的僅用於教育和個人娛樂。

---

<div align="center">
  用 ❤️ 製作，作者：<a href="https://github.com/setube">setube</a>
  <br>
  © 2025 - 保留所有權利（除 CC BY-NC 4.0 許可證授予的權利外）
</div>
