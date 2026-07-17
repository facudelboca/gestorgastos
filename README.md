# Gestor de Gastos - Personal Finance Tracker

Este es un proyecto de portfolio profesional diseñado para demostrar un nivel técnico avanzado utilizando Java 25 y Spring Boot 3.x.

## 📋 Catálogo de Historias de Usuario (MVP)

### US-01: Creación de Cuentas Múltiples
**Como** usuario,  
**quiero** registrar diferentes cuentas financieras (banco, efectivo, billeteras virtuales) con un nombre, un saldo inicial (`balance`) usando `BigDecimal`, y un código de moneda ISO de 3 caracteres (ej: 'ARS', 'USD'),  
**para** trackear mis fondos de forma separada.

### US-02: Registro de Transacciones con Impacto de Saldo
**Como** usuario,  
**quiero** registrar ingresos (`INCOME`) y egresos (`EXPENSE`) asociados a una cuenta y categoría,  
**para** mantener mis saldos actualizados de forma transaccional.  
*Detalles técnicos:*
- El backend maneja el registro mediante `@Transactional`.
- Si la transacción es un `EXPENSE`, se resta del saldo de la cuenta; si es un `INCOME`, se suma.
- No se permiten montos (`amount`) menores o iguales a cero.

### US-03: Historial de Transacciones con Filtros y Paginación
**Como** usuario,  
**quiero** consultar mis movimientos paginados y filtrados opcionalmente por cuenta, categoría y rango de fechas,  
**para** revisar el detalle de mi actividad financiera de forma eficiente.

### US-04: Reporte Mensual por Categoría
**Como** usuario,  
**quiero** ver la sumatoria de mis gastos del mes actual agrupados por categoría y su porcentaje de distribución sobre el total gastado,  
**para** analizar en qué áreas se va mi dinero.

### US-05: Presupuestos Límites Mensuales
**Como** usuario,  
**quiero** establecer un límite de gasto mensual por categoría,  
**para** evitar excederme en mis egresos.  
*Detalles técnicos:*
- Al registrar un gasto en la US-02, el sistema evalúa de forma proactiva si se excedió el límite mensual y retorna el flag `budget_exceeded: true` en la respuesta.

---

## 🔄 Épicas Avanzadas Adicionales

### ÉPICA 4: TRANSFERENCIAS ENTRE CUENTAS Y CONSISTENCIA CONTABLE
#### US-06: Registro de Transferencias Internas
**Como** usuario,  
**quiero** registrar un movimiento de dinero desde una cuenta origen hacia una cuenta destino,  
**para** reflejar mis traspasos de fondos internos sin alterar los reportes globales de gastos.  
*Detalles técnicos:*
- Operación atómica y transaccional mediante `@Transactional`.
- Validación estricta de saldo suficiente en la cuenta de origen.
- Almacenamiento en tabla `transfers` dedicada para auditoría limpia.

### ÉPICA 5: AUTOMATIZACIÓN Y GASTOS FIJOS (RECURRENCIA)
#### US-07: Registro de Suscripciones / Gastos Recurrentes
**Como** usuario,  
**quiero** programar un gasto que se repita automáticamente todos los meses en una fecha fija,  
**para** evitar el registro manual.
#### TASK-07: Motor de Automatización Programado
- Un programador (`@Scheduled`) ejecuta todas las madrugadas un barrido sobre las suscripciones activas vencidas, descontando el saldo de las cuentas respectivas y programando la siguiente ejecución (+1 mes).
- El proceso cuenta con aislamiento de fallas para que un error en una cuenta (ej: saldo insuficiente) no interrumpa el procesamiento del resto.

### ÉPICA 6: METAS DE AHORRO (SAVINGS GOALS)
#### US-08: Gestión de Metas de Ahorro
**Como** usuario,  
**quiero** crear una meta de ahorro especificando un monto objetivo total y una fecha límite,  
**para** separar dinero enfocado en metas específicas.
#### US-09: Asignación de Fondos a Metas
**Como** usuario,  
**quiero** mover dinero de una de mis cuentas físicas hacia una meta de ahorro (saldo lógico virtual),  
**para** acumular fondos que reduzcan mi saldo de cuenta disponible pero incrementen mi avance hacia la meta.

---

## 🔮 Trabajos Futuros y Backlog Avanzado
- **Épica 7: Notificaciones en Tiempo Real (WebSockets / Server-Sent Events):** Notificar de inmediato al cliente en su navegador mediante SSE o WebSockets cuando el motor programado (`@Scheduled`) de cobros automáticos mensuales falle por saldo insuficiente.
- **Épica 8: Motor de Reglas de Categorización Inteligente:** Diseñar un servicio de clasificación que analice la descripción de las transacciones (ej: "Uber" o "Coto") y las asocie automáticamente a la categoría correspondiente sin intervención del usuario.

