# ✅ ElderCare Monitor - 빠른 시작 체크리스트

## 🛒 구매 단계 (1-3일)

### 필수 하드웨어
- [ ] **mmWave 센서** - Texas Instruments IWR6843
  - 구매처: [DigiKey](https://www.digikey.com) 또는 [Mouser](https://www.mouser.com)
  - 예상 가격: $80-100
  - 배송: 3-7일

- [ ] **Raspberry Pi 4 (4GB 이상)**
  - 구매처: [공식 판매점](https://www.raspberrypi.org/products/)
  - 예상 가격: $55-75
  - 국내: 엘레파츠, 디바이스마트

- [ ] **microSD 카드 (64GB, Class 10)**
  - 예상 가격: $15
  - 추천: SanDisk Extreme

- [ ] **전원 어댑터 (5V 3A)**
  - Raspberry Pi 공식 어댑터 권장
  - 예상 가격: $10

- [ ] **케이블 및 부품**
  - USB-C 케이블
  - 점퍼 와이어 (암-수)
  - 브레드보드 (테스트용)

### 선택 사항
- [ ] **방열 케이스** (24시간 가동 시 권장)
- [ ] **LTE 모듈** (WiFi 불안정 시)
- [ ] **UPS/배터리 백업** (정전 대비)

**총 예상 비용: $180-250**

---

## 🔧 설치 단계 (1일)

### 1단계: 하드웨어 조립 (1-2시간)

- [ ] Raspberry Pi OS 다운로드
  - [공식 사이트](https://www.raspberrypi.org/software/)
  - Raspberry Pi Imager 사용

- [ ] microSD 카드에 OS 설치
  - SSH 활성화
  - WiFi 설정 (wpa_supplicant.conf)

- [ ] mmWave 센서 연결
  ```
  센서 핀 → Raspberry Pi GPIO
  VCC → Pin 1 (3.3V)
  GND → Pin 6 (Ground)
  TX  → Pin 10 (GPIO 15, RX)
  RX  → Pin 8 (GPIO 14, TX)
  ```

- [ ] 첫 부팅 및 SSH 접속
  ```bash
  ssh pi@raspberrypi.local
  # 기본 비밀번호: raspberry
  ```

### 2단계: 소프트웨어 설정 (1-2시간)

- [ ] 시스템 업데이트
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```

- [ ] Python 환경 설정
  ```bash
  sudo apt install python3-pip python3-numpy python3-scipy -y
  pip3 install --upgrade pip
  ```

- [ ] 프로젝트 파일 다운로드
  ```bash
  git clone https://github.com/your-repo/elderly-care-monitor.git
  cd elderly-care-monitor
  pip3 install -r requirements.txt
  ```

- [ ] 센서 드라이버 설치
  ```bash
  # mmWave 센서 SDK
  git clone https://github.com/ibaiGorordo/mmWave-Radar-Sensor
  cd mmWave-Radar-Sensor
  pip3 install -r requirements.txt
  ```

- [ ] 권한 설정
  ```bash
  sudo usermod -a -G dialout pi
  sudo chmod 666 /dev/ttyUSB0
  ```

### 3단계: 센서 테스트 (30분)

- [ ] 센서 연결 확인
  ```bash
  python3 test_sensor.py
  # 출력: "Sensor connected successfully"
  ```

- [ ] 데이터 수집 테스트
  ```bash
  python3 collect_data.py --duration 60
  # 1분간 데이터 수집 및 저장
  ```

- [ ] 캘리브레이션
  ```bash
  # 방을 비운 상태에서 실행
  python3 calibrate.py
  # baseline.json 파일 생성 확인
  ```

---

## 🏠 물리적 설치 (1-2시간)

### 설치 위치 선정

- [ ] **침실 설치** (최우선)
  - 위치: 침대 정면 천장 또는 벽면
  - 높이: 2-2.5m
  - 각도: 침대를 향해 30-45도
  - 거리: 침대로부터 2-4m

- [ ] **전원 연결**
  - 안정적인 전원 콘센트
  - 케이블 정리 (몰딩 사용)

- [ ] **인터넷 연결 확인**
  - WiFi 신호 강도 확인
  - 필요 시 WiFi 중계기 설치

### 설치 도구 준비

- [ ] 드릴 (벽면 설치 시)
- [ ] 앵커 볼트
- [ ] 수평계
- [ ] 케이블 정리용 몰딩
- [ ] 테이프 (임시 고정용)

### 설치 과정

- [ ] 임시 위치 테스트 (테이프로 고정)
- [ ] 감지 범위 확인 (테스트 프로그램 실행)
- [ ] 최적 위치 결정
- [ ] 영구 설치 (드릴/볼트)
- [ ] 케이블 정리

---

## 📱 보호자 앱 설정 (30분)

### 웹 대시보드 접속 (임시)

- [ ] Raspberry Pi IP 주소 확인
  ```bash
  hostname -I
  # 예: 192.168.1.100
  ```

- [ ] 웹 서버 시작
  ```bash
  cd elderly-care-monitor
  python3 -m http.server 8080
  ```

- [ ] 브라우저에서 접속
  - URL: `http://[Raspberry-Pi-IP]:8080`
  - 예: `http://192.168.1.100:8080`

### 알림 설정

- [ ] 보호자 이메일 등록
- [ ] 전화번호 등록
- [ ] 알림 유형 선택
  - 낙상 감지: 즉시 알림
  - 무호흡 감지: 즉시 알림
  - 일일 리포트: 오전 8시

### 긴급 연락망 설정

- [ ] 주 보호자 (우선순위 1)
- [ ] 부 보호자 (우선순위 2)
- [ ] 119 자동 연결 설정
- [ ] 주치의 연락처 (선택)

---

## 🧪 테스트 단계 (1-2일)

### Day 1: 기본 기능 테스트

- [ ] **정상 상태 모니터링**
  - 시간: 2시간
  - 확인 사항: 심박수, 호흡수 정상 표시

- [ ] **낙상 시뮬레이션**
  ```bash
  python3 simulate.py --event fall
  ```
  - 알림 수신 확인 (10초 이내)
  - 대시보드 상태 변경 확인

- [ ] **무호흡 시뮬레이션**
  ```bash
  python3 simulate.py --event apnea
  ```
  - 5분 대기 후 알림 확인

### Day 2: 실제 환경 테스트

- [ ] **수면 모니터링** (야간)
  - 실제 수면 중 데이터 수집
  - 다음 날 아침 데이터 검토

- [ ] **일상 활동 모니터링** (주간)
  - 침대 출입 감지
  - 활동량 측정

- [ ] **오탐 확인**
  - 반려동물 움직임
  - 선풍기/에어컨 바람
  - 문 여닫기

---

## ⚙️ 최적화 단계 (1주일)

### 감지 임계값 조정

- [ ] **무호흡 감지 시간**
  - 기본값: 5분
  - 조정 범위: 3-10분
  - 개인 특성에 맞게 조정

- [ ] **낙상 감지 민감도**
  - 기본값: 7/10
  - 오탐 많으면: 감소 (5-6)
  - 미탐 많으면: 증가 (8-9)

### 알림 빈도 조정

- [ ] 일일 리포트 시간 설정
- [ ] 주간 요약 발송 요일 선택
- [ ] 야간 알림 설정 (22:00-06:00)

### 데이터 검토

- [ ] 1주일 데이터 분석
- [ ] 패턴 확인 (수면 시간, 활동량)
- [ ] 이상 징후 빈도 확인

---

## 🔐 보안 및 개인정보 보호

### 필수 조치

- [ ] **동의서 작성**
  - 본인 또는 법적 대리인 서명
  - 데이터 수집 범위 명시
  - 보관 기간 설정

- [ ] **비밀번호 변경**
  ```bash
  passwd
  # Raspberry Pi 기본 비밀번호 변경
  ```

- [ ] **방화벽 설정**
  ```bash
  sudo apt install ufw
  sudo ufw enable
  sudo ufw allow 22/tcp  # SSH
  sudo ufw allow 8080/tcp  # Web Dashboard
  ```

- [ ] **데이터 암호화**
  - HTTPS 인증서 설치
  - 데이터베이스 암호화

### 정기 점검

- [ ] 주간: 로그 파일 검토
- [ ] 월간: 비밀번호 변경
- [ ] 분기: 보안 업데이트 확인

---

## 📊 성공 기준

### 기술적 성능

- [ ] **정확도**: 90% 이상
  - 1주일 테스트 후 평가
  - 오탐률 5% 이하

- [ ] **응답 시간**: 10초 이내
  - 이상 징후 감지 → 알림 발송

- [ ] **가동률**: 99% 이상
  - 24시간 연속 작동
  - 재부팅 최소화

### 사용자 만족도

- [ ] 보호자 피드백 수집
  - 알림 적절성
  - 대시보드 사용성
  - 전반적 만족도

- [ ] 노인 당사자 피드백
  - 불편함 여부
  - 사생활 침해 느낌
  - 안전감 증가 여부

---

## 🚨 문제 해결

### 센서 연결 안 됨

```bash
# 1. USB 포트 확인
ls /dev/ttyUSB*

# 2. 권한 확인
sudo chmod 666 /dev/ttyUSB0

# 3. 재부팅
sudo reboot
```

### 알림이 오지 않음

- [ ] 인터넷 연결 확인
- [ ] 이메일/전화번호 정확성 확인
- [ ] 스팸 폴더 확인
- [ ] 방화벽 설정 확인

### 오탐이 너무 많음

- [ ] 감지 민감도 낮추기 (7 → 5)
- [ ] 캘리브레이션 재수행
- [ ] 센서 위치 조정

### 미탐이 발생함

- [ ] 감지 민감도 높이기 (7 → 9)
- [ ] 센서 각도 조정
- [ ] 센서 청소 (먼지 제거)

---

## 📞 지원 받기

### 커뮤니티 지원

- **GitHub Issues**: 기술적 문제
- **Discord**: 실시간 채팅
- **포럼**: 사용자 경험 공유

### 전문 지원 (향후)

- **이메일**: support@eldercare-monitor.com
- **전화**: +82-10-XXXX-XXXX
- **원격 지원**: TeamViewer/AnyDesk

---

## 🎯 다음 단계

### 설치 완료 후

- [ ] 1주일 모니터링 데이터 수집
- [ ] 피드백 제출 (개선 사항)
- [ ] 추가 센서 설치 고려 (거실, 화장실)

### 장기 계획

- [ ] 모바일 앱 출시 대기
- [ ] 의료기관 연계 검토
- [ ] 건강보험 적용 추진 참여

---

**축하합니다! 🎉**  
ElderCare Monitor 설치가 완료되었습니다.  
사랑하는 가족의 안전을 지켜주셔서 감사합니다.

**Made with ❤️ for Elder Care**
