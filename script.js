const INITIAL_BALANCE = 35000;
const INITIAL_DEPOSIT = 0;
const INITIAL_DAY = 1;
const INITIAL_CRYPTO = 0;
const INITIAL_STOCKS = 0;
const INITIAL_CRYPTO_PRICE = 23000;
const INITIAL_STOCK_PRICE = 1000;

// Цены бустов в USDT
const BOOST_PRICES = {
    speedWork: 0.5,
    goldenDay: 0.75,
    prediction: 0.25
};

let balance = INITIAL_BALANCE;
let deposit = INITIAL_DEPOSIT;
let day = INITIAL_DAY;
let crypto = INITIAL_CRYPTO;
let stocks = INITIAL_STOCKS;
let cryptoPrice = INITIAL_CRYPTO_PRICE;
let stockPrice = INITIAL_STOCK_PRICE;

let achievements = [];
let lastLoginDate = null;
let loginStreak = 0;
let positiveStreak = 0;
let tradeCount = 0;
let cryptoHoldDays = 0;
let hasCrypto = false;

let cryptoHistory = [];
let stockHistory = [];
const MAX_HISTORY = 30;

let activeBoosts = {
    speedWork: { active: false, expires: null },
    goldenDay: { active: false, daysLeft: 0 },
    prediction: { active: false, nextEvent: null }
};

let userId = localStorage.getItem("depositBattleUserId");
if (!userId) {
    userId = "guest_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem("depositBattleUserId", userId);
}

const RANKS = [
    { min: 0, icon: "🥚", name: "Бомж", color: "#6a9a9e" },
    { min: 50000, icon: "🧢", name: "Школьник", color: "#3db8c4" },
    { min: 200000, icon: "💼", name: "Менеджер", color: "#2a8a9a" },
    { min: 1000000, icon: "🕴️", name: "Бизнесмен", color: "#ffa502" },
    { min: 10000000, icon: "👑", name: "Олигарх", color: "#ffd700" }
];

function getRank(totalAssets) {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (totalAssets >= RANKS[i].min) return RANKS[i];
    }
    return RANKS[0];
}

const positiveEvents = [
    { text: "🚀 Крипта взлетела на 25%!", crypto: 1.25, stock: 1.0 },
    { text: "🌟 Новый блокчейн запущен", crypto: 1.50, stock: 1.0 },
    { text: "💎 Институционалы вошли в крипту", crypto: 1.35, stock: 1.0 },
    { text: "🌙 Маск твитнул про Doge", crypto: 1.15, stock: 1.0 },
    { text: "🔥 ETF одобрили биткоин", crypto: 1.40, stock: 1.0 },
    { text: "📈 Акции Tesla взлетели", crypto: 1.0, stock: 1.20 },
    { text: "🤝 Слияние гигантов", crypto: 1.0, stock: 1.30 },
    { text: "🏆 Компания выиграла тендер", crypto: 1.0, stock: 1.25 },
    { text: "💰 Рекордная прибыль квартала", crypto: 1.0, stock: 1.35 },
    { text: "🚀 IPO прошло успешно", crypto: 1.0, stock: 1.45 },
    { text: "🌍 Мировой экономический бум", crypto: 1.15, stock: 1.15 },
    { text: "🎉 Центробанки снизили ставки", crypto: 1.20, stock: 1.20 }
];

const negativeEvents = [
    { text: "📉 Крипта обвалилась на 30%", crypto: 0.70, stock: 1.0 },
    { text: "🏛️ SEC запретила крипту", crypto: 0.50, stock: 1.0 },
    { text: "💣 Хакнули биржу", crypto: 0.60, stock: 1.0 },
    { text: "⚠️ Кит продал всё", crypto: 0.65, stock: 1.0 },
    { text: "🚫 Китай забанил майнинг", crypto: 0.55, stock: 1.0 },
    { text: "📉 Акции упали на 15%", crypto: 1.0, stock: 0.85 },
    { text: "🏢 Компания обанкротилась", crypto: 1.0, stock: 0.40 },
    { text: "📰 Скандал с CEO", crypto: 1.0, stock: 0.75 },
    { text: "🔥 Регулирование рынка", crypto: 1.0, stock: 0.90 },
    { text: "⚡ Завод сгорел", crypto: 1.0, stock: 0.55 },
    { text: "💥 Глобальный кризис", crypto: 0.80, stock: 0.80 },
    { text: "🌪️ Война началась", crypto: 0.70, stock: 0.70 }
];

const ALL_ACHIEVEMENTS = [
    { id: "banker", icon: "🏦", name: "Банкир", desc: "Депозит 1 000 000 ₽" },
    { id: "whale", icon: "🐋", name: "Кит", desc: "Купить 100 ₿ крипты" },
    { id: "broker", icon: "📈", name: "Брокер", desc: "Купить 1000 акций" },
    { id: "millionaire", icon: "💎", name: "Миллионер", desc: "Общие активы > 1 000 000 ₽" },
    { id: "lucky", icon: "🎰", name: "Везунчик", desc: "10 положительных событий" },
    { id: "veteran", icon: "⏳", name: "Ветеран", desc: "Прожить 365 дней" },
    { id: "trader", icon: "💱", name: "Трейдер", desc: "Совершить 50 сделок" },
    { id: "hodler", icon: "💪", name: "Ходлер", desc: "Держать крипту 30 дней" }
];

function getRandomEvent() {
    const isPositive = Math.random() < 0.55;
    const events = isPositive ? positiveEvents : negativeEvents;
    return events[Math.floor(Math.random() * events.length)];
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById('tab-' + tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

const tg = window.Telegram?.WebApp;
let userName = "Игрок";

if (tg) {
    tg.ready();
    tg.expand();
    const user = tg.initDataUnsafe?.user;
    if (user) {
        userId = String(user.id);
        userName = user.first_name || "Игрок";
    }
    tg.MainButton.setText("💾 Сохранить");
    tg.MainButton.show();
    tg.MainButton.onClick(() => { saveProgress(); tg.showAlert("Сохранено!"); });
}

const money = document.getElementById("money");
const depositText = document.getElementById("deposit");
const depositButton = document.getElementById("depositButton");
const withdrawButton = document.getElementById("withdrawButton");
const depositInput = document.getElementById("depositInput");
const dayText = document.getElementById("day");
const nextDayButton = document.getElementById("nextDayButton");
const restartButton = document.getElementById("restartButton");
const news = document.getElementById("news");
const userNameText = document.getElementById("userName");
const userRankText = document.getElementById("userRank");
const heroAvatar = document.getElementById("heroAvatar");
const loginStreakText = document.getElementById("loginStreak");
const achCountText = document.getElementById("achCount");
const achievementsPreview = document.getElementById("achievementsPreview");

const cryptoText = document.getElementById("crypto");
const cryptoPriceText = document.getElementById("cryptoPrice");
const cryptoInput = document.getElementById("cryptoInput");
const buyCryptoButton = document.getElementById("buyCryptoButton");
const sellCryptoButton = document.getElementById("sellCryptoButton");

const stocksText = document.getElementById("stocks");
const stockPriceText = document.getElementById("stockPrice");
const stockInput = document.getElementById("stockInput");
const buyStockButton = document.getElementById("buyStockButton");
const sellStockButton = document.getElementById("sellStockButton");

const refreshLeaderboardBtn = document.getElementById("refreshLeaderboard");
const workButton = document.getElementById("workButton");
const workTimer = document.getElementById("workTimer");

let cryptoChart = null;
let stockChart = null;

if (userNameText) userNameText.textContent = userName;

function addNews(text) {
    if (news) news.textContent = text;
}

function updateRank() {
    const totalAssets = balance + deposit + (crypto * cryptoPrice) + (stocks * stockPrice);
    const rank = getRank(totalAssets);
    
    if (userRankText) {
        userRankText.textContent = rank.name;
        userRankText.style.color = rank.color;
    }
    if (heroAvatar) heroAvatar.textContent = rank.icon;
}

function updateAchPreview() {
    if (!achievementsPreview) return;
    
    if (achievements.length === 0) {
        achievementsPreview.innerHTML = '<div class="ach-preview-empty">Пока нет ачивок — жми, чтобы увидеть все!</div>';
        return;
    }
    
    let html = '';
    const recent = achievements.slice(-3).reverse();
    recent.forEach(id => {
        const ach = ALL_ACHIEVEMENTS.find(a => a.id === id);
        if (ach) {
            html += `
                <div class="ach-preview-item">
                    <div class="ach-preview-icon">${ach.icon}</div>
                    <div class="ach-preview-name">${ach.name}</div>
                </div>
            `;
        }
    });
    achievementsPreview.innerHTML = html;
}

function updateScreen() {
    if (money) money.textContent = balance.toLocaleString("ru-RU") + " ₽";
    if (depositText) depositText.textContent = deposit.toLocaleString("ru-RU") + " ₽";
    if (dayText) dayText.textContent = day;
    if (loginStreakText) loginStreakText.textContent = loginStreak;
    if (achCountText) achCountText.textContent = achievements.length + "/" + ALL_ACHIEVEMENTS.length;
    
    if (cryptoText) cryptoText.textContent = crypto + " ₿";
    if (cryptoPriceText) cryptoPriceText.textContent = cryptoPrice.toLocaleString("ru-RU") + " ₽";
    if (stocksText) stocksText.textContent = stocks + " шт.";
    if (stockPriceText) stockPriceText.textContent = stockPrice.toLocaleString("ru-RU") + " ₽";
    
    updateRank();
    updateAchPreview();
    updateBoostTimers();
    
    const modal = document.getElementById('achModal');
    if (modal && modal.classList.contains('active')) {
        renderAchModal();
    }
}

function initHistory() {
    while (cryptoHistory.length < MAX_HISTORY) cryptoHistory.push(cryptoPrice);
    while (stockHistory.length < MAX_HISTORY) stockHistory.push(stockPrice);
}

function updateHistory() {
    cryptoHistory.push(cryptoPrice);
    if (cryptoHistory.length > MAX_HISTORY) cryptoHistory.shift();
    stockHistory.push(stockPrice);
    if (stockHistory.length > MAX_HISTORY) stockHistory.shift();
}

function getChartLabels() {
    const labels = [];
    for (let i = 1; i <= MAX_HISTORY; i++) labels.push('Д' + (day - MAX_HISTORY + i));
    return labels;
}

function initCharts() {
    const cryptoCtx = document.getElementById('cryptoChart');
    const stockCtx = document.getElementById('stockChart');
    if (!cryptoCtx || !stockCtx) return;
    
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(10, 26, 31, 0.9)',
                titleColor: '#c8e0e4',
                bodyColor: '#6a9a9e',
                borderColor: '#1a3a42',
                borderWidth: 1,
                displayColors: false,
                callbacks: { label: (ctx) => ctx.parsed.y.toLocaleString('ru-RU') + ' ₽' }
            }
        },
        scales: {
            x: { display: false, grid: { display: false } },
            y: {
                display: true,
                grid: { color: 'rgba(26, 58, 66, 0.3)', drawBorder: false },
                ticks: { color: '#3d6b70', font: { size: 10 }, callback: (v) => (v/1000).toFixed(0) + 'k' }
            }
        },
        elements: { point: { radius: 0, hoverRadius: 4 }, line: { tension: 0.4, borderWidth: 2 } },
        interaction: { intersect: false, mode: 'index' }
    };
    
    cryptoChart = new Chart(cryptoCtx, {
        type: 'line',
        data: {
            labels: getChartLabels(),
            datasets: [{ data: cryptoHistory, borderColor: '#3db8c4', backgroundColor: 'rgba(61, 184, 196, 0.1)', fill: true, borderWidth: 2 }]
        },
        options: commonOptions
    });
    
    stockChart = new Chart(stockCtx, {
        type: 'line',
        data: {
            labels: getChartLabels(),
            datasets: [{ data: stockHistory, borderColor: '#2a8a9a', backgroundColor: 'rgba(42, 138, 154, 0.1)', fill: true, borderWidth: 2 }]
        },
        options: commonOptions
    });
}

function updateCharts() {
    if (!cryptoChart || !stockChart) return;
    const labels = getChartLabels();
    cryptoChart.data.labels = labels;
    cryptoChart.data.datasets[0].data = cryptoHistory;
    cryptoChart.update('none');
    stockChart.data.labels = labels;
    stockChart.data.datasets[0].data = stockHistory;
    stockChart.update('none');
}

function checkDailyBonus() {
    const today = new Date().toDateString();
    if (lastLoginDate === today) return;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastLoginDate === yesterday.toDateString()) loginStreak++;
    else loginStreak = 1;
    
    lastLoginDate = today;
    
    let bonusCrypto = 1, bonusStocks = 10, bonusText = "🎁 +1 ₿ и +10 акций!";
    if (loginStreak >= 7) {
        bonusCrypto = 5; bonusStocks = 50;
        bonusText = "🔥 Супер-бонус! +5 ₿ и +50 акций!";
        loginStreak = 0;
    }
    
    crypto += bonusCrypto;
    stocks += bonusStocks;
    updateScreen();
    addNews(bonusText);
    saveProgress();
}

function checkAchievements() {
    const newAchievements = [];
    const totalAssets = balance + deposit + (crypto * cryptoPrice) + (stocks * stockPrice);
    
    if (deposit >= 1000000 && !achievements.includes("banker")) newAchievements.push("banker");
    if (crypto >= 100 && !achievements.includes("whale")) newAchievements.push("whale");
    if (stocks >= 1000 && !achievements.includes("broker")) newAchievements.push("broker");
    if (totalAssets >= 1000000 && !achievements.includes("millionaire")) newAchievements.push("millionaire");
    if (positiveStreak >= 10 && !achievements.includes("lucky")) newAchievements.push("lucky");
    if (day >= 365 && !achievements.includes("veteran")) newAchievements.push("veteran");
    if (tradeCount >= 50 && !achievements.includes("trader")) newAchievements.push("trader");
    if (cryptoHoldDays >= 30 && !achievements.includes("hodler")) newAchievements.push("hodler");
    
    if (newAchievements.length > 0) {
        achievements.push(...newAchievements);
        showAchievementUnlock(newAchievements);
        saveProgress();
    }
    updateAchPreview();
}

function showAchievementUnlock(newIds) {
    newIds.forEach(id => {
        const ach = ALL_ACHIEVEMENTS.find(a => a.id === id);
        if (ach) {
            addNews(`🏆 ${ach.icon} ${ach.name}!`);
            if (tg?.showAlert) tg.showAlert(`🏆 ${ach.icon} ${ach.name}\n${ach.desc}`);
        }
    });
}

async function loadProgress() {
    try {
        const response = await fetch(`/api/save/${userId}`);
        const data = await response.json();

        balance = data.balance;
        deposit = data.deposit;
        day = data.day;
        crypto = data.crypto || 0;
        stocks = data.stocks || 0;
        cryptoPrice = data.cryptoPrice || 23000;
        stockPrice = data.stockPrice || 1000;
        achievements = data.achievements || [];
        lastLoginDate = data.lastLoginDate || null;
        loginStreak = data.loginStreak || 0;
        tradeCount = data.tradeCount || 0;
        cryptoHoldDays = data.cryptoHoldDays || 0;
        cryptoHistory = data.cryptoHistory || [];
        stockHistory = data.stockHistory || [];
        activeBoosts = data.activeBoosts || {
            speedWork: { active: false, expires: null },
            goldenDay: { active: false, daysLeft: 0 },
            prediction: { active: false, nextEvent: null }
        };

        initHistory();
        updateScreen();
        initCharts();
        checkDailyBonus();
        addNews("✅ Прогресс загружен");
    } catch (error) {
        console.error(error);
        addNews("⚠️ Новая игра");
        initHistory();
        initCharts();
    }
}

async function saveProgress() {
    try {
        await fetch(`/api/save/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                balance, deposit, day, crypto, stocks, cryptoPrice, stockPrice,
                userName, achievements, lastLoginDate, loginStreak,
                tradeCount, cryptoHoldDays, cryptoHistory, stockHistory,
                activeBoosts
            })
        });
    } catch (error) {
        console.error(error);
    }
}

async function loadLeaderboard() {
    const list = document.getElementById("leaderboardList");
    if (!list) return;
    list.innerHTML = '<div class="loading">Загрузка...</div>';
    
    try {
        const response = await fetch("/api/leaderboard");
        const leaders = await response.json();
        
        if (leaders.length === 0) {
            list.innerHTML = '<div class="empty">Пока никто не играл</div>';
            return;
        }
        
        let html = '';
        leaders.forEach((leader, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '•';
            const color = leader.profit >= 0 ? 'profit-positive' : 'profit-negative';
            const sign = leader.profit >= 0 ? '+' : '';
            html += `
                <div class="leader-item">
                    <div class="leader-rank">${medal}</div>
                    <div class="leader-info">
                        <div class="leader-name">${leader.userName}</div>
                        <div class="leader-days">📅 ${leader.day} дней</div>
                    </div>
                    <div class="leader-profit ${color}">${sign}${leader.profit.toLocaleString("ru-RU")} ₽</div>
                </div>
            `;
        });
        list.innerHTML = html;
    } catch (error) {
        list.innerHTML = '<div class="error">Ошибка</div>';
    }
}

// ═══════ МОДАЛЬНОЕ ОКНО АЧИВОК ═══════

function openAchModal() {
    const modal = document.getElementById('achModal');
    if (!modal) return;
    renderAchModal();
    modal.classList.add('active');
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

function closeAchModal() {
    const modal = document.getElementById('achModal');
    if (modal) modal.classList.remove('active');
}

function renderAchModal() {
    const list = document.getElementById('achModalList');
    if (!list) return;
    
    let html = '';
    
    ALL_ACHIEVEMENTS.forEach(ach => {
        const isUnlocked = achievements.includes(ach.id);
        const status = isUnlocked ? '✅' : '🔒';
        const cssClass = isUnlocked ? 'unlocked' : 'locked';
        
        html += `
            <div class="ach-item ${cssClass}">
                <div class="ach-icon-big">${ach.icon}</div>
                <div class="ach-info">
                    <div class="ach-name">${ach.name}</div>
                    <div class="ach-desc">${ach.desc}</div>
                </div>
                <div class="ach-status">${status}</div>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

document.addEventListener('click', function(e) {
    const modal = document.getElementById('achModal');
    if (modal && e.target === modal) {
        closeAchModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeAchModal();
});

// ═══════ ЦУМ — БУСТЫ С ОПЛАТОЙ USDT ═══════

async function buyBoost(boostId) {
    const priceUSD = BOOST_PRICES[boostId];
    const boostNames = {
        speedWork: "⚡ Ускоритель работы",
        goldenDay: "🍀 Золотой день",
        prediction: "🔮 Предсказание"
    };

    // Проверяем активен ли
    if (activeBoosts[boostId]?.active) {
        tg?.showAlert("Буст уже активен!");
        return;
    }

    // Проверяем неоплаченный буст
    try {
        const checkRes = await fetch(`/api/check-crypto-payment/${userId}`);
        const checkData = await checkRes.json();
        
        if (checkData.paid || checkData.demo) {
            const activateRes = await fetch(`/api/activate-crypto-boost/${userId}`, {
                method: "POST"
            });
            const activateData = await activateRes.json();
            if (activateData.success) {
                activateBoost(boostId);
                tg?.showAlert("✅ Буст активирован!");
                return;
            }
        }
    } catch (e) {}

    // Создаём счёт
    try {
        const response = await fetch("/api/create-crypto-invoice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, boostId, priceUSD })
        });
        
        const data = await response.json();
        
        if (data.demo) {
            // Демо-режим — бесплатно
            if (confirm(`💰 ДЕМО-РЕЖИМ\nАктивировать ${boostNames[boostId]} бесплатно?`)) {
                activateBoost(boostId);
                saveProgress();
            }
            return;
        }
        
        if (data.success && data.payUrl) {
            // Открываем CryptoBot для оплаты
            if (tg?.openTelegramLink) {
                tg.openTelegramLink(data.payUrl);
                showPaymentCheck(boostId);
            } else {
                window.open(data.payUrl, '_blank');
                showPaymentCheck(boostId);
            }
        } else {
            tg?.showAlert("❌ Ошибка создания счёта");
        }
    } catch (error) {
        console.error(error);
        // Fallback: демо
        if (confirm(`💰 ДЕМО\nАктивировать ${boostNames[boostId]} бесплатно?`)) {
            activateBoost(boostId);
            saveProgress();
        }
    }
}

function showPaymentCheck(boostId) {
    // Удаляем старую модалку если есть
    document.querySelector('.payment-check-modal')?.remove();
    
    const modal = document.createElement('div');
    modal.className = 'payment-check-modal';
    modal.innerHTML = `
        <div class="payment-check-box">
            <div class="icon">⏳</div>
            <div class="title">Оплата в CryptoBot</div>
            <div class="desc">Оплатите счёт в @CryptoBot, затем нажмите "Проверить"</div>
            <button class="btn-primary" onclick="checkPayment('${boostId}')">✅ Проверить оплату</button>
            <button class="btn-secondary" onclick="this.closest('.payment-check-modal').remove()">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);
}

async function checkPayment(boostId) {
    try {
        const res = await fetch(`/api/check-crypto-payment/${userId}`);
        const data = await res.json();
        
        if (data.paid || data.demo) {
            const activateRes = await fetch(`/api/activate-crypto-boost/${userId}`, {
                method: "POST"
            });
            const activateData = await activateRes.json();
            
            if (activateData.success) {
                activateBoost(boostId);
                document.querySelector('.payment-check-modal')?.remove();
                tg?.showAlert("✅ Оплата прошла! Буст активирован!");
                saveProgress();
            }
        } else {
            tg?.showAlert("⏳ Оплата ещё не поступила. Попробуйте через минуту.");
        }
    } catch (e) {
        tg?.showAlert("❌ Ошибка проверки");
    }
}

function activateBoost(boostId) {
    const now = Date.now();
    
    switch(boostId) {
        case 'speedWork':
            activeBoosts.speedWork = {
                active: true,
                expires: now + 20 * 60 * 1000
            };
            addNews("⚡ Ускоритель работы активирован! 20 мин без кулдауна");
            break;
            
        case 'goldenDay':
            activeBoosts.goldenDay = {
                active: true,
                daysLeft: 5
            };
            addNews("🍀 Золотой день! Следующие 5 дней — только удача!");
            break;
            
        case 'prediction':
    // Генерируем событие ЗАРАНЕЕ и сохраняем
    const predictedEvent = getRandomEvent();
    activeBoosts.prediction = {
        active: true,
        nextEvent: predictedEvent,
        used: false  // Флаг что ещё не использовали
    };
    addNews("🔮 Предсказание куплено! Смотри в ЦУМе");
    break;
    }
    
    updateBoostTimers();
    saveProgress();
}

function updateBoostTimers() {
    const speedTimer = document.getElementById('speedWorkTimer');
    const speedCard = speedTimer?.closest('.boost-card');
    
    if (activeBoosts.speedWork.active && activeBoosts.speedWork.expires) {
        const remaining = activeBoosts.speedWork.expires - Date.now();
        if (remaining > 0) {
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            speedTimer.textContent = `⏱️ Осталось: ${mins}м ${secs}с`;
            speedCard?.classList.add('active');
        } else {
            activeBoosts.speedWork = { active: false, expires: null };
            speedTimer.textContent = '';
            speedCard?.classList.remove('active');
        }
    } else if (speedTimer) {
        speedTimer.textContent = '';
        speedCard?.classList.remove('active');
    }
    
    const goldenTimer = document.getElementById('goldenDayTimer');
    const goldenCard = goldenTimer?.closest('.boost-card');
    
    if (activeBoosts.goldenDay.active && activeBoosts.goldenDay.daysLeft > 0) {
        goldenTimer.textContent = `📅 Осталось дней: ${activeBoosts.goldenDay.daysLeft}`;
        goldenCard?.classList.add('active');
    } else if (goldenTimer) {
        goldenTimer.textContent = '';
        goldenCard?.classList.remove('active');
    }
    
    const predPreview = document.getElementById('predictionPreview');
    const predCard = predPreview?.closest('.boost-card');
    
    if (activeBoosts.prediction.active && activeBoosts.prediction.nextEvent && !activeBoosts.prediction.used) {
        const ev = activeBoosts.prediction.nextEvent;
        let text = `🔮 Завтра: ${ev.text}`;
        if (ev.crypto !== 1.0) text += `\n₿: ${Math.round((ev.crypto-1)*100)}%`;
        if (ev.stock !== 1.0) text += `\n📈: ${Math.round((ev.stock-1)*100)}%`;
        predPreview.textContent = text;
        predPreview.classList.add('visible');
        predCard?.classList.add('active');
    } else if (predPreview) {
        predPreview.textContent = '';
        predPreview.classList.remove('visible');
        predCard?.classList.remove('active');
    }
}

setInterval(updateBoostTimers, 1000);

// ═══════ ОБРАБОТЧИКИ ═══════

if (depositButton) {
    depositButton.onclick = async function () {
        const amount = Number(depositInput?.value);
        if (amount <= 0) { tg?.showAlert("Введите сумму > 0"); return; }
        if (balance >= amount) {
            balance -= amount; deposit += amount;
            depositInput.value = "";
            updateScreen(); checkAchievements();
            addNews("🏦 +"+amount.toLocaleString("ru-RU")+" ₽ на депозит");
            await saveProgress();
        } else { tg?.showAlert("Недостаточно"); }
    };
}

if (withdrawButton) {
    withdrawButton.onclick = async function () {
        const amount = Number(depositInput?.value);
        if (amount <= 0) { tg?.showAlert("Введите сумму > 0"); return; }
        if (deposit >= amount) {
            deposit -= amount; balance += amount;
            depositInput.value = "";
            updateScreen();
            addNews("🏦 Снято "+amount.toLocaleString("ru-RU")+" ₽");
            await saveProgress();
        } else { tg?.showAlert("Недостаточно"); }
    };
}

if (buyCryptoButton) {
    buyCryptoButton.onclick = async function () {
        const amount = Number(cryptoInput?.value);
        if (amount <= 0) { tg?.showAlert("Введите количество > 0"); return; }
        const cost = amount * cryptoPrice;
        if (balance >= cost) {
            balance -= cost; crypto += amount; tradeCount++;
            if (!hasCrypto) hasCrypto = true;
            cryptoInput.value = "";
            updateScreen(); checkAchievements();
            addNews("🚀 Куплено "+amount+" ₿");
            await saveProgress();
        } else { tg?.showAlert("Недостаточно"); }
    };
}

if (sellCryptoButton) {
    sellCryptoButton.onclick = async function () {
        const amount = Number(cryptoInput?.value);
        if (amount <= 0) { tg?.showAlert("Введите количество > 0"); return; }
        if (crypto >= amount) {
            const cost = amount * cryptoPrice;
            balance += cost; crypto -= amount; tradeCount++;
            if (crypto === 0) hasCrypto = false;
            cryptoInput.value = "";
            updateScreen(); checkAchievements();
            addNews("💰 Продано "+amount+" ₿");
            await saveProgress();
        } else { tg?.showAlert("Недостаточно"); }
    };
}

if (buyStockButton) {
    buyStockButton.onclick = async function () {
        const amount = Number(stockInput?.value);
        if (amount <= 0) { tg?.showAlert("Введите количество > 0"); return; }
        const cost = amount * stockPrice;
        if (balance >= cost) {
            balance -= cost; stocks += amount; tradeCount++;
            stockInput.value = "";
            updateScreen(); checkAchievements();
            addNews("📈 Куплено "+amount+" акций");
            await saveProgress();
        } else { tg?.showAlert("Недостаточно"); }
    };
}

if (sellStockButton) {
    sellStockButton.onclick = async function () {
        const amount = Number(stockInput?.value);
        if (amount <= 0) { tg?.showAlert("Введите количество > 0"); return; }
        if (stocks >= amount) {
            const cost = amount * stockPrice;
            balance += cost; stocks -= amount; tradeCount++;
            stockInput.value = "";
            updateScreen(); checkAchievements();
            addNews("💰 Продано "+amount+" акций");
            await saveProgress();
        } else { tg?.showAlert("Недостаточно"); }
    };
}

let workCooldown = false;
if (workButton) {
    workButton.onclick = async function () {
        const hasSpeedBoost = activeBoosts.speedWork.active && 
            activeBoosts.speedWork.expires > Date.now();
        
        if (workCooldown && !hasSpeedBoost) { 
            tg?.showAlert("Подождите!"); 
            return; 
        }
        
        balance += 5000;
        updateScreen();
        addNews("💼 +5 000 ₽ за работу");
        
        if (!hasSpeedBoost) {
            workCooldown = true;
            workButton.disabled = true;
            workButton.textContent = "Перерыв...";
            let remaining = 30;
            const timer = setInterval(() => {
                remaining--;
                if (workTimer) workTimer.textContent = `⏱️ ${remaining}сек`;
                if (remaining <= 0) {
                    clearInterval(timer);
                    workCooldown = false;
                    workButton.disabled = false;
                    workButton.textContent = "Работать";
                    if (workTimer) workTimer.textContent = "";
                }
            }, 1000);
        }
        
        await saveProgress();
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred("success");
    };
}

let nextDayCooldown = false;
if (nextDayButton) {
    nextDayButton.onclick = async function () {
        if (nextDayCooldown) { tg?.showAlert("Подождите 3 сек!"); return; }
        nextDayCooldown = true;
        nextDayButton.style.opacity = "0.5";
        nextDayButton.style.pointerEvents = "none";
        nextDayButton.textContent = "⏳...";
        
        day++;
        
        let event;

// Если есть предсказание и оно ещё не использовано — используем его!
if (activeBoosts.prediction.active && activeBoosts.prediction.nextEvent && !activeBoosts.prediction.used) {
    event = activeBoosts.prediction.nextEvent;
    activeBoosts.prediction.used = true;  // Помечаем использованным
    addNews("🔮 Предсказание сбылось!");
} 
// Золотой день
else if (activeBoosts.goldenDay.active && activeBoosts.goldenDay.daysLeft > 0) {
    event = positiveEvents[Math.floor(Math.random() * positiveEvents.length)];
    activeBoosts.goldenDay.daysLeft--;
    if (activeBoosts.goldenDay.daysLeft <= 0) {
        activeBoosts.goldenDay = { active: false, daysLeft: 0 };
        addNews("🍀 Золотой день закончился!");
    }
} else {
    event = getRandomEvent();
}
        
        
         if (activeBoosts.prediction.active && activeBoosts.prediction.used) {
    activeBoosts.prediction = { active: false, nextEvent: null, used: false };
}
        
        deposit += Math.floor(deposit * 0.01);
        
        if (event.crypto > 1.0) positiveStreak++; else positiveStreak = 0;
        cryptoPrice = Math.max(1000, Math.floor(cryptoPrice * event.crypto));
        stockPrice = Math.max(50, Math.floor(stockPrice * event.stock));
        if (hasCrypto) cryptoHoldDays++;
        
        updateHistory();
        updateScreen();
        updateCharts();
        
        let text = event.text;
        if (event.crypto !== 1.0) text += " | ₿: " + Math.round((event.crypto-1)*100) + "%";
        if (event.stock !== 1.0) text += " | 📈: " + Math.round((event.stock-1)*100) + "%";
        addNews(text);
        
        checkAchievements();
        await saveProgress();
        
        setTimeout(() => {
            nextDayCooldown = false;
            nextDayButton.style.opacity = "1";
            nextDayButton.style.pointerEvents = "auto";
            nextDayButton.textContent = "➡️ Следующий день";
        }, 3000);
    };
}

if (restartButton) {
    restartButton.onclick = async function () {
        if (!confirm("Начать заново?")) return;
        balance = INITIAL_BALANCE; deposit = INITIAL_DEPOSIT; day = INITIAL_DAY;
        crypto = INITIAL_CRYPTO; stocks = INITIAL_STOCKS;
        cryptoPrice = INITIAL_CRYPTO_PRICE; stockPrice = INITIAL_STOCK_PRICE;
        achievements = []; lastLoginDate = null; loginStreak = 0;
        tradeCount = 0; cryptoHoldDays = 0; hasCrypto = false;
        cryptoHistory = []; stockHistory = [];
        activeBoosts = {
            speedWork: { active: false, expires: null },
            goldenDay: { active: false, daysLeft: 0 },
            prediction: { active: false, nextEvent: null }
        };
        initHistory(); updateScreen(); updateCharts();
        addNews("🔄 Рестарт!");
        await saveProgress();
    };
}

if (refreshLeaderboardBtn) refreshLeaderboardBtn.onclick = loadLeaderboard;

const achBlock = document.getElementById('achievementsBlock');
if (achBlock) {
    achBlock.addEventListener('click', openAchModal);
}

loadProgress();