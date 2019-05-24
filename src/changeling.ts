import { produce } from 'immer'

/** Interface for component props */
export interface Changeable<T> {
	onChange: (value: T) => void
	value: T
}

/** Interface for component containing changeable props */
interface ChangeableComponent<T> {
	props: Changeable<T>
}

export interface ChangeableState<T> {
	value: T
}

/** Interface for component with the changeable value in the state */
interface ChangeableComponentWithState<T> {
	setState: (func: (state: ChangeableState<T>) => ChangeableState<T>) => void
	state: ChangeableState<T>
}

export interface Changeling<T> {
	changeable<K extends keyof T>(name: K): Changeable<T[K]>
	getter<K extends keyof T>(name: K, func: (value: T[K]) => T[K]): void
	setter<K extends keyof T>(name: K, func: (value: T[K]) => T[K]): void
}

export function forComponentProps<T>(component: ChangeableComponent<T>): Changeling<T> {
	return new ChangelingImpl(() => component.props)
}

export function forComponentState<T>(component: ChangeableComponentWithState<T>): Changeling<T> {
	return new ChangelingImpl(() => ({
		onChange: (newValue: T) => component.setState(produce((draft) => {
			draft.value = newValue
		})),
		value: component.state.value,
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

	public changeable<K extends keyof T>(name: K): Changeable<T[K]> {
		let onChange = this.propOnChange(name)
		let value = this.value()[name]

		const getter = this.getters[name as string]
		if (getter) {
			value = getter(value) as T[K]
		}

		return {
			onChange,
			value,
		}
	}

	public getter<K extends keyof T>(name: K, func: (value: T[K]) => T[K]) {
		this.getters[name as string] = func
	}

	public setter<K extends keyof T>(name: K, func: (value: T[K]) => T[K]) {
		this.setters[name as string] = func
		delete this.onChanges[name as string]
	}

	private value(): T {
		return this.locator().value
	}

	private onChange(): ((value: T) => void) {
		return this.locator().onChange
	}

	private propOnChange<K extends keyof T>(name: K): ((value: T[K]) => void) {
		const result = this.onChanges[name as string]
		if (result) {
			return result
		}

		let func = (subValue: T[K]): void => {
			const value = this.value()
			const newValue = produce(value, (draft) => {
				draft[name] = subValue as any
			})

			const onChange = this.onChange()
			onChange(newValue)
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
