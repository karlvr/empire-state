/**
 * Transform a type into one that can be used with keyof.
 * If a type is a union type with undefined or null it can't be keyed as they can't be keyed.
 */
export type KEYABLE<T> = T extends object ? T : never
export type KEY<T> = keyof KEYABLE<T>
export type PROPERTY<T, K extends keyof KEYABLE<T>> = KEYABLE<T>[K]

/** Add a property named 'this' that is of the type of the given T */
export type ANDTHIS<T> = T & { this: T }

export type KEYORTHIS<T> = KEY<T> | 'this'

/** Like PROPERTY<T, K> but includes support for the magic `this` property that refers to the type T itself */
export type PROPERTYORTHIS<T, K extends KEY<T> | 'this'> = 
	K extends 'this' ? T 
	: PROPERTY<T, Exclude<K, 'this'>>
