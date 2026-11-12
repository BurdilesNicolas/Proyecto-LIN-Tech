// Constantes y utilidades compartidas por las páginas de productos (productos.html y producto.html).

// Categorías disponibles (mismas del menú lateral y del servidor).
const CATEGORIAS = {
    gpu: "Tarjetas de Video",
    procesador: "Procesadores",
    ram: "Memorias RAM",
    almacenamiento: "Almacenamiento",
    monitor: "Monitores",
    periferico: "Periféricos"
};

// Imagen que se muestra cuando un producto no tiene imagen o el archivo no se encuentra.
const IMAGEN_POR_DEFECTO = "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="#0f172a"/>
        <text x="200" y="165" font-family="sans-serif" font-size="22" fill="#475569" text-anchor="middle">Sin imagen</text>
    </svg>`
);

// Escapa caracteres especiales para insertar texto ingresado por usuarios de forma segura en el HTML.
function escaparHtml(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[caracter]));
}
