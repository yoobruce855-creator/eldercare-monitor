// ===== WebSocket Client for Server Integration =====
// 이 파일을 script.js와 mobile-app.js에 통합

class ElderCareClient {
    constructor(wsUrl = 'ws://localhost:8080') {
        this.wsUrl = wsUrl;
        this.ws = null;
        this.reconnectInterval = null;
        this.reconnectDelay = 5000;
        this.isConnected = false;
        this.onDataUpdate = null;
        this.onAlert = null;
        this.onHistoryUpdate = null;

        this.connect();
    }

    connect() {
        try {
            this.ws = new WebSocket(this.wsUrl);

            this.ws.onopen = () => {
                console.log('✅ Connected to server');
                this.isConnected = true;
                this.updateConnectionStatus(true);

                if (this.reconnectInterval) {
                    clearInterval(this.reconnectInterval);
                    this.reconnectInterval = null;
                }
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('❌ Message parse error:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.isConnected = false;
                this.updateConnectionStatus(false);
            };

            this.ws.onclose = () => {
                console.log('📡 Disconnected from server');
                this.isConnected = false;
                this.updateConnectionStatus(false);
                this.attemptReconnect();
            };

        } catch (error) {
            console.error('❌ Connection error:', error);
            this.attemptReconnect();
        }
    }

    handleMessage(message) {
        console.log('📨 Received:', message.type);

        switch (message.type) {
            case 'initial':
                // 초기 데이터 수신
                if (this.onDataUpdate) {
                    this.onDataUpdate(message.data);
                }
                if (this.onHistoryUpdate && message.history) {
                    this.onHistoryUpdate(message.history);
                }
                break;

            case 'update':
                // 실시간 데이터 업데이트
                if (this.onDataUpdate) {
                    this.onDataUpdate(message.data);
                }
                break;

            case 'alert':
                // 알림 수신
                if (this.onAlert) {
                    this.onAlert(message.data);
                }
                break;

            case 'history':
                // 이력 데이터 수신
                if (this.onHistoryUpdate) {
                    this.onHistoryUpdate(message.data);
                }
                break;
        }
    }

    attemptReconnect() {
        if (!this.reconnectInterval) {
            console.log(`🔄 Reconnecting in ${this.reconnectDelay / 1000}s...`);
            this.reconnectInterval = setInterval(() => {
                console.log('🔄 Attempting to reconnect...');
                this.connect();
            }, this.reconnectDelay);
        }
    }

    updateConnectionStatus(connected) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');

        if (statusDot) {
            if (connected) {
                statusDot.classList.add('online');
            } else {
                statusDot.classList.remove('online');
            }
        }

        if (statusText) {
            statusText.textContent = connected ? '연결됨' : '연결 끊김';
        }
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('⚠️ WebSocket not connected');
        }
    }

    requestHistory() {
        this.send({ type: 'getHistory' });
    }

    disconnect() {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
        }
        if (this.ws) {
            this.ws.close();
        }
    }
}

// ===== API Client =====
class ElderCareAPI {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }

    async getSensorData() {
        const response = await fetch(`${this.baseUrl}/api/sensor-data`);
        return await response.json();
    }

    async getHistory(status = 'all', limit = 50) {
        const response = await fetch(`${this.baseUrl}/api/history?status=${status}&limit=${limit}`);
        return await response.json();
    }

    async getStatistics() {
        const response = await fetch(`${this.baseUrl}/api/statistics`);
        return await response.json();
    }

    async simulateFall() {
        const response = await fetch(`${this.baseUrl}/api/simulate/fall`, {
            method: 'POST'
        });
        return await response.json();
    }

    async simulateApnea() {
        const response = await fetch(`${this.baseUrl}/api/simulate/apnea`, {
            method: 'POST'
        });
        return await response.json();
    }

    async simulateNormal() {
        const response = await fetch(`${this.baseUrl}/api/simulate/normal`, {
            method: 'POST'
        });
        return await response.json();
    }

    async startAutoSimulation() {
        const response = await fetch(`${this.baseUrl}/api/simulation/start`, {
            method: 'POST'
        });
        return await response.json();
    }

    async stopAutoSimulation() {
        const response = await fetch(`${this.baseUrl}/api/simulation/stop`, {
            method: 'POST'
        });
        return await response.json();
    }
}

// ===== Export for use =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ElderCareClient, ElderCareAPI };
}
