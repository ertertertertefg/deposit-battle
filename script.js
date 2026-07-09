let balance = 100000;
let deposit = 0;
let day = 1;

// НОВОЕ: Криптовалюта и акции
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

const tg = window.Telegram?.WebApp;

let userId = "guest";
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

// Элементы
const money = document.getElementById("money");
const depositText = document.getElementById("deposit");
const depositButton = document.getElementById("depositButton");
const depositInput = document.getElementById("depositInput");
const dayText = document.getElementById("day");
const nextDayButton = document.getElementById("nextDayButton");
const news = document.getElementById("news");
const userNameText = document.getElementById("userName");

// НОВОЕ: Элементы крипты и акций
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

userNameText.textContent = "👤 " + userName;

function addNews(text) {
    news.textContent = text;
}

function updateScreen() {
    money.textContent = balance.toLocaleString("ru-RU") + " ₽";
    depositText.textContent = "🏦 Депозит: " + deposit.toLocaleString("ru-RU") + " ₽";
    dayText.textContent = "📅 День: " + day;
    
    // НОВОЕ: Обновляем крипту и акции
    cryptoText.textContent = "₿ Крипта: " + crypto + " ₿";
    cryptoPriceText.textContent = "💰 Цена: " + cryptoPrice.toLocaleString("ru-RU") + " ₽ за 1 ₿";
    stocksText.textContent = "📈 Акции: " + stocks + " шт.";
    stockPriceText.textContent = "💰 Цена: " + stockPrice.toLocaleString("ru-RU") + " ₽ за 1 акцию";
}

async function loadProgress() {
    try {
        const response = await fetch(`/api/save/${userId}`);
        const data = await response.json();

        balance = data.balance;
        deposit = data.deposit;
        day = data.day;
        // НОВОЕ: Загружаем крипту и акции
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
                // НОВОЕ: Сохраняем крипту и акции
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

// Депозит (старый код)
depositButton.onclick = async function () {
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

// НОВОЕ: Купить криптовалюту
buyCryptoButton.onclick = async function () {
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

// НОВОЕ: Продать криптовалюту
sellCryptoButton.onclick = async function () {
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

// НОВОЕ: Купить акции
buyStockButton.onclick = async function () {
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

// НОВОЕ: Продать акции
sellStockButton.onclick = async function () {
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

// Следующий день (обновлён)
nextDayButton.onclick = async function () {
    day++;

    // Доход по депозиту
    const percent = 0.01;
    const income = Math.floor(deposit * percent);
    deposit += income;

    // НОВОЕ: Изменение цен на крипту и акции
    const cryptoChange = (Math.random() - 0.5) * 0.3; // ±15%
    cryptoPrice = Math.max(10000, Math.floor(cryptoPrice * (1 + cryptoChange)));
    
    const stockChange = (Math.random() - 0.5) * 0.2; // ±10%
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
    
    news.innerHTML = newsText;

    await saveProgress();

    if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred("success");
    }
};

loadProgress();
updateScreen();