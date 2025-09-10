// Test simple para la función generateCertificateImageUrl
console.log('=== TEST DE MIDUDEV CERTIFICATE URL ===');

// Simulamos la configuración de MiduDev
const midudev = {
  id: 'midudev',
  name: 'MiduDev',
  certificateImageUrl: 'https://certificados.midudev.com/{credentialId}.pdf',
};

const credentialId = 'db69b25f-f705-4166-b682-d5df553ab627';

// Simulamos la función generateCertificateImageUrl
function generateCertificateImageUrl(issuer, credentialId) {
  if (!issuer.certificateImageUrl || !credentialId) return undefined;
  return issuer.certificateImageUrl.replace('{credentialId}', credentialId);
}

const result = generateCertificateImageUrl(midudev, credentialId);

console.log('Issuer:', midudev.id);
console.log('Template:', midudev.certificateImageUrl);
console.log('Credential ID:', credentialId);
console.log('Generated URL:', result);
console.log('Expected URL:', `https://certificados.midudev.com/${credentialId}.pdf`);
console.log('Match:', result === `https://certificados.midudev.com/${credentialId}.pdf`);

// Verificación adicional de la extensión
console.log('Ends with .pdf:', result && result.endsWith('.pdf'));
console.log('URL contains .pdf:', result && result.includes('.pdf'));
