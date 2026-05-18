// =====================================
// Stap 1 pagina-specifieke functionaliteit
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // =====================================
        // Knoppen ophalen
        // =====================================

        const nextBtn =
            document.getElementById(
                "nextBtn"
            );

        const backBtn =
            document.getElementById(
                "backBtn"
            );

        // =====================================
        // Verder-knop
        // Navigeert naar stap 2
        // =====================================

        if (nextBtn) {

            nextBtn.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "/stap2";

                }
            );

        }

        // =====================================
        // Terug-knop
        // Gaat terug naar uitleg2
        // =====================================

        if (backBtn) {

            backBtn.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "/uitleg2";

                }
            );

        }

        // =====================================
        // Onderste navigatie blokkeren
        // Totdat stap4 is afgerond
        // =====================================

        const NAV_UNLOCK_KEY =
            "uitleg_completed";

        const isUnlocked =
            localStorage.getItem(
                NAV_UNLOCK_KEY
            ) === "true";

        const navItems =
            document.querySelectorAll(
                ".bottom-nav .nav-item"
            );

        if (!isUnlocked) {

            navItems.forEach(item => {

                item.addEventListener(
                    "click",
                    (event) => {

                        event.preventDefault();
                        event.stopPropagation();

                        alert(
                            "Voltooi eerst alle uitlegstappen."
                        );

                    }
                );

            });

        }

    }
);