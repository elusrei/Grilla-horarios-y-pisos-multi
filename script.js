// Función para exportar a PDF
document.getElementById('exportButton').addEventListener('click',
function() {
  // En dispositivos móviles, mostrar un mensaje de instrucción
  if (window.innerWidth <= 768) {
    alert('Se abrirá la vista de impresión. Selecciona "Guardar como PDF" en las opciones de impresión.');
  }
  
  // Add a style element to force A4 size and remove margins
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @page {
      size: A4;
      margin: 0mm !important; /* Remove all margins */
    }
    
    @media print {
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .printable-content {
        padding: 5mm; /* Add a small internal padding instead of margin */
      }
    }
  `;
  document.head.appendChild(styleElement);
  
  // Trigger print
  window.print();
  
  // Remove the style element after printing
  setTimeout(() => {
    document.head.removeChild(styleElement);
  }, 1000);
})

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

console.log("Script loaded with A4 export fix");