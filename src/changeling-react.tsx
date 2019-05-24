import * as React from 'react'
import { Changeable, Changeling, forFuncs } from './changeling'

export function wrapComponent<R, P extends Changeable<R>>(Component: React.ComponentType<Changeable<R> & P>) {
	return <T, K extends Match<T, R>>(props: Subtract<P, Changeable<R>> & { changeling: Changeling<T>, name: K }) => {
		const { changeling, name, ...rest } = props
		const changeable = changeling.prop(name)
		return (
			<Component value={changeable.value} onChange={changeable.onChange} {...rest as any} />
		)
	}
}

type Match<T, R> = {
	[P in keyof T]: T[P] extends R ? P : never
}[keyof T]

type Subtract<T extends T1, T1 extends object> = Pick<T, Exclude<keyof T, keyof T1>>

type ElementAttributes = React.InputHTMLAttributes<HTMLInputElement>

interface ChangelingInputProps<T, K extends keyof T> extends ElementAttributes {
	changeling: Changeling<T>
	changelingProperty: K
}
export class ChangelingInput<T, K extends keyof T> extends React.Component<ChangelingInputProps<T, K>> {

	public render() {
		const { changeling, changelingProperty, ...rest } = this.props
		const value = changeling.prop(changelingProperty).value
		return (
			<input value={`${value}` || ''} onChange={this.onChange} {...rest} />
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		this.props.changeling.prop(this.props.changelingProperty).onChange(this.convertValue(evt.target.value))
	}

	private convertValue = (value: string): T[K] => {
		return value as any
	}
}

// interface TTT {
// 	blah: string
// }
// let cc: TTT = {
// 	blah: 'what',
// }
// const c = forFuncs(
// 	() => cc, 
// 	(newValue: TTT) => {
// 		cc = newValue
// 		return
// 	}
// )


// (
// 	<ChangelingInput changeling={} changelingProperty="" />
// )