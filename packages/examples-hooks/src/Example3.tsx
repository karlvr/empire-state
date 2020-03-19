/**
 * An example of using Changeling manually; without the helper React components.
 */

import { useFormalities } from 'formalities'
import * as React from 'react'

interface MyFormState {
	name?: string
	age?: number
	address?: string
}

const INITIAL_STATE: MyFormState = {}

export default function Example3() {
	const controller = useFormalities(INITIAL_STATE)

	const nameSnapshot = controller.snapshot('name')
	const ageSnapshot = controller.snapshot('age')
	const addressSnapshot = controller.snapshot('address')

	const state = controller.snapshot().value
	return (
		<div>
			<h1>Example 3: Manual</h1>
			<div>
				<label>Name:</label>
				<input type="text" value={nameSnapshot.value || ''} onChange={evt => nameSnapshot.setValue(evt.target.value)} />
			</div>
			<div>
				<label>Age:</label>
				<input type="number" value={ageSnapshot.value !== undefined ? ageSnapshot.value : ''} onChange={evt => {
					const age = parseInt(evt.target.value, 10)
					if (!isNaN(age)) {
						ageSnapshot.setValue(age)
					} else {
						ageSnapshot.setValue(undefined)
					}
				}} />
			</div>
			<div>
				<label>Address:</label>
				<textarea value={addressSnapshot.value || ''} onChange={evt => addressSnapshot.setValue(evt.target.value)} />
			</div>
			<h2>Summary</h2>
			{state && (
				<>
					<div>Name: {state.name}</div>
					<div>Age: {state.age}</div>
					<div>Address: {state.address}</div>
				</>
			)}
		</div>
	)
}
