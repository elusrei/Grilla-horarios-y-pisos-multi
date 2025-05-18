// Función para detectar palabras mal escritas y sugerir correcciones
// Utiliza el algoritmo de distancia de Levenshtein para encontrar palabras similares
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix = []

  // Inicializar matriz
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i
  }

  // Rellenar matriz
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // sustitución
          matrix[i][j - 1] + 1, // inserción
          matrix[i - 1][j] + 1, // eliminación
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

// Función para encontrar la mejor coincidencia para una palabra
function findBestMatch(word, wordList) {
  if (!word || word.length < 2) return null

  let bestMatch = null
  let lowestDistance = Number.POSITIVE_INFINITY

  // Normalizar la palabra de búsqueda (quitar acentos, convertir a minúsculas)
  const normalizedWord = word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  wordList.forEach((candidate) => {
    // Normalizar el candidato
    const normalizedCandidate = candidate
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

    // Calcular distancia
    const distance = levenshteinDistance(normalizedWord, normalizedCandidate)

    // Calcular umbral basado en la longitud de la palabra
    const threshold = Math.max(2, Math.floor(normalizedWord.length * 0.4))

    // Si la distancia es menor que el umbral y menor que la distancia más baja encontrada hasta ahora
    if (distance <= threshold && distance < lowestDistance) {
      lowestDistance = distance
      bestMatch = candidate
    }
  })

  return bestMatch
}

// Clase principal para el buscador
class Buscador {
  constructor() {
    this.searchTerms = []
    this.selectedRows = new Set() // Conjunto de filas seleccionadas
    this.rowMetadata = new Map() // Mapa para almacenar metadatos de cada fila (materia, cátedra, etc.)
    this.allMaterias = []
    this.allDocentes = []
    this.allRows = []
    this.searchInput = null
    this.searchTermsContainer = null
    this.searchButton = null
    this.clearSelectionButton = null
    this.exportFullButton = null
    this.exportCustomButton = null
    this.previewContainer = null // Contenedor para la grilla paralela
    this.initialized = false
    this.currentSearchResults = [] // Almacena los resultados de la búsqueda actual
    this.rowCheckboxes = new Map() // Mapa para asociar filas con sus checkboxes
    this.originalExportButton = null // Referencia al botón de exportación original
    this.materiaGroups = new Map() // Mapa para agrupar filas por materia
  }

  // Inicializar el buscador
  init() {
    if (this.initialized) return

    // Crear elementos de la interfaz
    this.createSearchInterface()

    // Crear la grilla paralela para previsualización
    this.createPreviewGrid()

    // Analizar la estructura de la tabla y crear metadatos
    this.analyzeTableStructure()

    // Recopilar todas las materias y docentes
    this.collectData()

    // Agregar checkboxes a las filas
    this.addCheckboxesToRows()

    // Agregar event listeners
    this.addEventListeners()

    // Reemplazar el botón de exportación original
    this.replaceExportButton()

    this.initialized = true
  }

  // Analizar la estructura de la tabla y crear metadatos para cada fila
  analyzeTableStructure() {
    const tables = document.querySelectorAll(".schedule-table table")

    tables.forEach((table) => {
      const rows = table.querySelectorAll("tbody tr")

      // Variables para rastrear la materia y cátedra actuales
      let currentMateria = null
      let currentCatedra = null

      rows.forEach((row) => {
        // Buscar celda de materia
        const materiaCell = row.querySelector(".subject-cell")
        if (materiaCell) {
          currentMateria = materiaCell.textContent.trim()

          // Crear un nuevo grupo para esta materia si no existe
          if (!this.materiaGroups.has(currentMateria)) {
            this.materiaGroups.set(currentMateria, [])
          }
        }

        // Buscar celda de cátedra
        const catedraCell = row.querySelector(".professor-cell")
        if (catedraCell) {
          currentCatedra = catedraCell.textContent.trim()
        }

        // Obtener día, horario, aula y piso
        const cells = row.querySelectorAll("td")
        let dia = null
        let horario = null
        let aula = null
        let piso = null

        // Recorrer las celdas para encontrar la información
        cells.forEach((cell) => {
          if (
            !cell.classList.contains("subject-cell") &&
            !cell.classList.contains("professor-cell") &&
            !cell.classList.contains("checkbox-column")
          ) {
            // Asignar valores según la posición (esto puede necesitar ajustes según la estructura exacta)
            if (!dia) {
              dia = cell.textContent.trim()
            } else if (!horario) {
              horario = cell.textContent.trim()
            } else if (!aula) {
              aula = cell.textContent.trim()
            } else if (!piso) {
              piso = cell.textContent.trim()
            }
          }
        })

        // Guardar metadatos para esta fila
        this.rowMetadata.set(row, {
          materia: currentMateria,
          catedra: currentCatedra,
          dia: dia,
          horario: horario,
          aula: aula,
          piso: piso,
        })

        // Agregar esta fila al grupo de su materia
        if (currentMateria && this.materiaGroups.has(currentMateria)) {
          this.materiaGroups.get(currentMateria).push(row)
        }
      })
    })
  }

  // Crear la interfaz de búsqueda
  createSearchInterface() {
    // Crear contenedor principal
    const searchContainer = document.createElement("div")
    searchContainer.className = "web-only-content"
    searchContainer.style.display = "flex"
    searchContainer.style.flexDirection = "column"
    searchContainer.style.gap = "1rem"

    // Título (h1)
    this.searchTitle = document.createElement("h1")
    this.searchTitle.textContent = "Buscador de Materias"
    this.searchTitle.style.color = "#eee76e"
    this.searchTitle.style.margin = "0"

    // Párrafo (p)
    this.searchDescription = document.createElement("p")
    this.searchDescription.textContent = "Podes buscar tus materias y exportar un pdf personalizado."
    this.searchDescription.style.color = "#ccc"
    this.searchDescription.style.margin = "0"



    // Agregarlos primero al contenedor principal
    searchContainer.appendChild(this.searchTitle)
    searchContainer.appendChild(this.searchDescription)

    // Crear campo de búsqueda
    const searchInputContainer = document.createElement("div")
    searchInputContainer.style.display = "flex"
    searchInputContainer.style.gap = "0.5rem"

    this.searchInput = document.createElement("input")
    this.searchInput.type = "text"
    this.searchInput.placeholder = "Buscar por materia o docente..."
    this.searchInput.style.flex = "1"
    this.searchInput.style.padding = "0.5rem"
    this.searchInput.style.borderRadius = "0.25rem"
    this.searchInput.style.border = "1px solid #eee76e"
    this.searchInput.style.backgroundColor = "#1d4044"
    this.searchInput.style.color = "white"

    this.searchButton = document.createElement("button")
    this.searchButton.textContent = "Buscar"
    this.searchButton.className = "export-button"
    this.searchButton.style.backgroundColor = "#285e61"

    searchInputContainer.appendChild(this.searchInput)
    searchInputContainer.appendChild(this.searchButton)

    // Botones para gestionar la selección
    const selectionButtonsContainer = document.createElement("div")
    selectionButtonsContainer.style.display = "flex"
    selectionButtonsContainer.style.gap = "0.5rem"
    selectionButtonsContainer.style.flexWrap = "wrap"

    this.clearSelectionButton = document.createElement("button")
    this.clearSelectionButton.textContent = "Limpiar selección"
    this.clearSelectionButton.className = "export-button"
    this.clearSelectionButton.style.backgroundColor = "#6b2e2e"
    this.clearSelectionButton.disabled = true

    selectionButtonsContainer.appendChild(this.clearSelectionButton)

    // Contenedor para términos de búsqueda
    this.searchTermsContainer = document.createElement("div")
    this.searchTermsContainer.className = "search-terms-container"
    this.searchTermsContainer.style.display = "flex"
    this.searchTermsContainer.style.flexWrap = "wrap"
    this.searchTermsContainer.style.gap = "0.5rem"

    // Información sobre la selección actual
    this.selectionInfo = document.createElement("div")
    this.selectionInfo.className = "selection-info"
    this.selectionInfo.style.marginTop = "0.5rem"
    this.selectionInfo.style.color = "#eee76e"
    this.selectionInfo.textContent = "No hay materias seleccionadas"

    // Agregar el resto de elementos
    searchContainer.appendChild(searchInputContainer)
    searchContainer.appendChild(selectionButtonsContainer)
    searchContainer.appendChild(this.searchTermsContainer)
    searchContainer.appendChild(this.selectionInfo)

    // Insertar antes de la navegación principal
    const scheduleContainer = document.querySelector(".schedule-container")
    if (scheduleContainer && scheduleContainer.parentNode) {
      scheduleContainer.parentNode.insertBefore(searchContainer, scheduleContainer)
    }
  }

  // Crear la grilla paralela para previsualización
  createPreviewGrid() {
    // Crear contenedor para la grilla de previsualización
    this.previewContainer = document.createElement("div")
    this.previewContainer.className = "web-only-content preview-container"
    this.previewContainer.style.display = "none" // Inicialmente oculto hasta que haya selecciones
    this.previewContainer.style.marginTop = "1.5rem"
    this.previewContainer.style.marginBottom = "1.5rem"
    this.previewContainer.style.border = "1px solid #eee76e"
    this.previewContainer.style.borderRadius = "0.375rem"
    this.previewContainer.style.padding = "1rem"
    this.previewContainer.style.backgroundColor = "#1d4044"

    // Título de la previsualización
    const previewTitle = document.createElement("h3")
    previewTitle.textContent = "Vista previa de tu selección"
    previewTitle.style.color = "#eee76e"
    previewTitle.style.marginBottom = "1rem"
    previewTitle.style.padding = "0"

    this.previewContainer.appendChild(previewTitle)

    // Contenedor para la tabla de previsualización
    this.previewTableContainer = document.createElement("div")
    this.previewTableContainer.className = "schedule-table"
    this.previewTableContainer.style.overflowX = "auto"

    // Crear tabla de previsualización vacía
    const previewTable = document.createElement("table")
    previewTable.style.width = "100%"

    // Crear encabezado de la tabla
    const thead = document.createElement("thead")
    const headerRow = document.createElement("tr")

    // Obtener los encabezados de la tabla original
    const originalHeaders = document.querySelector(".schedule-table table thead tr")
    if (originalHeaders) {
      // Clonar los encabezados de la tabla original (excepto el de checkbox)
      const headerCells = originalHeaders.querySelectorAll("th")
      headerCells.forEach((cell, index) => {
        // Omitir el encabezado del checkbox
        if (cell.classList.contains("checkbox-column")) {
          return
        }
        const newHeader = document.createElement("th")
        newHeader.textContent = cell.textContent
        newHeader.style.width = cell.style.width
        headerRow.appendChild(newHeader)
      })
    } else {
      // Si no se encuentran encabezados, crear unos predeterminados
      const headers = ["MATERIA", "CÁTEDRA", "DÍA", "HORARIO", "AULA", "PISO"]
      headers.forEach((header) => {
        const th = document.createElement("th")
        th.textContent = header
        headerRow.appendChild(th)
      })
    }

    thead.appendChild(headerRow)
    previewTable.appendChild(thead)

    // Crear cuerpo de la tabla
    const tbody = document.createElement("tbody")
    previewTable.appendChild(tbody)

    this.previewTableContainer.appendChild(previewTable)
    this.previewContainer.appendChild(this.previewTableContainer)

    // Insertar después de la interfaz de búsqueda
    const mainNav = document.querySelector(".main-nav")
    if (mainNav && mainNav.parentNode) {
      mainNav.parentNode.insertBefore(this.previewContainer, mainNav.nextSibling)
    }
  }

  // Recopilar datos de materias y docentes
  collectData() {
    // Obtener todas las filas de las tablas
    const tables = document.querySelectorAll(".schedule-table table")
    tables.forEach((table) => {
      const rows = table.querySelectorAll("tbody tr")
      rows.forEach((row) => {
        this.allRows.push(row)

        // Extraer materia
        const materiaCell = row.querySelector(".subject-cell")
        if (materiaCell && !this.allMaterias.includes(materiaCell.textContent.trim())) {
          this.allMaterias.push(materiaCell.textContent.trim())
        }

        // Extraer docente
        const docenteCell = row.querySelector(".professor-cell")
        if (docenteCell && !this.allDocentes.includes(docenteCell.textContent.trim())) {
          this.allDocentes.push(docenteCell.textContent.trim())
        }
      })
    })

    // También recopilar datos de la página de links a cátedras si estamos en esa página
    const linksTables = document.querySelectorAll(".materia-container table")
    linksTables.forEach((table) => {
      const rows = table.querySelectorAll("tbody tr")
      rows.forEach((row) => {
        this.allRows.push(row)

        // Extraer docente
        const docenteCell = row.querySelector("td:first-child")
        if (docenteCell && !this.allDocentes.includes(docenteCell.textContent.trim())) {
          this.allDocentes.push(docenteCell.textContent.trim())
        }

        // Extraer materias de los links
        const linksCell = row.querySelector("td:nth-child(2)")
        if (linksCell) {
          const links = linksCell.querySelectorAll("a")
          links.forEach((link) => {
            const materia = link.textContent.trim()
            if (!this.allMaterias.includes(materia)) {
              this.allMaterias.push(materia)
            }
          })
        }
      })
    })
  }

  // Modificar la función addCheckboxesToRows para colocar los checkboxes a la derecha y permitir selección individual
  addCheckboxesToRows() {
    // Verificar si estamos en la página de links a cátedras
    const isLinksCatedrasPage = window.location.href.includes("links-a-catedras.html")

    // Crear una columna de encabezado para los checkboxes en cada tabla
    const tables = document.querySelectorAll(".schedule-table table")
    tables.forEach((table) => {
      // Verificar si ya existe un encabezado de checkbox para evitar duplicación
      const headerRow = table.querySelector("thead tr")
      if (headerRow) {
        // Verificar si ya existe un encabezado de checkbox
        const existingCheckboxHeader = headerRow.querySelector(".checkbox-column")
        if (existingCheckboxHeader) {
          // Si existe, eliminarlo para evitar duplicación
          existingCheckboxHeader.remove()
        }

        // Crear nuevo encabezado de checkbox y agregarlo al final
        const checkboxHeader = document.createElement("th")
        checkboxHeader.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
        checkboxHeader.className = "web-only-content checkbox-column"
        checkboxHeader.style.width = "1rem"
        checkboxHeader.style.textAlign = "center"
        headerRow.appendChild(checkboxHeader) // Agregar al final
      }

      // Eliminar checkboxes existentes para evitar duplicación
      const existingCheckboxes = table.querySelectorAll(".checkbox-column")
      existingCheckboxes.forEach((cell) => {
        if (cell.tagName === "TD") {
          cell.remove()
        }
      })

      // Agregar checkboxes a cada fila
      const rows = table.querySelectorAll("tbody tr")
      rows.forEach((row) => {
        // Crear celda de checkbox
        const checkboxCell = document.createElement("td")
        checkboxCell.className = "web-only-content checkbox-column"
        checkboxCell.style.textAlign = "center"
        checkboxCell.style.width = "1rem"

        // Crear checkbox para cada fila, independientemente de si tiene subject-cell
        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.className = "row-checkbox"
        checkbox.style.width = "16px"
        checkbox.style.height = "16px"
        checkbox.style.cursor = "pointer"

        // Asociar el checkbox con la fila
        this.rowCheckboxes.set(row, checkbox)

        // Agregar event listener al checkbox
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            this.addRowToSelection(row)
          } else {
            this.removeRowFromSelection(row)
          }
        })

        checkboxCell.appendChild(checkbox)
        row.appendChild(checkboxCell) // Agregar al final de la fila
      })
    })

    // También agregar checkboxes a la página de links a cátedras si estamos en esa página
    if (isLinksCatedrasPage) {
      const linksTables = document.querySelectorAll(".materia-container table")
      linksTables.forEach((table) => {
        const headerRow = table.querySelector("thead tr")
        if (headerRow) {
          // Verificar si ya existe un encabezado de checkbox
          const existingCheckboxHeader = headerRow.querySelector(".checkbox-column")
          if (existingCheckboxHeader) {
            existingCheckboxHeader.remove()
          }

          const checkboxHeader = document.createElement("th")
          checkboxHeader.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
          checkboxHeader.className = "web-only-content checkbox-column"
          checkboxHeader.style.width = "1rem"
          checkboxHeader.style.textAlign = "center"
          headerRow.appendChild(checkboxHeader)
        }

        // Eliminar checkboxes existentes
        const existingCheckboxes = table.querySelectorAll(".checkbox-column")
        existingCheckboxes.forEach((cell) => {
          if (cell.tagName === "TD") {
            cell.remove()
          }
        })

        // Agregar checkboxes a cada fila
        const rows = table.querySelectorAll("tbody tr")
        rows.forEach((row) => {
          const checkboxCell = document.createElement("td")
          checkboxCell.className = "web-only-content checkbox-column"
          checkboxCell.style.textAlign = "center"
          checkboxCell.style.width = "1rem"

          const checkbox = document.createElement("input")
          checkbox.type = "checkbox"
          checkbox.className = "row-checkbox"
          checkbox.style.width = "16px"
          checkbox.style.height = "16px"
          checkbox.style.cursor = "pointer"

          // Asociar el checkbox con la fila
          this.rowCheckboxes.set(row, checkbox)

          // Agregar event listener al checkbox
          checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
              this.addRowToSelection(row)
            } else {
              this.removeRowFromSelection(row)
            }
          })

          checkboxCell.appendChild(checkbox)
          row.appendChild(checkboxCell)
        })
      })
    }
  }

  // Reemplazar el botón de exportación original con dos botones
  replaceExportButton() {
    const originalExportButton = document.getElementById("exportButton")
    if (!originalExportButton) return

    // Guardar referencia al botón original
    this.originalExportButton = originalExportButton

    // Ocultar el botón original
    originalExportButton.style.display = "none"

    // Crear contenedor para los nuevos botones
    const exportButtonsContainer = document.createElement("div")
    exportButtonsContainer.className = "export-button-container"
    exportButtonsContainer.style.display = "flex"
    exportButtonsContainer.style.gap = "0.5rem"
    exportButtonsContainer.style.flexDirection = "column"

    // Botón para exportar PDF completo
    this.exportFullButton = document.createElement("button")
    this.exportFullButton.textContent = "EXPORTAR PDF COMPLETO"
    this.exportFullButton.className = "export-button"
    this.exportFullButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        EXPORTAR PDF COMPLETO
      `

    // Botón para exportar PDF personalizado
    this.exportCustomButton = document.createElement("button")
    this.exportCustomButton.textContent = "EXPORTAR SELECCIÓN"
    this.exportCustomButton.className = "export-button"
    this.exportCustomButton.style.backgroundColor = "#234e52"
    this.exportCustomButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        EXPORTAR SELECCIÓN
      `
    this.exportCustomButton.disabled = true

    // Agregar event listeners a los botones
    this.exportFullButton.addEventListener("click", () => {
      this.exportPDF(false)
    })

    this.exportCustomButton.addEventListener("click", () => {
      this.exportPDF(true)
    })

    // Agregar botones al contenedor
    exportButtonsContainer.appendChild(this.exportFullButton)
    exportButtonsContainer.appendChild(this.exportCustomButton)

    // Reemplazar el botón original con el contenedor de nuevos botones
    originalExportButton.parentNode.replaceChild(exportButtonsContainer, originalExportButton)
  }

  // Agregar event listeners
  addEventListeners() {
    // Event listener para el botón de búsqueda
    this.searchButton.addEventListener("click", () => {
      this.performSearch()
    })

    // Event listener para buscar al presionar Enter
    this.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.performSearch()
      }
    })

    // Event listener para limpiar la selección
    this.clearSelectionButton.addEventListener("click", () => {
      this.clearSelection()
    })
  }

  // Reconstruir la tabla completa para la previsualización
  updatePreviewGrid() {
    // Obtener el cuerpo de la tabla de previsualización
    const previewTable = this.previewContainer.querySelector("table")
    const previewTbody = previewTable.querySelector("tbody")

    // Limpiar el cuerpo de la tabla
    previewTbody.innerHTML = ""

    // Si no hay filas seleccionadas, ocultar la previsualización
    if (this.selectedRows.size === 0) {
      this.previewContainer.style.display = "none"
      return
    }

    // Mostrar la previsualización
    this.previewContainer.style.display = "block"

    // Agrupar filas seleccionadas por materia
    const selectedMaterias = new Map()

    // Primero, identificar todas las materias seleccionadas
    this.selectedRows.forEach((row) => {
      const metadata = this.rowMetadata.get(row)
      if (metadata && metadata.materia) {
        if (!selectedMaterias.has(metadata.materia)) {
          selectedMaterias.set(metadata.materia, new Map())
        }

        // Agrupar por cátedra dentro de cada materia
        const materiaCatedras = selectedMaterias.get(metadata.materia)
        if (!materiaCatedras.has(metadata.catedra)) {
          materiaCatedras.set(metadata.catedra, [])
        }

        materiaCatedras.get(metadata.catedra).push(row)
      }
    })

    // Ordenar las materias según su orden original
    const sortedMaterias = Array.from(selectedMaterias.keys()).sort((a, b) => {
      // Encontrar la primera fila de cada materia para comparar su posición
      const aRows = this.materiaGroups.get(a) || []
      const bRows = this.materiaGroups.get(b) || []

      if (aRows.length === 0 || bRows.length === 0) return 0

      const aIndex = this.allRows.indexOf(aRows[0])
      const bIndex = this.allRows.indexOf(bRows[0])

      return aIndex - bIndex
    })

    // Crear la tabla reconstruida
    let rowIndex = 0

    sortedMaterias.forEach((materia) => {
      const materiaCatedras = selectedMaterias.get(materia)
      const sortedCatedras = Array.from(materiaCatedras.keys()).sort()

      // Para cada materia, crear filas para cada cátedra
      sortedCatedras.forEach((catedra) => {
        const catedraRows = materiaCatedras.get(catedra)

        // Ordenar las filas de la cátedra según su orden original
        catedraRows.sort((a, b) => {
          return this.allRows.indexOf(a) - this.allRows.indexOf(b)
        })

        //  Contar cuántas filas hay para esta cátedra
        const rowCount = catedraRows.length

        // Crear filas para esta cátedra
        catedraRows.forEach((originalRow, index) => {
          const newRow = document.createElement("tr")
          newRow.className = rowIndex % 2 === 0 ? "even-row" : "odd-row"

          // Obtener metadatos de la fila
          const metadata = this.rowMetadata.get(originalRow)

          // Crear celdas para la fila
          if (index === 0) {
            // Primera fila de la cátedra: incluir materia y cátedra con rowspan
            const materiaCell = document.createElement("td")
            materiaCell.className = "subject-cell"
            materiaCell.textContent = materia
            if (rowCount > 1) {
              materiaCell.setAttribute("rowspan", rowCount)
            }
            newRow.appendChild(materiaCell)

            const catedraCell = document.createElement("td")
            catedraCell.className = "professor-cell"
            catedraCell.textContent = catedra
            if (rowCount > 1) {
              catedraCell.setAttribute("rowspan", rowCount)
            }
            newRow.appendChild(catedraCell)
          }

          // Agregar día, horario, aula y piso
          const diaCell = document.createElement("td")
          diaCell.textContent = metadata.dia
          newRow.appendChild(diaCell)

          const horarioCell = document.createElement("td")
          horarioCell.textContent = metadata.horario
          newRow.appendChild(horarioCell)

          const aulaCell = document.createElement("td")
          aulaCell.className = "classroom-cell"
          aulaCell.textContent = metadata.aula
          newRow.appendChild(aulaCell)

          const pisoCell = document.createElement("td")
          pisoCell.className = "floor-cell"
          pisoCell.textContent = metadata.piso
          newRow.appendChild(pisoCell)

          // Agregar la fila a la previsualización
          previewTbody.appendChild(newRow)
          rowIndex++
        })
      })
    })
  }

  // Función modificada para exportar PDF que corrige el problema con la exportación de selección
  exportPDF(onlySelected) {
    // Si se solicita exportar solo la selección, verificar que haya elementos seleccionados
    if (onlySelected && this.selectedRows.size === 0) {
      alert("No hay materias seleccionadas para exportar")
      return
    }

    // Ocultar elementos web-only antes de imprimir
    this.hideWebOnlyContent()

    // Eliminar todos los bordes de selección antes de exportar
    this.removeHighlightFromRows()

    // Crear una copia de la tabla de previsualización si exportamos selección
    if (onlySelected) {
      // Crear copia exacta de la tabla de previsualización para exportar
      const previewTable = this.previewContainer.querySelector("table").cloneNode(true)
      previewTable.classList.add("export-table")

      // Crear un contenedor para la tabla exportada
      const exportContainer = document.createElement("div")
      exportContainer.id = "export-container"
      exportContainer.style.padding = "0.5rem"
      exportContainer.style.backgroundColor = "#1d4044"
      exportContainer.style.color = "white"
      exportContainer.style.position = "fixed"
      exportContainer.style.top = "0"
      exportContainer.style.left = "0"
      exportContainer.style.width = "100%"
      exportContainer.style.height = "100%"
      exportContainer.style.zIndex = "9999"
      exportContainer.style.overflow = "auto"

      // Agregar un estilo adicional para mantener los colores en la impresión
      const printStyle = document.createElement("style")
      printStyle.textContent = `
        @media print {
          body, html {
            margin: 0;
            padding: 0;
            background-color: #1d4044 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          #export-container {
            background-color: #1d4044 !important;
            padding: 0.5rem !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
          }
          .export-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .export-table th, .export-table td {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .subject-cell, .classroom-cell, .floor-cell {
            color: #eee76e !important;
            font-weight: bold !important;
          }
          .even-row {
            background-color: rgba(35, 78, 82, 0.2) !important;
          }
          .odd-row {
            background-color: rgba(40, 94, 97, 0.1) !important;
          }
        }
      `

      // Agregar la tabla y el estilo al contenedor
      exportContainer.appendChild(printStyle)
      exportContainer.appendChild(previewTable)

      // Ocultar el contenido original temporalmente
      const originalContent = document.querySelector(".schedule-container")
      const originalDisplayValue = originalContent.style.display
      originalContent.style.display = "none"

      // Agregar el contenedor de exportación al body
      document.body.appendChild(exportContainer)

      // Imprimir
      window.print()

      // Restaurar todo después de imprimir
      setTimeout(() => {
        // Eliminar el contenedor de exportación
        document.body.removeChild(exportContainer)

        // Restaurar el contenido original
        originalContent.style.display = originalDisplayValue

        // Restaurar los elementos web-only
        this.showWebOnlyContent()

        // Volver a resaltar las filas seleccionadas
        this.highlightSelectedRows()
      }, 1000)
    } else {
      // Si es exportación completa, mostrar todas las filas
      this.allRows.forEach((row) => {
        row.style.display = ""
      })

      // Imprimir la página completa
      window.print()

      // Restaurar todo después de imprimir
      setTimeout(() => {
        this.showWebOnlyContent()

        // Volver a resaltar las filas seleccionadas
        if (this.selectedRows.size > 0) {
          this.highlightSelectedRows()
        }
      }, 1000)
    }
  }

  // Realizar búsqueda
  performSearch() {
    const searchText = this.searchInput.value.trim()
    if (!searchText) return

    // Limpiar búsqueda anterior
    this.searchTerms = []
    this.searchTermsContainer.innerHTML = ""
    this.currentSearchResults = []

    // Dividir el texto de búsqueda en términos individuales
    const terms = searchText.split(/\s+/).filter((term) => term.length > 0)

    // Buscar la mejor coincidencia para cada término
    const matchedTerms = terms.map((term) => {
      const bestMatch = this.findBestMatchInData(term)
      return bestMatch || term
    })

    // Agregar los términos encontrados
    matchedTerms.forEach((term) => {
      if (!this.searchTerms.includes(term)) {
        this.searchTerms.push(term)
        this.createSearchTermChip(term)
      }
    })

    // Aplicar filtros con los nuevos términos
    this.applyFilters()

    // Limpiar el campo de búsqueda
    this.searchInput.value = ""
  }

  // Encontrar la mejor coincidencia en nuestros datos
  findBestMatchInData(searchText) {
    // Primero buscar en materias
    const bestMateriaMatch = findBestMatch(searchText, this.allMaterias)

    // Luego buscar en docentes
    const bestDocenteMatch = findBestMatch(searchText, this.allDocentes)

    // Determinar cuál es la mejor coincidencia
    if (bestMateriaMatch && bestDocenteMatch) {
      // Calcular distancias para decidir cuál es mejor
      const distToMateria = levenshteinDistance(searchText.toLowerCase(), bestMateriaMatch.toLowerCase())

      const distToDocente = levenshteinDistance(searchText.toLowerCase(), bestDocenteMatch.toLowerCase())

      return distToMateria <= distToDocente ? bestMateriaMatch : bestDocenteMatch
    }

    return bestMateriaMatch || bestDocenteMatch
  }

  // Crear un chip para un término de búsqueda
  createSearchTermChip(term) {
    const chip = document.createElement("div")
    chip.className = "search-term-chip"
    chip.style.backgroundColor = "#285e61"
    chip.style.color = "#eee76e"
    chip.style.padding = "0.25rem 0.5rem"
    chip.style.borderRadius = "1rem"
    chip.style.display = "flex"
    chip.style.alignItems = "center"
    chip.style.gap = "0.5rem"

    const termText = document.createElement("span")
    termText.textContent = term

    const removeButton = document.createElement("button")
    removeButton.innerHTML = "&times;"
    removeButton.style.background = "none"
    removeButton.style.border = "none"
    removeButton.style.color = "#eee76e"
    removeButton.style.cursor = "pointer"
    removeButton.style.fontSize = "1.2rem"
    removeButton.style.lineHeight = "1"
    removeButton.style.padding = "0"

    removeButton.addEventListener("click", () => {
      // Eliminar el término de la lista
      const index = this.searchTerms.indexOf(term)
      if (index !== -1) {
        this.searchTerms.splice(index, 1)
      }

      // Eliminar el chip
      chip.remove()

      // Volver a aplicar los filtros
      this.applyFilters()
    })

    chip.appendChild(termText)
    chip.appendChild(removeButton)

    this.searchTermsContainer.appendChild(chip)
  }

  // Aplicar filtros a las filas
  applyFilters() {
    // Restablecer resultados actuales
    this.currentSearchResults = []

    if (this.searchTerms.length === 0) {
      // Si no hay términos de búsqueda, mostrar todas las filas
      this.allRows.forEach((row) => {
        row.style.display = ""
      })
      return
    }

    // Ocultar todas las filas primero
    this.allRows.forEach((row) => {
      row.style.display = "none"
    })

    // Verificar cada fila contra todos los términos de búsqueda
    this.allRows.forEach((row) => {
      // Obtener metadatos de la fila para buscar en todos los campos
      const metadata = this.rowMetadata.get(row)
      let rowText = row.textContent.toLowerCase()

      // Si hay metadatos, asegurarse de que se incluyan todos los campos
      if (metadata) {
        rowText =
          `${metadata.materia || ""} ${metadata.catedra || ""} ${metadata.dia || ""} ${metadata.horario || ""} ${metadata.aula || ""} ${metadata.piso || ""} ${rowText}`.toLowerCase()
      }

      // Verificar si todos los términos de búsqueda están en la fila
      const allTermsMatch = this.searchTerms.every((term) => {
        const normalizedTerm = term
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")

        const normalizedRowText = rowText.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

        return normalizedRowText.includes(normalizedTerm)
      })

      if (allTermsMatch) {
        row.style.display = ""
        this.currentSearchResults.push(row)
      }
    })
  }

  // Agregar una fila a la selección
  addRowToSelection(row) {
    this.selectedRows.add(row)
    this.updateSelectionInfo()
    this.updatePreviewGrid()
    this.clearSelectionButton.disabled = false
    this.exportCustomButton.disabled = false
    this.highlightSelectedRows()
  }

  // Eliminar una fila de la selección
  removeRowFromSelection(row) {
    this.selectedRows.delete(row)
    this.updateSelectionInfo()
    this.updatePreviewGrid()
    this.clearSelectionButton.disabled = this.selectedRows.size === 0
    this.exportCustomButton.disabled = this.selectedRows.size === 0
    this.highlightSelectedRows()
  }

  // Limpiar la selección actual
  clearSelection() {
    // Desmarcar todos los checkboxes
    this.rowCheckboxes.forEach((checkbox, row) => {
      checkbox.checked = false
    })

    this.selectedRows.clear()
    this.updateSelectionInfo()
    this.updatePreviewGrid()
    this.clearSelectionButton.disabled = true
    this.exportCustomButton.disabled = true
    this.removeHighlightFromRows()
  }

  // Actualizar la información de selección
  updateSelectionInfo() {
    if (this.selectedRows.size === 0) {
      this.selectionInfo.textContent = "No hay materias seleccionadas"
    } else {
      this.selectionInfo.textContent = `${this.selectedRows.size} materias seleccionadas para exportar`
    }
  }

  // Resaltar visualmente las filas seleccionadas
  highlightSelectedRows() {
    // Primero quitar el resaltado de todas las filas
    this.removeHighlightFromRows()

    // Luego resaltar las filas seleccionadas
    this.selectedRows.forEach((row) => {
      row.style.border = "2px solid #eee76e"
      row.style.backgroundColor = "rgba(238, 231, 110, 0.1)"
    })
  }

  // Quitar el resaltado de todas las filas
  removeHighlightFromRows() {
    this.allRows.forEach((row) => {
      row.style.border = ""
      row.style.backgroundColor = ""
    })
  }

  // Ocultar elementos que solo deben verse en la web antes de imprimir
  hideWebOnlyContent() {
    const webOnlyElements = document.querySelectorAll(".web-only-content")
    webOnlyElements.forEach((element) => {
      element.style.display = "none"
    })
  }

  // Mostrar elementos web-only después de imprimir
  showWebOnlyContent() {
    const webOnlyElements = document.querySelectorAll(".web-only-content")
    webOnlyElements.forEach((element) => {
      if (element.tagName === "TD" || element.tagName === "TH") {
        if (element.classList.contains("checkbox-column")) {
          element.style.display = ""
        }
      } else if (element === this.previewContainer) {
        element.style.display = this.selectedRows.size > 0 ? "block" : "none"
      } else if (element.classList.contains("export-button-container")) {
        element.style.display = "flex"
      } else {
        element.style.display = "block"
      }
    })
  }
}

// Inicializar el buscador cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const buscador = new Buscador()
  buscador.init()
})

// Sistema de búsqueda inteligente con autocompletado
class BuscadorInteligente {
  constructor() {
    this.searchInput = null
    this.suggestionsContainer = null
    this.allMaterias = []
    this.allDocentes = []
    this.allTerms = [] // Combinación de materias y docentes
    this.initialized = false
    this.originalBuscador = null // Referencia al buscador original
    this.maxSuggestions = 5 // Número máximo de sugerencias a mostrar
    this.minCharsForSuggestions = 2 // Mínimo de caracteres para mostrar sugerencias
    this.currentFocus = -1 // Índice del elemento seleccionado en las sugerencias
  }

  // Inicializar el buscador inteligente
  init() {
    if (this.initialized) return

    // Esperar a que el buscador original esté inicializado
    const checkOriginalBuscador = setInterval(() => {
      const originalInput = document.querySelector('input[type="text"][placeholder*="Buscar"]')
      if (originalInput) {
        clearInterval(checkOriginalBuscador)
        this.setupAutocomplete(originalInput)
      }
    }, 100)

    this.initialized = true
  }

  // Configurar el autocompletado en el input de búsqueda existente
  setupAutocomplete(originalInput) {
    this.searchInput = originalInput

    // Obtener el buscador original
    this.originalBuscador = window.buscador || null

    // Si tenemos acceso al buscador original, usar sus datos
    if (this.originalBuscador) {
      this.allMaterias = this.originalBuscador.allMaterias || []
      this.allDocentes = this.originalBuscador.allDocentes || []
    } else {
      // Si no, recopilar los datos nosotros mismos
      this.collectData()
    }

    // Combinar materias y docentes en una sola lista de términos
    this.allTerms = [...this.allMaterias, ...this.allDocentes]

    // Crear el contenedor de sugerencias
    this.createSuggestionsContainer()

    // Agregar event listeners
    this.addEventListeners()
  }

  // Crear el contenedor de sugerencias
  createSuggestionsContainer() {
    // Eliminar el contenedor existente si lo hay
    const existingContainer = document.getElementById("autocomplete-suggestions")
    if (existingContainer) {
      existingContainer.remove()
    }

    // Crear nuevo contenedor
    this.suggestionsContainer = document.createElement("div")
    this.suggestionsContainer.id = "autocomplete-suggestions"
    this.suggestionsContainer.className = "autocomplete-suggestions"
    this.suggestionsContainer.style.display = "none"
    this.suggestionsContainer.style.position = "absolute"
    this.suggestionsContainer.style.zIndex = "1000"
    this.suggestionsContainer.style.backgroundColor = "#1d4044"
    this.suggestionsContainer.style.border = "1px solid #eee76e"
    this.suggestionsContainer.style.borderRadius = "0.25rem"
    this.suggestionsContainer.style.maxHeight = "200px"
    this.suggestionsContainer.style.overflowY = "auto"
    this.suggestionsContainer.style.width = `${this.searchInput.offsetWidth}px`

    // Insertar después del input de búsqueda
    this.searchInput.parentNode.insertBefore(this.suggestionsContainer, this.searchInput.nextSibling)

    // Posicionar el contenedor debajo del input
    this.updateSuggestionsPosition()

    // Actualizar la posición cuando la ventana cambie de tamaño
    window.addEventListener("resize", () => {
      this.updateSuggestionsPosition()
    })
  }

  // Actualizar la posición del contenedor de sugerencias
  updateSuggestionsPosition() {
    if (!this.searchInput || !this.suggestionsContainer) return

    const inputRect = this.searchInput.getBoundingClientRect()
    this.suggestionsContainer.style.width = `${this.searchInput.offsetWidth}px`
    this.suggestionsContainer.style.left = `${inputRect.left}px`
    this.suggestionsContainer.style.top = `${inputRect.bottom + window.scrollY}px`
  }

  // Recopilar datos de materias y docentes
  collectData() {
    // Obtener todas las materias
    const materiaElements = document.querySelectorAll(".subject-cell")
    materiaElements.forEach((el) => {
      const materia = el.textContent.trim()
      if (materia && !this.allMaterias.includes(materia)) {
        this.allMaterias.push(materia)
      }
    })

    // Obtener todos los docentes
    const docenteElements = document.querySelectorAll(".professor-cell")
    docenteElements.forEach((el) => {
      const docente = el.textContent.trim()
      if (docente && !this.allDocentes.includes(docente)) {
        this.allDocentes.push(docente)
      }
    })
  }

  // Agregar event listeners
  addEventListeners() {
    // Evento de input para mostrar sugerencias mientras el usuario escribe
    this.searchInput.addEventListener("input", () => {
      this.showSuggestions()
    })

    // Eventos de teclado para navegar por las sugerencias
    this.searchInput.addEventListener("keydown", (e) => {
      this.handleKeyNavigation(e)
    })

    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (e.target !== this.searchInput && e.target !== this.suggestionsContainer) {
        this.suggestionsContainer.style.display = "none"
        this.currentFocus = -1
      }
    })
  }

  // Mostrar sugerencias basadas en el texto actual
  showSuggestions() {
    const inputValue = this.searchInput.value.trim()

    // Limpiar sugerencias actuales
    this.suggestionsContainer.innerHTML = ""
    this.currentFocus = -1

    // Si el input está vacío o es muy corto, ocultar sugerencias
    if (inputValue.length < this.minCharsForSuggestions) {
      this.suggestionsContainer.style.display = "none"
      return
    }

    // Obtener sugerencias
    const suggestions = this.getSuggestions(inputValue)

    // Si no hay sugerencias, ocultar el contenedor
    if (suggestions.length === 0) {
      this.suggestionsContainer.style.display = "none"
      return
    }

    // Mostrar sugerencias
    suggestions.forEach((suggestion, index) => {
      const suggestionElement = document.createElement("div")
      suggestionElement.className = "autocomplete-suggestion"
      suggestionElement.style.padding = "0.5rem"
      suggestionElement.style.cursor = "pointer"
      suggestionElement.style.borderBottom = index < suggestions.length - 1 ? "1px solid #285e61" : "none"

      // Resaltar la parte que coincide con la búsqueda
      const highlightedText = this.highlightMatch(suggestion, inputValue)
      suggestionElement.innerHTML = highlightedText

      // Agregar evento de clic
      suggestionElement.addEventListener("click", () => {
        this.selectSuggestion(suggestion)
      })

      // Agregar evento de hover
      suggestionElement.addEventListener("mouseover", () => {
        this.currentFocus = index
        this.addActive()
      })

      this.suggestionsContainer.appendChild(suggestionElement)
    })

    // Mostrar el contenedor de sugerencias
    this.suggestionsContainer.style.display = "block"
    this.updateSuggestionsPosition()
  }

  // Obtener sugerencias basadas en el texto de entrada
  getSuggestions(inputValue) {
    const normalizedInput = this.normalizeText(inputValue.toLowerCase())

    // Primero buscar coincidencias exactas al inicio
    const exactMatches = this.allTerms.filter((term) =>
      this.normalizeText(term.toLowerCase()).startsWith(normalizedInput),
    )

    // Luego buscar coincidencias parciales (contiene)
    const partialMatches = this.allTerms.filter(
      (term) => !exactMatches.includes(term) && this.normalizeText(term.toLowerCase()).includes(normalizedInput),
    )

    // Finalmente, buscar coincidencias fuzzy para términos que no coinciden exactamente
    const fuzzyMatches = []
    if (exactMatches.length + partialMatches.length < this.maxSuggestions) {
      const remainingSlots = this.maxSuggestions - (exactMatches.length + partialMatches.length)

      this.allTerms.forEach((term) => {
        if (!exactMatches.includes(term) && !partialMatches.includes(term)) {
          const distance = this.levenshteinDistance(normalizedInput, this.normalizeText(term.toLowerCase()))
          const threshold = Math.max(2, Math.floor(normalizedInput.length * 0.4))

          if (distance <= threshold) {
            fuzzyMatches.push({ term, distance })
          }
        }
      })

      // Ordenar por distancia (menor primero)
      fuzzyMatches.sort((a, b) => a.distance - b.distance)
    }

    // Combinar y limitar resultados
    const allSuggestions = [
      ...exactMatches,
      ...partialMatches,
      ...fuzzyMatches
        .slice(0, this.maxSuggestions - (exactMatches.length + partialMatches.length))
        .map((match) => match.term),
    ].slice(0, this.maxSuggestions)

    return allSuggestions
  }

  // Normalizar texto (quitar acentos)
  normalizeText(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  }

  // Calcular distancia de Levenshtein entre dos cadenas
  levenshteinDistance(a, b) {
    if (a.length === 0) return b.length
    if (b.length === 0) return a.length

    const matrix = []

    // Inicializar matriz
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }

    for (let i = 0; i <= a.length; i++) {
      matrix[0][i] = i
    }

    // Rellenar matriz
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // sustitución
            matrix[i][j - 1] + 1, // inserción
            matrix[i - 1][j] + 1, // eliminación
          )
        }
      }
    }

    return matrix[b.length][a.length]
  }

  // Resaltar la parte del texto que coincide con la búsqueda
  highlightMatch(text, query) {
    const normalizedText = this.normalizeText(text.toLowerCase())
    const normalizedQuery = this.normalizeText(query.toLowerCase())

    // Si es una coincidencia exacta al inicio
    if (normalizedText.startsWith(normalizedQuery)) {
      return `<strong style="color: #eee76e">${text.substring(0, query.length)}</strong>${text.substring(query.length)}`
    }

    // Si es una coincidencia parcial (contiene)
    const index = normalizedText.indexOf(normalizedQuery)
    if (index !== -1) {
      return `${text.substring(0, index)}<strong style="color: #eee76e">${text.substring(index, index + query.length)}</strong>${text.substring(index + query.length)}`
    }

    // Si es una coincidencia fuzzy, no resaltamos nada
    return text
  }

  // Seleccionar una sugerencia
  selectSuggestion(suggestion) {
    this.searchInput.value = suggestion
    this.suggestionsContainer.style.display = "none"

    // Si existe el buscador original, realizar la búsqueda
    if (this.originalBuscador && typeof this.originalBuscador.performSearch === "function") {
      this.originalBuscador.performSearch()
    } else {
      // Disparar evento de enter en el input para simular búsqueda
      const event = new KeyboardEvent("keypress", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
      })
      this.searchInput.dispatchEvent(event)
    }
  }

  // Manejar navegación por teclado
  handleKeyNavigation(e) {
    // Si el contenedor de sugerencias está oculto, no hacer nada
    if (this.suggestionsContainer.style.display === "none") return

    const suggestions = this.suggestionsContainer.querySelectorAll(".autocomplete-suggestion")

    if (e.key === "ArrowDown") {
      e.preventDefault()
      this.currentFocus++
      this.addActive(suggestions)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      this.currentFocus--
      this.addActive(suggestions)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (this.currentFocus > -1 && suggestions[this.currentFocus]) {
        this.selectSuggestion(suggestions[this.currentFocus].textContent.replace(/<\/?[^>]+(>|$)/g, ""))
      }
    } else if (e.key === "Escape") {
      this.suggestionsContainer.style.display = "none"
      this.currentFocus = -1
    }
  }

  // Agregar clase activa al elemento seleccionado
  addActive(suggestions = null) {
    if (!suggestions) {
      suggestions = this.suggestionsContainer.querySelectorAll(".autocomplete-suggestion")
    }

    // Remover clase activa de todos los elementos
    Array.from(suggestions).forEach((suggestion) => {
      suggestion.style.backgroundColor = ""
    })

    // Si no hay sugerencias, salir
    if (!suggestions.length) return

    // Ajustar el índice si está fuera de rango
    if (this.currentFocus >= suggestions.length) this.currentFocus = 0
    if (this.currentFocus < 0) this.currentFocus = suggestions.length - 1

    // Agregar clase activa al elemento seleccionado
    suggestions[this.currentFocus].style.backgroundColor = "#285e61"

    // Asegurar que el elemento seleccionado sea visible
    suggestions[this.currentFocus].scrollIntoView({ block: "nearest" })
  }
}

// Inicializar el buscador inteligente cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Guardar referencia al buscador original si existe
  const originalBuscadorInit = window.buscador ? window.buscador.init : null

  // Crear instancia del buscador inteligente
  const buscadorInteligente = new BuscadorInteligente()

  // Inicializar el buscador original primero si existe
  if (originalBuscadorInit) {
    const originalInit = window.buscador.init
    window.buscador.init = () => {
      originalInit.apply(window.buscador)
      // Luego inicializar el buscador inteligente
      buscadorInteligente.init()
    }

    // Si ya se ha inicializado, inicializar el buscador inteligente directamente
    if (window.buscador.initialized) {
      buscadorInteligente.init()
    }
  } else {
    // Si no hay buscador original, inicializar directamente
    buscadorInteligente.init()
  }
})
