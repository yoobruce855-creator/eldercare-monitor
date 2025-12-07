/* ===================================
   ElderCare Monitor - Core Logic
   비접촉 생체 신호 모니터링 시스템
   =================================== */

// ===================================
// 1. 전역 상태 관리
// ===================================
const AppState = {
    // 센서 데이터
    sensorData: {
        heartRate: 72,
        breathRate: 16,
        lastMovement: Date.now(),
        inactiveTime: 0,
        rawPointCloud: []
    },

    // 현재 상태
    currentStatus: 'normal', // 'normal', 'fall', 'apnea'
    confidence: 95,

    // 응급 상황 판단
    emergencyTimer: null,
    emergencyWaitTime: 10000, // 10초 대기
    apneaThreshold: 5 * 60 * 1000, // 5분 (밀리초)

    // 알림 설정
    settings: {
        fallAlert: true,
        apneaAlert: true,
        soundAlert: true,
        apneaThresholdMinutes: 5,
        sensitivity: 7,
        guardianPhone: '010-1234-5678',
        guardianEmail: 'guardian@example.com'
    },

    // 감지 이력
    history: [],

    // 실시간 차트 데이터
    chartData: {
        timestamps: [],
        heartRates: [],
        breathRates: [],
        movements: []
    }
};

// ===================================
// 2. mmWave 센서 데이터 수집 시뮬레이션
// ===================================
class SensorModule {
    constructor() {
        this.samplingRate = 10; // 초당 10회 샘플링
        this.noiseLevel = 0.1;
    }

    // Raw Point Cloud 데이터 생성 (시뮬레이션)
    generateRawPointCloud() {
        const points = [];
        const numPoints = Math.floor(Math.random() * 50) + 20;

        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1,
                z: Math.random() * 2 - 1,
                velocity: Math.random() * 0.5 - 0.25,
                intensity: Math.random()
            });
        }

        return points;
    }

    // 노이즈 필터링
    filterNoise(pointCloud) {
        return pointCloud.filter(point => {
            // 강도가 낮은 노이즈 제거
            if (point.intensity < this.noiseLevel) return false;

            // 범위 밖 데이터 제거
            const distance = Math.sqrt(point.x ** 2 + point.y ** 2 + point.z ** 2);
            if (distance > 3) return false;

            return true;
        });
    }

    // 생체 신호 추출
    extractVitalSigns(filteredData) {
        // 실제로는 FFT 등의 신호 처리 알고리즘 사용
        // 여기서는 시뮬레이션

        const baseHeartRate = 72;
        const baseBreathRate = 16;

        // 상태에 따른 변화
        let heartRate, breathRate, movement;

        if (AppState.currentStatus === 'fall') {
            heartRate = baseHeartRate + Math.random() * 30 + 20; // 급격한 증가
            breathRate = baseBreathRate + Math.random() * 10 + 5;
            movement = Math.random() * 0.3; // 낮은 움직임
        } else if (AppState.currentStatus === 'apnea') {
            heartRate = baseHeartRate - Math.random() * 10;
            breathRate = Math.random() * 3; // 매우 낮은 호흡
            movement = Math.random() * 0.1; // 거의 없음
        } else {
            heartRate = baseHeartRate + (Math.random() * 10 - 5);
            breathRate = baseBreathRate + (Math.random() * 4 - 2);
            movement = Math.random() * 0.5 + 0.3; // 정상 움직임
        }

        return {
            heartRate: Math.round(heartRate),
            breathRate: Math.round(breathRate),
            movement: movement,
            dataQuality: filteredData.length / 50 // 데이터 품질
        };
    }

    // 1초당 X회 데이터 수집
    collectData() {
        const rawData = this.generateRawPointCloud();
        const filteredData = this.filterNoise(rawData);
        const vitalSigns = this.extractVitalSigns(filteredData);

        return {
            raw: rawData,
            filtered: filteredData,
            vitalSigns: vitalSigns,
            timestamp: Date.now()
        };
    }
}

// ===================================
// 3. 엣지 AI 분석 모듈
// ===================================
class EdgeAIModule {
    constructor() {
        this.model = this.initializeModel();
    }

    // AI 모델 초기화 (시뮬레이션)
    initializeModel() {
        return {
            weights: {
                fall: { threshold: 0.8, sensitivity: 0.9 },
                apnea: { threshold: 0.85, sensitivity: 0.95 },
                normal: { threshold: 0.7, sensitivity: 0.8 }
            }
        };
    }

    // 데이터 전처리
    preprocess(vitalSigns) {
        // 호흡/심박 그래프 변환
        const normalized = {
            heartRate: vitalSigns.heartRate / 200, // 정규화
            breathRate: vitalSigns.breathRate / 40,
            movement: vitalSigns.movement,
            dataQuality: vitalSigns.dataQuality
        };

        return normalized;
    }

    // 패턴 분류
    classifyPattern(preprocessedData) {
        const { heartRate, breathRate, movement } = preprocessedData;

        // 낙상 패턴 감지
        const fallScore = this.detectFall(heartRate, breathRate, movement);

        // 무호흡 패턴 감지
        const apneaScore = this.detectApnea(breathRate, movement);

        // 정상 패턴
        const normalScore = this.detectNormal(heartRate, breathRate, movement);

        // 가장 높은 점수의 패턴 선택
        const scores = {
            fall: fallScore,
            apnea: apneaScore,
            normal: normalScore
        };

        const maxScore = Math.max(...Object.values(scores));
        const classification = Object.keys(scores).find(key => scores[key] === maxScore);

        return {
            classification: classification,
            confidence: Math.round(maxScore * 100),
            scores: scores
        };
    }

    // 낙상 감지 알고리즘
    detectFall(heartRate, breathRate, movement) {
        // 심박수 급증 + 낮은 움직임 = 낙상 가능성
        const heartRateAbnormal = heartRate > 0.5; // 정규화된 값
        const lowMovement = movement < 0.3;

        if (heartRateAbnormal && lowMovement) {
            return 0.85 + Math.random() * 0.1;
        }

        return Math.random() * 0.3;
    }

    // 무호흡 감지 알고리즘
    detectApnea(breathRate, movement) {
        // 매우 낮은 호흡수 + 거의 없는 움직임
        const veryLowBreath = breathRate < 0.15; // 정규화된 값
        const noMovement = movement < 0.15;

        const inactiveTime = Date.now() - AppState.sensorData.lastMovement;
        const longInactive = inactiveTime > AppState.apneaThreshold;

        if (veryLowBreath && noMovement && longInactive) {
            return 0.9 + Math.random() * 0.05;
        }

        return Math.random() * 0.3;
    }

    // 정상 패턴 감지
    detectNormal(heartRate, breathRate, movement) {
        const normalHeart = heartRate > 0.3 && heartRate < 0.5;
        const normalBreath = breathRate > 0.3 && breathRate < 0.5;
        const normalMovement = movement > 0.3;

        if (normalHeart && normalBreath && normalMovement) {
            return 0.85 + Math.random() * 0.1;
        }

        return 0.5 + Math.random() * 0.3;
    }
}

// ===================================
// 4. 응급 상황 판단 로직
// ===================================
class EmergencyProcessor {
    constructor() {
        this.pendingEmergency = null;
    }

    // 응급 상황 평가
    evaluateEmergency(classification, confidence) {
        // IF (낙상 또는 무호흡 감지)
        if ((classification === 'fall' || classification === 'apnea') && confidence > 85) {

            // 이미 대기 중인 응급 상황이 없으면
            if (!this.pendingEmergency) {
                console.log(`⚠️ ${classification} 감지! 10초 대기 타이머 시작...`);
                this.startEmergencyTimer(classification, confidence);
            }

        } else if (classification === 'normal') {
            // 정상 상태로 복귀 시 타이머 취소
            this.cancelEmergencyTimer();
        }
    }

    // 10초 대기 타이머 작동 (오작동 방지)
    startEmergencyTimer(type, confidence) {
        this.pendingEmergency = {
            type: type,
            confidence: confidence,
            detectedAt: Date.now()
        };

        // 10초 대기
        AppState.emergencyTimer = setTimeout(() => {
            // IF (10초 내 움직임 감지 안 됨)
            const recentMovement = Date.now() - AppState.sensorData.lastMovement;

            if (recentMovement > 10000) {
                // 응급 상황 최종 판단
                console.log('🚨 응급 상황 최종 확정!');
                this.confirmEmergency();
            } else {
                console.log('✅ 움직임 감지됨. 응급 상황 취소.');
                this.cancelEmergencyTimer();
            }
        }, AppState.emergencyWaitTime);

        // UI 업데이트
        showAlert(type, confidence);
    }

    // 응급 상황 최종 확정
    confirmEmergency() {
        const emergency = this.pendingEmergency;

        // 클라우드 서버로 데이터 전송
        this.sendToCloud(emergency);

        // 알림 발송
        this.sendNotifications(emergency);

        // 이력 기록
        this.logEmergency(emergency);

        this.pendingEmergency = null;
    }

    // 타이머 취소
    cancelEmergencyTimer() {
        if (AppState.emergencyTimer) {
            clearTimeout(AppState.emergencyTimer);
            AppState.emergencyTimer = null;
            this.pendingEmergency = null;
            closeAlert();
        }
    }

    // 클라우드 서버 전송 (시뮬레이션)
    sendToCloud(emergency) {
        const payload = {
            type: emergency.type,
            confidence: emergency.confidence,
            timestamp: emergency.detectedAt,
            vitalSigns: AppState.sensorData,
            location: '거실', // 실제로는 센서 위치
            deviceId: 'DEVICE_001'
        };

        console.log('☁️ 클라우드 서버 전송:', payload);

        // 실제 구현 시:
        // fetch('https://api.eldercare.com/emergency', {
        //     method: 'POST',
        //     body: JSON.stringify(payload)
        // });
    }

    // 알림 발송
    sendNotifications(emergency) {
        const message = emergency.type === 'fall'
            ? '낙상이 감지되었습니다!'
            : '무호흡 상태가 감지되었습니다!';

        // 푸시 알림 (시뮬레이션)
        if (AppState.settings.fallAlert || AppState.settings.apneaAlert) {
            console.log('📱 푸시 알림 발송:', message);
            showNotification(message);
        }

        // 소리 알림
        if (AppState.settings.soundAlert) {
            this.playAlertSound();
        }

        // 실제 구현 시:
        // - FCM/APNS를 통한 모바일 푸시
        // - SMS 발송
        // - 이메일 발송
    }

    // 알림음 재생
    playAlertSound() {
        // 실제로는 Audio API 사용
        console.log('🔊 알림음 재생');
    }

    // 이력 기록
    logEmergency(emergency) {
        const historyItem = {
            id: Date.now(),
            type: emergency.type,
            confidence: emergency.confidence,
            timestamp: emergency.detectedAt,
            vitalSigns: { ...AppState.sensorData }
        };

        AppState.history.unshift(historyItem);

        // 최대 50개까지만 보관
        if (AppState.history.length > 50) {
            AppState.history = AppState.history.slice(0, 50);
        }

        updateHistoryUI();
    }
}

// ===================================
// 5. 메인 시스템 통합
// ===================================
class ElderCareMonitor {
    constructor() {
        this.sensor = new SensorModule();
        this.ai = new EdgeAIModule();
        this.emergency = new EmergencyProcessor();
        this.isRunning = false;
    }

    // 시스템 시작
    start() {
        console.log('🚀 ElderCare Monitor 시작');
        this.isRunning = true;

        // 메인 루프 시작 (100ms마다 실행)
        this.mainLoop();

        // 차트 업데이트 (1초마다)
        setInterval(() => this.updateChart(), 1000);
    }

    // 메인 처리 루프
    mainLoop() {
        if (!this.isRunning) return;

        // 1. 데이터 수집
        const sensorData = this.sensor.collectData();

        // 2. 엣지 AI 분석
        const preprocessed = this.ai.preprocess(sensorData.vitalSigns);
        const classification = this.ai.classifyPattern(preprocessed);

        // 3. 응급 상황 판단
        this.emergency.evaluateEmergency(classification.classification, classification.confidence);

        // 4. 상태 업데이트
        this.updateState(sensorData, classification);

        // 5. UI 업데이트
        this.updateUI();

        // 다음 루프 스케줄 (100ms 후)
        setTimeout(() => this.mainLoop(), 100);
    }

    // 상태 업데이트
    updateState(sensorData, classification) {
        AppState.sensorData.heartRate = sensorData.vitalSigns.heartRate;
        AppState.sensorData.breathRate = sensorData.vitalSigns.breathRate;
        AppState.currentStatus = classification.classification;
        AppState.confidence = classification.confidence;

        // 움직임 업데이트
        if (sensorData.vitalSigns.movement > 0.3) {
            AppState.sensorData.lastMovement = Date.now();
            AppState.sensorData.inactiveTime = 0;
        } else {
            AppState.sensorData.inactiveTime = Date.now() - AppState.sensorData.lastMovement;
        }
    }

    // UI 업데이트
    updateUI() {
        updateVitalSigns();
        updateStatusBadge();
        updateActivityMonitor();
        updateConfidenceScore();
    }

    // 차트 데이터 업데이트
    updateChart() {
        const now = new Date();
        AppState.chartData.timestamps.push(now);
        AppState.chartData.heartRates.push(AppState.sensorData.heartRate);
        AppState.chartData.breathRates.push(AppState.sensorData.breathRate);

        // 최대 60개 데이터 포인트 유지 (1분)
        if (AppState.chartData.timestamps.length > 60) {
            AppState.chartData.timestamps.shift();
            AppState.chartData.heartRates.shift();
            AppState.chartData.breathRates.shift();
        }

        renderChart();
    }

    // 시스템 중지
    stop() {
        this.isRunning = false;
        console.log('⏹️ ElderCare Monitor 중지');
    }
}

// ===================================
// 6. UI 업데이트 함수들
// ===================================
function updateVitalSigns() {
    document.getElementById('heartRate').textContent = AppState.sensorData.heartRate;
    document.getElementById('breathRate').textContent = AppState.sensorData.breathRate;
}

function updateStatusBadge() {
    const badge = document.getElementById('currentStatusBadge');
    const statusText = document.getElementById('currentStatusText');
    const statusIcon = document.getElementById('statusIcon');

    badge.className = 'status-badge';
    statusIcon.className = 'status-icon';

    switch (AppState.currentStatus) {
        case 'normal':
            statusText.textContent = '정상';
            break;
        case 'fall':
            statusText.textContent = '낙상 감지';
            badge.classList.add('danger');
            statusIcon.classList.add('danger');
            break;
        case 'apnea':
            statusText.textContent = '무호흡 감지';
            badge.classList.add('warning');
            statusIcon.classList.add('warning');
            break;
    }
}

function updateActivityMonitor() {
    const lastMovement = document.getElementById('lastMovement');
    const inactiveTime = document.getElementById('inactiveTime');
    const progressFill = document.getElementById('inactiveProgress');

    const timeSinceMovement = Date.now() - AppState.sensorData.lastMovement;

    // 마지막 움직임 시간
    if (timeSinceMovement < 1000) {
        lastMovement.textContent = '방금 전';
    } else if (timeSinceMovement < 60000) {
        lastMovement.textContent = Math.floor(timeSinceMovement / 1000) + '초 전';
    } else {
        lastMovement.textContent = Math.floor(timeSinceMovement / 60000) + '분 전';
    }

    // 무활동 시간
    const minutes = Math.floor(timeSinceMovement / 60000);
    inactiveTime.textContent = minutes + '분';

    // 진행률 바
    const progress = Math.min((timeSinceMovement / AppState.apneaThreshold) * 100, 100);
    progressFill.style.width = progress + '%';

    // 색상 변경
    if (progress > 80) {
        progressFill.style.background = 'linear-gradient(90deg, var(--color-danger), var(--color-danger))';
    } else if (progress > 50) {
        progressFill.style.background = 'linear-gradient(90deg, var(--color-warning), var(--color-danger))';
    }
}

function updateConfidenceScore() {
    document.getElementById('confidenceScore').textContent = AppState.confidence + '%';
}

function updateHistoryUI() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    AppState.history.forEach(item => {
        const historyItem = createHistoryItem(item);
        historyList.appendChild(historyItem);
    });
}

function createHistoryItem(item) {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.dataset.type = item.type;

    const icon = item.type === 'normal' ? '✅' : item.type === 'fall' ? '⚠️' : '😴';
    const title = item.type === 'normal' ? '정상 상태' : item.type === 'fall' ? '낙상 감지' : '무호흡 감지';

    const date = new Date(item.timestamp);
    const timeStr = date.toLocaleTimeString('ko-KR');

    div.innerHTML = `
        <div class="history-icon ${item.type}">
            ${icon}
        </div>
        <div class="history-details">
            <div class="history-title">${title}</div>
            <div class="history-time">${timeStr}</div>
        </div>
        <div class="history-confidence">
            신뢰도: ${item.confidence}%
        </div>
    `;

    return div;
}

// ===================================
// 7. 차트 렌더링
// ===================================
function renderChart() {
    const canvas = document.getElementById('signalChart');
    const ctx = canvas.getContext('2d');

    // 캔버스 크기 설정
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // 배경 클리어
    ctx.clearRect(0, 0, width, height);

    // 그리드 그리기
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
        const y = padding + (height - padding * 2) * i / 5;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    if (AppState.chartData.timestamps.length < 2) return;

    // 심박수 그래프
    drawLine(ctx, AppState.chartData.heartRates, 'rgba(59, 130, 246, 1)', width, height, padding, 40, 120);

    // 호흡수 그래프
    drawLine(ctx, AppState.chartData.breathRates, 'rgba(16, 185, 129, 1)', width, height, padding, 10, 30);
}

function drawLine(ctx, data, color, width, height, padding, minVal, maxVal) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const dataWidth = width - padding * 2;
    const dataHeight = height - padding * 2;

    data.forEach((value, index) => {
        const x = padding + (dataWidth * index / (data.length - 1));
        const normalizedValue = (value - minVal) / (maxVal - minVal);
        const y = padding + dataHeight - (normalizedValue * dataHeight);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
}

// ===================================
// 8. 알림 및 토스트 함수
// ===================================
function showAlert(type, confidence) {
    const alertBanner = document.getElementById('alertBanner');
    const alertTitle = document.getElementById('alertTitle');
    const alertDescription = document.getElementById('alertDescription');

    const messages = {
        fall: {
            title: '⚠️ 낙상 감지',
            description: '낙상이 감지되었습니다. 10초 후 보호자에게 알림이 발송됩니다.'
        },
        apnea: {
            title: '😴 무호흡 감지',
            description: '5분 이상 움직임이 없습니다. 10초 후 보호자에게 알림이 발송됩니다.'
        }
    };

    alertTitle.textContent = messages[type].title;
    alertDescription.textContent = messages[type].description;
    alertBanner.style.display = 'block';
}

function closeAlert() {
    document.getElementById('alertBanner').style.display = 'none';
}

function showNotification(message) {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// ===================================
// 9. 설정 관리
// ===================================
function saveSettings() {
    AppState.settings.apneaThresholdMinutes = parseInt(document.getElementById('apneaThreshold').value);
    AppState.settings.sensitivity = parseInt(document.getElementById('sensitivity').value);
    AppState.settings.guardianPhone = document.getElementById('guardianPhone').value;
    AppState.settings.guardianEmail = document.getElementById('guardianEmail').value;

    AppState.apneaThreshold = AppState.settings.apneaThresholdMinutes * 60 * 1000;

    showNotification('설정이 저장되었습니다.');
}

// ===================================
// 10. 이벤트 리스너
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // 필터 버튼
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const filter = e.target.dataset.filter;
            filterHistory(filter);
        });
    });

    // 차트 범위 버튼
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // 토글 스위치
    document.getElementById('fallAlert').addEventListener('change', (e) => {
        AppState.settings.fallAlert = e.target.checked;
    });

    document.getElementById('apneaAlert').addEventListener('change', (e) => {
        AppState.settings.apneaAlert = e.target.checked;
    });

    document.getElementById('soundAlert').addEventListener('change', (e) => {
        AppState.settings.soundAlert = e.target.checked;
    });

    // 슬라이더
    document.getElementById('apneaThreshold').addEventListener('input', (e) => {
        document.getElementById('apneaThresholdValue').textContent = e.target.value + '분';
    });

    document.getElementById('sensitivity').addEventListener('input', (e) => {
        document.getElementById('sensitivityValue').textContent = e.target.value;
    });

    // 시스템 시작
    const monitor = new ElderCareMonitor();
    monitor.start();

    // 테스트용: 5초 후 낙상 시뮬레이션
    setTimeout(() => simulateFall(), 5000);

    // 테스트용: 15초 후 정상 복귀
    setTimeout(() => simulateNormal(), 15000);
});

function filterHistory(filter) {
    const items = document.querySelectorAll('.history-item');

    items.forEach(item => {
        if (filter === 'all' || item.dataset.type === filter) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// ===================================
// 11. 테스트 시뮬레이션 함수
// ===================================
function simulateFall() {
    console.log('🧪 테스트: 낙상 시뮬레이션');
    AppState.currentStatus = 'fall';
}

function simulateApnea() {
    console.log('🧪 테스트: 무호흡 시뮬레이션');
    AppState.currentStatus = 'apnea';
    AppState.sensorData.lastMovement = Date.now() - (6 * 60 * 1000); // 6분 전
}

function simulateNormal() {
    console.log('🧪 테스트: 정상 상태 복귀');
    AppState.currentStatus = 'normal';
    AppState.sensorData.lastMovement = Date.now();
}
