/**
 * Transform a type into one that can be used with keyof.
 * If a type is a union type with undefined or null it can't be keyed as they can't be keyed.
 */
export type KEYABLE<T> = T extends object ? T : never
export type KEY<T> = keyof KEYABLE<T>
export type PROPERTY<T, K extends keyof KEYABLE<T>> = KEYABLE<T>[K]
