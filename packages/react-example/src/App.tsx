import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { Controller, useController, useSnapshot, useSnapshotController, Snapshot } from 'react-immutable-state-controller'

interface Data {
	one?: Data2
	two?: Data2
}

interface Data2 {
	d: number
}

const SubCom = function(props: { name: string; controller: Controller<Data2 | undefined> }) {
	const { name, controller } = props
	const b = useSnapshot(controller, 'd')

	console.log(`subcom ${name} render`, b.value)

	const handleAdd = useCallback(function() {
		b.change(b.value !== undefined ? b.value + 1 : 1)
	}, [b])

	return (
		<div>
			<h2>{name}</h2>
			<p>Value is {b.value !== undefined ? b.value : 'undefined'}</p>
			<button onClick={handleAdd}>Add</button>
		</div>
	)
}

const SubCom2 = function(props: { name: string; controller: Controller<Data | undefined>; prop: keyof Data }) {
	const { name, controller, prop } = props
	const b: Snapshot<Data2 | undefined> = useSnapshot<Data | undefined, keyof Data, Data2 | undefined>(controller, prop)

	console.log(`subcom2 ${name} render`, b.value)

	const handleAdd = useCallback(function() {
		b.change(b.value !== undefined ? { d: (b.value.d || 0) + 1 } : { d: 1 })
	}, [b])

	return (
		<div>
			<h2>{name}</h2>
			<p>Value is {b.value !== undefined ? b.value.d : 'undefined'}</p>
			<button onClick={handleAdd}>Add</button>
		</div>
	)
}

const App = function() {
	const controller = useController<Data>()
	const b = controller.controller('one').snapshot('d')

	console.log('app render', b.value)
	controller.addChangeListener(function(newValue) {
		console.log('app changed', newValue)

		/* Test that change listeners don't cause recursion */
		// controller.snapshot('one').change({ d: controller.value !== undefined && controller.value.one !== undefined ? (controller.value.one.d || 0) + 6 : 7 })
	})

	const handleAdd = useCallback(function() {
		b.change(b.value !== undefined ? b.value + 1 : 1)
	}, [b])

	return (
		<div>
			<h1>Example</h1>
			<p>b = {b.value}</p>
			<button onClick={handleAdd}>Add</button>
			<SubCom name="First v1" controller={controller.controller('one')} />
			<SubCom2 name="First v2" controller={controller} prop="one" />
			<SubCom name="Second v1" controller={controller.controller('two')} />
			<SubCom2 name="Second v2" controller={controller} prop="two" />
		</div>
	)
}

export default App
