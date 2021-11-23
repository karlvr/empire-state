/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useMemo, useRef, useState } from 'react'
import { controllerWithFuncs, Controller, Snapshot, ChangeListener, DEFAULT_CHANGE_LISTENER_TAG } from 'immutable-state-controller'
import { INDEXPROPERTY, KEY, KEYABLE, PROPERTY } from 'immutable-state-controller/dist/type-utils'
import { FunctionKeys } from 'immutable-state-controller/dist/utilities'
export * from 'immutable-state-controller'

/**
 * Create a new controller with undefined initial state.
 * 
 * The controller state is mutable and WILL NOT trigger component re-render when it changes.
 * Use useSnapshot to get access to state and to re-render when state changes.
 */
export function useNewController<T = undefined>(): Controller<T | undefined>

/**
 * Create a new controller with the given initial state.
 * 
 * Like React's useState, the initial state is just an initial state. The controller's state will
 * NOT be changed if the value of the initial state changes. You should use a useEffect block to
 * update the controller's value when you need to.
 * 
 * The controller state is mutable and WILL NOT trigger component re-render when it changes.
 * Use useSnapshot to get access to state and to re-render when state changes.
 * @param initialState 
 * @returns 
 */
export function useNewController<T>(initialState: T): Controller<T>

export function useNewController<T>(initialState?: T): Controller<T | undefined> {
	const value = useRef(initialState)
	return createMemoisedController({
		value: value.current,
		change: (newValue) => {
			value.current = newValue
		},
	})
}

/**
 * Register that you're using the given controller in this component. The component will now re-render when the value
 * in the controller changes.
 * @param controller 
 * @returns 
 */
export function useController<T>(controller: Controller<T>): Controller<T> {
	const [refresh, setRefresh] = useState(0)

	/* Add and remove the change listener */
	useEffect(function() {
		const changeListener: ChangeListener<unknown> = function() {
			setRefresh(refresh + 1)
		}
		/* We add the change listener with a tag so it isn't removed by our removeAllChangeListeners */
		controller.addChangeListener(changeListener, 'useController')
		
		return function() {
			controller.removeChangeListener(changeListener)
		}
	}, [refresh, controller])

	return controller
}

/**
 * <p>Create a new Controller with the given Snapshot.</p>
 * @param snapshot 
 * @returns 
 */
export function useNewSnapshotController<T>(snapshot: Snapshot<T>): Controller<T> {
	return createMemoisedController(snapshot)
}

function createMemoisedController<T>(snapshot: Snapshot<T>): Controller<T> {
	const currentSnapshotValue = useRef(snapshot.value)
	const currentSnapshotSetValue = useRef(snapshot.change)
	currentSnapshotValue.current = snapshot.value
	currentSnapshotSetValue.current = snapshot.change

	/* We use useMemo so that the controller in the calling component doesn't change and doesn't trigger a re-render when we use it in deps in a component.
	   We rely on the useSnapshot hook to trigger re-renders. Or, if a controller is based on component state, then the component state changing
	   will trigger the re-render.
	 */
	const mainController = useMemo(
		() => {
			return controllerWithFuncs(
				() => currentSnapshotValue.current,
				function(newValue) {
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

	   We only remove the _default_ change listeners so we don't remove the change listeners
	   that are added by `useSnapshot` below, as they manage their own lifecycle using `useEffect`.
	 */
	mainController.removeAllChangeListeners(DEFAULT_CHANGE_LISTENER_TAG)
	return mainController
}

export type SnapshotHookResult<S> = [S, (newValue: S) => void]

/**
 * Returns a snapshot of the whole value in the controller.
 */
export function useSnapshot<T>(controller: Controller<T>): SnapshotHookResult<T>
/**
 * Returns a snapshot of the value at the given index in the controller's value, assuming the controller contains an array value.
 */
export function useSnapshot<T, S = INDEXPROPERTY<T>>(controller: Controller<T>, index: number): SnapshotHookResult<S>
/**
 * Returns a snapshot of the whole value in the controller.
 */
// export function useSnapshot<T>(controller: Controller<T>, name: 'this'): Snapshot<T>
/**
 * Returns a snapshot of the value of the given property in the controller's value, assuming the controller contains an object value.
 */
export function useSnapshot<T, K extends KEY<T>, S = PROPERTY<T, K>>(controller: Controller<T>, name: K): SnapshotHookResult<S>
/**
 * Returns a snapshot of the value at the given index in the value of the given property in the controller's value,
 * assuming the controller contains an object value and the property value is an array value.
 */
export function useSnapshot<T, K extends KEY<T>, S = INDEXPROPERTY<PROPERTY<T, K>>>(controller: Controller<T>, name: K, index: number): SnapshotHookResult<S>
/**
 * The combination of all snapshot methods so you can call snapshot with arguments that can match some combination that
 * snapshot supports.
 */
export function useSnapshot<T, K extends KEY<T>>(controller: Controller<T>, nameOrIndex?: K | number | 'this', index?: number): SnapshotHookResult<T | PROPERTY<T, K> | INDEXPROPERTY<PROPERTY<T, K>> | INDEXPROPERTY<T>> {
	const [refresh, setRefresh] = useState(0)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const snapshotController = nameOrIndex !== undefined ? controller.get(nameOrIndex as any, index as any) : controller
	
	/* Add and remove the change listener */
	useEffect(function() {
		const changeListener: ChangeListener<unknown> = function() {
			setRefresh(refresh + 1)
		}
		/* We add the change listener with a tag so it isn't removed by our removeAllChangeListeners */
		snapshotController.addChangeListener(changeListener, 'useSnapshot')
		
		return function() {
			snapshotController.removeChangeListener(changeListener)
		}
	}, [refresh, snapshotController])

	const snapshot = snapshotController.snapshot()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return [snapshot.value, snapshot.change] as unknown as any
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
		return controllerWithFuncs(
			() => currentValue,
			newValue => {
				/* Ensure that we always return the current value as per the required semantics of ControllerSource */
				currentValue = newValue
				actualComponent.props.onChange(newValue)
			},
		)
	} else {
		const actualComponent = component as ChangeableComponentWithPropsGeneral<T>
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let currentValue = (actualComponent.props as any)[valueProperty] as T
		return controllerWithFuncs(
			() => currentValue,
			(newValue) => {
				/* Ensure that we always return the current value as per the required semantics of ControllerSource */
				currentValue = newValue
				actualComponent.props[onChangeProperty](newValue)
			},
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
		return controllerWithFuncs(
			() => currentValue,
			(newValue) => {
				/* Ensure that we always return the current value as per the required semantics of ControllerSource */
				currentValue = newValue
				component.setState(() => newValue)
			},
		)
	} else {
		let currentValue = (component.state as KEYABLE<T>)[property]
		return controllerWithFuncs(
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
