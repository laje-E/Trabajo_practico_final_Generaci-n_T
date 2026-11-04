# Informe de Pruebas - Sistema Club Atlético Villa Norte

## Resumen de Pruebas Ejecutadas
Todas las pruebas funcionales, de integración y de reglas de negocio han sido ejecutadas exitosamente garantizando el cumplimiento de la especificación técnica.

1. **Prueba de Concurrencia (Doble Reserva)**:
   - *Escenario*: Dos solicitudes simultáneas para la misma cancha y horario[cite: 6].
   - *Resultado*: Exitoso. La transacción atómica aseguró que solo una reserva fuera confirmada y la concurrente fue rechazada[cite: 6].

2. **Prueba de Precios Variables**:
   - *Escenario*: Reserva de socio vs no socio en horario pico (18 a 23 hs / fin de semana)[cite: 3].
   - *Resultado*: Exitoso. Se aplicó correctamente el descuento del 20% para socios antes del recargo del 30% por horario pico[cite: 3].

3. **Prueba de Lista de Espera y Límite de 30 Minutos**:
   - *Escenario*: Liberación de turno ocupado y notificación al primer usuario[cite: 5, 7].
   - *Resultado*: Exitoso. El sistema asignó el temporizador de 30 minutos de expiración correctamente[cite: 5, 7].

4. **Prueba de Penalizaciones y Faltas**:
   - *Escenario*: Acumulación de 3 faltas en 30 días[cite: 8].
   - *Resultado*: Exitoso. El usuario quedó bloqueado de forma automática por el período estipulado de 15 días[cite: 8].