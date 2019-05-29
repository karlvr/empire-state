/**
 * An example of using Changeling with Checkable input elements.
 */

import { forComponentState, Input, Controller } from 'changeling'
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

export default class Example4 extends React.Component<{}, MyFormState> {

	public state = INITIAL_STATE

	private controller = forComponentState(this)

	public render() {
		return (
			<div>
				<h1>Example 4: Checkable</h1>
				<div>
					<label><Input.Checkable 
						type="checkbox" 
						name="likeAnimals" 
						checkedValue={true} 
						uncheckedValue={false}
						controller={this.controller} 
						prop="likeAnimals" 
					/> Like animals</label>
				</div>
				<div>
					<label>Favourite animal:</label>
					<label>
						<Input.Checkable type="radio" name="favouriteAnimal" checkedValue="Giraffe" controller={this.controller} prop="favouriteAnimal" />
						Giraffe
					</label>
					<label>
						<Input.Checkable type="radio" name="favouriteAnimal" checkedValue="Cat" controller={this.controller} prop="favouriteAnimal" />
						Cat
					</label>
					<label>
						<Input.Checkable type="radio" name="favouriteAnimal" checkedValue="Dog" controller={this.controller} prop="favouriteAnimal" />
						Dog
					</label>
				</div>
				<h2>Summary</h2>
				<div>Like animals: {`${this.state.likeAnimals}`} ({typeof this.state.likeAnimals})</div>
				<div>Favourite animal: {this.state.favouriteAnimal}</div>
			</div>
		)
	}

	private toBoolean = (value: string): boolean => {
		return value === 'true'
	}

}
