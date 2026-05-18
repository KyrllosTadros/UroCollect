/**
 * uitleg.js
 *
 * - Blokkeert de bottom-nav de eerste keer dat de uitleg wordt bekeken
 * - Laat de gebruiker pas door nadat op de oranje knop in stap 4 is geklikt
 * - Daarna worden de icoontjes onderin weer klikbaar
 */
 
document.addEventListener("DOMContentLoaded", () => {
    const START_KEY = "uitleg_completed";
    const startBtn = document.getElementById("startUitlegBtn");
    const navItems = document.querySelectorAll(".bottom-nav .nav-item");
    const metingKnop = document.getElementById("metingKnop");
 
    const isCompleted = localStorage.getItem(START_KEY) === "true";
 
    // Navigatie blokkeren
    navItems.forEach(item => {
        const target = item.getAttribute("data-nav-target");
        if (!target) return;
 
        item.addEventListener("click", (e) => {
            if (!isCompleted) {
                e.preventDefault();
                e.stopPropagation();
                alert("Voltooi eerst alle uitlegstappen.");
                return;
            }
            window.location.href = target;
        });
    });
 
    // Alleen door naar stap 2
    if (startBtn) {
        startBtn.addEventListener("click", () => {
            window.location.href = "/uitleg2"; // Ga naar stap 2
        });
    }
 
    // Maak de icoontjes klikbaar na het klikken op de metingknop in stap 4
    if (metingKnop) {
        metingKnop.addEventListener("click", () => {
            localStorage.setItem(START_KEY, "true"); // Markeer als voltooid
            alert("Je kunt nu de navigatie-icoontjes gebruiken!");
            // Hier kun je eventueel ook een redirect naar de gewenste pagina toevoegen
        });
    }
});