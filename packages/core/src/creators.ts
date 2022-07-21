import { ControllerImpl } from './controller'
import { Controller, SetValueFunc } from './types'

export function controllerWithFuncs<T>(value: () => T, onChange: (newValue: T) => void): Controller<T> {
	return new ControllerImpl(() => ({
		change: function(newValue) {
			if (typeof newValue === 'function') {
				newValue = (newValue as SetValueFunc<T>)(value())
			}
			onChange(newValue)
		},
		value: value(),
	}))
}

export function controllerWithInitialValue<T>(initialValue: T): Controller<T> {
	let value = initialValue
	return new ControllerImpl(() => ({
		value,
		change: (newValue) => {
			if (typeof newValue === 'function') {
				newValue = (newValue as SetValueFunc<T>)(value)
			}
			value = newValue
		},
	}))
}
