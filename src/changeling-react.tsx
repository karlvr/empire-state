import * as React from 'react'
import { Snapshot, Controller, withMutable } from './changeling'
import { Omit, Subtract } from './utilities';
import { KEY, PROPERTYORTHIS, KEYORTHIS, INDEXPROPERTY, COMPATIBLEKEYS } from './types';

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
	return <T, K extends COMPATIBLEKEYS<T, R>>(props: Subtract<P, Snapshot<R>> & { controller: Controller<T>, prop: K }) => {
		const { controller, prop, ...rest } = props
		const c = prop !== 'this' ? (controller as any as Controller<T>).snapshot(prop as any as KEY<T>) : controller.snapshot()
		return (
			<Component value={c.value} onChange={c.onChange} {...rest as any} />
		)
	}
}

interface BaseInputProps<T> extends Omit<XYZZY1, 'value' | 'onChange' | 'convert'>, Snapshot<T> {
	convert: (value: string) => T
	display: (value: T) => string
}

class BaseInput<T> extends React.Component<BaseInputProps<T>> {

	public render() {
		const { value, onChange, convert, display, ...rest } = this.props
		const displayValue = display(value)
		return (
			<input value={displayValue} onChange={this.onChange} {...rest} />
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onChange(this.convertValue(evt.target.value))
	}

	private convertValue = (value: string): T => {
		return this.props.convert(value) as T
	}

}

interface BaseInputWrapperProps<T, K extends KEYORTHIS<T>, V> extends Omit<XYZZY1, 'value' | 'onChange' | 'convert'>, ControllerProps<T, K> {
	convert: (value: string) => V
	display: (value: V) => string
}

class BaseInputWrapper<T, K extends KEYORTHIS<T>, V extends PROPERTYORTHIS<T, K>> extends React.Component<BaseInputWrapperProps<T, K, V>> {

	public render() {
		const { controller, prop, ...rest } = this.props
		const snapshot = prop !== 'this' ? controller.snapshot(prop as KEY<T>) : controller.snapshot()
		return (
			<BaseInput 
				value={snapshot.value as V} 
				onChange={snapshot.onChange as (newValue: V) => void}
				{...rest}
			/>
		)
	}

}

class StringInput extends React.Component<Omit<BaseInputProps<string | undefined>, 'convert' | 'display'>> {

	public render() {
		const { ...rest } = this.props
		return (
			<BaseInput 
				convert={value => value !== '' ? value : undefined} 
				display={value => value !== undefined ? value : ''} 
				{...rest} 
			/>
		)
	}

}

interface StringInputWrapperProps<T, K extends KEYORTHIS<T>> extends Omit<XYZZY1, 'value' | 'onChange' | 'convert'>, ControllerProps<T, K> {}

class StringInputWrapper<T, K extends COMPATIBLEKEYS<T, string | undefined>> extends React.Component<StringInputWrapperProps<T, K>> {

	public render() {
		const { controller, prop, ...rest } = this.props
		const snapshot = prop !== 'this' ? controller.snapshot(prop as any as KEY<T>) : controller.snapshot()
		return (
			<StringInput 
				value={snapshot.value as any} 
				onChange={snapshot.onChange as any}
				{...rest}
			/>
		)
	}

}

class NumberInput extends React.Component<Omit<BaseInputProps<number | undefined>, 'convert' | 'display'>> {

	public render() {
		const { ...rest } = this.props
		return (
			<BaseInput 
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
		)
	}

}

interface CheckableInputProps<T> extends Omit<XYZZY1, 'checked' | 'onChange' | 'value'>, Snapshot<T> {
	checkedValue: T
	uncheckedValue?: T
}

class CheckableInput<T> extends React.Component<CheckableInputProps<T>> {

	public render() {
		const { value, checkedValue, uncheckedValue, onChange, ...rest } = this.props
		return (
			<input checked={value === checkedValue} onChange={this.onChange} value={checkedValue !== undefined && checkedValue !== null ? `${checkedValue}` : ''} {...rest} />
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

interface CheckableInputWrapperProps<T, K extends KEYORTHIS<T>, V> extends Omit<XYZZY1, 'checked' | 'onChange' | 'value'>, ControllerProps<T, K> {
	checkedValue: V
	uncheckedValue?: V
}

class CheckableInputWrapper<T, K extends KEYORTHIS<T>, C extends PROPERTYORTHIS<T, K>> extends React.Component<CheckableInputWrapperProps<T, K, C>> {

	public render() {
		const { controller, prop, ...rest } = this.props
		const snapshot = prop !== 'this' ? controller.snapshot(prop as any as KEY<T>) : controller.snapshot()
		return (
			<CheckableInput 
				value={snapshot.value as any} 
				onChange={snapshot.onChange as any}
				{...rest}
			/>
		)
	}

}

interface MultiCheckableInputProps<T> extends Omit<XYZZY1, 'checked' | 'onChange' | 'value'>, Snapshot<T[]> {
	checkedValue: T
	uncheckedValue?: T
}

class MultiCheckableInput<T> extends React.Component<MultiCheckableInputProps<T>> {

	public render() {
		const { value, checkedValue, uncheckedValue, onChange, ...rest } = this.props
		const checked = value && value.indexOf(checkedValue) !== -1
		return (
			<input checked={checked} onChange={this.onChange} value={checkedValue !== undefined && checkedValue !== null ? `${checkedValue}` : ''} {...rest} />
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		const index = this.props.value.indexOf(this.props.checkedValue)
		if (evt.target.checked) {
			if (index === -1) {
				const newValue = [ ...this.props.value, this.props.checkedValue ]
				this.props.onChange(newValue)
			}
		} else {
			if (index !== -1) {
				const newValue = [ ...this.props.value ]
				newValue.splice(index, 1)
				this.props.onChange(newValue)
			}
		}
	}

}

interface MultiCheckableInputWrapperProps<T, K extends KEYORTHIS<T>, V> extends Omit<XYZZY1, 'checked' | 'onChange' | 'value'>, ControllerProps<T, K> {
	checkedValue: V
	uncheckedValue?: V
}

class MultiCheckableInputWrapper<T, K extends KEYORTHIS<T>, C extends INDEXPROPERTY<PROPERTYORTHIS<T, K>>> extends React.Component<MultiCheckableInputWrapperProps<T, K, C>> {

	public render() {
		const { controller, prop, ...rest } = this.props
		const snapshot = prop !== 'this' ? controller.snapshot(prop as any as KEY<T>) : controller.snapshot()
		return (
			<MultiCheckableInput 
				value={snapshot.value as any} 
				onChange={snapshot.onChange as any}
				{...rest}
			/>
		)
	}

}

interface LazyBaseInputProps<T> extends Omit<XYZZY1, 'value' | 'onChange' | 'defaultValue' | 'onBlur' | 'convert' | 'display'>, Snapshot<T> {
	convert: (value: string) => T
	display: (value: T) => string
}

class LazyBaseInput<T> extends React.Component<LazyBaseInputProps<T>> {

	public render() {
		const { value, onChange, convert, display, ...rest } = this.props
		const displayValue = display(value)
		return (
			<input key={displayValue} defaultValue={displayValue} onBlur={this.onBlur} {...rest} />
		)
	}

	private onBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
		const { onChange, convert, display } = this.props

		const value = convert(evt.target.value)
		if (value !== undefined) {
			onChange(value)
		} else if (evt.target.value === '') {
			/* The converted result was undefined, and the input was empty, so we change to undefined */
			onChange(undefined as any as T)
		} else {
			/* The converted result was undefined, but our input wasn't empty, so we assume an error and reset the value */
			evt.target.value = display(this.props.value)
			evt.target.select()
		}
	}

}

interface LazyBaseInputWrapperProps<T, K extends KEYORTHIS<T>, V> extends Omit<XYZZY1, 'value' | 'onChange' | 'defaultValue' | 'onBlur' | 'convert' | 'display'>, ControllerProps<T, K> {
	convert: (value: string) => V
	display: (value: V) => string
}

class LazyBaseInputWrapper<T, K extends KEYORTHIS<T>, V extends PROPERTYORTHIS<T, K>> extends React.Component<LazyBaseInputWrapperProps<T, K, V>> {

	public render() {
		const { controller, prop, ...rest } = this.props
		const snapshot = prop !== 'this' ? controller.snapshot(prop as KEY<T>) : controller.snapshot()
		return (
			<LazyBaseInput 
				value={snapshot.value as V} 
				onChange={snapshot.onChange as (newValue: V) => void}
				{...rest} />
		)
	}

}

class LazyStringInput extends React.Component<Omit<LazyBaseInputProps<string | undefined>, 'convert' | 'display'>> {

	public render() {
		const { ...rest } = this.props
		return (
			<LazyBaseInput convert={value => value !== '' ? value : undefined} display={value => value !== undefined ? value : ''} {...rest} />
		)
	}

}

class LazyNumberInput extends React.Component<Omit<LazyBaseInputProps<number | undefined>, 'convert' | 'display'>> {

	public render() {
		const { ...rest } = this.props
		return (
			<LazyBaseInput 
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
		)
	}

}

interface BaseTextAreaProps<T> extends Omit<XYZZY2, 'value' | 'onChange' | 'convert'>, Snapshot<T> {
	convert: (value: string) => T
	display: (value: T) => string
}

class BaseTextArea<T> extends React.Component<BaseTextAreaProps<T>> {

	public render() {
		const { value, onChange, convert, display, ...rest } = this.props
		const displayValue = display(value)
		return (
			<textarea value={displayValue} onChange={this.onChange} {...rest} />
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.props.onChange(this.props.convert(evt.target.value))
	}

}

interface BaseTextAreaWrapperProps<T, K extends KEYORTHIS<T>, V> extends Omit<XYZZY1, 'value' | 'onChange' | 'convert'>, ControllerProps<T, K> {
	convert: (value: string) => V
	display: (value: V) => string
}

class BaseTextAreaWrapper<T, K extends KEYORTHIS<T>, V extends PROPERTYORTHIS<T, K>> extends React.Component<BaseTextAreaWrapperProps<T, K, V>> {

	public render() {
		const { controller, prop, ...rest } = this.props
		const snapshot = prop !== 'this' ? controller.snapshot(prop as KEY<T>) : controller.snapshot()
		return (
			<BaseTextArea
				value={snapshot.value as V} 
				onChange={snapshot.onChange as (newValue: V) => void}
				{...rest} />
		)
	}

}

class StringTextArea extends React.Component<Omit<BaseTextAreaProps<string | undefined>, 'convert' | 'display'>> {

	public render() {
		const { ...rest } = this.props
		return (
			<BaseTextArea convert={value => value !== '' ? value : undefined} display={value => value !== undefined ? value : ''} {...rest} />
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
	Checkable: CheckableInputWrapper,
	MultiCheckable: MultiCheckableInputWrapper,

	Generic: BaseInputWrapper,
	String: wrapComponent(StringInput),
	Number: wrapComponent(NumberInput),

	LazyGeneric: LazyBaseInputWrapper,
	LazyString: wrapComponent(LazyStringInput),
	LazyNumber: wrapComponent(LazyNumberInput),

	TextArea: wrapComponent(StringTextArea),
	TextAreaGeneric: BaseTextAreaWrapper,

	Select: SelectWrapper,

	Indexed: Indexed,
}

/* Testing */
function test() {
	interface Test1 {
		name: string
		age: number
		works: boolean
		options: string[]
	}

	const value: Test1 = {
		name: '',
		age: 0,
		works: false,
		options: [],
	}

	const c = withMutable(value)
	const jsx1 = (
		<>
			{/* this */}
			<Input.String controller={c.controller('name')} prop="this" />
			<Input.Number controller={c.controller('age')} prop="this" />
			<Input.Generic controller={c} prop="this" convert={(v: string) => JSON.parse(v) as Test1} display={v => JSON.stringify(v)} />
			<Input.LazyString controller={c.controller('name')} prop="this" />
			<Input.LazyGeneric controller={c.controller('age')} prop="this" convert={(value) => parseInt(value)} display={(value) => `${value}`} />

			{/* prop */}
			<Input.LazyString controller={c} prop="name" />
			<Input.LazyNumber controller={c} prop="age" />
			<Input.LazyGeneric controller={c} prop="age" convert={(value) => parseInt(value)} display={(value) => `${value}`} />

			<Input.TextArea controller={c} prop="name" />

			<Input.Select controller={c} prop="name" options={['John' ,'Frank']} />

			<Input.Checkable controller={c} prop="age" checkedValue={42} />
			<Input.MultiCheckable controller={c} prop="options" checkedValue="Cool" />
			
			Should break
			{/* <Input.Select controller={c} prop="name" options={[{key: 'John', value: 34}]} /> */}
			<Input.Select controller={c} prop="age" options={[{key: 34, value: 34}]} />
		</>
	)

	interface Test2 {
		name?: string
		age?: number
		works?: boolean
		sub?: Test2Sub
	}

	interface Test2Sub {
		subname?: string
	}

	const value2: Test2 = {}

	const c2 = withMutable(value2)

	const c2sub = c2.controller('sub')
	
	const jsx2 = (
		<>
			{/* this */}
			<Input.String controller={c2.controller('name')} prop="this" />
			<Input.Number controller={c2.controller('age')} prop="this" />
			<Input.Generic controller={c2} prop="this" convert={(v: string) => JSON.parse(v) as Test1} display={v => JSON.stringify(v)} />
			<Input.LazyString controller={c2.controller('name')} prop="this" />
			<Input.LazyGeneric controller={c2.controller('age')} prop="this" convert={(value) => parseInt(value)} display={(value) => `${value}`} />

			{/* prop */}
			<Input.LazyString controller={c2} prop="name" />
			<Input.LazyNumber controller={c2} prop="age" />
			<Input.LazyGeneric controller={c2} prop="age" convert={(value) => parseInt(value)} display={(value) => `${value}`} />

			<Input.TextArea controller={c2} prop="name" />

			<Input.Select controller={c2} prop="name" options={['John' ,'Frank']} />

			<Input.String controller={c2sub} prop="subname" />
			<StringInputWrapper controller={c2sub} prop="subname" />
			
			Should break
			{/* <Input.Select controller={c2} prop="name" options={[{key: 'John', value: 34}]} /> */}
			<Input.Select controller={c2} prop="age" options={[{key: 34, value: 34}]} />
		</>
	)
}
