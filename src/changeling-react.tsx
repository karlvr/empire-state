import * as React from 'react'
import { Snapshot, Controller } from './changeling'
import { Omit, Subtract, CompatibleKeys } from './utilities';
import { KEY, KEYABLE, ANDTHIS, ANDTHISPROPERTY } from './types';

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
	convert: (value: R) => ANDTHISPROPERTY<T, K>
	display?: (value: ANDTHISPROPERTY<T, K> | undefined) => R
}

function wrapComponentConvert<R, P extends Snapshot<R>>(Component: React.ComponentType<Snapshot<R> & P>) {
	return <T, K extends KEY<ANDTHIS<T>>>(props: Subtract<P, Snapshot<R>> & WrapComponentConvertType<T, K, R>) => {
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

interface BaseInputProps<T> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>, Snapshot<T> {
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

interface CheckableInputProps<T> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'onChange' | 'value'>, Snapshot<T> {
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

interface LazyBaseInputProps<T> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'defaultValue' | 'onBlur' | 'convert' | 'display'>, Snapshot<T> {
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

interface BaseTextAreaProps<T> extends Omit<React.InputHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>, Snapshot<T> {
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
}
