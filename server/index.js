require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const transactionsRouter = require('./routes/transactions');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json()); // Parseo de JSON en el body

// Ruta base de la API
app.use('/api/v1/transactions', transactionsRouter);

// Ruta simple de salud
app.get('/', (req, res) => {
  res.send('API de Personal Expense Tracker funcionando');
});

// Conexión a MongoDB y arranque del servidor
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  });

