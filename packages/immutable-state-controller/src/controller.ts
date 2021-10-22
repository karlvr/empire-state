/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-dupe-class-members */
import { produce } from 'immer'
import { KEY, PROPERTY, INDEXPROPERTY } from './type-utils'
import { Snapshot, Controller, ChangeListener, ControllerSource } from './types'

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

	private changeListeners: ChangeListener<T>[] = []
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

	public setValue(value: T) {
		const oldValue = this.source().value
		this.source().change(value)
		this.lastKnownValue = value

		this.notifyChanges(oldValue)
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

	public addChangeListener(listener: ChangeListener<T>) {
		this.changeListeners.push(listener)
	}

	public removeChangeListener(listener: ChangeListener<T>) {
		const index = this.changeListeners.indexOf(listener)
		if (index !== -1) {
			this.changeListeners.splice(index, 1)
		}
	}

	public removeAllChangeListeners() {
		this.changeListeners = []
		for (const sub of Object.values(this.memoisedControllers)) {
			sub.removeAllChangeListeners()
		}
	}

	public controller(index: number): Controller<INDEXPROPERTY<T>>
	public controller<K extends KEY<T>>(name: K): Controller<PROPERTY<T, K>>
	public controller(name: 'this'): Controller<T>
	public controller<K extends KEY<T>>(name: K, index: number): Controller<INDEXPROPERTY<PROPERTY<T, K>>>
	public controller<K extends KEY<T>>(nameOrIndex: K | number | 'this', index?: number): Controller<INDEXPROPERTY<T>> | Controller<PROPERTY<T, K>> | Controller<T> | Controller<INDEXPROPERTY<PROPERTY<T, K>>> {
		return this.internalController(nameOrIndex, index)
	}
	
	private internalController<K extends KEY<T>>(nameOrIndex: K | number | 'this', index?: number): Controller<INDEXPROPERTY<T>> | Controller<PROPERTY<T, K>> | Controller<T> | Controller<INDEXPROPERTY<PROPERTY<T, K>>> {
		if (index !== undefined) {
			return this.controller(nameOrIndex as K).controller(index)
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
					const parentNewValue = produce(this.value, draft => {
						(draft as any)[nameOrIndex] = newValue
					})
					this.setValue(parentNewValue)
				}
				const value: any = this.value !== undefined ? (this.value as any)[nameOrIndex] : undefined
				return {
					change: onChange,
					value: produce(value, (draft: any) => draft) as any,
				}
			})
		} else {
			result = new ControllerImpl(() => {
				const onChange: any = this.propOnChange(nameOrIndex as unknown as keyof T)
				let value: any = this.value !== undefined ? this.value[nameOrIndex as unknown as keyof T] : undefined

				const getter = this.getters[nameOrIndex as string]
				if (getter) {
					value = getter(value)
				}

				return {
					change: onChange,
					value: produce(value, (draft: any) => draft) as any,
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

	private notifyChanges(oldValue: T) {
		/* Handle value being changed by a change listener, we only notify each listener once in the reverse order of registration */
		if (!this.notifyingChangeListeners) {
			this.notifyingChangeListeners = true

			/* Notify any sub-controllers */
			for (const sub of Object.values(this.memoisedControllers)) {
				(sub as ControllerImpl<T>).notifyIfChanged()
			}

			/* Notify our change listeners */
			for (const listener of this.changeListeners.reverse()) {
				/* Always use the latest value from this controller, in case a listener has changed it, as we don't re-notify if a listener makes changes due to notifyingSetValue */
				listener(this.value, oldValue)
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
			const value = this.value
			const newValue = value !== undefined ?
				produce(value, (draft) => {
					(draft as any)[name] = subValue as any
				})
				: {
					[name]: subValue,
				}

			this.setValue(newValue as T)
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
