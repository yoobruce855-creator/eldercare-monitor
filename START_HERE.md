# 🚀 ElderCare Monitor - 완벽한 실행 가이드

## ✅ 백업 완료!

**백업 위치:** `backups/backup_20251207_152110/`
- 총 27개 파일
- 305.96 KB
- 언제든지 복원 가능!

**복원 방법:**
```powershell
Copy-Item -Path 'backups\backup_20251207_152110\*' -Destination '.' -Recurse -Force
```

---

## 🎯 3단계로 완벽하게 테스트하기

### ✨ 준비 사항

**Node.js 설치 확인:**
```powershell
node --version
npm --version
```

**설치 안 되어 있다면:**
1. https://nodejs.org 접속
2. LTS 버전 다운로드 (권장)
3. 설치 후 PowerShell 재시작

---

## 🚀 STEP 1: 서버 시작

### 1-1. 서버 디렉토리로 이동
```powershell
cd server
```

### 1-2. 의존성 설치 (최초 1회만)
```powershell
npm install
```

**설치되는 패키지:**
- express (웹 서버)
- ws (WebSocket)
- cors (CORS 처리)
- helmet (보안)
- compression (압축)
- morgan (로깅)

### 1-3. 서버 시작
```powershell
npm start
```

**성공 시 출력:**
```
🚀 ===== ElderCare Monitor Server =====

📡 HTTP Server: http://localhost:3000
🔌 WebSocket Server: ws://localhost:8080

📱 Access Points:
   Desktop Dashboard: http://localhost:3000/index.html
   Mobile App: http://localhost:3000/mobile/index.html

✅ Server is ready!
```

**이 터미널은 그대로 두세요!** (서버 실행 중)

---

## 🧪 STEP 2: 통합 테스트 실행

### 2-1. 새 PowerShell 창 열기
- Windows 키 + X → "Windows PowerShell"
- 또는 새 터미널 탭 열기

### 2-2. 프로젝트 루트로 이동
```powershell
cd C:\Users\yoost\.gemini\antigravity\scratch\elderly-care-monitor
```

### 2-3. 통합 테스트 실행
```powershell
node test-integration.js
```

**예상 결과:**
```
🧪 ===== ElderCare Monitor Integration Test =====

✅ Health Check
✅ GET /api/sensor-data
✅ POST /api/sensor-data
✅ GET /api/history
✅ GET /api/statistics
✅ POST /api/simulate/fall
✅ POST /api/simulate/apnea
✅ POST /api/simulate/normal
✅ WebSocket Connection
✅ WebSocket Initial Data
✅ WebSocket Update Message
✅ WebSocket Alert Message
✅ Start Auto Simulation
✅ Stop Auto Simulation
✅ Desktop Dashboard (index.html)
✅ Mobile App (mobile/index.html)
✅ PWA Manifest

==================================================
📊 Test Results Summary
==================================================
✅ Passed: 18
❌ Failed: 0
⏱️  Duration: 15.23s
==================================================

🎉 All tests passed! System is fully operational.
```

---

## 🌐 STEP 3: 웹/모바일 앱 열기

### 3-1. 데스크톱 대시보드
**브라우저에서 열기:**
```
http://localhost:3000/index.html
```

**확인 사항:**
- ✅ 실시간 상태 표시 (정상/낙상/무호흡)
- ✅ 심박수, 호흡수 표시
- ✅ 활동 모니터
- ✅ 이벤트 이력
- ✅ 실시간 차트

### 3-2. 모바일 앱
**브라우저에서 열기:**
```
http://localhost:3000/mobile/index.html
```

**확인 사항:**
- ✅ 모바일 최적화 UI
- ✅ 실시간 데이터 업데이트
- ✅ 알림 배너
- ✅ 이벤트 이력
- ✅ 긴급 연락처

### 3-3. 여러 창 동시에 열기
1. 데스크톱 대시보드 (Chrome)
2. 모바일 앱 (Chrome 새 탭)
3. 모바일 앱 (Edge 또는 다른 브라우저)

**→ 모든 창이 동시에 같은 데이터를 받아야 합니다!**

---

## 🎬 STEP 4: 실시간 연동 테스트

### 4-1. 센서 시뮬레이터 실행

**새 PowerShell 창 열기:**
```powershell
cd C:\Users\yoost\.gemini\antigravity\scratch\elderly-care-monitor\server
node sensor-simulator.js demo
```

**동작:**
- 2초마다 센서 데이터 전송
- 자동 시나리오:
  - 0-10초: ✅ 정상
  - 10-16초: 🚨 낙상 감지!
  - 16-26초: ✅ 정상 복귀
  - 26-32초: ⚠️ 무호흡 감지!
  - 32-42초: ✅ 정상 복귀
  - (반복)

**확인 사항:**
- [ ] 웹/모바일 화면이 **실시간으로** 업데이트됨
- [ ] 낙상 발생 시 빨간색 알림 배너 표시
- [ ] 무호흡 발생 시 주황색 알림 배너 표시
- [ ] 이벤트 이력에 자동으로 추가됨
- [ ] 차트가 실시간으로 그려짐
- [ ] **모든 열린 창이 동시에 업데이트됨**

### 4-2. 수동 테스트 (브라우저 콘솔)

**F12 → Console 탭에서 실행:**

```javascript
// 낙상 시뮬레이션
fetch('http://localhost:3000/api/simulate/fall', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

**2초 후:**
```javascript
// 무호흡 시뮬레이션
fetch('http://localhost:3000/api/simulate/apnea', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

**2초 후:**
```javascript
// 정상 복귀
fetch('http://localhost:3000/api/simulate/normal', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

---

## 📱 STEP 5: 모바일 기기에서 테스트 (선택사항)

### 5-1. PC IP 주소 확인
```powershell
ipconfig
```
→ "IPv4 주소" 찾기 (예: 192.168.0.10)

### 5-2. 방화벽 설정
**Windows Defender 방화벽:**
1. Windows 키 → "방화벽" 검색
2. "고급 설정"
3. "인바운드 규칙" → "새 규칙"
4. "포트" → TCP → 3000, 8080 입력
5. "연결 허용" → 완료

### 5-3. 모바일에서 접속
**같은 Wi-Fi에 연결 후:**
```
http://[PC의 IP]:3000/mobile/index.html

예: http://192.168.0.10:3000/mobile/index.html
```

### 5-4. PWA 설치
**Android (Chrome):**
- 메뉴(⋮) → "홈 화면에 추가"

**iOS (Safari):**
- 공유 버튼 → "홈 화면에 추가"

---

## 🎯 완벽한 연동 확인 체크리스트

### 서버
- [ ] HTTP 서버 실행 중 (포트 3000)
- [ ] WebSocket 서버 실행 중 (포트 8080)
- [ ] 통합 테스트 18개 모두 통과

### 웹 대시보드
- [ ] 페이지가 정상적으로 열림
- [ ] 실시간 데이터 표시됨
- [ ] 차트가 그려짐
- [ ] 알림이 작동함

### 모바일 앱
- [ ] 페이지가 정상적으로 열림
- [ ] 모바일 최적화 UI 표시
- [ ] 실시간 데이터 업데이트
- [ ] 알림이 작동함

### 실시간 연동
- [ ] 센서 시뮬레이터 데이터가 전송됨
- [ ] 웹/모바일이 **동시에** 업데이트됨
- [ ] 낙상/무호흡 알림이 모든 클라이언트에 표시됨
- [ ] 여러 브라우저/탭에서 동시 작동

### 다중 클라이언트
- [ ] 3개 이상의 창을 동시에 열 수 있음
- [ ] 모든 창이 같은 데이터를 받음
- [ ] 한 창에서 알림이 뜨면 모든 창에 표시됨

---

## 🐛 문제 해결

### "node를 찾을 수 없습니다"
→ Node.js 설치 필요: https://nodejs.org

### "포트 3000이 이미 사용 중"
```powershell
# 포트 사용 중인 프로세스 찾기
netstat -ano | findstr :3000

# 프로세스 종료
taskkill /PID [PID번호] /F
```

### "WebSocket 연결 실패"
1. 서버가 실행 중인지 확인
2. 방화벽 설정 확인
3. 브라우저 콘솔에서 에러 확인

### "모바일에서 접속 안 됨"
- [ ] PC와 모바일이 같은 Wi-Fi인가?
- [ ] 방화벽에서 3000, 8080 포트 허용했는가?
- [ ] IP 주소가 정확한가?

---

## 🎉 성공!

모든 단계를 완료했다면:

✅ **서버가 완벽하게 작동**합니다
✅ **웹과 모바일이 실시간으로 연동**됩니다
✅ **다중 클라이언트 동시 접속**이 가능합니다
✅ **긴급 알림 시스템**이 작동합니다

---

## 📚 추가 문서

- **[완벽한 테스트 가이드](COMPLETE_TESTING_GUIDE.md)** - 상세한 테스트 방법
- **[서버 완성 가이드](SERVER_COMPLETE.md)** - 서버 API 문서
- **[모바일 앱 가이드](MOBILE_APP_COMPLETE.md)** - 모바일 앱 사용법
- **[실용 적용 가이드](PRACTICAL_APPLICATION_GUIDE.md)** - 실제 적용 방법

---

## 💾 백업 정보

**현재 백업:** `backups/backup_20251207_152110/`

**새 백업 만들기:**
```powershell
powershell -ExecutionPolicy Bypass -File backup.ps1
```

**백업 복원:**
```powershell
Copy-Item -Path 'backups\backup_20251207_152110\*' -Destination '.' -Recurse -Force
```

**백업 목록 확인:**
```powershell
Get-Content backups\BACKUP_LIST.md
```

---

**Made with ❤️ for Elder Care**
