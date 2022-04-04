/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useMemo, useRef, useState } from 'react'
import { controllerWithFuncs, Controller, Snapshot, ChangeListener, DEFAULT_CHANGE_LISTENER_TAG } from 'empire-state'
import { INDEXPROPERTY, KEY, KEYABLE, PROPERTY } from 'empire-state/dist/type-utils'
import { FunctionKeys } from 'empire-state/dist/utilities'
export * from 'empire-state'

/**
 * Create a controller with undefined initial state.
 * 
 * The controller state is mutable and WILL NOT trigger component re-render when it changes.
 * Use useControllerValue to get access to state and to re-render when state changes.
 */
export function useControllerWithInitialState<T = undefined>(): Controller<T | undefined>

/**
 * Create a controller with the given initial state.
 * 
 * Like React's useState, the initial state is just an initial state. The controller's state will
 * NOT be changed if the value of the initial state changes. You should use a useEffect block to
 * update the controller's value when you need to.
 * 
 * The controller state is mutable and WILL NOT trigger component re-render when it changes.
 * Use useControllerValue to get access to state and to re-render when state changes.
 * @param initialState 
 * @returns 
 */
export function useControllerWithInitialState<T>(initialState: T): Controller<T>

export function useControllerWithInitialState<T>(initialState?: T): Controller<T | undefined> {
	const value = useRef(initialState)
	return createMemoisedController({
		value: value.current,
		change: (newValue) => {
			value.current = newValue
		},
	})
}

/**
 * Create a controller with the given value. The controller state can be changed as normal.
 * The controller state will be reset to the given value if it changes.
 * @param value 
 * @returns 
 */
export function useControllerWithValue<T>(value: T): Controller<T> {
	const ref = useRef(value)
	const [, setRefresh] = useState(0)

	const controller = createMemoisedController({
		value: ref.current,
		change: (newValue) => {
			ref.current = newValue
		},
	})

	/* Check if the `value` changes from what we previously saw, and reset the controller value if it does */
	if (value !== ref.current) {
		ref.current = value
		setRefresh(n => n + 1)
	}
	return controller
}

/**
 * Use the given controller in this component. The component will re-render when the value in the controller changes.
 * @param controller 
 * @returns 
 */
export function useController<T>(controller: Controller<T>): Controller<T>
/**
 * Use a controller for the value in the named property in the given controller. The component will re-render when the value in the controller changes.
 */
export function useController<T, K extends KEY<T>, S = PROPERTY<T, K>>(controller: Controller<T>, name: K): Controller<S>
/**
 * Use a controller for the value at an index in the named property in the given controller. The component will re-render when the value in the controller changes.
 */
export function useController<T, K extends KEY<T>, S = INDEXPROPERTY<PROPERTY<T, K>>>(controller: Controller<T>, name: K, index: number): Controller<S>
/**
 * Use a controller for the value at an index in the given controller. The component will re-render when the value in the controller changes.
 */
export function useController<T, S = INDEXPROPERTY<T>>(controller: Controller<T>, index: number): Controller<S>
/**
 * The combination of all controller value methods so you can call the hook with arguments that can match some combination that
 * is supported.
 */
export function useController<T, K extends KEY<T>>(controller: Controller<T>, nameOrIndex?: K | number | 'this', index?: number): Controller<T | PROPERTY<T, K> | INDEXPROPERTY<PROPERTY<T, K>> | INDEXPROPERTY<T>> {
	const [, setRefresh] = useState(0)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const valueController = nameOrIndex !== undefined ? controller.get(nameOrIndex as any, index as any) : controller

	/* Add and remove the change listener */
	useEffect(function() {
		const changeListener: ChangeListener<unknown> = function() {
			setRefresh(n => n + 1)
		}
		/* We add the change listener with a tag so it isn't removed by our removeAllChangeListeners */
		valueController.addChangeListener(changeListener, 'useController')
		
		return function() {
			valueController.removeChangeListener(changeListener)
		}
	}, [valueController])

	return valueController
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

	/* We use useMemo so that the controller in the calling component doesn't change and doesn't trigger a re-render when we use it in deps in a component.
	   We rely on the useControllerValue hook to trigger re-renders. Or, if a controller is based on component state, then the component state changing
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
	   that are added by `useControllerValue` below, as they manage their own lifecycle using `useEffect`.
	 */
	mainController.removeAllChangeListeners(DEFAULT_CHANGE_LISTENER_TAG)
	return mainController
}

export type ControllerValueHookResult<S> = [S, (newValue: S) => void]

/**
 * Returns the controller's value, and a function to change the value. The component will re-render when the value changes.
 */
export function useControllerValue<T>(controller: Controller<T>): ControllerValueHookResult<T>
/**
 * Returns a the value of the given property in the controller's value, assuming the controller contains an object value,
 * and a function to change that value.
 */
export function useControllerValue<T, K extends KEY<T>, S = PROPERTY<T, K>>(controller: Controller<T>, name: K): ControllerValueHookResult<S>
/**
 * Returns the value at the given index in the value of the given property in the controller's value,
 * assuming the controller contains an object value and the property value is an array value,
 * and a function to change that value.
 */
export function useControllerValue<T, K extends KEY<T>, S = INDEXPROPERTY<PROPERTY<T, K>>>(controller: Controller<T>, name: K, index: number): ControllerValueHookResult<S>
/**
 * Returns the value at the given index in the controller's value, assuming the controller contains an array value,
 * and a function to change that value.
 */
export function useControllerValue<T, S = INDEXPROPERTY<T>>(controller: Controller<T>, index: number): ControllerValueHookResult<S>
/**
 * The combination of all controller value methods so you can call the hook with arguments that can match some combination that
 * is supported.
 */
export function useControllerValue<T, K extends KEY<T>>(controller: Controller<T>, nameOrIndex?: K | number | 'this', index?: number): ControllerValueHookResult<T | PROPERTY<T, K> | INDEXPROPERTY<PROPERTY<T, K>> | INDEXPROPERTY<T>> {
	const [, setRefresh] = useState(0)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const valueController = nameOrIndex !== undefined ? controller.get(nameOrIndex as any, index as any) : controller
	
	/* Add and remove the change listener */
	useEffect(function() {
		const changeListener: ChangeListener<unknown> = function() {
			setRefresh(n => n + 1)
		}
		/* We add the change listener with a tag so it isn't removed by our removeAllChangeListeners */
		valueController.addChangeListener(changeListener, 'useControllerValue')
		
		return function() {
			valueController.removeChangeListener(changeListener)
		}
	}, [valueController])

	const snapshot = valueController.snapshot()
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
