import { useMemo, useRef, useState } from 'react'
import { withFuncs, Controller, Snapshot } from 'immutable-state-controller'
import { KEY, KEYABLE, PROPERTY } from 'immutable-state-controller/dist/type-utils'
import { FunctionKeys } from 'immutable-state-controller/dist/utilities'
export { Controller, Snapshot, ChangeListener, withFuncs, withInitialValue } from 'immutable-state-controller'

/**
 * <p>Create a new controller with undefined initial state.</p>
 * <p>This method uses React.useState to store the value, so components will re-render when the controller's
 * value changes.</p>
 */
export function useController<T = undefined>(): Controller<T | undefined>

/**
 * <p>Create a new controller with the given initial state.</p>
 * <p>This method uses React.useState to store the value, so components will re-render when the controller's
 * value changes.</p>
 * @param initialState 
 * @returns 
 */
export function useController<T>(initialState: T): Controller<T>

export function useController<T>(initialState?: T): Controller<T | undefined> {
	const [state, setState] = useState(initialState)
	return createMemoisedController({ value: state, change: setState })
}

/**
 * <p>Create a new Controller with the given Snapshot.</p>
 * @param snapshot 
 * @returns 
 */
export function useSnapshotController<T>(snapshot: Snapshot<T>): Controller<T> {
	return createMemoisedController(snapshot)
}

function createMemoisedController<T>(snapshot: Snapshot<T>): Controller<T> {
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
					/* Ensure that we always return the current value as per the required semantics of ControllerSource */
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
	props: {
		value: T
		onChange: (newValue: T) => void
	}
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
 * Create a Controller for a React component containing `value` and `onChange` props.
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
		let currentValue = actualComponent.props.value
		return withFuncs(
			() => currentValue,
			newValue => {
				/* Ensure that we always return the current value as per the required semantics of ControllerSource */
				currentValue = newValue
				actualComponent.props.onChange(newValue)
			}
		)
	} else {
		const actualComponent = component as ChangeableComponentWithPropsGeneral<T>
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let currentValue = (actualComponent.props as any)[valueProperty] as T
		return withFuncs(
			() => currentValue,
			(newValue) => {
				/* Ensure that we always return the current value as per the required semantics of ControllerSource */
				currentValue = newValue
				actualComponent.props[onChangeProperty](newValue)
			}
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
		let currentValue = component.state
		return withFuncs(
			() => currentValue,
			(newValue) => {
				/* Ensure that we always return the current value as per the required semantics of ControllerSource */
				currentValue = newValue
				component.setState(() => newValue)
			}
		)
	} else {
		let currentValue = (component.state as KEYABLE<T>)[property]
		return withFuncs(
			() => currentValue,
			(newValue) => {
				/* Ensure that we always return the current value as per the required semantics of ControllerSource */
				currentValue = newValue
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
