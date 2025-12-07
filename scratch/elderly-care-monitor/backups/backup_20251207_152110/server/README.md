# ElderCare Monitor - 서버 실행 가이드

## 🚀 빠른 시작

### 1단계: 의존성 설치

```bash
cd server
npm install
```

### 2단계: 서버 실행

```bash
npm start
```

또는 개발 모드 (자동 재시작):

```bash
npm run dev
```

### 3단계: 브라우저에서 접속

- **데스크톱 대시보드**: http://localhost:3000/index.html
- **모바일 앱**: http://localhost:3000/mobile/index.html

---

## 🧪 테스트 방법

### 방법 1: 브라우저 콘솔

데스크톱 또는 모바일 앱을 열고 F12 → Console:

```javascript
// 낙상 시뮬레이션
client.api.simulateFall()

// 무호흡 시뮬레이션
client.api.simulateApnea()

// 정상 상태
client.api.simulateNormal()

// 자동 시뮬레이션 시작 (2초마다 업데이트)
client.api.startAutoSimulation()

// 자동 시뮬레이션 중지
client.api.stopAutoSimulation()
```

### 방법 2: REST API (Postman/curl)

```bash
# 낙상 시뮬레이션
curl -X POST http://localhost:3000/api/simulate/fall

# 무호흡 시뮬레이션
curl -X POST http://localhost:3000/api/simulate/apnea

# 정상 상태
curl -X POST http://localhost:3000/api/simulate/normal

# 자동 시뮬레이션 시작
curl -X POST http://localhost:3000/api/simulation/start

# 자동 시뮬레이션 중지
curl -X POST http://localhost:3000/api/simulation/stop

# 현재 데이터 조회
curl http://localhost:3000/api/sensor-data

# 이력 조회
curl http://localhost:3000/api/history

# 통계 조회
curl http://localhost:3000/api/statistics
```

---

## 📡 실시간 연동 확인

### 1. 데스크톱과 모바일 동시 열기

1. 브라우저 탭 1: http://localhost:3000/index.html (데스크톱)
2. 브라우저 탭 2: http://localhost:3000/mobile/index.html (모바일)

### 2. 시뮬레이션 실행

한 쪽 탭의 콘솔에서:

```javascript
client.api.simulateFall()
```

### 3. 확인

- ✅ 두 탭 모두 즉시 "낙상" 상태로 변경
- ✅ 두 탭 모두 알림 표시
- ✅ 두 탭 모두 이력에 추가

---

## 🔌 WebSocket 연결 상태

### 연결 성공

```
헤더 우측: "● 연결됨" (녹색)
콘솔: "✅ Connected to server"
```

### 연결 실패

```
헤더 우측: "● 연결 끊김" (회색)
콘솔: "❌ WebSocket error"
자동 재연결 시도 (5초마다)
```

---

## 🐛 문제 해결

### 문제 1: 서버가 시작되지 않음

```bash
# Node.js 버전 확인 (18.0.0 이상 필요)
node --version

# 포트 충돌 확인
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# 다른 포트 사용
PORT=3001 WS_PORT=8081 npm start
```

### 문제 2: 클라이언트가 연결되지 않음

1. 서버가 실행 중인지 확인
2. 방화벽 설정 확인
3. 브라우저 콘솔에서 에러 확인
4. WebSocket URL 확인 (client-integration.js)

### 문제 3: 데이터가 업데이트되지 않음

1. WebSocket 연결 상태 확인
2. 브라우저 콘솔에서 에러 확인
3. 서버 로그 확인
4. 페이지 새로고침

---

## 📊 서버 로그 예시

```
🚀 ===== ElderCare Monitor Server =====

📡 HTTP Server: http://localhost:3000
🔌 WebSocket Server: ws://localhost:8080

📱 Access Points:
   Desktop Dashboard: http://localhost:3000/index.html
   Mobile App: http://localhost:3000/mobile/index.html

✅ Server is ready!

📱 Client connected: a1b2c3d4e (Total: 1)
📨 Received from client: {type: 'getHistory'}
📡 Broadcast to 1 clients
🚨 ALERT: fall detected!
```

---

## 🚀 다음 단계

### 실제 센서 연동

```python
# sensor_client.py
import requests
import time

API_URL = "http://localhost:3000/api/sensor-data"

while True:
    data = {
        "deviceId": "sensor-001",
        "heartRate": 72,
        "breathRate": 16,
        "movement": True,
        "status": "normal",
        "confidence": 95
    }
    
    response = requests.post(API_URL, json=data)
    print(f"✅ Data sent: {response.status_code}")
    
    time.sleep(2)
```

### 클라우드 배포

1. AWS/GCP/Azure 서버 준비
2. MongoDB 설치 (영구 저장)
3. Nginx 리버스 프록시 설정
4. SSL 인증서 설치
5. 도메인 연결

---

**Made with ❤️ for Elder Care**
