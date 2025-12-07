// ===== 통합 테스트 스크립트 =====
// 웹, 모바일, 서버의 모든 기능을 자동으로 테스트합니다.

const axios = require('axios');
const WebSocket = require('ws');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const WS_URL = process.env.WS_URL || 'ws://localhost:8080';

console.log('🧪 ===== ElderCare Monitor Integration Test =====\n');

let testsPassed = 0;
let testsFailed = 0;

// 테스트 헬퍼 함수
function logTest(name, passed, message = '') {
    if (passed) {
        console.log(`✅ ${name}`);
        if (message) console.log(`   ${message}`);
        testsPassed++;
    } else {
        console.log(`❌ ${name}`);
        if (message) console.log(`   ${message}`);
        testsFailed++;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. 서버 Health Check
async function testHealthCheck() {
    console.log('\n📡 Testing Server Health Check...');
    try {
        const response = await axios.get(`${SERVER_URL}/api/health`, { timeout: 5000 });
        logTest('Health Check', response.data.status === 'ok', `Uptime: ${Math.floor(response.data.uptime)}s`);
        return true;
    } catch (error) {
        logTest('Health Check', false, error.message);
        return false;
    }
}

// 2. REST API 테스트
async function testRestAPI() {
    console.log('\n📊 Testing REST API Endpoints...');

    // GET /api/sensor-data
    try {
        const response = await axios.get(`${SERVER_URL}/api/sensor-data`);
        logTest('GET /api/sensor-data', response.data.success === true, `Status: ${response.data.data.status}`);
    } catch (error) {
        logTest('GET /api/sensor-data', false, error.message);
    }

    await sleep(500);

    // POST /api/sensor-data
    try {
        const testData = {
            deviceId: 'test-sensor',
            heartRate: 75,
            breathRate: 16,
            movement: true,
            status: 'normal',
            confidence: 95,
            timestamp: Date.now()
        };
        const response = await axios.post(`${SERVER_URL}/api/sensor-data`, testData);
        logTest('POST /api/sensor-data', response.data.success === true, `Broadcasted to ${response.data.clients} clients`);
    } catch (error) {
        logTest('POST /api/sensor-data', false, error.message);
    }

    await sleep(500);

    // GET /api/history
    try {
        const response = await axios.get(`${SERVER_URL}/api/history?limit=10`);
        logTest('GET /api/history', response.data.success === true, `Total events: ${response.data.total}`);
    } catch (error) {
        logTest('GET /api/history', false, error.message);
    }

    await sleep(500);

    // GET /api/statistics
    try {
        const response = await axios.get(`${SERVER_URL}/api/statistics`);
        logTest('GET /api/statistics', response.data.success === true,
            `Normal: ${response.data.data.normal}, Fall: ${response.data.data.fall}, Apnea: ${response.data.data.apnea}`);
    } catch (error) {
        logTest('GET /api/statistics', false, error.message);
    }
}

// 3. 시뮬레이션 API 테스트
async function testSimulationAPI() {
    console.log('\n🎬 Testing Simulation Endpoints...');

    // Simulate Fall
    try {
        const response = await axios.post(`${SERVER_URL}/api/simulate/fall`);
        logTest('POST /api/simulate/fall', response.data.success === true, `HR: ${response.data.data.heartRate}, Status: ${response.data.data.status}`);
        await sleep(2000);
    } catch (error) {
        logTest('POST /api/simulate/fall', false, error.message);
    }

    // Simulate Apnea
    try {
        const response = await axios.post(`${SERVER_URL}/api/simulate/apnea`);
        logTest('POST /api/simulate/apnea', response.data.success === true, `BR: ${response.data.data.breathRate}, Status: ${response.data.data.status}`);
        await sleep(2000);
    } catch (error) {
        logTest('POST /api/simulate/apnea', false, error.message);
    }

    // Simulate Normal
    try {
        const response = await axios.post(`${SERVER_URL}/api/simulate/normal`);
        logTest('POST /api/simulate/normal', response.data.success === true, `Status: ${response.data.data.status}`);
        await sleep(1000);
    } catch (error) {
        logTest('POST /api/simulate/normal', false, error.message);
    }
}

// 4. WebSocket 연결 테스트
async function testWebSocket() {
    console.log('\n🔌 Testing WebSocket Connection...');

    return new Promise((resolve) => {
        let ws;
        let receivedInitial = false;
        let receivedUpdate = false;
        let receivedAlert = false;

        try {
            ws = new WebSocket(WS_URL);

            ws.on('open', () => {
                logTest('WebSocket Connection', true, 'Connected successfully');
            });

            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);

                    if (message.type === 'initial' && !receivedInitial) {
                        logTest('WebSocket Initial Data', true, `Status: ${message.data.status}`);
                        receivedInitial = true;

                        // 낙상 시뮬레이션 트리거하여 alert 메시지 받기
                        setTimeout(async () => {
                            await axios.post(`${SERVER_URL}/api/simulate/fall`);
                        }, 1000);
                    }

                    if (message.type === 'update' && !receivedUpdate) {
                        logTest('WebSocket Update Message', true, `Status: ${message.data.status}`);
                        receivedUpdate = true;
                    }

                    if (message.type === 'alert' && !receivedAlert) {
                        logTest('WebSocket Alert Message', true, `Alert: ${message.data.message}`);
                        receivedAlert = true;

                        // 모든 테스트 완료
                        setTimeout(() => {
                            ws.close();
                            resolve();
                        }, 1000);
                    }
                } catch (error) {
                    logTest('WebSocket Message Parse', false, error.message);
                }
            });

            ws.on('error', (error) => {
                logTest('WebSocket Connection', false, error.message);
                resolve();
            });

            ws.on('close', () => {
                console.log('   WebSocket connection closed');
            });

            // 타임아웃 (10초)
            setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
                resolve();
            }, 10000);

        } catch (error) {
            logTest('WebSocket Connection', false, error.message);
            resolve();
        }
    });
}

// 5. 자동 시뮬레이션 테스트
async function testAutoSimulation() {
    console.log('\n⚙️  Testing Auto Simulation...');

    // Start auto simulation
    try {
        const response = await axios.post(`${SERVER_URL}/api/simulation/start`);
        logTest('Start Auto Simulation', response.data.success === true, response.data.message);
        await sleep(5000); // 5초 동안 실행
    } catch (error) {
        logTest('Start Auto Simulation', false, error.message);
    }

    // Stop auto simulation
    try {
        const response = await axios.post(`${SERVER_URL}/api/simulation/stop`);
        logTest('Stop Auto Simulation', response.data.success === true, response.data.message);
    } catch (error) {
        logTest('Stop Auto Simulation', false, error.message);
    }
}

// 6. 정적 파일 제공 테스트
async function testStaticFiles() {
    console.log('\n📄 Testing Static File Serving...');

    // Desktop Dashboard
    try {
        const response = await axios.get(`${SERVER_URL}/index.html`, { timeout: 5000 });
        logTest('Desktop Dashboard (index.html)', response.status === 200, `Size: ${response.data.length} bytes`);
    } catch (error) {
        logTest('Desktop Dashboard (index.html)', false, error.message);
    }

    await sleep(500);

    // Mobile App
    try {
        const response = await axios.get(`${SERVER_URL}/mobile/index.html`, { timeout: 5000 });
        logTest('Mobile App (mobile/index.html)', response.status === 200, `Size: ${response.data.length} bytes`);
    } catch (error) {
        logTest('Mobile App (mobile/index.html)', false, error.message);
    }

    await sleep(500);

    // PWA Manifest
    try {
        const response = await axios.get(`${SERVER_URL}/mobile/manifest.json`, { timeout: 5000 });
        logTest('PWA Manifest', response.status === 200, `App name: ${response.data.name}`);
    } catch (error) {
        logTest('PWA Manifest', false, error.message);
    }
}

// 메인 테스트 실행
async function runAllTests() {
    console.log('Starting integration tests...\n');
    console.log(`Server URL: ${SERVER_URL}`);
    console.log(`WebSocket URL: ${WS_URL}`);

    const startTime = Date.now();

    // 1. Health Check (필수)
    const serverOk = await testHealthCheck();
    if (!serverOk) {
        console.log('\n❌ Server is not running! Please start the server first:');
        console.log('   cd server');
        console.log('   npm start');
        process.exit(1);
    }

    // 2. REST API 테스트
    await testRestAPI();

    // 3. 시뮬레이션 API 테스트
    await testSimulationAPI();

    // 4. WebSocket 테스트
    await testWebSocket();

    // 5. 자동 시뮬레이션 테스트
    await testAutoSimulation();

    // 6. 정적 파일 제공 테스트
    await testStaticFiles();

    // 결과 요약
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Results Summary');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log('='.repeat(50));

    if (testsFailed === 0) {
        console.log('\n🎉 All tests passed! System is fully operational.');
        console.log('\n📱 You can now access:');
        console.log(`   Desktop: ${SERVER_URL}/index.html`);
        console.log(`   Mobile: ${SERVER_URL}/mobile/index.html`);
    } else {
        console.log('\n⚠️  Some tests failed. Please check the errors above.');
        process.exit(1);
    }
}

// 실행
runAllTests().catch(error => {
    console.error('\n❌ Fatal error during testing:', error);
    process.exit(1);
});
