/**
 * formulier.js — logica voor de meetformulier pagina
 *
 * Taken:
 *  1. Laadt patiëntgegevens en de meest recente sessie uit de database.
 *  2. Vult alle bekende velden automatisch in.
 *  3. Detecteert wijzigingen en toont een waarschuwingsbanner.
 *  4. Berekent het totaal automatisch (bokaal 1 + bokaal 2).
 *  5. Slaat gewijzigde meetvelden op via PUT /sessions/update/<session_id>.
 */

let huidigeSessieId = null;
let origineelIngevuld = {}; // bijhouden wat de DB-waarden waren

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Formatteert 'JJJJ-MM-DD' als 'DD-MM-JJJJ' voor weergave */
function formatDatumWeergave(dbDatum) {
    if (!dbDatum) return "";
    const [y, m, d] = dbDatum.split("-");
    return `${d}-${m}-${y}`;
}

/** Haalt 'HH:MM' uit een tijdstring (bijv. '08:30:00+00' → '08:30') */
function formatTijdWeergave(dbTijd) {
    if (!dbTijd) return "";
    return dbTijd.substring(0, 5);
}

// ── Data laden ────────────────────────────────────────────────────────────────

async function laadFormulierData() {
    try {
        const resp = await fetch("/formulier/data");
        if (!resp.ok) throw new Error("Niet ingelogd of serverfout.");
        const data = await resp.json();

        if (data.patient) {
            vulPatientVelden(data.patient);
        }

        if (data.session) {
            huidigeSessieId = data.session.session_id;
            vulSessieVelden(data.session);
            slaOrigineelOp(data.session);
        }

    } catch (err) {
        console.error("Fout bij laden formulierdata:", err);
    }
}

function vulPatientVelden(patient) {
    document.getElementById("naam").value =
        patient.name || "";
    document.getElementById("geboortedatum").value =
        formatDatumWeergave(patient.date_of_birth);
}

function vulSessieVelden(sess) {
    zet("startdatum",  sess.startdate  || "");
    zet("starttijd",   formatTijdWeergave(sess.starttime));
    zet("einddatum",   sess.enddate    || "");
    zet("eindtijd",    formatTijdWeergave(sess.endtime));
    zet("bokaal1",     sess.bottle1_ml != null ? sess.bottle1_ml : "");
    zet("bokaal2",     sess.bottle2_ml != null ? sess.bottle2_ml : "");
    bereken_totaal();
}

function zet(id, waarde) {
    const el = document.getElementById(id);
    if (el) el.value = waarde;
}

function slaOrigineelOp(sess) {
    origineelIngevuld = {
        startdatum: sess.startdate  || "",
        starttijd:  formatTijdWeergave(sess.starttime),
        einddatum:  sess.enddate    || "",
        eindtijd:   formatTijdWeergave(sess.endtime),
        bokaal1:    sess.bottle1_ml != null ? String(sess.bottle1_ml) : "",
        bokaal2:    sess.bottle2_ml != null ? String(sess.bottle2_ml) : ""
    };
}

// ── Wijziging detectie ────────────────────────────────────────────────────────

const meetvelden = ["startdatum", "starttijd", "einddatum", "eindtijd", "bokaal1", "bokaal2"];

function controleerWijziging(veldId) {
    const el = document.getElementById(veldId);
    const origineelWaarde = origineelIngevuld[veldId];

    // Alleen markeren als er originele DB-data is
    if (origineelWaarde !== undefined && el.value !== String(origineelWaarde)) {
        el.classList.add("gewijzigd");
    } else {
        el.classList.remove("gewijzigd");
    }

    // Waarschuwingsbanner tonen als er minstens één gewijzigd veld is
    const erIsWijziging = meetvelden.some(id => {
        const veld = document.getElementById(id);
        return veld && veld.classList.contains("gewijzigd");
    });

    document.getElementById("wijziging-banner").style.display =
        erIsWijziging ? "flex" : "none";
}

function koppelWijzigingListeners() {
    meetvelden.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", () => {
                controleerWijziging(id);
                if (id === "bokaal1" || id === "bokaal2") {
                    bereken_totaal();
                }
            });
            el.addEventListener("change", () => controleerWijziging(id));
        }
    });
}

// ── Totaal berekenen ──────────────────────────────────────────────────────────

function bereken_totaal() {
    const b1 = parseFloat(document.getElementById("bokaal1").value) || 0;
    const b2 = parseFloat(document.getElementById("bokaal2").value) || 0;
    document.getElementById("totaal").value = b1 + b2 || "";
}

// ── Opslaan ───────────────────────────────────────────────────────────────────

async function opslaan() {
    const foutEl   = document.getElementById("fout-msg");
    const succesEl = document.getElementById("succes-msg");
    const btn      = document.getElementById("opslaan-btn");

    foutEl.style.display   = "none";
    succesEl.style.display = "none";

    if (!huidigeSessieId) {
        foutEl.textContent = "Geen actieve sessie gevonden. Start eerst een meting.";
        foutEl.style.display = "block";
        return;
    }

    btn.disabled    = true;
    btn.textContent = "Opslaan…";

    const bokaal1 = parseFloat(document.getElementById("bokaal1").value);
    const bokaal2 = document.getElementById("bokaal2").value !== ""
        ? parseFloat(document.getElementById("bokaal2").value)
        : null;
    const totaal  = parseFloat(document.getElementById("totaal").value) || 0;

    // Bouw payload op — alleen velden die ingevuld zijn
    const payload = {};

    const startdatum = document.getElementById("startdatum").value;
    const starttijd  = document.getElementById("starttijd").value;
    const einddatum  = document.getElementById("einddatum").value;
    const eindtijd   = document.getElementById("eindtijd").value;

    if (startdatum) payload.startdate  = startdatum;
    if (starttijd)  payload.starttime  = starttijd + ":00";
    if (einddatum)  payload.enddate    = einddatum;
    if (eindtijd)   payload.endtime    = eindtijd  + ":00";
    if (!isNaN(bokaal1)) payload.bottle1_ml = bokaal1;
    if (bokaal2 !== null && !isNaN(bokaal2)) payload.bottle2_ml = bokaal2;
    if (totaal)     payload.total_ml   = totaal;

    try {
        const resp = await fetch(`/sessions/update/${huidigeSessieId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) throw new Error(`Serverfout ${resp.status}`);

        // Reset wijzigingsmarkeringen
        meetvelden.forEach(id => {
            document.getElementById(id)?.classList.remove("gewijzigd");
        });
        document.getElementById("wijziging-banner").style.display = "none";
        slaOrigineelOp({
            startdate:  startdatum,
            starttime:  starttijd + ":00",
            enddate:    einddatum,
            endtime:    eindtijd  + ":00",
            bottle1_ml: bokaal1,
            bottle2_ml: bokaal2,
        });

        succesEl.style.display = "block";
        setTimeout(() => { succesEl.style.display = "none"; }, 4000);

    } catch (err) {
        console.error("Fout bij opslaan:", err);
        foutEl.textContent   = "Er is een fout opgetreden. Probeer het opnieuw.";
        foutEl.style.display = "block";
    } finally {
        btn.disabled    = false;
        btn.textContent = "Opslaan";
    }
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    koppelWijzigingListeners();
    laadFormulierData();
});