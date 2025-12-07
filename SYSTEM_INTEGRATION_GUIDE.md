# 🔗 ElderCare 시스템 통합 가이드

## 📋 개요

이 문서는 **센서 → 서버 → 모바일 앱** 전체 시스템을 통합하는 방법을 설명합니다.

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    ElderCare 전체 시스템                     │
└─────────────────────────────────────────────────────────────┘

[1. 센서 장치]              [2. 클라우드 서버]           [3. 모바일 앱]
┌──────────────┐           ┌─────────────────┐          ┌──────────────┐
│ mmWave 센서  │           │   API 서버      │          │  보호자 앱   │
│              │           │   (Node.js)     │          │   (PWA)      │
│ Raspberry Pi │──WiFi────▶│                 │◀──HTTPS──│              │
│ (엣지 AI)    │           │   데이터베이스  │          │  실시간      │
│              │           │   (MongoDB)     │          │  모니터링    │
│ Python 스크립트│          │                 │          │              │
└──────────────┘           │   WebSocket     │          │  푸시 알림   │
                           │   서버          │          │              │
                           └─────────────────┘          └──────────────┘
```

---

## 🚀 빠른 시작 (로컬 테스트)

### 1단계: 센서 시뮬레이터 실행

```python
# sensor_simulator.py
import requests
import time
import random

API_URL = "http://localhost:3000/api/sensor-data"

def send_sensor_data():
    data = {
        "deviceId": "sensor-001",
        "heartRate": 70 + random.randint(-5, 5),
        "breathRate": 16 + random.randint(-2, 2),
        "movement": random.choice([True, False]),
        "status": "normal",
        "confidence": 95,
        "timestamp": int(time.time() * 1000)
    }
    
    try:
        response = requests.post(API_URL, json=data)
        print(f"✅ Data sent: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

while True:
    send_sensor_data()
    time.sleep(2)  # 2초마다 전송
```

### 2단계: API 서버 실행

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('mobile-app'));

// MongoDB 연결
mongoose.connect('mongodb://localhost:27017/eldercare', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// 센서 데이터 스키마
const SensorDataSchema = new mongoose.Schema({
    deviceId: String,
    heartRate: Number,
    breathRate: Number,
    movement: Boolean,
    status: String,
    confidence: Number,
    timestamp: Date
});

const SensorData = mongoose.model('SensorData', SensorDataSchema);

// WebSocket 서버
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('📱 Client connected');
    
    ws.on('close', () => {
        console.log('📱 Client disconnected');
    });
});

// 센서 데이터 수신 API
app.post('/api/sensor-data', async (req, res) => {
    try {
        const data = new SensorData(req.body);
        await data.save();
        
        // WebSocket으로 실시간 전송
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(req.body));
            }
        });
        
        // 이상 징후 감지
        if (req.body.status !== 'normal') {
            sendPushNotification(req.body);
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 최신 데이터 조회 API
app.get('/api/sensor-data/latest', async (req, res) => {
    try {
        const data = await SensorData.findOne()
            .sort({ timestamp: -1 })
            .limit(1);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 이력 조회 API
app.get('/api/sensor-data/history', async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;
        const query = {};
        
        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (status) {
            query.status = status;
        }
        
        const data = await SensorData.find(query)
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 푸시 알림 전송
function sendPushNotification(data) {
    // Firebase Cloud Messaging 또는 다른 푸시 서비스 사용
    console.log('🚨 Sending push notification:', data.status);
    // 구현 필요
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### 3단계: 모바일 앱에서 WebSocket 연결

```javascript
// mobile-app.js에 추가
let ws;

function connectWebSocket() {
    ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
        console.log('✅ WebSocket connected');
        showToast('서버에 연결되었습니다.');
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateDashboard(data);
    };
    
    ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        showToast('서버 연결 오류');
    };
    
    ws.onclose = () => {
        console.log('📡 WebSocket disconnected');
        // 재연결 시도
        setTimeout(connectWebSocket, 5000);
    };
}

function updateDashboard(data) {
    // 상태 업데이트
    updateStatus(data.status, data.confidence);
    
    // 생체 신호 업데이트
    document.getElementById('heartRateMobile').textContent = data.heartRate;
    document.getElementById('breathRateMobile').textContent = data.breathRate;
    
    // 이상 징후 시 알림
    if (data.status === 'fall') {
        showAlert('fall', '낙상 감지', '낙상이 감지되었습니다.');
    } else if (data.status === 'apnea') {
        showAlert('apnea', '무호흡 감지', '무호흡이 감지되었습니다.');
    }
}

// 앱 초기화 시 WebSocket 연결
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    connectWebSocket();
});
```

---

## 🔧 실제 배포 (프로덕션)

### 1. 클라우드 서버 설정

#### AWS EC2 사용

```bash
# 1. EC2 인스턴스 생성
# - AMI: Ubuntu 22.04 LTS
# - 인스턴스 타입: t3.small (최소)
# - 보안 그룹: HTTP(80), HTTPS(443), WebSocket(8080)

# 2. 서버 접속
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. MongoDB 설치
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# 5. 프로젝트 배포
git clone https://github.com/your-repo/eldercare-server.git
cd eldercare-server
npm install

# 6. PM2로 서버 실행 (자동 재시작)
sudo npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save

# 7. Nginx 설치 및 설정 (리버스 프록시)
sudo apt-get install -y nginx

sudo nano /etc/nginx/sites-available/eldercare
```

#### Nginx 설정

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # HTTP to HTTPS redirect
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # API 프록시
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket 프록시
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # 모바일 앱
    location / {
        root /var/www/eldercare/mobile-app;
        try_files $uri $uri/ /index.html;
    }
}
```

#### SSL 인증서 설치

```bash
# Let's Encrypt 사용
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 2. 센서 장치 설정

#### Raspberry Pi 설정

```bash
# 1. Python 스크립트 작성
nano /home/pi/eldercare/sensor_client.py
```

```python
# sensor_client.py
import requests
import time
import json
from datetime import datetime

# 설정
API_URL = "https://your-domain.com/api/sensor-data"
DEVICE_ID = "sensor-001"
SEND_INTERVAL = 2  # 초

# mmWave 센서 모듈 import (실제 센서 사용 시)
# from mmwave_sensor import IWR6843

def read_sensor_data():
    """실제 센서에서 데이터 읽기"""
    # 실제 구현 시 센서 라이브러리 사용
    # sensor = IWR6843()
    # return sensor.read()
    
    # 시뮬레이션
    import random
    return {
        "heartRate": 70 + random.randint(-5, 5),
        "breathRate": 16 + random.randint(-2, 2),
        "movement": random.choice([True, False]),
        "status": "normal",
        "confidence": 95
    }

def send_data(data):
    """서버로 데이터 전송"""
    payload = {
        "deviceId": DEVICE_ID,
        **data,
        "timestamp": int(datetime.now().timestamp() * 1000)
    }
    
    try:
        response = requests.post(
            API_URL,
            json=payload,
            timeout=5,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print(f"✅ [{datetime.now()}] Data sent successfully")
        else:
            print(f"❌ [{datetime.now()}] Error: {response.status_code}")
    
    except requests.exceptions.RequestException as e:
        print(f"❌ [{datetime.now()}] Connection error: {e}")

def main():
    """메인 루프"""
    print(f"🚀 Sensor client started (Device ID: {DEVICE_ID})")
    print(f"📡 Sending data to: {API_URL}")
    
    while True:
        try:
            data = read_sensor_data()
            send_data(data)
            time.sleep(SEND_INTERVAL)
        
        except KeyboardInterrupt:
            print("\n👋 Sensor client stopped")
            break
        
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    main()
```

#### 자동 실행 설정

```bash
# systemd 서비스 생성
sudo nano /etc/systemd/system/eldercare-sensor.service
```

```ini
[Unit]
Description=ElderCare Sensor Client
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/eldercare
ExecStart=/usr/bin/python3 /home/pi/eldercare/sensor_client.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 서비스 활성화
sudo systemctl daemon-reload
sudo systemctl enable eldercare-sensor
sudo systemctl start eldercare-sensor

# 상태 확인
sudo systemctl status eldercare-sensor
```

### 3. 푸시 알림 설정 (Firebase)

#### Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 새 프로젝트 생성
3. Cloud Messaging 활성화
4. 서버 키 복사

#### 서버에 Firebase Admin SDK 설치

```bash
npm install firebase-admin
```

```javascript
// firebase-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function sendPushNotification(token, title, body, data) {
    const message = {
        notification: {
            title,
            body
        },
        data,
        token
    };
    
    try {
        const response = await admin.messaging().send(message);
        console.log('✅ Push notification sent:', response);
        return response;
    } catch (error) {
        console.error('❌ Push notification error:', error);
        throw error;
    }
}

module.exports = { sendPushNotification };
```

#### 모바일 앱에 Firebase SDK 추가

```html
<!-- index.html에 추가 -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"></script>
```

```javascript
// firebase-messaging.js
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 토큰 받기
messaging.getToken({ vapidKey: 'YOUR_VAPID_KEY' })
    .then((currentToken) => {
        if (currentToken) {
            console.log('✅ FCM Token:', currentToken);
            // 서버에 토큰 저장
            saveTokenToServer(currentToken);
        }
    })
    .catch((err) => {
        console.error('❌ Token error:', err);
    });

// 포그라운드 메시지 수신
messaging.onMessage((payload) => {
    console.log('📬 Message received:', payload);
    showNotification(payload.notification.title, payload.notification.body);
});

function saveTokenToServer(token) {
    fetch('/api/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
}
```

---

## 📊 데이터베이스 스키마

### MongoDB 컬렉션

#### 1. sensordata (센서 데이터)

```javascript
{
    _id: ObjectId,
    deviceId: String,
    heartRate: Number,
    breathRate: Number,
    movement: Boolean,
    status: String,  // 'normal', 'fall', 'apnea'
    confidence: Number,
    timestamp: Date,
    createdAt: Date
}
```

#### 2. users (사용자)

```javascript
{
    _id: ObjectId,
    name: String,
    email: String,
    phone: String,
    role: String,  // 'guardian', 'admin'
    deviceId: String,  // 연결된 센서 ID
    fcmToken: String,  // Firebase 토큰
    settings: {
        fallAlert: Boolean,
        apneaAlert: Boolean,
        pushNotification: Boolean,
        soundAlert: Boolean,
        apneaThreshold: Number,
        sensitivity: Number
    },
    createdAt: Date
}
```

#### 3. alerts (알림 이력)

```javascript
{
    _id: ObjectId,
    deviceId: String,
    userId: String,
    type: String,  // 'fall', 'apnea'
    status: String,  // 'sent', 'read', 'acknowledged'
    sentAt: Date,
    readAt: Date,
    acknowledgedAt: Date
}
```

---

## 🔐 보안 설정

### 1. API 인증

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.sendStatus(401);
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken };
```

### 2. 환경 변수 설정

```bash
# .env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/eldercare
JWT_SECRET=your-secret-key
FIREBASE_PROJECT_ID=your-project-id
```

### 3. CORS 설정

```javascript
const cors = require('cors');

app.use(cors({
    origin: ['https://your-domain.com', 'https://app.your-domain.com'],
    credentials: true
}));
```

---

## 📈 모니터링 및 로깅

### 1. PM2 모니터링

```bash
# 실시간 모니터링
pm2 monit

# 로그 확인
pm2 logs

# 상태 확인
pm2 status
```

### 2. 로그 설정

```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}
```

---

## ✅ 테스트 체크리스트

### 센서 → 서버
- [ ] 센서 데이터 전송 성공
- [ ] 서버에서 데이터 수신 확인
- [ ] 데이터베이스 저장 확인
- [ ] WebSocket 브로드캐스트 확인

### 서버 → 모바일 앱
- [ ] WebSocket 연결 성공
- [ ] 실시간 데이터 업데이트
- [ ] 푸시 알림 수신
- [ ] 이력 조회 성공

### 전체 시스템
- [ ] 낙상 감지 → 알림 (10초 이내)
- [ ] 무호흡 감지 → 알림 (10초 이내)
- [ ] 오프라인 → 온라인 복구
- [ ] 다중 보호자 동시 접속

---

**Made with ❤️ for Elder Care**
