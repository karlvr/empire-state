import { produce } from 'immer'

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
	changeable<K extends keyof T>(name?: K): Changeable<T[K]>
	getter<K extends keyof T>(name: K, func: (value: T[K]) => T[K]): void
	setter<K extends keyof T>(name: K, func: (value: T[K]) => T[K]): void
}

export function forComponentProps<T>(component: ChangeableComponentWithProps<T>): Changeling<T> {
	return new ChangelingImpl(() => component.props)
}

export function forComponentState<T>(component: ChangeableComponentWithState<NonNullable<T>>): Changeling<NonNullable<T>> {
	return new ChangelingImpl(() => ({
		onChange: (newValue: NonNullable<T>) => component.setState(() => newValue),
		value: component.state,
	}))
}

export function forComponentStateProperty<T, K extends keyof T>(component: ChangeableComponentWithState<NonNullable<T>>, property: K): Changeling<NonNullable<T>[K]> {
	return new ChangelingImpl(() => ({
		onChange: (newValue: T[K]) => component.setState(produce((draft) => {
			draft[property] = newValue
		})),
		value: component.state[property],
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
		[name: string]: (value: any) => T[keyof T],
	} = {}
	
	private setters: {
		[name: string]: (value: any) => T[keyof T],
	} = {}

	public constructor(locator: () => Changeable<T>) {
		this.locator = locator
	}

	public changeable(): Changeable<T>
	public changeable<K extends keyof T>(name?: K): Changeable<T[K]>
	public changeable<K extends keyof T>(name?: K): Changeable<any> {
		if (name !== undefined) {
			let onChange = this.propOnChange(name)
			let value = this.value[name]

			const getter = this.getters[name as string]
			if (getter) {
				value = getter(value) as T[K]
			}

			return {
				onChange,
				value,
			}
		} else {
			return {
				onChange: (newValue: T) => this.onChange(newValue),
				value: this.value,
			}
		}
	}

	public getter<K extends keyof T>(name: K, func: (value: T[K]) => T[K]) {
		this.getters[name as string] = func
	}

	public setter<K extends keyof T>(name: K, func: (value: T[K]) => T[K]) {
		this.setters[name as string] = func
		delete this.onChanges[name as string]
	}

	private get value(): T {
		return this.locator().value
	}

	private onChange(value: T) {
		return this.locator().onChange(value)
	}

	private propOnChange<K extends keyof T>(name: K): ((value: T[K]) => void) {
		const result = this.onChanges[name as string]
		if (result) {
			return result
		}

		let func = (subValue: T[K]): void => {
			const value = this.value
			const newValue = produce(value, (draft) => {
				draft[name] = subValue as any
			})

			this.onChange(newValue)
		}

		const setter = this.setters[name as string]
		if (setter) {
			const existingNewFunc = func
			const newFunc = (subValue: T[K]): void => {
				const subValue2 = setter(subValue) as T[K]
				existingNewFunc(subValue2)
			}
			func = newFunc
		}

		this.onChanges[name as string] = func
		return func
	}

}
