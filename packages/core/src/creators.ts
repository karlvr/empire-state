import { ControllerImpl } from './controller'
import { Controller } from './types'

export function controllerWithFuncs<T>(value: () => T, onChange: (newValue: T) => void): Controller<T> {
	return new ControllerImpl(() => ({
		change: onChange,
		value: value(),
	}))
}

export function controllerWithInitialValue<T>(initialValue: T): Controller<T> {
	let value = initialValue
	return new ControllerImpl(() => ({
		value,
		change: (newValue: T) => {
			value = newValue
		},
	}))
}
