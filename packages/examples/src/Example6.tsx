/**
 * An example of repeating fields.
 */

import * as React from 'react'
import { useController, Formalities } from 'formalities'

interface MyFormState {
	names?: string[]
}

const INITIAL_STATE: MyFormState = {}

export default function Example6() {

	const controller = useController(INITIAL_STATE)
	const namesController = controller.controller('names')
	const namesSnapshot = namesController.snapshot()

	function addNew(evt: React.MouseEvent) {
		const namesSnapshot = namesController.snapshot()

		namesSnapshot.setValue([...(namesSnapshot.value || []), ''])
	}

	return (
		<div>
			<h1>Example 6: Repeating</h1>
			{
				(namesSnapshot.value || []).map((name, index) => (
					<Formalities.Text key={index} controller={namesController.controller(index)} prop="this" />
				))
			}

			<button onClick={addNew}>Add New</button>

			<h2>Summary</h2>
			<p>{namesSnapshot.value && namesSnapshot.value.join(', ')}</p>
		</div>
	)

}
