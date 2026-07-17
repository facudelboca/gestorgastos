# Gestor de Gastos - Personal Finance Tracker

Este proyecto es una aplicación web empresarial para la administración y el control de finanzas personales. Está diseñado bajo una arquitectura robusta, limpia y modular, ideal como portafolio avanzado o proyecto académico.

## 🛠️ Stack Tecnológico

### Backend
- **Lenguaje:** Java 25 (tipado estricto, registros y características modernas).
- **Framework:** Spring Boot 3.x (Spring Security 6.x, Spring Data JPA, Validation).
- **Persistencia:** Hibernate / Jakarta Persistence con base de datos **PostgreSQL 16+**.
- **Seguridad:** Autenticación libre de estado (stateless) mediante **tokens JWT**.
- **Pruebas:** JUnit 5 y Mockito para pruebas unitarias de servicios.

### Frontend
- **Framework:** React + Vite.
- **Estado Global:** Context API de React para gestión de sesiones.
- **Diseño:** Vanilla CSS con un tema plano oscuro estilo Fintech premium de alto contraste (sin dependencias de Tailwindcss ni templates genéricos).

---

## 🚀 Características Clave

1. **Sesión Segura (JWT):** Autenticación de usuarios segura con contraseñas encriptadas mediante `BCrypt` y control de endpoints a través de anotaciones `@AuthenticationPrincipal`.
2. **Multi-moneda Dinámico:** Conversión automática en tiempo real de saldos y reportes consumiendo un servicio externo de tipo de cambio con almacenamiento local en caché de 12 horas.
3. **Categorías Personalizables:** El usuario puede crear sus propias categorías con emojis/íconos que se reflejan de inmediato en todas las operaciones del sistema.
4. **Presupuestos Mensuales:** Límites configurables por categoría que alertan al usuario mediante advertencias visuales proactivas en caso de exceso de gastos.
5. **Débitos Automáticos (Suscripciones):** Planificador en segundo plano (`@Scheduled`) que ejecuta el cobro de suscripciones fijos mensualmente de forma aislada y atómica.
6. **Metas de Ahorro:** Reservas lógicas virtuales (aportes lógicos desde saldos de cuentas físicas reales) con visualización del porcentaje de avance.
7. **Reportes Consolidados:** Conversión y acumulación en memoria de consumos de distintas monedas en una única divisa base para análisis estadísticos exactos.

---

## 📦 Instrucciones de Ejecución

### Prerrequisitos
- JDK 25 instalado.
- Node.js (v18+ recomendado).
- PostgreSQL corriendo localmente en el puerto `5433` (o ajusta las credenciales en `application-local.properties`).

### 1. Servidor Backend (Spring Boot)
1. Navega a la carpeta `/backend`:
   ```bash
   mvn clean compile
   mvn spring-boot:run
   ```
2. El servidor iniciará en `http://localhost:8080`. Se sembrarán datos de demostración automáticamente en el primer arranque.

### 2. Cliente Frontend (React)
1. Navega a la carpeta `/frontend`:
   ```bash
   npm install
   npm run dev
   ```
2. Abre tu navegador en `http://localhost:5173`.

---

## 🔑 Usuario de Demostración y Pruebas

Para evaluar la aplicación de forma inmediata sin configuraciones iniciales manuales, inicia sesión con:
- **Correo de acceso:** `demo@gestorgastos.com`
- **Contraseña:** `password123`

*Nota: Este usuario cuenta con balances de cuentas físicas, metas de ahorro, presupuestos y suscripciones activas listas para probar.*
