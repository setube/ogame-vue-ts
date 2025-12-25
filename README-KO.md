<div align="center">
  <img src="public/logo.svg" alt="OGame Vue TS Logo" width="128" height="128">

  # OGame Vue TS

  Vue 3와 TypeScript로 제작된 클래식 OGame을 기반으로 한 현대적인 우주 전략 게임입니다.

  [![GitHub Release](https://img.shields.io/github/v/release/setube/ogame-vue-ts?style=flat&logo=github&label=Release)](https://github.com/setube/ogame-vue-ts/releases/latest)
  [![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0)
  [![Tap Tap](https://img.shields.io/badge/TapTap-OGame%20Vue%20Ts-18d6e0)](https://www.taptap.cn/app/801190)

  [简体中文](README.md) | [繁體中文](README-zh-TW.md) | [English](README-EN.md) | [Deutsch](README-DE.md) | [Русский](README-RU.md) | [Español](README-ES.md) | 한국어 | [日本語](README-JA.md)

</div>

## 프로젝트 소개

OGame Vue TS는 클래식 OGame에서 영감을 받은 싱글플레이어 브라우저 기반 우주 전략 게임입니다. 은하계에서 제국을 건설하고, 기술을 연구하고, 우주선을 제작하고, 장대한 우주 전투에 참여하세요. 이 프로젝트는 현대 웹 기술로 제작되었으며, 로컬 데이터 저장과 함께 브라우저에서 완전히 실행됩니다.

## 주요 기능

- **건물 관리** - 행성과 달에서 다양한 건물을 건설하고 업그레이드
- **기술 연구** - 제국을 강화하기 위한 첨단 기술 해금
- **함대 관리** - 우주선 건조, 미션 파견, 전술적 우주 전투 참여
- **방어 시스템** - 식민지 보호를 위한 방어 시설 배치
- **장교 시스템** - 전략적 이점을 위한 장교 고용
- **전투 시뮬레이터** - 자원 투입 전 전투 시나리오 테스트
- **은하 뷰** - 우주 탐험 및 다른 행성과의 상호작용
- **로컬 데이터 저장** - 모든 게임 데이터는 암호화되어 브라우저에 로컬 저장
- **다크/라이트 모드** - 선호하는 비주얼 테마 선택
- **대기열 관리** - 여러 건설 및 연구 대기열 관리
- **달 생성** - 잔해 필드에서 확률 기반 달 생성

## 기술 스택

- **프론트엔드 프레임워크:** [Vue 3](https://vuejs.org) + Composition API (`<script setup>` 문법)
- **프로그래밍 언어:** [TypeScript](https://www.typescriptlang.org) (엄격한 타입 검사 활성화)
- **빌드 도구:** [Vite](https://vitejs.dev) (Custom Rolldown-Vite 7.2.5), [Golang](https://golang.org) (크로스 플랫폼 웹 서버 구축), [Electron](https://www.electronjs.org) (크로스 플랫폼 데스크톱 애플리케이션 구축)
- **상태 관리:** [Pinia](https://pinia.vuejs.org) + 지속성 플러그인
- **라우팅:** [Vue Router 4](https://router.vuejs.org)
- **UI 컴포넌트:** [shadcn-vue](https://www.shadcn-vue.com) (New York 스타일)
- **스타일링:** [Tailwind CSS v4](https://tailwindcss.com) + CSS 변수
- **아이콘:** [Lucide Vue Next](https://lucide.dev)
- **애니메이션:** [tw-animate-css](https://www.npmjs.com/package/tw-animate-css)
- **국제화:** 커스텀 i18n 구현

## 빠른 시작

### 요구 사항

- [Node.js](https://nodejs.org) (버전 18 이상 권장)
- [pnpm](https://pnpm.io) (버전 10.13.1 이상)
- [Go](https://golang.org) (버전 1.21 이상) (선택 사항)

### 설치

```bash
# 저장소 클론
git clone https://github.com/setube/ogame-vue-ts.git

# 프로젝트 디렉토리로 이동
cd ogame-vue-ts

# 의존성 설치
pnpm install
```

### 개발

```bash
# 개발 서버 시작 (포트 25121에서 실행)
pnpm dev
```

브라우저를 열고 `http://localhost:25121`로 이동하세요

### 프로덕션 빌드

```bash
# 애플리케이션 빌드
pnpm build

# 프로덕션 빌드 미리보기
pnpm preview
```

## 데이터 보안

모든 게임 데이터는 브라우저의 로컬 스토리지에 저장되기 전에 AES 암호화로 자동 암호화됩니다. 게임 진행 상황은 안전하고 비공개로 유지됩니다.

## 커스터마이징

애플리케이션은 `src/style.css`에 정의된 Tailwind CSS 변수를 통해 완전한 테마 커스터마이징을 지원합니다. 라이트 모드와 다크 모드 간에 쉽게 전환할 수 있습니다.

## 기여

기여를 환영합니다! 이슈나 풀 리퀘스트를 자유롭게 제출해 주세요.

## 라이선스

이 작품은 [크리에이티브 커먼즈 저작자표시-비영리 4.0 국제 라이선스](https://creativecommons.org/licenses/by-nc/4.0)에 따라 라이선스가 부여됩니다.

### 자유롭게:
- **공유** — 어떤 매체나 포맷으로든 자료를 복사하고 재배포할 수 있습니다
- **변경** — 자료를 리믹스, 변형하고 자료를 기반으로 2차 저작물을 만들 수 있습니다

### 다음 조건을 따라야 합니다:
- **저작자표시** — 적절한 출처를 표시하고, 라이선스 링크를 제공하며, 변경이 있었는지 표시해야 합니다
- **비영리** — 이 자료를 상업적 목적으로 사용할 수 없습니다

## 감사의 말

이 프로젝트는 원작 [OGame](https://ogame.org) 브라우저 게임에서 영감을 받았습니다. 모든 게임 메커니즘과 디자인 요소는 교육 및 오락 목적으로 재구현되었습니다.

## 면책 조항

이 프로젝트는 Gameforge AG 또는 공식 OGame 게임과 제휴, 보증 또는 연결되어 있지 않습니다. 이것은 교육 목적과 개인적인 즐거움을 위해 만들어진 독립적인 팬 프로젝트입니다.

---

<div align="center">
  ❤️를 담아 제작, 작성자: <a href="https://github.com/setube">setube</a>
  <br>
  © 2025 - 모든 권리 보유 (CC BY-NC 4.0 라이선스에 의해 부여된 권리 제외)
</div>
