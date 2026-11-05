// URL del backend desplegado en Render (sin barra final)
const API_URL = 'https://trabajo-practico-final-generacion-t.onrender.com';

// Render (plan gratuito) duerme el servicio tras inactividad:
// la primera petición puede tardar ~50 segundos.
const TIMEOUT_MS = 60000;

async function fetchConTimeout(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

// Verificar estado del backend
document.getElementById('btnCheck').addEventListener('click', async () => {
    const output = document.getElementById('statusOutput');
    output.textContent = 'Conectando con el servidor (puede tardar hasta 1 minuto si estaba dormido)...';
    try {
        const response = await fetchConTimeout(`${API_URL}/health`);
        const data = await response.json();
        output.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        output.textContent = error.name === 'AbortError'
            ? 'Error: el servidor tardó demasiado en responder.'
            : `Error de conexión: ${error.message}`;
    }
});

// Enviar formulario de reserva
document.getElementById('reservaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const output = document.getElementById('reservaOutput');

    const usuarioId = document.getElementById('usuarioId').value.trim();
    const canchaId = document.getElementById('canchaId').value.trim();
    const fechaInicio = document.getElementById('fechaInicio').value;

    if (!usuarioId || !canchaId || !fechaInicio) {
        output.textContent = 'Completá todos los campos.';
        return;
    }

    output.textContent = 'Procesando reserva...';

    try {
        const response = await fetchConTimeout(`${API_URL}/api/reservas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuarioId,
                canchaId,
                // El input datetime-local no trae zona horaria; lo enviamos en ISO UTC
                fechaInicio: new Date(fechaInicio).toISOString()
            })
        });

        // Si el servidor devuelve algo que no es JSON, no rompe
        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            output.textContent = `¡Éxito!\n${JSON.stringify(data, null, 2)}`;
        } else {
            output.textContent = `Error de Negocio:\n${data.error || JSON.stringify(data)}`;
        }
    } catch (error) {
        output.textContent = error.name === 'AbortError'
            ? 'Error: el servidor tardó demasiado en responder.'
            : `Error de red: ${error.message}`;
    }
});