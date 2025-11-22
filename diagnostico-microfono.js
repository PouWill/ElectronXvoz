/**
 * SCRIPT DE DIAGNÓSTICO DE MICRÓFONO
 * 
 * Copia este código en la consola del navegador (F12 > Console)
 * para diagnosticar problemas con el micrófono
 */

console.log('='.repeat(80));
console.log('DIAGNÓSTICO DE MICRÓFONO Y AUDIO');
console.log('='.repeat(80));

// 1. Verificar soporte de Web Audio API
console.log('\n1. VERIFICACIÓN DE WEB AUDIO API');
console.log('─'.repeat(80));

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  console.log('✓ getUserMedia soportado');
} else {
  console.error('✗ getUserMedia NO soportado');
}

const AudioContext = window.AudioContext || window.webkitAudioContext;
if (AudioContext) {
  console.log('✓ AudioContext soportado');
  console.log('  Estado:', AudioContext.prototype.state);
} else {
  console.error('✗ AudioContext NO soportado');
}

// 2. Verificar soporte de Web Speech API
console.log('\n2. VERIFICACIÓN DE WEB SPEECH API');
console.log('─'.repeat(80));

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  console.log('✓ SpeechRecognition soportado');
} else {
  console.error('✗ SpeechRecognition NO soportado');
}

// 3. Verificar dispositivos de audio
console.log('\n3. LISTA DE DISPOSITIVOS DE AUDIO');
console.log('─'.repeat(80));

if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
  navigator.mediaDevices.enumerateDevices().then(devices => {
    const audioDevices = devices.filter(d => d.kind === 'audioinput');
    
    if (audioDevices.length === 0) {
      console.error('✗ No se encontraron dispositivos de audio');
    } else {
      console.log(`✓ ${audioDevices.length} dispositivo(s) de audio encontrado(s):`);
      audioDevices.forEach((device, index) => {
        console.log(`  ${index + 1}. ${device.label || 'Micrófono'}`);
        console.log(`     ID: ${device.deviceId}`);
      });
    }
  }).catch(err => {
    console.error('✗ Error al enumerar dispositivos:', err);
  });
} else {
  console.error('✗ enumerateDevices NO soportado');
}

// 4. Probar acceso al micrófono
console.log('\n4. PRUEBA DE ACCESO AL MICRÓFONO');
console.log('─'.repeat(80));
console.log('Intentando acceder al micrófono...\n');

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✓ ACCESO AL MICRÓFONO EXITOSO');
    console.log('\nDetalles del stream:');
    
    const audioTracks = stream.getAudioTracks();
    console.log(`  Pistas de audio: ${audioTracks.length}`);
    
    if (audioTracks.length > 0) {
      const track = audioTracks[0];
      console.log(`  Label: ${track.label}`);
      console.log(`  Estado: ${track.readyState}`);
      console.log(`  Habilitado: ${track.enabled}`);
      
      const settings = track.getSettings();
      console.log(`  Configuración:`);
      console.log(`    - Frecuencia: ${settings.sampleRate} Hz`);
      console.log(`    - Canales: ${settings.channelCount}`);
      console.log(`    - Echo Cancellation: ${settings.echoCancellation}`);
      console.log(`    - Noise Suppression: ${settings.noiseSuppression}`);
      console.log(`    - Auto Gain Control: ${settings.autoGainControl}`);
    }
    
    // Detener el stream después de 2 segundos
    console.log('\nDeteniendo stream en 2 segundos...');
    setTimeout(() => {
      stream.getTracks().forEach(track => track.stop());
      console.log('✓ Stream detenido');
    }, 2000);
  })
  .catch(err => {
    console.error('✗ ERROR AL ACCEDER AL MICRÓFONO');
    console.error(`\nTipo de error: ${err.name}`);
    console.error(`Mensaje: ${err.message}`);
    
    // Proporcionar soluciones específicas
    console.error('\nSOLUCIONES SEGÚN EL TIPO DE ERROR:');
    
    if (err.name === 'NotAllowedError') {
      console.error('  → Permiso denegado por el usuario');
      console.error('  → Solución: Permite el micrófono en el cuadro de diálogo');
    } else if (err.name === 'NotFoundError') {
      console.error('  → No hay micrófono conectado');
      console.error('  → Solución: Conecta un micrófono USB o revisa si funciona en otra app');
    } else if (err.name === 'NotReadableError') {
      console.error('  → El micrófono está siendo usado por otra aplicación');
      console.error('  → Solución: Cierra otras apps que usen el micrófono');
    } else if (err.name === 'SecurityError') {
      console.error('  → Error de seguridad (HTTPS requerido)');
      console.error('  → Solución: Usa HTTPS o localhost');
    } else if (err.name === 'TypeError') {
      console.error('  → Error de tipo (API no soportada)');
      console.error('  → Solución: Actualiza tu navegador (Chrome, Edge, Firefox)');
    }
  });

// 5. Información del navegador
console.log('\n5. INFORMACIÓN DEL NAVEGADOR');
console.log('─'.repeat(80));

const ua = navigator.userAgent;
const browser = ua.includes('Chrome') ? 'Chrome' : 
                ua.includes('Firefox') ? 'Firefox' : 
                ua.includes('Safari') ? 'Safari' : 
                ua.includes('Edge') ? 'Edge' : 'Otro';

console.log(`Navegador: ${browser}`);
console.log(`User Agent: ${ua}`);
console.log(`Plataforma: ${navigator.platform}`);
console.log(`Online: ${navigator.onLine ? 'Sí' : 'No'}`);

// 6. Resumen
console.log('\n' + '='.repeat(80));
console.log('RESUMEN DEL DIAGNÓSTICO');
console.log('='.repeat(80));

console.log(`
✓ Si ves "ACCESO AL MICRÓFONO EXITOSO", tu micrófono funciona correctamente
✓ Si ves un error, la solución se proporciona arriba
✓ Abre esta consola cuando tengas problemas para debugging

Instrucciones:
1. Abre DevTools: F12
2. Ve a la pestaña "Console"
3. Copia todo este código y pégalo en la consola
4. Presiona Enter
5. Verás el resultado del diagnóstico

Nota: Este script también se ejecuta automáticamente al cargar la aplicación.
`);

console.log('='.repeat(80));
