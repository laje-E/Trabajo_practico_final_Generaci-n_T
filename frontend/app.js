// Cambiar esta URL por la de tu backend desplegado en Render cuando esté listo
const API_URL = 'http://localhost:4000'; 

// Verificar estado del backend
document.getElementById('btnCheck').addEventListener('click', async () => {
    const output = document.getElementById('statusOutput');
    output.textContent = 'Conectando con el servidor...';
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        output.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        output.textContent = `Error de conexión: ${error.message}`;
    }
});

// Enviar formulario de reserva
document.getElementById('reservaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const output = document.getElementById('reservaOutput');
    
    const usuarioId = document.getElementById('usuarioId').value;
    const canchaId = document.getElementById('canchaId').value;
    const fechaInicio = document.getElementById('fechaInicio').value;

    output.textContent = 'Procesando reserva...';

    try {
        const response = await fetch(`${API_URL}/api/reservas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuarioId, canchaId, fechaInicio })
        });

        const data = await response.json();
        if (response.ok) {
            output.textContent = `¡Éxito!\n${JSON.stringify(data, null, 2)}`;
        } else {
            output.textContent = `Error de Negocio:\n${data.error || JSON.stringify(data)}`;
        }
    } catch (error) {
        output.textContent = `Error de red: ${error.message}`;
    }
});