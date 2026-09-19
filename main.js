// Carga un componente HTML (header o footer) dentro de un contenedor por fetch
async function cargarComponente(idContenedor, archivoHtml) {
    try {
        const response = await fetch(archivoHtml);
        if (!response.ok) {
            throw new Error(`No se pudo cargar el archivo ${archivoHtml}`);
        }
        const data = await response.text();
        document.getElementById(idContenedor).innerHTML = data;
    } catch (error) {
        console.error("Error:", error);
    }
}

// Función principal: carga header y footer, y activa el efecto de header al hacer scroll
async function iniciarPagina() {
    await cargarComponente("header-container", "COMPONENTES/header.html");
    await cargarComponente("footer-container", "COMPONENTES/footer.html");
    const header = document.querySelector(".header");
    const LIMITE_SCROLL = 300;
    let hoverActivo = false;

    // Encoge el header al pasar el límite de scroll (salvo que el mouse esté encima)
    window.addEventListener("scroll", () => {
        if (hoverActivo) return;
        if (window.scrollY > LIMITE_SCROLL) {
            header.classList.add("shrink");
        } else {
            header.classList.remove("shrink");
        }
    });
    // Mientras el mouse está sobre el header, lo mantenemos expandido
    header.addEventListener("mouseenter", () => {
        hoverActivo = true;
        header.classList.remove("shrink");
    });
    header.addEventListener("mouseleave", () => {
        hoverActivo = false;
        if (window.scrollY > LIMITE_SCROLL) {
            header.classList.add("shrink");
        }
    });
}

iniciarPagina();

