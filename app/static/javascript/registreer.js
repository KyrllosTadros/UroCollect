document.getElementById("geboortedatum").setAttribute(
    "max",
    new Date().toISOString().split("T")[0]
);

document.getElementById("registerBtn").addEventListener("click", async () => {
    const email         = document.getElementById("email").value.trim();
    const name          = document.getElementById("name").value.trim();
    const date_of_birth = document.getElementById("geboortedatum").value;  // ← deze regel miste
    const password      = document.getElementById("password").value;
    const errorMsg      = document.getElementById("error-msg");
    const vandaag       = new Date().toISOString().split("T")[0];

    // Verberg vorige foutmelding
    errorMsg.style.display = "none";

    // Lege velden controleren
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

    // Wachtwoord minimale lengte
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