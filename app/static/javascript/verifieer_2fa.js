// Bevestig code
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
            // Sla patient_id op en stuur door naar dashboard
            localStorage.setItem("patient_id", data.patient_id);
            window.location.href = "/dashboard";
        } else {
            errorMsg.textContent = data.message;
            errorMsg.style.display = "block";

            // Bij verlopen of te veel pogingen: terug naar login
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


// Opnieuw versturen
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

            // Zet kleur terug na 3 seconden
            setTimeout(() => {
                errorMsg.style.color = "#ffe0e0";
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
