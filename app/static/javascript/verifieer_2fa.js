/**

 * Verwerkt de verificatie van de 2FA-code en het opnieuw versturen van een code.

 *

 * @beschrijving

 * Deze functionaliteit bestaat uit twee onderdelen:

 *

 * 1. Verifiëren van de ingevoerde 2FA-code:

 *    - Controleert of de code bestaat en exact 6 cijfers bevat

 *    - Stuurt een POST-request naar de backend (/auth/verifieer-2fa)

 *    - Verwerkt de response:

 *        - Bij succes:

 *            - Slaat de patient_id op in localStorage

 *            - Stuurt de gebruiker door naar het dashboard

 *        - Bij fout:

 *            - Toont foutmelding

 *            - Stuurt gebruiker terug naar login bij verlopen code of te veel pogingen

 *

 * 2. Opnieuw versturen van de 2FA-code:

 *    - Stuurt een POST-request naar (/auth/resend-2fa)

 *    - Toont bevestiging bij succes

 *    - Toont foutmelding bij mislukking

 *

 * @luistertNaar

 * - click#verifyBtn (voor verificatie van de code)

 * - click#resendBtn (voor opnieuw versturen van de code)

 *

 * @gooit {Error} Toont een foutmelding bij verbindingsproblemen

 *

 * @vereist DOM elementen:

 * - #code (invoerveld voor 2FA-code)

 * - #verifyBtn (knop voor verificatie)

 * - #resendBtn (knop voor opnieuw versturen)

 * - #error-msg (element voor meldingen)

 *

 * @bijwerkingen

 * - Past de DOM aan (meldingen tonen/verbergen en kleur aanpassen)

 * - Slaat data op in localStorage (patient_id)

 * - Stuurt gebruiker door naar "/dashboard" of "/"

 *

 * @security

 * - Controleert formaat van de 2FA-code (6 cijfers)

 * - Backend moet validatie, expiratie en rate limiting afdwingen

 */
document.getElementById("verifyBtn").addEventListener("click", async () => {
    const code     = document.getElementById("code").value.trim();
    const errorMsg = document.getElementById("error-msg");

    errorMsg.style.display = "none";

    if (!code || code.length !== 6) {
        errorMsg.textContent = "Voer een geldige 6-cijferige code in.";
        errorMsg.style.display = "block";
        return;
    }

    try {
        const response = await fetch("/auth/verifieer-2fa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem("patient_id", data.patient_id);
            window.location.href = "/homepagina";
        } else {
            errorMsg.textContent = data.message;
            errorMsg.style.display = "block";

            if (
                data.message.includes("Log opnieuw in") ||
                data.message.includes("verlopen")
            ) {
                setTimeout(() => { window.location.href = "/"; }, 2500);
            }
        }

    } catch (error) {
        errorMsg.textContent = "Verbindingsfout. Probeer het opnieuw.";
        errorMsg.style.display = "block";
    }
});


document.getElementById("resendBtn").addEventListener("click", async () => {
    const errorMsg = document.getElementById("error-msg");

    errorMsg.style.display = "none";

    try {
        const response = await fetch("/auth/resend-2fa", {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        if (data.success) {
            errorMsg.style.color = "#d4edda";
            errorMsg.textContent = "Nieuwe code verstuurd naar uw e-mailadres.";
            errorMsg.style.display = "block";

            setTimeout(() => {
                errorMsg.style.color = "#760404";
                errorMsg.style.display = "none";
            }, 3000);
        } else {
            errorMsg.textContent = data.message;
            errorMsg.style.display = "block";
        }

    } catch (error) {
        errorMsg.textContent = "Verbindingsfout. Probeer het opnieuw.";
        errorMsg.style.display = "block";
    }
});
