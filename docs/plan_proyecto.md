# Plan de Proyecto - Club Atlético Villa Norte

## 1. Objetivo del Proyecto
Desarrollar un sistema web integral para la gestión de turnos y canchas del Club Atlético Villa Norte, resolviendo la problemática operativa inicial mediante reglas de negocio automatizadas, precios variables, control de concurrencia y gestión de penalizaciones[cite: 1, 2, 3, 5, 8].

## 2. Fases del Desarrollo
- **Fase 1**: Configuración inicial del repositorio, entorno y especificaciones técnicas (`spec.md` y `AGENTS.md`)[cite: 1].
- **Fase 2**: Implementación de la base de datos (PostgreSQL/Neon), ORM Prisma y despliegue del backend (Render)[cite: 1].
- **Fase 3**: Codificación de la lógica de negocio (infraestructura de 6 canchas, duraciones, anticipación y límites semanales)[cite: 2, 9].
- **Fase 4**: Resolución de desafíos no triviales (precios variables por horario pico/socio y control de concurrencia para evitar doble reserva)[cite: 3, 6].
- **Fase 5**: Automatización de lista de espera con límite de confirmación de 30 minutos[cite: 5, 7].
- **Fase 6**: Gestión de cancelaciones (sin cargo o con penalización del 50%) y faltas acumuladas con bloqueo automático[cite: 8].
- **Fase 7**: Panel de administración y gestión de mantenimiento con reservas activas afectadas[cite: 6].
- **Fase 8**: Desarrollo del frontend completo y despliegue público (Netlify)[cite: 1].
- **Fase 9**: Pruebas automatizadas, documentación final y entrega en el campus[cite: 1].