/**
 * An example of how we used to manage simple form state in a React component.
 */

import { useState } from 'react'
import React from 'react'

export default function MyForm() {
	const [name, setName] = useState<string | undefined>(undefined)
	const [age, setAge] = useState<number | undefined>(undefined)
	const [address, setAddress] = useState<string | undefined>(undefined)

	function onChangeName(evt: React.ChangeEvent<HTMLInputElement>) {
		setName(evt.target.value)
	}

	function onChangeAge(evt: React.FocusEvent<HTMLInputElement>) {
		const newAge = parseInt(evt.target.value, 10)
		if (isNaN(newAge)) {
			evt.target.value = age !== undefined ? `${age}` : ''
			evt.target.select()
		} else {
			setAge(newAge)
		}
	}

	function onChangeAddress(evt: React.ChangeEvent<HTMLInputElement>) {
		setAddress(evt.target.value)
	}

	return (
		<div>
			<h1>Existing</h1>
			<div>
				<label>Name:</label>
				<input type="text" value={name || ''} onChange={onChangeName} />
			</div>
			<div>
				<label>Age:</label>
				<input type="number" defaultValue={age !== undefined ? `${age}` : ''} onBlur={onChangeAge} />
			</div>
			<div>
				<label>Address:</label>
				<input type="text" value={address || ''} onChange={onChangeAddress} />
			</div>
			<h2>Output</h2>
			<div>Name: {name}</div>
			<div>Age: {age}</div>
			<div>Address: {address}</div>
		</div>
	)
}
