/**
 * Script de prueba para verificar la conexión entre frontend y backend
 * Ejecutar desde la consola del navegador o herramientas de desarrollo
 */

// Función para probar la API de About
async function testAboutAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/about', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.data?.highlights) {
      data.data.highlights.forEach((highlight, index) => {
        console.log(`  ${index + 1}. ${highlight.title} (${highlight.imageCloudinaryId})`);
      });
    }

    return data;
  } catch (error) {
    console.error('❌ Error conectando a la API:', error);
    throw error;
  }
}

// Función para probar desde Node.js (backend)
export async function testAboutAPIFromNode() {
  const fetch = (await import('node-fetch')).default;
  return testAboutAPI();
}

// Para usar en el navegador
if (typeof window !== 'undefined') {
  (window as any).testAboutAPI = testAboutAPI;
  console.log('💡 Usa testAboutAPI() en la consola para probar la conexión');
}

export { testAboutAPI };
