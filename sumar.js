/**
 * sumar.js - Funcionalidades para agregar links y columnas en la tabla de cátedras
 * 
 * Este script permite:
 * 1. Agregar un link con título en una fila y columna específica
 * 2. Agregar una nueva columna que abarque todas las cátedras
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('sumar.js: DOM cargado correctamente');
    
    // Inicializar la interfaz de usuario
    crearInterfazUI();
    
    // Exponer las funciones globalmente para que puedan ser llamadas desde la consola
    window.agregarLink = agregarLink;
    window.agregarColumna = agregarColumna;
  });
  
  // Función para agregar un link en una fila y columna específica
  function agregarLink(docenteNombre, columnaIndice, titulo, url) {
    console.log(`Intentando agregar link "${titulo}" para ${docenteNombre} en columna ${columnaIndice}`);
    
    // Buscar todas las tablas en la página
    const tablas = document.querySelectorAll('.schedule-table table');
    console.log(`Encontradas ${tablas.length} tablas`);
    
    if (tablas.length === 0) {
      console.error('No se encontraron tablas en la página');
      alert('Error: No se encontraron tablas en la página');
      return;
    }
    
    let linkAgregado = false;
    
    // Recorrer cada tabla
    tablas.forEach((tabla, tablaIndex) => {
      console.log(`Procesando tabla ${tablaIndex + 1}`);
      
      // Buscar todas las filas en la tabla
      const filas = tabla.querySelectorAll('tbody tr');
      console.log(`Encontradas ${filas.length} filas en la tabla ${tablaIndex + 1}`);
      
      // Recorrer cada fila
      filas.forEach((fila, filaIndex) => {
        // Obtener la celda del docente (primera columna)
        const celdaDocente = fila.querySelector('td:first-child');
        
        if (!celdaDocente) {
          console.log(`Fila ${filaIndex + 1}: No se encontró celda de docente`);
          return; // Continuar con la siguiente fila
        }
        
        const nombreDocenteEnFila = celdaDocente.textContent.trim();
        console.log(`Fila ${filaIndex + 1}: Docente "${nombreDocenteEnFila}"`);
        
        // Verificar si es la fila del docente buscado
        if (nombreDocenteEnFila === docenteNombre) {
          console.log(`¡Encontrado docente "${docenteNombre}" en fila ${filaIndex + 1}!`);
          
          // Obtener todas las celdas de la fila
          const celdas = fila.querySelectorAll('td');
          console.log(`La fila tiene ${celdas.length} celdas`);
          
          // Verificar si el índice de columna es válido
          if (columnaIndice <= 0 || columnaIndice >= celdas.length) {
            console.error(`Índice de columna ${columnaIndice} fuera de rango (1-${celdas.length - 1})`);
            alert(`Error: Índice de columna ${columnaIndice} fuera de rango (1-${celdas.length - 1})`);
            return;
          }
          
          // Obtener la celda en la columna especificada
          const celda = celdas[columnaIndice - 1];
          
          if (!celda) {
            console.error(`No se pudo encontrar la celda en la columna ${columnaIndice}`);
            return;
          }
          
          console.log(`Agregando link a la celda en columna ${columnaIndice}`);
          
          // Crear el elemento de enlace
          const enlace = document.createElement('a');
          enlace.href = url || '#';
          enlace.textContent = titulo;
          enlace.className = url ? 'catedra-link' : 'catedra-link no-link';
          enlace.target = '_blank';
          
          // Agregar un salto de línea si ya hay contenido
          if (celda.innerHTML.trim() !== '') {
            celda.appendChild(document.createElement('br'));
          }
          
          // Agregar el enlace a la celda
          celda.appendChild(enlace);
          
          console.log(`Link "${titulo}" agregado exitosamente para ${docenteNombre}`);
          linkAgregado = true;
          
          // Mostrar mensaje de éxito
          alert(`Link "${titulo}" agregado exitosamente para ${docenteNombre}`);
        }
      });
    });
    
    if (!linkAgregado) {
      console.error(`No se encontró al docente "${docenteNombre}" en ninguna tabla`);
      alert(`No se encontró al docente "${docenteNombre}" en ninguna tabla`);
    }
    
    return linkAgregado;
  }
  
  // Función para agregar una nueva columna a todas las tablas
  function agregarColumna(tituloColumna) {
    console.log(`Intentando agregar columna "${tituloColumna}"`);
    
    // Buscar todas las tablas en la página
    const tablas = document.querySelectorAll('.schedule-table table');
    console.log(`Encontradas ${tablas.length} tablas`);
    
    if (tablas.length === 0) {
      console.error('No se encontraron tablas en la página');
      alert('Error: No se encontraron tablas en la página');
      return false;
    }
    
    let columnaAgregada = false;
    
    // Recorrer cada tabla
    tablas.forEach((tabla, tablaIndex) => {
      console.log(`Procesando tabla ${tablaIndex + 1}`);
      
      // Agregar la columna al encabezado
      const encabezado = tabla.querySelector('thead tr');
      if (encabezado) {
        console.log('Encontrado encabezado de tabla');
        
        const nuevoEncabezado = document.createElement('th');
        nuevoEncabezado.textContent = tituloColumna;
        
        // Insertar antes de la columna de checkbox (si existe)
        const checkboxHeader = encabezado.querySelector('.checkbox-column');
        if (checkboxHeader) {
          console.log('Insertando antes de la columna de checkbox');
          encabezado.insertBefore(nuevoEncabezado, checkboxHeader);
        } else {
          console.log('Agregando al final del encabezado');
          encabezado.appendChild(nuevoEncabezado);
        }
        
        columnaAgregada = true;
      } else {
        console.error('No se encontró el encabezado de la tabla');
      }
      
      // Agregar la celda a cada fila
      const filas = tabla.querySelectorAll('tbody tr');
      console.log(`Encontradas ${filas.length} filas en la tabla ${tablaIndex + 1}`);
      
      filas.forEach((fila, filaIndex) => {
        const nuevaCelda = document.createElement('td');
        nuevaCelda.className = 'links-cell';
        
        // Insertar antes de la celda de checkbox (si existe)
        const checkboxCell = fila.querySelector('.checkbox-column');
        if (checkboxCell) {
          console.log(`Fila ${filaIndex + 1}: Insertando antes de la celda de checkbox`);
          fila.insertBefore(nuevaCelda, checkboxCell);
        } else {
          console.log(`Fila ${filaIndex + 1}: Agregando al final de la fila`);
          fila.appendChild(nuevaCelda);
        }
      });
    });
    
    if (columnaAgregada) {
      console.log(`Columna "${tituloColumna}" agregada exitosamente`);
      alert(`Columna "${tituloColumna}" agregada exitosamente`);
    } else {
      console.error('No se pudo agregar la columna');
      alert('Error: No se pudo agregar la columna');
    }
    
    return columnaAgregada;
  }
  
  // Crear una interfaz de usuario simple para usar estas funciones
  function crearInterfazUI() {
    console.log('Creando interfaz de usuario');
    
    // Crear el contenedor principal
    const container = document.createElement('div');
    container.className = 'web-only-content';
    container.style.marginBottom = '1rem';
    container.style.padding = '1rem';
    container.style.backgroundColor = '#1d4044';
    container.style.borderRadius = '0.375rem';
    container.style.border = '1px solid #eee76e';
    
    // Título
    const titulo = document.createElement('h2');
    titulo.textContent = 'Herramientas de Edición';
    titulo.style.color = '#eee76e';
    titulo.style.marginBottom = '0.5rem';
    container.appendChild(titulo);
    
    // Sección para agregar link
    const linkSection = document.createElement('div');
    linkSection.style.marginBottom = '1rem';
    linkSection.style.padding = '0.5rem';
    linkSection.style.backgroundColor = 'rgba(40, 94, 97, 0.3)';
    linkSection.style.borderRadius = '0.25rem';
    
    const linkTitle = document.createElement('h3');
    linkTitle.textContent = 'Agregar Link';
    linkTitle.style.color = '#eee76e';
    linkTitle.style.marginBottom = '0.5rem';
    linkSection.appendChild(linkTitle);
    
    // Campos para agregar link
    const docenteInput = crearCampo('Nombre del Docente:', 'text', 'docenteInput');
    const columnaInput = crearCampo('Número de Columna:', 'number', 'columnaInput');
    columnaInput.querySelector('input').value = '2'; // Por defecto, columna 2 (CÁTEDRAS)
    const tituloLinkInput = crearCampo('Título del Link:', 'text', 'tituloLinkInput');
    const urlInput = crearCampo('URL (opcional):', 'text', 'urlInput');
    
    linkSection.appendChild(docenteInput);
    linkSection.appendChild(columnaInput);
    linkSection.appendChild(tituloLinkInput);
    linkSection.appendChild(urlInput);
    
    // Botón para agregar link
    const addLinkButton = document.createElement('button');
    addLinkButton.textContent = 'Agregar Link';
    addLinkButton.className = 'export-button';
    addLinkButton.style.marginTop = '0.5rem';
    addLinkButton.addEventListener('click', () => {
      const docente = document.getElementById('docenteInput').value;
      const columna = parseInt(document.getElementById('columnaInput').value);
      const titulo = document.getElementById('tituloLinkInput').value;
      const url = document.getElementById('urlInput').value;
      
      if (docente && columna && titulo) {
        agregarLink(docente, columna, titulo, url);
      } else {
        alert('Por favor completa los campos requeridos');
      }
    });
    
    linkSection.appendChild(addLinkButton);
    container.appendChild(linkSection);
    
    // Sección para agregar columna
    const columnSection = document.createElement('div');
    columnSection.style.padding = '0.5rem';
    columnSection.style.backgroundColor = 'rgba(40, 94, 97, 0.3)';
    columnSection.style.borderRadius = '0.25rem';
    
    const columnTitle = document.createElement('h3');
    columnTitle.textContent = 'Agregar Columna';
    columnTitle.style.color = '#eee76e';
    columnTitle.style.marginBottom = '0.5rem';
    columnSection.appendChild(columnTitle);
    
    // Campo para el título de la columna
    const tituloColumnaInput = crearCampo('Título de la Columna:', 'text', 'tituloColumnaInput');
    columnSection.appendChild(tituloColumnaInput);
    
    // Botón para agregar columna
    const addColumnButton = document.createElement('button');
    addColumnButton.textContent = 'Agregar Columna';
    addColumnButton.className = 'export-button';
    addColumnButton.style.marginTop = '0.5rem';
    addColumnButton.addEventListener('click', () => {
      const tituloColumna = document.getElementById('tituloColumnaInput').value;
      
      if (tituloColumna) {
        agregarColumna(tituloColumna);
      } else {
        alert('Por favor ingresa un título para la columna');
      }
    });
    
    columnSection.appendChild(addColumnButton);
    container.appendChild(columnSection);
    
    // Insertar el contenedor antes de la navegación principal
    const mainNav = document.querySelector('.main-nav');
    if (mainNav && mainNav.parentNode) {
      console.log('Insertando interfaz antes de la navegación principal');
      mainNav.parentNode.insertBefore(container, mainNav);
    } else {
      console.error('No se encontró el elemento .main-nav');
      // Intentar insertar al principio del contenedor principal
      const mainContainer = document.querySelector('.container');
      if (mainContainer) {
        console.log('Insertando interfaz al principio del contenedor principal');
        mainContainer.insertBefore(container, mainContainer.firstChild);
      } else {
        console.error('No se pudo encontrar un lugar adecuado para insertar la interfaz');
      }
    }
  }
  
  // Función auxiliar para crear campos de entrada
  function crearCampo(label, type, id) {
    const container = document.createElement('div');
    container.style.marginBottom = '0.5rem';
    
    const labelElement = document.createElement('label');
    labelElement.textContent = label;
    labelElement.style.display = 'block';
    labelElement.style.marginBottom = '0.25rem';
    labelElement.htmlFor = id;
    
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.style.width = '100%';
    input.style.padding = '0.25rem';
    input.style.backgroundColor = '#1d4044';
    input.style.border = '1px solid #eee76e';
    input.style.borderRadius = '0.25rem';
    input.style.color = 'white';
    
    container.appendChild(labelElement);
    container.appendChild(input);
    
    return container;
  }
  
  console.log('sumar.js cargado correctamente');