/**
 * INTEGRACIÓN DE API DE TRANSCRIPCIÓN DE VOZ
 * 
 * Este archivo contiene el template para integrar tu API de speech-to-text
 * cuando recibas el token y los datos de configuración.
 */

// Plantilla para configuración de API
const STT_CONFIG = {
  // Reemplaza con tu API
  API_KEY: 'TU_API_KEY_AQUI',
  API_URL: 'https://api.ejemplo.com/transcribe',
  LANGUAGE: 'es-ES',
  
  // Opciones adicionales
  includeAudio: true,
  returnConfidence: true
};

/**
 * Función para llamar a tu API de transcripción
 * Reemplaza esta función cuando tengas los datos de tu API
 */
async function transcribeAudio(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    formData.append('language', STT_CONFIG.LANGUAGE);
    formData.append('api_key', STT_CONFIG.API_KEY);

    const response = await fetch(STT_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STT_CONFIG.API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.transcription || result.text;
  } catch (error) {
    console.error('Error en transcripción:', error);
    return null;
  }
}

/**
 * Función mejorada de activateMode con integración de API
 * Reemplaza la función activateMode() en renderer.js con esta cuando tengas tu API
 */
async function activateModeWithAPI() {
  const mainSearchBar = document.getElementById('mainSearchBar');
  mainSearchBar.classList.add('active');
  
  console.log('🎤 Palabra de activación detectada - Iniciando grabación de audio...');
  
  try {
    // 1. Grabar audio durante 5 segundos
    const audioBlob = await recordAudio(5000);
    console.log('✓ Audio grabado:', audioBlob.size, 'bytes');
    
    // 2. Enviar a tu API de transcripción
    console.log('📤 Enviando audio a API de transcripción...');
    const transcription = await transcribeAudio(audioBlob);
    
    if (transcription) {
      console.log('✓ Transcripción completada:', transcription);
      
      // 3. Llenar el input de búsqueda
      const searchInput = document.getElementById('searchInput');
      searchInput.value = transcription;
      
      // 4. Ejecutar búsqueda automáticamente
      document.getElementById('searchBtn').click();
    } else {
      console.error('No se pudo transcribir el audio');
    }
    
  } catch (error) {
    console.error('Error en proceso de activación:', error);
  } finally {
    // Quitar el resplandor
    setTimeout(() => {
      mainSearchBar.classList.remove('active');
    }, 3000);
  }
}

/**
 * Función para grabar audio desde el micrófono
 */
async function recordAudio(duration = 5000) {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        stream.getTracks().forEach(track => track.stop());
        resolve(audioBlob);
      };
      
      mediaRecorder.start();
      
      // Detener grabación después del tiempo especificado
      setTimeout(() => {
        mediaRecorder.stop();
      }, duration);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * INSTRUCCIONES PARA INTEGRACIÓN:
 * 
 * 1. Reemplaza STT_CONFIG con los datos de tu API
 * 2. Actualiza la función transcribeAudio() según tu API
 * 3. En renderer.js, reemplaza activateMode() con activateModeWithAPI()
 * 4. Prueba con un audio de prueba
 * 
 * EJEMPLO CON GOOGLE CLOUD SPEECH-TO-TEXT:
 * 
 * const STT_CONFIG = {
 *   API_KEY: 'TU_GOOGLE_CLOUD_API_KEY',
 *   API_URL: 'https://speech.googleapis.com/v1/speech:recognize',
 *   LANGUAGE: 'es-ES'
 * };
 * 
 * EJEMPLO CON AZURE:
 * 
 * const STT_CONFIG = {
 *   API_KEY: 'TU_AZURE_API_KEY',
 *   API_URL: 'https://TU_REGION.tts.speech.microsoft.com/cognitiveservices/v1',
 *   LANGUAGE: 'es-ES'
 * };
 */

module.exports = {
  STT_CONFIG,
  transcribeAudio,
  activateModeWithAPI,
  recordAudio
};
