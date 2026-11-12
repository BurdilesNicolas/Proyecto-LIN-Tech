// Muestra el detalle de un producto. Requiere api.js y comun.js cargados antes.
const detalleProducto = document.getElementById("detalleProducto");

// Muestra un mensaje de error o de producto inexistente en lugar del detalle
function mostrarErrorDetalle(mensaje) {
    detalleProducto.innerHTML = `
        <div class="detalle-estado">
            <i class="bi bi-exclamation-circle"></i>
            <h1>${escaparHtml(mensaje)}</h1>
            <a href="productos.html" class="btn-volver">Ver todos los productos</a>
        </div>
    `;
}

// Devuelve el HTML del detalle de un producto
function crearDetalle(producto) {
    const precio = producto.precio.toLocaleString("es-AR");
    const hayStock = producto.stock > 0;
    return `
        <div class="row g-5 align-items-start">
            <div class="col-12 col-lg-6">
                <div class="detalle-imagen">
                    <img src="${escaparHtml(producto.imagen) || IMAGEN_POR_DEFECTO}" alt="${escaparHtml(producto.nombre)}">
                </div>
            </div>
            <div class="col-12 col-lg-6">
                <div class="detalle-info">
                    <span class="detalle-categoria">${escaparHtml(CATEGORIAS[producto.categoria] || producto.categoria)}</span>
                    ${producto.destacado ? `<span class="producto-destacado">Destacado</span>` : ""}
                    <h1>${escaparHtml(producto.nombre)}</h1>
                    <span class="detalle-precio">$${precio}</span>
                    <span class="detalle-stock ${hayStock ? "con-stock" : "sin-stock"}">
                        <i class="bi ${hayStock ? "bi-check-circle-fill" : "bi-x-circle-fill"}"></i>
                        ${hayStock ? `En stock · ${producto.stock} ${producto.stock === 1 ? "unidad" : "unidades"}` : "Sin stock"}
                    </span>
                    <p class="detalle-descripcion">${escaparHtml(producto.descripcion)}</p>
                    <a href="productos.html" class="btn-volver">
                        <i class="bi bi-arrow-left"></i>
                        Seguir viendo productos
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Lee el id de la URL (producto.html?id=3), pide el producto al servidor y lo muestra
async function cargarDetalle() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!/^\d+$/.test(id || "")) {
        mostrarErrorDetalle("El producto no existe.");
        return;
    }
    try {
        const producto = await Api.obtenerProducto(id);
        document.title = `LIN-Tech | ${producto.nombre}`;
        detalleProducto.innerHTML = crearDetalle(producto);
    } catch (error) {
        mostrarErrorDetalle(error.message);
    }
}

// Si la imagen no carga, se reemplaza por la imagen por defecto
detalleProducto.addEventListener("error", evento => {
    if (evento.target.tagName === "IMG" && evento.target.src !== IMAGEN_POR_DEFECTO) {
        evento.target.src = IMAGEN_POR_DEFECTO;
    }
}, true);

cargarDetalle();
