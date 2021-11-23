import React from 'react'
import { Snapshot, controllerWithInitialValue } from 'react-immutable-state-controller'
import { wrapComponent, Formalities } from './components'

function TestComponent(props: Snapshot<number> & { name: string }) {
	return (
		<p>hi {props.value}</p>
	)
}

const WrappedTestComponent = wrapComponent(TestComponent)

const testState = {
	a: 'hi',
	b: 99,
	c: true,
	d: 'hello',
	e: ['a', 'b', 'c'],
	f: undefined as string[] | undefined,
	g: undefined as string | undefined,
}

const testController = controllerWithInitialValue(testState)

test('components can be used', () => {
	const all = (
		<>
			<Formalities.Text controller={testController} prop="d" />
			<Formalities.Number controller={testController} prop="b" />
			<Formalities.Checkable controller={testController} prop="c" checkedValue={true} />
			<Formalities.TextArea controller={testController} prop="a" rows={40} />
			<Formalities.Select controller={testController} prop="d" options={['aa', 'bb']} display={o => o} />
			<Formalities.Select controller={testController} prop="d" options={[
				{ value: 'aa' }, 
				{ value: 'bb' },
			]} />
			<WrappedTestComponent controller={testController} prop="b" name="horse" />
			<Formalities.Indexed controller={testController} prop="e" />
			<Formalities.Indexed controller={testController} prop="f" />
			<Formalities.Generic controller={testController} prop="b" convert={value => parseInt(value)} display={value => `${value}`} />
		</>
	)
	expect(all).not.toBeUndefined()
})


