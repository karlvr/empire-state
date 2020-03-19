/**
 * An example of using Changeling with Checkable input elements.
 */

import { Input, useFormalities } from 'formalities'
import * as React from 'react'

interface MyFormState {
	favouriteAnimals: string[]
}

const INITIAL_STATE: MyFormState = {
	favouriteAnimals: [],
}

export default function Example4() {

	const controller = useFormalities(INITIAL_STATE)
	const state = controller.snapshot().value

	return (
		<div>
			<h1>Example 4a: Multi Checkable</h1>
			<div>
				<label><Input.MultiCheckable 
					type="checkbox" 
					name="favouriteAnimals" 
					checkedValue="giraffes"
					controller={controller} 
					prop="favouriteAnimals" 
				/> Giraffes</label>
				<label><Input.MultiCheckable 
					type="checkbox" 
					name="favouriteAnimals" 
					checkedValue="cats"
					controller={controller} 
					prop="favouriteAnimals" 
				/> Cats</label>
			</div>
			<h2>Summary</h2>
			<div>Favourite animal: {state.favouriteAnimals.join(', ')}</div>
		</div>
	)
}
