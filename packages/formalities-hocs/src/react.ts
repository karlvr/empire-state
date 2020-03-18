import { Snapshot, Controller } from 'change-controller'
import { ChangelingImpl } from 'change-controller/dist/changeling'
import { FunctionKeys } from 'change-controller/src/utilities'
import { KEY, KEYABLE, PROPERTY } from 'change-controller/src/type-utils'
import { produce } from 'immer'

/** Interface for component containing changeable props */
interface ChangeableComponentWithProps<T> {
	props: Snapshot<T>
}

interface ChangeableComponentWithPropsGeneral<T> {
	props: T
}

/** Interface for component with the changeable value in the state */
interface ChangeableComponentWithState<T> {
	setState: (func: (state: T) => any) => void
	state: T
}

/**
 * Create a Changeling for a React component's props containing a `value` and `onChange` prop like `Changeable`.
 * @param component A React component
 */
export function forComponentProps<T>(component: ChangeableComponentWithProps<T>): Controller<T>

/**
 * Create a Changeling for a named property in a React component's state. You must provide the name of the
 * property containing the value and the property containing the change handling function.
 * @param component A React component
 * @param valueProperty The name of the property containing the `value`.
 * @param onChangeProperty The name of the property containing the `onChange` function.
 */
export function forComponentProps<T, K extends KEY<T>, L extends FunctionKeys<T>>(component: ChangeableComponentWithPropsGeneral<T>, valueProperty: K, onChangeProperty: L): Controller<PROPERTY<T, K>>
export function forComponentProps<T, K extends KEY<T>, L extends FunctionKeys<T>>(component: ChangeableComponentWithPropsGeneral<T>, valueProperty?: K, onChangeProperty?: L): Controller<PROPERTY<T, K>> | Controller<T> {
	if (onChangeProperty === undefined || valueProperty === undefined) {
		return new ChangelingImpl(() => component.props as any as Snapshot<T>)
	} else {
		return new ChangelingImpl(() => ({
			onChange: (newValue: T) => ((component.props as any)[onChangeProperty] as any as (newValue: T) => void)(newValue),
			value: (component.props as any)[valueProperty] as T,
		}))
	}
}

/**
 * Create a Changeling for a React component's state.
 * @param component A React component
 */
export function forComponentState<T>(component: ChangeableComponentWithState<T>): Controller<T>

/**
 * Create a Changeling for a named property in a React component's state.
 * @param component A React component
 * @param property A property name within the component's state
 */
export function forComponentState<T, K extends KEY<T>>(component: ChangeableComponentWithState<T>, property: K): Controller<PROPERTY<T, K>>

export function forComponentState<T, K extends KEY<T>>(component: ChangeableComponentWithState<T>, property?: K): Controller<PROPERTY<T, K>> | Controller<T> {
	if (property === undefined) {
		return new ChangelingImpl(() => ({
			onChange: (newValue: T) => component.setState(() => newValue),
			value: component.state,
		}))
	} else {
		return new ChangelingImpl(() => ({
			onChange: (newValue: PROPERTY<T, K>) => component.setState(produce((draft) => {
				draft[property] = newValue
			})),
			value: (component.state as KEYABLE<T>)[property],
		}))
	}
}
