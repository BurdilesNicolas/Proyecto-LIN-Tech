
/* ETIQUETAS / ELEMENTOS  */
const productos = [...document.querySelectorAll(".producto")];
const btnPrev = document.querySelector(".prev");
const btnNext = document.querySelector(".next");
const indicadores = document.querySelectorAll(".slider-indicators span");
const slider =document.querySelector(".slider-productos");

/* CONFIGURACIOÓN */
let actual = 0;

let autoplay = null;

let timeoutInicio = null;

/* Esperar 2 minutos antes de volver
   a activar el autoplay */
const TIEMPO_ESPERA = 120000;

/* Cambiar producto cada 6 segundos */
const TIEMPO_SLIDE = 6000;

/* RENDER */
function render() {
    productos.forEach(producto => {
        producto.classList.remove(
            "left",
            "center",
            "right",
            "hidden"
        );
    });
    const izquierda = (actual - 1 + productos.length) % productos.length;
    const derecha = (actual + 1) % productos.length;
    productos.forEach(
        (producto, indice) => {
            if (indice === izquierda) {
                producto.classList.add(
                    "left"
                );
            }
            else if (
                indice === actual
            ) {
                producto.classList.add(
                    "center"
                );
            }
            else if (
                indice === derecha
            ) {
                producto.classList.add(
                    "right"
                );
            }
            else {
                producto.classList.add(
                    "hidden"
                );
            }
        }
    );
    indicadores.forEach(
        indicador =>
            indicador.classList.remove(
                "active"
            )
    );
    if (indicadores[actual]) {
        indicadores[actual].classList.add("active");
    }
}


/* SIGUIENTE */


function siguiente() {
    actual = (actual + 1) % productos.length;
    render();
}


/* ANTERIOR */


function anterior() {
    actual = (actual - 1 + productos.length) % productos.length;
    render();
}


/* BOTONES */

btnNext?.addEventListener(
    "click",
    () => {
        siguiente();
        reiniciarTemporizador();
    }
);

btnPrev?.addEventListener(
    "click",
    () => {
        anterior();
        reiniciarTemporizador();
    }
);


/* INDICADORES */

indicadores.forEach(
    (indicador, indice) => {
        indicador.addEventListener(
            "click",
            () => {
                actual = indice;
                render();
                reiniciarTemporizador();
            }
        );
    }
);


/* AUTOPLAY */

function iniciarAutoplay() {
    clearInterval(
        autoplay
    );
    autoplay =
        setInterval(
            siguiente,
            TIEMPO_SLIDE
        );
}

function detenerAutoplay() {
    clearInterval(
        autoplay
    );
    autoplay = null;
}

function reiniciarTemporizador() {
    detenerAutoplay();
    clearTimeout(
        timeoutInicio
    );
    timeoutInicio =
        setTimeout(
            iniciarAutoplay,
            TIEMPO_ESPERA
        );
}


/* HOVER */

slider?.addEventListener(
    "mouseenter",
    () => {
        detenerAutoplay();
        clearTimeout(
            timeoutInicio
        );
    }
);

slider?.addEventListener(
    "mouseleave",
    () => {
        reiniciarTemporizador();
    }
);

/* TOUCH (Para celular) */

let touchStartX = 0;

slider?.addEventListener(
    "touchstart", e => {
        touchStartX =
            e.touches[0].clientX;
    }
);

slider?.addEventListener( "touchend", e => {
        const touchEndX = e.changedTouches[0].clientX;
        const diferencia = touchStartX - touchEndX;
        if (
            Math.abs(diferencia) < 50
        ) return;
        if (diferencia > 0) {
            siguiente();
        } else {
            anterior();
        }
        reiniciarTemporizador();
    }
);

/* INICIO */
render();
reiniciarTemporizador();