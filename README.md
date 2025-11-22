# Control de Voz - YouTube Search

Una aplicación Electron que permite buscar en YouTube usando comandos de voz con detección de palabra de activación.

## Características

✅ **Detección de Palabra de Activación** - Escucha continuamente esperando una palabra específica (ej: "hola")  
✅ **Resplandor Verde** - La barra se ilumina cuando se detecta la palabra de activación  
✅ **Sin Costo de API** - Solo usa la API de transcripción después de detectar la palabra clave  
✅ **Web Speech API** - Reconocimiento de voz nativo del navegador  
✅ **Integración con YouTube** - Busca directamente en YouTube  

## Requisitos

- Node.js (v12 o superior)
- npm
- Windows/Mac/Linux

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar la aplicación
npm start
```

## Configuración

### 1. Token de Porcupine (Opcional)

El archivo `.env` ya contiene tu token:

```env
PORCUPINE_ACCESS_KEY=4iAuDRrRSpeK8o4rXVvvP6/RdBH9G9AJ/iXhDFSe53Z/K0ZP5WpP0A==
ACTIVATION_WORD=hola
```

Si lo necesitas, puedes cambiar:
- `PORCUPINE_ACCESS_KEY`: Tu token de Porcupine
- `ACTIVATION_WORD`: La palabra que activará la búsqueda

### 2. Permisos de Micrófono

Cuando inicies la aplicación, se te pedirá permiso para acceder al micrófono. **Debes permitirlo** para que funcione.

## Uso

1. **Inicia la aplicación**: `npm start`
2. **Permite el acceso al micrófono** en el cuadro de diálogo
3. **Di la palabra de activación** (por defecto: "hola")
4. **La barra parpadeará en verde** indicando que está activa
5. **Ahora puedes usar la API de transcripción** (cuando la configures)

## Cambiar la Palabra de Activación

1. En la primera barra de búsqueda, escribe una nueva palabra
2. Haz click en "Actualizar" o presiona Enter
3. La aplicación comenzará a escuchar la nueva palabra

## Estructura de Archivos

```
youuuu/
├── index.html        # Interfaz HTML
├── renderer.js       # Lógica de reconocimiento de voz
├── main.js           # Proceso principal de Electron
├── preload.js        # Puente de seguridad
├── .env              # Variables de entorno (Token + palabra)
├── package.json      # Dependencias
└── README.md         # Este archivo
```

## API de Transcripción

Cuando la palabra de activación sea detectada, la función `activateMode()` se ejecuta:

```javascript
function activateMode() {
  mainSearchBar.classList.add('active');
  // Aquí es donde llamarías tu API de transcripción
  console.log('¡Palabra de activación detectada! Usar la API ahora.');
}
```

Puedes modificar esta función en `renderer.js` para:
1. Comenzar a grabar audio
2. Enviar a tu API de speech-to-text
3. Obtener la transcripción completa

## Palabras de Activación Recomendadas

- "hola"
- "hey"
- "oye"
- "busca"
- "buscar"
- "escucha"

## Solución de Problemas

### No se escucha nada
- Verifica que hayas permitido el acceso al micrófono
- Comprueba que tu micrófono esté conectado y funcionando
- Intenta en Chrome o Edge (mejor soporte para Web Speech API)

### La palabra no se detecta
- Haz click en "Actualizar" después de cambiar la palabra
- Asegúrate de pronunciar claramente
- Reduce el ruido de fondo
- Usa palabras más cortas y claras

### Error de permisos
- Revisa que Electron tenga permisos de micrófono en tu sistema
- En Windows: Configuración > Privacidad > Micrófono

## Próximos Pasos

Cuando recibas los datos de tu API de transcripción, integralos en la función `activateMode()`:

```javascript
async function activateMode() {
  mainSearchBar.classList.add('active');
  
  // Llamar a tu API de transcripción aquí
  const transcription = await callYourSTTAPI();
  
  // Usar el resultado
  searchInput.value = transcription;
  performSearch();
}
```

## Licencia

ISC
