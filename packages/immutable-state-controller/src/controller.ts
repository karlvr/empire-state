/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-dupe-class-members */
import { produce } from 'immer'
import { KEY, PROPERTY, INDEXPROPERTY } from './type-utils'
import { Snapshot, Controller, ChangeListener } from './types'

export class ControllerImpl<T> implements Controller<T> {

	private locator: () => Snapshot<T>

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

	public constructor(locator: () => Snapshot<T>) {
		this.locator = locator
	}

	public snapshot(): Snapshot<T>
	public snapshot(index: number): Snapshot<INDEXPROPERTY<T>>
	public snapshot<K extends KEY<T>>(name?: K): Snapshot<PROPERTY<T, K>>
	public snapshot<K extends KEY<T>>(nameOrIndex?: K | number, index?: number): Snapshot<T> | Snapshot<PROPERTY<T, K>> | Snapshot<INDEXPROPERTY<PROPERTY<T, K>>> | Snapshot<INDEXPROPERTY<T>> {
		if (typeof nameOrIndex === 'number') {
			const onChange = (newValue: INDEXPROPERTY<T>) => {
				const parentNewValue = produce(this.value, draft => {
					(draft as any)[nameOrIndex] = newValue
				})
				this.onChange(parentNewValue)
			}
			const value: any = this.value !== undefined ? (this.value as any)[nameOrIndex] : undefined
			return {
				setValue: onChange,
				value,
			}
		} else if (nameOrIndex !== undefined && index !== undefined) {
			return this.controller(nameOrIndex).snapshot(index)
		} else if (nameOrIndex !== undefined) {
			const onChange: any = this.propOnChange(nameOrIndex as any as keyof T)
			let value: any = this.value !== undefined ? this.value[nameOrIndex as any as keyof T] : undefined

			const getter = this.getters[nameOrIndex as string]
			if (getter) {
				value = getter(value)
			}

			return {
				setValue: onChange,
				value: value as PROPERTY<T, K>,
			}
		} else {
			return {
				setValue: (newValue: T) => this.onChange(newValue),
				value: this.value,
			}
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

	public controller(index: number): Controller<INDEXPROPERTY<T>>
	public controller<K extends KEY<T>>(name: K): Controller<PROPERTY<T, K>>
	public controller<K extends KEY<T>>(name: K, index: number): Controller<INDEXPROPERTY<PROPERTY<T, K>>>
	public controller<K extends KEY<T>>(nameOrIndex: K | number, index?: number): Controller<INDEXPROPERTY<T>> | Controller<PROPERTY<T, K>> | Controller<INDEXPROPERTY<PROPERTY<T, K>>> {
		if (typeof nameOrIndex === 'number') {
			return new ControllerImpl(() => this.snapshot(nameOrIndex))
		} else if (index !== undefined) {
			return this.controller(nameOrIndex).controller(index)
		} else {
			return new ControllerImpl(() => this.snapshot(nameOrIndex))
		}
	}

	private get value(): T {
		return this.locator().value
	}

	private onChange(value: T) {
		this.locator().setValue(value)

		for (const listener of this.changeListeners) {
			listener(value)
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

			this.onChange(newValue as T)
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
