import * as React from 'react'
import { Changeable, Changeling } from './changeling'

export function wrapComponent<R, P extends Changeable<R>>(Component: React.ComponentType<Changeable<R> & P>) {
	return <T, K extends Match<T, R>>(props: Subtract<P, Changeable<R>> & { changeling: Changeling<T>, name: K }) => {
		const { changeling, name, ...rest } = props
		const changeable = changeling.changeable(name)
		return (
			<Component value={changeable.value} onChange={changeable.onChange} {...rest as any} />
		)
	}
}

type Match<T, R> = {
	[P in keyof T]: T[P] extends R ? P : never
}[keyof T]

type Subtract<T extends T1, T1 extends object> = Pick<T, Exclude<keyof T, keyof T1>>
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

interface ChangelingInputProps<T, K extends keyof T> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
	changeling: Changeling<T>
	convert?: (value: string) => T[K]
	prop: K
}

export class ChangelingInput<T, K extends keyof T> extends React.Component<ChangelingInputProps<T, K>> {

	public render() {
		const { changeling, prop, ...rest } = this.props
		const value = changeling.changeable(prop).value
		return (
			<input value={value !== undefined && value !== null ? `${value}` : ''} onChange={this.onChange} {...rest} />
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		this.props.changeling.changeable(this.props.prop).onChange(this.convertValue(evt.target.value))
	}

	private convertValue = (value: string): T[K] => {
		if (this.props.convert) {
			return this.props.convert(value)
		} else {
			return value as any
		}
	}

}

interface ChangelingTextAreaProps<T, K extends keyof T> extends Omit<React.InputHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
	changeling: Changeling<T>
	convert?: (value: string) => T[K]
	prop: K
}

export class ChangelingTextArea<T, K extends keyof T> extends React.Component<ChangelingTextAreaProps<T, K>> {

	public render() {
		const { changeling, prop, ...rest } = this.props
		const value = changeling.changeable(prop).value
		return (
			<textarea value={value !== undefined && value !== null ? `${value}` : ''} onChange={this.onChange} {...rest} />
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.props.changeling.changeable(this.props.prop).onChange(this.convertValue(evt.target.value))
	}

	private convertValue = (value: string): T[K] => {
		if (this.props.convert) {
			return this.props.convert(value)
		} else {
			return value as any
		}
	}

}
