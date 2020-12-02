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
	controller(index: number): Controller<INDEXPROPERTY<T>>
	controller<K extends KEY<T>>(name: K): Controller<PROPERTY<T, K>>
	controller<K extends KEY<T>>(name: K, index: number): Controller<INDEXPROPERTY<PROPERTY<T, K>>>

	snapshot(): Snapshot<T>
	snapshot(index: number): Snapshot<INDEXPROPERTY<T>>
	snapshot<K extends KEY<T>>(name: K): Snapshot<PROPERTY<T, K>>
	snapshot<K extends KEY<T>>(name: K, index: number): Snapshot<INDEXPROPERTY<PROPERTY<T, K>>>
	
	getter<K extends KEY<T>>(name: K, func: (value: PROPERTY<T, K>) => PROPERTY<T, K>): void
	setter<K extends KEY<T>>(name: K, func: (value: PROPERTY<T, K>) => PROPERTY<T, K>): void

	addChangeListener(listener: ChangeListener<T>): void
	removeChangeListener(listener: ChangeListener<T>): void
	removeAllChangeListeners(): void
}

export type ChangeListener<T> = (value: T) => void
