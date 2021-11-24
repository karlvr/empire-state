import { KEY, PROPERTY, INDEXPROPERTY, COMPATIBLEKEYS } from './type-utils'

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
	get<K extends KEY<T>>(name: K): Controller<PROPERTY<T, K>>
	/**
	 * Returns a sub-controller for the value at the given index in the value of the given property in this controller's value, 
	 * assuming this controller has an object value and the property value is an array value.
	 */
	get<K extends KEY<T>>(name: K, index: number): Controller<INDEXPROPERTY<PROPERTY<T, K>>>
	get<S>(name: COMPATIBLEKEYS<T, S>): Controller<S>
	get<S extends ArrayLike<O>, O>(name: COMPATIBLEKEYS<T, S>): Controller<O>

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
	 * Returns a snapshot of the whole value in this controller.
	 */
	snapshot(): Snapshot<T>
	/**
	 * Returns a snapshot of the value at the given index in this controller's value, assuming this controller contains an array value.
	 */
	snapshot(index: number): Snapshot<INDEXPROPERTY<T>>
	/**
	 * Returns a snapshot of the whole value in this controller.
	 */
	snapshot(name: 'this'): Snapshot<T>
	/**
	 * Returns a snapshot of the value of the given property in this controller's value, assuming this controller contains an object value.
	 */
	snapshot<K extends KEY<T>>(name: K): Snapshot<PROPERTY<T, K>>
	/**
	 * Returns a snapshot of the value at the given index in the value of the given property in this controller's value,
	 * assuming this controller contains an object value and the property value is an array value.
	 */
	snapshot<K extends KEY<T>>(name: K, index: number): Snapshot<INDEXPROPERTY<PROPERTY<T, K>>>
	/**
	 * Convenience version for the COMPATIBLEKEYS utility to produce the right return type for the Snapshot.
	 */
	snapshot<S>(name: COMPATIBLEKEYS<T, S>): Snapshot<S>
	snapshot<S extends ArrayLike<O>, O>(name: COMPATIBLEKEYS<T, S>, index: number): Snapshot<O>
	/**
	 * The combination of all snapshot methods so you can call snapshot with arguments that can match some combination that
	 * snapshot supports.
	 */
	snapshot<K extends KEY<T>>(nameOrIndex?: K | number | 'this', index?: number): Snapshot<T> | Snapshot<PROPERTY<T, K>> | Snapshot<INDEXPROPERTY<PROPERTY<T, K>>> | Snapshot<INDEXPROPERTY<T>>

	map<U>(callback: (controller: Controller<INDEXPROPERTY<T>>, index: number, array: T) => U): U[]
	map<U>(name: 'this', callback: (controller: Controller<INDEXPROPERTY<T>>, index: number, array: T) => U): U[]
	map<K extends KEY<T>, U>(name: K, callback: (controller: Controller<INDEXPROPERTY<PROPERTY<T, K>>>, index: number, array: PROPERTY<T, K>) => U): U[]

	findIndex(predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): number
	findIndex(name: 'this', predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): number
	findIndex<K extends KEY<T>>(name: K, predicate: (value: INDEXPROPERTY<PROPERTY<T, K>>, index: number, array: PROPERTY<T, K>) => boolean): number

	find(predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): Controller<INDEXPROPERTY<T>> | undefined
	find(name: 'this', predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): Controller<INDEXPROPERTY<T>> | undefined
	find<K extends KEY<T>>(name: K, predicate: (value: INDEXPROPERTY<PROPERTY<T, K>>, index: number, array: PROPERTY<T, K>) => boolean): Controller<INDEXPROPERTY<PROPERTY<T, K>>> | undefined

	getter<K extends KEY<T>>(name: K, func: (value: PROPERTY<T, K>) => PROPERTY<T, K>): void
	setter<K extends KEY<T>>(name: K, func: (value: PROPERTY<T, K>) => PROPERTY<T, K>): void

	addChangeListener(listener: ChangeListener<T>, tag?: string): this
	removeChangeListener(listener: ChangeListener<T>): this
	removeAllChangeListeners(tag?: string): this
}

export type ChangeListener<T> = (value: T, oldValue: T) => void