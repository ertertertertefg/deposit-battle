const INITIAL_BALANCE = 100000;
const INITIAL_DEPOSIT = 0;
const INITIAL_DAY = 1;
const INITIAL_CRYPTO = 0;
const INITIAL_STOCKS = 0;
const INITIAL_CRYPTO_PRICE = 50000;
const INITIAL_STOCK_PRICE = 1000;

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
let tradeCount = 0; // Счётчик сделок для ачивки "Трейдер"

// ═══════════════════════════════════════
// УНИКАЛЬНЫЙ ID ДЛЯ КАЖДОГО ИГРОКА
// ═══════════════════════════════════════

let userId = localStorage.getItem("depositBattleUserId");

if (!userId) {
    userId = "guest_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem("depositBattleUserId", userId);
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
    { id: "hodler", icon: "💪", name: "Ходлер", desc: "Держать крипту 30 дней" },
    { id: "gambler", icon: "🎲", name: "Азартный", desc: "Сыграть в казино 10 раз" },
    { id: "jackpot", icon: "💰", name: "Джекпот", desc: "Выиграть в казино 100 000 ₽ за раз" }
];

let casinoGamesPlayed = 0;
let cryptoHoldDays = 0;
let hasCrypto = false;

function getRandomEvent() {
    const isPositive = Math.random() < 0.5;
    const events = isPositive ? positiveEvents : negativeEvents;
    return events[Math.floor(Math.random() * events.length)];
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById('tab-' + tabName).classList.add('active');
    event.target.classList.add('active');
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

    tg.MainButton.setText("💾 Сохранить прогресс");
    tg.MainButton.show();

    tg.MainButton.onClick(() => {
        saveProgress();
        tg.showAlert("Прогресс сохранён!");
    });
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
const loginStreakText = document.getElementById("loginStreak");
const dailyBonusText = document.getElementById("dailyBonus");

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

// ═══════════════════════════════════════
// КАЗИНО ЭЛЕМЕНТЫ
// ═══════════════════════════════════════
const casinoBetInput = document.getElementById("casinoBetInput");
const casinoDepositBtn = document.getElementById("casinoDepositBtn");
const casinoPlayBtn = document.getElementById("casinoPlayBtn");
const casinoResult = document.getElementById("casinoResult");

if (userNameText) userNameText.textContent = "👤 " + userName;

function addNews(text) {
    if (news) news.textContent = text;
}

function updateScreen() {
    if (money) money.textContent = balance.toLocaleString("ru-RU") + " ₽";
    if (depositText) depositText.textContent = "🏦 Депозит: " + deposit.toLocaleString("ru-RU") + " ₽";
    if (dayText) dayText.textContent = "📅 День: " + day;
    if (loginStreakText) loginStreakText.textContent = "🔥 Серия: " + loginStreak + " дней";
    
    if (cryptoText) cryptoText.textContent = "₿ Крипта: " + crypto + " ₿";
    if (cryptoPriceText) cryptoPriceText.textContent = "💰 Цена: " + cryptoPrice.toLocaleString("ru-RU") + " ₽ за 1 ₿";
    if (stocksText) stocksText.textContent = "📈 Акции: " + stocks + " шт.";
    if (stockPriceText) stockPriceText.textContent = "💰 Цена: " + stockPrice.toLocaleString("ru-RU") + " ₽ за 1 акцию";
}

function checkDailyBonus() {
    const today = new Date().toDateString();
    
    if (lastLoginDate === today) {
        if (dailyBonusText) {
            dailyBonusText.innerHTML = "✅ Бонус сегодня получен!<br>🔥 Серия: " + loginStreak + "/7";
        }
        return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastLoginDate === yesterday.toDateString()) {
        loginStreak++;
    } else {
        loginStreak = 1;
    }
    
    lastLoginDate = today;
    
    let bonusCrypto = 1;
    let bonusStocks = 10;
    let bonusText = "🎁 Ежедневный бонус: +1 ₿ и +10 акций!";
    
    if (loginStreak >= 7) {
        bonusCrypto = 5;
        bonusStocks = 50;
        bonusText = "🔥 Супер-бонус за 7 дней! +5 ₿ и +50 акций!";
        loginStreak = 0;
    }
    
    crypto += bonusCrypto;
    stocks += bonusStocks;
    
    updateScreen();
    addNews(bonusText);
    
    if (dailyBonusText) {
        dailyBonusText.innerHTML = bonusText + "<br>🔥 Серия: " + loginStreak + "/7";
    }
    
    saveProgress();
}

function checkAchievements() {
    const newAchievements = [];
    const totalAssets = balance + deposit + (crypto * cryptoPrice) + (stocks * stockPrice);
    
    if (deposit >= 1000000 && !achievements.includes("banker")) {
        newAchievements.push("banker");
    }
    if (crypto >= 100 && !achievements.includes("whale")) {
        newAchievements.push("whale");
    }
    if (stocks >= 1000 && !achievements.includes("broker")) {
        newAchievements.push("broker");
    }
    if (totalAssets >= 1000000 && !achievements.includes("millionaire")) {
        newAchievements.push("millionaire");
    }
    if (positiveStreak >= 10 && !achievements.includes("lucky")) {
        newAchievements.push("lucky");
    }
    if (day >= 365 && !achievements.includes("veteran")) {
        newAchievements.push("veteran");
    }
    if (tradeCount >= 50 && !achievements.includes("trader")) {
        newAchievements.push("trader");
    }
    if (cryptoHoldDays >= 30 && !achievements.includes("hodler")) {
        newAchievements.push("hodler");
    }
    if (casinoGamesPlayed >= 10 && !achievements.includes("gambler")) {
        newAchievements.push("gambler");
    }
    
    if (newAchievements.length > 0) {
        achievements.push(...newAchievements);
        showAchievementUnlock(newAchievements);
        saveProgress();
    }
    
    renderAchievements();
}

function showAchievementUnlock(newIds) {
    newIds.forEach(id => {
        const ach = ALL_ACHIEVEMENTS.find(a => a.id === id);
        if (ach) {
            addNews(`🏆 Новая ачивка: ${ach.icon} ${ach.name}!`);
            if (tg?.showAlert) {
                tg.showAlert(`🏆 Ачивка разблокирована!\n\n${ach.icon} ${ach.name}\n${ach.desc}`);
            }
        }
    });
}

function renderAchievements() {
    const list = document.getElementById("achievementsList");
    if (!list) return;
    
    let html = "";
    
    ALL_ACHIEVEMENTS.forEach(ach => {
        const unlocked = achievements.includes(ach.id);
        const status = unlocked ? "✅" : "🔒";
        const opacity = unlocked ? "1" : "0.5";
        
        html += `
            <div class="achievement-item" style="opacity: ${opacity}">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${status} ${ach.name}</div>
                    <div class="achievement-desc">${ach.desc}</div>
                </div>
            </div>
        `;
    });
    
    html += `<div class="achievement-count">Разблокировано: ${achievements.length}/${ALL_ACHIEVEMENTS.length}</div>`;
    
    list.innerHTML = html;
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
        cryptoPrice = data.cryptoPrice || 50000;
        stockPrice = data.stockPrice || 1000;
        achievements = data.achievements || [];
        lastLoginDate = data.lastLoginDate || null;
        loginStreak = data.loginStreak || 0;
        tradeCount = data.tradeCount || 0;
        casinoGamesPlayed = data.casinoGamesPlayed || 0;
        cryptoHoldDays = data.cryptoHoldDays || 0;

        updateScreen();
        checkDailyBonus();
        checkAchievements();
        addNews("✅ Прогресс загружен");
    } catch (error) {
        console.error(error);
        addNews("⚠️ Не удалось загрузить прогресс");
    }
}

async function saveProgress() {
    try {
        await fetch(`/api/save/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                balance,
                deposit,
                day,
                crypto,
                stocks,
                cryptoPrice,
                stockPrice,
                userName: userName,
                achievements,
                lastLoginDate,
                loginStreak,
                tradeCount,
                casinoGamesPlayed,
                cryptoHoldDays
            })
        });
    } catch (error) {
        console.error(error);
        addNews("⚠️ Не удалось сохранить прогресс");
    }
}

async function loadLeaderboard() {
    const leaderboardList = document.getElementById("leaderboardList");
    if (!leaderboardList) return;
    
    leaderboardList.innerHTML = '<div class="loading">Загрузка...</div>';
    
    try {
        const response = await fetch("/api/leaderboard");
        const leaders = await response.json();
        
        if (leaders.length === 0) {
            leaderboardList.innerHTML = '<div class="empty">Пока никто не играл 😢</div>';
            return;
        }
        
        let html = '';
        leaders.forEach((leader, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '•';
            const profitColor = leader.profit >= 0 ? 'profit-positive' : 'profit-negative';
            const profitSign = leader.profit >= 0 ? '+' : '';
            const achStars = '⭐'.repeat(leader.achievements || 0);
            
            html += `
                <div class="leader-item">
                    <div class="leader-rank">${medal} ${index + 1}</div>
                    <div class="leader-info">
                        <div class="leader-name">${leader.userName}</div>
                        <div class="leader-days">📅 ${leader.day} дней ${achStars}</div>
                    </div>
                    <div class="leader-profit ${profitColor}">
                        ${profitSign}${leader.profit.toLocaleString("ru-RU")} ₽
                    </div>
                </div>
            `;
        });
        
        leaderboardList.innerHTML = html;
    } catch (error) {
        console.error(error);
        leaderboardList.innerHTML = '<div class="error">Ошибка загрузки 😢</div>';
    }
}

// ═══════════════════════════════════════
// ДЕПОЗИТ
// ═══════════════════════════════════════

if (depositButton) {
    depositButton.onclick = async function () {
        if (!depositInput) return;
        const amount = Number(depositInput.value);
        if (amount <= 0) {
            tg ? tg.showAlert("Введите сумму больше 0") : alert("Введите сумму больше 0");
            return;
        }
        if (balance >= amount) {
            balance -= amount;
            deposit += amount;
            depositInput.value = "";
            updateScreen();
            checkAchievements();
            addNews("🏦 Вы положили " + amount.toLocaleString("ru-RU") + " ₽ на депозит");
            await saveProgress();
        } else {
            tg ? tg.showAlert("Недостаточно денег") : alert("Недостаточно денег");
        }
    };
}

if (withdrawButton) {
    withdrawButton.onclick = async function () {
        if (!depositInput) return;
        const amount = Number(depositInput.value);
        if (amount <= 0) {
            tg ? tg.showAlert("Введите сумму больше 0") : alert("Введите сумму больше 0");
            return;
        }
        if (deposit >= amount) {
            deposit -= amount;
            balance += amount;
            depositInput.value = "";
            updateScreen();
            addNews("🏦 Вы сняли " + amount.toLocaleString("ru-RU") + " ₽ с депозита");
            await saveProgress();
        } else {
            tg ? tg.showAlert("Недостаточно денег на депозите") : alert("Недостаточно денег на депозите");
        }
    };
}

// ═══════════════════════════════════════
// КРИПТОВАЛЮТА
// ═══════════════════════════════════════

if (buyCryptoButton) {
    buyCryptoButton.onclick = async function () {
        if (!cryptoInput) return;
        const amount = Number(cryptoInput.value);
        if (amount <= 0) {
            tg ? tg.showAlert("Введите количество больше 0") : alert("Введите количество больше 0");
            return;
        }
        const totalCost = amount * cryptoPrice;
        if (balance >= totalCost) {
            balance -= totalCost;
            crypto += amount;
            tradeCount++;
            if (!hasCrypto) hasCrypto = true;
            cryptoInput.value = "";
            updateScreen();
            checkAchievements();
            addNews("🚀 Вы купили " + amount + " ₿ за " + totalCost.toLocaleString("ru-RU") + " ₽");
            await saveProgress();
        } else {
            tg ? tg.showAlert("Недостаточно денег") : alert("Недостаточно денег");
        }
    };
}

if (sellCryptoButton) {
    sellCryptoButton.onclick = async function () {
        if (!cryptoInput) return;
        const amount = Number(cryptoInput.value);
        if (amount <= 0) {
            tg ? tg.showAlert("Введите количество больше 0") : alert("Введите количество больше 0");
            return;
        }
        if (crypto >= amount) {
            const totalCost = amount * cryptoPrice;
            balance += totalCost;
            crypto -= amount;
            tradeCount++;
            if (crypto === 0) hasCrypto = false;
            cryptoInput.value = "";
            updateScreen();
            checkAchievements();
            addNews("💰 Вы продали " + amount + " ₿ за " + totalCost.toLocaleString("ru-RU") + " ₽");
            await saveProgress();
        } else {
            tg ? tg.showAlert("Недостаточно криптовалюты") : alert("Недостаточно криптовалюты");
        }
    };
}

// ═══════════════════════════════════════
// АКЦИИ
// ═══════════════════════════════════════

if (buyStockButton) {
    buyStockButton.onclick = async function () {
        if (!stockInput) return;
        const amount = Number(stockInput.value);
        if (amount <= 0) {
            tg ? tg.showAlert("Введите количество больше 0") : alert("Введите количество больше 0");
            return;
        }
        const totalCost = amount * stockPrice;
        if (balance >= totalCost) {
            balance -= totalCost;
            stocks += amount;
            tradeCount++;
            stockInput.value = "";
            updateScreen();
            checkAchievements();
            addNews("📈 Вы купили " + amount + " акций за " + totalCost.toLocaleString("ru-RU") + " ₽");
            await saveProgress();
        } else {
            tg ? tg.showAlert("Недостаточно денег") : alert("Недостаточно денег");
        }
    };
}

if (sellStockButton) {
    sellStockButton.onclick = async function () {
        if (!stockInput) return;
        const amount = Number(stockInput.value);
        if (amount <= 0) {
            tg ? tg.showAlert("Введите количество больше 0") : alert("Введите количество больше 0");
            return;
        }
        if (stocks >= amount) {
            const totalCost = amount * stockPrice;
            balance += totalCost;
            stocks -= amount;
            tradeCount++;
            stockInput.value = "";
            updateScreen();
            checkAchievements();
            addNews("💰 Вы продали " + amount + " акций за " + totalCost.toLocaleString("ru-RU") + " ₽");
            await saveProgress();
        } else {
            tg ? tg.showAlert("Недостаточно акций") : alert("Недостаточно акций");
        }
    };
}

// ═══════════════════════════════════════
// КАЗИНО 🎰
// ═══════════════════════════════════════

let casinoCooldown = false;

if (casinoDepositBtn) {
    casinoDepositBtn.onclick = async function () {
        if (!casinoBetInput) return;
        const amount = Number(casinoBetInput.value);
        
        if (amount <= 0) {
            tg ? tg.showAlert("Введите сумму больше 0") : alert("Введите сумму больше 0");
            return;
        }
        if (balance >= amount) {
            balance -= amount;
            updateScreen();
            addNews("💳 Вы поставили " + amount.toLocaleString("ru-RU") + " ₽ в казино");
            if (casinoResult) {
                casinoResult.innerHTML = `<div style="color: var(--accent-gold);">💳 Ставка: ${amount.toLocaleString("ru-RU")} ₽<br>Нажмите "Испытать удачу"!</div>`;
            }
            await saveProgress();
        } else {
            tg ? tg.showAlert("Недостаточно денег") : alert("Недостаточно денег");
        }
    };
}

if (casinoPlayBtn) {
    casinoPlayBtn.onclick = async function () {
        if (casinoCooldown) {
            tg ? tg.showAlert("Подождите 2 секунды!") : alert("Подождите 2 секунды!");
            return;
        }

        const amount = Number(casinoBetInput.value);
        if (amount <= 0) {
            tg ? tg.showAlert("Сначала введите ставку и нажмите 'Положить деньги'") : alert("Сначала введите ставку и нажмите 'Положить деньги'");
            return;
        }

        casinoCooldown = true;
        casinoPlayBtn.style.opacity = "0.5";
        casinoPlayBtn.style.pointerEvents = "none";
        casinoPlayBtn.textContent = "🎲 Крутим...";

        // Анимация крутения
        let spins = 0;
        const maxSpins = 10;
        const spinInterval = setInterval(() => {
            spins++;
            const randomEmoji = ["🍒", "🍋", "💎", "7️⃣", "🎰", "⭐"][Math.floor(Math.random() * 6)];
            if (casinoResult) casinoResult.innerHTML = `<div style="font-size: 32px;">${randomEmoji} ${randomEmoji} ${randomEmoji}</div>`;
            
            if (spins >= maxSpins) {
                clearInterval(spinInterval);
                finishCasinoGame(amount);
            }
        }, 200);
    };
}

async function finishCasinoGame(amount) {
    const isWin = Math.random() < 0.40; // 40% шанс выигрыша
    casinoGamesPlayed++;
    
    if (isWin) {
        const winAmount = amount * 2;
        balance += winAmount;
        updateScreen();
        
        if (casinoResult) {
            casinoResult.innerHTML = `
                <div style="color: var(--accent-green); font-weight: bold;">
                    🎉 ВЫИГРЫШ! +${winAmount.toLocaleString("ru-RU")} ₽<br>
                    <span style="font-size: 14px; color: var(--text-secondary);">Баланс: ${balance.toLocaleString("ru-RU")} ₽</span>
                </div>
            `;
        }
        addNews("🎰 КАЗИНО: Вы выиграли " + winAmount.toLocaleString("ru-RU") + " ₽!");
        
        if (winAmount >= 100000 && !achievements.includes("jackpot")) {
            achievements.push("jackpot");
            showAchievementUnlock(["jackpot"]);
        }
    } else {
        if (casinoResult) {
            casinoResult.innerHTML = `
                <div style="color: var(--accent-red); font-weight: bold;">
                    💀 ПРОИГРЫШ...<br>
                    <span style="font-size: 14px; color: var(--text-secondary);">Ставка сгорела</span>
                </div>
            `;
        }
        addNews("🎰 КАЗИНО: Вы проиграли " + amount.toLocaleString("ru-RU") + " ₽");
    }
    
    casinoBetInput.value = "";
    checkAchievements();
    await saveProgress();
    
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred(isWin ? "success" : "error");
    }

    setTimeout(() => {
        casinoCooldown = false;
        casinoPlayBtn.style.opacity = "1";
        casinoPlayBtn.style.pointerEvents = "auto";
        casinoPlayBtn.textContent = "🎲 Испытать удачу";
    }, 2000);
}

// ═══════════════════════════════════════
// СЛЕДУЮЩИЙ ДЕНЬ
// ═══════════════════════════════════════

let nextDayCooldown = false;

if (nextDayButton) {
    nextDayButton.onclick = async function () {
        if (nextDayCooldown) {
            tg ? tg.showAlert("Подождите 3 секунды!") : alert("Подождите 3 секунды!");
            return;
        }

        nextDayCooldown = true;
        nextDayButton.style.opacity = "0.5";
        nextDayButton.style.pointerEvents = "none";
        nextDayButton.textContent = "Подождите...";

        day++;

        const percent = 0.01;
        const income = Math.floor(deposit * percent);
        deposit += income;

        const event = getRandomEvent();

        if (event.crypto > 1.0) positiveStreak++;
        else positiveStreak = 0;

        cryptoPrice = Math.max(1000, Math.floor(cryptoPrice * event.crypto));
        stockPrice = Math.max(50, Math.floor(stockPrice * event.stock));

        // Считаем дни холдинга крипты
        if (hasCrypto) {
            cryptoHoldDays++;
        }

        updateScreen();

        let newsText = event.text + "<br>💸 Доход по депозиту: " + income.toLocaleString("ru-RU") + " ₽";
        
        if (event.crypto !== 1.0) {
            const cryptoPercent = Math.round((event.crypto - 1) * 100);
            newsText += "<br>₿ Крипта: " + (cryptoPercent > 0 ? "📈 +" : "📉 ") + cryptoPercent + "%";
        }
        
        if (event.stock !== 1.0) {
            const stockPercent = Math.round((event.stock - 1) * 100);
            newsText += "<br>📈 Акции: " + (stockPercent > 0 ? "📈 +" : "📉 ") + stockPercent + "%";
        }

        if (news) news.innerHTML = newsText;

        checkAchievements();

        await saveProgress();

        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred("success");
        }

        setTimeout(() => {
            nextDayCooldown = false;
            nextDayButton.style.opacity = "1";
            nextDayButton.style.pointerEvents = "auto";
            nextDayButton.textContent = "Следующий день";
        }, 3000);
    };
}

// ═══════════════════════════════════════
// РЕСТАРТ
// ═══════════════════════════════════════

if (restartButton) {
    restartButton.onclick = async function () {
        const confirmed = tg ? confirm("Точно начать заново? Весь прогресс будет потерян!") : confirm("Точно начать заново? Весь прогресс будет потерян!");
        if (!confirmed) return;

        balance = INITIAL_BALANCE;
        deposit = INITIAL_DEPOSIT;
        day = INITIAL_DAY;
        crypto = INITIAL_CRYPTO;
        stocks = INITIAL_STOCKS;
        cryptoPrice = INITIAL_CRYPTO_PRICE;
        stockPrice = INITIAL_STOCK_PRICE;
        achievements = [];
        lastLoginDate = null;
        loginStreak = 0;
        tradeCount = 0;
        casinoGamesPlayed = 0;
        cryptoHoldDays = 0;
        hasCrypto = false;

        updateScreen();
        addNews("🔄 Игра начата заново! Удачи!");
        await saveProgress();

        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred("warning");
        }
    };
}

// ═══════════════════════════════════════
// ЛИДЕРБОРД
// ═══════════════════════════════════════

if (refreshLeaderboardBtn) {
    refreshLeaderboardBtn.onclick = loadLeaderboard;
}

// ═══════════════════════════════════════
// СТАРТ
// ═══════════════════════════════════════

loadProgress();
updateScreen();