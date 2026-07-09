const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const SAVES_FILE = path.join(__dirname, "saves.json");

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function readSaves() {
    if (!fs.existsSync(SAVES_FILE)) {
        fs.writeFileSync(SAVES_FILE, JSON.stringify({}, null, 2));
    }
    const data = fs.readFileSync(SAVES_FILE, "utf-8");
    try {
        return JSON.parse(data || "{}");
    } catch {
        return {};
    }
}

function writeSaves(saves) {
    fs.writeFileSync(SAVES_FILE, JSON.stringify(saves, null, 2));
}

app.get("/api/save/:userId", (req, res) => {
    const saves = readSaves();
    const userId = req.params.userId;

    if (saves[userId]) {
        return res.json(saves[userId]);
    }

    if (saves["guest"]) {
        return res.json(saves["guest"]);
    }

    saves[userId] = {
        balance: 35000,
        deposit: 0,
        day: 1,
        crypto: 0,
        stocks: 0,
        cryptoPrice: 23000,
        stockPrice: 1000,
        userName: "Игрок",
        achievements: [],
        lastLoginDate: null,
        loginStreak: 0,
        tradeCount: 0,
        cryptoHoldDays: 0,
        cryptoHistory: [],
        stockHistory: []
    };
    writeSaves(saves);

    res.json(saves[userId]);
});

app.post("/api/save/:userId", (req, res) => {
    const saves = readSaves();
    const userId = req.params.userId;

    const { balance, deposit, day, crypto, stocks, cryptoPrice, stockPrice, userName, achievements, lastLoginDate, loginStreak, tradeCount, cryptoHoldDays, cryptoHistory, stockHistory } = req.body;

    saves[userId] = {
        balance: Number(balance) || 35000,
        deposit: Number(deposit) || 0,
        day: Number(day) || 1,
        crypto: Number(crypto) || 0,
        stocks: Number(stocks) || 0,
        cryptoPrice: Number(cryptoPrice) || 23000,
        stockPrice: Number(stockPrice) || 1000,
        userName: userName || "Игрок",
        lastActive: Date.now(),
        achievements: achievements || [],
        lastLoginDate: lastLoginDate || null,
        loginStreak: loginStreak || 0,
        tradeCount: Number(tradeCount) || 0,
        cryptoHoldDays: Number(cryptoHoldDays) || 0,
        cryptoHistory: cryptoHistory || [],
        stockHistory: stockHistory || []
    };

    writeSaves(saves);

    res.json({
        success: true,
        save: saves[userId]
    });
});

app.get("/api/leaderboard", (req, res) => {
    const saves = readSaves();
    
    const leaders = Object.entries(saves)
        .filter(([id, data]) => data.day > 1)
        .map(([id, data]) => {
            const cryptoValue = (data.crypto || 0) * (data.cryptoPrice || 23000);
            const stockValue = (data.stocks || 0) * (data.stockPrice || 1000);
            const totalAssets = (data.balance || 0) + (data.deposit || 0) + cryptoValue + stockValue;
            const profit = totalAssets - 35000;
            
            return {
                userId: id,
                userName: data.userName || "Игрок",
                day: data.day || 1,
                profit: profit,
                totalAssets: totalAssets,
                achievements: (data.achievements || []).length
            };
        })
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 10);

    res.json(leaders);
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});