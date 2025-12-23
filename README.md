<div align="center">
  <img src="public/logo.svg" alt="OGame Vue TS Logo" width="128" height="128">

  # OGame Vue TS

  一个基于 Vue 3 和 TypeScript 构建的现代化 OGame 太空策略游戏。

  [![GitHub Release](https://img.shields.io/github/v/release/setube/ogame-vue-ts?style=flat&logo=github&label=Release)](https://github.com/setube/ogame-vue-ts/releases/latest)
  [![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
  [![Vue 3](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-7.2-646CFF.svg)](https://vitejs.dev/)
  [![Go](https://img.shields.io/badge/Go-1.23-79D4FD.svg)](https://golang.org/)


  [![Android x86_64](https://img.shields.io/badge/Android-x86__64-3DDC84?logo=android&logoColor=white)](https://github.com/setube/ogame-vue-ts/releases/latest/download/OGame-x86_64.APK)
  [![Android arm64](https://img.shields.io/badge/Android-arm64--v8a-3DDC84?logo=android&logoColor=white)](https://github.com/setube/ogame-vue-ts/releases/latest/download/OGame-arm64-v8a.APK)
  [![Android armv7](https://img.shields.io/badge/Android-armeabi--v7a-3DDC84?logo=android&logoColor=white)](https://github.com/setube/ogame-vue-ts/releases/latest/download/OGame-armeabi-v7a.APK)

  [![Windows Server](https://img.shields.io/badge/Server-Windows-0078D6?logo=windows&logoColor=white)](https://github.com/setube/ogame-vue-ts/releases/latest/download/ogame-server-win.exe)
  [![Linux](https://img.shields.io/badge/Server-Linux%20amd64-FCC624?logo=linux&logoColor=black)](https://github.com/setube/ogame-vue-ts/releases/latest/download/ogame-server-linux)
  [![Linux arm64](https://img.shields.io/badge/Server-Linux%20amd64-FCC624?logo=linux&logoColor=black)](https://github.com/setube/ogame-vue-ts/releases/latest/download/ogame-server-linux-arm64)
  [![macOS](https://img.shields.io/badge/Server-macOS%20ARM-000000?logo=apple&logoColor=white)](https://github.com/setube/ogame-vue-ts/releases/latest/download/OGame-mac.dmg)

  [![Windows Desktop](https://img.shields.io/badge/Desktop-Windows-0078D6?logo=windows&logoColor=white)](https://github.com/setube/ogame-vue-ts/releases/latest/download/OGame-Setup.exe)
  [![Ubuntu Desktop](https://img.shields.io/badge/Desktop-Ubuntu-E95420?logo=ubuntu&logoColor=white)](https://github.com/setube/ogame-vue-ts/releases/latest/download/OGame-linux.AppImage)
  [![macOS Desktop](https://img.shields.io/badge/Desktop-macOS-000000?logo=apple&logoColor=white)](https://github.com/setube/ogame-vue-ts/releases/latest/download/OGame-mac.dmg)

  简体中文 | [English](README-EN.md) | [繁體中文](README-zh-TW.md) | [Deutsch](README-DE.md) | [Русский](README-RU.md) | [한국어](README-KO.md)

</div>

## 关于项目

OGame Vue TS 是一款受经典 OGame 游戏启发的单机版、基于浏览器的太空策略游戏。在银河系中建立你的帝国，研究科技，建造舰船，参与史诗般的太空战斗。本项目采用现代 Web 技术构建，完全在浏览器中运行，提供流畅且响应迅速的游戏体验，所有数据都存储在本地。

## 核心特性

- **多语言支持** - 支持 6 种语言：英语、简体中文、繁体中文、德语、俄语和韩语
- **建筑管理** - 在行星和月球上建造和升级各种建筑
- **科技研究** - 解锁先进科技来增强你的帝国
- **舰队管理** - 建造舰船、派遣任务、参与战术太空战斗
- **防御系统** - 部署防御设施来保护你的殖民地
- **军官系统** - 招募军官以获得战略优势
- **战斗模拟器** - 在投入资源前测试战斗场景
- **银河视图** - 探索宇宙并与其他星球互动
- **本地数据持久化** - 所有游戏数据都经过加密并存储在浏览器本地
- **深色/浅色主题** - 选择你喜欢的视觉主题
- **队列管理** - 管理多个建造和研究队列
- **月球生成** - 基于概率的月球从残骸场生成机制

## 技术栈

- **前端框架:** [Vue 3](https://vuejs.org/) + Composition API (`<script setup>` 语法)
- **开发语言:** [TypeScript](https://www.typescriptlang.org/) (启用严格类型检查)
- **构建工具:** [Vite](https://vitejs.dev/) (自定义 Rolldown-Vite 7.2.5)、[Golang](https://golang.org/)(构建跨平台的Web服务端)、[Electron](https://www.electronjs.org/)(构建跨平台可视化界面)
- **状态管理:** [Pinia](https://pinia.vuejs.org/) + 持久化插件
- **路由管理:** [Vue Router 4](https://router.vuejs.org/)
- **UI 组件:** [shadcn-vue](https://www.shadcn-vue.com/) (New York 风格)
- **样式方案:** [Tailwind CSS v4](https://tailwindcss.com/) + CSS 变量
- **图标库:** [Lucide Vue Next](https://lucide.dev/)
- **动画效果:** [tw-animate-css](https://www.npmjs.com/package/tw-animate-css)
- **国际化:** 自定义 i18n 实现

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) (推荐 18 或更高版本)
- [pnpm](https://pnpm.io/) (版本 10.13.1 或更高)
- [Go](https://golang.org/) (版本 1.21 或更高版本)(可选)

### 安装

```bash
# 克隆仓库
git clone https://github.com/setube/ogame-vue-ts.git

# 进入项目目录
cd ogame-vue-ts

# 安装依赖
pnpm install
```

### 开发

```bash
# 启动开发服务器 (运行在端口 25121)
pnpm dev
```

在浏览器中访问 `http://localhost:25121`

### 生产构建

```bash
# 构建应用
pnpm build

# 预览生产构建
pnpm preview
```

## 支持的语言

- 简体中文
- 繁體中文
- English (英语)
- Deutsch (德语)
- Русский (俄语)
- 한국어 (韩语)

## 游戏特性

### 资源管理
- **金属** - 主要建筑材料
- **晶体** - 高级科技组件
- **重氢** - 燃料和研究资源
- **暗物质** - 高级资源
- **能量** - 为设施供电

### 建筑类型
- **资源建筑** - 金属矿、晶体矿、重氢合成器、太阳能发电厂
- **设施建筑** - 机器人工厂、船坞、研究实验室、仓储设施
- **特殊建筑** - 纳米机器人工厂、行星改造器等

### 科技系统
- **能量技术** - 提高能量效率
- **激光技术** - 增强武器系统
- **离子技术** - 高级推进和武器
- **超空间技术** - 实现更快的旅行
- **等离子技术** - 终极武器系统
- 还有更多...

### 舰船类别
- **民用舰船** - 小型/大型货船、殖民船、回收船
- **战斗舰船** - 轻型/重型战斗机、巡洋舰、战列舰、轰炸机
- **特殊舰船** - 死星、战列巡洋舰、毁灭者

### 防御系统
- 火箭发射器、轻型/重型激光炮、高斯炮
- 离子炮、等离子炮塔
- 小型/大型防护罩

## 数据安全

所有游戏数据在存储到浏览器的本地存储之前都会使用 AES 加密自动加密。您的游戏进度是安全且私密的。

## 自定义

应用支持通过 `src/style.css` 中定义的 Tailwind CSS 变量进行完整的主题自定义。您可以轻松地在浅色和深色模式之间切换。

## 贡献

欢迎贡献！请随时提交 issue 或 pull request。

## 许可证

本作品采用 [知识共享署名-非商业性使用 4.0 国际许可协议](https://creativecommons.org/licenses/by-nc/4.0/) 进行许可。

### 您可以自由地：
- **共享** — 在任何媒介以任何形式复制、发行本作品
- **演绎** — 修改、转换或以本作品为基础进行创作

### 惟须遵守下列条件：
- **署名** — 您必须给出适当的署名，提供指向本许可协议的链接，同时标明是否对原始作品作了修改
- **非商业性使用** — 您不得将本作品用于商业目的

## 致谢

本项目受原版 [OGame](https://ogame.org/) 浏览器游戏启发。所有游戏机制和设计元素都是为了教育和娱乐目的而重新实现的。

## 免责声明

本项目与 Gameforge AG 或官方 OGame 游戏没有任何关联、认可或联系。这是一个独立的粉丝项目，创建目的仅用于教育和个人娱乐。

---

<div align="center">
  用 ❤️ 制作，作者：<a href="https://github.com/setube">setube</a>
  <br>
  © 2025 - 保留所有权利（除 CC BY-NC 4.0 许可证授予的权利外）
</div>
