export type Subtract<T extends T1, T1 extends object> = Pick<T, Exclude<keyof T, keyof T1>>

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
