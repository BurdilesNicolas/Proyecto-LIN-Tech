// Carga el header y el footer compartidos y actualiza el acceso según la sesión.

async function cargarComponente(idContenedor, archivoHtml) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    try {
        const respuesta = await fetch(archivoHtml);

        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar ${archivoHtml}`);
        }

        contenedor.innerHTML = await respuesta.text();

    } catch (error) {
        console.error(`Error al cargar ${archivoHtml}:`, error);
    }
}

// Con sesión iniciada reemplaza el botón "Iniciar sesión" de header.html por el saludo y "Cerrar sesión".
// Sin sesión no hace nada: header.html ya trae el acceso a login.html.
function actualizarAccesoHeader() {
    const acciones = document.querySelector('.header-actions');
    if (!acciones || typeof Api === 'undefined') return;

    const sesion = Api.obtenerSesion();
    if (!sesion) return;

    acciones.innerHTML = `
        <button class="icon-btn" type="button"
            aria-label="Carrito" title="Carrito">
            <i class="bi bi-cart3"></i>
        </button>

        <span class="usuario-header">
            <i class="bi bi-person-circle"></i>
            <span>Hola, <span class="usuario-nombre"></span></span>
        </span>

        <button class="login-btn" id="cerrarSesion" type="button">
            <i class="bi bi-box-arrow-right me-1"></i>
            Cerrar sesión
        </button>
    `;

    // textContent evita que un nombre con HTML se interprete como código
    acciones.querySelector('.usuario-nombre').textContent = sesion.nombre;

    // Al cerrar sesión se recarga la página para que deje de mostrar acciones que requieren sesión
    document.getElementById('cerrarSesion').addEventListener('click', async () => {
        await Api.cerrarSesion();
        window.location.reload();
    });
}

async function iniciarPagina() {
    await Promise.all([
        cargarComponente('header-container', 'COMPONENTES/header.html'),
        cargarComponente('footer-container', 'COMPONENTES/footer.html')
    ]);

    actualizarAccesoHeader();

    const header = document.querySelector('.header');
    if (!header) return;

    const actualizarScroll = () => {
        header.classList.toggle('shrink', window.scrollY > 300);
    };

    window.addEventListener('scroll', actualizarScroll, { passive: true });

    header.addEventListener('mouseenter', () => {
        header.classList.remove('shrink');
    });

    header.addEventListener('mouseleave', actualizarScroll);

    actualizarScroll();
}

document.addEventListener('DOMContentLoaded', iniciarPagina);
