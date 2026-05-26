// Sistema de turnos para alumnos
let turnoActual = 1;
let alumnosRegistrados = JSON.parse(localStorage.getItem('alumnosRegistrados')) || [];

// Inicializar QR
window.onload = function() {
    generarQR();
    actualizarDesdeStorage();
};

function generarQR() {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    
    // Generar URL única para el QR
    const urlBase = window.location.href.split('#')[0];
    const qrData = `${urlBase}?alumno=${Date.now()}`;
    
    // Crear QR
    new QRCode(qrContainer, {
        text: qrData,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

function actualizarDesdeStorage() {
    alumnosRegistrados = JSON.parse(localStorage.getItem('alumnosRegistrados')) || [];
    
    // Calcular el siguiente turno disponible
    if (alumnosRegistrados.length > 0) {
        const ultimoTurno = Math.max(...alumnosRegistrados.map(a => a.turno));
        turnoActual = ultimoTurno + 1;
    } else {
        turnoActual = 1;
    }
    
    // Verificar límite de 100 turnos
    if (turnoActual > 100) {
        mostrarMensaje(' Límite de turnos alcanzado (100)', 'error');
        document.getElementById('registrarBtn').disabled = true;
    }
}

function registrarAlumno() {
    const email = document.getElementById('email').value;
    
    // Validar email institucional
    if (!validarEmail(email)) {
        mostrarMensaje(' Por favor, ingresa un correo institucional válido', 'error');
        return;
    }
    
    // Verificar si el email ya está registrado
    if (alumnosRegistrados.some(a => a.email === email)) {
        mostrarMensaje(' Este correo ya ha sido registrado', 'error');
        return;
    }
    
    // Verificar límite de turnos
    if (turnoActual > 100) {
        mostrarMensaje(' No hay turnos disponibles (máximo 100)', 'error');
        return;
    }
    
    // Registrar alumno
    const nuevoAlumno = {
        turno: turnoActual,
        email: email,
        fechaRegistro: new Date().toISOString(),
        estado: 'pendiente'
    };
    
    alumnosRegistrados.push(nuevoAlumno);
    localStorage.setItem('alumnosRegistrados', JSON.stringify(alumnosRegistrados));
    
    // Mostrar turno asignado
    document.getElementById('turnoNumero').textContent = turnoActual;
    document.getElementById('turnoDisplay').style.display = 'block';
    
    mostrarMensaje(` Registro exitoso! Tu turno es: ${turnoActual}`, 'success');
    
    // Limpiar email
    document.getElementById('email').value = '';
    
    // Enviar correo de confirmación (simulado)
    enviarCorreoConfirmacion(email, turnoActual);
    
    // Actualizar para el siguiente turno
    turnoActual++;
    
    // Generar nuevo QR
    generarQR();
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function mostrarMensaje(texto, tipo) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = texto;
    messageDiv.className = `message ${tipo}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

function enviarCorreoConfirmacion(email, turno) {
    console.log(` CORREO ENVIADO a ${email}: Su turno es #${turno}. Espere a ser llamado.`);
    // En producción, aquí se conectaría con un servicio real de correo
}