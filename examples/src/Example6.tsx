/**
 * An example of repeating fields.
 */

import { forComponentState, Input } from 'changeling'
import * as React from 'react'

interface MyFormState {
	names?: string[]
}

const INITIAL_STATE: MyFormState = {}

export default class Example6 extends React.Component<{}, MyFormState> {

	public state = INITIAL_STATE

	private controller = forComponentState(this)
	private namesController = this.controller.controller('names')

	public render() {
		const namesSnapshot = this.namesController.snapshot()
		return (
			<div>
				<h1>Example 6: Repeating</h1>
				{
					(namesSnapshot.value || []).map((name, index) => (
						<Input.String controller={this.namesController.controller(index)} prop="this" />
					))
				}

				<button onClick={this.addNew}>Add New</button>

				<h2>Summary</h2>
				<p>{namesSnapshot.value && namesSnapshot.value.join(', ')}</p>
			</div>
		)
	}

	private addNew = (evt: React.MouseEvent) => {
		const namesSnapshot = this.namesController.snapshot()

		namesSnapshot.onChange([ ...(namesSnapshot.value || []), ''])
	}

}
