# Personal Expense Tracker

MVP de un **rastreador de gastos personales** (Personal Expense Tracker): una aplicación web para registrar ingresos y gastos, ver el balance total y visualizar los gastos por categoría en un gráfico.

---

## ¿Qué hace este proyecto?

- **Registrar transacciones**: agregar ingresos (monto positivo) o gastos (monto negativo) con descripción y categoría.
- **Ver balance**: total de ingresos menos gastos en el header.
- **Resumen**: dos bloques con total de ingresos (verde) y total de gastos (rojo).
- **Lista de transacciones**: últimas transacciones con opción de eliminar.
- **Gráfico de torta**: gastos agrupados por categoría (Recharts).

Todo se persiste en **MongoDB**; el frontend consume una API REST en Node/Express.

---

## Stack tecnológico

| Capa       | Tecnología                          |
| ---------- | ----------------------------------- |
| Frontend   | React 18, Vite, Tailwind CSS, Recharts, Axios |
| Backend    | Node.js, Express.js                 |
| Base de datos | MongoDB (Mongoose)              |
| Herramientas | Concurrently, Dotenv, Nodemon   |

---

## Estructura del proyecto

```
gestorgastos/
├── client/                 # App React (Vite)
│   ├── src/
│   │   ├── components/     # Header, IncomeExpenses, TransactionList, AddTransaction, ExpensesChart
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.cjs
├── server/                 # API Node/Express
│   ├── models/
│   │   └── Transaction.js  # Esquema Mongoose
│   ├── routes/
│   │   └── transactions.js # Rutas CRUD de transacciones
│   ├── index.js            # Entrada del servidor + conexión MongoDB
│   └── .env                # Variables de entorno (no se sube al repo)
├── package.json            # Scripts para correr client + server
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

4. Crear el archivo de entorno en `server/`:

   ```bash
   # Dentro de server/, crear .env con:
   MONGO_URI=mongodb://localhost:27017/expense-tracker
   PORT=5000
   ```

   Si usás MongoDB Atlas, reemplazá `MONGO_URI` por la cadena de conexión que te da el cluster.

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

## API (documentación breve)

Base URL: `http://localhost:5000/api/v1/transactions`

| Método   | Ruta       | Descripción                    |
| -------- | ---------- | ------------------------------ |
| `GET`    | `/`        | Obtener todas las transacciones (ordenadas por fecha descendente) |
| `POST`   | `/`        | Crear una transacción          |
| `DELETE` | `/:id`     | Eliminar una transacción por ID |

### Ejemplo POST (crear transacción)

```json
{
  "text": "Supermercado",
  "amount": -45.50,
  "category": "Comida"
}
```

- `amount` &gt; 0 = ingreso, `amount` &lt; 0 = gasto.  
- `date` es opcional; si no se envía, se usa la fecha actual.

### Respuestas

- Éxito: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "error": "mensaje" }` con código HTTP adecuado (400, 404, 500).

---

## Modelo de datos (Transaction)

| Campo     | Tipo   | Requerido | Descripción                          |
| --------- | ------ | --------- | ------------------------------------ |
| `text`    | String | Sí        | Descripción de la transacción        |
| `amount`  | Number | Sí        | Monto (positivo = ingreso, negativo = gasto) |
| `category`| String | Sí        | Ej: Comida, Transporte, Salario, Ocio |
| `date`    | Date   | No        | Fecha (default: fecha actual)       |

---

## Cambios pensados para el futuro

- **Autenticación**: login/registro (JWT o sesiones) y que cada usuario vea solo sus transacciones.
- **Filtros y búsqueda**: por categoría, rango de fechas y texto.
- **Edición de transacciones**: poder modificar una transacción existente (PUT/PATCH).
- **Paginación**: en la lista de transacciones para muchos registros.
- **Exportar datos**: CSV o PDF para reportes.
- **Presupuestos por categoría**: límites mensuales y alertas al superarlos.
- **Gráficos adicionales**: evolución en el tiempo (líneas/barras) y comparativa mensual.
- **Modo oscuro/claro**: toggle de tema guardado en preferencias.
- **PWA**: instalable y uso offline básico con Service Worker.
- **Tests**: unitarios y de integración (Jest, React Testing Library, Supertest en el backend).

Si querés contribuir, priorizá lo que más te sirva (por ejemplo auth + filtros).

---
