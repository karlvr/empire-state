import * as React from 'react'
import { Changeable, Changeling } from './changeling'

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
