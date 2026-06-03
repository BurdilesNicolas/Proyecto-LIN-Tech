let posicionScroll = window.scrollY;
        const header = document.querySelector(".header");

        window.addEventListener("scroll", function () {

            let scrollActual = window.scrollY;

            if (scrollActual < posicionScroll) {
                header.classList.remove("header-oculto");
            } else {
                header.classList.add("header-oculto");
            }

            posicionScroll = scrollActual;
        });