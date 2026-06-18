let posicionScroll = window.scrollY;
        const header = document.querySelector(".header");
        const buscador = document.querySelector(".buscador");
        window.addEventListener("scroll", function () {

            let scrollActual = window.scrollY;

            if (scrollActual < posicionScroll) {
                header.classList.remove("header-oculto");
                buscador.classList.remove("buscador-oculto");
            } else {
                header.classList.add("header-oculto");
                buscador.classList.add("buscador-oculto");
            }

            posicionScroll = scrollActual;
        });