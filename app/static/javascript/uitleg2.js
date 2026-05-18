// =====================================
// Uitleg2 pagina-specifieke functionaliteit
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // "Naar stap 1" knop
        const nextBtn =
            document.getElementById(
                "nextBtn"
            );

        if(nextBtn){

            nextBtn.addEventListener(
                "click",
                () => {

                    // Ga naar stap 1 van de uitleg
                    window.location.href =
                        "/stap1";

                }
            );

        }

        // Terug-knop onderin
        const backBtn =
            document.getElementById(
                "backBtn"
            );

        if(backBtn){

            backBtn.addEventListener(
                "click",
                () => {

                    // Ga terug naar de uitleg-pagina
                    window.location.href =
                        "/uitleg";

                }
            );

        }

    }
);