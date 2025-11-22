// Variables globales
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const youtubeFrame = document.getElementById('youtubeFrame');
const activationInput = document.getElementById('activationInput');
const updateActivationBtn = document.getElementById('updateActivationBtn');
const micBtn = document.getElementById('micBtn');
const permissionPrompt = document.getElementById('permissionPrompt');
const allowBtn = document.getElementById('allowBtn');
const denyBtn = document.getElementById('denyBtn');
const mainSearchBar = document.getElementById('mainSearchBar');

let stream = null;
let isListening = false;
let activationWord = 'hola';
let microphonePermitted = false;
let audioContext = null;
let recognitionInstance = null;

// ✓ SOLUCIÓN: Simplificar solicitud de permisos
async function requestMicrophonePermission() {
  return new Promise((resolve) => {
    console.log('Mostrando diálogo de permisos...');
    permissionPrompt.classList.add('show');
    
    let handled = false;

    const handleAllow = async () => {
      if (handled) return;
      handled = true;
      
      console.log('Usuario hizo clic en PERMITIR');
      permissionPrompt.classList.remove('show');
      removeListeners();
      
      try {
        console.log('Solicitando acceso al micrófono...');
        
        // ✓ Configuración simplificada para mejor compatibilidad
        const constraints = {
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        console.log('✓ Micrófono accesible');
        console.log('Dispositivo de audio:', stream.getAudioTracks()[0]?.label || 'Desconocido');
        
        // Crear AudioContext
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('✓ AudioContext creado');
        
        isListening = true;
        microphonePermitted = true;
        micBtn.classList.add('listening');
        micBtn.textContent = '🎤 Escuchando...';
        
        // Iniciar reconocimiento de voz
        startWebSpeechRecognition();
        
        console.log('✓ Sistema listo para escuchar');
        resolve(true);
        
      } catch (err) {
        console.error('✗ Error detallado al acceder al micrófono:');
        console.error('Tipo de error:', err.name);
        console.error('Mensaje:', err.message);
        console.error('Stack:', err.stack);
        
        let errorMsg = 'Error desconocido';
        
        if (err.name === 'NotAllowedError') {
          errorMsg = 'Permiso denegado. El usuario rechazó el acceso al micrófono.';
        } else if (err.name === 'NotFoundError') {
          errorMsg = 'No se encontró micrófono. Verifica que esté conectado.';
        } else if (err.name === 'NotReadableError') {
          errorMsg = 'El micrófono está siendo usado por otra aplicación.';
        } else if (err.name === 'SecurityError') {
          errorMsg = 'Error de seguridad. Esta página puede no tener permisos para acceder al micrófono.';
        } else if (err.name === 'TypeError') {
          errorMsg = 'Error de tipo. El navegador puede no soportar esta característica.';
        }
        
        alert(`⚠️  No se pudo acceder al micrófono\n\nDetalles: ${errorMsg}\n\nVerifica:\n1. El micrófono está conectado\n2. No está siendo usado por otra app\n3. Los permisos del sistema`);
        
        resolve(false);
      }
    };

    const handleDeny = () => {
      if (handled) return;
      handled = true;
      
      console.log('Usuario hizo clic en DENEGAR');
      permissionPrompt.classList.remove('show');
      removeListeners();
      microphonePermitted = false;
      
      alert('Permiso denegado. La aplicación no puede funcionar sin acceso al micrófono.');
      resolve(false);
    };

    const removeListeners = () => {
      allowBtn.removeEventListener('click', handleAllow);
      denyBtn.removeEventListener('click', handleDeny);
    };

    allowBtn.addEventListener('click', handleAllow);
    denyBtn.addEventListener('click', handleDeny);
  });
}

// Función para usar Web Speech API (más compatible)
function startWebSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    alert('Tu navegador no soporta Web Speech API. Por favor, usa Chrome o Edge.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'es-ES';

  recognitionInstance = recognition; // Guardar referencia global

  recognition.onstart = () => {
    console.log('✓ Reconocimiento de voz INICIADO');
    micBtn.classList.add('listening');
  };

  recognition.onresult = (event) => {
    let transcript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const isFinal = event.results[i].isFinal;
      const transcriptPart = event.results[i][0].transcript.toLowerCase();
      transcript += transcriptPart;
      
      if (isFinal) {
        console.log('Escuchado (final):', transcriptPart);
        checkForActivationWord(transcriptPart);
      } else {
        console.log('Escuchando (interim):', transcriptPart);
      }
    }
  };

  recognition.onerror = (event) => {
    console.error('✗ Error en reconocimiento de voz:', event.error);
    
    // Reintentar automáticamente después de errores
    if (event.error === 'no-speech') {
      console.log('Sin sonido detectado, continuando escucha...');
    } else if (event.error === 'network') {
      console.log('Error de red, reintentando...');
    }
  };

  recognition.onend = () => {
    console.log('Reconocimiento finalizado, reiniciando...');
    if (isListening && microphonePermitted) {
      try {
        recognition.start();
        console.log('✓ Reconocimiento reiniciado');
      } catch (err) {
        console.error('Error al reiniciar recognition:', err);
      }
    }
  };

  // Iniciar reconocimiento
  try {
    recognition.start();
    console.log('✓ Reconocimiento iniciado correctamente');
  } catch (err) {
    console.error('Error al iniciar recognition:', err);
  }
}

// Función para verificar la palabra de activación
function checkForActivationWord(transcript) {
  const normalizedWord = activationWord.toLowerCase().trim();
  const normalizedTranscript = transcript.toLowerCase().trim();

  // Verificar si la transcripción contiene la palabra de activación
  if (normalizedTranscript.includes(normalizedWord)) {
    console.log('✓ ¡PALABRA DE ACTIVACIÓN DETECTADA!:', activationWord);
    activateMode();
  } else {
    console.log('✗ Escuchado pero no coincide. Esperando:', normalizedWord, 'Recibido:', normalizedTranscript);
  }
}

// Función para activar el modo (cuando se detecta palabra de activación)
function activateMode() {
  mainSearchBar.classList.add('active');
  
  // Sonido opcional
  playActivationSound();
  
  // Mantener el resplandor durante 3 segundos
  setTimeout(() => {
    mainSearchBar.classList.remove('active');
  }, 3000);
  
  console.log('Barra activada - ¡Lista para usar la API de transcripción!');
}

// Función para reproducir sonido de activación
function playActivationSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.setValueAtTime(0, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (err) {
    console.warn('No se pudo reproducir sonido de activación:', err);
  }
}

// Botón para actualizar palabra de activación
updateActivationBtn.addEventListener('click', () => {
  const newWord = activationInput.value.trim();
  if (newWord) {
    activationWord = newWord;
    console.log('✓ Palabra de activación actualizada a:', activationWord);
    alert(`Palabra de activación actualizada a: "${activationWord}"`);
    activationInput.value = '';
  } else {
    alert('Por favor, ingresa una palabra de activación válida');
  }
});

// Permitir actualizar con Enter en el input
activationInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    updateActivationBtn.click();
  }
});

// Función para buscar en YouTube
function performSearch() {
  const searchQuery = searchInput.value.trim();
  if (searchQuery) {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    youtubeFrame.src = searchUrl;
    searchInput.value = '';
    // Esperar a que el webview cargue y hacer click en el primer video
    youtubeFrame.addEventListener('dom-ready', () => {
      youtubeFrame.executeJavaScript(`
        (function() {
          let attempts = 0;
          const maxAttempts = 20;
          const tryClick = () => {
            // Buscar el primer video en los resultados
            const firstVideo = document.querySelector('ytd-video-renderer a#video-title');
            if (firstVideo) {
              firstVideo.click();
            } else if (attempts < maxAttempts) {
              attempts++;
              setTimeout(tryClick, 500);
            }
          };
          tryClick();
        })();
      `);
    }, { once: true });
  }
}

function playFirstVideo() {
  youtubeFrame.executeJavaScript(`
    (function() {
      const waitForVideos = setInterval(() => {
        const firstVideo = document.querySelector('a#video-title');
        if (firstVideo) {
          clearInterval(waitForVideos);
          firstVideo.click();
        }
      }, 500);
      
      setTimeout(() => clearInterval(waitForVideos), 5000);
    })();
  `);
}

// Event listeners para búsqueda
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});

// Integración Porcupine Web SDK
import { PorcupineWorkerFactory, BuiltInKeyword } from '@picovoice/porcupine-web';

micBtn.addEventListener('click', async () => {
  const permiso = await requestMicrophonePermission();
  if (!permiso) {
    alert('No se concedió permiso al micrófono. La app no podrá escuchar.');
    return;
  }

  const keyword = 'mani'; // Fuerza la palabra clave 'mani' para pruebas
  const accessKey = '4iAuDRrRSpeK8o4rXVvvP6/RdBH9G9AJ/iXhDFSe53Z/K0ZP5WpP0A==';

  try {
    // Usa palabra integrada, por ejemplo "porcupine" o "blueberry"
    const porcupine = await PorcupineWorkerFactory.create(
      [
        {
          builtin: BuiltInKeyword['mani'] || BuiltInKeyword['porcupine'],
          sensitivity: 0.7
        }
      ],
      (keywordIndex) => {
        mainSearchBar.classList.add('active');
        mainSearchBar.style.backgroundColor = '#27ae60';
        setTimeout(() => {
          mainSearchBar.style.backgroundColor = '';
          mainSearchBar.classList.remove('active');
        }, 3000);
        console.log('¡Palabra de activación detectada por Porcupine!');
      },
      {
        accessKey: accessKey
      }
    );

    if (!stream) {
      alert('No se obtuvo el stream de audio. Verifica el micrófono.');
      return;
    }
    if (!audioContext) {
      alert('No se pudo crear el contexto de audio.');
      return;
    }

    const audioProcessor = audioContext.createScriptProcessor(512, 1, 1);
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(audioProcessor);
    audioProcessor.connect(audioContext.destination);

    audioProcessor.onaudioprocess = (event) => {
      try {
        const input = event.inputBuffer.getChannelData(0);
        porcupine.postMessage({ command: 'process', inputFrame: input });
      } catch (err) {
        console.error('Error procesando audio para Porcupine:', err);
      }
    };
    console.log('Porcupine escuchando la palabra:', keyword);
  } catch (err) {
    console.error('Error al inicializar Porcupine:', err);
    alert('Error al inicializar Porcupine. Revisa la consola para más detalles.');
  }
});

// Obtener access key desde el proceso principal (necesita ser configurado en main.js)
function getAccessKeyFromMain() {
  return new Promise((resolve) => {
    // Intentar usar IPC si está disponible, sino usar el token directo
    const accessKey = '4iAuDRrRSpeK8o4rXVvvP6/RdBH9G9AJ/iXhDFSe53Z/K0ZP5WpP0A==';
    resolve(accessKey);
  });
}

// Solicitar permiso al cargar la aplicación
window.addEventListener('load', async () => {
    // Prueba directa de acceso al micrófono y mostrar error exacto
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        console.log('Micrófono OK', stream);
      })
      .catch(err => {
        alert('Error accediendo al micrófono: ' + err.message);
        console.error('Error micrófono:', err);
      });
  console.log('Aplicación cargada. Solicitando acceso al micrófono...');
  const permiso = await requestMicrophonePermission();
  if (!permiso) {
    alert('No se concedió permiso al micrófono. La app no podrá escuchar.');
    return;
  }

  // Integración Porcupine
  try {
    const porcupineModule = require('@picovoice/porcupine-web-en-worker');
    const keyword = activationInput.value.trim() || 'hola';
    const accessKey = '4iAuDRrRSpeK8o4rXVvvP6/RdBH9G9AJ/iXhDFSe53Z/K0ZP5WpP0A==';
    const porcupine = await porcupineModule.PorcupineWorkerFactory.create(
      accessKey,
      [{ builtin: porcupineModule.BuiltInKeyword[keyword] || porcupineModule.BuiltInKeyword['hola'], sensitivity: 0.7 }]
    );

    // Validar stream y audioContext
    if (!stream) {
      alert('No se obtuvo el stream de audio. Verifica el micrófono.');
      return;
    }
    if (!audioContext) {
      alert('No se pudo crear el contexto de audio.');
      return;
    }

    // Procesar audio del micrófono
    const audioProcessor = audioContext.createScriptProcessor(512, 1, 1);
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(audioProcessor);
    audioProcessor.connect(audioContext.destination);

    audioProcessor.onaudioprocess = (event) => {
      try {
        const input = event.inputBuffer.getChannelData(0);
        porcupine.postMessage({ inputFrame: input });
      } catch (err) {
        console.error('Error procesando audio para Porcupine:', err);
      }
    };

    porcupine.onmessage = (event) => {
      if (event.data.keyword !== undefined) {
        // Cambiar color de la barra a verde
        mainSearchBar.classList.add('active');
        mainSearchBar.style.backgroundColor = '#27ae60';
        setTimeout(() => {
          mainSearchBar.style.backgroundColor = '';
          mainSearchBar.classList.remove('active');
        }, 3000);
        console.log('¡Palabra de activación detectada por Porcupine!');
      }
    };
  } catch (err) {
    console.error('Error al inicializar Porcupine:', err);
    alert('Error al inicializar Porcupine. Revisa la consola para más detalles.');
  }
});

// Limpiar recursos al cerrar
window.addEventListener('beforeunload', () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  if (audioContext) {
    audioContext.close();
  }
});
