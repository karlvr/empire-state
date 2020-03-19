import * as React from 'react'
import { Snapshot, withMutable } from 'immutable-state-controller'
import { wrapComponent, Input } from './components'

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

const testController = withMutable(testState)

test('components can be used', () => {
	const all = (
		<>
			<Input.Text controller={testController} prop="d" />
			<Input.Number controller={testController} prop="b" />
			<Input.Checkable controller={testController} prop="c" checkedValue={true} />
			<Input.TextArea controller={testController} prop="a" rows={40} />
			<Input.Select controller={testController} prop="d" options={['aa', 'bb']} />
			<WrappedTestComponent controller={testController} prop="b" name="horse" />
			<Input.Indexed controller={testController} prop="e" />
			<Input.Indexed controller={testController} prop="f" />
		</>
	)
	expect(all).not.toBeUndefined()
})


