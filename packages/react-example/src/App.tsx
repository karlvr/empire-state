import React, { useCallback, useRef, useState } from 'react'
import { Controller, useNewController, useSnapshot } from 'react-immutable-state-controller'

interface Data {
	one?: Data2
	two?: Data2
}

interface Data2 {
	d: number
}

const SubCom = function(props: { name: string; valueName: string; controller: Controller<Data2 | undefined> }) {
	const { name, valueName, controller } = props
	const [d, changeD] = useSnapshot(controller, 'd')

	const renders = useRef(0)
	renders.current += 1

	console.log(`subcom ${name} render`, d)

	const handleAdd = useCallback(function() {
		changeD(d !== undefined ? d + 1 : 1)
	}, [changeD, d])

	return (
		<div className="value">
			<h2>{name}</h2>
			<p>Value from snapshot:</p>
			<pre>{valueName} = {d !== undefined ? d : 'undefined'}</pre>
			<button onClick={handleAdd}>Increment {valueName}</button>
			<p><small>{renders.current} renders</small></p>
		</div>
	)
}

const SubCom2 = function(props: { name: string; valueName: string; controller: Controller<Data | undefined>; prop: keyof Data }) {
	const { name, valueName, controller, prop } = props
	const [value, changeValue] = useSnapshot<Data | undefined, keyof Data, Data2 | undefined>(controller, prop)

	const renders = useRef(0)
	renders.current += 1

	console.log(`subcom2 ${name} render`, value)

	const handleAdd = useCallback(function() {
		changeValue(value !== undefined ? { d: (value.d || 0) + 1 } : { d: 1 })
	}, [changeValue, value])

	return (
		<div className="value">
			<h2>{name}</h2>
			<p>Value from snapshot:</p>
			<pre>{valueName} = {value !== undefined ? value.d : 'undefined'}</pre>
			<button onClick={handleAdd}>Increment {valueName}</button>
			<p><small>{renders.current} renders</small></p>
		</div>
	)
}

const App = function() {
	const controller = useNewController<Data>()
	const one = controller.get('one')
	const two = controller.get('two')
	const [forceRender, setForceRender] = useState(0)

	const renders = useRef(0)
	renders.current += 1

	console.log('app render', one.value)
	controller.addChangeListener(function(newValue) {
		console.log('app changed', newValue)

		/* Test that change listeners don't cause recursion */
		// controller.snapshot('one').change({ d: controller.value !== undefined && controller.value.one !== undefined ? (controller.value.one.d || 0) + 6 : 7 })
	})

	const handleAddOne = useCallback(function() {
		one.get('d').setValue(one.value !== undefined ? one.value.d + 1 : 1)
	}, [one])

	const handleAddTwo = useCallback(function() {
		two.get('d').setValue(two.value !== undefined ? two.value.d + 1 : 1)
	}, [two])

	const handleForceRender = useCallback(function(evt: React.MouseEvent) {
		evt.preventDefault()
		setForceRender(forceRender + 1)
	}, [forceRender])

	return (
		<div style={{ maxWidth: '66%' }}>
			<h1>Controller vs Snapshot demo</h1>
			<p>The value from a controller is always live, rather than being tied to a render. Changing the value in a controller <em>doesn't</em> trigger a re-render.</p>
			<p>The values displayed here won't change when incremented, as the component won't re-render. If we <em>force</em> this component to re-render we'll see that the values in the controller have in fact changed.</p>
			<p>That this component doesn't re-render is an <em>advantage</em>. It's demonstrating that the component that creates the controller doesn't re-render every time the
			controller's state changes. If you want to render any state from a controller, you must use a snapshot in order to benefit from automatic re-rendering.</p>

			<p>Value from controller:</p>
			<pre>one = {one.value !== undefined ? one.value.d : 'undefined'}</pre>
			<pre>two = {two.value !== undefined ? two.value.d : 'undefined'}</pre>
			<button onClick={handleAddOne}>Increment One</button>
			<button onClick={handleAddTwo}>Increment Two</button>
			<p><small>{renders.current} renders (<a href="/" onClick={handleForceRender}>Force re-render</a>)</small></p>

			<SubCom name="One (using snapshot)" valueName="one" controller={controller.get('one')} />
			<SubCom2 name="One (using snapshot, alternative approach)" valueName="one" controller={controller} prop="one" />
			<SubCom name="Two (using snapshot)" valueName="two" controller={controller.get('two')} />
			<SubCom2 name="Two (using snapshot, alternative approach)" valueName="two" controller={controller} prop="two" />
		</div>
	)
}

export default App
