/**
 * EJEMPLOS DE INTEGRACIÓN CON DIFERENTES APIs
 * 
 * Copia y pega la sección que corresponda a tu API
 */

// ============================================================================
// EJEMPLO 1: GOOGLE CLOUD SPEECH-TO-TEXT
// ============================================================================

const GOOGLE_STT_CONFIG = {
  API_KEY: 'TU_GOOGLE_API_KEY',
  LANGUAGE_CODE: 'es-ES',
};

async function transcribeWithGoogle(audioBlob) {
  // Convertir blob a base64
  const base64Audio = await blobToBase64(audioBlob);
  
  const response = await fetch(
    `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_STT_CONFIG.API_KEY}`,
    {
      method: 'POST',
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS',
          languageCode: GOOGLE_STT_CONFIG.LANGUAGE_CODE,
          model: 'latest_long'
        },
        audio: {
          content: base64Audio
        }
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data.results?.[0]?.alternatives?.[0]?.transcript || '';
}

// ============================================================================
// EJEMPLO 2: MICROSOFT AZURE SPEECH-TO-TEXT
// ============================================================================

const AZURE_STT_CONFIG = {
  API_KEY: 'TU_AZURE_API_KEY',
  REGION: 'eastus', // Cambia según tu región
  LANGUAGE: 'es-ES'
};

async function transcribeWithAzure(audioBlob) {
  const response = await fetch(
    `https://${AZURE_STT_CONFIG.REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      body: audioBlob,
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_STT_CONFIG.API_KEY,
        'Content-Type': 'audio/wav',
        'Accept': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data.DisplayText || data.NBest?.[0]?.Display || '';
}

// ============================================================================
// EJEMPLO 3: OPENAI WHISPER API
// ============================================================================

const WHISPER_CONFIG = {
  API_KEY: 'TU_OPENAI_API_KEY',
  MODEL: 'whisper-1',
  LANGUAGE: 'es'
};

async function transcribeWithWhisper(audioBlob) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', WHISPER_CONFIG.MODEL);
  formData.append('language', WHISPER_CONFIG.LANGUAGE);
  
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHISPER_CONFIG.API_KEY}`
    },
    body: formData
  });
  
  const data = await response.json();
  return data.text || '';
}

// ============================================================================
// EJEMPLO 4: IBM WATSON SPEECH-TO-TEXT
// ============================================================================

const WATSON_STT_CONFIG = {
  API_KEY: 'TU_IBM_API_KEY',
  AUTH_URL: 'https://api.us-south.speech-to-text.watson.cloud.ibm.com',
  LANGUAGE_MODEL: 'es-ES_BroadbandModel'
};

async function transcribeWithWatson(audioBlob) {
  // Obtener token de autenticación
  const authResponse = await fetch(`${WATSON_STT_CONFIG.AUTH_URL}/v1/authorize?api_key=${WATSON_STT_CONFIG.API_KEY}`, {
    method: 'GET'
  });
  const authData = await authResponse.text();
  
  // Transcribir audio
  const response = await fetch(
    `${WATSON_STT_CONFIG.AUTH_URL}/v1/recognize?model=${WATSON_STT_CONFIG.LANGUAGE_MODEL}`,
    {
      method: 'POST',
      body: audioBlob,
      headers: {
        'Authorization': `Bearer ${authData}`,
        'Content-Type': 'audio/webm'
      }
    }
  );
  
  const data = await response.json();
  return data.results?.[0]?.alternatives?.[0]?.transcript || '';
}

// ============================================================================
// EJEMPLO 5: PICOVOICE LEOPARD (Transcripción + Wake Word)
// ============================================================================

const LEOPARD_CONFIG = {
  ACCESS_KEY: 'TU_PICOVOICE_ACCESS_KEY',
  LANGUAGE: 'es'
};

async function transcribeWithLeopard(audioBlob) {
  // Nota: Leopard requiere WebAssembly
  // Necesitas cargar la librería primero
  
  try {
    // Aquí iría la integración con la librería de Leopard
    const buffer = await audioBlob.arrayBuffer();
    
    // La librería transpone el audio a PCM
    const pcmBuffer = new Int16Array(buffer);
    
    // Llamar al modelo local (una vez descargado)
    // const transcript = await leopard.process(pcmBuffer);
    
    return 'Transcripción con Leopard';
  } catch (error) {
    console.error('Error con Leopard:', error);
    return '';
  }
}

// ============================================================================
// EJEMPLO 6: CUSTOM API (Tu propia API)
// ============================================================================

const CUSTOM_API_CONFIG = {
  API_URL: 'https://tu-servidor.com/api/transcribe',
  API_TOKEN: 'TU_TOKEN_DE_AUTENTICACION'
};

async function transcribeWithCustomAPI(audioBlob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');
  formData.append('language', 'es-ES');
  
  const response = await fetch(CUSTOM_API_CONFIG.API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CUSTOM_API_CONFIG.API_TOKEN}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.transcription || data.text || '';
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Convertir Blob a Base64
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Versión mejorada de activateMode con manejo de errores
 */
async function activateModeWithAPI(transcribeFunction) {
  const mainSearchBar = document.getElementById('mainSearchBar');
  const searchInput = document.getElementById('searchInput');
  
  mainSearchBar.classList.add('active');
  console.log('🎤 Registrando audio...');
  
  try {
    // Grabar audio durante 5 segundos
    const audioBlob = await recordAudio(5000);
    console.log('✓ Audio grabado:', (audioBlob.size / 1024).toFixed(2), 'KB');
    
    // Transcribir con la función especificada
    console.log('📤 Transcribiendo...');
    const transcription = await transcribeFunction(audioBlob);
    
    if (transcription && transcription.trim()) {
      console.log('✓ Transcripción:', transcription);
      searchInput.value = transcription;
      document.getElementById('searchBtn').click();
    } else {
      console.warn('⚠️  Transcripción vacía');
      alert('No se pudo entender claramente. Intenta de nuevo.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert(`Error: ${error.message}`);
  } finally {
    setTimeout(() => {
      mainSearchBar.classList.remove('active');
    }, 3000);
  }
}

// ============================================================================
// CÓMO USAR
// ============================================================================

/*

1. Copiar la función que corresponda a tu API (ej: transcribeWithGoogle)

2. En renderer.js, reemplazar activateMode() con:

   async function activateMode() {
     await activateModeWithAPI(transcribeWithGoogle);
   }

3. Configurar las variables de API_KEY, REGION, etc.

4. Probar con un audio de prueba

EJEMPLO COMPLETO:

  async function activateMode() {
    await activateModeWithAPI(transcribeWithWhisper);
  }

*/

// ============================================================================
// EXPORTAR PARA USO EN renderer.js
// ============================================================================

module.exports = {
  transcribeWithGoogle,
  transcribeWithAzure,
  transcribeWithWhisper,
  transcribeWithWatson,
  transcribeWithLeopard,
  transcribeWithCustomAPI,
  activateModeWithAPI,
  blobToBase64
};
