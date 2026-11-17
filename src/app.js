const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Inicializar express
const app = express();

// Enrutadores
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const apiRoutes = require('./routes/index');

// CORS: antes de las rutas
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || !process.env.FRONTEND_URL || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`Bloqueado por CORS: Origen ${origin} no permitido`));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares globales
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de bienvenida y prueba
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Servidor MediMascotas en linea',
    estado: 'ok'
  });
});

// 1. Rutas Publicas: Registro y Login
app.use('/api/auth', authRoutes);

// 2. Rutas Privadas: Perfil y Usuarios (protegidas con el middleware de token)
app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes);

// 3. Modulos de la veterinaria (Mascotas, Consultas, Vacunas, etc.)
app.use('/api', apiRoutes);

// Manejo de error 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada', metodo: req.method, url: req.originalUrl });
});

// Manejo de errores 500
app.use((err, req, res, next) => {
  console.error('Error interno del servidor:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
