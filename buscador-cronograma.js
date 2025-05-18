// buscador-cronograma.js
document.addEventListener('DOMContentLoaded', function() {
  // Crear el contenedor principal del buscador
  const buscadorContainer = document.createElement('div');
  buscadorContainer.className = 'buscador-container';
  
  // Crear el HTML del buscador
  buscadorContainer.innerHTML = `
    <div class="buscador-card">
      <div class="buscador-header">
        <h2 class="buscador-title">Buscador de Cronograma Académico</h2>
        <p class="buscador-description">Encuentra fechas, eventos y actividades del calendario académico 2025</p>
      </div>
      <div class="buscador-content">
        <div class="buscador-input-container">
          <div class="buscador-input-wrapper">
            <input type="search" id="buscador-input" placeholder="Buscar por fecha, evento, categoría..." class="buscador-input">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="buscador-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <button id="buscador-button" class="buscador-button">Buscar</button>
        </div>
        
        <div id="buscador-sugerencias" class="buscador-sugerencias"></div>
        
        <div id="buscador-resultados" class="buscador-resultados">
          <div id="buscador-loading" class="buscador-loading" style="display: none;">
            <div class="buscador-spinner"></div>
          </div>
          <div id="buscador-resultados-lista" class="buscador-resultados-lista"></div>
          <div id="buscador-no-resultados" class="buscador-no-resultados" style="display: none;"></div>
        </div>
      </div>
    </div>
  `;
  
  // Insertar el buscador al principio del contenido principal
  const mainContent = document.querySelector('.buscador-cronograma') || document.querySelector('main');
  if (mainContent) {
    mainContent.insertBefore(buscadorContainer, mainContent.firstChild);
  } else {
    document.body.insertBefore(buscadorContainer, document.body.firstChild);
  }
  
  // Agregar estilos CSS
  const styles = document.createElement('style');
  styles.textContent = `
    .buscador-container {
      width: 100%;
      margin-bottom: 2rem;
    }
    
    .buscador-card {
      background-color: #1d4044;
      border: 1px solid #eee76e;
      border-radius: 0.375rem;
      color: white;
      overflow: hidden;
    }
    
    .buscador-header {
      padding: 1rem;
      border-bottom: 1px solid rgba(238, 231, 110, 0.3);
    }
    
    .buscador-title {
      color: #eee76e;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0 0 0.5rem 0;
    }
    
    .buscador-description {
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
    }
    
    .buscador-content {
      padding: 1rem;
    }
    
    .buscador-input-container {
      display: flex;
      gap: 0.5rem;
    }
    
    .buscador-input-wrapper {
      position: relative;
      flex: 1;
    }
    
    .buscador-input {
      width: 100%;
      padding: 0.5rem 2.5rem 0.5rem 0.75rem;
      background-color: rgba(40, 94, 97, 0.5);
      border: 1px solid rgba(238, 231, 110, 0.5);
      border-radius: 0.25rem;
      color: white;
      font-family: inherit;
    }
    
    .buscador-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
    
    .buscador-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(238, 231, 110, 0.7);
    }
    
    .buscador-button {
      background-color: #eee76e;
      color: #1d4044;
      border: none;
      border-radius: 0.25rem;
      padding: 0.5rem 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .buscador-button:hover {
      background-color: rgba(238, 231, 110, 0.8);
    }
    
    .buscador-sugerencias {
      position: absolute;
      z-index: 10;
      margin-top: 0.25rem;
      width: calc(100% - 2rem - 0.5rem - 80px);
      background-color: #285e61;
      border: 1px solid rgba(238, 231, 110, 0.3);
      border-radius: 0.25rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-height: 15rem;
      overflow-y: auto;
      display: none;
    }
    
    .buscador-sugerencia-item {
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid rgba(238, 231, 110, 0.1);
      cursor: pointer;
    }
    
    .buscador-sugerencia-item:last-child {
      border-bottom: none;
    }
    
    .buscador-sugerencia-item:hover {
      background-color: #234e52;
    }
    
    .buscador-resultados {
      margin-top: 1.5rem;
    }
    
    .buscador-loading {
      display: flex;
      justify-content: center;
      padding: 2rem 0;
    }
    
    .buscador-spinner {
      width: 2rem;
      height: 2rem;
      border: 2px solid rgba(238, 231, 110, 0.3);
      border-top-color: #eee76e;
      border-radius: 50%;
      animation: buscador-spin 1s linear infinite;
    }
    
    @keyframes buscador-spin {
      to { transform: rotate(360deg); }
    }
    
    .buscador-resultados-header {
      color: #eee76e;
      font-size: 1.125rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    
    .buscador-resultados-lista {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .buscador-resultado-card {
      background-color: rgba(40, 94, 97, 0.5);
      border: 1px solid rgba(238, 231, 110, 0.3);
      border-radius: 0.375rem;
      padding: 1rem;
    }
    
    .buscador-resultado-header {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      align-items: center;
    }
    
    .buscador-badge {
      display: inline-flex;
      align-items: center;
      border-radius: 9999px;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: bold;
    }
    
    .buscador-badge-fecha {
      background-color: #eee76e;
      color: #1d4044;
    }
    
    .buscador-badge-periodo {
      background-color: transparent;
      border: 1px solid rgba(238, 231, 110, 0.5);
      color: #eee76e;
    }
    
    .buscador-badge-categoria {
      background-color: #234e52;
      color: white;
    }
    
    .buscador-resultado-titulo {
      font-weight: bold;
      margin: 0.5rem 0;
    }
    
    .buscador-resultado-descripcion {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.875rem;
    }
    
    .buscador-no-resultados {
      text-align: center;
      padding: 2rem 0;
      color: rgba(255, 255, 255, 0.8);
    }
    
    @media (max-width: 768px) {
      .buscador-input-container {
        flex-direction: column;
      }
      
      .buscador-sugerencias {
        width: calc(100% - 2rem);
      }
      
      .buscador-resultado-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `;
  document.head.appendChild(styles);
  
  // Datos de eventos académicos
  const eventosAcademicos = [
    {
      fecha: "3 de febrero",
      titulo: "INICIO DE LAS ACTIVIDADES ACADÉMICAS",
      descripcion: "Comienzo del año académico 2025",
      categoria: "Actividades Académicas",
      periodo: "Inicio del Año",
    },
    {
      fecha: "17 al 21 de febrero",
      titulo: "Período de presentación",
      descripcion: "Presentación de la carrera y actividades de orientación artística profesional para INGRESANTES 2025",
      categoria: "Actividades Académicas",
      periodo: "Inicio del Año",
    },
    {
      fecha: "24 y 25 de febrero",
      titulo: "PERÍODO DE INSCRIPCIÓN A MATERIAS",
      descripcion: "Inscripción a materias anuales y cuatrimestrales",
      categoria: "Inscripciones",
      periodo: "1° Cuatrimestre",
    },
    {
      fecha: "20 y 21 de marzo",
      titulo: "REMANENTE DE INSCRIPCIÓN A MATERIAS",
      descripcion: "Inscripción a materias con cupo remanentes",
      categoria: "Inscripciones",
      periodo: "1° Cuatrimestre",
    },
    {
      fecha: "27 y 28 de febrero",
      titulo: "Inscripción a mesas de examen",
      categoria: "Mesas de Exámenes",
      periodo: "Turno Marzo",
    },
    {
      fecha: "10 al 21 de marzo",
      titulo: "Período de mesas de examen",
      categoria: "Mesas de Exámenes",
      periodo: "Turno Marzo",
    },
    {
      fecha: "31 de marzo",
      titulo: "COMIENZO DE CLASES",
      descripcion: "Inicio del primer cuatrimestre",
      categoria: "Clases",
      periodo: "1° Cuatrimestre",
    },
    {
      fecha: "1 al 15 de abril",
      titulo: "Recepción de solicitud de Equivalencias",
      categoria: "Trámites Académicos",
      periodo: "1° Cuatrimestre",
    },
    {
      fecha: "14 al 18 de julio",
      titulo: "Semana de cierre y carga de calificaciones",
      categoria: "Evaluación",
      periodo: "1° Cuatrimestre",
    },
    {
      fecha: "18 de julio",
      titulo: "FINALIZACIÓN 1° CUATRIMESTRE",
      descripcion: "Fin del primer cuatrimestre (16 semanas)",
      categoria: "Clases",
      periodo: "1° Cuatrimestre",
    },
    {
      fecha: "21 de julio al 03 de agosto",
      titulo: "RECESO INVERNAL",
      descripcion: "Período de vacaciones de invierno",
      categoria: "Receso",
      periodo: "Receso",
    },
    {
      fecha: "28 y 29 de julio",
      titulo: "PERÍODO DE INSCRIPCIÓN A MATERIAS",
      descripcion: "Inscripción a materias cuatrimestrales",
      categoria: "Inscripciones",
      periodo: "2° Cuatrimestre",
    },
    {
      fecha: "23 y 24 de julio",
      titulo: "Inscripción a mesas de examen",
      categoria: "Mesas de Exámenes",
      periodo: "Turno Agosto",
    },
    {
      fecha: "4 al 8 de agosto",
      titulo: "Período de mesas de examen",
      categoria: "Mesas de Exámenes",
      periodo: "Turno Agosto",
    },
    {
      fecha: "11 de agosto",
      titulo: "COMIENZO DE CLASES",
      descripcion: "Inicio del segundo cuatrimestre",
      categoria: "Clases",
      periodo: "2° Cuatrimestre",
    },
    {
      fecha: "18 al 29 de agosto",
      titulo: "Recepción de solicitud de Equivalencias",
      categoria: "Trámites Académicos",
      periodo: "2° Cuatrimestre",
    },
    {
      fecha: "24 al 28 de noviembre",
      titulo: "Semana de cierre y carga de calificaciones",
      categoria: "Evaluación",
      periodo: "2° Cuatrimestre",
    },
    {
      fecha: "28 de noviembre",
      titulo: "FINALIZACIÓN 2° CUATRIMESTRE",
      descripcion: "Fin del segundo cuatrimestre (16 semanas)",
      categoria: "Clases",
      periodo: "2° Cuatrimestre",
    },
    {
      fecha: "3 al 5 de diciembre",
      titulo: "Inscripción a mesas de examen",
      categoria: "Mesas de Exámenes",
      periodo: "Turno Diciembre",
    },
    {
      fecha: "15 al 19 de diciembre",
      titulo: "Período de mesas de examen",
      categoria: "Mesas de Exámenes",
      periodo: "Turno Diciembre",
    },
    {
      fecha: "5 de diciembre",
      titulo: "Muestra de fin de Año",
      descripcion: "Exhibición de trabajos finales",
      categoria: "Actividades de Cierre",
      periodo: "Cierre del Año",
    },
    {
      fecha: "22 de diciembre",
      titulo: "FIN DE LAS ACTIVIDADES ADMINISTRATIVAS Y ACADÉMICAS",
      descripcion: "Cierre del año académico 2025",
      categoria: "Actividades de Cierre",
      periodo: "Cierre del Año",
    },
  ];
  
  // Elementos del DOM
  const inputBuscador = document.getElementById('buscador-input');
  const botonBuscador = document.getElementById('buscador-button');
  const contenedorSugerencias = document.getElementById('buscador-sugerencias');
  const contenedorResultados = document.getElementById('buscador-resultados-lista');
  const contenedorNoResultados = document.getElementById('buscador-no-resultados');
  const contenedorLoading = document.getElementById('buscador-loading');
  
  // Variables de estado
  let searchTerm = '';
  let sugerencias = [];
  
  // Función para generar sugerencias
  function generarSugerencias(termino) {
    if (termino.length < 2) {
      contenedorSugerencias.style.display = 'none';
      return;
    }
    
    const terminoLower = termino.toLowerCase();
    const uniqueTerms = new Set();
    
    // Buscar en títulos y descripciones
    eventosAcademicos.forEach(evento => {
      if (evento.titulo.toLowerCase().includes(terminoLower)) {
        uniqueTerms.add(evento.titulo);
      }
      if (evento.descripcion && evento.descripcion.toLowerCase().includes(terminoLower)) {
        const words = evento.descripcion.split(' ');
        for (let i = 0; i < words.length; i++) {
          if (words[i].toLowerCase().includes(terminoLower)) {
            // Agregar contexto alrededor de la palabra encontrada
            const start = Math.max(0, i - 2);
            const end = Math.min(words.length, i + 3);
            uniqueTerms.add(words.slice(start, end).join(' '));
            break;
          }
        }
      }
    });
    
    // Buscar en categorías
    eventosAcademicos.forEach(evento => {
      if (evento.categoria.toLowerCase().includes(terminoLower)) {
        uniqueTerms.add(evento.categoria);
      }
    });
    
    // Buscar en fechas
    eventosAcademicos.forEach(evento => {
      if (evento.fecha.toLowerCase().includes(terminoLower)) {
        uniqueTerms.add(evento.fecha);
      }
    });
    
    sugerencias = Array.from(uniqueTerms).slice(0, 5);
    
    if (sugerencias.length > 0) {
      mostrarSugerencias();
    } else {
      contenedorSugerencias.style.display = 'none';
    }
  }
  
  // Función para mostrar sugerencias
  function mostrarSugerencias() {
    contenedorSugerencias.innerHTML = '';
    
    sugerencias.forEach(sugerencia => {
      const itemSugerencia = document.createElement('div');
      itemSugerencia.className = 'buscador-sugerencia-item';
      itemSugerencia.textContent = sugerencia;
      itemSugerencia.addEventListener('click', () => {
        inputBuscador.value = sugerencia;
        searchTerm = sugerencia;
        contenedorSugerencias.style.display = 'none';
        realizarBusqueda();
      });
      
      contenedorSugerencias.appendChild(itemSugerencia);
    });
    
    contenedorSugerencias.style.display = 'block';
  }
  
  // Función para realizar la búsqueda
  function realizarBusqueda() {
    const termino = searchTerm.trim();
    if (termino === '') return;
    
    // Mostrar loading
    contenedorLoading.style.display = 'flex';
    contenedorResultados.innerHTML = '';
    contenedorNoResultados.style.display = 'none';
    
    // Simular tiempo de búsqueda
    setTimeout(() => {
      const resultados = eventosAcademicos.filter(evento => {
        const terminoLower = termino.toLowerCase();
        return (
          evento.titulo.toLowerCase().includes(terminoLower) ||
          (evento.descripcion && evento.descripcion.toLowerCase().includes(terminoLower)) ||
          evento.categoria.toLowerCase().includes(terminoLower) ||
          evento.fecha.toLowerCase().includes(terminoLower) ||
          evento.periodo.toLowerCase().includes(terminoLower)
        );
      });
      
      mostrarResultados(resultados, termino);
      contenedorLoading.style.display = 'none';
    }, 300);
  }
  
  // Función para mostrar resultados
  function mostrarResultados(resultados, termino) {
    contenedorResultados.innerHTML = '';
    
    if (resultados.length > 0) {
      // Agregar encabezado de resultados
      const headerResultados = document.createElement('div');
      headerResultados.className = 'buscador-resultados-header';
      headerResultados.textContent = `Resultados (${resultados.length})`;
      contenedorResultados.appendChild(headerResultados);
      
      // Agregar cada resultado
      resultados.forEach(evento => {
        const cardResultado = document.createElement('div');
        cardResultado.className = 'buscador-resultado-card';
        
        const headerResultado = document.createElement('div');
        headerResultado.className = 'buscador-resultado-header';
        
        // Badge de fecha
        const badgeFecha = document.createElement('span');
        badgeFecha.className = 'buscador-badge buscador-badge-fecha';
        badgeFecha.textContent = evento.fecha;
        headerResultado.appendChild(badgeFecha);
        
        // Badge de periodo
        const badgePeriodo = document.createElement('span');
        badgePeriodo.className = 'buscador-badge buscador-badge-periodo';
        badgePeriodo.textContent = evento.periodo;
        headerResultado.appendChild(badgePeriodo);
        
        cardResultado.appendChild(headerResultado);
        
        // Título del evento
        const tituloResultado = document.createElement('div');
        tituloResultado.className = 'buscador-resultado-titulo';
        tituloResultado.textContent = evento.titulo;
        cardResultado.appendChild(tituloResultado);
        
        // Descripción del evento (si existe)
        if (evento.descripcion) {
          const descripcionResultado = document.createElement('div');
          descripcionResultado.className = 'buscador-resultado-descripcion';
          descripcionResultado.textContent = evento.descripcion;
          cardResultado.appendChild(descripcionResultado);
        }
        
        // Badge de categoría
        const badgeCategoria = document.createElement('div');
        badgeCategoria.className = 'buscador-badge buscador-badge-categoria';
        badgeCategoria.textContent = evento.categoria;
        badgeCategoria.style.marginTop = '0.5rem';
        cardResultado.appendChild(badgeCategoria);
        
        contenedorResultados.appendChild(cardResultado);
      });
    } else {
      contenedorNoResultados.textContent = `No se encontraron resultados para "${termino}"`;
      contenedorNoResultados.style.display = 'block';
    }
  }
  
  // Event listeners
  inputBuscador.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    generarSugerencias(searchTerm);
  });
  
  inputBuscador.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      contenedorSugerencias.style.display = 'none';
      realizarBusqueda();
    }
  });
  
  botonBuscador.addEventListener('click', () => {
    searchTerm = inputBuscador.value;
    contenedorSugerencias.style.display = 'none';
    realizarBusqueda();
  });
  
  // Cerrar sugerencias al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!inputBuscador.contains(e.target) && !contenedorSugerencias.contains(e.target)) {
      contenedorSugerencias.style.display = 'none';
    }
  });
  
  // Inicializar el foco en el input
  setTimeout(() => {
    inputBuscador.focus();
  }, 500);
});