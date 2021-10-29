/**
 * An example of using Formalities manually; without the helper React components.
 */

import { useController, useSnapshot } from 'formalities'
import React from 'react'

interface MyFormState {
	name?: string
	age?: number
	address?: string
}

export default function Example3() {
	const controller = useController<MyFormState>({})

	const nameSnapshot = controller.snapshot('name')
	const ageSnapshot = controller.snapshot('age')
	const addressSnapshot = controller.snapshot('address')

	const [state] = useSnapshot(controller)
	return (
		<div>
			<h1>Example 3: Manual</h1>
			<div>
				<label>Name:</label>
				<input type="text" value={nameSnapshot.value || ''} onChange={evt => nameSnapshot.change(evt.target.value)} />
			</div>
			<div>
				<label>Age:</label>
				<input type="number" value={ageSnapshot.value !== undefined ? ageSnapshot.value : ''} onChange={evt => {
					const age = parseInt(evt.target.value, 10)
					if (!isNaN(age)) {
						ageSnapshot.change(age)
					} else {
						ageSnapshot.change(undefined)
					}
				}} />
			</div>
			<div>
				<label>Address:</label>
				<textarea value={addressSnapshot.value || ''} onChange={evt => addressSnapshot.change(evt.target.value)} />
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
