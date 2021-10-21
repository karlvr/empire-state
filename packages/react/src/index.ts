import { useMemo, useRef, useState } from 'react'
import { withFuncs, Controller, Snapshot } from 'immutable-state-controller'
import { KEY, KEYABLE, PROPERTY } from 'immutable-state-controller/dist/type-utils'
import { FunctionKeys } from 'immutable-state-controller/dist/utilities'
export { Controller, Snapshot, ChangeListener, withFuncs, withMutable } from 'immutable-state-controller'

export function useController<T>(initialState: T): Controller<T>
export function useController<T>(value: T, onChange: (newValue: T) => void): Controller<T>
export function useController<T>(value: T, onChange?: (newValue: T) => void): Controller<T> {
	if (onChange === undefined) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const [state, setState] = useState(value)
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useSnapshotController({ value: state, change: setState })
	} else {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useSnapshotController({ value, change: onChange })
	}
}

export function useSnapshotController<T>(snapshot: Snapshot<T>): Controller<T> {
	const currentSnapshotValue = useRef(snapshot.value)
	const currentSnapshotSetValue = useRef(snapshot.change)
	currentSnapshotValue.current = snapshot.value
	currentSnapshotSetValue.current = snapshot.change

	/* We use useMemo so that the controller doesn't change, so it doesn't trigger a re-render when we use it in deps in a component.
	   We rely on something else to trigger re-renders, like the state that backs the controller changing.
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
		},
		[],
	)

	/* Because we reuse the same Controller instance if the snapshot value is the same,
	   we must remove all of the change listeners as the render pass will add them again.
	 */
	mainController.removeAllChangeListeners()
	return mainController
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
	setState: (func: (state: T) => T) => void
	state: T
}

/**
 * Create a Controller for a React component's props containing a `value` and `onChange` prop like `Changeable`.
 * @param component A React component
 */
export function forComponentProps<T>(component: ChangeableComponentWithProps<T>): Controller<T>

/**
 * Create a Controller for a named property in a React component's state. You must provide the name of the
 * property containing the value and the property containing the change handling function.
 * @param component A React component
 * @param valueProperty The name of the property containing the `value`.
 * @param onChangeProperty The name of the property containing the `onChange` function.
 */
export function forComponentProps<T, K extends KEY<T>, L extends FunctionKeys<T>>(component: ChangeableComponentWithPropsGeneral<T>, valueProperty: K, onChangeProperty: L): Controller<PROPERTY<T, K>>
export function forComponentProps<T, K extends KEY<T>, L extends FunctionKeys<T>>(component: ChangeableComponentWithProps<T> | ChangeableComponentWithPropsGeneral<T>, valueProperty?: K, onChangeProperty?: L): Controller<PROPERTY<T, K>> | Controller<T> {
	if (onChangeProperty === undefined || valueProperty === undefined) {
		const actualComponent = component as ChangeableComponentWithProps<T>
		return withFuncs(() => actualComponent.props.value, actualComponent.props.change)
	} else {
		const actualComponent = component as ChangeableComponentWithPropsGeneral<T>
		return withFuncs(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			() => (actualComponent.props as any)[valueProperty] as T,
			(newValue) => actualComponent.props[onChangeProperty](newValue),
		)
	}
}

/**
 * Create a Controller for a React component's state.
 * @param component A React component
 */
export function forComponentState<T>(component: ChangeableComponentWithState<T>): Controller<T>

/**
 * Create a Controller for a named property in a React component's state.
 * @param component A React component
 * @param property A property name within the component's state
 */
export function forComponentState<T, K extends KEY<T>>(component: ChangeableComponentWithState<T>, property: K): Controller<PROPERTY<T, K>>

export function forComponentState<T, K extends KEY<T>>(component: ChangeableComponentWithState<T>, property?: K): Controller<PROPERTY<T, K>> | Controller<T> {
	if (property === undefined) {
		return withFuncs(
			() => component.state,
			(newValue) => component.setState(() => newValue),
		)
	} else {
		return withFuncs(
			() => (component.state as KEYABLE<T>)[property],
			(newValue) => {
				component.setState(state => {
					return {
						...state,
						[property]: newValue,
					}
				})
			},
		)
	}
}
