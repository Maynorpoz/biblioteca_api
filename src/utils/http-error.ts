export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const noEncontrado = (mensaje: string) => new HttpError(404, mensaje);
export const conflicto = (mensaje: string) => new HttpError(409, mensaje);
