# Pautas y Reglas para Agentes (AGENTS.md)

Este documento establece las directrices obligatorias para cualquier asistente de inteligencia artificial o agente automatizado que colabore en el desarrollo, modificación o mantenimiento del proyecto **Club Atlético Villa Norte**.

## 🛡️ Reglas de Comportamiento e Integridad
1. **Respeto estricto de la Especificación (`spec.md`)**: Ninguna regla de negocio descrita en la especificación puede ser omitida o modificada de forma arbitraria. Ante la duda, la regla numerada prevalece.
2. **Seguridad de Secretos**: Está estrictamente prohibido codificar credenciales, claves de API, tokens o cadenas de conexión a bases de datos directamente en el código fuente. Utilizar siempre variables de entorno (`.env`).
3. **Manejo de Concurrencia**: Las operaciones críticas (como la reserva simultánea de canchas) deben implementar mecanismos robustos de control de concurrencia para evitar el fenómeno de "doble reserva".
4. **Commits Atómicos**: Cada tarea completada debe reflejarse en un commit independiente, claro y descriptivo utilizando convenciones estándar (ej. `feat:`, `fix:`, `docs:`).
5. **Calidad de Pruebas**: Toda lógica de negocio implementada debe estar respaldada por sus respectivas pruebas unitarias y de integración que garanticen su correcto funcionamiento.