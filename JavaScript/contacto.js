// Obtiene los elementos del formulario y de los campos que controla JavaScript.
const formulario = document.querySelector(".contact-form");
const notificacion = document.getElementById("notificacion");
const empresaSi = document.getElementById("empresa-si");
const empresaNo = document.getElementById("empresa-no");
const datosEmpresa = document.getElementById("datos-empresa");

// Controla el envío del formulario y muestra una notificación temporal.
formulario.addEventListener("submit", function(evento) {
    // Evita que el formulario recargue la página.
    evento.preventDefault();
    // Muestra la notificación de envío correcto.
    notificacion.classList.add("mostrar");
    // Oculta la notificación después de 3 segundos.
    setTimeout(() => {
        notificacion.classList.remove("mostrar");
    }, 3000);
    // Limpia todos los campos del formulario.
    formulario.reset();
});

// Habilita o deshabilita los datos de empresa según la opción seleccionada.
function actualizarDatosEmpresa() {
    const inputsEmpresa = datosEmpresa.querySelectorAll("input");
    if (empresaNo.checked) {
        // Deshabilita y limpia los campos de la empresa.
        datosEmpresa.classList.add("deshabilitado");
        inputsEmpresa.forEach(input => {
            input.disabled = true;
            input.value = "";
        });
    } else if (empresaSi.checked) {
        // Vuelve a habilitar los campos de la empresa.
        datosEmpresa.classList.remove("deshabilitado");
        inputsEmpresa.forEach(input => {
            input.disabled = false;
        });
    }
}

// Actualiza los campos cuando se selecciona "Sí".
empresaSi.addEventListener("change", actualizarDatosEmpresa);

// Actualiza los campos cuando se selecciona "No".
empresaNo.addEventListener("change", actualizarDatosEmpresa);

// Vuelve a controlar la notificación y el estado de los campos al enviar.
formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();
    notificacion.classList.add("mostrar");
    setTimeout(() => {
        notificacion.classList.remove("mostrar");
    }, 3000);
    formulario.reset();
    // Después de reiniciar el formulario, actualiza nuevamente
    // el estado de los datos de empresa.
    actualizarDatosEmpresa();
});