/**
 * An example of using Changeling with Checkable input elements.
 */

import { forComponentState, Input, Controller } from 'changeling'
import * as React from 'react'

interface MyFormState {
	favouriteAnimals: string[]
}

const INITIAL_STATE: MyFormState = {
	favouriteAnimals: [],
}

export default class Example4 extends React.Component<{}, MyFormState> {

	public state = INITIAL_STATE

	private controller = forComponentState(this)

	public render() {
		return (
			<div>
				<h1>Example 4a: Multi Checkable</h1>
				<div>
					<label><Input.MultiCheckable 
						type="checkbox" 
						name="favouriteAnimals" 
						checkedValue="giraffes"
						controller={this.controller} 
						prop="favouriteAnimals" 
					/> Giraffes</label>
					<label><Input.MultiCheckable 
						type="checkbox" 
						name="favouriteAnimals" 
						checkedValue="cats"
						controller={this.controller} 
						prop="favouriteAnimals" 
					/> Cats</label>
				</div>
				<h2>Summary</h2>
				<div>Favourite animal: {this.state.favouriteAnimals.join(', ')}</div>
			</div>
		)
	}

}
