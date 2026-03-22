# Personal Expense Tracker - Backend API

API REST para gestionar gastos personales, presupuestos y dashboards. Construido con Node.js, Express, MongoDB y JWT.

## Características

- ✅ Autenticación con JWT
- ✅ CRUD completo de gastos
- ✅ Dashboard con gráficas dinámicas
- ✅ Control de presupuesto mensual
- ✅ Validación de datos con express-validator
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Middleware de manejo de errores

## Instalación

### Opción 1: Local (Node + MongoDB Atlas)

```bash
# Entrar en la carpeta backend
cd backend

# Copiar .env
cp .env.example .env

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# O en producción
npm start
```

### Opción 2: Docker (solo backend)

```bash
# Desde la carpeta backend
cd backend

# Construir e iniciar
docker compose up --build

# O en segundo plano
docker compose up -d --build

# Ver logs
docker compose logs -f backend

# Detener
docker compose down
```

## Configuración de variables

**`.env`**
```
PORT=5000
MONGO_URI=mongodb+srv://test:<db_password>@cluster0test.legic3o.mongodb.net/?appName=Cluster0test
JWT_SECRET=tu_secret_muy_seguro_aqui
JWT_EXPIRES_IN=7d
```

Reemplaza <db_password> por la contraseña real del usuario de Atlas.

## Requisitos

- Node.js 18+
- MongoDB Atlas (cluster con SRV)
- npm o yarn
- Docker + Docker Compose (opcional)

## Docker

### Usar docker-compose del backend

```bash
cd backend
docker compose up --build
```

**Esto levanta:**
- Backend en puerto 5000

**Variables de entorno:**
- Docker Compose carga automáticamente `.env` (con `MONGO_URI`, `JWT_SECRET`, etc.)

Ejemplo de despliegue usando variables del `.env`:

```bash
docker compose up -d --build
```

### Detener containers

```bash
docker compose down        # Detiene y elimina containers
docker compose logs -f     # Ver logs en vivo
```

## Despliegue en AWS Elastic Beanstalk

Para Elastic Beanstalk, configura las variables en el entorno de AWS (no en `.env` del servidor).

Variables mínimas requeridas:

- `MONGO_URI=mongodb+srv://test:<db_password>@cluster0test.legic3o.mongodb.net/?appName=Cluster0test`
- `JWT_SECRET=tu_secret_muy_seguro_aqui`
- `JWT_EXPIRES_IN=7d`

Con EB CLI:

```bash
eb init
eb create expense-tracker-prod
eb setenv MONGO_URI='mongodb+srv://test:<db_password>@cluster0test.legic3o.mongodb.net/?appName=Cluster0test' JWT_SECRET='tu_secret_muy_seguro_aqui' JWT_EXPIRES_IN='7d'
eb deploy
```

Notas:

- No subas `.env` a producción.
- La app usa `process.env`, así que quedará conectada automáticamente a Atlas en cada deploy.

## Endpoints

### Autenticación

#### Registrar usuario

**POST** `/api/auth/register`

Request body:
```json
{
  "name": "Juan Perez",
  "email": "juan@example.com",
  "password": "SecurePass123!"
}
```

Response (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Juan Perez",
    "email": "juan@example.com",
    "createdAt": "2026-03-01T10:30:00Z"
  }
}
```

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Perez",
    "email": "juan@example.com",
    "password": "SecurePass123!"
  }'
```

---

#### Iniciar sesión

**POST** `/api/auth/login`

Request body:
```json
{
  "email": "juan@example.com",
  "password": "SecurePass123!"
}
```

Response (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Juan Perez",
    "email": "juan@example.com",
    "createdAt": "2026-03-01T10:30:00Z"
  }
}
```

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "SecurePass123!"
  }'
```

---

### Gastos

Todos los endpoints de gastos requieren autenticación JWT.

**Header requerido:**
```
Authorization: Bearer <tu_token_aqui>
```

#### Obtener gastos (con filtros opcionales)

**GET** `/api/expenses?category=Food&from=2026-03-01&to=2026-03-31`

Response (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "amount": 45.50,
    "category": "Food",
    "description": "Almuerzo en restaurante",
    "date": "2026-03-01T12:00:00Z",
    "createdAt": "2026-03-01T12:30:00Z"
  }
]
```

**Ejemplo cURL:**
```bash
curl -X GET "http://localhost:5000/api/expenses?category=Food" \
  -H "Authorization: Bearer tu_token_aqui"
```

---

#### Crear gasto

**POST** `/api/expenses`

Request body:
```json
{
  "amount": 45.50,
  "category": "Food",
  "description": "Almuerzo en restaurante",
  "date": "2026-03-01"
}
```

Response (201):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "user": "507f1f77bcf86cd799439011",
  "amount": 45.50,
  "category": "Food",
  "description": "Almuerzo en restaurante",
  "date": "2026-03-01T00:00:00Z",
  "createdAt": "2026-03-01T12:30:00Z"
}
```

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer tu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 45.50,
    "category": "Food",
    "description": "Almuerzo en restaurante",
    "date": "2026-03-01"
  }'
```

---

#### Actualizar gasto

**PUT** `/api/expenses/:id`

Request body (mismo que crear):
```json
{
  "amount": 50.00,
  "category": "Food",
  "description": "Almuerzo actualizado",
  "date": "2026-03-01"
}
```

**Ejemplo cURL:**
```bash
curl -X PUT http://localhost:5000/api/expenses/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer tu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "category": "Food",
    "description": "Almuerzo actualizado",
    "date": "2026-03-01"
  }'
```

---

#### Eliminar gasto

**DELETE** `/api/expenses/:id`

Response (200):
```json
{
  "message": "Expense deleted"
}
```

**Ejemplo cURL:**
```bash
curl -X DELETE http://localhost:5000/api/expenses/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer tu_token_aqui"
```

---

### Dashboard

#### Obtener datos del dashboard

**GET** `/api/dashboard`

Response (200):
```json
{
  "monthlyTotal": 250.75,
  "byCategory": [
    { "category": "Food", "total": 120.50 },
    { "category": "Transport", "total": 80.25 },
    { "category": "Entertainment", "total": 50.00 }
  ],
  "monthlyComparison": [
    { "year": 2026, "month": 1, "total": 200.00 },
    { "year": 2026, "month": 2, "total": 250.75 }
  ]
}
```

**Ejemplo cURL:**
```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer tu_token_aqui"
```

---

### Presupuesto

#### Obtener presupuesto actual

**GET** `/api/budget/current`

Response (200):
```json
{
  "budget": {
    "_id": "507f1f77bcf86cd799439013",
    "user": "507f1f77bcf86cd799439011",
    "month": 3,
    "year": 2026,
    "amount": 500.00
  },
  "spent": 250.75,
  "remaining": 249.25,
  "percentageUsed": 50,
  "exceeded": false
}
```

**Ejemplo cURL:**
```bash
curl -X GET http://localhost:5000/api/budget/current \
  -H "Authorization: Bearer tu_token_aqui"
```

---

#### Crear o actualizar presupuesto

**POST** `/api/budget`

Request body:
```json
{
  "amount": 500.00,
  "month": 3,
  "year": 2026
}
```

Response (201):
```json
{
  "budget": {
    "_id": "507f1f77bcf86cd799439013",
    "user": "507f1f77bcf86cd799439011",
    "month": 3,
    "year": 2026,
    "amount": 500.00
  },
  "spent": 250.75,
  "remaining": 249.25,
  "percentageUsed": 50,
  "exceeded": false
}
```

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:5000/api/budget \
  -H "Authorization: Bearer tu_token_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500.00,
    "month": 3,
    "year": 2026
  }'
```

---

## Flujo de prueba completo

### 1. Registrar usuario

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

Guarda el `token` de la respuesta.

### 2. Crear varios gastos

```bash
TOKEN="tu_token_aqui"

# Gasto 1
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 45.50,
    "category": "Food",
    "description": "Desayuno",
    "date": "2026-03-01"
  }'

# Gasto 2
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.00,
    "category": "Transport",
    "description": "Uber",
    "date": "2026-03-02"
  }'

# Gasto 3
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "category": "Entertainment",
    "description": "Cine",
    "date": "2026-03-03"
  }'
```

### 3. Ver todos los gastos

```bash
curl -X GET http://localhost:5000/api/expenses \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Filtrar gastos por categoría

```bash
curl -X GET "http://localhost:5000/api/expenses?category=Food" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Ver dashboard

```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Crear presupuesto

```bash
curl -X POST http://localhost:5000/api/budget \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500.00,
    "month": 3,
    "year": 2026
  }'
```

### 7. Ver presupuesto actual

```bash
curl -X GET http://localhost:5000/api/budget/current \
  -H "Authorization: Bearer $TOKEN"
```

---

## Estructura de carpetas

```
src/
├── config/
│   └── db.js                 # Conexión MongoDB
├── controllers/
│   ├── authController.js     # Lógica de autenticación
│   ├── expenseController.js  # CRUD de gastos
│   ├── dashboardController.js# Lógica dashboard
│   └── budgetController.js   # Lógica presupuesto
├── middleware/
│   ├── authMiddleware.js     # Validación JWT
│   ├── errorMiddleware.js    # Manejo de errores
│   └── validateRequest.js    # Validación express-validator
├── models/
│   ├── User.js               # Schema usuario
│   ├── Expense.js            # Schema gasto
│   └── Budget.js             # Schema presupuesto
├── routes/
│   ├── authRoutes.js         # Rutas autenticación
│   ├── expenseRoutes.js      # Rutas gastos
│   ├── dashboardRoutes.js    # Rutas dashboard
│   └── budgetRoutes.js       # Rutas presupuesto
├── utils/
│   └── token.js              # Generación JWT
└── server.js                  # Punto de entrada
```

---

## Códigos de estado HTTP

| Código | Significado |
|--------|------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Sin autenticación |
| 404 | Not Found - Recurso no existe |
| 409 | Conflict - Email ya en uso |
| 500 | Server Error - Error interno |

---

## Seguridad

- ✅ JWT en header `Authorization`
- ✅ Passwords encriptados con bcrypt (10 salts)
- ✅ Validación de entrada con express-validator
- ✅ CORS configurado
- ✅ Morgan para logging

---

## Scripts

```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

---

## Autor

Tu Nombre

## Licencia

MIT
