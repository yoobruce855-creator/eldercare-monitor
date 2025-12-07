// ===== Sensor Simulator - 실제 센서처럼 데이터 전송 =====
// 이 스크립트는 실제 mmWave 센서를 시뮬레이션하여 서버로 데이터를 전송합니다.

const axios = require('axios');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const DEVICE_ID = process.env.DEVICE_ID || 'sensor-001';
const INTERVAL = parseInt(process.env.INTERVAL) || 2000; // 2초마다

console.log('🎯 ===== Sensor Simulator Started =====');
console.log(`📡 Server: ${SERVER_URL}`);
console.log(`🆔 Device ID: ${DEVICE_ID}`);
console.log(`⏱️  Interval: ${INTERVAL}ms`);
console.log('');

// 시나리오 상태
let scenarioMode = 'normal'; // 'normal', 'fall', 'apnea', 'random'
let scenarioStep = 0;

// 정상 상태 데이터 생성
function generateNormalData() {
    return {
        deviceId: DEVICE_ID,
        heartRate: 70 + Math.floor(Math.random() * 15), // 70-85 bpm
        breathRate: 14 + Math.floor(Math.random() * 6), // 14-20 rpm
        movement: Math.random() > 0.2, // 80% 움직임
        status: 'normal',
        confidence: 90 + Math.floor(Math.random() * 10),
        timestamp: Date.now()
    };
}

// 낙상 상태 데이터 생성
function generateFallData() {
    return {
        deviceId: DEVICE_ID,
        heartRate: 100 + Math.floor(Math.random() * 30), // 100-130 bpm (급증)
        breathRate: 20 + Math.floor(Math.random() * 10), // 20-30 rpm (급증)
        movement: false, // 움직임 없음
        status: 'fall',
        confidence: 85 + Math.floor(Math.random() * 10),
        timestamp: Date.now()
    };
}

// 무호흡 상태 데이터 생성
function generateApneaData() {
    return {
        deviceId: DEVICE_ID,
        heartRate: 50 + Math.floor(Math.random() * 15), // 50-65 bpm (감소)
        breathRate: 3 + Math.floor(Math.random() * 5), // 3-8 rpm (매우 낮음)
        movement: false, // 움직임 없음
        status: 'apnea',
        confidence: 80 + Math.floor(Math.random() * 15),
        timestamp: Date.now()
    };
}

// 데이터 전송
async function sendSensorData(data) {
    try {
        const response = await axios.post(`${SERVER_URL}/api/sensor-data`, data, {
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const statusEmoji = {
            'normal': '✅',
            'fall': '🚨',
            'apnea': '⚠️'
        }[data.status] || '📊';

        console.log(`${statusEmoji} [${new Date().toLocaleTimeString()}] ${data.status.toUpperCase()} - HR: ${data.heartRate} | BR: ${data.breathRate} | Movement: ${data.movement ? 'Yes' : 'No'} | Confidence: ${data.confidence}%`);

        if (response.data.success) {
            console.log(`   ✓ Sent to ${response.data.clients} client(s)`);
        }

        return true;
    } catch (error) {
        console.error(`❌ Error sending data: ${error.message}`);
        return false;
    }
}

// 시나리오 실행
async function runScenario() {
    scenarioStep++;

    let data;

    switch (scenarioMode) {
        case 'normal':
            data = generateNormalData();
            break;

        case 'fall':
            data = generateFallData();
            break;

        case 'apnea':
            data = generateApneaData();
            break;

        case 'random':
            // 랜덤 시나리오: 90% 정상, 5% 낙상, 5% 무호흡
            const rand = Math.random();
            if (rand < 0.9) {
                data = generateNormalData();
            } else if (rand < 0.95) {
                data = generateFallData();
            } else {
                data = generateApneaData();
            }
            break;

        case 'demo':
            // 데모 시나리오: 정상 → 낙상 → 정상 → 무호흡 → 정상
            const demoSequence = [
                'normal', 'normal', 'normal', 'normal', 'normal', // 0-4: 10초 정상
                'fall', 'fall', 'fall', // 5-7: 6초 낙상
                'normal', 'normal', 'normal', 'normal', 'normal', // 8-12: 10초 정상
                'apnea', 'apnea', 'apnea', // 13-15: 6초 무호흡
                'normal', 'normal', 'normal', 'normal', 'normal' // 16-20: 10초 정상
            ];

            const step = scenarioStep % demoSequence.length;
            const currentStatus = demoSequence[step];

            if (currentStatus === 'fall') {
                data = generateFallData();
            } else if (currentStatus === 'apnea') {
                data = generateApneaData();
            } else {
                data = generateNormalData();
            }

            // 시나리오 진행 상황 표시
            if (step === 0) {
                console.log('\n🎬 Demo scenario restarting...\n');
            } else if (step === 5) {
                console.log('\n🚨 FALL SCENARIO STARTING...\n');
            } else if (step === 8) {
                console.log('\n✅ Returning to normal...\n');
            } else if (step === 13) {
                console.log('\n⚠️  APNEA SCENARIO STARTING...\n');
            } else if (step === 16) {
                console.log('\n✅ Returning to normal...\n');
            }
            break;

        default:
            data = generateNormalData();
    }

    await sendSensorData(data);
}

// 서버 연결 확인
async function checkServerConnection() {
    try {
        const response = await axios.get(`${SERVER_URL}/api/health`, { timeout: 5000 });
        console.log('✅ Server connection successful!');
        console.log(`   Uptime: ${Math.floor(response.data.uptime)}s`);
        console.log(`   Connected clients: ${response.data.connectedClients}`);
        console.log('');
        return true;
    } catch (error) {
        console.error('❌ Cannot connect to server!');
        console.error(`   Make sure the server is running at ${SERVER_URL}`);
        console.error(`   Error: ${error.message}`);
        return false;
    }
}

// 메인 실행
async function main() {
    // 서버 연결 확인
    const connected = await checkServerConnection();
    if (!connected) {
        console.log('\n💡 Start the server first:');
        console.log('   cd server');
        console.log('   npm start');
        process.exit(1);
    }

    // 명령줄 인자로 시나리오 모드 설정
    const args = process.argv.slice(2);
    if (args.length > 0) {
        scenarioMode = args[0];
    }

    console.log(`🎯 Scenario Mode: ${scenarioMode.toUpperCase()}`);
    console.log('');
    console.log('Available modes:');
    console.log('  - normal: 정상 상태만');
    console.log('  - fall: 낙상 상태만');
    console.log('  - apnea: 무호흡 상태만');
    console.log('  - random: 랜덤 (90% 정상, 5% 낙상, 5% 무호흡)');
    console.log('  - demo: 자동 데모 시나리오 (정상→낙상→정상→무호흡→정상)');
    console.log('');
    console.log('Press Ctrl+C to stop');
    console.log('');

    // 주기적으로 데이터 전송
    const interval = setInterval(runScenario, INTERVAL);

    // 첫 데이터 즉시 전송
    await runScenario();

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n👋 Stopping sensor simulator...');
        clearInterval(interval);
        process.exit(0);
    });
}

// 실행
main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
