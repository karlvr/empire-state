/* eslint-disable @typescript-eslint/no-explicit-any */
import { produce } from 'immer'
import { DEFAULT_CHANGE_LISTENER_TAG } from './constants'
import { KEY, PROPERTY, INDEXPROPERTY, COMPATIBLEKEYS } from './type-utils'
import { Snapshot, Controller, ChangeListener, ControllerSource, SetValueFunc, isExtendedSnapshot, ExtendedSnapshot, ControllerTransformer, ChangeFunc } from './types'

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
	private memoisedToggle: (() => void) | undefined
	private memoisedControllers: { [prop: string]: Controller<any> } = {}
	private memoisedTransformedControllers: [ControllerTransformer<T, unknown>, Controller<unknown>][] = []
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

	public setValue(value: T): void
	public setValue(func: SetValueFunc<T>): void
	public setValue(value: T | SetValueFunc<T>): void {
		const oldValue = this.source().value

		if (typeof value === 'function') {
			this.internalSetValue((value as SetValueFunc<T>)(oldValue))
		} else {
			return this.internalSetValue(value as T)
		}
	}

	public onToggle(): T extends boolean ? () => void : never
	public onToggle(index: number): T extends (boolean | undefined)[] ? () => void : never
	public onToggle(name: 'this'): T extends boolean ? () => void : never
	public onToggle<K extends COMPATIBLEKEYS<T, boolean | undefined>>(name: K): () => void
	public onToggle<K extends COMPATIBLEKEYS<T, (boolean | undefined)[] | undefined>>(name: K, index: number): () => void
	public onToggle<K extends COMPATIBLEKEYS<T, boolean |(boolean | undefined)[] | undefined>>(nameOrIndex?: K | number | 'this', index?: number): () => void {
		if (nameOrIndex !== undefined) {
			return this.internalController(nameOrIndex, index).onToggle()
		}

		if (this.memoisedToggle) {
			return this.memoisedToggle
		}

		this.memoisedToggle = () => {
			this.setValue(!this.value as unknown as T)
		}
		return this.memoisedToggle
	}
 
	public onChange(): ChangeFunc<T>
	public onChange(index: number): ChangeFunc<INDEXPROPERTY<T>>
	public onChange(name: 'this'): ChangeFunc<T>
	public onChange<K extends KEY<T>>(name: K): ChangeFunc<PROPERTY<T, K>>
	public onChange<K extends KEY<T>>(name: K, index: number): ChangeFunc<INDEXPROPERTY<PROPERTY<T, K>>>
	public onChange<K extends KEY<T>>(nameOrIndex?: K | number | 'this', index?: number) {
		return this.internalSnapshot(nameOrIndex, index).change
	}

	public snapshot(): Snapshot<T>
	public snapshot(index: number): Snapshot<INDEXPROPERTY<T>>
	public snapshot(name: 'this'): Snapshot<T>
	public snapshot<K extends KEY<T>>(name?: K): Snapshot<PROPERTY<T, K>>
	public snapshot<K extends KEY<T>>(nameOrIndex?: K | number | 'this', index?: number): Snapshot<T> | Snapshot<PROPERTY<T, K>> | Snapshot<INDEXPROPERTY<PROPERTY<T, K>>> | Snapshot<INDEXPROPERTY<T>> {
		return this.internalSnapshot(nameOrIndex, index)
	}

	public getter<K extends KEY<T>>(name: K, func: (value: PROPERTY<T, K>) => PROPERTY<T, K>) {
		this.getters[name as string] = func
	}

	public setter<K extends KEY<T>>(name: K, func: (value: PROPERTY<T, K>) => PROPERTY<T, K>) {
		this.setters[name as string] = func
		delete this.onChanges[name as string]
	}

	public transform<X>(transformer: ControllerTransformer<T, X>): Controller<X> {
		const memoized = this.memoisedTransformedControllers.find(tuple => tuple[0] === transformer)
		if (memoized) {
			return memoized[1] as Controller<X>
		}

		const result = new ControllerImpl<X>(() => {
			return {
				value: transformer.to(this.value),
				change: (newValue) => {
					if (typeof newValue === 'function') {
						newValue = (newValue as unknown as SetValueFunc<X>)(transformer.to(this.value))
					}
					this.setValue(transformer.from(newValue as any))
				},
			}
		})

		this.memoisedTransformedControllers.push([transformer as ControllerTransformer<T, unknown>, result as unknown as Controller<unknown>])
		return result
	}

	public addChangeListener(listener: ChangeListener<T>, tag?: string) {
		this.changeListeners.push({
			listener,
			tag: tag !== undefined ? tag : DEFAULT_CHANGE_LISTENER_TAG,
		})
		return this
	}

	public removeChangeListener(listener: ChangeListener<T>) {
		const index = this.changeListeners.findIndex(info => info.listener === listener)
		if (index !== -1) {
			this.changeListeners.splice(index, 1)
		}
		return this
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
		return this
	}

	public get(index: number): Controller<INDEXPROPERTY<T>>
	public get<K extends KEY<T>>(name: K): Controller<PROPERTY<T, K>>
	public get(name: 'this'): Controller<T>
	public get<K extends KEY<T>>(name: K, index: number): Controller<INDEXPROPERTY<PROPERTY<T, K>>>
	public get<K extends KEY<T>>(nameOrIndex: K | number | 'this', index?: number): Controller<INDEXPROPERTY<T>> | Controller<PROPERTY<T, K>> | Controller<T> | Controller<INDEXPROPERTY<PROPERTY<T, K>>> {
		return this.internalController(nameOrIndex, index)
	}

	public set(index: number, newValue: INDEXPROPERTY<T>): void
	public set(name: 'this', newValue: T): void
	public set<K extends KEY<T>>(name: K, newValue: PROPERTY<T, K>): void
	public set<K extends KEY<T>>(nameOrIndex: K | number | 'this', newValue: PROPERTY<T, K> | INDEXPROPERTY<T> | T): void {
		(this.internalController(nameOrIndex) as Controller<unknown>).setValue(newValue)
	}

	public map<U>(callback: (controller: Controller<INDEXPROPERTY<T>>, index: number, array: T) => U): U[]
	public map<U>(name: 'this', callback: (controller: Controller<INDEXPROPERTY<T>>, index: number, array: T) => U): U[]
	public map<K extends KEY<T>, U>(name: K, callback: (controller: Controller<INDEXPROPERTY<PROPERTY<T, K>>>, index: number, array: PROPERTY<T, K>) => U): U[]
	public map<K extends KEY<T>, U>(name: K | 'this' | ((controller: Controller<INDEXPROPERTY<T>>, index: number, array: T) => U), callback?: (controller: Controller<INDEXPROPERTY<T>> | Controller<INDEXPROPERTY<PROPERTY<T, K>>>, index: number, array: PROPERTY<T, K>) => U): U[] {
		if (typeof name === 'function') {
			return this.map('this', name)
		}
		const value: unknown[] = name === 'this' ? this.value : this.value !== undefined ? (this.value as any)[name] : undefined
		if (!value || !callback) {
			return []
		}
		if (typeof value.map !== 'function') {
			throw new Error(`Controller.map called with non-array value: ${value}`)
		}
		return value.map((nestedValue, nestedValueIndex) => {
			const nestedController = this.internalController(name, nestedValueIndex) as Controller<INDEXPROPERTY<PROPERTY<T, K>>>
			return callback(nestedController, nestedValueIndex, value as any)
		})
	}

	public findIndex(predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): number
	public findIndex(name: 'this', predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): number
	public findIndex<K extends KEY<T>>(name: K, predicate: (value: INDEXPROPERTY<PROPERTY<T, K>>, index: number, array: PROPERTY<T, K>) => boolean): number
	public findIndex<K extends KEY<T>>(name: K | 'this' | ((value: INDEXPROPERTY<T>, index: number, array: T) => boolean), predicate?: (value: INDEXPROPERTY<PROPERTY<T, K>>, index: number, array: PROPERTY<T, K>) => boolean): number {
		if (typeof name === 'function') {
			return this.findIndex('this', name)
		}
		const value: unknown[] = name === 'this' ? this.value : this.value !== undefined ? (this.value as any)[name] : undefined
		if (!value) {
			return -1
		}
		if (typeof value.findIndex !== 'function') {
			throw new Error(`Controller.findIndex called with non-array value: ${value}`)
		}
		return value.findIndex(predicate as any)
	}

	public find(predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): Controller<INDEXPROPERTY<T>> | undefined
	public find(name: 'this', predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): Controller<INDEXPROPERTY<T>> | undefined
	public find<K extends KEY<T>>(name: K, predicate: (value: INDEXPROPERTY<PROPERTY<T, K>>, index: number, array: PROPERTY<T, K>) => boolean): Controller<INDEXPROPERTY<PROPERTY<T, K>>> | undefined
	public find<K extends KEY<T>>(name: K | 'this' | ((value: INDEXPROPERTY<T>, index: number, obj: T) => boolean), predicate?: (value: INDEXPROPERTY<PROPERTY<T, K>>, index: number, array: PROPERTY<T, K>) => boolean): Controller<INDEXPROPERTY<T>> | undefined {
		if (typeof name === 'function') {
			return this.find('this', name)
		}
		const value: unknown[] = name === 'this' ? this.value : this.value !== undefined ? (this.value as any)[name] : undefined
		if (!value) {
			return undefined
		}
		if (typeof value.findIndex !== 'function') {
			throw new Error(`Controller.find called with non-array value: ${value}`)
		}
		const index = value.findIndex(predicate as any)
		if (index === -1) {
			return undefined
		}
		return name === 'this' ? this.get(index) : this.get(name).get(index) as any
	}

	/**
	 * Push a value onto the end of an array.
	 * @param name 
	 * @param newValue 
	 */
	public push(newValue: INDEXPROPERTY<T>): void
	public push(name: 'this', newValue: INDEXPROPERTY<T>): void
	public push<K extends KEY<T>>(name: K, newValue: INDEXPROPERTY<PROPERTY<T, K>>): void
	public push<K extends KEY<T>>(nameOrIndexOrNewValue: K | 'this' | INDEXPROPERTY<T>, newValue?: INDEXPROPERTY<PROPERTY<T, K>> | INDEXPROPERTY<T>): void {
		if (arguments.length === 1) {
			this.push('this', nameOrIndexOrNewValue as INDEXPROPERTY<T>)
		} else {
			(this.internalController(nameOrIndexOrNewValue as K | 'this') as Controller<unknown>).setValue((value: any) => ([...(value || []), newValue]))
		}
	}

	public pushNew(): Controller<INDEXPROPERTY<T>>
	public pushNew(name: 'this'): Controller<INDEXPROPERTY<T>>
	public pushNew<K extends KEY<T>>(name: K): Controller<INDEXPROPERTY<PROPERTY<T, K>>>
	public pushNew<K extends KEY<T>>(name?: K | 'this'): Controller<INDEXPROPERTY<T>> | Controller<INDEXPROPERTY<PROPERTY<T, K>>> {
		const subController = this.internalController(name !== undefined ? name : 'this') as Controller<any>

		let pushedValueController: Controller<any> | undefined
		return new ControllerImpl<unknown>(() => {
			return {
				change: (newValue) => {
					if (!pushedValueController) {
						subController.push('this', newValue)
						const length = (subController.value as unknown as Array<unknown>).length
						pushedValueController = subController.get(length - 1)
					} else {
						pushedValueController.setValue(newValue)
					}
				},
				value: pushedValueController ? pushedValueController.value : undefined,
			}
		}) as any
	}

	/**
	 * Remove values matching a predicate from an array property.
	 * @param predicate 
	 */
	public remove(): void
	public remove(predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): void
	public remove(name: 'this', predicate: (value: INDEXPROPERTY<T>, index: number, array: T) => boolean): void
	public remove<K extends KEY<T>>(name: K, predicate: (value: INDEXPROPERTY<PROPERTY<T, K>>, index: number, array: PROPERTY<T, K>) => boolean): void
	public remove<K extends KEY<T>>(name?: K | 'this' | ((value: INDEXPROPERTY<T>, index: number, array: T) => boolean), predicate?: (value: INDEXPROPERTY<PROPERTY<T, K>>, index: number, array: PROPERTY<T, K>) => boolean): void {
		if (typeof name === 'undefined') {
			this.removeFromParent()
			return
		}

		if (typeof name === 'function') {
			return this.remove('this', name)
		}
		if (typeof predicate === 'undefined') {
			throw new Error('Predicate parameter is required')
		}

		if (name !== 'this') {
			return this.get(name).remove('this', predicate)
		}
		
		const value: unknown[] = this.value as unknown as unknown[]
		if (!value) {
			return
		}
		
		const newValue = value.filter((value, index, array) => !predicate!(value as any, index, array as any))
		this.setValue(newValue as unknown as T)
	}

	public splice(index: number, deleteCount?: number, ...items: INDEXPROPERTY<T>[]): INDEXPROPERTY<T>[]
	public splice(name: 'this', index: number, deleteCount?: number, ...items: INDEXPROPERTY<T>[]): INDEXPROPERTY<T>[]
	public splice<K extends KEY<T>>(name: K, index: number, deleteCount?: number, ...items: INDEXPROPERTY<PROPERTY<T, K>>[]): INDEXPROPERTY<PROPERTY<T, K>>[]
	public splice<K extends KEY<T>>(nameOrIndex: K | 'this' | number, indexOrDeleteCount?: number, ...itemsOr: (INDEXPROPERTY<T> |INDEXPROPERTY<PROPERTY<T, K>> | number | undefined)[]): INDEXPROPERTY<T>[] | INDEXPROPERTY<PROPERTY<T, K>>[] {
		if (typeof nameOrIndex === 'number') {
			return this.splice('this', nameOrIndex, indexOrDeleteCount as number | undefined, ...itemsOr as INDEXPROPERTY<T>[])
		}

		if (nameOrIndex !== 'this') {
			return this.get(nameOrIndex).splice('this', indexOrDeleteCount as number, itemsOr[0] as number | undefined, ...itemsOr.slice(1) as any[])
		}

		const index = indexOrDeleteCount as number
		const deleteCount = itemsOr[0] as number | undefined
		const items = itemsOr.slice(1) as INDEXPROPERTY<T>[] | undefined

		if (index === undefined) {
			return []
		}
		
		let value: unknown[] = this.value as unknown as unknown[]
		if (!value) {
			if (items === undefined) {
				return []
			}

			value = []
		}
		
		const newValue = [...value]
		const result = deleteCount !== undefined ? newValue.splice(index, deleteCount, ...(items || [])) : newValue.splice(index)
		this.setValue(newValue as unknown as T)
		return result as INDEXPROPERTY<T>[] | INDEXPROPERTY<PROPERTY<T, K>>[]
	}

	private internalSetValue(value: T, fromSubController = false): void {
		const oldValue = this.source().value
		this.source().change(value as T)
		this.lastKnownValue = value as T

		this.notifyChanges(oldValue, fromSubController)
	}
	
	private internalController<K extends KEY<T>>(nameOrIndex: K | number | 'this', index?: number): Controller<INDEXPROPERTY<T>> | Controller<PROPERTY<T, K>> | Controller<T> | Controller<INDEXPROPERTY<PROPERTY<T, K>>> {
		if (index !== undefined) {
			return this.get(nameOrIndex as K).get(index)
		} else if (nameOrIndex === 'this') {
			return this
		}

		const memoisedController = this.memoisedControllers[`${String(nameOrIndex)}`]
		if (memoisedController) {
			return memoisedController
		}

		let result: Controller<INDEXPROPERTY<T>> | Controller<PROPERTY<T, K>> | Controller<T> | Controller<INDEXPROPERTY<PROPERTY<T, K>>>
		if (typeof nameOrIndex === 'number') {
			/* Array values */
			result = new ControllerImpl<INDEXPROPERTY<T>>(() => {
				const onChange: ChangeFunc<INDEXPROPERTY<T>> = (newValue) => {
					const currentValue = this.value
					if (typeof newValue === 'function') {
						const value: any = currentValue !== undefined && currentValue !== null ? (currentValue as any)[nameOrIndex] : undefined
						newValue = (newValue as SetValueFunc<INDEXPROPERTY<T>>)(value)
					}

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
					this.internalSetValue(parentNewValue, true)
				}
				const onRemove = () => {
					const currentValue = this.value
					if (currentValue === undefined || currentValue === null) {
						return
					}
					const parentNewValue = produce(this.value, draft => {
						(draft as unknown as Array<INDEXPROPERTY<T>>).splice(nameOrIndex, 1)
					})
					this.internalSetValue(parentNewValue, true)
				}
				const currentValue = this.value
				const value: any = currentValue !== undefined && currentValue !== null ? (currentValue as any)[nameOrIndex] : undefined
				const extendedSnapshot: ExtendedSnapshot<INDEXPROPERTY<T>> = {
					change: onChange,
					value: produce(value, (draft: any) => draft) as INDEXPROPERTY<T>,
					extendedSnapshot: true,
					remove: onRemove,
				}
				return extendedSnapshot
			})
		} else {
			/* Object values */
			result = new ControllerImpl<PROPERTY<T, K>>(() => {
				const onChange = this.propOnChange(nameOrIndex)
				const onRemove = () => {
					onChange(undefined as any)
				}
				const currentValue = this.value
				let value: any = currentValue !== undefined && currentValue !== null ? currentValue[nameOrIndex as unknown as keyof T] : undefined

				const getter = this.getters[nameOrIndex as string]
				if (getter) {
					value = getter(value)
				}

				const extendedSnapshot: ExtendedSnapshot<PROPERTY<T, K>> = {
					change: onChange,
					value: produce(value, (draft: any) => draft) as any as PROPERTY<T, K>,
					extendedSnapshot: true,
					remove: onRemove,
				}
				return extendedSnapshot
			})
		}

		this.memoisedControllers[`${String(nameOrIndex)}`] = result
		return result
	}

	private internalSnapshot<K extends KEY<T>>(nameOrIndex?: K | number | 'this', index?: number): Snapshot<T> | Snapshot<PROPERTY<T, K>> | Snapshot<INDEXPROPERTY<PROPERTY<T, K>>> | Snapshot<INDEXPROPERTY<T>> {
		if (nameOrIndex !== undefined) {
			return this.internalController(nameOrIndex, index).snapshot()
		}

		/* If the snapshot value hasn't changed, we return the memoised snapshot */
		const memoisedSnapshot = this.memoisedSnapshot
		if (memoisedSnapshot && memoisedSnapshot.value === this.value) {
			return memoisedSnapshot
		} else {
			const result: Snapshot<T> = {
				change: (newValue) => {
					if (typeof newValue === 'function') {
						newValue = (newValue as SetValueFunc<T>)(this.value)
					}
					this.setValue(newValue)
				},
				value: produce(this.value, draft => draft),
			}

			this.memoisedSnapshot = result
			return result
		}
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

	private propOnChange<K extends KEY<T>>(name: K): ChangeFunc<PROPERTY<T, K>> {
		const PROPERTY = this.onChanges[name as string]
		if (PROPERTY) {
			return PROPERTY
		}

		let func: ChangeFunc<PROPERTY<T, K>> = (subValue): void => {
			const currentValue = this.value
			if (typeof subValue === 'function') {
				subValue = (subValue as SetValueFunc<PROPERTY<T, K>>)(currentValue !== undefined && currentValue !== null ? (currentValue as any)[name] : undefined)
			}
			const newValue = currentValue !== undefined && currentValue !== null ?
				produce(currentValue, (draft) => {
					(draft as any)[name] = subValue as any
				})
				: {
					[name]: subValue,
				}

			this.internalSetValue(newValue as T, true)
		}

		const setter = this.setters[name as string]
		if (setter) {
			const existingNewFunc = func
			const newFunc: ChangeFunc<PROPERTY<T, K>> = (subValue): void => {
				const subValue2 = setter(subValue) as PROPERTY<T, K>
				existingNewFunc(subValue2)
			}
			func = newFunc
		}

		this.onChanges[name as string] = func
		return func
	}

	private removeFromParent(): void {
		const snapshot = this.source()
		if (!isExtendedSnapshot(snapshot)) {
			throw new Error('Source is not an ExtendedSnapshot therefore remove() is not supported')
		}

		if (!snapshot.remove) {
			throw new Error('Source is an ExtendedSnapshot but does not support remove()')
		}

		snapshot.remove()
	}

}
