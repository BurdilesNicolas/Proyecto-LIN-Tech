// Estado global: productos cargados, productos filtrados/ordenados, categoría y página actuales
let productos = [];
let productosFiltrados = [];
let categoriaActual = "todos";
let paginaActual = 1;
const productosPorPagina = 6;
 
// Referencias a los elementos del DOM usados en toda la página
const gridProductos = document.getElementById("gridProductos");
const busquedaProductos = document.getElementById("busquedaProductos");
const ordenarProductos = document.getElementById("ordenarProductos");
const paginacion = document.getElementById("paginacion");
const cantidadProductos = document.getElementById("cantidadProductos");
const sinResultados = document.getElementById("sinResultados");
 
// Trae el archivo de productos, lo convierte en objetos y aplica los filtros iniciales
async function cargarProductos() {
    try {
        const respuesta = await fetch("tx/productos.txt");
        if (!respuesta.ok) {
            throw new Error("No se pudo cargar productos.txt");
        }
        const texto = await respuesta.text();
        convertirProductos(texto);
        aplicarFiltros();
    } catch (error) {
        console.error("Error al cargar productos:", error);
        gridProductos.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    No se pudieron cargar los productos.
                </div>
            </div>
        `;
    }
}
 
// Convierte el texto plano (separado por | y saltos de línea) en un array de objetos producto
function convertirProductos(texto) {
    const lineas = texto.trim().split("\n");
    lineas.shift(); // la primera línea es el encabezado con los nombres de las columnas
 
    productos = lineas.map(linea => {
        const datos = linea.split("|");
        return {
            id: datos[0],
            nombre: datos[1],
            categoria: datos[2],
            descripcion: datos[3],
            precio: Number(datos[4]),
            imagen: datos[5],
            destacado: datos[6] === "true"
        };
    });
}
 
// Filtra los productos por categoría y texto de búsqueda, y actualiza la vista
function aplicarFiltros() {
    const textoBusqueda = busquedaProductos.value.toLowerCase().trim();
 
    productosFiltrados = productos.filter(producto => {
        const coincideCategoria =
            categoriaActual === "todos" ||
            producto.categoria === categoriaActual;
 
        const coincideBusqueda =
            producto.nombre.toLowerCase().includes(textoBusqueda) ||
            producto.descripcion.toLowerCase().includes(textoBusqueda);
 
        return coincideCategoria && coincideBusqueda;
    });
 
    ordenarProductosLista();
    paginaActual = 1;
    mostrarProductos();
}
 
// Ordena productosFiltrados según la opción elegida en el select
function ordenarProductosLista() {
    const orden = ordenarProductos.value;
 
    if (orden === "precio-menor") {
        productosFiltrados.sort((a, b) => a.precio - b.precio);
    } else if (orden === "precio-mayor") {
        productosFiltrados.sort((a, b) => b.precio - a.precio);
    } else if (orden === "nombre") {
        productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (orden === "destacados") {
        productosFiltrados.sort((a, b) => Number(b.destacado) - Number(a.destacado));
    }
}
 
// Pinta en el grid la página actual de productos y regenera la paginación
function mostrarProductos() {
    gridProductos.innerHTML = "";
 
    if (productosFiltrados.length === 0) {
        sinResultados.classList.remove("d-none");
        cantidadProductos.textContent = "0 productos";
        paginacion.innerHTML = "";
        return;
    }
 
    sinResultados.classList.add("d-none");
 
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productosFiltrados.slice(inicio, fin);
 
    productosPagina.forEach(producto => {
        gridProductos.innerHTML += crearTarjeta(producto);
    });
 
    cantidadProductos.textContent = `${productosFiltrados.length} productos`;
    crearPaginacion();
}
 
// Devuelve el HTML de una tarjeta de producto
function crearTarjeta(producto) {
    const precio = producto.precio.toLocaleString("es-AR");
 
    return `
        <article class="col-12 col-sm-6 col-xl-4">
            <div class="producto-card h-100">
                <a href="producto.html?id=${producto.id}" class="producto-link">
                    <div class="producto-imagen">
                        <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
                    </div>
                    <div class="producto-info">
                        ${
                            producto.destacado
                                ? `<span class="producto-destacado">Destacado</span>`
                                : ""
                        }
                        <h3>${producto.nombre}</h3>
                        <p>${producto.descripcion}</p>
                        <span class="precio">$${precio}</span>
                        <span class="btn-producto">Ver producto</span>
                    </div>
                </a>
            </div>
        </article>
    `;
}
 
// Genera los botones de paginación (anterior, números, siguiente)
function crearPaginacion() {
    paginacion.innerHTML = "";
 
    const cantidadPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    if (cantidadPaginas <= 1) {
        return;
    }
 
    paginacion.innerHTML += `
        <li class="page-item ${paginaActual === 1 ? "disabled" : ""}">
            <button class="page-link" onclick="cambiarPagina(${paginaActual - 1})">
                <i class="bi bi-chevron-left"></i>
            </button>
        </li>
    `;
 
    for (let i = 1; i <= cantidadPaginas; i++) {
        paginacion.innerHTML += `
            <li class="page-item ${i === paginaActual ? "active" : ""}">
                <button class="page-link" onclick="cambiarPagina(${i})">
                    ${i}
                </button>
            </li>
        `;
    }
 
    paginacion.innerHTML += `
        <li class="page-item ${paginaActual === cantidadPaginas ? "disabled" : ""}">
            <button class="page-link" onclick="cambiarPagina(${paginaActual + 1})">
                <i class="bi bi-chevron-right"></i>
            </button>
        </li>
    `;
}
 
// Cambia de página (validando el rango) y hace scroll hacia arriba
function cambiarPagina(pagina) {
    const cantidadPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    if (pagina < 1 || pagina > cantidadPaginas) {
        return;
    }
 
    paginaActual = pagina;
    mostrarProductos();
    window.scrollTo({ top: 0, behavior: "smooth" });
}
 
// Al hacer clic en una categoría, la marca como activa y vuelve a filtrar
document.querySelectorAll(".categoria-btn").forEach(boton => {
    boton.addEventListener("click", () => {
        document.querySelectorAll(".categoria-btn").forEach(btn => {
            btn.classList.remove("active");
        });
        boton.classList.add("active");
        categoriaActual = boton.dataset.categoria;
        aplicarFiltros();
    });
});
 
// El buscador y el select de orden también disparan el filtrado
busquedaProductos.addEventListener("input", aplicarFiltros);
ordenarProductos.addEventListener("change", aplicarFiltros);
 
cargarProductos();