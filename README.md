# Red Social - Backend (WIP)

Este proyecto es un backend en Node.js/TypeScript con Express y Prisma.  
Estoy en etapa de pruebas y refactor; se vienen mejoras y nuevas funcionalidades.

## Estado
- En desarrollo (WIP)
- Endpoints y estructura en evolución

## Requisitos
- Node.js (18+ recomendado)
- Base de datos PostgreSQL

## Configuración rápida
1. Crear un archivo `.env` con la variable:
   - `DATABASE_URL=...`
2. Instalar dependencias:
   - `npm install`
3. Ejecutar migraciones y generar cliente (si aplica):
   - `npx prisma migrate dev`

## Notas
- La API y la estructura pueden cambiar.
- Se agregarán validaciones, seguridad (hash de password) y tests.
