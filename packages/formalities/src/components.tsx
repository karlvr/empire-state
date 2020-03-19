/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { KEYORTHIS, COMPATIBLEKEYS, KEY, PROPERTYORTHIS, INDEXPROPERTY } from 'immutable-state-controller/dist/type-utils' // TODO change to an "spi" export
import { Controller, Snapshot } from 'immutable-state-controller'
import { Subtract } from 'immutable-state-controller/dist/utilities'

/** The component props containing the controller and property to choose. */
interface ControllerProps<T, K extends KEYORTHIS<T>> {
	controller: Controller<T>
	prop: K
}

/** The component props containing the controller and property to choose, but only properties that are compatible with S */
type CompatibleControllerProps<T, S> = ControllerProps<T, COMPATIBLEKEYS<T, S>>

type HTMLInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>

interface BaseInputFunctionalityProps {
	updateOnBlur?: boolean
}

interface BaseInputProps<S> extends HTMLInputProps, Snapshot<S>, BaseInputFunctionalityProps {
	convert: (value: string) => S
	display: (value: S) => string
}

function BaseInput<S>(props: BaseInputProps<S>) {
	const { value, setValue, display, convert, updateOnBlur, ...rest } = props
	const displayValue = display(value)

	function onChange(evt: React.ChangeEvent<HTMLInputElement>) {
		setValue(convert(evt.target.value))
	}

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
	const { value, setValue, display, convert, updateOnBlur, ...rest } = props
	const displayValue = display(props.value)

	function onChange(evt: React.ChangeEvent<HTMLTextAreaElement>) {
		setValue(convert(evt.target.value))
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

interface GenericInputProps<T, K extends KEYORTHIS<T>> extends HTMLInputProps, ControllerProps<T, K>, BaseInputFunctionalityProps {
	convert: (value: string) => PROPERTYORTHIS<T, K>
	display: (value: PROPERTYORTHIS<T, K>) => string
}

export function Generic<T, K extends KEYORTHIS<T>>(props: GenericInputProps<T, K>) {
	const { controller, prop, convert, display, ...rest } = props
	const snapshot = (prop !== 'this' ? controller.snapshot(prop as unknown as KEY<T>) : controller.snapshot()) as unknown as Snapshot<PROPERTYORTHIS<T, K>>
	return (
		<BaseInput
			value={snapshot.value}
			setValue={snapshot.setValue}
			convert={convert}
			display={display}
			{...rest}
		/>
	)
}

type TextType = string | undefined
interface TextProps<T> extends HTMLInputProps, CompatibleControllerProps<T, TextType>, BaseInputFunctionalityProps {

}

export function Text<T>(props: TextProps<T>) {
	const { controller, prop, ...rest } = props
	const snapshot = (prop !== 'this' ? controller.snapshot(prop as unknown as KEY<T>) : controller.snapshot()) as unknown as Snapshot<TextType>

	return <BaseInput
		value={snapshot.value}
		setValue={snapshot.setValue}
		convert={value => value !== '' ? value : undefined} 
		display={value => value !== undefined ? value : ''}
		{...rest}
	/>
}

type NumberType = number | undefined
interface NumberProps<T> extends HTMLInputProps, CompatibleControllerProps<T, NumberType>, BaseInputFunctionalityProps {
	
}

export function Number<T>(props: NumberProps<T>) {
	const { controller, prop, ...rest } = props
	const snapshot = (prop !== 'this' ? controller.snapshot(prop as unknown as KEY<T>) : controller.snapshot()) as unknown as Snapshot<NumberType>

	return <BaseInput
		value={snapshot.value}
		setValue={snapshot.setValue}
		convert={value => {
			const result = parseInt(value, 10)
			if (!isNaN(result)) {
				return result
			}
			return undefined
		}} 
		display={value => {
			if (value !== undefined) {
				return `${value}`
			} else {
				return ''
			}
		}}
		{...rest}
	/>
}

interface CheckableProps<T, V> extends HTMLInputProps, CompatibleControllerProps<T, V> {
	checkedValue: V
	uncheckedValue?: V
}

export function Checkable<T, V>(props: CheckableProps<T, V>) {
	const { controller, prop, checkedValue, uncheckedValue, ...rest } = props
	const snapshot = (prop !== 'this' ? controller.snapshot(prop as unknown as KEY<T>) : controller.snapshot()) as unknown as Snapshot<V>

	function onChange(evt: React.ChangeEvent<HTMLInputElement>) {
		if (evt.target.checked) {
			snapshot.setValue(checkedValue)
		} else {
			snapshot.setValue(uncheckedValue as V)
		}
	}

	return (
		<input checked={snapshot.value === checkedValue} onChange={onChange} value={checkedValue !== undefined && checkedValue !== null ? `${checkedValue}` : ''} {...rest} />
	)
}

interface MultiCheckableProps<T, V> extends HTMLInputProps, CompatibleControllerProps<T, V[]> {
	checkedValue: V
	uncheckedValue?: V
}

export function MultiCheckable<T, V>(props: MultiCheckableProps<T, V>) {
	const { controller, prop, checkedValue, uncheckedValue, ...rest } = props
	const snapshot = (prop !== 'this' ? controller.snapshot(prop as unknown as KEY<T>) : controller.snapshot()) as unknown as Snapshot<V[]>
	const value = snapshot.value
	const checked = value ? value.indexOf(checkedValue) !== -1 : false

	function onChange(evt: React.ChangeEvent<HTMLInputElement>) {
		const existing = value || []
		const index = existing.indexOf(checkedValue)
		if (evt.target.checked) {
			if (index === -1) {
				const newValue = [...existing, checkedValue]
				snapshot.setValue(newValue)
			}
		} else {
			if (index !== -1) {
				const newValue = [...existing]
				newValue.splice(index, 1)
				snapshot.setValue(newValue)
			}
		}
	}

	return (
		<input checked={checked} onChange={onChange} value={checkedValue !== undefined && checkedValue !== null ? `${checkedValue}` : ''} {...rest} />
	)
}

interface TextAreaProps<T> extends HTMLTextAreaProps, CompatibleControllerProps<T, TextType>, BaseTextAreaFunctionalityProps {

}

export function TextArea<T>(props: TextAreaProps<T>) {
	const { controller, prop, ...rest } = props
	const snapshot = (prop !== 'this' ? controller.snapshot(prop as unknown as KEY<T>) : controller.snapshot()) as unknown as Snapshot<TextType>

	return (
		<BaseTextArea
			value={snapshot.value}
			setValue={snapshot.setValue}
			convert={value => value !== '' ? value : undefined}
			display={value => value !== undefined ? value : ''}
			{...rest}
		/>
	)
}

type HTMLSelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange' | 'multiple'>

export type OptionType<C> = C | OptionTypeObject<C>

export interface OptionTypeObject<C> {
	/** The label for this option */
	label?: string

	/** The text to show for this option */
	text?: string

	/** The value of this option in your model */
	value: C | undefined
}

function isOptionTypeObject<C>(o: OptionType<C>): o is OptionTypeObject<C> {
	return !isPrimitiveOptionType(o)
}

function isPrimitiveOptionType<C>(o: OptionType<C>): o is C {
	return typeof o !== 'object' 
}

interface SelectProps<T, K extends KEYORTHIS<T>, S extends PROPERTYORTHIS<T, K>, O extends OptionType<S>> extends HTMLSelectProps, ControllerProps<T, K> {
	options?: O[]
}

export function Select<T, K extends KEYORTHIS<T>, S extends PROPERTYORTHIS<T, K>, O extends OptionType<S>>(props: SelectProps<T, K, S, O>) {
	const { controller, prop, options, ...rest } = props
	const snapshot = (prop !== 'this' ? controller.snapshot(prop as unknown as KEY<T>) : controller.snapshot()) as unknown as Snapshot<S>

	const value = snapshot.value
	const selectedIndex = options ? options.findIndex(o => isOptionTypeObject(o) ? o.value === value : isPrimitiveOptionType(o) ? o === value as any : false) : -1

	function onChange(evt: React.ChangeEvent<HTMLSelectElement>) {
		const selectedIndex = evt.target.selectedIndex

		/* Convert the selected index to an option index (in our this.props.options), in case the select's options aren't what we expected */
		const selectedItem = selectedIndex !== -1 ? evt.target.options.item(selectedIndex) : null
		const selectedOptionIndex = selectedItem ? parseInt(selectedItem.value, 10) : -1

		let newValue: S | undefined = undefined
		if (selectedOptionIndex !== -1 && options) {
			const selectedOption = options[selectedOptionIndex]
			if (isOptionTypeObject(selectedOption)) {
				newValue = (selectedOption as OptionTypeObject<S>).value
			} else if (isPrimitiveOptionType(selectedOption)) {
				newValue = selectedOption as any
			} else {
				console.error('Select has unexpected option type')
			}
		}

		snapshot.setValue(newValue as any)
	}
	return (
		<select onChange={onChange} value={selectedIndex !== undefined ? selectedIndex : ''} {...rest}>
			{(options || []).map((item, index) => {
				if (isOptionTypeObject(item)) {
					return (
						<option key={index} value={index} label={item.label}>{item.text || item.value}</option>
					)
				} else if (isPrimitiveOptionType(item)) {
					return (
						<option key={index} value={index}>{item !== undefined ? `${item}` : ''}</option>
					)
				} else {
					throw new Error('Illegal state')
				}
			})}
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
export type IndexedOnRemove<V> = (index: number) => void

export interface IndexedActions<V> {
	onPush: IndexedOnPush<V>
	onInsert: IndexedOnInsert<V>
	onRemove: IndexedOnRemove<V>
}

interface IndexedProps<T, K extends KEYORTHIS<T>> extends ControllerProps<T, K> {
	/* Optional so that autocomplete works for the prop field */
	renderEach?: (
		controller: Controller<INDEXPROPERTY<PROPERTYORTHIS<T, K>>>,
		cursor: IndexedCursor, 
		actions: IndexedActions<INDEXPROPERTY<PROPERTYORTHIS<T, K>>>,
	) => JSX.Element | null
	renderBefore?: (
		actions: IndexedActions<INDEXPROPERTY<PROPERTYORTHIS<T, K>>>,
	) => JSX.Element | null
	renderAfter?: (
		actions: IndexedActions<INDEXPROPERTY<PROPERTYORTHIS<T, K>>>,
	) => JSX.Element | null
}

export function Indexed<T, K extends COMPATIBLEKEYS<T, any[] | undefined>>(props: IndexedProps<T, K>) {
	const { controller, prop, renderEach, renderBefore, renderAfter } = props
	const actualController = prop !== 'this' ? controller.controller(prop as KEY<T>) : controller
	const snapshot = actualController.snapshot() as any as Snapshot<any[] | undefined>
	const arrayValue = snapshot.value || []

	const actions: IndexedActions<INDEXPROPERTY<PROPERTYORTHIS<T, K>>> = {
		onPush: (value: INDEXPROPERTY<PROPERTYORTHIS<T, K>>) => {
			snapshot.setValue([...arrayValue, value])
		},
		onInsert: (index: number, value: INDEXPROPERTY<PROPERTYORTHIS<T, K>>) => {
			const newArrayValue = [...arrayValue]
			newArrayValue.splice(index, 0, value)
			snapshot.setValue(newArrayValue)
		},
		onRemove: (index: number) => {
			const newArrayValue = [...arrayValue]
			newArrayValue.splice(index, 1)
			snapshot.setValue(newArrayValue)
		},
	}

	return (
		<>
			{renderBefore ? renderBefore(actions) : null}
			{renderEach ? arrayValue.map((v, i) => {
				const indexController = actualController.controller(i)
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
			{renderAfter ? renderAfter(actions) : null}
		</>
	)
}

/**
 * Wrap a component function that takes a snapshot so that it instead accepts a controller and prop.
 * @param component A component function that takes a Snapshot
 */
export function wrapComponent<V, P extends Snapshot<V>>(component: React.FC<Snapshot<V> & P>) {
	return <T, K extends COMPATIBLEKEYS<T, V>>(props: Subtract<P, Snapshot<V>> & ControllerProps<T, K>) => {
		const { controller, prop, ...rest } = props
		// const snapshot = takeSnapshot(controller, prop) as Snapshot<V>
		const snapshot = (prop !== 'this' ? controller.snapshot(prop as unknown as KEY<T>) : controller.snapshot()) as unknown as Snapshot<V>

		const componentProps = {
			...snapshot,
			...rest,
		}
		return component(componentProps as unknown as P)
	}
}

export const Input = {
	Text,
	Number,
	Generic,
	Checkable,
	MultiCheckable,
	TextArea,
	Select,
	Indexed,
}
