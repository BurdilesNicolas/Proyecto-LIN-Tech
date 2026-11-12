const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Pool de conexiones: a diferencia de createConnection, se recupera solo si MySQL cierra
// una conexión inactiva (con una única conexión el servidor se caía después de unas horas).
// Los valores se pueden cambiar con variables de entorno sin tocar el código.
const conexion = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'TallerSoftware2026!',
    database: process.env.DB_NAME || 'mydb',
    waitForConnections: true,
    connectionLimit: 10
}).promise();

// ==========================================
// SEGURIDAD: contraseñas y sesión (solo con el módulo crypto de Node, sin dependencias nuevas)
// ==========================================

// Clave con la que se firman los tokens de sesión. Si no se define TOKEN_SECRET se genera una
// al arrancar: es segura, pero las sesiones abiertas se pierden cada vez que se reinicia el servidor.
const TOKEN_SECRET = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString('hex');
const DURACION_TOKEN_MS = 8 * 60 * 60 * 1000; // 8 horas

// Convierte una contraseña en "sal:hash" (scrypt). Nunca se guarda la contraseña en texto plano.
function hashearPassword(password) {
    return new Promise((resolve, reject) => {
        const sal = crypto.randomBytes(16);
        crypto.scrypt(password, sal, 64, (error, clave) => {
            if (error) return reject(error);
            resolve(`${sal.toString('hex')}:${clave.toString('hex')}`);
        });
    });
}

// Compara una contraseña ingresada con el "sal:hash" guardado en la base de datos.
function verificarPassword(password, guardado) {
    return new Promise((resolve) => {
        const [salHex, claveHex] = String(guardado || '').split(':');
        if (!salHex || !claveHex) return resolve(false);
        crypto.scrypt(password, Buffer.from(salHex, 'hex'), 64, (error, clave) => {
            if (error) return resolve(false);
            const esperada = Buffer.from(claveHex, 'hex');
            resolve(esperada.length === clave.length && crypto.timingSafeEqual(esperada, clave));
        });
    });
}

// Crea un token firmado con el id del usuario y su vencimiento: "datos.firma".
function crearToken(idUsuario) {
    const datos = Buffer.from(JSON.stringify({ id: idUsuario, exp: Date.now() + DURACION_TOKEN_MS })).toString('base64url');
    const firma = crypto.createHmac('sha256', TOKEN_SECRET).update(datos).digest('base64url');
    return `${datos}.${firma}`;
}

// Verifica firma y vencimiento. Devuelve { id, exp } o null si el token no sirve.
function leerToken(token) {
    const [datos, firma] = String(token).split('.');
    if (!datos || !firma) return null;
    const esperada = crypto.createHmac('sha256', TOKEN_SECRET).update(datos).digest('base64url');
    const a = Buffer.from(firma);
    const b = Buffer.from(esperada);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    try {
        const contenido = JSON.parse(Buffer.from(datos, 'base64url').toString());
        return contenido.exp > Date.now() ? contenido : null;
    } catch (error) {
        return null;
    }
}

// Middleware: deja pasar solo a quien envía un token válido (Authorization: Bearer <token>)
// y cuyo usuario todavía existe en la base de datos. Guarda su id en req.usuarioId.
async function requiereSesion(req, res, next) {
    const cabecera = req.headers.authorization || '';
    const datos = cabecera.startsWith('Bearer ') ? leerToken(cabecera.slice(7)) : null;
    if (!datos) {
        return res.status(401).json({ error: 'Necesitás iniciar sesión.' });
    }
    const [filas] = await conexion.query('SELECT Id_Cliente FROM Clientes_Usuario WHERE Id_Cliente = ?', [datos.id]);
    if (filas.length === 0) {
        return res.status(401).json({ error: 'Necesitás iniciar sesión.' });
    }
    req.usuarioId = datos.id;
    next();
}

// ==========================================
// VALIDACIÓN Y FORMATO DE DATOS
// ==========================================

// Categorías que acepta la tienda (las mismas del menú lateral de productos.html).
const CATEGORIAS = ['gpu', 'procesador', 'ram', 'almacenamiento', 'monitor', 'periferico'];
const COLUMNAS_PRODUCTO = 'Id_Productos, Nombre, Categoria, Descripcion, Precio, Stock, Variacion, Imagen, Destacado';

// Convierte a número entero; devuelve NaN si el valor está vacío o no es un número.
function aEntero(valor) {
    if (valor === undefined || valor === null || String(valor).trim() === '') return NaN;
    return Number(valor);
}

// Valida y limpia el cuerpo de un producto. Devuelve { error } o { datos }.
function validarProducto(cuerpo) {
    const nombre = String(cuerpo.nombre ?? '').trim();
    const categoria = String(cuerpo.categoria ?? '').trim();
    const descripcion = String(cuerpo.descripcion ?? '').trim();
    const imagen = String(cuerpo.imagen ?? '').trim();
    const variacion = cuerpo.variacion === undefined ? undefined : String(cuerpo.variacion).trim();
    const precio = aEntero(cuerpo.precio);
    const stock = aEntero(cuerpo.stock);
    const destacado = cuerpo.destacado === true || cuerpo.destacado === 1 || cuerpo.destacado === 'true';

    if (!nombre || nombre.length > 45) {
        return { error: 'El nombre es obligatorio y puede tener hasta 45 caracteres.' };
    }
    if (!CATEGORIAS.includes(categoria)) {
        return { error: 'La categoría no es válida.' };
    }
    if (!descripcion || descripcion.length > 160) {
        return { error: 'La descripción es obligatoria y puede tener hasta 160 caracteres.' };
    }
    if (!Number.isInteger(precio) || precio <= 0 || precio > 9999999999) {
        return { error: 'El precio debe ser un número entero mayor a 0.' };
    }
    if (!Number.isInteger(stock) || stock < 0 || stock > 2147483647) {
        return { error: 'El stock debe ser un número entero de 0 o más.' };
    }
    if (imagen.length > 255) {
        return { error: 'La ruta de la imagen puede tener hasta 255 caracteres.' };
    }
    if (variacion !== undefined && (variacion === '' || variacion.length > 45)) {
        return { error: 'La variación puede tener hasta 45 caracteres.' };
    }
    return {
        datos: { nombre, categoria, descripcion, precio, stock, imagen: imagen || null, variacion, destacado: destacado ? 1 : 0 }
    };
}

// Valida y limpia el cuerpo de un cliente. La contraseña solo se exige al registrarse.
function validarCliente(cuerpo, conPassword) {
    const nombre = String(cuerpo.nombre ?? '').trim();
    const dni = String(cuerpo.dni ?? '').trim();
    const telefono = String(cuerpo.telefono ?? '').trim();
    const email = String(cuerpo.email ?? '').trim().toLowerCase();
    const password = String(cuerpo.password ?? '');
    const foto = String(cuerpo.foto ?? '').trim();

    if (nombre.length < 3 || nombre.length > 45) {
        return { error: 'El nombre debe tener entre 3 y 45 caracteres.' };
    }
    if (!/^\d{7,8}$/.test(dni)) {
        return { error: 'El DNI debe tener 7 u 8 números.' };
    }
    if (!/^\d{8,15}$/.test(telefono)) {
        return { error: 'El teléfono debe tener entre 8 y 15 números.' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 45) {
        return { error: 'El email no es válido (máximo 45 caracteres).' };
    }
    if (foto.length > 45) {
        return { error: 'La foto puede tener hasta 45 caracteres.' };
    }
    if (conPassword && (password.length < 6 || password.length > 72)) {
        return { error: 'La contraseña debe tener entre 6 y 72 caracteres.' };
    }
    return { datos: { nombre, dni, telefono, email, password, foto: foto || null } };
}

// Convierte una fila de la tabla Productos al formato que usa el frontend.
// (Precio llega como texto desde MySQL porque es DECIMAL, por eso se pasa a número.)
function aProducto(fila) {
    return {
        id: fila.Id_Productos,
        nombre: fila.Nombre,
        categoria: fila.Categoria,
        descripcion: fila.Descripcion,
        precio: Number(fila.Precio),
        stock: fila.Stock,
        variacion: fila.Variacion,
        imagen: fila.Imagen || '',
        destacado: Boolean(fila.Destacado)
    };
}

// ==========================================
// PRODUCTOS
// ==========================================

// Listar todos los productos (público)
app.get('/productos', async (req, res) => {
    const [filas] = await conexion.query(`SELECT ${COLUMNAS_PRODUCTO} FROM Productos ORDER BY Id_Productos`);
    res.status(200).json(filas.map(aProducto));
});

// Obtener un producto por su id (público)
app.get('/productos/:id', async (req, res) => {
    const [filas] = await conexion.query(`SELECT ${COLUMNAS_PRODUCTO} FROM Productos WHERE Id_Productos = ?`, [req.params.id]);
    if (filas.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(aProducto(filas[0]));
});

// Agregar producto (requiere sesión)
// El vendedor no se informa: la columna Vendedor_Id_Vendedor admite NULL (ver BasedeDatos.sql).
app.post('/productos', requiereSesion, async (req, res) => {
    const { error, datos } = validarProducto(req.body || {});
    if (error) {
        return res.status(400).json({ error });
    }
    const [resultado] = await conexion.query(
        `INSERT INTO Productos (Nombre, Categoria, Descripcion, Precio, Stock, Variacion, Imagen, Destacado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [datos.nombre, datos.categoria, datos.descripcion, datos.precio, datos.stock, datos.variacion || 'Única', datos.imagen, datos.destacado]
    );
    res.status(201).json({
        mensaje: 'Producto creado correctamente',
        id_nuevo_producto: resultado.insertId
    });
});

// Actualizar producto (requiere sesión). Si no se envía variación, se conserva la que ya tenía.
app.put('/productos/:id', requiereSesion, async (req, res) => {
    const { error, datos } = validarProducto(req.body || {});
    if (error) {
        return res.status(400).json({ error });
    }
    const [resultado] = await conexion.query(
        `UPDATE Productos
         SET Nombre = ?, Categoria = ?, Descripcion = ?, Precio = ?, Stock = ?, Variacion = COALESCE(?, Variacion), Imagen = ?, Destacado = ?
         WHERE Id_Productos = ?`,
        [datos.nombre, datos.categoria, datos.descripcion, datos.precio, datos.stock, datos.variacion ?? null, datos.imagen, datos.destacado, req.params.id]
    );
    if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json({ mensaje: 'Producto actualizado correctamente' });
});

// Eliminar producto (requiere sesión)
app.delete('/productos/:id', requiereSesion, async (req, res) => {
    const [resultado] = await conexion.query('DELETE FROM Productos WHERE Id_Productos = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
});

// ==========================================
// CLIENTES: registro e inicio de sesión
// ==========================================

// Crear cuenta (público). La contraseña se guarda hasheada.
app.post('/clientes', async (req, res) => {
    const { error, datos } = validarCliente(req.body || {}, true);
    if (error) {
        return res.status(400).json({ error });
    }
    const passwordHash = await hashearPassword(datos.password);
    const [resultado] = await conexion.query(
        `INSERT INTO Clientes_Usuario (DNI, Nombre, Telefono, Email, Password, Foto)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [datos.dni, datos.nombre, datos.telefono, datos.email, passwordHash, datos.foto]
    );
    res.status(201).json({
        mensaje: 'Cliente registrado correctamente',
        id_nuevo_cliente: resultado.insertId
    });
});

// Iniciar sesión (público). Devuelve un token y los datos públicos del usuario.
app.post('/login', async (req, res) => {
    const cuerpo = req.body || {};
    const email = String(cuerpo.email ?? '').trim().toLowerCase();
    const password = String(cuerpo.password ?? '');
    if (!email || !password) {
        return res.status(400).json({ error: 'El email y la contraseña son obligatorios.' });
    }
    const [filas] = await conexion.query(
        'SELECT Id_Cliente, Nombre, Email, Password FROM Clientes_Usuario WHERE Email = ?',
        [email]
    );
    const cliente = filas[0];
    const valido = cliente ? await verificarPassword(password, cliente.Password) : false;
    if (!valido) {
        // Mismo mensaje si el email no existe o la contraseña es incorrecta (no revela cuál falló).
        return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
    }
    res.status(200).json({
        token: crearToken(cliente.Id_Cliente),
        usuario: { id: cliente.Id_Cliente, nombre: cliente.Nombre, email: cliente.Email }
    });
});

// Las rutas siguientes exigen sesión y solo permiten acceder a la propia cuenta.
function soloPropiaCuenta(req, res, next) {
    if (Number(req.params.id) !== req.usuarioId) {
        return res.status(403).json({ error: 'Solo podés acceder a tu propia cuenta.' });
    }
    next();
}

// Obtener los datos de la propia cuenta (nunca se devuelve la contraseña)
app.get('/clientes/:id', requiereSesion, soloPropiaCuenta, async (req, res) => {
    const [filas] = await conexion.query(
        'SELECT Id_Cliente, DNI, Nombre, Telefono, Email, Foto FROM Clientes_Usuario WHERE Id_Cliente = ?',
        [req.params.id]
    );
    if (filas.length === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(200).json(filas[0]);
});

// Actualizar los datos de la propia cuenta (no cambia la contraseña)
app.put('/clientes/:id', requiereSesion, soloPropiaCuenta, async (req, res) => {
    const { error, datos } = validarCliente(req.body || {}, false);
    if (error) {
        return res.status(400).json({ error });
    }
    const [resultado] = await conexion.query(
        `UPDATE Clientes_Usuario
         SET DNI = ?, Nombre = ?, Telefono = ?, Email = ?, Foto = ?
         WHERE Id_Cliente = ?`,
        [datos.dni, datos.nombre, datos.telefono, datos.email, datos.foto, req.params.id]
    );
    if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(200).json({ mensaje: 'Cliente actualizado correctamente' });
});

// Eliminar la propia cuenta
app.delete('/clientes/:id', requiereSesion, soloPropiaCuenta, async (req, res) => {
    const [resultado] = await conexion.query('DELETE FROM Clientes_Usuario WHERE Id_Cliente = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(200).json({ mensaje: 'Cliente eliminado correctamente' });
});

// ==========================================
// RUTAS INEXISTENTES Y ERRORES
// ==========================================

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo central de errores: Express 5 envía acá cualquier error (o promesa rechazada) de las rutas.
// Los errores conocidos de MySQL se traducen a mensajes claros en lugar de un 500 genérico.
app.use((error, req, res, next) => {
    // JSON mal formado u otro error de la solicitud
    if (error.status && error.status < 500) {
        return res.status(error.status).json({ error: 'La solicitud no es válida.' });
    }

    // Dato repetido en una columna UNIQUE (email, DNI o teléfono)
    if (error.code === 'ER_DUP_ENTRY') {
        const detalle = String(error.sqlMessage || '').toLowerCase();
        const campo = ['email', 'dni', 'telefono'].find(nombre => detalle.includes(nombre));
        const etiquetas = { email: 'email', dni: 'DNI', telefono: 'teléfono' };
        return res.status(409).json({
            error: campo ? `Ya existe una cuenta con ese ${etiquetas[campo]}.` : 'Ya existe un registro con esos datos.'
        });
    }

    // Registro usado por otra tabla (por ejemplo, un producto que figura en una compra)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ error: 'No se puede eliminar porque tiene registros asociados (por ejemplo, compras).' });
    }

    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Al arrancar se verifica la conexión con la base de datos para detectar problemas enseguida.
conexion.query('SELECT 1')
    .then(() => console.log('Conectado a la base de datos'))
    .catch(error => console.error('No se pudo conectar a la base de datos:', error.message));

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
