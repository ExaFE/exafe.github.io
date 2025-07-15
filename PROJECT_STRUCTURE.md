# ExaFE 프로젝트 구조 규칙

## 📁 폴더 구조

```
exafe.github.io/
├── index.html              # 메인 페이지
├── assets/                 # 공통 자산 (아이콘, 로고 등)
│   ├── exafe-logo-*.ico
│   ├── exafe-logo-*.png
│   └── tools/              # 도구별 자산
│       └── tool_name/
│           ├── favicon.ico
│           └── icon.png
├── source/                 # 소스 코드 (개발용)
│   ├── extension/          # 브라우저 확장 프로그램
│   └── ahk/               # AutoHotkey 스크립트
└── tools/                  # 웹 도구들
    └── tool_name/
        ├── index.html      # 도구 실행 페이지
        └── guide.html      # 도구 사용 가이드
```

## 🔧 도구 관리 규칙

### 1. 도구 폴더 명명 규칙

- 소문자 사용
- 단어 구분은 언더스코어(\_) 또는 하이픈(-) 사용
- 의미가 명확한 이름 사용

### 2. 각 도구 폴더 필수 파일

- **index.html**: 도구의 메인 실행 페이지
- **guide.html**: 도구 사용 가이드 페이지

### 3. 가이드 페이지 필수 요소

- 상세한 사용방법 설명
- 주요 기능 소개
- 실제 사용 예시
- 활용 팁
- 주의사항
- 기술 정보

### 4. 메타데이터 규칙

- 모든 HTML 파일에 적절한 title, description 포함
- 파비콘 설정: `../../assets/exafe-logo-114.ico`
- 뷰포트 메타태그 필수

## 🎨 스타일 가이드

### 1. 공통 스타일

- 반응형 디자인 필수
- 다크 모드 지원 (`@media (prefers-color-scheme: dark)`)
- 접근성 고려 (ARIA 레이블, 키보드 네비게이션)

### 2. 색상 테마

- 기본 색상: #3498db (파란색)
- 성공 색상: #27ae60 (초록색)
- 경고 색상: #f39c12 (주황색)
- 오류 색상: #e74c3c (빨간색)

### 3. 폰트

- 기본 폰트: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- 코드 폰트: 'Consolas', 'Monaco', monospace

## 🔗 링크 구조

### 1. 상대 경로 사용

- 절대 경로 사용 금지
- 로컬 개발과 GitHub Pages 모두 지원

### 2. 링크 패턴

- 메인 페이지: `../../`
- 도구 실행: `./` (가이드 페이지에서)
- 사용방법: `./guide.html` (메인 페이지에서 `./tools/tool_name/guide.html`)

### 3. 필수 링크 구조

```html
<!-- 가이드 페이지에서 -->
<a href="../../">메인으로 돌아가기</a>
<a href="./">도구 실행하기</a>

<!-- 메인 페이지에서 -->
<a href="./tools/tool_name/guide.html">사용방법 확인하기</a>
<a href="./tools/tool_name/">실행하기</a>
```

## 📝 개발 가이드라인

### 1. 새 도구 추가 시

1. `tools/` 폴더에 도구명 폴더 생성
2. `index.html` 파일 생성 (도구 실행 페이지)
3. `guide.html` 파일 생성 (사용 가이드 페이지)
4. 메인 페이지에 도구 소개 추가
5. 필요시 `assets/tools/` 폴더에 도구별 자산 추가

### 2. 코드 품질 기준

- 바닐라 자바스크립트 사용 (외부 라이브러리 최소화)
- 에러 처리 및 사용자 피드백 포함
- 브라우저 호환성 고려
- 성능 최적화 (lazy loading, 효율적인 DOM 조작)

### 3. 접근성 기준

- 시맨틱 HTML 사용
- ARIA 레이블 적절히 사용
- 키보드 네비게이션 지원
- 적절한 색상 대비 유지

## 🚀 배포 규칙

### 1. GitHub Pages 호환성

- 상대 경로만 사용
- 정적 파일만 포함
- 브라우저 캐싱 고려

### 2. SEO 최적화

- 적절한 메타 태그 포함
- 구조화된 데이터 (JSON-LD) 사용
- 시맨틱 HTML 구조 유지

### 3. 성능 최적화

- 이미지 최적화
- CSS/JS 압축
- 불필요한 파일 제거

## 📧 연락처 정보

- **이메일**: `imincheol+exafe1009@gmail.com`
- **YouTube**: `https://www.youtube.com/@exa1009`

---

이 규칙은 ExaFE 프로젝트의 일관성과 품질을 유지하기 위한 가이드라인입니다.
새로운 도구나 기능을 추가할 때는 반드시 이 규칙을 따라주세요.
