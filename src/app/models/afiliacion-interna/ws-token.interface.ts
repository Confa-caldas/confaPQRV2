/** Respuesta de POST /afiliacion-interna/ws-token (JWT scoped para radicar directo al WS). */
export interface WsTokenAfiliacionInternaResponse {
  token: string;
  wsBaseUrl: string;
}
