const packageJson = require('../../package.json');
const HOST = 'https://m7co9zv7kk.execute-api.us-east-1.amazonaws.com/DEV';
//const HOST = 'https://3voixiptij.execute-api.us-east-1.amazonaws.com/PD';
//PRUEBAS
const RUTAS_ARCHIVOS = 'https://app.confa.co:8687/guardarArchivosRest/guardarArchivo/metodo1';
//PRODUCCION
//const RUTAS_ARCHIVOS = 'https://alojamiento.confa.co/guardarArchivosRest/guardarArchivo/metodo1';
export const environment = {
  API_PUBLIC: HOST + '/',
  production: false,
  context: 'devPruebasV2',
  // production: true,
  // context: 'production',
  version: packageJson.version,
  minutesInactive: 25,
  ruta_archivos_ws: RUTAS_ARCHIVOS,
  ruta_consumo_subsidios_rest:"https://app.confa.co:8320/subsidiosWSRest/rest/wsrest/",
};
