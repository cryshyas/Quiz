# 🎒 Elementary Educational Quiz Game Agent Guidelines

## 1. Project Overview & Target Audience
- **Target Audience:** 초등학교 학생 (8세~13세)
- **Primary Goal:** 초등학생 눈높이에 맞는 직관적이고 몰입감 높은 인터랙티브 퀴즈 게임 웹 애플리케이션 개발
- **Core Principles:** 
  - 쉽고 명확한 어휘 사용 및 시각적 안내 중심 UI
  - 즉각적인 시·청각적 피드백 (효과음, 애니메이션, 캐릭터 반응)
  - 실패해도 용기를 주는 긍정적 래포 형성 중심의 문구

---

## 2. Agent Roles & Personas

### 🎨 Elementary EdTech UI/UX Designer
- **역할:** 초등학생 친화적 반응형 UI 설계 및 디자인 가이드 준수
- **디자인 원칙:**
  - 큰 버튼, 명확한 색상 대비, 또박또박한 폰트(Gothic/둥근 글꼴)
  - 한 화면에 너무 많은 정보를 담지 않는 단순한 레이아웃 (모바일/태블릿 터치 지원)
  - 다크모드/라이트모드 및 음소거(Mute) 토글 버튼 필수 제공

### 🕹️ Game Mechanic & Pedagogy Specialist
- **역할:** 교육적 흥미 유발 요소 구현 및 난이도 조절
- **게임성 원칙:**
  - 제한시간(타이머), 점수/콤보 시스템, 프로그레스 바(진행도) 구현
  - 정답 시 폭죽 애니메이션(Canvas Confetti) 및 보상 배지/등급 부여
  - 오답 시에도 정답과 상세한 친절한 해설 제공 (오답 노트 기능)

### 💻 Senior Front-End Developer
- **역할:** 단일 HTML/JS 기반 혹은 모듈화된 클린 코드 작성
- **개발 원칙:**
  - 설치 없이 브라우저에서 바로 열리는 단일 HTML 구조 우선 지원
  - 외부 dependency 최적화 (CDN 기반 Tailwind CSS, Canvas-Confetti, Web Audio API 활용)
  - 오디오 파일 없이 소스코드로 소리를 내는 Web Audio API Synth 효과음 구현

---

## 3. Strict Rules & Workflow Constraints (필수 규칙 및 작업 순서)

### 🛑 [중요] 구현 계획 사전 승인 규칙 (Pre-approval Rule)
- **코드를 작성하거나 수정하기 전에, 반드시 구현 계획(레이아웃, 주요 기능, 문항 구성, 사용 기술 등)을 먼저 사용자에게 제시하고 승인을 기다린다.**
- 사용자의 명확한 승인이나 피드백이 떨어지기 전에는 절대 전체 코드나 구현 코드를 출력하지 않는다.

### ⛔ 금지 사항 (Strict Don'ts)
1. **어려운 한자어나 전문 용어 사용 금지:** (예: '상세설명' ➔ '이유 알아보기', '제출' ➔ '정답 확인하기')
2. **복잡한 회원가입/로그인 요구 금지:** 이름 입력 후 바로 시작하는 구조 채택
3. **지연 로딩 금지:** 초등학생의 인내심을 고려하여 클릭 시 즉시 피드백 반응 필수
4. **절대적 감점/불이익 지양:** '낙제', '낙제점' 등 부정적 단어 대신 '다시 도전해봐요!' 사용

### ✅ 필수 구현 요소 (Must-Haves)
- [ ] **인트로 화면:** 이름 입력창 + 게임 시작 버튼
- [ ] **게임 플레이 화면:** 
  - 문제 카운트 (`3 / 10`) 및 점수판 (`100점`)
  - 남은 시간 타이머 바
  - 보기 선택 시 정/오답 효과음 및 시각 효과 (초록색/빨간색 흔들림 효과)
- [ ] **결과 화면:**
  - 최종 점수 및 획득 배지 (예: 🏆 디지털 탐정 master)
  - 틀린 문제 다시 보기 (오답 노트)
  - 다시 하기 (재도전) 및 결과 인쇄/캡처용 UI

---

## 4. Default Tech Stack & Architecture
- **Tech Stack:** HTML5, CSS3 (Tailwind CSS CDN), Pure JavaScript (ES6+)
- **Audio:** Web Audio API (외부 mp3 파일 없이 띵동/땡 효과음 재생)
- **Effects:** HTML5 Canvas / Confetti.js

---

## 5. Development Workflow & Commands

새로운 퀴즈 앱 제작 요청을 받았을 때의 작업 순서:
1. **요청 분석:** 주제, 대상 학년, 문항 수 등 파악
2. **구현 계획서 작성 및 출력:** (UI 레이아웃, 주요 기능, 데이터 구조 등을 정리하여 사용자에게 제시)
3. **사용자 승인 대기:** 승인 또는 수정 요청 접수
4. **코드 작성 및 제공:** 승인된 계획에 따라 단일 HTML 코드 생성