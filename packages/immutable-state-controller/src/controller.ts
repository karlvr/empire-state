/* eslint-disable @typescript-eslint/no-explicit-any */
import { produce } from 'immer'
import { DEFAULT_CHANGE_LISTENER_TAG } from './constants'
import { KEY, PROPERTY, INDEXPROPERTY } from './type-utils'
import { Snapshot, Controller, ChangeListener, ControllerSource } from './types'

interface ChangeListenerInfo<T> {
	listener: ChangeListener<T>
	tag: string
}
export class ControllerImpl<T> implements Controller<T> {

	private source: () => Snapshot<T>
	private lastKnownValue: T

	private onChanges: {
		[name: string]: (value: any) => void
	} = {}
	
	private getters: {
		[name: string]: (value: any) => PROPERTY<T, KEY<T>>
	} = {}
	
	private setters: {
		[name: string]: (value: any) => PROPERTY<T, KEY<T>>
	} = {}

	private changeListeners: ChangeListenerInfo<T>[] = []
	private memoisedSnapshot: Snapshot<T> | undefined
	private memoisedControllers: { [prop: string]: Controller<any> } = {}
	private notifyingChangeListeners = false

	public constructor(source: ControllerSource<T>) {
		this.source = source
		this.lastKnownValue = produce(this.value, draft => draft)
	}

	public get value(): T {
		const value = this.source().value
		if (value === this.lastKnownValue) {
			return this.lastKnownValue
		}

		const frozenValue = produce(value, draft => draft)
		this.lastKnownValue = frozenValue
		return frozenValue
	}

	public setValue(value: T, fromSubController = false) {
		const oldValue = this.source().value
		this.source().change(value)
		this.lastKnownValue = value

		this.notifyChanges(oldValue, fromSubController)
	}

	public snapshot(): Snapshot<T>
	public snapshot(index: number): Snapshot<INDEXPROPERTY<T>>
	public snapshot(name: 'this'): Snapshot<T>
	public snapshot<K extends KEY<T>>(name?: K): Snapshot<PROPERTY<T, K>>
	public snapshot<K extends KEY<T>>(nameOrIndex?: K | number | 'this', index?: number): Snapshot<T> | Snapshot<PROPERTY<T, K>> | Snapshot<INDEXPROPERTY<PROPERTY<T, K>>> | Snapshot<INDEXPROPERTY<T>> {
		if (nameOrIndex !== undefined) {
			return this.internalController(nameOrIndex, index).snapshot()
		}

		/* If the snapshot value hasn't changed, we return the memoised snapshot */
		const memoisedSnapshot = this.memoisedSnapshot
		if (memoisedSnapshot && memoisedSnapshot.value === this.value) {
			return memoisedSnapshot
		} else {
			const result: Snapshot<T> = {
				change: (newValue: T) => this.setValue(newValue),
				value: produce(this.value, draft => draft),
			}

			this.memoisedSnapshot = result
			return result
		}
	}

	public getter<K extends KEY<T>>(name: K, func: (value: PROPERTY<T, K>) => PROPERTY<T, K>) {
		this.getters[name as string] = func
	}

	public setter<K extends KEY<T>>(name: K, func: (value: PROPERTY<T, K>) => PROPERTY<T, K>) {
		this.setters[name as string] = func
		delete this.onChanges[name as string]
	}

	public addChangeListener(listener: ChangeListener<T>, tag?: string) {
		this.changeListeners.push({
			listener,
			tag: tag !== undefined ? tag : DEFAULT_CHANGE_LISTENER_TAG,
		})
	}

	public removeChangeListener(listener: ChangeListener<T>) {
		const index = this.changeListeners.findIndex(info => info.listener === listener)
		if (index !== -1) {
			this.changeListeners.splice(index, 1)
		}
	}

	public removeAllChangeListeners(tag?: string) {
		if (tag !== undefined) {
			for (let i = this.changeListeners.length - 1; i >= 0; i--) {
				if (this.changeListeners[i].tag === tag) {
					this.changeListeners.splice(i, 1)
				}
			}
		} else {
			this.changeListeners = []
		}

		for (const sub of Object.values(this.memoisedControllers)) {
			sub.removeAllChangeListeners(tag)
		}
	}

	public get(index: number): Controller<INDEXPROPERTY<T>>
	public get<K extends KEY<T>>(name: K): Controller<PROPERTY<T, K>>
	public get(name: 'this'): Controller<T>
	public get<K extends KEY<T>>(name: K, index: number): Controller<INDEXPROPERTY<PROPERTY<T, K>>>
	public get<K extends KEY<T>>(nameOrIndex: K | number | 'this', index?: number): Controller<INDEXPROPERTY<T>> | Controller<PROPERTY<T, K>> | Controller<T> | Controller<INDEXPROPERTY<PROPERTY<T, K>>> {
		return this.internalController(nameOrIndex, index)
	}

	public map<U>(callback: (controller: Controller<INDEXPROPERTY<T>>, index: number) => U): U[]
	public map<U>(name: 'this', callback: (controller: Controller<INDEXPROPERTY<T>>, index: number) => U): U[]
	public map<K extends KEY<T>, U>(name: K, callback: (controller: Controller<INDEXPROPERTY<PROPERTY<T, K>>>, index: number) => U): U[]
	public map<K extends KEY<T>, U>(name: K | 'this' | ((controller: Controller<INDEXPROPERTY<T>>, index: number) => U), callback?: (controller: Controller<INDEXPROPERTY<T>> | Controller<INDEXPROPERTY<PROPERTY<T, K>>>, index: number) => U): U[] {
		if (typeof name === 'function') {
			return this.map('this', name)
		}
		const value: unknown[] = name === 'this' ? this.value : this.value !== undefined ? (this.value as any)[name] : undefined
		if (!value || !callback) {
			return []
		}
		return value.map((nestedValue, nestedValueIndex) => {
			const nestedController = this.internalController(name, nestedValueIndex) as Controller<INDEXPROPERTY<PROPERTY<T, K>>>
			return callback(nestedController, nestedValueIndex)
		})
	}
	
	private internalController<K extends KEY<T>>(nameOrIndex: K | number | 'this', index?: number): Controller<INDEXPROPERTY<T>> | Controller<PROPERTY<T, K>> | Controller<T> | Controller<INDEXPROPERTY<PROPERTY<T, K>>> {
		if (index !== undefined) {
			return this.get(nameOrIndex as K).get(index)
		} else if (nameOrIndex === 'this') {
			return this
		}

		const memoisedController = this.memoisedControllers[`${nameOrIndex}`]
		if (memoisedController) {
			return memoisedController
		}

		let result: Controller<INDEXPROPERTY<T>> | Controller<PROPERTY<T, K>> | Controller<T> | Controller<INDEXPROPERTY<PROPERTY<T, K>>>
		if (typeof nameOrIndex === 'number') {
			result = new ControllerImpl(() => {
				const onChange = (newValue: INDEXPROPERTY<T>) => {
					const currentValue = this.value
					const parentNewValue = currentValue !== undefined && currentValue !== null
						? produce(this.value, draft => {
							(draft as any)[nameOrIndex] = newValue
						})
						: (function() {
							const result = []
							for (let i = 0; i < nameOrIndex; i++) {
								result[i] = undefined
							}
							result[nameOrIndex] = newValue
							return produce(result, draft => draft) as any as T
						})()
					this.setValue(parentNewValue)
				}
				const currentValue = this.value
				const value: any = currentValue !== undefined && currentValue !== null ? (currentValue as any)[nameOrIndex] : undefined
				return {
					change: onChange,
					value: produce(value, (draft: any) => draft) as any,
				}
			})
		} else {
			result = new ControllerImpl(() => {
				const onChange: any = this.propOnChange(nameOrIndex as unknown as keyof T)
				const currentValue = this.value
				let value: any = currentValue !== undefined && currentValue !== null ? currentValue[nameOrIndex as unknown as keyof T] : undefined

				const getter = this.getters[nameOrIndex as string]
				if (getter) {
					value = getter(value)
				}

				return {
					change: onChange,
					value: produce(value, (draft: any) => draft) as any as PROPERTY<T, K>,
				}
			})
		}

		this.memoisedControllers[`${nameOrIndex}`] = result
		return result
	}

	private notifyIfChanged() {
		const value = this.source().value
		const oldValue = this.lastKnownValue
		if (value !== oldValue) {
			this.lastKnownValue = produce(value, draft => draft)

			this.notifyChanges(oldValue)
		}
	}

	private notifyChanges(oldValue: T, fromSubController = false) {
		/* Handle value being changed by a change listener, we only notify each listener once in the reverse order of registration */
		if (!this.notifyingChangeListeners) {
			this.notifyingChangeListeners = true

			if (!fromSubController) {
				/* Notify any sub-controllers */
				for (const sub of Object.values(this.memoisedControllers)) {
					(sub as ControllerImpl<T>).notifyIfChanged()
				}
			}

			/* Notify our change listeners */
			for (const listener of this.changeListeners.reverse()) {
				/* Always use the latest value from this controller, in case a listener has changed it, as we don't re-notify if a listener makes changes due to notifyingSetValue */
				listener.listener(this.value, oldValue)
			}

			this.notifyingChangeListeners = false
		}
	}

	private propOnChange<K extends keyof T>(name: K): ((value: T[K]) => void) {
		const PROPERTY = this.onChanges[name as string]
		if (PROPERTY) {
			return PROPERTY
		}

		let func = (subValue: T[K]): void => {
			const currentValue = this.value
			const newValue = currentValue !== undefined && currentValue !== null ?
				produce(currentValue, (draft) => {
					(draft as any)[name] = subValue as any
				})
				: {
					[name]: subValue,
				}

			this.setValue(newValue as T, true)
		}

		const setter = this.setters[name as string]
		if (setter) {
			const existingNewFunc = func
			const newFunc = (subValue: T[K]): void => {
				const subValue2 = setter(subValue) as PROPERTY<T, K>
				existingNewFunc(subValue2)
			}
			func = newFunc
		}

		this.onChanges[name as string] = func
		return func
	}

}
