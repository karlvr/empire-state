/**
 * An example of using Formalities to manage a simple form state.
 */

import { useController, Formalities } from 'formalities'
import * as React from 'react'

interface MyFormState {
	name?: string
	age?: number
	address?: string
}

const INITIAL_STATE: MyFormState = {}

const Example1: React.FC = function() {

	const controller = useController(INITIAL_STATE)
	const state = controller.snapshot().value

	return (
		<div>
			<h1>Example 1: Simple</h1>
			<div>
				<label>Name:</label>
				<Formalities.Text type="text" controller={controller} prop="name" />
			</div>
			<div>
				<label>Age:</label>
				<Formalities.Number type="text" controller={controller} prop="age" />
			</div>
			<div>
				<label>Address:</label>
				<Formalities.TextArea controller={controller} prop="address" />
			</div>
			<h2>Summary</h2>
			<div>Name: {state.name}</div>
			<div>Age: {state.age}</div>
			<div>Address: {state.address}</div>
		</div>
	)
}

export default Example1
