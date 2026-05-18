/**
 * account.js
 *
 * Haalt accountgegevens op, verwerkt wachtwoordwijziging
 * en het verwijderen van het account.
 */

document.addEventListener("DOMContentLoaded", () => {
    laadAccountGegevens();

    document.getElementById("changePasswordBtn")
        .addEventListener("click", handleChangePassword);

    document.getElementById("logoutBtn")
        .addEventListener("click", handleLogout);

    document.getElementById("deleteAccountBtn")
        .addEventListener("click", handleDeleteAccount);
});

async function laadAccountGegevens() {
    const errorMsg = document.getElementById("account-error-msg");
    const successMsg = document.getElementById("account-success-msg");

    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    try {
        const response = await fetch("/account/data");

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            errorMsg.textContent = data.message || "Kon accountgegevens niet laden.";
            errorMsg.style.display = "block";
            return;
        }

        const data = await response.json();
        const patient = data.patient;

        document.getElementById("account-name").textContent  = patient.name || "-";
        document.getElementById("account-email").textContent = patient.email || "-";
        document.getElementById("account-dob").textContent   = patient.date_of_birth || "-";

    } catch (err) {
        errorMsg.textContent = "Verbindingsfout bij het ophalen van accountgegevens.";
        errorMsg.style.display = "block";
    }
}

async function handleChangePassword() {
    const newPassword = document.getElementById("new-password").value.trim();
    const errorMsg = document.getElementById("account-error-msg");
    const successMsg = document.getElementById("account-success-msg");

    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    if (newPassword.length < 6) {
        errorMsg.textContent = "Wachtwoord moet minimaal 6 tekens bevatten.";
        errorMsg.style.display = "block";
        return;
    }

    try {
        const response = await fetch("/account/change-password", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ new_password: newPassword })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
            errorMsg.textContent = data.message || "Wachtwoord kon niet worden gewijzigd.";
            errorMsg.style.display = "block";
            return;
        }

        successMsg.textContent = data.message || "Wachtwoord is gewijzigd.";
        successMsg.style.display = "block";
        document.getElementById("new-password").value = "";

    } catch (err) {
        errorMsg.textContent = "Verbindingsfout bij het wijzigen van het wachtwoord.";
        errorMsg.style.display = "block";
    }
}

async function handleDeleteAccount() {
    const errorMsg = document.getElementById("account-error-msg");
    const successMsg = document.getElementById("account-success-msg");

    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    const bevestiging = confirm(
        "Weet je zeker dat je je account definitief wilt verwijderen? " +
        "Dit kan niet ongedaan worden gemaakt."
    );

    if (!bevestiging) {
        return;
    }

    try {
        const response = await fetch("/account/delete", {
            method: "DELETE"
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
            errorMsg.textContent = data.message || "Account kon niet worden verwijderd.";
            errorMsg.style.display = "block";
            return;
        }

        alert("Je account is verwijderd. Je wordt teruggestuurd naar de inlogpagina.");
        window.location.href = "/";

    } catch (err) {
        errorMsg.textContent = "Verbindingsfout bij het verwijderen van het account.";
        errorMsg.style.display = "block";
    }
}

// =====================================
// Uitloggen
// =====================================

async function handleLogout() {

    const bevestiging = confirm(
        "Weet je zeker dat je wilt uitloggen?"
    );

    if (!bevestiging) {
        return;
    }

    try {

        const response =
            await fetch(
                "/auth/logout",
                {
                    method: "POST"
                }
            );

        if (!response.ok) {

            alert(
                "Uitloggen mislukt."
            );

            return;
        }

        // Naar inlogpagina
        window.location.href = "/";

    } catch (err) {

        alert(
            "Verbindingsfout bij uitloggen."
        );

    }

}
