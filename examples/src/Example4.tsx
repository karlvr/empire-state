/**
 * An example of using Changeling with non-standard input elements.
 */

import { forComponentState, CheckableInput } from 'changeling'
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
				<h1>Example 4</h1>
				<div>
					<label><CheckableInput 
						type="checkbox" 
						name="likeAnimals" 
						value={true} 
						controller={this.controller} 
						prop="likeAnimals" 
						convert={this.toBoolean}
					/> Like animals</label>
				</div>
				<div>
					<label>Favourite animal:</label>
					<label>
						<CheckableInput type="radio" name="favouriteAnimal" value="Giraffe" controller={this.controller} prop="favouriteAnimal" />
						Giraffe
					</label>
					<label>
						<CheckableInput type="radio" name="favouriteAnimal" value="Cat" controller={this.controller} prop="favouriteAnimal" />
						Cat
					</label>
					<label>
						<CheckableInput type="radio" name="favouriteAnimal" value="Dog" controller={this.controller} prop="favouriteAnimal" />
						Dog
					</label>
				</div>
				<h2>Summary</h2>
				<div>Like animals: {this.state.likeAnimals} {typeof this.state.likeAnimals}</div>
				<div>Favourite animal: {this.state.favouriteAnimal}</div>
			</div>
		)
	}

	private toBoolean = (value: string): boolean => {
		return value === 'true'
	}

}
