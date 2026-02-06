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
  
  // Generar transacciones desde hace 2 años hasta ahora
  const startDate = new Date(2023, 0, 1); // Enero 2023
  const endDate = new Date(); // Hoy

  // Transacciones de ingresos (Salario y Freelance)
  for (let d = new Date(2023, 0, 1); d <= endDate; d.setMonth(d.getMonth() + 1)) {
    // Salario: primer día del mes, 3000-4000
    transactions.push({
      userId,
      text: 'Salario mensual',
      amount: 3500 + Math.random() * 500,
      category: 'Salario',
      date: new Date(d.getFullYear(), d.getMonth(), 1),
    });

    // Freelance ocasional: ~50% de probabilidad, 500-1500
    if (Math.random() > 0.5) {
      transactions.push({
        userId,
        text: 'Trabajo freelance',
        amount: 500 + Math.random() * 1000,
        category: 'Freelance',
        date: new Date(d.getFullYear(), d.getMonth(), 10 + Math.floor(Math.random() * 15)),
      });
    }
  }

  // Transacciones de gastos diarios
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // 60% de probabilidad de gasto en un día
    if (Math.random() > 0.4) {
      const category = CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 2))]; // Excluye Salario y Freelance
      const amounts = {
        'Comida': [8, 25],
        'Transporte': [1.5, 15],
        'Entretenimiento': [5, 100],
        'Salud': [20, 200],
        'Otros': [5, 50],
        'Casa': [50, 300],
      };

      const [min, max] = amounts[category] || [10, 100];
      transactions.push({
        userId,
        text: `Gasto en ${category.toLowerCase()}`,
        amount: -(min + Math.random() * (max - min)),
        category,
        date: d,
      });
    }

    // Ocasionalmente múltiples gastos en un mismo día
    if (Math.random() > 0.8) {
      const category = CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 2))];
      const amounts = {
        'Comida': [8, 25],
        'Transporte': [1.5, 15],
        'Entretenimiento': [5, 100],
        'Salud': [20, 200],
        'Otros': [5, 50],
        'Casa': [50, 300],
      };

      const [min, max] = amounts[category] || [10, 100];
      transactions.push({
        userId,
        text: `Gasto adicional en ${category.toLowerCase()}`,
        amount: -(min + Math.random() * (max - min)),
        category,
        date: d,
      });
    }
  }

  return transactions;
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
