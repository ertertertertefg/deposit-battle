require('dotenv').config();
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Простой HTTP-клиент для CryptoBot API (без библиотеки)
async function cryptoBotApi(method, params = {}) {
    const token = process.env.CRYPTO_PAY_TOKEN;
    if (!token) return null;
    
    const response = await fetch(`https://pay.crypt.bot/api/${method}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Crypto-Pay-API-Token": token
        },
        body: JSON.stringify(params)
    });
    
    const data = await response.json();
    return data.ok ? data.result : null;
}

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

// ═══════ CRYPTOBOT API — ОПЛАТА USDT ═══════

// Создание счёта на оплату
app.post("/api/create-crypto-invoice", async (req, res) => {
    const { userId, boostId, priceUSD } = req.body;
    
    const boostNames = {
        speedWork: "⚡ Ускоритель работы",
        goldenDay: "🍀 Золотой день",
        prediction: "🔮 Предсказание"
    };

    // Демо-режим если нет токена
    if (!process.env.CRYPTO_PAY_TOKEN) {
        const saves = readSaves();
        if (saves[userId]) {
            saves[userId].pendingBoost = { boostId, status: "demo" };
            writeSaves(saves);
        }
        return res.json({ 
            success: true, 
            demo: true,
            message: "Демо-режим: оплата не требуется"
        });
    }

    try {
        const invoice = await cryptoBotApi("createInvoice", {
            asset: "USDT",
            amount: priceUSD.toString(),
            description: boostNames[boostId],
            hidden_message: `Буст ${boostId} для игрока ${userId}`,
            payload: JSON.stringify({ userId, boostId }),
            paid_btn_name: "openBot",
            paid_btn_url: `https://t.me/${process.env.BOT_USERNAME || "CryptoBot"}`
        });

        if (!invoice) {
            return res.status(500).json({ error: "Failed to create invoice" });
        }

        // Сохраняем pending
        const saves = readSaves();
        if (saves[userId]) {
            saves[userId].pendingBoost = { 
                boostId, 
                invoiceId: invoice.invoice_id,
                status: "pending" 
            };
            writeSaves(saves);
        }

        res.json({ 
            success: true, 
            payUrl: invoice.pay_url,
            invoiceId: invoice.invoice_id
        });
    } catch (error) {
        console.error("CryptoBot error:", error);
        res.status(500).json({ error: "Failed to create invoice" });
    }
});

// Проверка статуса оплаты
app.get("/api/check-crypto-payment/:userId", async (req, res) => {
    const saves = readSaves();
    const userId = req.params.userId;
    
    // Демо-режим
    if (!process.env.CRYPTO_PAY_TOKEN) {
        if (saves[userId]?.pendingBoost?.status === "demo") {
            return res.json({ paid: true, demo: true, boostId: saves[userId].pendingBoost.boostId });
        }
        return res.json({ paid: false });
    }

    if (!saves[userId]?.pendingBoost?.invoiceId) {
        return res.json({ paid: false });
    }

    try {
        const invoices = await cryptoBotApi("getInvoices", {
            invoice_ids: [saves[userId].pendingBoost.invoiceId]
        });
        
        if (!invoices || !invoices.items || invoices.items.length === 0) {
            return res.json({ paid: false });
        }
        
        const invoice = invoices.items[0];
        
        if (invoice.status === "paid") {
            saves[userId].pendingBoost.status = "paid";
            writeSaves(saves);
            return res.json({ paid: true, boostId: saves[userId].pendingBoost.boostId });
        }
        
        res.json({ paid: false, status: invoice.status });
    } catch (error) {
        console.error(error);
        res.json({ paid: false });
    }
});

// Webhook от CryptoBot
app.post("/api/crypto-webhook", async (req, res) => {
    const update = req.body;
    
    if (update.payload) {
        try {
            const payload = JSON.parse(update.payload);
            const { userId, boostId } = payload;
            
            const saves = readSaves();
            if (saves[userId]) {
                saves[userId].pendingBoost = { 
                    boostId, 
                    status: "paid",
                    activated: false 
                };
                writeSaves(saves);
            }
        } catch (e) {
            console.error("Webhook parse error:", e);
        }
    }
    
    res.sendStatus(200);
});

// Активация оплаченного буста
app.post("/api/activate-crypto-boost/:userId", (req, res) => {
    const saves = readSaves();
    const userId = req.params.userId;
    
    const pending = saves[userId]?.pendingBoost;
    
    if ((pending?.status === "paid" || pending?.status === "demo") && !pending?.activated) {
        const boostId = pending.boostId;
        saves[userId].pendingBoost = null;
        writeSaves(saves);
        res.json({ success: true, boostId });
    } else {
        res.json({ success: false });
    }
});

// ═══════ ОСТАЛЬНЫЕ API ═══════

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
        stockHistory: [],
        activeBoosts: {
            speedWork: { active: false, expires: null },
            goldenDay: { active: false, daysLeft: 0 },
            prediction: { active: false, nextEvent: null }
        },
        pendingBoost: null
    };
    writeSaves(saves);
    res.json(saves[userId]);
});

app.post("/api/save/:userId", (req, res) => {
    const saves = readSaves();
    const userId = req.params.userId;

    const { balance, deposit, day, crypto, stocks, cryptoPrice, stockPrice, userName, achievements, lastLoginDate, loginStreak, tradeCount, cryptoHoldDays, cryptoHistory, stockHistory, activeBoosts, pendingBoost } = req.body;

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
        stockHistory: stockHistory || [],
        activeBoosts: activeBoosts || {
            speedWork: { active: false, expires: null },
            goldenDay: { active: false, daysLeft: 0 },
            prediction: { active: false, nextEvent: null }
        },
        pendingBoost: pendingBoost || null
    };

    writeSaves(saves);
    res.json({ success: true, save: saves[userId] });
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
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
    console.log(`💰 CryptoBot: ${process.env.CRYPTO_PAY_TOKEN ? '✅ Подключен' : '⚠️ Демо-режим (нет CRYPTO_PAY_TOKEN)'}`);
});