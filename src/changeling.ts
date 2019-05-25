import { produce } from 'immer'
import { KEY, PROPERTY, KEYABLE } from './types';

/** Interface for component props */
export interface Changeable<T> {
	readonly onChange: (value: T) => void
	readonly value: T
}

/** Interface for component containing changeable props */
interface ChangeableComponentWithProps<T> {
	props: Changeable<T>
}

/** Interface for component with the changeable value in the state */
interface ChangeableComponentWithState<T> {
	setState: (func: (state: T) => T) => void
	state: T
}

export interface Changeling<T> {
	changeable(): Changeable<T>
	changeable<K extends KEY<T>>(name: K): Changeable<PROPERTY<T, K>>
	changeling<K extends KEY<T>>(name: K): Changeling<PROPERTY<T, K>>
	getter<K extends KEY<T>>(name: K, func: (value: PROPERTY<T, K>) => PROPERTY<T, K>): void
	setter<K extends KEY<T>>(name: K, func: (value: PROPERTY<T, K>) => PROPERTY<T, K>): void
}

export function forComponentProps<T>(component: ChangeableComponentWithProps<T>): Changeling<T> {
	return new ChangelingImpl(() => component.props)
}

export function forComponentState<T>(component: ChangeableComponentWithState<T>): Changeling<T> {
	return new ChangelingImpl(() => ({
		onChange: (newValue: T) => component.setState(() => newValue),
		value: component.state,
	}))
}

export function forComponentStateProperty<T, K extends KEY<T>>(component: ChangeableComponentWithState<T>, property: K): Changeling<PROPERTY<T, K>> {
	return new ChangelingImpl(() => ({
		onChange: (newValue: PROPERTY<T, K>) => component.setState(produce((draft) => {
			draft[property] = newValue
		})),
		value: (component.state as KEYABLE<T>)[property],
	}))
}

export function withFuncs<T>(value: () => T, onChange: (newValue: T) => void): Changeling<T> {
	return new ChangelingImpl(() => ({
		onChange,
		value: value(),
	}))
}

class ChangelingImpl<T> implements Changeling<T> {

	private locator: () => Changeable<T>

	private onChanges: {
		[name: string]: (value: any) => void,
	} = {}
	
	private getters: {
		[name: string]: (value: any) => PROPERTY<T, KEY<T>>,
	} = {}
	
	private setters: {
		[name: string]: (value: any) => PROPERTY<T, KEY<T>>,
	} = {}

	public constructor(locator: () => Changeable<T>) {
		this.locator = locator
	}

	public changeable(): Changeable<T>
	public changeable<K extends KEY<T>>(name?: K): Changeable<PROPERTY<T, K>>
	public changeable<K extends KEY<T>>(name?: K): Changeable<T> | Changeable<PROPERTY<T, K>> {
		if (name !== undefined) {
			const onChange: any = this.propOnChange(name as any as keyof T)
			let value: any = this.value !== undefined ? this.value[name as any as keyof T] : undefined

			const getter = this.getters[name as string]
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

	public changeling<K extends KEY<T>>(name: K): Changeling<PROPERTY<T, K>> {
		return new ChangelingImpl(() => this.changeable(name as any) as any)
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
