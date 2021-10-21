/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-dupe-class-members */
import { produce } from 'immer'
import { KEY, PROPERTY, INDEXPROPERTY } from './type-utils'
import { Snapshot, Controller, ChangeListener, ControllerSource } from './types'

export class ControllerImpl<T> implements Controller<T> {

	private source: () => Snapshot<T>

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
	private memoisedSnapshots: { [prop: string]: Snapshot<any> } = {}
	private memoisedControllers: { [prop: string]: Controller<any> } = {}

	public constructor(source: ControllerSource<T>) {
		this.source = source
	}

	public snapshot(): Snapshot<T>
	public snapshot(index: number): Snapshot<INDEXPROPERTY<T>>
	public snapshot(name: 'this'): Snapshot<T>
	public snapshot<K extends KEY<T>>(name?: K): Snapshot<PROPERTY<T, K>>
	public snapshot<K extends KEY<T>>(nameOrIndex?: K | number | 'this', index?: number): Snapshot<T> | Snapshot<PROPERTY<T, K>> | Snapshot<INDEXPROPERTY<PROPERTY<T, K>>> | Snapshot<INDEXPROPERTY<T>> {
		if (index !== undefined) {
			return this.controller(nameOrIndex as K).snapshot(index)
		}

		let result: Snapshot<T> | Snapshot<PROPERTY<T, K>> | Snapshot<INDEXPROPERTY<PROPERTY<T, K>>> | Snapshot<INDEXPROPERTY<T>>
		
		if (typeof nameOrIndex === 'number') {
			const onChange = (newValue: INDEXPROPERTY<T>) => {
				const parentNewValue = produce(this.value, draft => {
					(draft as any)[nameOrIndex] = newValue
				})
				this.setValue(parentNewValue)
			}
			const value: any = this.value !== undefined ? (this.value as any)[nameOrIndex] : undefined
			result = {
				change: onChange,
				value: produce(value, (draft: any) => {}) as any,
			}
		} else if (nameOrIndex === undefined || nameOrIndex === 'this') {
			result = {
				change: (newValue: T) => this.setValue(newValue),
				value: produce(this.value, draft => {}),
			}
		} else {
			const onChange: any = this.propOnChange(nameOrIndex as unknown as keyof T)
			let value: any = this.value !== undefined ? this.value[nameOrIndex as unknown as keyof T] : undefined

			const getter = this.getters[nameOrIndex as string]
			if (getter) {
				value = getter(value)
			}

			result = {
				change: onChange,
				value: produce(value, (draft: any) => {}) as any,
			}
		}

		/* If the snapshot value hasn't changed, we return the memoised snapshot */
		const memoisedSnapshot = this.memoisedSnapshots[`${nameOrIndex}`]
		if (memoisedSnapshot && memoisedSnapshot.value === result.value) {
			return memoisedSnapshot
		} else {
			this.memoisedSnapshots[`${nameOrIndex}`] = result
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
	}

	public controller(index: number): Controller<INDEXPROPERTY<T>>
	public controller<K extends KEY<T>>(name: K): Controller<PROPERTY<T, K>>
	public controller(name: 'this'): Controller<T>
	public controller<K extends KEY<T>>(name: K, index: number): Controller<INDEXPROPERTY<PROPERTY<T, K>>>
	public controller<K extends KEY<T>>(nameOrIndex: K | number | 'this', index?: number): Controller<INDEXPROPERTY<T>> | Controller<PROPERTY<T, K>> | Controller<T> | Controller<INDEXPROPERTY<PROPERTY<T, K>>> {
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
			result = new ControllerImpl(() => this.snapshot(nameOrIndex))
		} else {
			result = new ControllerImpl(() => this.snapshot(nameOrIndex))
		}

		this.memoisedControllers[`${nameOrIndex}`] = result
		return result
	}

	public get value(): T {
		return this.source().value
	}

	public setValue(value: T) {
		const oldValue = this.source().value
		this.source().change(value)

		for (const listener of this.changeListeners) {
			listener(value, oldValue)
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
