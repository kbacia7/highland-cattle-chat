export type WithSerializedDates<T> = T extends Date
  ? string
  : T extends Array<infer R>
  ? Array<WithSerializedDates<R>>
  : T extends object
  ? { [K in keyof T]: WithSerializedDates<T[K]> }
  : T;
