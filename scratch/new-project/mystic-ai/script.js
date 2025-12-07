document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const welcomeSection = document.getElementById('welcome-section');
    const selectionSection = document.getElementById('selection-section');
    const sajuInputSection = document.getElementById('saju-input-section');
    const loveInputSection = document.getElementById('love-input-section');
    const counselingInputSection = document.getElementById('counseling-input-section');
    const dreamInputSection = document.getElementById('dream-input-section');
    const tarotSection = document.getElementById('tarot-section');

    const userNameInput = document.getElementById('user-name');
    const startBtn = document.getElementById('start-btn');
    const displayName = document.getElementById('display-name');
    const serviceCards = document.querySelectorAll('.service-card');

    const tarotDeck = document.querySelector('.tarot-deck');
    const tarotResult = document.getElementById('tarot-result');
    const resultTitle = document.getElementById('result-title');
    const cardReveal = document.querySelector('.card-reveal');
    const sajuVisual = document.getElementById('saju-visual');
    const tarotSpread = document.getElementById('tarot-spread');

    const restartBtn = document.getElementById('restart-btn');
    const shareBtn = document.getElementById('share-btn');
    const talismanBtn = document.getElementById('talisman-btn');
    const premiumUnlockBtn = document.getElementById('premium-unlock-btn');
    const premiumModal = document.getElementById('premium-modal');
    const closeModal = document.querySelector('.close-modal');
    const purchaseBtn = document.querySelector('.purchase-btn');

    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const luckyColorSpan = document.getElementById('lucky-color');
    const luckyItemSpan = document.getElementById('lucky-item');
    const rankingText = document.getElementById('ranking-text');

    // Input Buttons
    const sajuStartBtn = document.getElementById('saju-start-btn');
    const loveStartBtn = document.getElementById('love-start-btn');
    const counselingStartBtn = document.getElementById('counseling-start-btn');
    const dreamStartBtn = document.getElementById('dream-start-btn');

    // Inputs
    const birthYearInput = document.getElementById('birth-year');
    const birthMonthInput = document.getElementById('birth-month');
    const birthDayInput = document.getElementById('birth-day');
    const partnerNameInput = document.getElementById('partner-name');
    const worryInput = document.getElementById('worry-input');
    const dreamInput = document.getElementById('dream-input');

    // --- State ---
    let userName = '';
    let currentService = '';

    // --- Data ---
    const tarotCards = [
        { name: "0. The Fool", desc: "새로운 시작, 모험, 순수함.", detail: "계획되지 않은 여행이나 새로운 프로젝트를 시작하기에 완벽한 시기입니다.", love: "예상치 못한 만남이 기다리고 있습니다.", work: "새로운 분야로의 이직이나 창업 운이 좋습니다.", money: "자신을 위한 투자는 아끼지 마세요." },
        { name: "I. The Magician", desc: "창조력, 자신감, 의지.", detail: "당신은 이미 목표를 이룰 모든 도구를 가지고 있습니다.", love: "당신의 매력이 정점에 달해 있습니다.", work: "능력을 인정받고 프로젝트를 주도하게 됩니다.", money: "당신의 재능이 곧 돈이 됩니다." },
        { name: "II. The High Priestess", desc: "직관, 신비, 지혜.", detail: "지금은 움직일 때가 아니라 멈춰서 내면의 소리를 들을 때입니다.", love: "서두르지 말고 기다리세요.", work: "보이지 않는 변수가 있을 수 있습니다.", money: "남들의 말보다 자신의 판단을 믿으세요." },
        { name: "III. The Empress", desc: "풍요, 자연, 모성.", detail: "물질적, 정신적으로 풍요로운 시기입니다.", love: "사랑이 깊어지고 결실을 맺는 시기입니다.", work: "노력한 만큼의 보상이 따릅니다.", money: "금전운이 매우 좋습니다." },
        { name: "IV. The Emperor", desc: "권위, 구조, 통제.", detail: "리더십을 발휘하여 상황을 통제해야 합니다.", love: "신뢰를 주는 것이 중요합니다.", work: "승진이나 중요한 직책을 맡을 수 있습니다.", money: "안정적인 자산 관리가 필요합니다." },
        { name: "V. The Hierophant", desc: "전통, 조언, 배움.", detail: "멘토의 조언을 구하거나 전통적인 방식을 따르는 것이 좋습니다.", love: "결혼을 전제로 한 만남이 있을 수 있습니다.", work: "원칙을 지키는 것이 성공의 지름길입니다.", money: "안전한 곳에 돈을 묶어두는 것이 좋습니다." },
        { name: "VI. The Lovers", desc: "사랑, 조화, 선택.", detail: "머리가 아닌 가슴이 시키는 쪽을 선택하세요.", love: "운명적인 상대를 만납니다.", work: "소통이 성공의 열쇠입니다.", money: "감정적인 소비를 주의하세요." },
        { name: "VII. The Chariot", desc: "성공, 결단력, 정복.", detail: "목표를 향해 거침없이 나아가세요.", love: "적극적인 애정 공세가 통합니다.", work: "경쟁에서 승리할 운입니다.", money: "공격적인 투자가 성과를 낼 수 있습니다." },
        { name: "VIII. Strength", desc: "힘, 용기, 인내.", detail: "부드러움이 강함을 이깁니다.", love: "상대방을 이해하고 감싸주는 포용력이 필요합니다.", work: "당신의 내공이 빛을 발합니다.", money: "장기적인 관점에서 자산을 관리하세요." },
        { name: "IX. The Hermit", desc: "성찰, 고독, 인도.", detail: "해답은 당신 안에 있습니다.", love: "혼자만의 시간이 필요합니다.", work: "혼자 집중하는 업무에서 성과가 납니다.", money: "정신적인 가치를 추구하게 됩니다." },
        { name: "X. Wheel of Fortune", desc: "운명, 변화, 주기.", detail: "피할 수 없는 변화의 흐름이 다가옵니다.", love: "관계에 큰 변화가 생깁니다.", work: "예상치 못한 기회가 옵니다.", money: "뜻밖의 수익이 생길 수 있습니다." },
        { name: "XI. Justice", desc: "정의, 공정, 진실.", detail: "뿌린 대로 거두게 될 것입니다.", love: "균형 잡힌 관계를 추구하세요.", work: "법적인 문제가 해결됩니다.", money: "정확한 계산이 필요합니다." },
        { name: "XII. The Hanged Man", desc: "희생, 관점의 전환.", detail: "잠시 멈춰서 다른 시각으로 상황을 바라보세요.", love: "상대방의 입장에서 생각해보세요.", work: "더 나은 결과를 위한 준비 과정입니다.", money: "무리한 투자는 피하세요." },
        { name: "XIII. Death", desc: "끝과 시작, 변화.", detail: "낡은 것을 버려야 새로운 것이 옵니다.", love: "나쁜 관계를 끊어낼 용기가 필요합니다.", work: "새로운 일이 시작됩니다.", money: "재정 상태를 리셋하세요." },
        { name: "XIV. Temperance", desc: "절제, 균형, 인내.", detail: "조화와 균형이 핵심입니다.", love: "서로 맞춰가는 과정이 필요합니다.", work: "협업이 중요합니다.", money: "수입과 지출의 균형을 맞추세요." },
        { name: "XV. The Devil", desc: "속박, 유혹, 집착.", detail: "부정적인 생각이나 습관에서 벗어나세요.", love: "집착을 버리세요.", work: "유혹을 뿌리치세요.", money: "사기를 당할 수 있으니 주의하세요." },
        { name: "XVI. The Tower", desc: "갑작스러운 변화, 붕괴.", detail: "기존의 틀이 깨지는 충격이 있을 수 있습니다.", love: "충격을 받아들이세요.", work: "갑작스러운 변화가 예상됩니다.", money: "비상금을 준비하세요." },
        { name: "XVII. The Star", desc: "희망, 영감, 평온.", detail: "어둠 속에서 빛나는 희망을 발견하게 됩니다.", love: "꿈꾸던 사랑이 이루어질 수 있습니다.", work: "창의적인 아이디어가 샘솟습니다.", money: "미래를 위한 투자가 좋습니다." },
        { name: "XVIII. The Moon", desc: "불안, 환상, 무의식.", detail: "보이지 않는 진실을 주의 깊게 살피세요.", love: "솔직한 대화가 필요합니다.", work: "섣불리 움직이지 말고 관망하세요.", money: "불투명한 정보에 투자하지 마세요." },
        { name: "XIX. The Sun", desc: "성공, 긍정, 활력.", detail: "성공이 보장된 카드입니다.", love: "행복하고 즐거운 데이트가 예상됩니다.", work: "프로젝트가 대성공을 거둡니다.", money: "금전적으로 매우 풍요롭습니다." },
        { name: "XX. Judgement", desc: "부활, 심판, 소명.", detail: "중요한 소식이 옵니다.", love: "재회할 수 있습니다.", work: "그동안의 노력을 보상받습니다.", money: "과거의 투자가 결실을 맺습니다." },
        { name: "XXI. The World", desc: "완성, 통합, 성취.", detail: "완벽한 성공을 의미합니다.", love: "해피엔딩입니다.", work: "목표를 달성합니다.", money: "금전적인 목표를 달성합니다." }
    ];

    const luckyColors = ["Gold", "Silver", "Deep Purple", "Royal Blue", "Emerald Green", "Crimson Red", "Midnight Black", "Pearl White"];
    const luckyItems = ["Crystal", "Old Key", "Silver Ring", "Feather", "Mirror", "Candle", "Coin", "Moonstone", "Compass", "Book"];

    // --- Initialization ---
    updateRanking();

    // --- Event Listeners ---

    // 1. Start Button
    startBtn.addEventListener('click', () => {
        const name = userNameInput.value.trim();
        if (name) {
            userName = name;
            displayName.textContent = userName;
            transitionSection(welcomeSection, selectionSection);
        } else {
            alert("Please enter your name.");
        }
    });

    userNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startBtn.click();
    });

    // 2. Service Selection
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            currentService = card.dataset.type;

            if (currentService === 'saju' || currentService === 'tojeong') {
                transitionSection(selectionSection, sajuInputSection);
            } else if (currentService === 'love') {
                transitionSection(selectionSection, loveInputSection);
            } else if (currentService === 'counseling') {
                transitionSection(selectionSection, counselingInputSection);
            } else if (currentService === 'dream') {
                transitionSection(selectionSection, dreamInputSection);
            } else if (currentService === 'daily') {
                setupTarotDeck(3);
                transitionSection(selectionSection, tarotSection);
            } else {
                setupTarotDeck(5);
                transitionSection(selectionSection, tarotSection);
            }
        });
    });

    // 3. Saju & Tojeong Start
    if (sajuStartBtn) {
        sajuStartBtn.addEventListener('click', () => {
            const year = birthYearInput.value;
            const month = birthMonthInput.value;
            const day = birthDayInput.value;

            if (!year || !month || !day) {
                alert("Please enter your complete birth date.");
                return;
            }

            startLoading(currentService === 'tojeong'
                ? ["Analyzing 2025 fortune...", "Cross-referencing Tojeong data...", "Calculating monthly fortune..."]
                : ["Analyzing Saju destiny...", "Measuring five elements energy...", "Reading life flow..."],
                () => {
                    if (currentService === 'tojeong') showTojeongResult(year, month, day);
                    else showSajuResult(year, month, day);
                }
            );
        });
    }

    // 4. Love Start
    if (loveStartBtn) {
        loveStartBtn.addEventListener('click', () => {
            const partner = partnerNameInput.value.trim();
            if (!partner) {
                alert("Please enter your partner's name.");
                return;
            }
            startLoading(["Connecting your zodiac signs...", "Synchronizing soul frequencies...", "Generating compatibility report..."],
                () => showLoveResult(partner)
            );
        });
    }

    // 5. Counseling Start
    if (counselingStartBtn) {
        counselingStartBtn.addEventListener('click', () => {
            const worry = worryInput.value.trim();
            if (!worry) {
                alert("Please enter your concern.");
                return;
            }
            startLoading(["Extracting key concerns...", "Reading subconscious tarot...", "Generating AI solution..."],
                () => showCounselingResult(worry)
            );
        });
    }

    // 6. Dream Start
    if (dreamStartBtn) {
        dreamStartBtn.addEventListener('click', () => {
            const dream = dreamInput.value.trim();
            if (!dream) {
                alert("Please enter your dream.");
                return;
            }
            startLoading(["Analyzing dream symbols...", "Cross-referencing subconscious database...", "Determining fortune..."],
                () => showDreamResult(dream)
            );
        });
    }

    // 7. Restart
    restartBtn.addEventListener('click', () => {
        location.reload();
    });

    // 8. Premium & Share
    premiumUnlockBtn.addEventListener('click', () => {
        premiumModal.classList.remove('hidden');
        premiumModal.classList.add('visible');
    });

    closeModal.addEventListener('click', () => {
        premiumModal.classList.remove('visible');
        premiumModal.classList.add('hidden');
    });

    purchaseBtn.addEventListener('click', () => {
        alert("Premium features unlocked! (Demo)");
        premiumModal.classList.remove('visible');
        premiumModal.classList.add('hidden');
        premiumUnlockBtn.style.display = 'none';

        const hiddenContent = document.createElement('div');
        hiddenContent.innerHTML = `<p style="color: #ffd700; font-weight: bold; margin-top: 20px;">✨ [Premium] 심층 분석 결과가 추가되었습니다.</p>`;
        document.getElementById('card-desc').appendChild(hiddenContent);
    });

    shareBtn.addEventListener('click', () => {
        shareBtn.classList.add('hidden');
        talismanBtn.classList.remove('hidden');
        alert("Result copied! Share with your friends.");
    });

    talismanBtn.addEventListener('click', () => {
        alert("Digital talisman saved to gallery. (Demo)");
    });

    // --- Functions ---

    function startLoading(messages, callback) {
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.classList.add('visible');

        let msgIndex = 0;
        loadingText.textContent = messages[0];

        const msgInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % messages.length;
            loadingText.textContent = messages[msgIndex];
        }, 1000);

        setTimeout(() => {
            clearInterval(msgInterval);
            loadingOverlay.classList.remove('visible');
            loadingOverlay.classList.add('hidden');
            callback();
        }, 3000);
    }

    function transitionSection(from, to) {
        from.classList.remove('active');
        from.classList.add('hidden');
        from.style.display = 'none';

        to.style.display = 'block';
        setTimeout(() => {
            to.classList.remove('hidden');
            to.classList.add('active');
        }, 50);
    }

    function updateRanking() {
        const zodiacs = ["🐭 Rat", "🐮 Ox", "🐯 Tiger", "🐰 Rabbit", "🐲 Dragon", "🐍 Snake", "🐴 Horse", "🐑 Goat", "🐵 Monkey", "🐔 Rooster", "🐶 Dog", "🐷 Pig"];
        const shuffled = zodiacs.sort(() => 0.5 - Math.random());
        const top3 = shuffled.slice(0, 3);
        if (rankingText) {
            rankingText.innerHTML = `<span style="color: #ff6b6b;">#1: ${top3[0]}</span> &nbsp;|&nbsp; #2: ${top3[1]} &nbsp;|&nbsp; #3: ${top3[2]}`;
        }
    }

    function setupTarotDeck(count) {
        tarotDeck.innerHTML = '';
        for (let i = 0; i < 22; i++) { // Show all major arcana
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-back"></div>
                    <div class="card-front"></div>
                </div>
            `;

            // Random tilt
            const randomRotate = Math.random() * 10 - 5;
            card.style.transform = `rotate(${randomRotate}deg)`;

            card.addEventListener('click', () => {
                if (document.querySelector('.card.selected')) return;
                card.classList.add('selected');

                setTimeout(() => {
                    const randomCard = tarotCards[Math.floor(Math.random() * tarotCards.length)];
                    showTarotResult(randomCard);
                }, 1000);
            });
            tarotDeck.appendChild(card);
        }
    }

    function prepareResultView(title, cardName) {
        // Hide all inputs
        [welcomeSection, selectionSection, sajuInputSection, loveInputSection, counselingInputSection, dreamInputSection].forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('active');
            el.style.display = 'none';
        });

        // Show Tarot Section (Result Container)
        tarotSection.style.display = 'block';
        setTimeout(() => {
            tarotSection.classList.remove('hidden');
            tarotSection.classList.add('active');
        }, 50);

        tarotDeck.style.display = 'none';
        tarotResult.classList.remove('hidden');
        restartBtn.classList.remove('hidden');

        // Reset specific visuals
        if (cardReveal) cardReveal.classList.add('hidden');
        if (sajuVisual) sajuVisual.classList.add('hidden');
        if (tarotSpread) tarotSpread.classList.add('hidden');

        resultTitle.textContent = title;
        document.getElementById('card-name').textContent = cardName;
    }

    function showTarotResult(card) {
        prepareResultView("The Card Answers You", card.name);

        if (cardReveal) {
            cardReveal.classList.remove('hidden');
            const front = cardReveal.querySelector('.card-front');
            front.innerHTML = `
                <div style="font-size: 4rem; margin-bottom: 20px;">🃏</div>
                <div style="font-size: 1.2rem; font-weight: bold;">${card.name}</div>
            `;
        }

        let desc = "";
        if (currentService === 'daily') desc = card.detail;
        else if (currentService === 'love') desc = card.love; // Fallback if direct tarot used
        else desc = card.desc;

        updateResultUI(desc);
    }

    function showSajuResult(year, month, day) {
        prepareResultView("Traditional Saju Analysis", "Your Destined Path");
        if (sajuVisual) sajuVisual.classList.remove('hidden');

        // Basic Logic
        const zodiacs = ["Monkey", "Rooster", "Dog", "Pig", "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat"];
        const zodiacIcons = ["🐵", "🐔", "🐶", "🐷", "🐭", "🐮", "🐯", "🐰", "🐲", "🐍", "🐴", "🐑"];
        const zodiacIndex = year % 12;

        let season = "";
        let element = "";
        if (month >= 3 && month <= 5) { season = "Spring"; element = "Wood (木)"; }
        else if (month >= 6 && month <= 8) { season = "Summer"; element = "Fire (火)"; }
        else if (month >= 9 && month <= 11) { season = "Autumn"; element = "Metal (金)"; }
        else { season = "Winter"; element = "Water (水)"; }

        document.getElementById('zodiac-icon').textContent = zodiacIcons[zodiacIndex];
        document.getElementById('zodiac-name').textContent = `${zodiacs[zodiacIndex]} of ${season}`;
        document.getElementById('element-info').textContent = `Core Energy: ${element}`;

        // Random Graphs
        const elements = ['wood', 'fire', 'earth', 'metal', 'water'];
        elements.forEach(el => {
            const height = Math.floor(Math.random() * 60) + 20;
            const bar = document.getElementById(`bar-${el}`);
            if (bar) bar.style.setProperty('--height', `${height}%`);
        });

        const wealthScore = Math.floor(Math.random() * 20) + 80;
        const fameScore = Math.floor(Math.random() * 20) + 80;

        let analysisText = `<div style="text-align: left; font-size: 0.9rem; line-height: 1.6;">`;
        analysisText += `💰 <b>[Wealth & Fame Score]</b><br>Wealth: ${wealthScore}/100 | Fame: ${fameScore}/100<br><br>`;
        analysisText += `📉 <b>[Current Fortune Flow]</b><br>Your current fortune can be summarized as 'change within stability'. Small mistakes can create a butterfly effect, so be cautious in your words and actions.<br><br>`;
        analysisText += `💡 <b>[AI Personalized Solution]</b><br>Movement or placement toward the east is auspicious. Important meetings are recommended between 10 AM and 12 PM.`;
        analysisText += `</div>`;

        updateResultUI(analysisText);
    }

    function showTojeongResult(year, month, day) {
        prepareResultView("2025 New Year Tojeong Fortune", "Year of the Snake - Overall Fortune");

        const fortunes = [
            "Like flowers blooming on a withered tree (枯木生花), you will surely bear fruit after hardship.",
            "Like a dragon obtaining its wish-fulfilling jewel (龍得如意), this is a fortune of great luck where all your wishes will come true.",
            "Like the ground hardening after rain (雨後地實), your foundation will become stronger after trials."
        ];
        const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];

        let analysisText = `<div style="text-align: left; font-size: 0.95rem; line-height: 1.6;">`;
        analysisText += `<div style="background: rgba(255,215,0,0.1); border: 1px solid #ffd700; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
            <h3 style="color: #ffd700; margin: 0 0 10px 0;">Overall Fortune</h3>
            <p style="font-size: 1.1rem; font-weight: bold; margin: 0;">"${fortune}"</p>
        </div>`;
        analysisText += `<b>🌸 Wealth Fortune</b><br>This year, the door to wealth is wide open for you.<br><br>`;
        analysisText += `<b>💼 Career/Business Fortune</b><br>There may be changes in the first half, but opportunities for promotion or expansion will come in the second half.<br><br>`;
        analysisText += `</div>`;

        updateResultUI(analysisText);
    }

    function showLoveResult(partner) {
        prepareResultView("Detailed Compatibility Analysis", `${userName} ❤️ ${partner}`);

        const outerScore = Math.floor(Math.random() * 25) + 70;
        const innerScore = Math.floor(Math.random() * 30) + 65;
        const totalScore = Math.floor((outerScore + innerScore) / 2);

        let analysisText = `<div style="text-align: center; margin-bottom: 30px;">`;
        analysisText += `<h2 style="color: #ff6b6b;">Total Score: ${totalScore}/100</h2>`;
        analysisText += `</div>`;

        analysisText += `<div style="display: flex; flex-direction: column; gap: 15px; text-align: left;">`;
        analysisText += `<div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; border-left: 4px solid #4caf50;">
            <h4 style="margin: 0; color: #fff;">Surface Compatibility: ${outerScore}/100</h4>
            <p style="font-size: 0.9rem; color: #ccc;">Your daily energies harmonize well, making communication smooth and natural.</p>
        </div>`;
        analysisText += `<div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; border-left: 4px solid #d585ff;">
            <h4 style="margin: 0; color: #fff;">Deep Compatibility: ${innerScore}/100</h4>
            <p style="font-size: 0.9rem; color: #ccc;">An intense relationship that stimulates each other's deep subconscious.</p>
        </div>`;
        analysisText += `</div>`;

        updateResultUI(analysisText);
    }

    function showCounselingResult(worry) {
        prepareResultView("Answer to Your Concern", "AI Solution Report");
        if (tarotSpread) tarotSpread.classList.remove('hidden');

        const cards = [];
        for (let i = 0; i < 3; i++) cards.push(tarotCards[Math.floor(Math.random() * tarotCards.length)]);

        tarotSpread.innerHTML = '';
        const labels = ["Past (Cause)", "Present (Situation)", "Future (Solution)"];

        cards.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.style.display = 'flex';
            cardEl.style.flexDirection = 'column';
            cardEl.style.alignItems = 'center';
            cardEl.style.width = '30%';
            cardEl.innerHTML = `
                <div style="width: 100%; padding-top: 150%; background: linear-gradient(135deg, #2a2a3e, #1a1a2e); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; position: relative; margin-bottom: 10px;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2rem;">🃏</div>
                </div>
                <span style="font-size: 0.8rem; color: #aaa;">${labels[index]}</span>
                <span style="font-size: 0.9rem; font-weight: bold; color: #fff; text-align: center;">${card.name}</span>
            `;
            tarotSpread.appendChild(cardEl);
        });

        let analysisText = `<div style="text-align: left; font-size: 0.95rem; line-height: 1.6;">`;
        analysisText += `<div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px;">"${worry}"</div>`;
        analysisText += `<b>1. Past: ${cards[0].name}</b><br>${cards[0].desc}<br><br>`;
        analysisText += `<b>2. Present: ${cards[1].name}</b><br>${cards[1].detail}<br><br>`;
        analysisText += `<b>3. Future: ${cards[2].name}</b><br>${cards[2].detail}<br><br>`;
        analysisText += `<div style="margin-top: 20px; padding: 15px; border-left: 3px solid #00d2d3; background: rgba(0, 210, 211, 0.1);"><b>💡 AI Advice</b><br>Positive changes are expected. Take action!</div>`;
        analysisText += `</div>`;

        updateResultUI(analysisText);
    }

    function showDreamResult(dream) {
        prepareResultView("Message from Your Subconscious", "AI Dream Interpretation");

        const isGood = Math.random() > 0.3;
        const type = isGood ? "Lucky Dream 🍀" : "Warning Dream ⚠️";
        const color = isGood ? "#4caf50" : "#ff6b6b";

        const lotto = [];
        while (lotto.length < 6) {
            const r = Math.floor(Math.random() * 45) + 1;
            if (lotto.indexOf(r) === -1) lotto.push(r);
        }
        lotto.sort((a, b) => a - b);

        let analysisText = `<div style="text-align: left; font-size: 0.95rem; line-height: 1.6;">`;
        analysisText += `<div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px;">"${dream}"</div>`;
        analysisText += `<h3 style="color: ${color}; text-align: center;">${type}</h3>`;
        analysisText += isGood ? "This dream suggests rising wealth fortune and unexpected luck." : "This dream reflects current psychological anxiety. Rest is needed.";
        analysisText += `<div style="background: #2a2a3e; padding: 15px; border-radius: 10px; text-align: center; margin-top: 20px; border: 1px solid #ffd700;">
            <h4 style="color: #ffd700; margin: 0 0 10px 0;">🎰 AI Recommended Lucky Numbers</h4>
            ${lotto.join(', ')}
        </div></div>`;

        updateResultUI(analysisText);
    }

    function updateResultUI(text) {
        const descEl = document.getElementById('card-desc');
        descEl.innerHTML = text;
        descEl.style.textAlign = 'left';
        descEl.style.lineHeight = '1.6';
        descEl.style.fontSize = '0.95rem';
        descEl.style.padding = '20px';
        descEl.style.background = 'rgba(0,0,0,0.4)';
        descEl.style.borderRadius = '12px';

        const randomColor = luckyColors[Math.floor(Math.random() * luckyColors.length)];
        const randomItem = luckyItems[Math.floor(Math.random() * luckyItems.length)];
        luckyColorSpan.textContent = randomColor;
        luckyColorSpan.style.color = randomColor === 'Midnight Black' ? '#aaa' : randomColor;
        luckyItemSpan.textContent = randomItem;

        premiumUnlockBtn.style.display = 'inline-block';
    }

    function handlePremiumAndReset() {
        // Helper to reset state if needed
    }
});
