# 📋 Documentación de Rutas - King Llantas E-commerce

## 🏠 **Rutas Principales**
| Ruta | Método | Descripción | Tipo |
|------|--------|-------------|------|
| `/` | GET | Página principal con productos destacados | Vista |
| `/products` | GET | Lista de productos con paginación y filtros | Vista |
| `/product/:id` | GET | Detalle de producto individual | Vista |
| `/about` | GET | Página "Nosotros" con información de la empresa | Vista |
| `/realtimeproducts` | GET | Panel de administración de productos (solo admin) | Vista |

## 🔐 **Autenticación y Sesiones** (`/api/sessions`)
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/sessions/register` | POST | Registrar nuevo usuario (solo admin) |
| `/api/sessions/login` | POST | Iniciar sesión y generar token JWT |
| `/api/sessions/current` | GET | Obtener datos del usuario autenticado mediante JWT |
| `/api/sessions/logout` | POST | Cerrar sesión actual |

## 🛍️ **API de Productos** (`/api/products`)
| Ruta | Método | Descripción | Parámetros |
|------|--------|-------------|------------|
| `/api/products/home` | GET | Vista principal con productos destacados | - |
| `/api/products/view` | GET | Vista de todos los productos con paginación | - |
| `/api/products/:id/view` | GET | Vista de detalle de producto | - |
| `/api/products` | GET | Lista paginada de productos | `limit`, `page`, `sort`, `query` |
| `/api/products/:id` | GET | Obtener producto por ID | - |
| `/api/products` | POST | Crear nuevo producto (solo admin) | `imagen` (archivo) |
| `/api/products/:id` | PUT | Actualizar producto (solo admin) | - |
| `/api/products/:id` | DELETE | Eliminar producto (solo admin) | - |

## 🛒 **API de Carritos** (`/api/carts`)
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/carts/:cid/view` | GET | Vista del carrito con productos |
| `/api/carts/:cid` | GET | Obtener carrito por ID |
| `/api/carts` | POST | Crear nuevo carrito vacío |
| `/api/carts/:cid/products/:pid` | POST | Agregar producto al carrito |
| `/api/carts/:cid/products/:pid` | PUT | Actualizar cantidad de producto |
| `/api/carts/:cid/products/:pid` | DELETE | Eliminar producto del carrito |
| `/api/carts/:cid` | PUT | Reemplazar todos los productos |
| `/api/carts/:cid` | DELETE | Vaciar carrito completamente |

## 📊 **Respuesta de Paginación**
```json
{
  "status": "success",
  "payload": {
    "docs": [...],
    "totalDocs": 12,
    "limit": 10,
    "totalPages": 2,
    "page": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevPage": null,
    "nextPage": 2
  },
  "nextLink": "http://localhost:8080/api/products?page=2&limit=10"
}

⚙️ Notas Importantes

Las rutas de API devuelven respuestas en JSON

El carrito se asocia automáticamente al usuario autenticado

Los archivos de imagen se guardan en la carpeta /uploads

Las rutas de administración requieren rol admin

Autenticación basada en JWT con Passport


🎯 Flujo de Navegación Recomendado
/ → Inicio con productos destacados

/products → Listado general con filtros

/product/:id → Detalle del producto y opción de agregar al carrito

/api/carts/:cid/view → Ver y gestionar carrito

/realtimeproducts → Panel de administración (solo admin)

🧠 Tecnologías Usadas
Node.js + Express.js – Backend y servidor principal

MongoDB + Mongoose – Base de datos NoSQL

Passport + JWT – Autenticación y manejo de sesiones

Bcrypt – Encriptación de contraseñas

Handlebars – Motor de plantillas para vistas

Multer – Subida de archivos e imágenes

Dotenv – Gestión de variables de entorno

###  **diagrama de flujo jwt**
                ┌──────────────────────────┐
                │        1. LOGIN          │
                │ (email + password)       │
                └─────────────┬────────────┘
                              │ credenciales OK
                              ▼
                ┌──────────────────────────┐
                │   Passport Strategy:     │
                │        "login"           │
                └─────────────┬────────────┘
                              │ devuelve user
                              ▼
                ┌──────────────────────────┐
                │   2. Generar JWT token   │
                │  token = jwt.sign({...}) │
                └─────────────┬────────────┘
                              │
                              ▼
                ┌──────────────────────────┐
                │ CLIENTE GUARDA TOKEN     │
                │ (localStorage, cookie,   │
                │   memoria, etc.)         │
                └─────────────┬────────────┘
                              │
                              │
        ┌─────────────────────┴────────────────────────┐
        │                                              │
        ▼                                              ▼

┌──────────────────────────┐               ┌──────────────────────────┐
│ CLIENTE HACE PETICIÓN    │               │   CLIENTE HACE PETICIÓN  │
│ A RUTA PROTEGIDA:        │               │   A /current:            │
│                           │               │   GET /current           │
│ GET /api/...              │               │ + HEADER:                │
│ HEADERS:                  │               │ Authorization: Bearer ♥  │
│ Authorization: Bearer ♥  │               │                          │
│ (el token)                │               └─────────────┬────────────┘
└──────────────┬───────────┘                             │
               │                                          │ token recibido
               ▼                                          ▼

        ┌──────────────────────────────────────────────────────────┐
        │       3. Passport.authenticate("jwt")                    │
        │----------------------------------------------------------│
        │   ✔ Extrae token del header                              │
        │   ✔ Verifica que sea válido                              │
        │   ✔ Lo decodifica con JWT_SECRET                         │
        │   ✔ Obtiene payload (id, email, role, etc.)              │
        │   ✔ Busca usuario en DB                                  │
        │   ✔ Si existe → mete usuario dentro de req.user         │
        └──────────────┬───────────────────────────────────────────┘
                       │ si el token es correcto
                       ▼

            ┌──────────────────────────┐
            │   4. req.user disponible │
            │   {id, email, role,...}  │
            └─────────────┬────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │   /current responde:     │
            │   { status: success,     │
            │     user: req.user }     │
            └──────────────────────────┘



🚀 Autor
Desarrollado por: Deivy Ramirez— King Llantas E-commerce 2025