/**
 * Tipo de resultado explícito para casos de uso (docs/02-arquitectura.md §2.3: la capa de
 * aplicación orquesta dominio + infraestructura). Evita usar excepciones para errores
 * esperables de negocio (validación, permisos) y obliga a la UI a manejar ambos casos.
 */
export type Result<T, E = string> = { ok: true; data: T } | { ok: false; error: E }

export function ok<T>(data: T): Result<T, never> {
  return { ok: true, data }
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}
