export interface BodyResponse<T> {
  code: number;
  message: string;
  data: T;
  /** Paginación u otros totales cuando el backend lo envía en el cuerpo. */
  total_count?: number;
}
export interface ZionResponse {
  estado: string;
  mensaje: string;
}

export interface BodyResponseUp<T> {
  statusCode: number;
  body: T;
}
