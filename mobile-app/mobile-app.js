// ===== Global State =====
let currentState = 'normal';
let detectionHistory = [];
let notificationCount = 0;
let currentFilter = 'all';

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    registerServiceWorker();
    setupEventListeners();
    startDataSimulation();
});

// ===== App Initialization =====
function initializeApp() {
    // Hide splash screen after 2 seconds
    setTimeout(() => {
        document.getElementById('splashScreen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
    }, 2000);

    // Load saved settings
    loadSettings();

    // Initialize history
    initializeHistory();

    // Request notification permission
    requestNotificationPermission();
}

// ===== Service Worker Registration =====
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', function () {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            filterHistory(currentFilter);
        });
    });

    // Settings sliders
    const apneaSlider = document.getElementById('apneaThresholdMobile');
    const sensitivitySlider = document.getElementById('sensitivityMobile');

    if (apneaSlider) {
        apneaSlider.addEventListener('input', function () {
            document.getElementById('apneaThresholdValueMobile').textContent = this.value + '분';
        });
    }

    if (sensitivitySlider) {
        sensitivitySlider.addEventListener('input', function () {
            document.getElementById('sensitivityValueMobile').textContent = this.value;
        });
    }

    // Close modal on background click
    document.getElementById('alertModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// ===== Navigation =====
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Update bottom nav
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    // Update side menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Close side menu if open
    closeSideMenu();
}

function toggleMenu() {
    const sideMenu = document.getElementById('sideMenu');
    sideMenu.classList.toggle('active');

    // Add overlay
    if (sideMenu.classList.contains('active')) {
        const overlay = document.createElement('div');
        overlay.id = 'menuOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
        `;
        overlay.addEventListener('click', closeSideMenu);
        document.body.appendChild(overlay);
    } else {
        const overlay = document.getElementById('menuOverlay');
        if (overlay) overlay.remove();
    }
}

function closeSideMenu() {
    const sideMenu = document.getElementById('sideMenu');
    sideMenu.classList.remove('active');
    const overlay = document.getElementById('menuOverlay');
    if (overlay) overlay.remove();
}

// ===== Data Simulation =====
function startDataSimulation() {
    // Simulate real-time data updates
    setInterval(() => {
        updateVitalSigns();
        updateActivity();
    }, 2000);

    // Simulate random events for testing
    setTimeout(() => simulateFallEvent(), 10000);
    setTimeout(() => simulateApneaEvent(), 25000);
    setTimeout(() => simulateNormalEvent(), 40000);
}

function updateVitalSigns() {
    let heartRate, breathRate;

    if (currentState === 'normal') {
        heartRate = 70 + Math.floor(Math.random() * 10);
        breathRate = 14 + Math.floor(Math.random() * 6);
    } else if (currentState === 'fall') {
        heartRate = 100 + Math.floor(Math.random() * 20);
        breathRate = 20 + Math.floor(Math.random() * 8);
    } else if (currentState === 'apnea') {
        heartRate = 50 + Math.floor(Math.random() * 15);
        breathRate = 5 + Math.floor(Math.random() * 5);
    }

    document.getElementById('heartRateMobile').textContent = heartRate;
    document.getElementById('breathRateMobile').textContent = breathRate;
}

function updateActivity() {
    const now = new Date();
    const seconds = Math.floor(Math.random() * 60);
    document.getElementById('lastMovementMobile').textContent = seconds + '초 전';
    document.getElementById('lastUpdateMobile').textContent = '방금 전';

    if (currentState === 'apnea') {
        document.getElementById('inactiveTimeMobile').textContent = '5분 이상';
    } else {
        document.getElementById('inactiveTimeMobile').textContent = '0분';
    }
}

// ===== State Management =====
function updateStatus(state, confidence = 95) {
    currentState = state;

    const statusBadge = document.getElementById('statusBadgeMobile');
    const statusText = document.getElementById('statusTextMobile');
    const statusIcon = document.getElementById('statusIconMobile');
    const confidenceScore = document.getElementById('confidenceScoreMobile');

    // Remove all state classes
    statusBadge.classList.remove('warning', 'danger');
    statusIcon.classList.remove('warning', 'danger');

    if (state === 'normal') {
        statusText.textContent = '정상';
        statusBadge.style.background = 'rgba(16, 185, 129, 0.1)';
        statusBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        statusBadge.style.color = '#10b981';
    } else if (state === 'fall') {
        statusText.textContent = '낙상';
        statusBadge.classList.add('danger');
        statusIcon.classList.add('danger');
    } else if (state === 'apnea') {
        statusText.textContent = '무호흡';
        statusBadge.classList.add('warning');
        statusIcon.classList.add('warning');
    }

    confidenceScore.textContent = confidence + '%';
}

// ===== Event Simulation =====
function simulateFallEvent() {
    updateStatus('fall', 92);
    addToHistory('fall', '낙상 감지', '즉시 확인이 필요합니다.');
    showAlert('fall', '낙상 감지', '낙상이 감지되었습니다. 즉시 확인이 필요합니다.');
    sendNotification('🚨 낙상 감지', '어머니에게 낙상이 감지되었습니다.');
    playAlertSound();
}

function simulateApneaEvent() {
    updateStatus('apnea', 88);
    addToHistory('apnea', '무호흡 감지', '5분 이상 움직임이 없습니다.');
    showAlert('apnea', '무호흡 감지', '무호흡이 감지되었습니다. 확인이 필요합니다.');
    sendNotification('😴 무호흡 감지', '어머니에게 무호흡이 감지되었습니다.');
    playAlertSound();
}

function simulateNormalEvent() {
    updateStatus('normal', 95);
    addToHistory('normal', '정상 상태', '모든 생체 신호가 정상입니다.');
}

// ===== History Management =====
function initializeHistory() {
    // Add some initial history items
    addToHistory('normal', '정상 상태', '모든 생체 신호가 정상입니다.', new Date(Date.now() - 3600000));
    addToHistory('normal', '정상 상태', '모든 생체 신호가 정상입니다.', new Date(Date.now() - 7200000));
}

function addToHistory(type, title, description, timestamp = new Date()) {
    const historyItem = {
        type,
        title,
        description,
        timestamp
    };

    detectionHistory.unshift(historyItem);

    // Keep only last 50 items
    if (detectionHistory.length > 50) {
        detectionHistory = detectionHistory.slice(0, 50);
    }

    updateHistoryDisplay();
    updateRecentEvents();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyListMobile');
    if (!historyList) return;

    const filteredHistory = currentFilter === 'all'
        ? detectionHistory
        : detectionHistory.filter(item => item.type === currentFilter);

    historyList.innerHTML = filteredHistory.map(item => `
        <div class="event-item ${item.type === 'fall' ? 'danger' : item.type === 'apnea' ? 'warning' : ''}">
            <div class="event-icon">${getEventIcon(item.type)}</div>
            <div class="event-info">
                <div class="event-type">${item.title}</div>
                <div class="event-time">${formatTime(item.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

function updateRecentEvents() {
    const recentList = document.getElementById('recentEventsList');
    if (!recentList) return;

    const recentEvents = detectionHistory.slice(0, 3);

    recentList.innerHTML = recentEvents.map(item => `
        <div class="event-item ${item.type === 'fall' ? 'danger' : item.type === 'apnea' ? 'warning' : ''}">
            <div class="event-icon">${getEventIcon(item.type)}</div>
            <div class="event-info">
                <div class="event-type">${item.title}</div>
                <div class="event-time">${formatTime(item.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

function filterHistory(filter) {
    currentFilter = filter;
    updateHistoryDisplay();
}

function getEventIcon(type) {
    const icons = {
        normal: '✅',
        fall: '🚨',
        apnea: '😴'
    };
    return icons[type] || '📊';
}

function formatTime(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return minutes + '분 전';
    if (hours < 24) return hours + '시간 전';
    return days + '일 전';
}

// ===== Alerts & Notifications =====
function showAlert(type, title, message) {
    const modal = document.getElementById('alertModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');

    modalIcon.textContent = type === 'fall' ? '🚨' : type === 'apnea' ? '😴' : '⚠️';
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    modal.classList.add('active');

    // Vibrate if supported
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
}

function closeModal() {
    document.getElementById('alertModal').classList.remove('active');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function sendNotification(title, body) {
    // Update notification badge
    notificationCount++;
    document.getElementById('notificationBadge').textContent = notificationCount;

    // Send push notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: 'icon-192.png',
            badge: 'icon-192.png',
            vibrate: [200, 100, 200],
            tag: 'eldercare-alert'
        });
    }
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showToast('알림 권한이 허용되었습니다.');
            }
        });
    }
}

function showNotifications() {
    showToast('알림 센터 (개발 중)');
    notificationCount = 0;
    document.getElementById('notificationBadge').textContent = '0';
}

function playAlertSound() {
    // Check if sound alert is enabled
    const soundAlert = document.getElementById('soundAlertMobile');
    if (soundAlert && soundAlert.checked) {
        // Create audio context for alert sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

// ===== Settings =====
function saveSettingsMobile() {
    const settings = {
        fallAlert: document.getElementById('fallAlertMobile').checked,
        apneaAlert: document.getElementById('apneaAlertMobile').checked,
        pushNotification: document.getElementById('pushNotificationMobile').checked,
        soundAlert: document.getElementById('soundAlertMobile').checked,
        apneaThreshold: document.getElementById('apneaThresholdMobile').value,
        sensitivity: document.getElementById('sensitivityMobile').value
    };

    localStorage.setItem('eldercare-settings', JSON.stringify(settings));
    showToast('설정이 저장되었습니다.');
}

function loadSettings() {
    const savedSettings = localStorage.getItem('eldercare-settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);

        document.getElementById('fallAlertMobile').checked = settings.fallAlert;
        document.getElementById('apneaAlertMobile').checked = settings.apneaAlert;
        document.getElementById('pushNotificationMobile').checked = settings.pushNotification;
        document.getElementById('soundAlertMobile').checked = settings.soundAlert;
        document.getElementById('apneaThresholdMobile').value = settings.apneaThreshold;
        document.getElementById('sensitivityMobile').value = settings.sensitivity;

        document.getElementById('apneaThresholdValueMobile').textContent = settings.apneaThreshold + '분';
        document.getElementById('sensitivityValueMobile').textContent = settings.sensitivity;
    }
}

// ===== Contacts =====
function makeCall(phoneNumber) {
    if (confirm(`${phoneNumber}로 전화를 걸까요?`)) {
        window.location.href = `tel:${phoneNumber}`;
    }
}

function callEmergency() {
    if (confirm('119에 긴급 연락하시겠습니까?')) {
        window.location.href = 'tel:119';
    }
}

function addContact() {
    showToast('연락처 추가 기능 (개발 중)');
}

// ===== PWA Install Prompt =====
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Show install button or prompt
    showToast('앱을 홈 화면에 추가할 수 있습니다.');
});

window.addEventListener('appinstalled', () => {
    showToast('앱이 설치되었습니다!');
    deferredPrompt = null;
});

// ===== Online/Offline Detection =====
window.addEventListener('online', () => {
    showToast('인터넷에 연결되었습니다.');
    document.querySelector('.status-dot').classList.add('online');
});

window.addEventListener('offline', () => {
    showToast('인터넷 연결이 끊어졌습니다.');
    document.querySelector('.status-dot').classList.remove('online');
});

// ===== Utility Functions =====
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ===== Export for testing =====
window.simulateFall = simulateFallEvent;
window.simulateApnea = simulateApneaEvent;
window.simulateNormal = simulateNormalEvent;
