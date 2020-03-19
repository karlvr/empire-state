import { useState } from 'react'
import { withFuncs, Controller } from 'change-controller'
export * from './components'
export { Controller, Snapshot } from 'change-controller'

// export { ControllerProps } from './components'

export function useFormalities<T>(initialState: T): Controller<T>
export function useFormalities<T>(value: T, onChange: (newValue: T) => void): Controller<T>
export function useFormalities<T>(value: T, onChange?: (newValue: T) => void): Controller<T> {
	let controller: Controller<T>
	if (onChange === undefined) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const [state, setState] = useState(value)
		controller = withFuncs(() => state, setState)
	} else {
		controller = withFuncs(() => value, onChange)
	}

	return controller
}

// const controllerContext = createContext<Controller<any> | null>(null)

// export function formalities<T>(controller: Controller<T>) {
// 	controllerContext.Provider()
// }