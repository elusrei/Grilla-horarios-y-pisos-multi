// Función para exportar a PDF
document.getElementById('exportButton').addEventListener('click', function() {
    window.print();
  });
  
  // Función para calcular el piso a partir del aula (por si se necesita dinámicamente)
  function getFloor(classroom) {
    const firstDigit = classroom.charAt(0);
    if (firstDigit === '0') return 'PB';
    return `P${firstDigit}`;
  }