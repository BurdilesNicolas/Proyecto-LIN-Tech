// ===================================
// ELEMENTOS
// ===================================

const productos = Array.from(
    document.querySelectorAll(".producto-card")
);

const buscador =
    document.querySelector(".busqueda-productos");

const ordenar =
    document.querySelector(".ordenar-productos");

const categorias =
    document.querySelectorAll(".categoria-btn");

const paginacion =
    document.querySelector(".paginacion");


// ===================================
// CONFIGURACIÓN
// ===================================

const productosPorPagina = 6;

let paginaActual = 1;

let categoriaActual = "todos";

let textoBusqueda = "";

let productosFiltrados = [...productos];


// ===================================
// FILTRAR PRODUCTOS
// ===================================

function filtrarProductos() {

    productosFiltrados = productos.filter(producto => {

        const nombre = producto
            .querySelector("h3")
            .textContent
            .toLowerCase();

        const categoria =
            producto.dataset.categoria;

        const coincideNombre =
            nombre.includes(
                textoBusqueda.toLowerCase()
            );

        const coincideCategoria =
            categoriaActual === "todos" ||
            categoria === categoriaActual;

        return (
            coincideNombre &&
            coincideCategoria
        );

    });

    ordenarProductos();

}


// ===================================
// ORDENAR PRODUCTOS
// ===================================

function ordenarProductos() {

    const criterio = ordenar.value;

    if (criterio === "nombre") {

        productosFiltrados.sort((a, b) => {

            const nombreA =
                a.querySelector("h3").textContent;

            const nombreB =
                b.querySelector("h3").textContent;

            return nombreA.localeCompare(nombreB);

        });

    }

    if (criterio === "precio-menor") {

        productosFiltrados.sort((a, b) => {

            return (
                Number(a.dataset.precio) -
                Number(b.dataset.precio)
            );

        });

    }

    if (criterio === "precio-mayor") {

        productosFiltrados.sort((a, b) => {

            return (
                Number(b.dataset.precio) -
                Number(a.dataset.precio)
            );

        });

    }

    crearPaginacion();

    mostrarPagina(1);

}


// ===================================
// MOSTRAR PÁGINA
// ===================================

function mostrarPagina(numeroPagina) {

    paginaActual = numeroPagina;

    productos.forEach(producto => {

        producto.style.display = "none";

    });

    const inicio =
        (paginaActual - 1) *
        productosPorPagina;

    const fin =
        inicio +
        productosPorPagina;

    productosFiltrados
        .slice(inicio, fin)
        .forEach(producto => {

            producto.style.display = "flex";

        });

    actualizarBotones();

    document
        .querySelector(".contenedor-productos")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


// ===================================
// CREAR PAGINACIÓN
// ===================================

function crearPaginacion() {

    const totalPaginas =
        Math.ceil(
            productosFiltrados.length /
            productosPorPagina
        );

    paginacion.innerHTML = "";

    // BOTÓN ANTERIOR

    const btnAnterior =
        document.createElement("button");

    btnAnterior.textContent = "←";

    btnAnterior.classList.add(
        "pagina-btn"
    );

    btnAnterior.addEventListener(
        "click",
        () => {

            if (paginaActual > 1) {

                mostrarPagina(
                    paginaActual - 1
                );

            }

        }
    );

    paginacion.appendChild(
        btnAnterior
    );

    // NÚMEROS

    for (
        let i = 1;
        i <= totalPaginas;
        i++
    ) {

        const boton =
            document.createElement("button");

        boton.textContent = i;

        boton.classList.add(
            "pagina-btn"
        );

        if (i === paginaActual) {

            boton.classList.add(
                "active"
            );

        }

        boton.addEventListener(
            "click",
            () => {

                mostrarPagina(i);

            }
        );

        paginacion.appendChild(
            boton
        );

    }

    // BOTÓN SIGUIENTE

    const btnSiguiente =
        document.createElement("button");

    btnSiguiente.textContent = "→";

    btnSiguiente.classList.add(
        "pagina-btn"
    );

    btnSiguiente.addEventListener(
        "click",
        () => {

            const totalPaginas =
                Math.ceil(
                    productosFiltrados.length /
                    productosPorPagina
                );

            if (
                paginaActual <
                totalPaginas
            ) {

                mostrarPagina(
                    paginaActual + 1
                );

            }

        }
    );

    paginacion.appendChild(
        btnSiguiente
    );

}


// ===================================
// ACTUALIZAR BOTONES
// ===================================

function actualizarBotones() {

    document
        .querySelectorAll(".pagina-btn")
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

            if (
                btn.textContent ==
                paginaActual
            ) {

                btn.classList.add(
                    "active"
                );

            }

        });

}


// ===================================
// BUSCADOR
// ===================================

buscador.addEventListener(
    "input",
    () => {

        textoBusqueda =
            buscador.value;

        filtrarProductos();

    }
);


// ===================================
// ORDENAR
// ===================================

ordenar.addEventListener(
    "change",
    () => {

        ordenarProductos();

    }
);


// ===================================
// CATEGORÍAS
// ===================================

categorias.forEach(boton => {

    boton.addEventListener(
        "click",
        () => {

            categorias.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });

            boton.classList.add(
                "active"
            );

            categoriaActual =
                boton.dataset.categoria;

            filtrarProductos();

        }
    );

});


// ===================================
// INICIALIZAR
// ===================================

filtrarProductos();