const { contextBridge } = require('electron');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

contextBridge.exposeInMainWorld('porcupineConfig', {
  accessKey: process.env.PORCUPINE_ACCESS_KEY,
  activationWord: process.env.ACTIVATION_WORD || 'hola'
});
