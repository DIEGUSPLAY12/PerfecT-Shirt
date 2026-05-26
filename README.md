# PerfecT-Shirt

Este repositorio contiene la aplicación completa (Frontend + Backend) unificada en un solo monorepo para facilitar el desarrollo, despliegue y mantenimiento.

## 🛠 Arquitectura
- **Frontend**: HTML5, CSS3, JS Vanilla. (Servido mediante Vite en desarrollo)
- **Backend**: Laravel 11. (Configurado usando Laravel Sail y Docker)

## 🚀 Requisitos Previos
- Node.js (v18+)
- Docker y Docker Compose (Para el backend de Laravel)

## ⚙️ Instalación (Primer arranque)
1. Instalar las dependencias de orquestación en la raíz:
   ```bash
   pnpm install
   ```
2. Inicializar el backend por primera vez (Solo necesario si no tienes la carpeta `vendor` inicializada):
   ```bash
   docker run --rm -v $(pwd)/backend:/app composer install
   ```

## 🏃‍♀️ Cómo Arrancar el Proyecto
Puedes iniciar ambos servidores al mismo tiempo (tanto frontend como el backend de Sail) usando el script del repositorio raíz:

```bash
pnpm run dev
```
**Esto iniciará:**
- 🖼 Frontend (Vite) en `http://localhost:3000`
- ⚙️ Backend (Laravel Sail) en `http://127.0.0.1:8000`

## 🗄 Migraciones y Base de Datos
Si necesitas recrear la base de datos o insertar datos semilla, puedes ejecutar:
```bash
pnpm run migrate
pnpm run seed
```

## 🛑 Detener los Servicios
```bash
pnpm run stop:backend
```

_Desarrollado y preparado para trabajar de forma profesional en producción._
