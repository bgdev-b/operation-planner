# Operation Planner Backend

API backend para la gestión de asignaciones de tareas y recursos con validación de conflictos.

## Características

- ✅ Gestión de tareas y recursos
- ✅ Asignación inteligente de recursos a tareas
- ✅ Validación de disponibilidad de recursos
- ✅ Detección de conflictos de solapamiento
- ✅ Persistencia en base de datos SQLite
- ✅ API REST con Express.js
- ✅ TypeScript para seguridad de tipos
- ✅ Suite de pruebas unitarias

## Prerequisites

- Node.js 16+
- npm o yarn

## Instalación

```bash
npm install
```

## Desarrollo

Compilar TypeScript:

```bash
npm run build
```

Ejecutar en modo desarrollo:

```bash
npm start
```

## Testing

Ejecutar las pruebas unitarias:

```bash
npm test
```

## Estructura del Proyecto

```
src/
├── index.ts                    # Punto de entrada
├── domain/                     # Lógica de negocio
│   ├── models/                # Tipos y interfaces
│   ├── db/                    # Acceso a datos
│   ├── http/                  # Rutas y DTOs
│   └── __tests__/            # Pruebas unitarias
```

## API Endpoints

### Assignments
- `POST /assignments` - Crear nueva asignación
- `GET /assignments` - Listar asignaciones
- `GET /assignments/:id` - Obtener asignación específica

### Resources
- `GET /resources` - Listar recursos disponibles
- `GET /resources/:id` - Obtener recurso específico

## Validaciones

El sistema realiza las siguientes validaciones:

1. **Disponibilidad de Recursos**: Verifica que el recurso esté disponible en la fecha de la tarea
2. **Solapamiento de Tareas**: Detecta si el recurso ya tiene asignaciones en ese período
3. **Reglas de Negocio**: Valida reglas específicas de asignación

## Tecnologías

- **TypeScript** - Lenguaje de programación tipado
- **Express.js** - Framework web
- **SQLite** - Base de datos
- **Jest** - Framework de testing

## Licencia

MIT
