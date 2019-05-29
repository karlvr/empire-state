import * as React from 'react'
import { Snapshot, Controller, withMutable } from './changeling'
import { Omit, Subtract, CompatibleKeys } from './utilities';
import { KEY, KEYABLE, ANDTHIS, PROPERTYORTHIS, KEYORTHIS, INDEXPROPERTY } from './types';

/**
 * Fake interface for React.InputHTMLAttributes<HTMLInputElement> that defines all of the properties that we exclude using Omit etc.
 * Because if we use React.InputHTMLAttributes<HTMLInputElement> TypeScript includes all of the known properties in the output declaration
 * file as it collapses the successive Omit types that we apply. This causes a problem when a consuming project uses an older version of React.
 * 
 * So we use a script (`fix-types.js`) to look for the sentinel properties, and then to see which of the expected containing properties
 * are missing, and to reconstruct the appropriate type signature.
 * 
 * If any exclusions are added in this class they must be added here.
 */
interface XYZZY1 {
	xyzzy1?: string
	value?: any
	checked?: any
	defaultValue?: any
	onChange?: any
	onBlur?: any
	yzzyx1?: string
}

interface XYZZY2 {
	xyzzy2?: string
	value?: any
	onChange?: any
	yzzyx2?: string
}

export function wrapComponent<R, P extends Snapshot<R>>(Component: React.ComponentType<Snapshot<R> & P>) {
	return <T, K extends CompatibleKeys<KEYABLE<ANDTHIS<T>>, R>>(props: Subtract<P, Snapshot<R>> & { controller: Controller<T>, prop: K }) => {
		const { controller, prop, ...rest } = props
		const c = prop !== 'this' ? (controller as any as Controller<T>).snapshot(prop as KEY<T>) : controller.snapshot()
		return (
			<Component value={c.value} onChange={c.onChange} {...rest as any} />
		)
	}
}

interface WrapComponentConvertType<T, K extends KEY<T> | 'this', R> {
	controller: Controller<T>
	prop: K
	convert: (value: R) => PROPERTYORTHIS<T, K>
	display?: (value: PROPERTYORTHIS<T, K> | undefined) => R
}

function wrapComponentConvert<R, P extends Snapshot<R>>(Component: React.ComponentType<Snapshot<R> & P>) {
	return <T, K extends KEY<T> | 'this'>(props: Subtract<P, Snapshot<R>> & WrapComponentConvertType<T, K, R>) => {
		const { controller, prop, convert, display, ...rest } = props
		const c = prop !== 'this' ? (controller as any as Controller<T>).snapshot(prop as KEY<T>) : controller.snapshot()
		return (
			<Component value={display ? display(c.value as any) : c.value} onChange={(value) => { c.onChange(convert(value) as any) }} {...rest as any} />
		)
	}
}

/**
 * Convert a component that accepts values of type R to a component that accepts values of type S.
 * @param Component A component that accepts a Snapshot<R>
 * @param convert A function to convert from R to S
 * @param display A function to convert from S to R
 */
export function convertComponent<R, S, P extends Snapshot<R>>(Component: React.ComponentType<Snapshot<R> & P>, 
		convert: (value: R) => S, 
		display?: (value: S | undefined) => R
	) {
	return (props: Subtract<P, Snapshot<R>> & Snapshot<S>) => {
		const { value, onChange, ...rest } = props
		return (
			<Component value={display ? display(value as any) : value} onChange={(value) => { onChange(convert(value) as any) }} {...rest as any} />
		)
	}
}

interface BaseInputProps<T> extends Omit<XYZZY1, 'value' | 'onChange'>, Snapshot<T> {
	convert?: (value: string) => T
}

class BaseInput<T> extends React.Component<BaseInputProps<T>> {

	public render() {
		const { value, onChange, convert, ...rest } = this.props
		return (
			<input value={value !== undefined && value !== null ? `${value}` : ''} onChange={this.onChange} {...rest} />
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onChange(this.convertValue(evt.target.value))
	}

	private convertValue = (value: string): T => {
		if (this.props.convert) {
			return this.props.convert(value) as T
		} else {
			return value as any
		}
	}

}

class StringInput extends React.Component<Omit<BaseInputProps<string>, 'convert'>> {

	public render() {
		const { ...rest } = this.props
		return (
			<BaseInput {...rest} />
		)
	}

}

const NumberInput = convertComponent(
	StringInput, 
	(value) => parseInt(value), 
	(value) => value !== undefined ? `${value}` : '',
)

interface CheckableInputProps<T> extends Omit<XYZZY1, 'checked' | 'onChange' | 'value'>, Snapshot<T> {
	checkedValue: T
	uncheckedValue?: T
}

class CheckableInput<T> extends React.Component<CheckableInputProps<T>> {

	public render() {
		const { value, checkedValue, uncheckedValue, onChange, ...rest } = this.props
		return (
			<input checked={value === checkedValue as any} onChange={this.onChange} value={checkedValue !== undefined && checkedValue !== null ? `${checkedValue}` : ''} {...rest} />
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		if (evt.target.checked) {
			this.props.onChange(this.props.checkedValue)
		} else {
			this.props.onChange(this.props.uncheckedValue as any)
		}
	}

}

interface LazyBaseInputProps<T> extends Omit<XYZZY1, 'value' | 'onChange' | 'defaultValue' | 'onBlur' | 'convert' | 'display'>, Snapshot<T> {
	convert?: (value: string) => T | undefined
	display?: (value: T | undefined) => string
}

class LazyBaseInput<T> extends React.Component<LazyBaseInputProps<T>> {

	public render() {
		const { value, onChange, ...rest } = this.props

		const displayValue = this.displayValue(value)
		return (
			<input key={displayValue} defaultValue={displayValue} onBlur={this.onBlur} {...rest} />
		)
	}

	private onBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
		const { onChange } = this.props

		const value = this.convertValue(evt.target.value)
		if (value !== undefined) {
			onChange(value)
		} else if (evt.target.value === '') {
			onChange(undefined as any as T)
		} else {
			evt.target.value = this.displayValue(this.props.value)
			evt.target.select()
		}
	}

	private displayValue = (value: T): string => {
		if (this.props.display) {
			return this.props.display(value)
		}

		if (value !== undefined && value !== null) {
			return `${value}`
		} else {
			return ''
		}
	}

	private convertValue = (value: string): T | undefined => {
		if (this.props.convert) {
			return this.props.convert(value)
		} else {
			return value as any
		}
	}

}

class LazyStringInput extends React.Component<Omit<LazyBaseInputProps<string>, 'convert' | 'display'>> {

	public render() {
		const { ...rest } = this.props
		return (
			<LazyBaseInput {...rest} />
		)
	}

}

const LazyNumberInput = convertComponent(
	LazyStringInput, 
	(value) => parseInt(value), 
	(value) => value !== undefined ? `${value}` : '',
)

interface BaseTextAreaProps<T> extends Omit<XYZZY2, 'value' | 'onChange'>, Snapshot<T> {
	convert?: (value: string) => T
}

class BaseTextArea<T> extends React.Component<BaseTextAreaProps<T>> {

	public render() {
		const { value, onChange, convert, ...rest } = this.props
		return (
			<textarea value={value !== undefined && value !== null ? `${value}` : ''} onChange={this.onChange} {...rest} />
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.props.onChange(this.convertValue(evt.target.value))
	}

	private convertValue = (value: string): T => {
		if (this.props.convert) {
			return this.props.convert(value)
		} else {
			return value as any
		}
	}

}

class StringTextArea extends React.Component<Omit<BaseTextAreaProps<string>, 'convert'>> {

	public render() {
		const { ...rest } = this.props
		return (
			<BaseTextArea {...rest} />
		)
	}

}

export type OptionType<C> = string | number | OptionTypeObject<C>

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

function isPrimitiveOptionType<C>(o: OptionType<C>): o is string | number {
	return typeof o === 'string' || typeof o === 'number'
}

interface SelectProps<T, O extends OptionType<T>> extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value' | 'multiple'>, Snapshot<T> {
	options?: O[]
}

class Select<T, O extends OptionType<T>> extends React.Component<SelectProps<T, O>> {

	public render() {
		const { value, onChange, options, ...rest } = this.props
		/* We don't use option values, we just use their indexes, so we don't have to convert things to strings */
		const selectedIndex = options ? options.findIndex(o => isOptionTypeObject(o) ? o.value === value : isPrimitiveOptionType(o) ? o === value as any : false) : -1

		return (
			<select onChange={this.onChange} value={selectedIndex !== undefined ? selectedIndex : ''} {...rest}>
				{(options || []).map((item, index) => {
					if (isOptionTypeObject(item)) {
						return (
							<option key={index} value={index} label={item.label}>{item.text || item.value}</option>
						)
					} else if (isPrimitiveOptionType(item)) {
						return (
							<option key={index} value={index}>{item}</option>
						)
					}
				})}
			</select>
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedIndex = evt.target.selectedIndex

		/* Convert the selected index to an option index (in our this.props.options), in case the select's options aren't what we expected */
		const selectedItem = selectedIndex !== -1 ? evt.target.options.item(selectedIndex) : null
		const selectedOptionIndex = selectedItem ? parseInt(selectedItem.value, 10) : -1

		let newValue: T | undefined = undefined
		if (selectedOptionIndex !== -1 && this.props.options) {
			const selectedOption = this.props.options[selectedOptionIndex]
			if (isOptionTypeObject(selectedOption)) {
				newValue = selectedOption.value
			} else if (isPrimitiveOptionType(selectedOption)) {
				newValue = selectedOption as any
			} else {
				console.error('Select has unexpected option type')
			}
		}

		this.props.onChange(newValue as any)
	}

}

interface ControllerProps<T, K extends KEYORTHIS<T>> {
	controller: Controller<T>
	prop: K
}

interface SelectWrapperProps<T, K extends KEYORTHIS<T>, O extends OptionType<PROPERTYORTHIS<T, K>>> extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value' | 'multiple'>, ControllerProps<T, K> {
	options?: O[]
}

class SelectWrapper<T, K extends KEYORTHIS<T>, O extends OptionType<PROPERTYORTHIS<T, K>>> extends React.Component<SelectWrapperProps<T, K, O>> {
	/* Had to wrap this manually as the HOC loses the type on the options, as it has to bind the Changeable generic type before it know which prop, so it gives it {} */

	public render() {
		const { controller, prop, ...rest } = this.props
		const snapshot = prop !== 'this' ? controller.snapshot(prop as KEY<T>) : controller.snapshot()
		return (
			<Select value={snapshot.value as any} onChange={snapshot.onChange as any} {...rest} />
		)
	}

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
	) => JSX.Element
	renderBefore?: (
		actions: IndexedActions<INDEXPROPERTY<PROPERTYORTHIS<T, K>>>,
	) => JSX.Element
	renderAfter?: (
		actions: IndexedActions<INDEXPROPERTY<PROPERTYORTHIS<T, K>>>,
	) => JSX.Element
}

class Indexed<T, K extends KEYORTHIS<T>> extends React.Component<IndexedProps<T, K>> {

	public render() {
		const { controller, prop, renderEach, renderBefore, renderAfter } = this.props
		const actualController = prop !== 'this' ? controller.controller(prop as KEY<T>) : controller
		const snapshot = actualController.snapshot() as any as Snapshot<Array<any>>
		let arrayValue = snapshot.value
		if (arrayValue === undefined) {
			arrayValue = []
		}
		if (arrayValue.length === undefined) {
			arrayValue = [arrayValue]
		}

		const actions: IndexedActions<INDEXPROPERTY<PROPERTYORTHIS<T, K>>> = {
			onPush: (value: INDEXPROPERTY<PROPERTYORTHIS<T, K>>) => {
				snapshot.onChange([ ...arrayValue, value])
			},
			onInsert: (index: number, value: INDEXPROPERTY<PROPERTYORTHIS<T, K>>) => {
				const newArrayValue = [ ...arrayValue ]
				newArrayValue.splice(index, 0, value)
				snapshot.onChange(newArrayValue)
			},
			onRemove: (index: number) => {
				const newArrayValue = [ ...arrayValue ]
				newArrayValue.splice(index, 1)
				snapshot.onChange(newArrayValue)
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

}

export const Input = {
	Checkable: wrapComponent(CheckableInput),
	Generic: wrapComponentConvert(StringInput),
	String: wrapComponent(StringInput),
	Number: wrapComponent(NumberInput),

	LazyGeneric: wrapComponentConvert(LazyStringInput),
	LazyString: wrapComponent(LazyStringInput),
	LazyNumber: wrapComponent(LazyNumberInput),

	TextArea: wrapComponent(StringTextArea),
	TextAreaGeneric: wrapComponentConvert(StringTextArea),

	Select: SelectWrapper,

	Indexed: Indexed,
}

/* Testing */
function test() {
	interface Test1 {
		name: string
		age: number
		works: boolean
	}

	const value: Test1 = {
		name: '',
		age: 0,
		works: false,
	}

	const c = withMutable(value)
	const jsx1 = (
		<>
			{/* this */}
			<Input.String controller={c.controller('name')} prop="this" />
			<Input.Generic controller={c} prop="this" convert={(v: string) => value} />
			<Input.LazyString controller={c.controller('name')} prop="this" />
			<Input.LazyGeneric controller={c.controller('age')} prop="this" convert={(value) => parseInt(value)} display={(value) => value !== undefined ? `${value}` : ''} />

			{/* prop */}
			<Input.LazyString controller={c} prop="name" />
			<Input.LazyGeneric controller={c} prop="age" convert={(value) => parseInt(value)} display={(value) => value !== undefined ? `${value}` : ''} />

			<Input.TextArea controller={c} prop="name" />

			<Input.Select controller={c} prop="name" options={['John' ,'Frank']} />
			
			Should break
			{/* <Input.Select controller={c} prop="name" options={[{key: 'John', value: 34}]} /> */}
			<Input.Select controller={c} prop="age" options={[{key: 34, value: 34}]} />

		</>
	)
}
