/**
 * homepagina.js
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
     const navKoppeling = [
        { pad: "uitleg", index: 0 },
        { pad: "meting", index: 1 },
        { pad: "home", index: 2 },
        { pad: "herinnering", index: 3 },
        { pad: "help", index: 4 },
    ];

    const navItems = document.querySelectorAll(".nav-item");

    navKoppeling.forEach(({ pad, index }) => {
        if (huidigePad === pad) {
            navItems[index].classList.add("nav-active");
        }
    });
});