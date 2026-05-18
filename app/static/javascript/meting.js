/**
 * meting.js — logica voor de metingpagina
 *
 * Taken:
 *  1. Toont de verwachte start- en eindtijd op het startscherm.
 *  2. Stuurt bij het starten een POST naar /sessions/add met start- en eindgegevens.
 *  3. Start een afteltimer van 24 uur.
 *  4. Toont het voltooischerm zodra de 24 uur voorbij zijn.
 *  5. Slaat de sessie-id op in localStorage zodat de timer herstart na een pagina-refresh.
 */

const DUUR_MS = 24 * 60 * 60 * 1000; // 24 uur in milliseconden

let timerInterval = null;

// ── Hulpfuncties ──────────────────────────────────────────────────────────────

/** Formatteert een Date als 'DD-MM-JJJJ' */
function formatDatum(date) {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
}

/** Formatteert een Date als 'HH:MM' */
function formatTijd(date) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
}

/** Formatteert een Date als 'JJJJ-MM-DD' (voor de database) */
function formatDatumDB(date) {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
}

/** Formatteert een Date als 'HH:MM:SS' (voor de database) */
function formatTijdDB(date) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
}

/** Formatteert milliseconden resterende tijd als 'HH:MM:SS' */
function formatCountdown(ms) {
    if (ms <= 0) return "00:00:00";
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Startscherm preview ───────────────────────────────────────────────────────

function vulStartPreview() {
    const nu = new Date();
    const einde = new Date(nu.getTime() + DUUR_MS);
    document.getElementById("start-datum-preview").textContent =
        `${formatDatum(nu)} ${formatTijd(nu)}`;
    document.getElementById("eind-datum-preview").textContent =
        `${formatDatum(einde)} ${formatTijd(einde)}`;
}

// ── Meting starten ────────────────────────────────────────────────────────────

async function startMeting() {
    const btn = document.getElementById("start-btn");
    const errorEl = document.getElementById("start-error");
    errorEl.style.display = "none";
    btn.disabled = true;
    btn.textContent = "Bezig…";

    const nu = new Date();
    const einde = new Date(nu.getTime() + DUUR_MS);

    const payload = {
        startdate:  formatDatumDB(nu),
        enddate:    formatDatumDB(einde),
        starttime:  formatTijdDB(nu),
        endtime:    formatTijdDB(einde),
        type:       "eerste",
        status:     "actief"
    };

    try {
        const resp = await fetch("/sessions/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            throw new Error(`Server antwoordde met status ${resp.status}`);
        }

        // Sla starttijdstempel op voor persistentie bij page-refresh
        localStorage.setItem("meting_start_ts", nu.getTime());

        toonActiefScherm(nu, einde);

    } catch (err) {
        console.error("Fout bij starten meting:", err);
        errorEl.style.display = "block";
        btn.disabled = false;
        btn.textContent = "Meting starten";
    }
}

// ── Actief scherm & timer ─────────────────────────────────────────────────────

function toonActiefScherm(start, einde) {
    document.getElementById("startscherm").style.display = "none";
    document.getElementById("actiefscherm").style.display = "block";
    document.getElementById("voltooischerm").style.display = "none";

    document.getElementById("gestart-datum").textContent = formatDatum(start);
    document.getElementById("gestart-tijd").textContent  = formatTijd(start);
    document.getElementById("eind-datum").textContent    = formatDatum(einde);
    document.getElementById("eind-tijd").textContent     = formatTijd(einde);

    startTimer(start.getTime());
}

function startTimer(startTs) {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const nu       = Date.now();
        const verstreken = nu - startTs;
        const resterend  = DUUR_MS - verstreken;

        if (resterend <= 0) {
            clearInterval(timerInterval);
            localStorage.removeItem("meting_start_ts");
            toonVoltooischerm();
            return;
        }

        const pct = Math.min((verstreken / DUUR_MS) * 100, 100);
        document.getElementById("timer-display").textContent   = formatCountdown(resterend);
        document.getElementById("voortgang-balk").style.width  = pct + "%";
    }, 1000);
}

function toonVoltooischerm() {
    document.getElementById("startscherm").style.display   = "none";
    document.getElementById("actiefscherm").style.display  = "none";
    document.getElementById("voltooischerm").style.display = "block";
}

// ── Herstel na page-refresh ───────────────────────────────────────────────────

function herstelMeting() {
    const startTs = parseInt(localStorage.getItem("meting_start_ts"), 10);
    if (!startTs || isNaN(startTs)) return false;

    const start  = new Date(startTs);
    const einde  = new Date(startTs + DUUR_MS);
    const resterend = einde.getTime() - Date.now();

    if (resterend <= 0) {
        localStorage.removeItem("meting_start_ts");
        toonVoltooischerm();
        return true;
    }

    toonActiefScherm(start, einde);
    return true;
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    if (!herstelMeting()) {
        vulStartPreview();
    }
});