let balance = 100000;
let deposit = 0;
let day = 1;

const events = [
    "📈 Акции сегодня выросли на 5%",
    "📉 Криптовалюта упала на 8%",
    "🏦 Центральный банк повысил ставку",
    "💰 Вы нашли бонус 500 ₽",
    "📰 Сегодня на рынке спокойно"
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

const money = document.getElementById("money");
const depositText = document.getElementById("deposit");
const depositButton = document.getElementById("depositButton");
const depositInput = document.getElementById("depositInput");
const dayText = document.getElementById("day");
const nextDayButton = document.getElementById("nextDayButton");
const news = document.getElementById("news");
const userNameText = document.getElementById("userName");

userNameText.textContent = "👤 " + userName;

function addNews(text) {
    news.textContent = text;
}

function updateScreen() {
    money.textContent = balance.toLocaleString("ru-RU") + " ₽";

    depositText.textContent =
        "🏦 Депозит: " +
        deposit.toLocaleString("ru-RU") +
        " ₽";

    dayText.textContent = "📅 День: " + day;
}

async function loadProgress() {
    try {
        const response = await fetch(`/api/save/${userId}`);
        const data = await response.json();

        balance = data.balance;
        deposit = data.deposit;
        day = data.day;

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
                day
            })
        });
    } catch (error) {
        console.error(error);
        addNews("⚠️ Не удалось сохранить прогресс");
    }
}

depositButton.onclick = async function () {
    const amount = Number(depositInput.value);

    if (amount <= 0) {
        if (tg) {
            tg.showAlert("Введите сумму больше 0");
        } else {
            alert("Введите сумму больше 0");
        }

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
        if (tg) {
            tg.showAlert("Недостаточно денег");
        } else {
            alert("Недостаточно денег");
        }
    }
};

nextDayButton.onclick = async function () {
    day++;

    const percent = 0.01;
    const income = Math.floor(deposit * percent);

    deposit += income;

    const randomEvent = events[Math.floor(Math.random() * events.length)];

    if (randomEvent.includes("бонус")) {
        balance += 500;
    }

    updateScreen();

    news.innerHTML =
        randomEvent +
        "<br>💸 Доход по депозиту: " +
        income.toLocaleString("ru-RU") +
        " ₽";

    await saveProgress();

    if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred("success");
    }
};

loadProgress();
updateScreen();