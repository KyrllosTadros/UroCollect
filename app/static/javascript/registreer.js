/**

 * Verwerkt het registreren van een nieuwe gebruiker wanneer op de registreerknop wordt geklikt.

 *

 * @functie handleRegisterClick

 * @async

 * @beschrijving

 * Deze functionaliteit bestaat uit twee delen:

 *

 * 1. Instellen van de maximale datum voor het geboortedatum veld:

 *    - De gebruiker kan geen datum in de toekomst selecteren

 *

 * 2. Afhandelen van de registratie:

 *    - Ophalen van invoervelden (email, naam, geboortedatum, wachtwoord)

 *    - Controleren of alle velden zijn ingevuld

 *    - Valideren van:

 *        - Geboortedatum (mag niet in de toekomst liggen)

 *        - Wachtwoord (minimaal 6 tekens)

 *    - Versturen van een POST-request naar de backend (/patients/add)

 *    - Verwerken van de response:

 *        - Bij succes:

 *            - Toon bevestiging

 *            - Redirect naar loginpagina

 *        - Bij fout:

 *            - Toon foutmelding

 *    - Afhandelen van netwerkfouten

 *

 * @luistertNaar click#registerBtn

 *

 * @gooit {Error} Toont een foutmelding bij een verbindingsfout

 *

 * @voorbeeld

 * // Wordt automatisch uitgevoerd bij klikken op de registreerknop

 * document.getElementById("registerBtn").click();

 *

 * @vereist DOM elementen:

 * - #email (invoerveld voor email)

 * - #name (invoerveld voor naam)

 * - #geboortedatum (datumselector)

 * - #password (invoerveld voor wachtwoord)

 * - #error-msg (element voor foutmeldingen)

 *

 * @bijwerkingen

 * - Toont een alert bij succesvolle registratie

 * - Stuurt de gebruiker door naar "/"

 *

 * @security

 * - Basisvalidatie gebeurt aan de client-side

 * - Backend moet extra validatie en beveiliging uitvoeren (bijv. hashing wachtwoorden)

 */
document.getElementById("geboortedatum").setAttribute(
    "max",
    new Date().toISOString().split("T")[0]
);

document.getElementById("registerBtn").addEventListener("click", async () => {
    const email         = document.getElementById("email").value.trim();
    const name          = document.getElementById("name").value.trim();
    const date_of_birth = document.getElementById("geboortedatum").value;
    const password      = document.getElementById("password").value;
    const errorMsg      = document.getElementById("error-msg");
    const vandaag       = new Date().toISOString().split("T")[0];

    errorMsg.style.display = "none";

    if (!email || !name || !date_of_birth || !password) {
        errorMsg.textContent = "Vul alle velden in.";
        errorMsg.style.display = "block";
        return;
    }

    // Geboortedatum mag niet in de toekomst liggen
    if (date_of_birth > vandaag) {
        errorMsg.textContent = "Geboortedatum mag niet in de toekomst liggen.";
        errorMsg.style.display = "block";
        return;
    }

    if (password.length < 6) {
        errorMsg.textContent = "Wachtwoord moet minimaal 6 tekens bevatten.";
        errorMsg.style.display = "block";
        return;
    }

    try {
        const response = await fetch("/patients/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name, date_of_birth, password })
        });

        if (response.ok) {
            alert("Account aangemaakt! Je kunt nu inloggen.");
            window.location.href = "/";
        } else {
            const data = await response.json();
            errorMsg.textContent = data.message || "Er ging iets mis. Probeer opnieuw.";
            errorMsg.style.display = "block";
        }

    } catch (error) {
        errorMsg.textContent = "Verbindingsfout. Probeer het opnieuw.";
        errorMsg.style.display = "block";
    }
});