/**
 * An example of using Changeling with Checkable input elements.
 */

import { useController, Input } from 'formalities'
import * as React from 'react'

interface MyFormState {
	likeAnimals: boolean
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
			<h1>Example 4: Checkable</h1>
			<div>
				<label><Input.Checkable 
					type="checkbox" 
					name="likeAnimals" 
					checkedValue={true} 
					uncheckedValue={false}
					controller={controller} 
					prop="likeAnimals" 
				/> Like animals</label>
			</div>
			<div>
				<label>Favourite animal:</label>
				<label>
					<Input.Checkable type="radio" name="favouriteAnimal" checkedValue="Giraffe" controller={controller} prop="favouriteAnimal" />
					Giraffe
				</label>
				<label>
					<Input.Checkable type="radio" name="favouriteAnimal" checkedValue="Cat" controller={controller} prop="favouriteAnimal" />
					Cat
				</label>
				<label>
					<Input.Checkable type="radio" name="favouriteAnimal" checkedValue="Dog" controller={controller} prop="favouriteAnimal" />
					Dog
				</label>
			</div>
			<h2>Summary</h2>
			<div>Like animals: {`${state.likeAnimals}`} ({typeof state.likeAnimals})</div>
			<div>Favourite animal: {state.favouriteAnimal}</div>
		</div>
	)
}
