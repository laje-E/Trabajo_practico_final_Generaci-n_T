# Especificación Técnica y Reglas de Negocio - Club Atlético Villa Norte

## 1. Infraestructura y Horarios del Club
- **REGLA-1.1**: El club cuenta con una infraestructura de 6 canchas en total: 2 canchas de fútbol 5, 3 canchas de pádel y 1 cancha de tenis[cite: 1, 2].
- **REGLA-1.2**: El establecimiento se encuentra abierto todos los días de la semana, en el horario de 8:00 a 24:00 horas, sin excepción[cite: 9].

## 2. Duración de los Turnos por Deporte
- **REGLA-2.1**: Los turnos para **Fútbol 5** tienen una duración fija de **60 minutos**[cite: 9].
- **REGLA-2.2**: Los turnos para **Pádel** y **Tenis** tienen una duración fija de **90 minutos**[cite: 9].

## 3. Anticipación y Límites de Reserva
- **REGLA-3.1**: Los usuarios **Socios** pueden realizar reservas con una anticipación máxima de hasta **7 días**. Los **No Socios** tienen un límite de anticipación de hasta **3 días**[cite: 9].
- **REGLA-3.2**: Los usuarios **Socios** disponen de un límite semanal de máximo **2 reservas activas** en simultáneo. Los **No Socios** pueden tener como máximo **1 reserva activa** a la vez[cite: 9].

## 4. Política de Precios Variables
- **REGLA-4.1**: El precio del turno se calcula combinando tres factores: el deporte seleccionado, el horario y la categoría del usuario (socio o no socio)[cite: 3, 6].
- **REGLA-4.2**: Se considera **Horario Pico** el rango comprendido entre las **18:00 y las 23:00 horas**, así como los días **fines de semana**. En estos bloques, el turno posee un recargo del **30%** sobre su valor base[cite: 3].
- **REGLA-4.3**: Los usuarios **Socios** obtienen un **20% de descuento** sobre el precio base del turno (este descuento se aplica antes de calcular el recargo por horario pico)[cite: 3].

## 5. Manejo de Concurrencia y Doble Reserva
- **REGLA-5.1**: Si dos usuarios intentan reservar exactamente la misma cancha y el mismo horario de manera simultánea, el sistema garantizará mediante transacciones atómicas que **solo una reserva sea exitosa**, rechazando la concurrente[cite: 6].

## 6. Lista de Espera Automatizada
- **REGLA-6.1**: Cuando un turno se encuentra ocupado, cualquier usuario interesado puede anotarse en la **lista de espera** correspondiente[cite: 5, 7].
- **REGLA-6.2**: Al liberarse un turno, el sistema notificará de forma automática al primer usuario en la cola de espera[cite: 5, 7].
- **REGLA-6.3**: El usuario notificado dispone de un **límite estricto de 30 minutos** para confirmar su reserva. Si el plazo expira sin confirmación, el sistema ofrecerá automáticamente el turno al siguiente usuario en la cola[cite: 5, 7].

## 7. Cancelaciones, Faltas y Penalizaciones
- **REGLA-7.1**: Las cancelaciones realizadas con **más de 24 horas de anticipación** no tienen cargo, y el turno queda libre inmediatamente para otros usuarios[cite: 8].
- **REGLA-7.2**: Las cancelaciones realizadas con **menos de 24 horas de anticipación** (cancelación tardía) incurren en un cargo de penalización equivalente al **50% del valor del turno**[cite: 8].
- **REGLA-7.3**: La no presentación del usuario a un turno reservado sin previo aviso registra una **falta**. Al acumular **3 faltas en un período de 30 días**, el usuario quedará **bloqueado automáticamente** para realizar nuevas reservas por los siguientes **15 días**[cite: 8].

## 8. Mantenimiento de Canchas con Reservas Activas
- **REGLA-8.1**: Si el administrador bloquea una cancha por tareas de mantenimiento y esta posee reservas confirmadas, el sistema deberá notificar automáticamente a los afectados, cancelar los turnos sin penalización y otorgar prioridad de reubicación o crédito a favor.