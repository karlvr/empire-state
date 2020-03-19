/**
 * An example of using Changeling with Select input elements.
 */

import * as React from 'react'
import { useController, Input } from 'formalities'

interface MyFormState {
	likeAnimals?: boolean
	favouriteAnimal: string
	favouriteBand: string
}

const INITIAL_STATE: MyFormState = {
	likeAnimals: true,
	favouriteAnimal: 'Giraffe',
	favouriteBand: 'The Cure',
}

export default function Example4() {

	const controller = useController(INITIAL_STATE)
	const state = controller.snapshot().value

	return (
		<div>
			<h1>Example 5: Select</h1>
			<div>
				<label>Like animals:</label>
				<Input.Select controller={controller} prop="likeAnimals" options={[
					undefined,
					true,
					false,
				]}
				/> (uses booleans)
			</div>
			<div>
				<label>Like animals:</label>
				<Input.Select controller={controller} prop="likeAnimals" options={[
					{ value: undefined, text: '' },
					{ value: true, text: 'Yes' },
					{ value: false, text: 'No' },
				]}
				/> (uses the right types)
			</div>
			<div>
				<label>Favourite animal:</label>
				<Input.Select controller={controller} prop="favouriteAnimal" options={[
					{ value: '' },
					{ value: 'Kangaroo' },
					{ value: 'Donkey' },
					{ value: 'Giraffe', text: 'Mr Giraffe' }, 
				]} />
			</div>
			<div>
				<label>Favourite animal 2:</label>
				<Input.Select controller={controller} prop="favouriteAnimal" options={['', 'Kangaroo', 'Donkey', 'Giraffe', 'Tuatara']} />
			</div>
			<h2>Summary</h2>
			<div>Like animals: {`${state.likeAnimals}`} ({typeof state.likeAnimals})</div>
			<div>Favourite animal: {state.favouriteAnimal}</div>
		</div>
	)
}
