# 🚀 ElderCare Monitor - 웹 배포 가이드

## 📦 배포 폴더 구성

이 폴더는 **무료 웹 호스팅**에 배포할 수 있는 정적 파일들을 포함하고 있습니다.

---

## 🌐 무료 배포 방법 (3가지)

### 방법 1: Netlify Drop (가장 쉬움!) ⭐

**단계:**
1. https://app.netlify.com/drop 접속
2. 이 `deploy` 폴더를 드래그 & 드롭
3. 즉시 배포 완료! (URL 자동 생성)

**장점:**
- ✅ 회원가입 불필요
- ✅ 드래그 & 드롭만으로 배포
- ✅ HTTPS 자동 적용
- ✅ 즉시 배포 (1분 이내)

**예상 URL:**
```
https://random-name-123456.netlify.app
```

---

### 방법 2: GitHub Pages

**단계:**
1. GitHub 계정 생성 (없다면)
2. 새 Repository 생성 (예: `eldercare-monitor`)
3. 이 폴더의 파일들을 업로드
4. Settings → Pages → Source: `main` branch 선택
5. 배포 완료!

**예상 URL:**
```
https://[username].github.io/eldercare-monitor
```

---

### 방법 3: Vercel

**단계:**
1. https://vercel.com 접속 및 회원가입
2. "New Project" 클릭
3. 이 폴더를 업로드 또는 GitHub 연동
4. 배포 완료!

**예상 URL:**
```
https://eldercare-monitor.vercel.app
```

---

## 📁 배포 파일 구조

```
deploy/
├── index.html          # 랜딩 페이지 (메인)
├── README.md           # 이 파일
└── (추가 파일들)
```

---

## 🎯 배포 후 확인 사항

### ✅ 랜딩 페이지
- [ ] 페이지가 정상적으로 로드됨
- [ ] 모든 섹션이 표시됨
- [ ] 링크가 작동함

### ✅ 데모 링크
- [ ] 데스크톱 대시보드 링크 작동
- [ ] 모바일 앱 링크 작동
- [ ] 문서 다운로드 작동

---

## 🚀 빠른 배포 (Netlify Drop)

### 1단계: Netlify Drop 접속
```
https://app.netlify.com/drop
```

### 2단계: 폴더 드래그 & 드롭
```
이 deploy 폴더를 브라우저 창에 드래그 & 드롭
```

### 3단계: 배포 완료!
```
자동으로 URL 생성됨
예: https://eldercare-monitor-abc123.netlify.app
```

---

## 📝 배포 후 할 일

### 1. URL 공유
배포된 URL을 복사하여 공유하세요:
```
https://your-site.netlify.app
```

### 2. 커스텀 도메인 (선택사항)
Netlify/Vercel에서 커스텀 도메인 연결 가능:
```
예: eldercare-monitor.com
```

### 3. HTTPS 확인
모든 무료 호스팅은 자동으로 HTTPS를 제공합니다.

---

## ⚠️ 주의사항

### 정적 파일만 배포됨
현재 배포는 **랜딩 페이지만** 포함합니다.

**완전한 기능을 사용하려면:**
1. Node.js 설치
2. 로컬에서 서버 실행
3. 또는 클라우드 서버 배포 (AWS, GCP, Heroku 등)

### 서버 배포 (고급)
완전한 서버 배포는 다음 문서 참조:
- **DEPLOYMENT_GUIDE.md** - 클라우드 배포 가이드
- **START_HERE.md** - 로컬 실행 가이드

---

## 🎉 배포 완료 체크리스트

- [ ] Netlify/GitHub Pages/Vercel 중 하나 선택
- [ ] deploy 폴더 업로드
- [ ] 배포 URL 확인
- [ ] 랜딩 페이지 정상 작동 확인
- [ ] 링크 테스트
- [ ] URL 공유

---

## 📞 도움말

### Netlify Drop
- **URL:** https://app.netlify.com/drop
- **문서:** https://docs.netlify.com

### GitHub Pages
- **URL:** https://pages.github.com
- **문서:** https://docs.github.com/pages

### Vercel
- **URL:** https://vercel.com
- **문서:** https://vercel.com/docs

---

## 🎊 완료!

배포가 완료되면 전 세계 어디서나 접속 가능합니다!

**Made with ❤️ for Elder Care**
