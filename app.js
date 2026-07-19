/**
 * Clase que representa una Tarea individual
 */
class Tarea {
    constructor(id, descripcion, estado = 'pendiente') {
        this.id = id;
        this.descripcion = descripcion;
        this.estado = estado; // 'pendiente' o 'completada'
        this.fechaCreacion = new Date().toLocaleDateString();
    }

    // Método para alternar el estado de la tarea (Arrow function para mantener contexto)
    conmutarEstado = () => {
        this.estado = this.estado === 'pendiente' ? 'completada' : 'pendiente';
    }
}

/**
 * Clase que gestiona el listado y acciones de las tareas
 */
class GestorTareas {
    constructor() {
        this.tareas = [];
    }

    // Agregar una nueva tarea usando el operador Spread para mantener inmutabilidad
    agregarTarea(descripcion) {
        const nuevoId = this.tareas.length > 0 ? Math.max(...this.tareas.map(t => t.id)) + 1 : 1;
        const nuevaTarea = new Tarea(nuevoId, descripcion);
        this.tareas = [...this.tareas, nuevaTarea];
        return nuevaTarea;
    }

    // Eliminar tarea mediante filtrado
    eliminarTarea(id) {
        this.tareas = this.tareas.filter(tarea => tarea.id !== id);
    }

    // Cambiar estado de una tarea específica buscando por ID
    cambiarEstadoTarea(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.conmutarEstado();
        }
    }

    // Obtener métricas rápidas usando Desestructuración
    obtenerMetricas() {
        const completadas = this.tareas.filter(t => t.estado === 'completada').length;
        const pendientes = this.tareas.length - completadas;
        return { completadas, pendientes, total: this.tareas.length };
    }
}

// Instanciación global para usar en los siguientes pasos
const gestor = new GestorTareas();
/* ==========================================================================
   PASO 3: EVENTOS Y MANIPULACIÓN DEL DOM
   ========================================================================== */

// 1. Referencias a los elementos del DOM
const formTarea = document.getElementById('form-tarea');
const inputTarea = document.getElementById('input-tarea');
const listaTareas = document.getElementById('lista-tareas');

/**
 * Renderiza el listado completo de tareas en el DOM
 */
const renderizarTareas = () => {
    // Limpiamos la lista para evitar duplicados
    listaTareas.innerHTML = '';

    // Iteramos el arreglo del gestor utilizando sintaxis moderna
    gestor.tareas.forEach(({ id, descripcion, estado, fechaCreacion }) => {
        const li = document.createElement('li');
        
        // Aplicamos clases dinámicas usando Template Literals
        li.className = `tarea-item ${estado === 'completada' ? 'completada' : ''}`;
        li.setAttribute('data-id', id);

        // Estructura interna de cada tarea
        li.innerHTML = `
            <span class="tarea-texto">${descripcion} <small style="color: var(--texto-secundario)">(${fechaCreacion})</small></span>
            <div class="tarea-acciones">
                <button class="btn-accion btn-completar">${estado === 'completada' ? 'Deshacer' : 'Completar'}</button>
                <button class="btn-accion btn-eliminar">Eliminar</button>
            </div>
        `;

        // --- Evento de Mouseover (Requerimiento de Rúbrica) ---
        // Genera un sutil cambio visual temporal al pasar el cursor sobre la tarea
        li.addEventListener('mouseover', () => {
            li.style.backgroundColor = '#f0f4f8';
        });
        li.addEventListener('mouseout', () => {
            li.style.backgroundColor = '';
        });

        listaTareas.appendChild(li);
    });
};

// MODIFICACIÓN DEL PASO 3 PARA INTEGRAR EL PASO 4
formTarea.addEventListener('submit', (evento) => {
    evento.preventDefault();
    
    const descripcion = inputTarea.value.trim();
    if (descripcion) {
        // En lugar de guardar directo, llamamos a la función asíncrona simulada
        agregarTareaAsincrona(descripcion);
        formTarea.reset();
    }
});

// 3. Evento de Clic en la Lista (Delegación de Eventos)
listaTareas.addEventListener('click', (evento) => {
    const tarjetaTarea = evento.target.closest('.tarea-item');
    if (!tarjetaTarea) return;
    
    const idTarea = parseInt(tarjetaTarea.getAttribute('data-id'), 10);

    if (evento.target.classList.contains('btn-completar')) {
        gestor.cambiarEstadoTarea(idTarea);
        renderizarTareas();
        guardarEnLocalStorage();
    }

    if (evento.target.classList.contains('btn-eliminar')) {
        gestor.eliminarTarea(idTarea);
        renderizarTareas();
        guardarEnLocalStorage();
    }
});

// 4. Evento de Teclado (Keyup) en el Input (Requerimiento de Rúbrica)
inputTarea.addEventListener('keyup', (evento) => {
    if (inputTarea.value.length > 40) {
        inputTarea.style.borderColor = 'var(--color-peligro)';
    } else {
        inputTarea.style.borderColor = 'var(--color-primario)';
    }
});
/* ==========================================================================
   PASO 4: JAVASCRIPT ASÍNCRONO
   ========================================================================== */

// Referencia al contenedor de notificaciones en el DOM
const nodoNotificacion = document.getElementById('notificacion');
const nodoContador = document.getElementById('contador-regresivo');

/**
 * Muestra una notificación flotante en pantalla que desaparece tras 2 segundos
 * (Requerimiento: Función que muestre una notificación tras 2 segundos)
 * @param {string} mensaje - Texto a mostrar
 */
const mostrarNotificacion = (mensaje) => {
    nodoNotificacion.textContent = mensaje;
    nodoNotificacion.classList.remove('oculto');

    // Desaparece automáticamente después de 2000 milisegundos (2 segundos)
    setTimeout(() => {
        nodoNotificacion.classList.add('oculto');
    }, 2000);
};

/**
 * Simula un retraso de red al guardar/procesar una tarea en un servidor remoto
 * (Requerimiento: Simular un retardo al agregar una tarea con setTimeout)
 * @param {string} descripcion - Texto de la tarea
 */
const agregarTareaAsincrona = (descripcion) => {
    mostrarNotificacion("Conectando con el servidor...");
    
    // El setTimeout le da el retardo exigido en el Paso 4 antes de invocar la API
    setTimeout(async () => {
        await sincronizarNuevaTareaConAPI(descripcion);
    }, 1500);
};

/**
 * Crea un contador regresivo para la sesión o expiración del gestor
 * (Requerimiento: Crear un contador regresivo usando setInterval)
 */
const iniciarContadorRegresivo = () => {
    let tiempoRestante = 600; // 10 minutos expresados en segundos

    const intervalo = setInterval(() => {
        const minutos = Math.floor(tiempoRestante / 60);
        let segundos = tiempoRestante % 60;

        // Formateo de segundos menores a 10 (ej: 09, 08...)
        segundos = segundos < 10 ? `0${segundos}` : segundos;

        // Renderizamos en pantalla usando Template Literals
        nodoContador.textContent = `${minutos}:${segundos}`;

        if (tiempoRestante <= 0) {
            clearInterval(intervalo);
            nodoContador.textContent = "Expirado";
            mostrarNotificacion("La sesión de trabajo ha terminado.");
        }

        tiempoRestante--;
    }, 1000); // Se ejecuta cada segundo
};

// Iniciamos el contador automáticamente al cargar la aplicación
iniciarContadorRegresivo();
/* ==========================================================================
   PASO 5: CONSUMO DE APIS Y PERSISTENCIA (LOCALSTORAGE)
   ========================================================================== */

// URL de la API de pruebas (Servicio REST confiable para simular peticiones POST/GET)
const API_URL = 'https://typicode.com';

/**
 * Guarda el arreglo de tareas actual en el almacenamiento del navegador (localStorage)
 */
const guardarEnLocalStorage = () => {
    localStorage.setItem('taskflow_tareas', JSON.stringify(gestor.tareas));
};

/**
 * Carga e inserta las tareas que el usuario dejó guardadas localmente en su navegador
 */
const cargarDesdeLocalStorage = () => {
    const datosLocales = localStorage.getItem('taskflow_tareas');
    if (datosLocales) {
        // Convertimos el JSON string de vuelta a objetos puros
        const tareasParseadas = JSON.parse(datosLocales);
        
        // Rehidratamos la lista del gestor convirtiendo los datos a instancias de la clase Tarea
        gestor.tareas = tareasParseadas.map(t => new Tarea(t.id, t.descripcion, t.estado));
        renderizarTareas();
    }
};

/**
 * Obtiene un listado inicial de tareas desde una API externa usando Fetch
 * (Requerimiento: Uso de try/catch para manejo de errores en peticiones asíncronas)
 */
const cargarTareasDesdeAPI = async () => {
    try {
        mostrarNotificacion("Descargando tareas externas...");
        const respuesta = await fetch(`${API_URL}?_limit=3`); // Limitamos a 3 tareas de ejemplo
        
        if (!respuesta.ok) {
            throw new Error(`Error en el servidor: ${respuesta.status}`);
        }

        const datosApi = await respuesta.json();
        
        // Mapeamos los datos de la API externa a la estructura de nuestra clase Tarea
        datosApi.forEach(item => {
            gestor.agregarTarea(item.title);
        });

        renderizarTareas();
        guardarEnLocalStorage();
        mostrarNotificacion("¡Tareas externas cargadas con éxito!");
    } catch (error) {
        console.error("Detalle del error al conectar con la API:", error);
        mostrarNotificacion("No se pudo conectar con la API. Usando datos locales.");
    }
};

/**
 * Simula el envío de una nueva tarea hacia el servidor mediante el método POST de Fetch
 * @param {string} descripcion - El texto ingresado por el usuario
 */
const sincronizarNuevaTareaConAPI = async (descripcion) => {
    try {
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                title: descripcion,
                completed: false,
                userId: 1
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo registrar la tarea en la nube.");
        }

        // Si la API responde con éxito, guardamos de manera definitiva a nivel local
        gestor.agregarTarea(descripcion);
        renderizarTareas();
        guardarEnLocalStorage();
        mostrarNotificacion("¡Tarea guardada y sincronizada en la nube!");
    } catch (error) {
        console.error("Error de sincronización:", error);
        mostrarNotificacion("Error de red. Tarea guardada solo localmente.");
        
        // Fallback: Si el servidor falla, la guardamos de todas formas de manera local
        gestor.agregarTarea(descripcion);
        renderizarTareas();
        guardarEnLocalStorage();
    }
};
// ==========================================================================
// DISPARADOR INICIAL (Paso 5)
// ==========================================================================
// Al iniciar la app: Priorizar datos de LocalStorage. Si está vacío, traer de la API.
if (localStorage.getItem('taskflow_tareas')) {
    cargarDesdeLocalStorage();
} else {
    cargarTareasDesdeAPI();
}