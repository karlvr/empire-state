import { KEY, PROPERTY, INDEXPROPERTY } from './type-utils'

/** A Snapshot represents an immutable view of state, and a means to change it. */
export interface Snapshot<T> {
	/**
	 * The current value of the snapshot.
	 */
	readonly value: T

	/**
	 * Request to change the value of the snapshot. This request will go back to the controller 
	 * and to the original datasource, which will process and apply the change.
	 * @param newValue The new snapshot value.
	 */
	readonly setValue: (newValue: T) => void
}

/** A Controller is a way to access Snapshots of state. */
export interface Controller<T> {
	/**
	 * Returns a controller for the value at the given index in this controller's value, assuming this controller has an array value.
	 */
	controller(index: number): Controller<INDEXPROPERTY<T>>
	/**
	 * Returns this controller.
	 */
	controller(name: 'this'): Controller<T>
	/**
	 * Returns a controller for the value of the given property in this controller's value, assuming this controller has an object value.
	 */
	controller<K extends KEY<T>>(name: K): Controller<PROPERTY<T, K>>
	/**
	 * Returns a controller for the value at the given index in the value of the given property in this controller's value, 
	 * assuming this controller has an object value and the property value is an array value.
	 */
	controller<K extends KEY<T>>(name: K, index: number): Controller<INDEXPROPERTY<PROPERTY<T, K>>>
	controller<K extends KEY<T>>(nameOrIndex: K | number | 'this', index?: number): Controller<INDEXPROPERTY<T>> | Controller<PROPERTY<T, K>> | Controller<T> | Controller<INDEXPROPERTY<PROPERTY<T, K>>>

	/**
	 * Returns a snapshot of the whole value in this controller.
	 */
	snapshot(): Snapshot<T>
	/**
	 * Returns a snapshot of the value at the given index in this controller's value, assuming this controller has an array value.
	 */
	snapshot(index: number): Snapshot<INDEXPROPERTY<T>>
	/**
	 * Returns a snapshot of the whole value in this controller.
	 */
	snapshot(name: 'this'): Snapshot<T>
	/**
	 * Returns a snapshot of the value of the given property in this controller's value, assuming this controller has an object value.
	 */
	snapshot<K extends KEY<T>>(name: K): Snapshot<PROPERTY<T, K>>
	/**
	 * Returns a snapshot of the value at the given index in the value of the given property in this controller's value,
	 * assuming this controller has an object value and the property value is an array value.
	 */
	snapshot<K extends KEY<T>>(name: K, index: number): Snapshot<INDEXPROPERTY<PROPERTY<T, K>>>
	/**
	 * The combination of all snapshot methods so you can call snapshot with arguments that can match some combination that
	 * snapshot supports.
	 */
	snapshot<K extends KEY<T>>(nameOrIndex?: K | number | 'this', index?: number): Snapshot<T> | Snapshot<PROPERTY<T, K>> | Snapshot<INDEXPROPERTY<PROPERTY<T, K>>> | Snapshot<INDEXPROPERTY<T>>
	
	getter<K extends KEY<T>>(name: K, func: (value: PROPERTY<T, K>) => PROPERTY<T, K>): void
	setter<K extends KEY<T>>(name: K, func: (value: PROPERTY<T, K>) => PROPERTY<T, K>): void

	addChangeListener(listener: ChangeListener<T>): void
	removeChangeListener(listener: ChangeListener<T>): void
	removeAllChangeListeners(): void
}

export type ChangeListener<T> = (value: T, oldValue: T) => void
