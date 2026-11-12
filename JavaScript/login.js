// Página a la que se redirige después de iniciar sesión o crear la cuenta.
const PAGINA_DESTINO = "productos.html";

// Si ya hay una sesión activa no tiene sentido mostrar el login.
if (Api.obtenerSesion()) {
    window.location.replace(PAGINA_DESTINO);
}

// Referencias a los elementos del DOM.
const formLogin = document.getElementById("formLogin");
const formRegistro = document.getElementById("formRegistro");
const loginTitulo = document.getElementById("loginTitulo");
const loginSubtitulo = document.getElementById("loginSubtitulo");
const loginAlerta = document.getElementById("loginAlerta");
const loginAlertaTexto = document.getElementById("loginAlertaTexto");

// Textos del encabezado según el formulario activo.
const TEXTOS = {
    login: {
        titulo: "Bienvenido de nuevo",
        subtitulo: "Ingresá tus datos para continuar."
    },
    registro: {
        titulo: "Creá tu cuenta",
        subtitulo: "Completá tus datos para registrarte."
    }
};

// ---------- Utilidades de validación ----------

// Marca un campo como inválido y muestra su mensaje debajo.
function marcarError(input, mensaje) {
    input.classList.add("is-invalid");
    input.parentElement.querySelector(".invalid-feedback").textContent = mensaje;
}

// Quita los errores de un formulario y oculta la alerta general.
function limpiarErrores(formulario) {
    formulario.querySelectorAll(".is-invalid").forEach(input => {
        input.classList.remove("is-invalid");
    });
    ocultarAlerta();
}

// Muestra un mensaje de error general arriba del formulario.
function mostrarAlerta(mensaje) {
    loginAlertaTexto.textContent = mensaje;
    loginAlerta.classList.remove("d-none");
}

function ocultarAlerta() {
    loginAlerta.classList.add("d-none");
}

// Valida con una expresión simple que el email tenga formato correcto.
function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------- Cambio entre login y registro ----------

// Muestra el formulario pedido y actualiza pestañas y encabezado.
function cambiarModo(modo) {
    const esLogin = modo === "login";
    formLogin.classList.toggle("d-none", !esLogin);
    formRegistro.classList.toggle("d-none", esLogin);
    loginTitulo.textContent = TEXTOS[modo].titulo;
    loginSubtitulo.textContent = TEXTOS[modo].subtitulo;
    document.querySelectorAll(".login-tab").forEach(tab => {
        const activa = tab.dataset.modo === modo;
        tab.classList.toggle("active", activa);
        tab.setAttribute("aria-selected", activa);
    });
    limpiarErrores(formLogin);
    limpiarErrores(formRegistro);
}

// Pestañas y enlaces "Creá una" / "Iniciá sesión".
document.querySelectorAll("[data-modo]").forEach(elemento => {
    elemento.addEventListener("click", () => cambiarModo(elemento.dataset.modo));
});

// Botones de ojo: alternan entre ocultar y mostrar la contraseña.
document.querySelectorAll(".btn-ver-clave").forEach(boton => {
    boton.addEventListener("click", () => {
        const input = document.getElementById(boton.dataset.target);
        const mostrar = input.type === "password";
        input.type = mostrar ? "text" : "password";
        boton.querySelector("i").className = mostrar ? "bi bi-eye-slash" : "bi bi-eye";
        boton.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");
    });
});

// Al escribir en un campo con error, se le quita la marca roja.
document.querySelectorAll(".login-form .form-control").forEach(input => {
    input.addEventListener("input", () => input.classList.remove("is-invalid"));
});

// ---------- Inicio de sesión ----------

formLogin.addEventListener("submit", async evento => {
    evento.preventDefault();
    limpiarErrores(formLogin);

    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");
    let valido = true;

    if (!emailValido(email.value.trim())) {
        marcarError(email, "Ingresá un email válido.");
        valido = false;
    }
    if (password.value === "") {
        marcarError(password, "Ingresá tu contraseña.");
        valido = false;
    }
    if (!valido) return;

    const boton = formLogin.querySelector("button[type='submit']");
    boton.disabled = true;
    try {
        await Api.iniciarSesion({ email: email.value, password: password.value });
        window.location.href = PAGINA_DESTINO;
    } catch (error) {
        mostrarAlerta(error.message);
        boton.disabled = false;
    }
});

// ---------- Registro ----------

formRegistro.addEventListener("submit", async evento => {
    evento.preventDefault();
    limpiarErrores(formRegistro);

    const nombre = document.getElementById("regNombre");
    const dni = document.getElementById("regDni");
    const telefono = document.getElementById("regTelefono");
    const email = document.getElementById("regEmail");
    const password = document.getElementById("regPassword");
    const password2 = document.getElementById("regPassword2");
    let valido = true;

    if (nombre.value.trim().length < 3) {
        marcarError(nombre, "Ingresá tu nombre completo.");
        valido = false;
    }
    if (!/^\d{7,8}$/.test(dni.value.trim())) {
        marcarError(dni, "El DNI debe tener 7 u 8 números.");
        valido = false;
    }
    if (!/^\d{8,15}$/.test(telefono.value.trim())) {
        marcarError(telefono, "Ingresá entre 8 y 15 números.");
        valido = false;
    }
    if (!emailValido(email.value.trim())) {
        marcarError(email, "Ingresá un email válido.");
        valido = false;
    }
    if (password.value.length < 6) {
        marcarError(password, "Usá al menos 6 caracteres.");
        valido = false;
    }
    if (password2.value !== password.value) {
        marcarError(password2, "Las contraseñas no coinciden.");
        valido = false;
    }
    if (!valido) return;

    const boton = formRegistro.querySelector("button[type='submit']");
    boton.disabled = true;
    try {
        await Api.registrarUsuario({
            nombre: nombre.value,
            dni: dni.value.trim(),
            telefono: telefono.value.trim(),
            email: email.value,
            password: password.value
        });
        window.location.href = PAGINA_DESTINO;
    } catch (error) {
        mostrarAlerta(error.message);
        boton.disabled = false;
    }
});
