import * as React from 'react'
import { Changeable, Changeling, ChangeableProperties, ChangeablePropertiesHolder } from './changeling'

export function wrapComponent<R, P extends Changeable<R>>(Component: React.ComponentType<Changeable<R> & P>) {
	return <T, K extends CompatibleProperties<T, R>>(props: Subtract<P, Changeable<R>> & { changeling: Changeling<T>, changeable: K }) => {
		const { changeling, changeable, ...rest } = props
		const c = changeling.changeable(changeable)
		return (
			<Component value={c.value} onChange={c.onChange} {...rest as any} />
		)
	}
}

/** Returns the properties in T that are assignable to type R */
type CompatibleProperties<T, R> = {
	[P in ChangeableProperties<T>]: ChangeablePropertiesHolder<T>[P] extends R ? P : never
}[ChangeableProperties<T>]

type Subtract<T extends T1, T1 extends object> = Pick<T, Exclude<keyof T, keyof T1>>
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

interface ChangelingInputProps<T, K extends ChangeableProperties<T>> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
	changeling: Changeling<T>
	convert?: (value: string) => ChangeablePropertiesHolder<T>[K]
	changeable: K
}

export class ChangelingInput<T, K extends ChangeableProperties<T>> extends React.Component<ChangelingInputProps<T, K>> {

	public render() {
		const { changeling, changeable, ...rest } = this.props
		const value = changeling.changeable(changeable).value
		return (
			<input value={value !== undefined && value !== null ? `${value}` : ''} onChange={this.onChange} {...rest} />
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		this.props.changeling.changeable(this.props.changeable).onChange(this.convertValue(evt.target.value))
	}

	private convertValue = (value: string): ChangeablePropertiesHolder<T>[K] => {
		if (this.props.convert) {
			return this.props.convert(value)
		} else {
			return value as any
		}
	}

}

interface ChangelingLazyInputProps<T, K extends ChangeableProperties<T>> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'onBlur'> {
	changeling: Changeling<T>
	convert?: (value: string) => ChangeablePropertiesHolder<T>[K] | undefined
	changeable: K
	display?: (value: ChangeablePropertiesHolder<T>[K]) => string
}

export class ChangelingLazyInput<T, K extends ChangeableProperties<T>> extends React.Component<ChangelingLazyInputProps<T, K>> {

	public render() {
		const { changeling, changeable, ...rest } = this.props

		const value = changeling.changeable(changeable).value
		const displayValue = this.displayValue(value)
		return (
			<input key={displayValue} defaultValue={displayValue} onBlur={this.onBlur} {...rest} />
		)
	}

	private onBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
		const { changeling, changeable } = this.props

		const c = changeling.changeable(changeable)
		const value = this.convertValue(evt.target.value)
		if (value !== undefined) {
			c.onChange(value)
		} else {
			evt.target.value = this.displayValue(c.value)
			evt.target.select()
		}
	}

	private displayValue = (value: ChangeablePropertiesHolder<T>[K]): string => {
		if (this.props.display) {
			return this.props.display(value)
		}

		if (value !== undefined && value !== null) {
			return `${value}`
		} else {
			return ''
		}
	}

	private convertValue = (value: string): ChangeablePropertiesHolder<T>[K] | undefined => {
		if (this.props.convert) {
			return this.props.convert(value)
		} else {
			return value as any
		}
	}

}

interface ChangelingTextAreaProps<T, K extends ChangeableProperties<T>> extends Omit<React.InputHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
	changeling: Changeling<T>
	convert?: (value: string) => ChangeablePropertiesHolder<T>[K]
	changeable: K
}

export class ChangelingTextArea<T, K extends ChangeableProperties<T>> extends React.Component<ChangelingTextAreaProps<T, K>> {

	public render() {
		const { changeling, changeable, ...rest } = this.props
		const value = changeling.changeable(changeable).value
		return (
			<textarea value={value !== undefined && value !== null ? `${value}` : ''} onChange={this.onChange} {...rest} />
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.props.changeling.changeable(this.props.changeable).onChange(this.convertValue(evt.target.value))
	}

	private convertValue = (value: string): ChangeablePropertiesHolder<T>[K] => {
		if (this.props.convert) {
			return this.props.convert(value)
		} else {
			return value as any
		}
	}

}
