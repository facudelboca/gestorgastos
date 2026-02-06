# Personal Expense Tracker

Aplicación web completa para **rastrear ingresos y gastos personales** con autenticación, presupuestos, paginación, exportación de datos y gráficos avanzados.

---

## ¿Qué hace este proyecto?

### Core Features ✅
- **Autenticación**: Registro e inicio de sesión con JWT
- **Registrar transacciones**: Ingresos (monto positivo) o gastos (monto negativo)
- **Ver balance**: Total de ingresos menos gastos en el header
- **Filtros avanzados**: Por categoría, texto, rango de montos, fechas
- **Editar/Eliminar**: Gestionar transacciones existentes

### Features Adicionales ✅
- **Presupuestos por categoría**: Establecer límites mensuales con alertas
- **Paginación**: Navegar entre páginas de transacciones (10/20/50/100 items)
- **Exportar datos**: Descargar en formato CSV (Excel) o PDF (profesional)
- **Gráficos avanzados**: Pie chart, líneas, barras y estadísticas
- **Modo oscuro/claro**: Tema persistente con preferencia del sistema

### Seguridad 🔒
- Contraseñas hasheadas con **bcryptjs** (10 salt rounds)
- JWT con expiración de 30 días
- Aislamiento de datos por usuario
- Validación en backend y frontend

---

## Stack tecnológico

| Capa       | Tecnología                          |
| ---------- | ----------------------------------- |
| Frontend   | React 18, Vite, Tailwind CSS, Recharts, Axios, PapaParse, jsPDF |
| Backend    | Node.js, Express.js, Mongoose     |
| Autenticación | JWT (jsonwebtoken), bcryptjs    |
| Base de datos | MongoDB                         |
| Herramientas | Concurrently, Dotenv, Nodemon   |

---

## Estructura del proyecto

```
gestorgastos/
├── client/                          # App React (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx             # Login/Register
│   │   │   ├── Header.jsx
│   │   │   ├── IncomeExpenses.jsx
│   │   │   ├── TransactionList.jsx  # Con edición inline
│   │   │   ├── AddTransaction.jsx
│   │   │   ├── ExpensesChart.jsx
│   │   │   ├── Filters.jsx          # 6 parámetros con debounce
│   │   │   ├── BudgetManager.jsx    # Presupuestos por mes/categoría
│   │   │   ├── Pagination.jsx       # Navegación de páginas
│   │   │   ├── ExportData.jsx       # CSV + PDF
│   │   │   ├── AdvancedCharts.jsx   # Múltiples gráficos
│   │   │   └── ThemeToggle.jsx      # Cambiar tema
│   │   ├── context/
│   │   │   └── ThemeContext.jsx     # Contexto de tema
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   └── package.json
├── server/                          # API Node/Express
│   ├── models/
│   │   ├── User.js                  # Esquema usuario con auth
│   │   ├── Transaction.js           # Esquema transacción con userId
│   │   └── Budget.js                # Esquema presupuestos
│   ├── middleware/
│   │   └── auth.js                  # JWT verification
│   ├── routes/
│   │   ├── auth.js                  # POST /register, /login
│   │   ├── transactions.js          # CRUD con filtros + paginación
│   │   └── budgets.js               # CRUD presupuestos
│   ├── index.js                     # Entrada del servidor
│   ├── .env                         # Variables de entorno
│   └── package.json
├── CHANGELOG_IMPLEMENTACIONES_v2.md # Detalle técnico de features
├── GUIA_NUEVAS_FUNCIONALIDADES.md   # Guía de usuario
├── package.json                     # Scripts para correr ambos servicios
└── README.md
```

---

## Requisitos previos

- **Node.js** (v18 o superior recomendado)
- **MongoDB** instalado y en ejecución, o una URI remota (ej. MongoDB Atlas)

---

## Instalación

1. Clonar el repositorio y entrar a la carpeta:

   ```bash
   git clone <url-del-repo>
   cd gestorgastos
   ```

2. Instalar dependencias de la raíz (para el script `dev`):

   ```bash
   npm install
   ```

3. Instalar dependencias del backend:

   ```bash
   cd server
   npm install
   ```

4. Crear el archivo de entorno en `server/.env`:

   ```bash
   MONGO_URI=mongodb://localhost:27017/expense-tracker
   PORT=5000
   JWT_SECRET=tu_secreto_super_seguro_aqui
   ```

   Si usás MongoDB Atlas, reemplazá `MONGO_URI` por la cadena de conexión del cluster.

5. Instalar dependencias del frontend:

   ```bash
   cd ../client
   npm install
   ```

---

## Cómo usarlo

### Desarrollo (client + server a la vez)

Desde la **raíz** del proyecto:

```bash
npm run dev
```

- **Backend**: http://localhost:5000  
- **Frontend**: http://localhost:5173  

El frontend ya está configurado para hablar con la API en `http://localhost:5000`.

### Solo backend o solo frontend

```bash
npm run server   # solo API (puerto 5000)
npm run client   # solo React (puerto 5173)
```

### Producción

- **Backend**: en `server/` usar `npm start` (o un proceso manager como PM2).
- **Frontend**: en `client/` ejecutar `npm run build` y servir la carpeta `dist/` con Nginx, Vercel, etc.

---

## Documentación Completa

Para detalles de cada feature implementada, consulta:

- **[CHANGELOG_IMPLEMENTACIONES_v2.md](./CHANGELOG_IMPLEMENTACIONES_v2.md)** - Detalle técnico de todas las features
- **[GUIA_NUEVAS_FUNCIONALIDADES.md](./GUIA_NUEVAS_FUNCIONALIDADES.md)** - Guía de usuario para las nuevas funcionalidades

---

## API Endpoints

### Autenticación
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
```

### Transacciones
```
GET    /api/v1/transactions?page=1&limit=20&filters...
POST   /api/v1/transactions
PUT    /api/v1/transactions/:id
DELETE /api/v1/transactions/:id
```

### Presupuestos
```
GET    /api/v1/budgets?month=2024-01
POST   /api/v1/budgets
PUT    /api/v1/budgets/:id
DELETE /api/v1/budgets/:id
```

### Modelos de datos

#### User
| Campo     | Tipo   | Descripción          |
|-----------|--------|----------------------|
| `name`    | String | Nombre del usuario   |
| `email`   | String | Email único          |
| `password`| String | Hash bcryptjs        |

#### Transaction
| Campo     | Tipo   | Descripción                          |
| --------- | ------ | ------------------------------------ |
| `userId`  | ObjectId | Propietario de la transacción      |
| `text`    | String | Descripción                          |
| `amount`  | Number | Positivo = ingreso, Negativo = gasto |
| `category`| String | Comida, Transporte, Entretenimiento, Salud, Otros, Casa |
| `date`    | Date   | Fecha de la transacción              |

#### Budget
| Campo     | Tipo   | Descripción                          |
| --------- | ------ | ------------------------------------ |
| `userId`  | ObjectId | Propietario del presupuesto        |
| `category`| String | Categoría del presupuesto            |
| `limit`   | Number | Límite de gasto                      |
| `month`   | String | Formato YYYY-MM                      |

---

## Status de Implementación

### ✅ Completado (v2.0)

- [x] **Autenticación**: Registro, login, logout con JWT (30 días)
- [x] **Multi-usuario**: Aislamiento de datos por usuario
- [x] **Filtros avanzados**: 6 parámetros (búsqueda, categoría, montos, fechas) con debounce
- [x] **Edición de transacciones**: PUT endpoint + UI inline con save/cancel
- [x] **Presupuestos**: Crear, editar, eliminar presupuestos mensuales por categoría
- [x] **Paginación**: 10/20/50/100 items por página con navegación inteligente
- [x] **Exportar datos**: CSV (papaparse) y PDF (jsPDF) profesional
- [x] **Gráficos avanzados**: Pie chart, líneas, barras y estadísticas generales
- [x] **Modo oscuro/claro**: Tema persistente con icono toggle

### 📋 Próximas versiones

- [ ] **PWA**: Progressive Web App, offline support, instalable
- [ ] **Notificaciones**: Push cuando se excede presupuesto
- [ ] **Tests**: Jest (backend) + React Testing Library (frontend)
- [ ] **CI/CD**: GitHub Actions para deploy automático
- [ ] **TypeScript**: Migración gradual a TypeScript
- [ ] **GraphQL**: Alternativa a REST API (opcional)
- [ ] **Reportes avanzados**: Gráficos personalizables por período
- [ ] **Mobile app**: React Native version

---

## Características implementadas

### Seguridad 🔒
- Contraseñas hasheadas con bcryptjs (10 salt rounds)
- JWT con expiración de 30 días
- Validación de permisos en cada endpoint
- Headers CORS configurados

### Rendimiento ⚡
- Debounce de 500ms en filtros para evitar requests innecesarios
- Paginación para limitar datos transferidos
- Índices en MongoDB para queries rápidas
- Caché del tema en localStorage

### UX/UI 🎨
- Interfaz responsive (mobile, tablet, desktop)
- Tema oscuro/claro automático
- Animaciones suaves con Tailwind CSS
- Validación en tiempo real
- Mensajes de error y éxito claros
- Barras de progreso para presupuestos
- Tooltips informativos

### Datos 📊
- Pie chart de distribución de gastos
- Gráfico de líneas para tendencias mensuales
- Gráfico de barras para comparativas
- Estadísticas generales (totales, promedios)
- Exportación a múltiples formatos

---

## Contribuir

Las contribuciones son bienvenidas. Para cambios grandes, abre un issue primero para discutir qué cambiarías.

1. Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abre un Pull Request

---

## Licencia

MIT - Siéntete libre de usar este proyecto como base para tus propias apps.

---

## Roadmap

Versiones futuras dependerán de:
- Feedback de usuarios
- Nuevas features sugeridas
- Mejoras de performance
- Actualizaciones de dependencias

**Última actualización**: Diciembre 2024  
**Versión actual**: 2.0 - Feature Complete

