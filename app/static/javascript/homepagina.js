/**
 * home.js
 *
 * Markeert het actieve navigatie-item op basis van de huidige pagina.
 * Alle navigatie zelf wordt via inline onclick-attributen in de HTML afgehandeld.
 *
 * @beschrijving
 * 1. Lees de huidige bestandsnaam uit window.location.pathname
 * 2. Vergelijk deze met de bekende routes per nav-item
 * 3. Voeg de klasse "nav-active" toe aan het overeenkomende item
 *
 * @bijwerkingen
 * - Voegt CSS-klasse "nav-active" toe aan één nav-item
 */
document.addEventListener("DOMContentLoaded", () => {
    // Haal de huidige paginanaam op (bijv. "homepagina.html")
    const huidigePad = window.location.pathname.split("/").pop();
    // Koppeling tussen bestandsnamen en nav-items (op volgorde in de HTML)
    const navKoppeling = [
        { bestand: "uitleg.html",       index: 0 },
        { bestand: "meting.html",       index: 1 },
        { bestand: "homepagina.html",   index: 2 },
        { bestand: "herinnering.html",  index: 3 },
        { bestand: "helppagina.html",   index: 4 },
    ];
    const navItems = document.querySelectorAll(".nav-item");
    navKoppeling.forEach(({ bestand, index }) => {
        if (huidigePad === bestand) {
            navItems[index].classList.add("nav-active");
        }
    });
});