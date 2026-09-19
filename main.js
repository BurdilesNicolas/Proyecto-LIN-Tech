//Archivo JavaScript principal para la carga de componentes
// Función para cargar componentes de forma dinámica
// Archivo JavaScript principal para la carga de componentes

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


// Función principal
async function iniciarPagina() {

    // Primero cargamos el header
    await cargarComponente(
        "header-container",
        "COMPONENTES/header.html"
    );
    await cargarComponente(
        "footer-container",
        "COMPONENTES/footer.html"
    );
    /* HEADER SHRINK */
    const header = document.querySelector(".header");
    const LIMITE_SCROLL = 300;
    let hoverActivo = false;
    window.addEventListener("scroll", () => {
        if (hoverActivo) return;
        if (window.scrollY > LIMITE_SCROLL) {
            header.classList.add("shrink");
        } else {
            header.classList.remove("shrink");
        }
    });


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


// Iniciar
iniciarPagina();
/*
async function cargarComponente(idContenedor, archivoHtml) {
    //hacemos una solicitud fetch para obtener el contenido del archivo HTML
    fetch(archivoHtml)
        //si la solicitud es exitosa, parseamos el contenido como texto
        .then(response => {
            //con .ok verificamos que la respuesta fue exitosa o no (true o fakse).
            if (!response.ok) {
                throw new Error(`No se pudo cargar el archivo ${archivoHtml}`);
            }
            //con .text() obtenemos el contenido del archivo como texto
            return response.text();
        })
        //se recibe el texto plano del archivo HTML y se inserta en el contenedor especificado por su ID
        .then(data => {
            document.getElementById(idContenedor).innerHTML = data;
        })
        // si la solicitud falla, se ejecuta este código para mostrar el error en la consola
        .catch(error => console.error('Error:', error));
}

/* Llamamos a la función para cada componente que necesitemos
cargarComponente('header-container', 'COMPONENTES/header.html')
.then(() => {

const header = document.querySelector("header");
const LIMITE_SCROLL = 300;
let hoverActivo = false;

window.addEventListener("scroll", () => {
    
    if (hoverActivo) return;
    if (window.scrollY > LIMITE_SCROLL) {
        header.classList.add("shrink");
        console.log("hola");
    } else {
        header.classList.remove("shrink");
    }
});

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
   });*/
