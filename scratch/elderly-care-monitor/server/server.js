// ===== ElderCare Monitor - Complete Server =====
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 8080;

// ===== Middleware =====
app.use(helmet({
    contentSecurityPolicy: false // PWA를 위해 비활성화
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Static Files =====
// 데스크톱 대시보드
app.use(express.static(path.join(__dirname, '..')));
// 모바일 앱
app.use('/mobile', express.static(path.join(__dirname, '..', 'mobile-app')));

// ===== In-Memory Data Store (MongoDB 대신 간단하게) =====
let sensorData = {
    deviceId: 'sensor-001',
    heartRate: 72,
    breathRate: 16,
    movement: true,
    status: 'normal',
    confidence: 95,
    timestamp: Date.now(),
    lastUpdate: new Date().toISOString()
};

let detectionHistory = [];
let connectedClients = new Set();

// ===== WebSocket Server =====
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', (ws, req) => {
    const clientId = Math.random().toString(36).substr(2, 9);
    connectedClients.add(ws);

    console.log(`📱 Client connected: ${clientId} (Total: ${connectedClients.size})`);

    // 연결 시 현재 데이터 전송
    ws.send(JSON.stringify({
        type: 'initial',
        data: sensorData,
        history: detectionHistory.slice(-10) // 최근 10개
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('📨 Received from client:', data);

            // 클라이언트 요청 처리
            if (data.type === 'getHistory') {
                ws.send(JSON.stringify({
                    type: 'history',
                    data: detectionHistory
                }));
            }
        } catch (error) {
            console.error('❌ WebSocket message error:', error);
        }
    });

    ws.on('close', () => {
        connectedClients.delete(ws);
        console.log(`📱 Client disconnected: ${clientId} (Total: ${connectedClients.size})`);
    });

    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        connectedClients.delete(ws);
    });
});

// ===== Broadcast Function =====
function broadcastToClients(data) {
    const message = JSON.stringify(data);
    let successCount = 0;

    connectedClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(message);
                successCount++;
            } catch (error) {
                console.error('❌ Broadcast error:', error);
                connectedClients.delete(client);
            }
        }
    });

    if (successCount > 0) {
        console.log(`📡 Broadcast to ${successCount} clients`);
    }
}

// ===== REST API Endpoints =====

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        connectedClients: connectedClients.size
    });
});

// Get Current Sensor Data
app.get('/api/sensor-data', (req, res) => {
    res.json({
        success: true,
        data: sensorData
    });
});

// Post Sensor Data (센서에서 전송)
app.post('/api/sensor-data', (req, res) => {
    try {
        const newData = {
            deviceId: req.body.deviceId || 'sensor-001',
            heartRate: req.body.heartRate,
            breathRate: req.body.breathRate,
            movement: req.body.movement,
            status: req.body.status || 'normal',
            confidence: req.body.confidence || 95,
            timestamp: req.body.timestamp || Date.now(),
            lastUpdate: new Date().toISOString()
        };

        // 데이터 업데이트
        sensorData = newData;

        // 이력에 추가
        const historyItem = {
            ...newData,
            id: Date.now().toString()
        };
        detectionHistory.unshift(historyItem);

        // 최근 100개만 유지
        if (detectionHistory.length > 100) {
            detectionHistory = detectionHistory.slice(0, 100);
        }

        // WebSocket으로 모든 클라이언트에 브로드캐스트
        broadcastToClients({
            type: 'update',
            data: newData
        });

        // 이상 징후 감지 시 알림
        if (newData.status !== 'normal') {
            broadcastToClients({
                type: 'alert',
                data: {
                    status: newData.status,
                    message: newData.status === 'fall' ? '낙상이 감지되었습니다!' : '무호흡이 감지되었습니다!',
                    timestamp: newData.timestamp
                }
            });

            console.log(`🚨 ALERT: ${newData.status} detected!`);
        }

        res.json({
            success: true,
            message: 'Data received and broadcasted',
            clients: connectedClients.size
        });

    } catch (error) {
        console.error('❌ Error processing sensor data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get Detection History
app.get('/api/history', (req, res) => {
    const { status, limit = 50 } = req.query;

    let filteredHistory = detectionHistory;

    if (status && status !== 'all') {
        filteredHistory = detectionHistory.filter(item => item.status === status);
    }

    res.json({
        success: true,
        data: filteredHistory.slice(0, parseInt(limit)),
        total: filteredHistory.length
    });
});

// Clear History
app.delete('/api/history', (req, res) => {
    detectionHistory = [];
    res.json({
        success: true,
        message: 'History cleared'
    });
});

// Get Statistics
app.get('/api/statistics', (req, res) => {
    const stats = {
        total: detectionHistory.length,
        normal: detectionHistory.filter(item => item.status === 'normal').length,
        fall: detectionHistory.filter(item => item.status === 'fall').length,
        apnea: detectionHistory.filter(item => item.status === 'apnea').length,
        avgHeartRate: Math.round(
            detectionHistory.reduce((sum, item) => sum + item.heartRate, 0) / detectionHistory.length
        ) || 0,
        avgBreathRate: Math.round(
            detectionHistory.reduce((sum, item) => sum + item.breathRate, 0) / detectionHistory.length
        ) || 0
    };

    res.json({
        success: true,
        data: stats
    });
});

// ===== Simulation Endpoints (테스트용) =====

// Simulate Fall
app.post('/api/simulate/fall', (req, res) => {
    const fallData = {
        deviceId: 'sensor-001',
        heartRate: 100 + Math.floor(Math.random() * 20),
        breathRate: 20 + Math.floor(Math.random() * 8),
        movement: false,
        status: 'fall',
        confidence: 92,
        timestamp: Date.now(),
        lastUpdate: new Date().toISOString()
    };

    sensorData = fallData;

    const historyItem = {
        ...fallData,
        id: Date.now().toString()
    };
    detectionHistory.unshift(historyItem);

    broadcastToClients({
        type: 'update',
        data: fallData
    });

    broadcastToClients({
        type: 'alert',
        data: {
            status: 'fall',
            message: '낙상이 감지되었습니다!',
            timestamp: fallData.timestamp
        }
    });

    res.json({
        success: true,
        message: 'Fall simulation triggered',
        data: fallData
    });
});

// Simulate Apnea
app.post('/api/simulate/apnea', (req, res) => {
    const apneaData = {
        deviceId: 'sensor-001',
        heartRate: 50 + Math.floor(Math.random() * 15),
        breathRate: 5 + Math.floor(Math.random() * 5),
        movement: false,
        status: 'apnea',
        confidence: 88,
        timestamp: Date.now(),
        lastUpdate: new Date().toISOString()
    };

    sensorData = apneaData;

    const historyItem = {
        ...apneaData,
        id: Date.now().toString()
    };
    detectionHistory.unshift(historyItem);

    broadcastToClients({
        type: 'update',
        data: apneaData
    });

    broadcastToClients({
        type: 'alert',
        data: {
            status: 'apnea',
            message: '무호흡이 감지되었습니다!',
            timestamp: apneaData.timestamp
        }
    });

    res.json({
        success: true,
        message: 'Apnea simulation triggered',
        data: apneaData
    });
});

// Simulate Normal
app.post('/api/simulate/normal', (req, res) => {
    const normalData = {
        deviceId: 'sensor-001',
        heartRate: 70 + Math.floor(Math.random() * 10),
        breathRate: 14 + Math.floor(Math.random() * 6),
        movement: true,
        status: 'normal',
        confidence: 95,
        timestamp: Date.now(),
        lastUpdate: new Date().toISOString()
    };

    sensorData = normalData;

    const historyItem = {
        ...normalData,
        id: Date.now().toString()
    };
    detectionHistory.unshift(historyItem);

    broadcastToClients({
        type: 'update',
        data: normalData
    });

    res.json({
        success: true,
        message: 'Normal status restored',
        data: normalData
    });
});

// ===== Auto Simulation (테스트용) =====
let simulationInterval;

app.post('/api/simulation/start', (req, res) => {
    if (simulationInterval) {
        return res.json({
            success: false,
            message: 'Simulation already running'
        });
    }

    simulationInterval = setInterval(() => {
        const normalData = {
            deviceId: 'sensor-001',
            heartRate: 70 + Math.floor(Math.random() * 10),
            breathRate: 14 + Math.floor(Math.random() * 6),
            movement: Math.random() > 0.3,
            status: 'normal',
            confidence: 90 + Math.floor(Math.random() * 10),
            timestamp: Date.now(),
            lastUpdate: new Date().toISOString()
        };

        sensorData = normalData;

        broadcastToClients({
            type: 'update',
            data: normalData
        });
    }, 2000); // 2초마다 업데이트

    res.json({
        success: true,
        message: 'Auto simulation started (2s interval)'
    });
});

app.post('/api/simulation/stop', (req, res) => {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
        res.json({
            success: true,
            message: 'Auto simulation stopped'
        });
    } else {
        res.json({
            success: false,
            message: 'No simulation running'
        });
    }
});

// ===== Error Handling =====
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({
        success: false,
        error: err.message
    });
});

// ===== Start Server =====
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ===== ElderCare Monitor Server =====');
    console.log('');
    console.log(`📡 HTTP Server: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket Server: ws://localhost:${WS_PORT}`);
    console.log('');
    console.log('📱 Access Points:');
    console.log(`   Desktop Dashboard: http://localhost:${PORT}/index.html`);
    console.log(`   Mobile App: http://localhost:${PORT}/mobile/index.html`);
    console.log('');
    console.log('🧪 Test Endpoints:');
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   Simulate Fall: POST http://localhost:${PORT}/api/simulate/fall`);
    console.log(`   Simulate Apnea: POST http://localhost:${PORT}/api/simulate/apnea`);
    console.log(`   Simulate Normal: POST http://localhost:${PORT}/api/simulate/normal`);
    console.log(`   Start Auto Sim: POST http://localhost:${PORT}/api/simulation/start`);
    console.log(`   Stop Auto Sim: POST http://localhost:${PORT}/api/simulation/stop`);
    console.log('');
    console.log('✅ Server is ready!');
    console.log('');
});

console.log(`🔌 WebSocket Server started on port ${WS_PORT}`);

// ===== Graceful Shutdown =====
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully...');
    wss.close(() => {
        console.log('🔌 WebSocket server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n👋 SIGINT received, shutting down gracefully...');
    if (simulationInterval) {
        clearInterval(simulationInterval);
    }
    wss.close(() => {
        console.log('🔌 WebSocket server closed');
        process.exit(0);
    });
});
