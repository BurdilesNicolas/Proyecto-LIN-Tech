// Requiere comun.js (CATEGORIAS, IMAGEN_POR_DEFECTO, escaparHtml) y api.js cargados antes.

// Estado global: productos cargados, productos filtrados/ordenados, categoría y página actuales
let productos = [];
let productosFiltrados = [];
let categoriaActual = "todos";
let paginaActual = 1;
const productosPorPagina = 6;

// Sesión activa (null si nadie inició sesión). Define si se muestran las acciones de crear/editar/eliminar.
const sesion = Api.obtenerSesion();

// Referencias a los elementos del DOM usados en toda la página
const gridProductos = document.getElementById("gridProductos");
const busquedaProductos = document.getElementById("busquedaProductos");
const ordenarProductos = document.getElementById("ordenarProductos");
const paginacion = document.getElementById("paginacion");
const cantidadProductos = document.getElementById("cantidadProductos");
const sinResultados = document.getElementById("sinResultados");

// Elementos del CRUD
const btnNuevoProducto = document.getElementById("btnNuevoProducto");
const avisoSesion = document.getElementById("avisoSesion");
const formProducto = document.getElementById("formProducto");
const modalProductoTitulo = document.getElementById("modalProductoTitulo");
const btnGuardarProducto = document.getElementById("btnGuardarProducto");
const campoImagen = document.getElementById("productoImagen");
const previewImagen = document.getElementById("previewImagen");
const nombreEliminar = document.getElementById("nombreEliminar");
const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");
const notificacion = document.getElementById("notificacion");
const notificacionTexto = document.getElementById("notificacionTexto");

// Modales de Bootstrap y producto pendiente de eliminar
const modalProducto = new bootstrap.Modal(document.getElementById("modalProducto"));
const modalEliminar = new bootstrap.Modal(document.getElementById("modalEliminar"));
let idAEliminar = null;
let temporizadorNotificacion = null;

// Muestra un aviso temporal; con esError=true se muestra en rojo
function notificar(mensaje, esError = false) {
    clearTimeout(temporizadorNotificacion);
    notificacionTexto.textContent = mensaje;
    notificacion.classList.toggle("error", esError);
    notificacion.querySelector("i").className = esError
        ? "bi bi-exclamation-circle-fill"
        : "bi bi-check-circle-fill";
    notificacion.classList.add("mostrar");
    temporizadorNotificacion = setTimeout(() => {
        notificacion.classList.remove("mostrar");
    }, 3000);
}

// Muestra el error de una acción; si la sesión venció, recarga la página para quitar las acciones de edición
function manejarError(error) {
    notificar(error.message, true);
    if (error.status === 401) {
        setTimeout(() => window.location.reload(), 1800);
    }
}

// READ: trae los productos desde la capa de datos y aplica los filtros iniciales
async function cargarProductos() {
    try {
        productos = await Api.listarProductos();
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

// Filtra los productos por categoría y texto de búsqueda, y actualiza la vista.
// Con mantenerPagina=true (tras crear/editar/eliminar) no vuelve a la primera página.
function aplicarFiltros(mantenerPagina = false) {
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
    if (!mantenerPagina) {
        paginaActual = 1;
    }
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

    // Si la página actual quedó vacía (por ejemplo al eliminar el último de la página), retrocede
    const cantidadPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    if (paginaActual > cantidadPaginas) {
        paginaActual = cantidadPaginas;
    }

    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productosFiltrados.slice(inicio, fin);
    gridProductos.innerHTML = productosPagina.map(crearTarjeta).join("");

    cantidadProductos.textContent = `${productosFiltrados.length} productos`;
    crearPaginacion();
}

// Devuelve el HTML de una tarjeta de producto (con botones de editar/eliminar si hay sesión)
function crearTarjeta(producto) {
    const precio = producto.precio.toLocaleString("es-AR");
    const acciones = sesion ? `
        <div class="producto-acciones">
            <button type="button" class="btn-accion btn-editar" data-accion="editar" data-id="${producto.id}">
                <i class="bi bi-pencil-square"></i> Editar
            </button>
            <button type="button" class="btn-accion btn-eliminar" data-accion="eliminar" data-id="${producto.id}">
                <i class="bi bi-trash3"></i> Eliminar
            </button>
        </div>
    ` : "";
    return `
        <article class="col-12 col-sm-6 col-xl-4">
            <div class="producto-card h-100">
                <a href="producto.html?id=${producto.id}" class="producto-link">
                    <div class="producto-imagen">
                        <img src="${escaparHtml(producto.imagen) || IMAGEN_POR_DEFECTO}" alt="${escaparHtml(producto.nombre)}" loading="lazy">
                    </div>
                    <div class="producto-info">
                        ${
                            producto.destacado
                                ? `<span class="producto-destacado">Destacado</span>`
                                : ""
                        }
                        <h3>${escaparHtml(producto.nombre)}</h3>
                        <p>${escaparHtml(producto.descripcion)}</p>
                        <span class="precio">$${precio}</span>
                        <span class="btn-producto">Ver producto</span>
                    </div>
                </a>
                ${acciones}
            </div>
        </article>
    `;
}

// Si una imagen no carga, se reemplaza por la imagen por defecto (el evento error no burbujea, por eso se usa captura)
gridProductos.addEventListener("error", evento => {
    if (evento.target.tagName === "IMG" && evento.target.src !== IMAGEN_POR_DEFECTO) {
        evento.target.src = IMAGEN_POR_DEFECTO;
    }
}, true);

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

// =====================================================================
// CRUD: crear, editar y eliminar (solo con sesión activa)
// =====================================================================

// Muestra el botón "Nuevo producto" con sesión activa, o el aviso para iniciar sesión sin ella
btnNuevoProducto.classList.toggle("d-none", !sesion);
avisoSesion.classList.toggle("d-none", Boolean(sesion));

// Completa el select de categorías del formulario
Object.entries(CATEGORIAS).forEach(([valor, etiqueta]) => {
    document.getElementById("productoCategoria").add(new Option(etiqueta, valor));
});

// Actualiza la miniatura del formulario según la ruta de imagen escrita
function actualizarPreview() {
    previewImagen.src = campoImagen.value.trim() || IMAGEN_POR_DEFECTO;
}
campoImagen.addEventListener("input", actualizarPreview);
previewImagen.addEventListener("error", () => {
    if (previewImagen.src !== IMAGEN_POR_DEFECTO) {
        previewImagen.src = IMAGEN_POR_DEFECTO;
    }
});

// Quita las marcas de error del formulario
function limpiarErroresFormulario() {
    formProducto.querySelectorAll(".is-invalid").forEach(campo => {
        campo.classList.remove("is-invalid");
    });
}
formProducto.querySelectorAll(".form-control, .form-select").forEach(campo => {
    campo.addEventListener("input", () => campo.classList.remove("is-invalid"));
});

// Abre el formulario vacío (crear) o cargado con los datos del producto (editar)
async function abrirFormulario(id = null) {
    formProducto.reset();
    limpiarErroresFormulario();
    document.getElementById("productoId").value = "";

    if (id === null) {
        modalProductoTitulo.textContent = "Nuevo producto";
    } else {
        try {
            const producto = await Api.obtenerProducto(id);
            modalProductoTitulo.textContent = "Editar producto";
            document.getElementById("productoId").value = producto.id;
            document.getElementById("productoNombre").value = producto.nombre;
            document.getElementById("productoCategoria").value = producto.categoria;
            document.getElementById("productoPrecio").value = producto.precio;
            document.getElementById("productoStock").value = producto.stock;
            document.getElementById("productoDescripcion").value = producto.descripcion;
            campoImagen.value = producto.imagen;
            document.getElementById("productoDestacado").checked = producto.destacado;
        } catch (error) {
            manejarError(error);
            return;
        }
    }
    actualizarPreview();
    modalProducto.show();
}

// Lee los valores del formulario como objeto producto
function leerFormulario() {
    return {
        nombre: document.getElementById("productoNombre").value.trim(),
        categoria: document.getElementById("productoCategoria").value,
        precio: document.getElementById("productoPrecio").value,
        stock: document.getElementById("productoStock").value,
        descripcion: document.getElementById("productoDescripcion").value.trim(),
        imagen: campoImagen.value.trim(),
        destacado: document.getElementById("productoDestacado").checked
    };
}

// Valida el formulario marcando los campos incorrectos; devuelve true si todo está bien
function validarFormulario(datos) {
    limpiarErroresFormulario();
    const errores = {
        productoNombre: datos.nombre === "",
        productoCategoria: datos.categoria === "",
        productoPrecio: !(Number(datos.precio) > 0) || !Number.isInteger(Number(datos.precio)),
        productoStock: datos.stock === "" || !(Number(datos.stock) >= 0) || !Number.isInteger(Number(datos.stock)),
        productoDescripcion: datos.descripcion === ""
    };
    let valido = true;
    Object.entries(errores).forEach(([idCampo, hayError]) => {
        if (hayError) {
            document.getElementById(idCampo).classList.add("is-invalid");
            valido = false;
        }
    });
    return valido;
}

// CREATE / UPDATE: guarda el formulario según tenga o no un id cargado
formProducto.addEventListener("submit", async evento => {
    evento.preventDefault();
    const datos = leerFormulario();
    if (!validarFormulario(datos)) return;

    const id = document.getElementById("productoId").value;
    btnGuardarProducto.disabled = true;
    try {
        if (id) {
            await Api.actualizarProducto(id, datos);
        } else {
            await Api.crearProducto(datos);
        }
        productos = await Api.listarProductos();
        aplicarFiltros(true);
        modalProducto.hide();
        notificar(id ? "Producto actualizado correctamente." : "Producto creado correctamente.");
    } catch (error) {
        manejarError(error);
    } finally {
        btnGuardarProducto.disabled = false;
    }
});

// DELETE: abre la confirmación con el nombre del producto
function pedirConfirmacionEliminar(id) {
    const producto = productos.find(item => item.id === id);
    if (!producto) return;
    idAEliminar = id;
    nombreEliminar.textContent = producto.nombre;
    modalEliminar.show();
}

// DELETE: elimina el producto confirmado
btnConfirmarEliminar.addEventListener("click", async () => {
    if (idAEliminar === null) return;
    btnConfirmarEliminar.disabled = true;
    try {
        await Api.eliminarProducto(idAEliminar);
        productos = await Api.listarProductos();
        aplicarFiltros(true);
        modalEliminar.hide();
        notificar("Producto eliminado.");
    } catch (error) {
        modalEliminar.hide(); // se cierra también si falla, para que se vea el aviso de error
        manejarError(error);
    } finally {
        idAEliminar = null;
        btnConfirmarEliminar.disabled = false;
    }
});

// Botón "Nuevo producto"
btnNuevoProducto.addEventListener("click", () => abrirFormulario());

// Botones Editar / Eliminar de las tarjetas (delegación de eventos sobre el grid)
gridProductos.addEventListener("click", evento => {
    const boton = evento.target.closest("[data-accion]");
    if (!boton || !sesion) return;
    const id = Number(boton.dataset.id);
    if (boton.dataset.accion === "editar") {
        abrirFormulario(id);
    } else if (boton.dataset.accion === "eliminar") {
        pedirConfirmacionEliminar(id);
    }
});

// =====================================================================
// FILTROS: categorías, búsqueda y orden
// =====================================================================

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
busquedaProductos.addEventListener("input", () => aplicarFiltros());
ordenarProductos.addEventListener("change", () => aplicarFiltros());
cargarProductos();
