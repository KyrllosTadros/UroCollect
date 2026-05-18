// =====================================
// Stap 4 functionaliteit
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const nextBtn =
            document.getElementById(
                "nextBtn"
            );

        const backBtn =
            document.getElementById(
                "backBtn"
            );

        // Verder
        if (nextBtn) {

            nextBtn.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "/meting";

                }
            );

        }

        // Terug
        if (backBtn) {

            backBtn.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "/stap3";

                }
            );

        }

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