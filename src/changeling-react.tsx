import * as React from 'react'
import { Snapshot, Controller } from './changeling'
import { Omit, Subtract, CompatibleKeys } from './utilities';
import { KEY, PROPERTY, KEYABLE } from './types';

export function wrapComponent<R, P extends Snapshot<R>>(Component: React.ComponentType<Snapshot<R> & P>) {
	return <T, K extends CompatibleKeys<KEYABLE<T>, R>>(props: Subtract<P, Snapshot<R>> & { controller: Controller<T>, prop: K }) => {
		const { controller, prop, ...rest } = props
		const c = controller.snapshot(prop as any as KEY<T>)
		return (
			<Component value={c.value} onChange={c.onChange} {...rest as any} />
		)
	}
}

interface InputProps<T, K extends KEY<T>> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
	controller: Controller<T>
	convert?: (value: string) => PROPERTY<T, K>
	prop: K
}

export class Input<T, K extends KEY<T>> extends React.Component<InputProps<T, K>> {

	public render() {
		const { controller, prop, ...rest } = this.props
		const value = controller.snapshot(prop).value
		return (
			<input value={value !== undefined && value !== null ? `${value}` : ''} onChange={this.onChange} {...rest} />
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		this.props.controller.snapshot(this.props.prop).onChange(this.convertValue(evt.target.value))
	}

	private convertValue = (value: string): PROPERTY<T, K> => {
		if (this.props.convert) {
			return this.props.convert(value)
		} else {
			return value as any
		}
	}

}

interface LazyInputProps<T, K extends KEY<T>> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'onBlur'> {
	controller: Controller<T>
	convert?: (value: string) => PROPERTY<T, K> | undefined
	prop: K
	display?: (value: PROPERTY<T, K>) => string
}

export class LazyInput<T, K extends KEY<T>> extends React.Component<LazyInputProps<T, K>> {

	public render() {
		const { controller, prop, ...rest } = this.props

		const value = controller.snapshot(prop).value
		const displayValue = this.displayValue(value)
		return (
			<input key={displayValue} defaultValue={displayValue} onBlur={this.onBlur} {...rest} />
		)
	}

	private onBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
		const { controller, prop } = this.props

		const snapshot = controller.snapshot(prop)
		const value = this.convertValue(evt.target.value)
		if (value !== undefined) {
			snapshot.onChange(value)
		} else {
			evt.target.value = this.displayValue(snapshot.value)
			evt.target.select()
		}
	}

	private displayValue = (value: PROPERTY<T, K>): string => {
		if (this.props.display) {
			return this.props.display(value)
		}

		if (value !== undefined && value !== null) {
			return `${value}`
		} else {
			return ''
		}
	}

	private convertValue = (value: string): PROPERTY<T, K> | undefined => {
		if (this.props.convert) {
			return this.props.convert(value)
		} else {
			return value as any
		}
	}

}

interface TextAreaProps<T, K extends KEY<T>> extends Omit<React.InputHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
	controller: Controller<T>
	convert?: (value: string) => PROPERTY<T, K>
	prop: K
}

export class TextArea<T, K extends KEY<T>> extends React.Component<TextAreaProps<T, K>> {

	public render() {
		const { controller, prop, ...rest } = this.props
		const value = controller.snapshot(prop).value
		return (
			<textarea value={value !== undefined && value !== null ? `${value}` : ''} onChange={this.onChange} {...rest} />
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.props.controller.snapshot(this.props.prop).onChange(this.convertValue(evt.target.value))
	}

	private convertValue = (value: string): PROPERTY<T, K> => {
		if (this.props.convert) {
			return this.props.convert(value)
		} else {
			return value as any
		}
	}

}
