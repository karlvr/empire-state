/**
 * An example of using Changeling with Select input elements.
 */

import { forComponentState, Input, Controller } from 'formalities-hocs'
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
				<h1>Example 5: Select</h1>
				<div>
					<label>Like animals:</label>
					<Input.Select controller={this.controller} prop="likeAnimals" options={[
						'',
						'Yes',
						'No',
					]}
					/> (uses strings)
				</div>
				<div>
					<label>Like animals:</label>
					<Input.Select controller={this.controller} prop="likeAnimals" options={[
						{ value: undefined, text: '' },
						{ value: true, text: 'Yes' },
						{ value: false, text: 'No' },
					]}
					/> (uses the right types)
				</div>
				<div>
					<label>Favourite animal:</label>
					<Input.Select controller={this.controller} prop="favouriteAnimal" options={[
						{value: ''},
						{value: 'Kangaroo'},
						{value: 'Donkey'},
						{value: 'Giraffe', text: 'Mr Giraffe'}, 
					]} />
				</div>
				<div>
					<label>Favourite animal 2:</label>
					<Input.Select controller={this.controller} prop="favouriteAnimal" options={['', 'Kangaroo', 'Donkey', 'Giraffe', 'Tuatara']} />
				</div>
				<h2>Summary</h2>
				<div>Like animals: {`${this.state.likeAnimals}`} ({typeof this.state.likeAnimals})</div>
				<div>Favourite animal: {this.state.favouriteAnimal}</div>
			</div>
		)
	}

}
