/**

 * Verwerkt het inloggen van een gebruiker wanneer op de login knop wordt geklikt.

 *

 * @functie handleLoginClick

 * @async

 * @beschrijving

 * Deze functie wordt uitgevoerd wanneer de gebruiker op de login knop klikt.

 * De volgende stappen worden doorlopen:

 *

 * 1. Ophalen van gebruikersinvoer (email en wachtwoord) uit de DOM

 * 2. Controleren of beide velden zijn ingevuld

 * 3. Versturen van een POST-request naar de backend (/login) met de inloggegevens

 * 4. Verwerken van de server response:

 *    - Bij succes:

 *        - Opslaan van de patient_id in localStorage

 *        - Doorsturen naar de 2FA verificatiepagina

 *    - Bij fout:

 *        - Tonen van een foutmelding aan de gebruiker

 * 5. Afhandelen van netwerk- of onverwachte fouten

 *

 * @luistertNaar click#loginBtn

 *

 * @gooit {Error} Toont een foutmelding bij een verbindingsfout

 *

 * @voorbeeld

 * // Wordt automatisch uitgevoerd bij het klikken op de login knop

 * document.getElementById("loginBtn").click();

 *

 * @vereist elementen:

 * - #email (invoerveld voor email)

 * - #password (invoerveld voor wachtwoord)

 * - #error-msg (element voor foutmeldingen)

 *

 * @bijwerkingen

 * - Slaat data op in localStorage (patient_id)

 * - Stuurt de gebruiker door naar "/verifieer-2fa"

 *

 * @security

 * - Slaat geen gevoelige gegevens op behalve patient_id

 * - Gaat ervan uit dat de backend de authenticatie veilig afhandelt

 */

document.getElementById("loginBtn").addEventListener("click", async () => {
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("error-msg");

    // Verberg vorige foutmelding
    errorMsg.style.display = "none";

    // Lege velden controleren
    if (!email || !password) {
        errorMsg.textContent = "Vul alle velden in.";
        errorMsg.style.display = "block";
        return;
    }

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Sla de patient_id op voor gebruik op andere pagina's
            localStorage.setItem("patient_id", data.patient_id);

            // Stuur door naar 2fa
            window.location.href = "/verifieer-2fa";
        } else {
            errorMsg.textContent = data.message || "Inloggen mislukt.";
            errorMsg.style.display = "block";
        }

    } catch (error) {
        errorMsg.textContent = "Verbindingsfout. Probeer het opnieuw.";
        errorMsg.style.display = "block";
    }
});
