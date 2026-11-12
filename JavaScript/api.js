// =====================================================================
// CAPA DE DATOS
// ---------------------------------------------------------------------
// Todo el acceso a datos del sitio (productos, usuarios y sesión) pasa por este archivo,
// que se comunica con el servidor Node.js (servidor.js). El resto de los scripts
// (productos.js, producto.js, login.js, main.js) nunca llaman a fetch directamente.
// =====================================================================

const Api = (() => {
    // Dirección del servidor Node.js. Si cambia el puerto o el host, se modifica solo acá.
    const API_URL = "http://localhost:3000";

    // Clave de sessionStorage donde se guarda la sesión: { id, nombre, email, token }.
    const CLAVE_SESION = "lintech_session";

    // Devuelve la sesión activa o null. Es síncrona porque el header y la lista de productos
    // la consultan al dibujarse.
    function obtenerSesion() {
        try {
            const sesion = JSON.parse(sessionStorage.getItem(CLAVE_SESION) || "null");
            return sesion && sesion.token ? sesion : null;
        } catch (error) {
            sessionStorage.removeItem(CLAVE_SESION);
            return null;
        }
    }

    // Hace una consulta al servidor y devuelve el JSON de la respuesta.
    // Si el servidor responde con error, lanza un Error con el mensaje del servidor y el código en .status.
    async function pedir(ruta, opciones = {}) {
        const sesion = obtenerSesion();
        const headers = { "Content-Type": "application/json" };
        if (sesion) {
            headers.Authorization = "Bearer " + sesion.token;
        }

        let respuesta;
        try {
            respuesta = await fetch(API_URL + ruta, { ...opciones, headers });
        } catch (error) {
            throw new Error("No se pudo conectar con el servidor. Verificá que esté encendido.");
        }

        let datos = null;
        try {
            datos = await respuesta.json();
        } catch (error) {
            // la respuesta no tenía cuerpo JSON
        }

        if (!respuesta.ok) {
            // Con sesión iniciada, un 401 significa que el token venció o dejó de ser válido.
            if (respuesta.status === 401 && sesion) {
                sessionStorage.removeItem(CLAVE_SESION);
                const error = new Error("Tu sesión expiró. Volvé a iniciar sesión.");
                error.status = 401;
                throw error;
            }
            const error = new Error((datos && datos.error) || "Error del servidor.");
            error.status = respuesta.status;
            throw error;
        }
        return datos;
    }

    // =================================================================
    // PRODUCTOS
    // =================================================================

    // Devuelve todos los productos.   GET /productos
    function listarProductos() {
        return pedir("/productos");
    }

    // Devuelve un producto por id.   GET /productos/:id
    function obtenerProducto(id) {
        return pedir("/productos/" + encodeURIComponent(id));
    }

    // Crea un producto (requiere sesión).   POST /productos
    function crearProducto(datos) {
        return pedir("/productos", { method: "POST", body: JSON.stringify(datos) });
    }

    // Modifica un producto existente (requiere sesión).   PUT /productos/:id
    function actualizarProducto(id, datos) {
        return pedir("/productos/" + encodeURIComponent(id), { method: "PUT", body: JSON.stringify(datos) });
    }

    // Elimina un producto (requiere sesión).   DELETE /productos/:id
    function eliminarProducto(id) {
        return pedir("/productos/" + encodeURIComponent(id), { method: "DELETE" });
    }

    // =================================================================
    // USUARIOS Y SESIÓN
    // =================================================================

    // Inicia sesión y guarda { id, nombre, email, token }.   POST /login
    async function iniciarSesion({ email, password }) {
        const respuesta = await pedir("/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });
        const sesion = { ...respuesta.usuario, token: respuesta.token };
        sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
        return sesion;
    }

    // Registra un usuario nuevo (POST /clientes) e inicia su sesión.
    async function registrarUsuario({ nombre, dni, telefono, email, password }) {
        await pedir("/clientes", {
            method: "POST",
            body: JSON.stringify({ nombre, dni, telefono, email, password })
        });
        return iniciarSesion({ email, password });
    }

    // Cierra la sesión activa (el token se descarta en el navegador).
    async function cerrarSesion() {
        sessionStorage.removeItem(CLAVE_SESION);
    }

    return {
        listarProductos,
        obtenerProducto,
        crearProducto,
        actualizarProducto,
        eliminarProducto,
        registrarUsuario,
        iniciarSesion,
        cerrarSesion,
        obtenerSesion
    };
})();
