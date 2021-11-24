/**
 * An example of repeating fields.
 */

import React from 'react'
import { useNewController, Formalities, useSnapshot } from 'formalities'

interface MyFormState {
	names?: string[]
}

export default function Example6() {

	const controller = useNewController<MyFormState>({})
	const namesController = controller.get('names')
	const [names] = useSnapshot(namesController)

	function addNew(evt: React.MouseEvent) {
		const namesSnapshot = namesController.snapshot()

		namesSnapshot.change([...(namesSnapshot.value || []), ''])
	}

	return (
		<div>
			<h1>Example 6: Repeating</h1>
			{
				(names || []).map((name, index) => (
					<Formalities.Text key={index} controller={namesController.get(index)} />
				))
			}

			<button onClick={addNew}>Add New</button>

			<h2>Summary</h2>
			<p>{names && names.join(', ')}</p>
		</div>
	)

}
