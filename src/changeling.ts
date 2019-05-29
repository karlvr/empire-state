import { produce } from 'immer'
import { KEY, PROPERTY, KEYABLE, INDEXPROPERTY } from './types';
import { FunctionKeys } from './utilities';

/** Interface for component props */
export interface Snapshot<T> {
	readonly onChange: (value: T) => void
	readonly value: T
}

/** Interface for component containing changeable props */
interface ChangeableComponentWithProps<T> {
	props: Snapshot<T>
}

interface ChangeableComponentWithPropsGeneral<T> {
	props: T
}

/** Interface for component with the changeable value in the state */
interface ChangeableComponentWithState<T> {
	setState: (func: (state: T) => any) => void
	state: T
}

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
}

/**
 * Create a Changeling for a React component's props containing a `value` and `onChange` prop like `Changeable`.
 * @param component A React component
 */
export function forComponentProps<T>(component: ChangeableComponentWithProps<T>): Controller<T>

/**
 * Create a Changeling for a named property in a React component's state. You must provide the name of the
 * property containing the value and the property containing the change handling function.
 * @param component A React component
 * @param valueProperty The name of the property containing the `value`.
 * @param onChangeProperty The name of the property containing the `onChange` function.
 */
export function forComponentProps<T, K extends KEY<T>, L extends FunctionKeys<T>>(component: ChangeableComponentWithPropsGeneral<T>, valueProperty: K, onChangeProperty: L): Controller<PROPERTY<T, K>>
export function forComponentProps<T, K extends KEY<T>, L extends FunctionKeys<T>>(component: ChangeableComponentWithPropsGeneral<T>, valueProperty?: K, onChangeProperty?: L): Controller<PROPERTY<T, K>> | Controller<T> {
	if (onChangeProperty === undefined || valueProperty === undefined) {
		return new ChangelingImpl(() => component.props as any as Snapshot<T>)
	} else {
		return new ChangelingImpl(() => ({
			onChange: (newValue: T) => ((component.props as any)[onChangeProperty] as any as (newValue: T) => void)(newValue),
			value: (component.props as any)[valueProperty] as T,
		}))
	}
}

/**
 * Create a Changeling for a React component's state.
 * @param component A React component
 */
export function forComponentState<T>(component: ChangeableComponentWithState<T>): Controller<T>

/**
 * Create a Changeling for a named property in a React component's state.
 * @param component A React component
 * @param property A property name within the component's state
 */
export function forComponentState<T, K extends KEY<T>>(component: ChangeableComponentWithState<T>, property: K): Controller<PROPERTY<T, K>>

export function forComponentState<T, K extends KEY<T>>(component: ChangeableComponentWithState<T>, property?: K): Controller<PROPERTY<T, K>> | Controller<T> {
	if (property === undefined) {
		return new ChangelingImpl(() => ({
			onChange: (newValue: T) => component.setState(() => newValue),
			value: component.state,
		}))
	} else {
		return new ChangelingImpl(() => ({
			onChange: (newValue: PROPERTY<T, K>) => component.setState(produce((draft) => {
				draft[property] = newValue
			})),
			value: (component.state as KEYABLE<T>)[property],
		}))
	}
}

export function withFuncs<T>(value: () => T, onChange: (newValue: T) => void): Controller<T> {
	return new ChangelingImpl(() => ({
		onChange,
		value: value(),
	}))
}

export function withMutable<T extends object>(value: T): Controller<T> {
	return new ChangelingImpl(() => ({
		onChange: (newValue: T) => {
			for (let i in value) {
				if (value.hasOwnProperty(i)) {
					delete value[i]
				}
			}

			for (let i in newValue) {
				if (newValue.hasOwnProperty(i)) {
					value[i] = newValue[i]
				}
			}
		},
		value,
	}))
}

class ChangelingImpl<T> implements Controller<T> {

	private locator: () => Snapshot<T>

	private onChanges: {
		[name: string]: (value: any) => void,
	} = {}
	
	private getters: {
		[name: string]: (value: any) => PROPERTY<T, KEY<T>>,
	} = {}
	
	private setters: {
		[name: string]: (value: any) => PROPERTY<T, KEY<T>>,
	} = {}

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
				onChange,
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
				onChange,
				value: value as PROPERTY<T, K>,
			}
		} else {
			return {
				onChange: (newValue: T) => this.onChange(newValue),
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

	public controller(index: number): Controller<INDEXPROPERTY<T>>
	public controller<K extends KEY<T>>(name: K): Controller<PROPERTY<T, K>>
	public controller<K extends KEY<T>>(name: K, index: number): Controller<INDEXPROPERTY<PROPERTY<T, K>>>
	public controller<K extends KEY<T>>(nameOrIndex: K | number, index?: number): Controller<INDEXPROPERTY<T>> | Controller<PROPERTY<T, K>> | Controller<INDEXPROPERTY<PROPERTY<T, K>>> {
		if (typeof nameOrIndex === 'number') {
			return new ChangelingImpl(() => this.snapshot(nameOrIndex))
		} else if (index !== undefined) {
			return this.controller(nameOrIndex).controller(index)
		} else {
			return new ChangelingImpl(() => this.snapshot(nameOrIndex))
		}
	}

	private get value(): T {
		return this.locator().value
	}

	private onChange(value: T) {
		return this.locator().onChange(value)
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
					draft[name] = subValue as any
				})
				: {
					[name]: subValue
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
