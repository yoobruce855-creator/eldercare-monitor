# 🧪 완벽한 통합 테스트 가이드

## 📋 개요

이 가이드는 ElderCare Monitor 시스템의 **웹, 모바일, 서버**가 완벽하게 연동되는지 테스트하는 방법을 설명합니다.

## 🎯 테스트 목표

- ✅ 서버가 정상적으로 작동하는지 확인
- ✅ REST API가 올바르게 응답하는지 확인
- ✅ WebSocket 실시간 통신이 작동하는지 확인
- ✅ 웹 대시보드와 모바일 앱이 서버와 연동되는지 확인
- ✅ 센서 데이터가 실시간으로 전송되고 표시되는지 확인
- ✅ 긴급 알림이 정상적으로 발송되는지 확인

---

## 🚀 빠른 시작 (3단계)

### 1️⃣ 서버 실행

```bash
# 서버 디렉토리로 이동
cd server

# 의존성 설치 (최초 1회만)
npm install

# 서버 시작
npm start
```

**예상 출력:**
```
🚀 ===== ElderCare Monitor Server =====

📡 HTTP Server: http://localhost:3000
🔌 WebSocket Server: ws://localhost:8080

📱 Access Points:
   Desktop Dashboard: http://localhost:3000/index.html
   Mobile App: http://localhost:3000/mobile/index.html

✅ Server is ready!
```

### 2️⃣ 자동 통합 테스트 실행

**새 터미널 창을 열고:**

```bash
# 프로젝트 루트 디렉토리에서
node test-integration.js
```

**예상 출력:**
```
🧪 ===== ElderCare Monitor Integration Test =====

📡 Testing Server Health Check...
✅ Health Check
   Uptime: 15s

📊 Testing REST API Endpoints...
✅ GET /api/sensor-data
   Status: normal
✅ POST /api/sensor-data
   Broadcasted to 0 clients
✅ GET /api/history
   Total events: 5
✅ GET /api/statistics
   Normal: 3, Fall: 1, Apnea: 1

🎬 Testing Simulation Endpoints...
✅ POST /api/simulate/fall
   HR: 115, Status: fall
✅ POST /api/simulate/apnea
   BR: 6, Status: apnea
✅ POST /api/simulate/normal
   Status: normal

🔌 Testing WebSocket Connection...
✅ WebSocket Connection
   Connected successfully
✅ WebSocket Initial Data
   Status: normal
✅ WebSocket Update Message
   Status: fall
✅ WebSocket Alert Message
   Alert: 낙상이 감지되었습니다!

⚙️  Testing Auto Simulation...
✅ Start Auto Simulation
   Auto simulation started (2s interval)
✅ Stop Auto Simulation
   Auto simulation stopped

📄 Testing Static File Serving...
✅ Desktop Dashboard (index.html)
   Size: 11968 bytes
✅ Mobile App (mobile/index.html)
   Size: 21935 bytes
✅ PWA Manifest
   App name: ElderCare Monitor

==================================================
📊 Test Results Summary
==================================================
✅ Passed: 18
❌ Failed: 0
⏱️  Duration: 15.23s
==================================================

🎉 All tests passed! System is fully operational.
```

### 3️⃣ 웹/모바일 앱 열기

**데스크톱 대시보드:**
- 브라우저에서 `http://localhost:3000/index.html` 열기

**모바일 앱:**
- 브라우저에서 `http://localhost:3000/mobile/index.html` 열기
- 또는 모바일 기기에서 같은 네트워크의 PC IP로 접속
  - 예: `http://192.168.0.10:3000/mobile/index.html`

---

## 🎬 실시간 연동 테스트

### 시나리오 1: 센서 시뮬레이터로 실시간 데이터 전송

**새 터미널 창을 열고:**

```bash
# 서버 디렉토리로 이동
cd server

# 센서 시뮬레이터 실행 (데모 모드)
node sensor-simulator.js demo
```

**예상 동작:**
1. 센서 시뮬레이터가 2초마다 데이터 전송
2. 웹 대시보드와 모바일 앱에 **실시간으로** 데이터 업데이트
3. 자동 시나리오 진행:
   - 0-10초: 정상 상태 ✅
   - 10-16초: 낙상 감지 🚨
   - 16-26초: 정상 복귀 ✅
   - 26-32초: 무호흡 감지 ⚠️
   - 32-42초: 정상 복귀 ✅
   - (반복)

**확인 사항:**
- [ ] 웹/모바일 화면에서 심박수, 호흡수가 실시간으로 변경됨
- [ ] 낙상/무호흡 발생 시 빨간색 알림 배너 표시
- [ ] 이벤트 이력에 자동으로 추가됨
- [ ] 차트가 실시간으로 업데이트됨

### 시나리오 2: 다중 클라이언트 동시 연결

1. **웹 대시보드** 열기: `http://localhost:3000/index.html`
2. **모바일 앱** 열기 (같은 브라우저 새 탭): `http://localhost:3000/mobile/index.html`
3. **추가 모바일 앱** 열기 (다른 브라우저): `http://localhost:3000/mobile/index.html`

**센서 시뮬레이터 실행:**
```bash
cd server
node sensor-simulator.js random
```

**확인 사항:**
- [ ] 모든 클라이언트가 **동시에** 같은 데이터를 받음
- [ ] 한 클라이언트에서 낙상 알림이 뜨면 모든 클라이언트에 표시됨
- [ ] 서버 콘솔에 "Broadcast to X clients" 메시지 표시

### 시나리오 3: 수동 테스트 (브라우저 콘솔)

**웹 대시보드 또는 모바일 앱에서 F12 → Console 탭 열기**

```javascript
// 1. 낙상 시뮬레이션
fetch('http://localhost:3000/api/simulate/fall', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);

// 2초 대기 후...

// 2. 무호흡 시뮬레이션
fetch('http://localhost:3000/api/simulate/apnea', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);

// 2초 대기 후...

// 3. 정상 복귀
fetch('http://localhost:3000/api/simulate/normal', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

**확인 사항:**
- [ ] 각 명령 실행 시 화면이 즉시 업데이트됨
- [ ] 알림 배너가 정확하게 표시됨
- [ ] 콘솔에 성공 응답 표시

---

## 📱 모바일 기기에서 테스트

### 1. PC의 IP 주소 확인

**Windows:**
```bash
ipconfig
```
→ "IPv4 주소" 확인 (예: 192.168.0.10)

**Mac/Linux:**
```bash
ifconfig
```
→ "inet" 확인

### 2. 방화벽 설정

**Windows Defender 방화벽:**
1. "Windows 보안" → "방화벽 및 네트워크 보호"
2. "고급 설정" → "인바운드 규칙" → "새 규칙"
3. 포트: 3000, 8080 허용

### 3. 모바일 기기에서 접속

**같은 Wi-Fi 네트워크에 연결 후:**

```
http://[PC의 IP 주소]:3000/mobile/index.html

예: http://192.168.0.10:3000/mobile/index.html
```

### 4. PWA 설치 (선택사항)

**Android (Chrome):**
1. 모바일 앱 열기
2. 메뉴(⋮) → "홈 화면에 추가"
3. 앱처럼 사용 가능!

**iOS (Safari):**
1. 모바일 앱 열기
2. 공유 버튼 → "홈 화면에 추가"

---

## 🔧 고급 테스트

### 센서 시뮬레이터 모드

```bash
# 정상 상태만
node sensor-simulator.js normal

# 낙상 상태만
node sensor-simulator.js fall

# 무호흡 상태만
node sensor-simulator.js apnea

# 랜덤 (90% 정상, 5% 낙상, 5% 무호흡)
node sensor-simulator.js random

# 자동 데모 시나리오
node sensor-simulator.js demo
```

### 환경 변수 설정

```bash
# 서버 URL 변경
SERVER_URL=http://192.168.0.10:3000 node sensor-simulator.js demo

# 디바이스 ID 변경
DEVICE_ID=sensor-bedroom node sensor-simulator.js normal

# 전송 간격 변경 (밀리초)
INTERVAL=1000 node sensor-simulator.js random
```

### API 직접 테스트 (curl)

```bash
# Health Check
curl http://localhost:3000/api/health

# 현재 센서 데이터 조회
curl http://localhost:3000/api/sensor-data

# 이력 조회
curl http://localhost:3000/api/history?limit=10

# 통계 조회
curl http://localhost:3000/api/statistics

# 낙상 시뮬레이션
curl -X POST http://localhost:3000/api/simulate/fall

# 자동 시뮬레이션 시작
curl -X POST http://localhost:3000/api/simulation/start

# 자동 시뮬레이션 중지
curl -X POST http://localhost:3000/api/simulation/stop
```

---

## 🐛 문제 해결

### 서버가 시작되지 않음

**증상:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**해결:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID번호] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### WebSocket 연결 실패

**증상:**
```
WebSocket connection to 'ws://localhost:8080/' failed
```

**해결:**
1. 서버가 정상 실행 중인지 확인
2. 방화벽에서 8080 포트 허용
3. 브라우저 콘솔에서 에러 메시지 확인

### 모바일에서 접속 안 됨

**체크리스트:**
- [ ] PC와 모바일이 같은 Wi-Fi에 연결되어 있는가?
- [ ] PC의 방화벽에서 3000, 8080 포트가 허용되어 있는가?
- [ ] IP 주소가 정확한가? (192.168.x.x 형식)
- [ ] 서버가 실행 중인가?

### 데이터가 업데이트되지 않음

**확인 사항:**
1. 브라우저 콘솔에서 WebSocket 연결 상태 확인
2. 서버 콘솔에서 "Client connected" 메시지 확인
3. F5로 페이지 새로고침
4. 브라우저 캐시 삭제

---

## ✅ 테스트 체크리스트

### 기본 기능
- [ ] 서버가 정상적으로 시작됨
- [ ] 웹 대시보드가 열림
- [ ] 모바일 앱이 열림
- [ ] 통합 테스트가 모두 통과함

### 실시간 연동
- [ ] 센서 데이터가 실시간으로 업데이트됨
- [ ] 낙상 알림이 표시됨
- [ ] 무호흡 알림이 표시됨
- [ ] 여러 클라이언트가 동시에 같은 데이터를 받음

### 모바일 기능
- [ ] 모바일 기기에서 접속 가능
- [ ] PWA로 설치 가능
- [ ] 푸시 알림 권한 요청 표시
- [ ] 반응형 디자인이 올바르게 작동

### 데이터 관리
- [ ] 이벤트 이력이 저장됨
- [ ] 필터링이 작동함
- [ ] 통계가 정확하게 계산됨
- [ ] 차트가 올바르게 표시됨

---

## 🎯 다음 단계

### 1. 실제 센서 연동
- Raspberry Pi에 mmWave 센서 연결
- `sensor-simulator.js`를 참고하여 실제 센서 코드 작성
- 같은 API 엔드포인트로 데이터 전송

### 2. 클라우드 배포
- AWS, Google Cloud, Azure 등에 서버 배포
- 도메인 연결 및 HTTPS 설정
- 실제 푸시 알림 서비스 연동 (FCM, APNS)

### 3. 프로덕션 준비
- MongoDB 또는 PostgreSQL 데이터베이스 연동
- 사용자 인증 시스템 추가
- 로깅 및 모니터링 설정
- 백업 및 복구 시스템 구축

---

## 📞 도움말

### 로그 확인

**서버 로그:**
- 서버 터미널에서 실시간으로 확인
- 모든 API 요청, WebSocket 연결, 에러 표시

**브라우저 로그:**
- F12 → Console 탭
- WebSocket 연결 상태, API 응답, 에러 확인

### 성능 모니터링

**서버 상태:**
```bash
curl http://localhost:3000/api/health
```

**연결된 클라이언트 수:**
- 서버 콘솔에서 "Client connected/disconnected" 메시지 확인
- Health Check API의 `connectedClients` 필드 확인

---

## 🎉 성공!

모든 테스트가 통과했다면, 시스템이 완벽하게 작동하는 것입니다!

**이제 다음을 할 수 있습니다:**
- ✅ 실시간으로 생체 신호 모니터링
- ✅ 낙상/무호흡 즉시 감지
- ✅ 다중 보호자에게 동시 알림
- ✅ 웹과 모바일에서 동시 접속
- ✅ 이벤트 이력 및 통계 확인

**Made with ❤️ for Elder Care**
