import { KEY, PROPERTY, INDEXPROPERTY, COMPATIBLEKEYS, UNDEFINEDIFUNDEFINED } from './type-utils'

/** A Snapshot represents an immutable view of state, and a means to change it. */
export interface Snapshot<T> {
	/**
	 * The current value of the snapshot.
	 */
	readonly value: T

	/**
	 * Request to update the value of the snapshot. This request will go back to the controller 
	 * and to the original datasource, which will process and apply the change.
	 * @param newValue The new snapshot value.
	 */
	readonly change: <V extends T>(newValue: V) => void /* The V extends T is so this works with disjunctions, see disjunctions.spec.ts */
}

export interface ExtendedSnapshot<T> extends Snapshot<T> {

	readonly extendedSnapshot: true

	/**
	 * Remove this value from its parent. Only supported for array and object parents.
	 */
	readonly remove?: () => void

}

export function isExtendedSnapshot<T>(s: Snapshot<T>): s is ExtendedSnapshot<T> {
	return (s as ExtendedSnapshot<T>).extendedSnapshot === true
}

/**
 * The source used to create a new Controller. It MUST always return the current value after
 * a call to `change`, to preserve the semantics of the Controller that it accesses mutable
 * values.
 */
export type ControllerSource<T> = () => Snapshot<T>

export type SetValueFunc<V> = (currentValue: V) => V

/** A Controller provides access to mutable state, and access to Snapshots of immutable state. */
export interface Controller<T> {
	/**
	 * Get the current value from the controller.
	 */
	value: T
	
	/**
	 * Set the current value of the controller.
	 * @param newValue 
	 */
	setValue(newValue: T): void
	setValue(func: SetValueFunc<T>): void

	/**
	 * Returns a sub-controller for the value at the given index in this controller's value, assuming this controller has an array value.
	 */
	get(index: number): Controller<INDEXPROPERTY<T>>
	/**
	 * Returns this controller.
	 */
	get(name: 'this'): Controller<T>
	/**
	 * Returns a sub-controller for the value of the given property in this controller's value, assuming this controller has an object value.
	 */
	get<K extends KEY<T>>(name: K): Controller<UNDEFINEDIFUNDEFINED<T> | PROPERTY<T, K>>
	/**
	 * Returns a sub-controller for the value at the given index in the value of the given property in this controller's value, 
	 * assuming this controller has an object value and the property value is an array value.
	 */
	get<K extends KEY<T>>(name: K, index: number): Controller<UNDEFINEDIFUNDEFINED<T> | INDEXPROPERTY<PROPERTY<T, K>>>
	get<S>(name: COMPATIBLEKEYS<T, S>): Controller<UNDEFINEDIFUNDEFINED<T> | S>
	get<S extends ArrayLike<O>, O>(name: COMPATIBLEKEYS<T, S>): Controller<UNDEFINEDIFUNDEFINED<T> | O>

	/**
	 * Set the value at the given index in this controller's array value.
	 * @param index 
	 * @param newValue 
	 */
	set(index: number, newValue: INDEXPROPERTY<T>): void
	set(index: number, func: SetValueFunc<INDEXPROPERTY<T>>): void
	
	/**
	 * Set the value of this controller.
	 * @param name 
	 * @param newValue 
	 */
	set(name: 'this', newValue: T): void
	set(name: 'this', func: SetValueFunc<T>): void

	/**
	 * Set the value in the given named property in this controller's object value
	 * @param name 
	 * @param newValue 
	 */
	set<K extends KEY<T>>(name: K, newValue: PROPERTY<T, K>): void
	set<K extends KEY<T>>(name: K, func: SetValueFunc<PROPERTY<T, K>>): void

	/**
	 * Returns a function that, when called, toggles the boolean value in this Controller
	 */
	onToggle(): T extends boolean ? () => void : never
	onToggle(index: number): T extends (boolean | undefined)[] ? () => void : never
	onToggle(name: 'this'): T extends boolean ? () => void : never
	onToggle<K extends COMPATIBLEKEYS<T, boolean | undefined>>(name: K): () => void
	onToggle<K extends COMPATIBLEKEYS<T, (boolean | undefined)[] | undefined>>(name: K, index: number): () => void

	/**
	 * Returns a function that, when called, changes the value in this Controller.
	 */
	onChange(): (newValue: T) => void
	onChange(index: number): (newValue: INDEXPROPERTY<T>) => void
	onChange(name: 'this'): (newValue: T) => void
	onChange<K extends KEY<T>>(name: K): (newValue: PROPERTY<T, K>) => void
	onChange<K extends KEY<T>>(name: K, index: number): (newValue: INDEXPROPERTY<PROPERTY<T, K>>) => void

	/**
	 * Returns a snapshot of the whole value in this controller.
	 */
	snapshot(): Snapshot<T>
	/**
	 * Returns a snapshot of the value at the given index in this controller's value, assuming this controller contains an array value.
	 */
	snapshot(index: number): Snapshot<UNDEFINEDIFUNDEFINED<T> | INDEXPROPERTY<T>>
	/**
	 * Returns a snapshot of the whole value in this controller.
	 */
	snapshot(name: 'this'): Snapshot<T>
	/**
	 * Returns a snapshot of the value of the given property in this controller's value, assuming this controller contains an object value.
	 */
	snapshot<K extends KEY<T>>(name: K): Snapshot<UNDEFINEDIFUNDEFINED<T> | PROPERTY<T, K>>
	/**
	 * Returns a snapshot of the value at the given index in the value of the given property in this controller's value,
	 * assuming this controller contains an object value and the property value is an array value.
	 */
	snapshot<K extends KEY<T>>(name: K, index: number): Snapshot<UNDEFINEDIFUNDEFINED<T> | INDEXPROPERTY<PROPERTY<T, K>>>
	/**
	 * Convenience version for the COMPATIBLEKEYS utility to produce the right return type for the Snapshot.
	 */
	snapshot<S>(name: COMPATIBLEKEYS<T, S>): Snapshot<UNDEFINEDIFUNDEFINED<T> | S>
	snapshot<S extends ArrayLike<O>, O>(name: COMPATIBLEKEYS<T, S>, index: number): Snapshot<UNDEFINEDIFUNDEFINED<T> | O>
	
	map<U>(callback: (controller: Controller<INDEXPROPERTY<T>>, index: number, array: T) => U): U[]
	map<U>(name: 'this', callback: (controller: Controller<INDEXPROPERTY<T>>, index: number, array: T) => U): U[]
	map<K extends KEY<T>, U>(name: K, callback: (controller: Controller<INDEXPROPERTY<PROPERTY<T, K>>>, index: number, array: PROPERTY<T, K>) => U): U[]

	findIndex(predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): number
	findIndex(name: 'this', predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): number
	findIndex<K extends KEY<T>>(name: K, predicate: (value: INDEXPROPERTY<PROPERTY<T, K>>, index: number, array: PROPERTY<T, K>) => boolean): number

	find(predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): Controller<INDEXPROPERTY<T>> | undefined
	find(name: 'this', predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): Controller<INDEXPROPERTY<T>> | undefined
	find<K extends KEY<T>>(name: K, predicate: (value: INDEXPROPERTY<PROPERTY<T, K>>, index: number, array: PROPERTY<T, K>) => boolean): Controller<INDEXPROPERTY<PROPERTY<T, K>>> | undefined

	push(newValue: INDEXPROPERTY<T>): void
	push(name: 'this', newValue: INDEXPROPERTY<T>): void
	push<K extends KEY<T>>(name: K, newValue: INDEXPROPERTY<PROPERTY<T, K>>): void

	/**
	 * Return a Controller that pushes a new value onto an array when it is first set.
	 * @param name the array property to push new elements to, or 'this' to push to this controller's array value
	 */
	pushNew(): Controller<INDEXPROPERTY<T>>
	pushNew(name: 'this'): Controller<INDEXPROPERTY<T>>
	pushNew<K extends KEY<T>>(name: K): Controller<INDEXPROPERTY<PROPERTY<T, K>>>
	
	/**
	 * Remove the value that is controlled by this controller from its parent. Only applicable
	 * if the parent is an object or an array.
	 */
	remove(): void
	
	/**
	 * Remove elements from an array controlled by this controller
	 * @param name the array property name to remove from, or 'this' to remove from the controller's value if it is an array
	 * @param predicate a predicate to determine which array members to remove
	 */
	remove(predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): void
	remove(name: 'this', predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): void
	remove<K extends KEY<T>>(name: K, predicate: (value: INDEXPROPERTY<PROPERTY<T, K>>, index: number, array: PROPERTY<T, K>) => boolean): void
	
	splice(index: number, deleteCount?: number, ...items: INDEXPROPERTY<T>[]): INDEXPROPERTY<T>[]
	splice(name: 'this', index: number, deleteCount?: number, ...items: INDEXPROPERTY<T>[]): INDEXPROPERTY<T>[]
	splice<K extends KEY<T>>(name: K, index: number, deleteCount?: number, ...items: INDEXPROPERTY<PROPERTY<T, K>>[]): INDEXPROPERTY<PROPERTY<T, K>>[]

	getter<K extends KEY<T>>(name: K, func: (value: PROPERTY<T, K>) => PROPERTY<T, K>): void
	setter<K extends KEY<T>>(name: K, func: (value: PROPERTY<T, K>) => PROPERTY<T, K>): void

	transform<X>(transformer: ControllerTransformer<T, X>): Controller<X>

	addChangeListener(listener: ChangeListener<T>, tag?: string): this
	removeChangeListener(listener: ChangeListener<T>): this
	removeAllChangeListeners(tag?: string): this
}

export interface ControllerTransformer<T, X> {
	/**
	 * Transform the value of type T from the source controller _to_ the transformed type X.
	 */
	to: (value: T) => X

	/**
	 * Transform the value of the X _from_ the transformed controller to the source controller type T.
	 */
	from: (value: X) => T
}

export type ChangeListener<T> = (value: T, oldValue: T) => void
