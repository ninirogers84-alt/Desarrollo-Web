// Sistema de control para profesor
let alumnosRegistrados = JSON.parse(localStorage.getItem('alumnosRegistrados')) || [];
let estadoProfesor = JSON.parse(localStorage.getItem('estadoProfesor')) || {
    listoParaSiguiente: false,
    turnoAtendiendo: 0
};

// Inicializar panel
window.onload = function() {
    actualizarInterfaz();
    actualizarListaAlumnos();
    
    // Control continuo: actualizar cada 5 segundos
    setInterval(() => {
        actualizarDesdeStorage();
        actualizarInterfaz();
        actualizarListaAlumnos();
    }, 5000);
};

function actualizarDesdeStorage() {
    alumnosRegistrados = JSON.parse(localStorage.getItem('alumnosRegistrados')) || [];
    estadoProfesor = JSON.parse(localStorage.getItem('estadoProfesor')) || {
        listoParaSiguiente: false,
        turnoAtendiendo: 0
    };
}

function actualizarInterfaz() {
    const turnoActual = alumnosRegistrados.length > 0 
        ? Math.min(...alumnosRegistrados.filter(a => a.estado === 'pendiente').map(a => a.turno), 1) 
        : 1;
    
    const alumnosEnEspera = alumnosRegistrados.filter(a => a.estado === 'pendiente').length;
    
    document.getElementById('turnoActual').textContent = (turnoActual > 0 && turnoActual <= 100) ? turnoActual : 1;
    document.getElementById('alumnosEspera').textContent = alumnosEnEspera;
    document.getElementById('atendiendoTurno').textContent = estadoProfesor.turnoAtendiendo || 0;
    
    // Actualizar checkbox
    document.getElementById('listoSiguiente').checked = estadoProfesor.listoParaSiguiente;
    
    // Actualizar input de turno a atender
    if (estadoProfesor.turnoAtendiendo) {
        document.getElementById('turnoAtender').value = estadoProfesor.turnoAtendiendo;
    }
}

function actualizarListaAlumnos() {
    const tbody = document.getElementById('listaAlumnos');
    tbody.innerHTML = '';
    
    // Ordenar por turno
    const alumnosOrdenados = [...alumnosRegistrados].sort((a, b) => a.turno - b.turno);
    
    alumnosOrdenados.forEach(alumno => {
        const tr = document.createElement('tr');
        
        let estadoTexto = 'Pendiente';
        let estadoClase = 'en-espera';
        
        if (alumno.estado === 'atendido') {
            estadoTexto = 'Atendido';
            estadoClase = 'atendido';
        } else if (alumno.turno === estadoProfesor.turnoAtendiendo) {
            estadoTexto = 'En curso';
            estadoClase = 'en-curso';
        }
        
        const fecha = new Date(alumno.fechaRegistro);
        const horaFormateada = fecha.toLocaleTimeString();
        
        tr.innerHTML = `
            <td>${alumno.turno}</td>
            <td>${alumno.email}</td>
            <td><span class="${estadoClase}">${estadoTexto}</span></td>
            <td>${horaFormateada}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

function actualizarEstado() {
    const turnoAtender = parseInt(document.getElementById('turnoAtender').value);
    const listoSiguiente = document.getElementById('listoSiguiente').checked;
    
    if (turnoAtender < 1 || turnoAtender > 100) {
        mostrarMensaje('El turno debe estar entre 1 y 100', 'error');
        return;
    }
    
    estadoProfesor = {
        listoParaSiguiente: listoSiguiente,
        turnoAtendiendo: turnoAtender
    };
    
    localStorage.setItem('estadoProfesor', JSON.stringify(estadoProfesor));
    
    // Marcar turno como atendido si el profesor está listo para el siguiente
    if (listoSiguiente) {
        marcarTurnoAtendido(turnoAtender);
    }
    
    mostrarMensaje(' Estado actualizado correctamente', 'success');
    actualizarInterfaz();
    actualizarListaAlumnos();
}

function marcarTurnoAtendido(turno) {
    const alumnoIndex = alumnosRegistrados.findIndex(a => a.turno === turno);
    
    if (alumnoIndex !== -1) {
        alumnosRegistrados[alumnoIndex].estado = 'atendido';
        localStorage.setItem('alumnosRegistrados', JSON.stringify(alumnosRegistrados));
    }
}

function enviarCorreoSiguiente() {
    const siguienteTurno = estadoProfesor.turnoAtendiendo + 1;
    const siguienteAlumno = alumnosRegistrados.find(a => a.turno === siguienteTurno);
    
    if (!siguienteAlumno) {
        mostrarMensaje(' No hay alumnos en el siguiente turno', 'error');
        return;
    }
    
    // Simular envío de correo
    console.log(` CORREO ENVIADO a ${siguienteAlumno.email}: Su turno #${siguienteTurno} está próximo. Diríjase al profesor.`);
    mostrarMensaje(` Correo enviado al turno #${siguienteTurno} (${siguienteAlumno.email})`, 'success');
    
    // Actualizar estado del profesor
    estadoProfesor.listoParaSiguiente = false;
    document.getElementById('listoSiguiente').checked = false;
    localStorage.setItem('estadoProfesor', JSON.stringify(estadoProfesor));
}

function reiniciarTurnos() {
    if (confirm(' ¿Estás seguro de reiniciar todos los turnos? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('alumnosRegistrados');
        localStorage.removeItem('estadoProfesor');
        
        alumnosRegistrados = [];
        estadoProfesor = {
            listoParaSiguiente: false,
            turnoAtendiendo: 0
        };
        
        actualizarInterfaz();
        actualizarListaAlumnos();
        mostrarMensaje('🔄 Sistema de turnos reiniciado correctamente', 'success');
    }
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