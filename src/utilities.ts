export type Subtract<T extends T1, T1 extends object> = Pick<T, Exclude<keyof T, keyof T1>>

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

/** Returns the properties in T that are assignable to type R */
export type CompatibleKeys<T, R> = NonNullable<{
	[P in keyof T]: T[P] extends R ? P : never
}[keyof T]>

export type FunctionKeys<T> = CompatibleKeys<T, Function>
