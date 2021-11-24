/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback } from 'react'
import { KEYORTHIS, COMPATIBLEKEYS, KEY, PROPERTYORTHIS, INDEXPROPERTY } from 'empire-state/dist/type-utils' // TODO change to an "spi" export
import { Subtract } from 'empire-state/dist/utilities'
import equal from 'fast-deep-equal'
import { Controller, Snapshot, useSnapshot, SnapshotHookResult } from 'empire-state-react'

/** A ControllerProperty represents a controller property using a Controller and the name of a property it controls. */
export interface ControllerProperty<T, K extends KEYORTHIS<T>> {
	controller: Controller<T>
	prop?: K
}

export type AnyControllerProperty<T> = ControllerProperty<T, KEYORTHIS<T>>

/** A ControllerPropertyOfType allows a controller of T and any property it controls that is compatible with the given type S */
export type ControllerPropertyOfType<T, S> = ControllerProperty<T, COMPATIBLEKEYS<T, S>>

type HTMLInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>

interface BaseInputFunctionalityProps {
	updateOnBlur?: boolean
}

interface BaseInputProps<S> extends HTMLInputProps, Snapshot<S>, BaseInputFunctionalityProps {
	convert: (value: string) => S
	display: (value: S) => string
}

function BaseInput<S>(props: BaseInputProps<S>) {
	const { value, change, display, convert, updateOnBlur, ...rest } = props
	const displayValue = display(value)

	const onChange = useCallback(function(evt: React.ChangeEvent<HTMLInputElement>) {
		change(convert(evt.target.value))
	}, [change, convert])

	if (updateOnBlur) {
		return (
			<input defaultValue={displayValue} onBlur={onChange} {...rest} />
		)
	} else {
		return (
			<input value={displayValue} onChange={onChange} {...rest} />
		)
	}
}

type HTMLTextAreaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>

interface BaseTextAreaFunctionalityProps {
	updateOnBlur?: boolean
}

interface BaseTextAreaProps<S> extends HTMLTextAreaProps, Snapshot<S>, BaseTextAreaFunctionalityProps {
	convert: (value: string) => S
	display: (value: S) => string
}

function BaseTextArea<S>(props: BaseTextAreaProps<S>) {
	const { value, change, display, convert, updateOnBlur, ...rest } = props
	const displayValue = display(props.value)

	function onChange(evt: React.ChangeEvent<HTMLTextAreaElement>) {
		change(convert(evt.target.value))
	}

	if (updateOnBlur) {
		return (
			<textarea defaultValue={displayValue} onBlur={onChange} {...rest} />
		)
	} else {
		return (
			<textarea value={displayValue} onChange={onChange} {...rest} />
		)
	}
}

interface GenericInputProps<T, K extends KEYORTHIS<T>> extends HTMLInputProps, ControllerProperty<T, K>, BaseInputFunctionalityProps {
	convert: (value: string) => PROPERTYORTHIS<T, K>
	display: (value: PROPERTYORTHIS<T, K>) => string
}

export function Generic<T, K extends KEYORTHIS<T>>(props: GenericInputProps<T, K>) {
	const { controller, prop, convert, display, ...rest } = props
	const [value, changeValue] = useSnapshot(controller, prop as unknown as KEY<T>) as SnapshotHookResult<PROPERTYORTHIS<T, K>>
	return (
		<BaseInput
			value={value}
			change={changeValue}
			convert={convert}
			display={display}
			{...rest}
		/>
	)
}

type TextType = string | undefined | null
interface TextProps<T> extends HTMLInputProps, ControllerPropertyOfType<T, TextType>, BaseInputFunctionalityProps {

}

export function Text<T>(props: TextProps<T>) {
	const { controller, prop, ...rest } = props
	const [value, changeValue] = useSnapshot(controller, prop as unknown as KEY<T>) as SnapshotHookResult<TextType>

	return <BaseInput
		value={value}
		change={changeValue}
		convert={value => value !== '' ? value : undefined} 
		display={value => value !== undefined && value !== null ? value : ''}
		{...rest}
	/>
}

type NumberType = number | undefined | null
interface NumberProps<T> extends HTMLInputProps, ControllerPropertyOfType<T, NumberType>, BaseInputFunctionalityProps {
	
}

export function Number<T>(props: NumberProps<T>) {
	const { controller, prop, ...rest } = props
	const [value, changeValue] = useSnapshot(controller, prop as unknown as KEY<T>) as SnapshotHookResult<NumberType>

	return <BaseInput
		value={value}
		change={changeValue}
		convert={value => {
			const result = parseInt(value, 10)
			if (!isNaN(result)) {
				return result
			}
			return undefined
		}} 
		display={value => {
			if (value !== undefined && value !== null) {
				return `${value}`
			} else {
				return ''
			}
		}}
		{...rest}
	/>
}

interface CheckableProps<T, V> extends HTMLInputProps, ControllerPropertyOfType<T, V | undefined | null> {
	checkedValue: V
	uncheckedValue?: V
}

export function Checkable<T, V>(props: CheckableProps<T, V>) {
	const { controller, prop, checkedValue, uncheckedValue, ...rest } = props
	const [value, changeValue] = useSnapshot(controller, prop as unknown as KEY<T>) as SnapshotHookResult<V>

	const onChange = useCallback(function(evt: React.ChangeEvent<HTMLInputElement>) {
		if (evt.target.checked) {
			changeValue(checkedValue)
		} else {
			changeValue(uncheckedValue as V)
		}
	}, [changeValue, checkedValue, uncheckedValue])

	return (
		<input checked={equal(value, checkedValue)} onChange={onChange} value={checkedValue !== undefined && checkedValue !== null ? `${checkedValue}` : ''} {...rest} />
	)
}

interface MultiCheckableProps<T, V> extends HTMLInputProps, ControllerPropertyOfType<T, V[]> {
	checkedValue: V
	uncheckedValue?: V
}

/**
 * indexOf implementation using the custom `equal` function
 * @param haystack 
 * @param needle 
 */
function myIndexOf<T>(haystack: T[], needle: T): number {
	for (let i = 0; i < haystack.length; i++) {
		if (equal(needle, haystack[i])) {
			return i
		}
	}
	return -1
}

export function MultiCheckable<T, V>(props: MultiCheckableProps<T, V>) {
	const { controller, prop, checkedValue, uncheckedValue, ...rest } = props
	const [value, changeValue] = useSnapshot(controller, prop as unknown as KEY<T>) as SnapshotHookResult<V[]>
	const checked = value ? myIndexOf(value, checkedValue) !== -1 : false

	const onChange = useCallback(function(evt: React.ChangeEvent<HTMLInputElement>) {
		const existing = value || []
		const index = myIndexOf(existing, checkedValue)
		if (evt.target.checked) {
			if (index === -1) {
				const newValue = [...existing, checkedValue]
				changeValue(newValue)
			}
		} else {
			if (index !== -1) {
				const newValue = [...existing]
				newValue.splice(index, 1)
				changeValue(newValue)
			}
		}
	}, [changeValue, checkedValue, value])

	return (
		<input checked={checked} onChange={onChange} value={checkedValue !== undefined && checkedValue !== null ? `${checkedValue}` : ''} {...rest} />
	)
}

interface TextAreaProps<T> extends HTMLTextAreaProps, ControllerPropertyOfType<T, TextType>, BaseTextAreaFunctionalityProps {

}

export function TextArea<T>(props: TextAreaProps<T>) {
	const { controller, prop, ...rest } = props
	const [value, changeValue] = useSnapshot(controller, prop as unknown as KEY<T>) as SnapshotHookResult<TextType>

	return (
		<BaseTextArea
			value={value}
			change={changeValue}
			convert={value => value !== '' ? value : undefined}
			display={value => value !== undefined && value !== null ? value : ''}
			{...rest}
		/>
	)
}

type HTMLSelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange' | 'multiple'>

export interface OptionTypeObject<C> {
	/** The label for this option */
	label?: string

	/** The text to show for this option */
	text?: string

	/** The value of this option in your model */
	value: C | undefined
}

function isOptionTypeObject<C>(o: C | OptionTypeObject<C>, props: SelectProps<any, any>): o is OptionTypeObject<C> {
	return (props as any).display === undefined
}

function isOptionTypeObjects<C>(o: OptionTypeObject<C>[] | C[], props: SelectProps<any, any>): o is OptionTypeObject<C>[] {
	return (props as any).display === undefined
}

interface SelectProps1<T, K extends KEYORTHIS<T>> extends HTMLSelectProps, ControllerProperty<T, K> {
	options?: OptionTypeObject<PROPERTYORTHIS<T, K>>[]
	display?: undefined
}

interface SelectProps2<T, K extends KEYORTHIS<T>> extends HTMLSelectProps, ControllerProperty<T, K> {
	options?: PROPERTYORTHIS<T, K>[]
	display: (value: PROPERTYORTHIS<T, K>) => string
}

type SelectProps<T, K extends KEYORTHIS<T>> = SelectProps1<T, K> | SelectProps2<T, K>

export function Select<T, K extends KEYORTHIS<T>>(props: SelectProps<T, K>) {
	const { controller, prop, options, display, ...rest } = props
	const [value, changeValue] = useSnapshot(controller, prop as unknown as KEY<T>) as SnapshotHookResult<PROPERTYORTHIS<T, K>>

	const selectedIndex = options ? 
		isOptionTypeObjects(options, props)
			? options.findIndex(o => equal(o.value, value))
			: options.findIndex(o => equal(o, value))
		: undefined

	const onChange = useCallback(function(evt: React.ChangeEvent<HTMLSelectElement>) {
		const selectedIndex = evt.target.selectedIndex

		/* Convert the selected index to an option index (in our this.props.options), in case the select's options aren't what we expected */
		const selectedItem = selectedIndex !== -1 ? evt.target.options.item(selectedIndex) : null
		const selectedOptionIndex = selectedItem ? parseInt(selectedItem.value, 10) : -1

		let newValue: PROPERTYORTHIS<T, K> | undefined = undefined
		if (selectedOptionIndex !== -1 && options) {
			const selectedOption = options[selectedOptionIndex]
			if (isOptionTypeObject(selectedOption, props)) {
				newValue = (selectedOption as OptionTypeObject<PROPERTYORTHIS<T, K>>).value
			} else {
				newValue = selectedOption
			}
		}

		changeValue(newValue as any)
	}, [changeValue, options, props])
	return (
		<select onChange={onChange} value={selectedIndex !== undefined ? selectedIndex : ''} {...rest}>
			{options ?
				isOptionTypeObjects(options, props)
					? options.map((item, index) => (
						<option key={index} value={index} label={item.label}>{item.text || item.value}</option>
					))
					: options.map((item, index) => (
						<option key={index} value={index}>{props.display!(item)}</option>
					))
				: null
			}
		</select>
	)
}

export interface IndexedCursor {
	index: number
	first: boolean
	last: boolean
}

export type IndexedOnPush<V> = (value: V) => void
export type IndexedOnInsert<V> = (index: number, value: V) => void
export type IndexedOnRemove = (index: number) => void

export interface IndexedActions<V> {
	onPush: IndexedOnPush<V>
	onInsert: IndexedOnInsert<V>
	onRemove: IndexedOnRemove
}

interface IndexedProps<T, K extends KEYORTHIS<T>> extends ControllerProperty<T, K> {
	/* Optional so that autocomplete works for the prop field */
	renderEach?: (
		controller: Controller<INDEXPROPERTY<PROPERTYORTHIS<T, K>>>,
		cursor: IndexedCursor, 
		actions: IndexedActions<INDEXPROPERTY<PROPERTYORTHIS<T, K>>>,
	) => JSX.Element | null
	RenderEach?: (props: {
		controller: Controller<INDEXPROPERTY<PROPERTYORTHIS<T, K>>>
		cursor: IndexedCursor 
		actions: IndexedActions<INDEXPROPERTY<PROPERTYORTHIS<T, K>>>
	}) => JSX.Element | null
	renderBefore?: (
		actions: IndexedActions<INDEXPROPERTY<PROPERTYORTHIS<T, K>>>,
	) => JSX.Element | null
	RenderBefore?: (props: {
		actions: IndexedActions<INDEXPROPERTY<PROPERTYORTHIS<T, K>>>
	}) => JSX.Element | null
	renderAfter?: (
		actions: IndexedActions<INDEXPROPERTY<PROPERTYORTHIS<T, K>>>,
	) => JSX.Element | null
	RenderAfter?: (props: {
		actions: IndexedActions<INDEXPROPERTY<PROPERTYORTHIS<T, K>>>
	}) => JSX.Element | null
}

export function Indexed<T, K extends COMPATIBLEKEYS<T, any[] | undefined>>(props: IndexedProps<T, K>) {
	const { controller, prop, renderEach, renderBefore, renderAfter, RenderEach, RenderBefore, RenderAfter } = props
	const actualController = prop !== 'this' ? controller.get(prop as KEY<T>) : controller
	const [value, changeValue] = useSnapshot(controller, prop as unknown as KEY<T>) as SnapshotHookResult<any[] | undefined>
	const arrayValue = value || []

	const actions: IndexedActions<INDEXPROPERTY<PROPERTYORTHIS<T, K>>> = {
		onPush: (value: INDEXPROPERTY<PROPERTYORTHIS<T, K>>) => {
			changeValue([...arrayValue, value])
		},
		onInsert: (index: number, value: INDEXPROPERTY<PROPERTYORTHIS<T, K>>) => {
			const newArrayValue = [...arrayValue]
			newArrayValue.splice(index, 0, value)
			changeValue(newArrayValue)
		},
		onRemove: (index: number) => {
			const newArrayValue = [...arrayValue]
			newArrayValue.splice(index, 1)
			changeValue(newArrayValue)
		},
	}

	return (
		<>
			{renderBefore ? renderBefore(actions) : null}
			{RenderBefore ? <RenderBefore actions={actions} /> : null}
			{renderEach ? arrayValue.map((v, i) => {
				const indexController = actualController.get(i)
				const cursor: IndexedCursor = {
					index: i,
					first: i === 0,
					last: i === arrayValue.length - 1,
				}
				return renderEach(
					indexController as Controller<any>,
					cursor,
					actions,
				)
			}) : null}
			{RenderEach ? arrayValue.map((v, i) => {
				const indexController = actualController.get(i)
				const cursor: IndexedCursor = {
					index: i,
					first: i === 0,
					last: i === arrayValue.length - 1,
				}
				return <RenderEach
					key={i}
					controller={indexController as Controller<any>}
					cursor={cursor}
					actions={actions}
				/>
			}) : null}
			{renderAfter ? renderAfter(actions) : null}
			{RenderAfter ? <RenderAfter actions={actions} /> : null}
		</>
	)
}

/**
 * Wrap a component function that takes a snapshot so that it instead accepts a controller and prop.
 * @param component A component function that takes a Snapshot
 */
export function wrapComponent<V, P extends Snapshot<V>>(component: React.FC<Snapshot<V> & P>) {
	return <T, K extends COMPATIBLEKEYS<T, V>>(props: Subtract<P, Snapshot<V>> & ControllerProperty<T, K>) => {
		const { controller, prop, ...rest } = props
		// const snapshot = takeSnapshot(controller, prop) as Snapshot<V>
		const [value, change] = useSnapshot(controller, prop as unknown as KEY<T>) as SnapshotHookResult<V>

		const componentProps = {
			value,
			change,
			...rest,
		}
		return component(componentProps as unknown as P)
	}
}

export const Formalities = {
	Text,
	Number,
	Generic,
	Checkable,
	MultiCheckable,
	TextArea,
	Select,
	Indexed,
}
