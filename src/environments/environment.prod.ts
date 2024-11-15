const packageJson = require('../../package.json');

const HOST = 'https://3voixiptij.execute-api.us-east-1.amazonaws.com/PD';
const RUTAS_ARCHIVOS = 'https://alojamiento.confa.co/guardarArchivosRest/guardarArchivo/metodo1';

export const environment = {
  API_PUBLIC: HOST + '/',
  production: true,
  context: 'master',
  version: packageJson.version,
  minutesInactive: 15,
  ruta_archivos_ws: RUTAS_ARCHIVOS,
};
