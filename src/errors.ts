export class ResponseError extends Error {
  public readonly status: number
  constructor(status: number, ...params: any[]) {
    super(...params)
    this.status = status

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResponseError)
    }

    this.name = 'ResponseError'
  }
}
