const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');

require('dotenv').config();

const CATEGORIES = ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Otros', 'Casa', 'Salario', 'Freelance'];

// Datos de transacciones de prueba
const generateTransactions = (userId) => {
  const transactions = [];
  const today = new Date();

  // 1. Ingresos Fijos (Salario) - Últimos 12 meses
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    transactions.push({
      userId,
      text: 'Nómina Empresa S.A.',
      amount: 2800.00,
      category: 'Salario',
      date: d,
    });
  }

  // 2. Gastos Variados (Extenso para 12 meses)
  const expenses = [
    { text: 'Supermercado Mercadona', cat: 'Comida', min: 40, max: 150 },
    { text: 'Restaurante El Buen Comer', cat: 'Comida', min: 20, max: 60 },
    { text: 'Uber Trip', cat: 'Transporte', min: 10, max: 30 },
    { text: 'Gasolinera Shell', cat: 'Transporte', min: 40, max: 70 },
    { text: 'Netflix Suscripción', cat: 'Entretenimiento', min: 12, max: 12 },
    { text: 'Cine Yelmo', cat: 'Entretenimiento', min: 15, max: 30 },
    { text: 'Farmacia 24h', cat: 'Salud', min: 10, max: 50 },
    { text: 'Gimnasio Mensual', cat: 'Salud', min: 40, max: 40 },
    { text: 'Compra Amazon', cat: 'Otros', min: 20, max: 100 },
    { text: 'Alquiler Piso', cat: 'Casa', min: 800, max: 800 },
    { text: 'Factura Luz', cat: 'Casa', min: 60, max: 90 },
    { text: 'Factura Internet', cat: 'Casa', min: 40, max: 40 },
    { text: 'Spotify Premium', cat: 'Entretenimiento', min: 10, max: 10 },
    { text: 'Cafetería Morning', cat: 'Comida', min: 3, max: 8 },
  ];

  // Generar transacciones aleatorias (~20 por mes x 12 meses = 240)
  for (let i = 0; i < 240; i++) {
    const item = expenses[Math.floor(Math.random() * expenses.length)];
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    transactions.push({
      userId,
      text: item.text,
      amount: -Number((item.min + Math.random() * (item.max - item.min)).toFixed(2)),
      category: item.cat,
      date: date,
    });
  }

  // Ordenar por fecha descendente
  return transactions.sort((a, b) => b.date - a.date);
};

// Datos de presupuestos de prueba (mes actual)
const generateBudgets = (userId) => {
  const currentMonth = new Date().toISOString().slice(0, 7);

  return [
    { userId, category: 'Comida', limit: 300, month: currentMonth },
    { userId, category: 'Transporte', limit: 150, month: currentMonth },
    { userId, category: 'Entretenimiento', limit: 200, month: currentMonth },
    { userId, category: 'Salud', limit: 200, month: currentMonth },
    { userId, category: 'Otros', limit: 150, month: currentMonth },
    { userId, category: 'Casa', limit: 500, month: currentMonth },
  ];
};

async function seed() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log('📦 Conectado a MongoDB');

    // Limpiar datos existentes (opcional)
    console.log('🧹 Limpiando datos existentes...');
    await User.deleteMany({ email: 'test@example.com' });
    await Transaction.deleteMany({});
    await Budget.deleteMany({});

    // Crear usuario de prueba
    console.log('👤 Creando usuario de prueba...');
    const testUser = await User.create({
      name: 'Usuario de Prueba',
      email: 'test@example.com',
      password: 'password123', // Se encripta automáticamente gracias al pre('save') en el modelo
    });

    console.log(`✅ Usuario creado: ${testUser.email} (ID: ${testUser._id})`);

    // Generar y guardar transacciones
    console.log('💰 Generando transacciones...');
    const transactions = generateTransactions(testUser._id);
    const savedTransactions = await Transaction.insertMany(transactions);
    console.log(`✅ ${savedTransactions.length} transacciones creadas`);

    // Generar y guardar presupuestos
    console.log('📊 Creando presupuestos...');
    const budgets = generateBudgets(testUser._id);
    const savedBudgets = await Budget.insertMany(budgets);
    console.log(`✅ ${savedBudgets.length} presupuestos creados`);

    // Estadísticas
    const totalIncome = savedTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = Math.abs(
      savedTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    console.log('\n📈 Estadísticas:');
    console.log(`   Ingresos totales: $${totalIncome.toFixed(2)}`);
    console.log(`   Gastos totales: $${totalExpense.toFixed(2)}`);
    console.log(`   Balance: $${(totalIncome - totalExpense).toFixed(2)}`);

    console.log('\n🎯 Datos de prueba creados exitosamente!');
    console.log('\n📝 Usa estas credenciales para iniciar sesión:');
    console.log(`   Email: test@example.com`);
    console.log(`   Contraseña: password123`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear datos de prueba:', error);
    process.exit(1);
  }
}

// Ejecutar seed
seed();
