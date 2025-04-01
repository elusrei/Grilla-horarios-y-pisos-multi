
// Función para exportar a PDF
document.getElementById('exportButton').addEventListener('click',
function() {
  // En dispositivos móviles, mostrar un mensaje de instrucción
  if (window.innerWidth <= 768) {
    alert('Se abrirá la vista de impresión. Selecciona "Guardar como PDF" en las opciones de impresión.');
  }
  window.print();
}
)

// Función para calcular el piso a partir del aula (por si se necesita dinámicamente)
function getFloor(classroom) {
  const firstDigit = classroom.charAt(0)
  if (firstDigit === "0") return "PB"
  return `P${firstDigit}`
}

// Verificar si estamos en un dispositivo móvil
function isMobile() {
  return window.innerWidth <= 768
}

// Ajustar la posición del botón de exportación en dispositivos móviles
function adjustExportButtonPosition() {
  const exportButton = document.querySelector(".export-button-container")
  if (isMobile()) {
    exportButton.style.bottom = "1rem"
    exportButton.style.top = "auto"
  } else {
    exportButton.style.bottom = "auto"
    exportButton.style.top = "1rem"
  }
}

// Ejecutar al cargar la página y cuando cambie el tamaño de la ventana
window.addEventListener("load", adjustExportButtonPosition)
window.addEventListener("resize", adjustExportButtonPosition)

