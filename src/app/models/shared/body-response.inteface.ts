export interface BodyResponse<T> {
  code: number;
  message: string;
  data: T;
}
export interface ZionResponse {
  estado: string;
  mensaje: string;
}

export interface BodyResponseUp<T> {
  statusCode: number;
  body: T;
}
