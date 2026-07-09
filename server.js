const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const SAVES_FILE = path.join(__dirname, "saves.json");

app.use(express.json());
app.use(express.static(path.join(__dirname))); // ← исправлено! Было "public"

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

    if (!saves[userId]) {
        saves[userId] = {
            balance: 100000,
            deposit: 0,
            day: 1
        };

        writeSaves(saves);
    }

    res.json(saves[userId]);
});

app.post("/api/save/:userId", (req, res) => {
    const saves = readSaves();
    const userId = req.params.userId;

    const { balance, deposit, day } = req.body;

    saves[userId] = {
        balance: Number(balance) || 100000,
        deposit: Number(deposit) || 0,
        day: Number(day) || 1
    };

    writeSaves(saves);

    res.json({
        success: true,
        save: saves[userId]
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});