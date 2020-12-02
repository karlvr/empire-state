import { useMemo, useRef, useState } from 'react'
import { withFuncs, Controller, Snapshot } from 'immutable-state-controller'
export * from './components'
export { Controller, Snapshot } from 'immutable-state-controller'

export function useController<T>(initialState: T): Controller<T>
export function useController<T>(value: T, setValue: (newValue: T) => void): Controller<T>
export function useController<T>(value: T, setValue?: (newValue: T) => void): Controller<T> {
	if (setValue === undefined) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const [state, setState] = useState(value)
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useSnapshotController({ value: state, setValue: setState })
	} else {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useSnapshotController({ value, setValue })
	}
}

export function useSnapshotController<T>(snapshot: Snapshot<T>): Controller<T> {
	const currentSnapshotValue = useRef(snapshot.value)
	const currentSnapshotSetValue = useRef(snapshot.setValue)
	currentSnapshotValue.current = snapshot.value
	currentSnapshotSetValue.current = snapshot.setValue

	/* We use useMemo so that the controller doesn't change unless the value changes,
	   so it doesn't trigger a re-render when we use it in deps in a component.
	 */
	const mainController = useMemo(
		() => {
			return withFuncs(
				() => currentSnapshotValue.current, 
				(newValue) => {
					currentSnapshotValue.current = newValue
					currentSnapshotSetValue.current(newValue)
				},
			)
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const ignore = snapshot.value
		},
		[snapshot.value],
	)

	/* Because we reuse the same Controller instance if the snapshot value is the same,
	   we must remove all of the change listeners as the render pass will add them again.
	 */
	mainController.removeAllChangeListeners()
	return mainController
}
