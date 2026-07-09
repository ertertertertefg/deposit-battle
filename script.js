let balance = 100000;
let deposit = 0;
let day = 1;

// Криптовалюта и акции
let crypto = 0;
let stocks = 0;
let cryptoPrice = 50000;
let stockPrice = 1000;

const events = [
    "📈 Акции сегодня выросли на 5%",
    "📉 Криптовалюта упала на 8%",
    "🏦 Центральный банк повысил ставку",
    "💰 Вы нашли бонус 500 ₽",
    "📰 Сегодня на рынке спокойно",
    "🚀 Криптовалюта взлетела на 15%!",
    "📉 Акции упали на 10%",
    "💎 Редкий бонус: 1000 ₽"
];

// ═══════════════════════════════════════
// ВКЛАДКИ
// ═══════════════════════════════════════

function showTab(tabName) {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убираем активность со всех кнопок
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем нужную вкладку
    document.getElementById('tab-' + tabName).classList.add('active');
    
    // Делаем кнопку активной
    event.target.classList.add('active');
}

// ═══════════════════════════════════════
// TELEGRAM WEBAPP
// ═══════════════════════════════════════

const tg = window.Telegram?.WebApp;

let userId = "guest";
let userName = "Игрок";

if (tg) {
    tg.ready();
    tg.expand();

    const user = tg.initDataUnsafe?.user;
    if (user) {
        userName = user.first_name || "Игрок";
    }

    tg.MainButton.setText("💾 Сохранить прогресс");
    tg.MainButton.show();

    tg.MainButton.onClick(() => {
        saveProgress();
        tg.showAlert("Прогресс сохранён!");
    });
}

// ═══════════════════════════════════════
// ЭЛЕМЕНТЫ (с проверкой на null)
// ═══════════════════════════════════════

const money = document.getElementById("money");
const depositText = document.getElementById("deposit");
const depositButton = document.getElementById("depositButton");
const withdrawButton = document.getElementById("withdrawButton");
const depositInput = document.getElementById("depositInput");
const dayText = document.getElementById("day");
const nextDayButton = document.getElementById("nextDayButton");
const news = document.getElementById("news");
const userNameText = document.getElementById("userName");

// Крипта и акции
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

if (userNameText) userNameText.textContent = "👤 " + userName;

function addNews(text) {
    if (news) news.textContent = text;
}

function updateScreen() {
    if (money) money.textContent = balance.toLocaleString("ru-RU") + " ₽";
    if (depositText) depositText.textContent = "🏦 Депозит: " + deposit.toLocaleString("ru-RU") + " ₽";
    if (dayText) dayText.textContent = "📅 День: " + day;
    
    if (cryptoText) cryptoText.textContent = "₿ Крипта: " + crypto + " ₿";
    if (cryptoPriceText) cryptoPriceText.textContent = "💰 Цена: " + cryptoPrice.toLocaleString("ru-RU") + " ₽ за 1 ₿";
    if (stocksText) stocksText.textContent = "📈 Акции: " + stocks + " шт.";
    if (stockPriceText) stockPriceText.textContent = "💰 Цена: " + stockPrice.toLocaleString("ru-RU") + " ₽ за 1 акцию";
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

        updateScreen();
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
                stockPrice
            })
        });
    } catch (error) {
        console.error(error);
        addNews("⚠️ Не удалось сохранить прогресс");
    }
}

// ═══════════════════════════════════════
// ОБРАБОТЧИКИ КНОПОК
// ═══════════════════════════════════════

// Положить на депозит
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
            addNews("🏦 Вы положили " + amount.toLocaleString("ru-RU") + " ₽ на депозит");
            await saveProgress();
        } else {
            tg ? tg.showAlert("Недостаточно денег") : alert("Недостаточно денег");
        }
    };
}

// Снять с депозита
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

// Купить крипту
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
            cryptoInput.value = "";
            updateScreen();
            addNews("🚀 Вы купили " + amount + " ₿ за " + totalCost.toLocaleString("ru-RU") + " ₽");
            await saveProgress();
        } else {
            tg ? tg.showAlert("Недостаточно денег") : alert("Недостаточно денег");
        }
    };
}

// Продать крипту
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
            cryptoInput.value = "";
            updateScreen();
            addNews("💰 Вы продали " + amount + " ₿ за " + totalCost.toLocaleString("ru-RU") + " ₽");
            await saveProgress();
        } else {
            tg ? tg.showAlert("Недостаточно криптовалюты") : alert("Недостаточно криптовалюты");
        }
    };
}

// Купить акции
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
            stockInput.value = "";
            updateScreen();
            addNews("📈 Вы купили " + amount + " акций за " + totalCost.toLocaleString("ru-RU") + " ₽");
            await saveProgress();
        } else {
            tg ? tg.showAlert("Недостаточно денег") : alert("Недостаточно денег");
        }
    };
}

// Продать акции
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
            stockInput.value = "";
            updateScreen();
            addNews("💰 Вы продали " + amount + " акций за " + totalCost.toLocaleString("ru-RU") + " ₽");
            await saveProgress();
        } else {
            tg ? tg.showAlert("Недостаточно акций") : alert("Недостаточно акций");
        }
    };
}

// Следующий день (с кулдауном 3 секунды)
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

        const cryptoChange = (Math.random() - 0.5) * 0.3;
        cryptoPrice = Math.max(10000, Math.floor(cryptoPrice * (1 + cryptoChange)));
        
        const stockChange = (Math.random() - 0.5) * 0.2;
        stockPrice = Math.max(100, Math.floor(stockPrice * (1 + stockChange)));

        const randomEvent = events[Math.floor(Math.random() * events.length)];

        if (randomEvent.includes("бонус")) {
            balance += 500;
        }
        if (randomEvent.includes("Редкий бонус")) {
            balance += 1000;
        }

        updateScreen();

        let newsText = randomEvent + "<br>💸 Доход по депозиту: " + income.toLocaleString("ru-RU") + " ₽";
        newsText += "<br>₿ Крипта: " + (cryptoChange > 0 ? "📈 +" : "📉 ") + Math.round(cryptoChange * 100) + "%";
        newsText += "<br>📈 Акции: " + (stockChange > 0 ? "📈 +" : "📉 ") + Math.round(stockChange * 100) + "%";
        
        if (news) news.innerHTML = newsText;

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

loadProgress();
updateScreen();