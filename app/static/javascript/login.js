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
