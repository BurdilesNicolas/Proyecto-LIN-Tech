const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors())
app.use(express.json())

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'TallerSoftware2026!',
    database: 'mydb'
})

const PORT = 3000



app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
})