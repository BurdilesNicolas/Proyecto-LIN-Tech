
/* Autenticación provisoria de frontend. Para producción debe reemplazarse
   por endpoints de autenticación en Node.js y contraseñas hasheadas en servidor. */

const AUTH_CONFIG = {
    apiEnabled: false,
    apiBaseUrl: 'http://localhost:3000/api'
};

const USERS_KEY = 'lintech_demo_users';
const SESSION_KEY = 'lintech_session';

const hashPassword = async value => {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);

    return [...new Uint8Array(digest)]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

const showMessage = (id, msg, ok = false) => {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.classList.toggle('success', ok);
};

function switchView(view) {
    document.getElementById('loginForm')
        .classList.toggle('d-none', view !== 'login');

    document.getElementById('registroForm')
        .classList.toggle('d-none', view !== 'registro');

    document.querySelectorAll('.auth-tab').forEach(b =>
        b.classList.toggle('active', b.dataset.view === view)
    );

    document.querySelectorAll('.auth-message').forEach(x => {
        x.textContent = '';
    });
}

document.querySelectorAll('[data-view]').forEach(b => {
    b.addEventListener('click', () => switchView(b.dataset.view));
});

document.querySelectorAll('.toggle-password').forEach(b => {
    b.addEventListener('click', () => {
        const input = document.getElementById(b.dataset.target);

        input.type = input.type === 'password' ? 'text' : 'password';

        b.innerHTML = input.type === 'password'
            ? '<i class="bi bi-eye"></i>'
            : '<i class="bi bi-eye-slash"></i>';
    });
});

// REGISTRO
document.getElementById('registroForm').addEventListener('submit', async e => {
    e.preventDefault();

    const nombre = document.getElementById('registroNombre').value.trim();
    const email = document.getElementById('registroEmail').value.trim().toLowerCase();
    const password = document.getElementById('registroPassword').value;

    if (password.length < 8) {
        return showMessage(
            'registroMessage',
            'La contraseña debe tener al menos 8 caracteres.'
        );
    }

    try {
        if (AUTH_CONFIG.apiEnabled) {
            const r = await fetch(`${AUTH_CONFIG.apiBaseUrl}/auth/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password })
            });

            const d = await r.json();

            if (!r.ok) {
                throw new Error(d.message || 'No se pudo crear la cuenta.');
            }

            sessionStorage.setItem(SESSION_KEY, JSON.stringify(d.user));
            location.href = 'index.html';
            return;
        }

        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

        if (users.some(u => u.email === email)) {
            return showMessage(
                'registroMessage',
                'Ya existe una cuenta con ese correo.'
            );
        }

        users.push({
            id: crypto.randomUUID(),
            nombre,
            email,
            passwordHash: await hashPassword(password)
        });

        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ nombre, email })
        );

        location.href = 'index.html';

    } catch (err) {
        showMessage('registroMessage', err.message);
    }
});

// LOGIN
document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    try {
        if (AUTH_CONFIG.apiEnabled) {
            const r = await fetch(`${AUTH_CONFIG.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const d = await r.json();

            if (!r.ok) {
                throw new Error(d.message || 'Correo o contraseña incorrectos.');
            }

            sessionStorage.setItem(SESSION_KEY, JSON.stringify(d.user));
            location.href = 'index.html';
            return;
        }

        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const passwordHash = await hashPassword(password);

        const user = users.find(u =>
            u.email === email && u.passwordHash === passwordHash
        );

        if (!user) {
            return showMessage(
                'loginMessage',
                'Correo o contraseña incorrectos.'
            );
        }

        sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify({
                nombre: user.nombre,
                email: user.email
            })
        );

        location.href = 'index.html';

    } catch (err) {
        showMessage('loginMessage', err.message);
    }
});
  