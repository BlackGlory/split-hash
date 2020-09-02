export type ProgressiveHashFactory<T> = () => ProgressiveHash<T>

export interface ProgressiveHash<T> {
  update(buffer: Buffer): void
  digest(): T
}
