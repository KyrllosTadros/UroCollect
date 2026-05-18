/**
 * meting.js
 */

const DUUR_MS = 24 * 60 * 60 * 1000;
let timerInterval = null;


// ── FORMAT FUNCTIES ─────────────────────────────────

function formatDatum(date) {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
}

function formatTijd(date) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
}

function formatDatumDB(date) {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
}

function formatTijdDB(date) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
}

function formatCountdown(ms) {
    if (ms <= 0) return "00:00:00";
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}


// ── START PREVIEW ─────────────────────────────────

function vulStartPreview() {
    const nu = new Date();
    const einde = new Date(nu.getTime() + DUUR_MS);

    document.getElementById("start-datum-preview").textContent =
        `${formatDatum(nu)} ${formatTijd(nu)}`;

    document.getElementById("eind-datum-preview").textContent =
        `${formatDatum(einde)} ${formatTijd(einde)}`;
}


// ── START METING ─────────────────────────────────

async function startMeting() {
    const btn = document.getElementById("start-btn");
    const errorEl = document.getElementById("start-error");

    errorEl.style.display = "none";
    btn.disabled = true;
    btn.textContent = "Bezig…";

    const nu = new Date();
    const einde = new Date(nu.getTime() + DUUR_MS);

    const payload = {
        startdate: formatDatumDB(nu),
        enddate: formatDatumDB(einde),
        starttime: formatTijdDB(nu),
        endtime: formatTijdDB(einde),
        type: "eerste",
        status: "actief"
    };

    try {
        const resp = await fetch("/sessions/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await resp.json();

        // 🔥 Alleen session_id opslaan (GEEN tijd!)
        localStorage.setItem("session_id", data.session_id);

        toonActiefScherm(nu, einde);

    } catch (err) {
        console.error(err);
        errorEl.style.display = "block";
        btn.disabled = false;
        btn.textContent = "Meting starten";
    }
}


// ── TIMER ─────────────────────────────────

function startTimer(startTs) {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const nu = Date.now();
        const verstreken = nu - startTs;
        const resterend = DUUR_MS - verstreken;

        if (resterend <= 0) {
            clearInterval(timerInterval);
            toonVoltooischerm();
            return;
        }

        const pct = Math.min((verstreken / DUUR_MS) * 100, 100);

        document.getElementById("timer-display").textContent =
            formatCountdown(resterend);

        document.getElementById("voortgang-balk").style.width =
            pct + "%";

    }, 1000);
}


// ── UI ─────────────────────────────────

function toonActiefScherm(start, einde) {
    document.getElementById("startscherm").style.display = "none";
    document.getElementById("actiefscherm").style.display = "block";
    document.getElementById("voltooischerm").style.display = "none";

    document.getElementById("gestart-datum").textContent = formatDatum(start);
    document.getElementById("gestart-tijd").textContent = formatTijd(start);
    document.getElementById("eind-datum").textContent = formatDatum(einde);
    document.getElementById("eind-tijd").textContent = formatTijd(einde);

    startTimer(start.getTime());
}

function toonVoltooischerm() {
    document.getElementById("startscherm").style.display = "none";
    document.getElementById("actiefscherm").style.display = "none";
    document.getElementById("voltooischerm").style.display = "block";
}


// ── HERSTEL VIA DATABASE ─────────────────────────────────

async function initMeting() {
    const sessionId = localStorage.getItem("session_id");

    if (!sessionId) {
        vulStartPreview();
        return;
    }

    try {
        const resp = await fetch(`/sessions/${sessionId}`);
        const data = await resp.json();

        const start = new Date(`${data.startdate}T${data.starttime}`);
        const einde = new Date(`${data.enddate}T${data.endtime}`);

        const resterend = einde.getTime() - Date.now();

        if (resterend <= 0) {
            toonVoltooischerm();
            return;
        }

        toonActiefScherm(start, einde);

    } catch (err) {
        console.error("Fout bij laden sessie:", err);
        vulStartPreview();
    }
}


// ── INIT ─────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    initMeting();
});