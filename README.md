# PerfecT-Shirt

> Plataforma e-commerce especializada en personalización de camisetas con soporte para pujas, subastas y gestión de carrito avanzada.

Este repositorio contiene la aplicación completa (Frontend + Backend) unificada en un solo monorepo para facilitar el desarrollo, despliegue y mantenimiento.

## 📋 Descripción del Proyecto

PerfecT-Shirt es una plataforma integral de e-commerce que permite a los usuarios:
- **Comprar y personalizar camisetas** con diseños únicos
- **Participar en subastas y pujas** sobre productos
- **Gestionar su carrito** con opciones avanzadas
- **Registrarse y gestionar perfiles** personalizados
- **Recibir notificaciones** sobre sus pedidos y pujas
- **Acceder a múltiples idiomas y monedas** según su ubicación

### Características Principales
- 🎨 Sistema de personalización de productos
- 🏪 Gestión completa de tienda (productos, categorías, descuentos)
- 💰 Sistema de pujas y subastas integrado
- 🛒 Carrito persistente y órdenes
- 👥 Gestión de usuarios con roles (clientes, administradores)
- ⭐ Sistema de valoraciones y reseñas
- 🔐 Autenticación segura con JWT (Sanctum)
- 🌍 Soporte multiidioma y multimoneda
- 📧 Notificaciones por email
- 🎟️ Sistema de tickets de soporte
- 📦 Integración con TheSportsDB para datos de equipos

## 🛠 Arquitectura

### Stack Tecnológico
- **Frontend**: HTML5, CSS3, JavaScript Vanilla + Vite
  - Interfaz moderna y responsiva
  - Gestión de estado local con localStorage
  
- **Backend**: Laravel 11
  - API REST con autenticación Sanctum
  - Base de datos relacional (MySQL/PostgreSQL)
  - Ejecutado con Laravel Sail en Docker

- **DevOps**: Docker & Docker Compose
  - Entorno completamente containerizado
  - Facilita la consistencia entre desarrollo y producción

## 🚀 Requisitos Previos

- **Node.js** v18 o superior
- **pnpm** (package manager de Node)
- **Docker** y **Docker Compose** (para el backend de Laravel)
- **Git** (para clonar el repositorio)

### Verificar Requisitos
```bash
node --version      # v18+
pnpm --version      # cualquier versión reciente
docker --version
docker-compose --version
```

## ⚙️ Instalación (Primer Arranque)

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd PerfecT-Shirt
```

### 2. Instalar dependencias de orquestación
```bash
pnpm install
```

### 3. Inicializar el backend (primera vez)
```bash
docker run --rm -v $(pwd)/backend:/app composer install
```

Este comando descarga todas las dependencias de PHP/Laravel necesarias.

### 4. Configurar variables de entorno
Crea un archivo `.env` en la carpeta `backend/` basándote en `.env.example`:
```bash
cd backend
cp .env.example .env
cd ..
```

## 🏃‍♀️ Cómo Ejecutar el Proyecto

### Arranque Rápido (Desarrollo)
Para iniciar tanto el frontend como el backend simultáneamente:
```bash
pnpm run dev
```

**Esto iniciará:**
- 🖼️ **Frontend (Vite)**: `http://localhost:3000`
- ⚙️ **Backend (Laravel Sail)**: `http://127.0.0.1:8000`
- 📊 **Base de Datos (MySQL)**: `localhost:3306`

### Arranque Manual (si lo prefieres)

**Solo Backend:**
```bash
cd backend
./vendor/bin/sail up
```

**Solo Frontend:**
```bash
cd frontend
pnpm run dev
```

## 🗄️ Base de Datos

### Crear Tablas (Migraciones)
```bash
pnpm run migrate
```

### Insertar Datos de Prueba (Seeders)
```bash
pnpm run seed
```

### Recrear Base de Datos Completamente
```bash
pnpm run migrate:fresh
pnpm run seed
```

## 📁 Estructura del Proyecto

```
.
├── backend/                  # Aplicación Laravel
│   ├── app/                 # Código fuente
│   │   ├── Http/            # Controladores y middleware
│   │   ├── Models/          # Modelos Eloquent
│   │   ├── Mail/            # Clases de email
│   │   └── Services/        # Servicios de negocio
│   ├── config/              # Configuraciones
│   ├── database/            # Migraciones y seeders
│   ├── routes/              # Rutas API y web
│   └── docker-compose.yaml  # Configuración Sail
│
├── frontend/                 # Aplicación frontend
│   ├── index.html           # Página principal
│   ├── admin.html           # Panel de administración
│   ├── js/                  # Scripts JavaScript
│   ├── css/                 # Estilos
│   ├── pages/               # Páginas adicionales
│   ├── images/              # Recursos de imagen
│   └── vite.config.js       # Config de build
│
└── package.json             # Scripts de orquestación
```

## 🛑 Detener Servicios

### Detener Solo Backend
```bash
pnpm run stop:backend
```

### Detener Todo
```bash
pnpm run stop
```

## 🔧 Comandos Útiles de Desarrollo

```bash
# Ver logs en tiempo real
pnpm run dev:logs

# Limpiar caché
pnpm run cache:clear

# Ejecutar tests (backend)
cd backend && ./vendor/bin/sail artisan test

# Hacer reset completo de desarrollo
pnpm run fresh
```

## 📚 Endpoints API Principales

El backend expone una API REST en `http://127.0.0.1:8000/api`:

- **Autenticación**: `POST /auth/login`, `POST /auth/register`
- **Productos**: `GET /productos`, `GET /productos/{id}`
- **Carrito**: `GET /carrito`, `POST /carrito/agregar`
- **Pujas**: `GET /pujas`, `POST /pujas/crear`
- **Pedidos**: `GET /pedidos`, `POST /pedidos/crear`
- **Usuarios**: `GET /usuarios/{id}`, `PUT /usuarios/{id}`

Consulta `backend/routes/api.php` para la lista completa.

## 🐛 Troubleshooting

### Puerto 3000 o 8000 en uso
```bash
# Cambiar puertos en los archivos de configuración
# O matar el proceso usando ese puerto
lsof -i :3000
kill -9 <PID>
```

### Base de datos no conecta
```bash
# Verificar que Docker está corriendo y los contenedores activos
docker ps

# Reiniciar servicios
pnpm run stop && pnpm run dev
```

### Permisos de Docker
Si tienes problemas de permisos en Linux, agrega tu usuario al grupo docker:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

## 📝 Licencia

Proyecto desarrollado para uso interno.

_Desarrollado y preparado para trabajar de forma profesional en producción._
