document.addEventListener(
    "DOMContentLoaded",
    () => {

        const nextBtn =
            document.getElementById(
                "nextBtn"
            );

        if(nextBtn){

            nextBtn.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "/stap1";

                }
            );

        }

    }
);