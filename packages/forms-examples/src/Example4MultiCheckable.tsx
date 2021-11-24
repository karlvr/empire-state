/**
 * An example of using empire-state-forms with Checkable input elements.
 */

import { MultiCheckable, useNewController, useSnapshot } from 'empire-state-forms'
import React from 'react'

interface MyFormState {
	favouriteAnimals: string[]
}

const INITIAL_STATE: MyFormState = {
	favouriteAnimals: [],
}

export default function Example4() {

	const controller = useNewController(INITIAL_STATE)
	const [state] = useSnapshot(controller)

	return (
		<div>
			<h1>Example 4a: Multi Checkable</h1>
			<div>
				<label><MultiCheckable 
					type="checkbox" 
					name="favouriteAnimals" 
					checkedValue="giraffes"
					controller={controller} 
					prop="favouriteAnimals" 
				/> Giraffes</label>
				<label><MultiCheckable 
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
