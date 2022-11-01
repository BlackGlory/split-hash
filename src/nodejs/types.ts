export type ProgressiveHashFactory<T> = () => IProgressiveHash<T>

export interface IProgressiveHash<T> {
  update(buffer: Buffer): void
  digest(): T
}
