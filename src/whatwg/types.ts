export type ProgressiveHashFactory<T> = () => IProgressiveHash<T>

export interface IProgressiveHash<T> {
  update(buffer: Uint8Array): void
  digest(): Promise<T>
}
