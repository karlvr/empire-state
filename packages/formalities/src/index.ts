import { useState } from 'react'
import { withFuncs, Controller, Snapshot } from 'immutable-state-controller'
export * from './components'
export { Controller, Snapshot } from 'immutable-state-controller'

export function useController<T>(initialState: T): Controller<T>
export function useController<T>(value: T, onChange: (newValue: T) => void): Controller<T>
export function useController<T>(value: T, onChange?: (newValue: T) => void): Controller<T> {
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

export function useSnapshotController<T>(snapshot: Snapshot<T>): Controller<T> {
	return withFuncs(() => snapshot.value, snapshot.setValue)
}
