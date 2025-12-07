# 🚀 ElderCare Monitor - 실제 배포 가이드

## 📍 목차
1. [하드웨어 구성](#하드웨어-구성)
2. [설치 프로세스](#설치-프로세스)
3. [보호자 앱 설정](#보호자-앱-설정)
4. [비용 분석](#비용-분석)
5. [법적/윤리적 고려사항](#법적윤리적-고려사항)
6. [유지보수 계획](#유지보수-계획)

---

## 🔧 하드웨어 구성

### 필수 장비

#### 1. mmWave 레이더 센서
**추천 제품**: Texas Instruments IWR6843 또는 IWR1843
- **가격**: $50-100 USD
- **감지 범위**: 0.5m ~ 6m
- **주파수**: 60-64 GHz
- **특징**: 비접촉, 사생활 보호, 어둠에서도 작동

**구매처**:
- DigiKey: https://www.digikey.com
- Mouser: https://www.mouser.com
- 국내: 아이씨뱅큐 (icbanq.com)

#### 2. 엣지 컴퓨팅 디바이스
**옵션 A - Raspberry Pi 4 (4GB/8GB)**
- **가격**: $55-75 USD
- **장점**: 저렴, 커뮤니티 지원 풍부
- **단점**: AI 처리 속도 제한

**옵션 B - NVIDIA Jetson Nano**
- **가격**: $99-149 USD
- **장점**: GPU 가속, 실시간 AI 처리
- **추천**: 다중 센서 환경

#### 3. 추가 부품
- **전원 어댑터**: 5V 3A (Raspberry Pi) / 5V 4A (Jetson Nano)
- **microSD 카드**: 64GB 이상 (Class 10)
- **케이스**: 방열 케이스 권장
- **WiFi/LTE 모듈**: 인터넷 연결용

### 총 예상 비용
- **기본 구성**: $150-200 USD (약 20만원)
- **고급 구성**: $250-350 USD (약 35만원)

---

## 🏠 설치 프로세스

### Phase 1: 하드웨어 조립 (1-2시간)

#### Step 1: 센서 연결
```bash
# Raspberry Pi GPIO 핀 연결
mmWave 센서 → Raspberry Pi
VCC (3.3V)  → Pin 1
GND         → Pin 6
TX          → Pin 10 (RX)
RX          → Pin 8 (TX)
```

#### Step 2: OS 설치
```bash
# Raspberry Pi OS Lite 다운로드 및 설치
# https://www.raspberrypi.org/software/

# SSH 활성화
touch /boot/ssh

# WiFi 설정
nano /boot/wpa_supplicant.conf
```

#### Step 3: 소프트웨어 설치
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Python 및 필수 라이브러리
sudo apt install python3-pip python3-numpy python3-scipy -y

# mmWave SDK 설치
git clone https://github.com/ibaiGorordo/mmWave-Radar-Sensor
cd mmWave-Radar-Sensor
pip3 install -r requirements.txt
```

### Phase 2: 물리적 설치 (30분-1시간)

#### 설치 위치 선정 기준
1. **침실 (최우선)**
   - 침대 정면 천장 또는 벽면
   - 높이: 2-2.5m
   - 각도: 침대를 향해 30-45도

2. **거실**
   - 소파/의자 정면
   - 활동 범위 전체 커버

3. **화장실 입구**
   - 낙상 고위험 구역
   - 프라이버시 고려 (문 밖 설치)

#### 설치 도구
- 드릴 (벽면 설치 시)
- 앵커 볼트
- 케이블 정리용 몰딩
- 수평계

### Phase 3: 소프트웨어 설정 (1-2시간)

#### 1. 센서 캘리브레이션
```python
# calibration.py
import mmwave_sensor

sensor = mmwave_sensor.IWR6843()
sensor.connect('/dev/ttyUSB0')

# 빈 방 상태에서 베이스라인 측정
print("방을 비워주세요...")
baseline = sensor.calibrate(duration=60)
sensor.save_baseline('baseline.json')
```

#### 2. AI 모델 배포
```bash
# 사전 학습된 모델 다운로드
wget https://example.com/eldercare_model.tflite

# 모델 테스트
python3 test_model.py --model eldercare_model.tflite
```

#### 3. 클라우드 연결 설정
```bash
# AWS IoT Core 설정
pip3 install awsiotsdk

# 인증서 다운로드 및 설정
aws iot create-thing --thing-name eldercare-sensor-001
```

---

## 📱 보호자 앱 설정

### 모바일 앱 다운로드
- **Android**: Google Play Store (향후 출시)
- **iOS**: App Store (향후 출시)
- **임시 솔루션**: 웹 대시보드 사용

### 초기 설정 절차

#### 1. 계정 생성
```
1. 앱 실행
2. "새 계정 만들기" 선택
3. 이메일/전화번호 입력
4. 인증 코드 확인
```

#### 2. 센서 등록
```
1. "센서 추가" 버튼 클릭
2. QR 코드 스캔 (센서 박스에 부착)
3. WiFi 네트워크 선택
4. 연결 확인 (LED 깜빡임)
```

#### 3. 알림 설정
```
알림 유형별 설정:
├── 낙상 감지: 즉시 푸시 + SMS
├── 무호흡 감지: 즉시 푸시 + 전화
├── 일일 리포트: 오전 8시
└── 배터리 부족: 푸시
```

#### 4. 긴급 연락망 설정
```
우선순위 1: 주 보호자 (자녀)
우선순위 2: 부 보호자 (배우자/형제)
우선순위 3: 119 자동 연결
우선순위 4: 주치의
```

---

## 💰 비용 분석

### 초기 투자 비용

| 항목 | 수량 | 단가 | 합계 |
|------|------|------|------|
| mmWave 센서 | 1 | $80 | $80 |
| Raspberry Pi 4 (4GB) | 1 | $55 | $55 |
| microSD 64GB | 1 | $15 | $15 |
| 전원 어댑터 | 1 | $10 | $10 |
| 케이스 + 부품 | 1 | $20 | $20 |
| **총 초기 비용** | - | - | **$180** |

### 월간 운영 비용

| 항목 | 월 비용 |
|------|---------|
| 클라우드 서버 (AWS IoT) | $5-10 |
| 데이터 전송 (LTE, 선택) | $10-20 |
| 전기료 (24시간 가동) | $2-3 |
| **총 월 비용** | **$17-33** |

### 대안: 구독 서비스 모델
```
월 구독료: $29.99
포함 내용:
- 하드웨어 무상 제공 (렌탈)
- 클라우드 서비스
- 24/7 모니터링
- 정기 점검 (분기 1회)
- 하드웨어 교체 보증
```

---

## ⚖️ 법적/윤리적 고려사항

### 1. 개인정보 보호

#### GDPR/개인정보보호법 준수
```
필수 조치:
✓ 본인 동의서 작성 (노인 또는 법적 대리인)
✓ 데이터 수집 범위 명시
✓ 데이터 보관 기간 설정 (최대 1년)
✓ 데이터 삭제 요청 절차 마련
```

#### 동의서 템플릿
```
[ElderCare Monitor 사용 동의서]

본인은 다음 사항에 동의합니다:
1. 생체 신호 데이터 수집 (호흡수, 심박수, 움직임)
2. 이상 징후 발생 시 보호자에게 자동 알림
3. 의료 목적의 데이터 공유 (선택)

데이터 보관 기간: 1년
데이터 접근 권한: 본인, 등록된 보호자

서명: _______________  날짜: _______________
```

### 2. 의료기기 인증

#### 한국 (식약처)
- **등급**: 2등급 의료기기 (예상)
- **필요 인증**: 의료기기 제조 허가
- **비용**: 약 500만원-1000만원
- **기간**: 6-12개월

#### 미국 (FDA)
- **등급**: Class II Medical Device
- **필요 인증**: 510(k) Clearance
- **비용**: $10,000-50,000
- **기간**: 3-12개월

**참고**: MVP 단계에서는 "웰니스 디바이스"로 분류하여 인증 우회 가능

### 3. 책임 소재

#### 면책 조항
```
본 시스템은 보조 도구이며, 전문 의료 서비스를 대체하지 않습니다.
- 오탐/미탐 가능성 존재
- 긴급 상황 시 즉시 119 연락 권장
- 정기적인 의료 검진 병행 필수
```

---

## 🔧 유지보수 계획

### 일일 점검 (자동)
```python
# daily_check.py
def daily_health_check():
    checks = {
        'sensor_connection': check_sensor(),
        'internet_connection': check_internet(),
        'battery_level': check_battery(),
        'disk_space': check_disk(),
        'model_accuracy': validate_model()
    }
    
    if any(not v for v in checks.values()):
        send_maintenance_alert(checks)
```

### 주간 점검 (수동)
- [ ] 센서 렌즈 청소
- [ ] 케이블 연결 상태 확인
- [ ] 로그 파일 검토

### 월간 점검
- [ ] 펌웨어 업데이트 확인
- [ ] AI 모델 성능 평가
- [ ] 보호자 연락처 갱신

### 분기 점검
- [ ] 하드웨어 전체 점검
- [ ] 캘리브레이션 재수행
- [ ] 사용자 만족도 조사

### 긴급 상황 대응

#### 센서 오작동 시
```
1. 시스템 재부팅
2. 캘리브레이션 재수행
3. 로그 파일 확인
4. 필요 시 하드웨어 교체
```

#### 인터넷 연결 끊김 시
```
1. 로컬 저장소에 데이터 임시 저장
2. LTE 백업 연결 활성화
3. 연결 복구 시 자동 동기화
```

---

## 📊 성공 사례 시뮬레이션

### 시나리오 1: 야간 낙상 감지
```
23:45 - 침실에서 낙상 감지
23:45:05 - 10초 대기 타이머 시작
23:45:15 - 움직임 없음 확인
23:45:16 - 보호자에게 푸시 알림 발송
23:45:20 - 보호자 앱 확인
23:47:00 - 119 신고 (보호자 판단)
23:55:00 - 구급대 도착

결과: 낙상 후 10분 내 응급 처치 → 골든타임 확보
```

### 시나리오 2: 수면 무호흡 조기 발견
```
주간 리포트 분석:
- 월요일: 무호흡 의심 3회 (각 2분)
- 화요일: 무호흡 의심 5회 (각 3분)
- 수요일: 무호흡 의심 7회 (각 4분)

→ 보호자에게 주간 요약 발송
→ 주치의 상담 권장
→ 수면다원검사 예약

결과: 수면무호흡증 조기 진단 → CPAP 치료 시작
```

---

## 🎯 다음 단계

### 즉시 실행 가능 (1-2주)
1. ✅ 하드웨어 구매 (DigiKey/Mouser)
2. ✅ 개발 환경 설정 (Raspberry Pi)
3. ✅ 센서 연동 테스트

### 단기 목표 (1-3개월)
1. 🔄 파일럿 테스트 (가정 1-2곳)
2. 🔄 데이터 수집 및 모델 개선
3. 🔄 보호자 피드백 반영

### 중기 목표 (3-6개월)
1. ⏳ 의료기기 인증 준비
2. ⏳ 모바일 앱 개발 완료
3. ⏳ 베타 테스트 (10-20가구)

### 장기 목표 (6-12개월)
1. 📅 정식 출시
2. 📅 요양원/요양병원 연계
3. 📅 건강보험 적용 추진

---

## 📞 문의 및 지원

**기술 지원**: tech-support@eldercare-monitor.com  
**영업 문의**: sales@eldercare-monitor.com  
**긴급 연락**: +82-10-XXXX-XXXX (24/7)

**커뮤니티**:
- GitHub: https://github.com/eldercare-monitor
- Discord: https://discord.gg/eldercare
- 사용자 포럼: https://forum.eldercare-monitor.com

---

**Made with ❤️ for Elder Care**
