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
  ruta_consumo_subsidios_rest: 'https://app.confa.co:8322/subsidiosWSRest/rest/wsrest/',
  ruta_consumo_token_generico: 'https://alojamiento.confa.co/ingresoConfaWSS/rest/',
  ruta_consumo_municipios: 'https://alojamiento.confa.co/alojamientoWS/rest/alojamiento/',
};
export const parameters = {
  first: 'ZTM4ZDcwNDRlODcyNzZDX0FQUCoyMDE4JA==',
  second: 'QXBwX0NvbmZhODRkZGZiMzQxMjZmYzNhNDhl',
};
