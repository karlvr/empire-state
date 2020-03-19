/**
 * An example of repeating fields using Indexed component.
 */

import { useController, Formalities, Controller, IndexedCursor, IndexedActions } from 'formalities'
import * as React from 'react'

interface MyFormState {
	names?: string[]
}

const INITIAL_STATE: MyFormState = {}

export default function Example7() {

	const controller = useController(INITIAL_STATE)
	const state = controller.snapshot().value

	function renderChild(controller: Controller<string>, cursor: IndexedCursor, actions: IndexedActions<string>) {
		return (
			<React.Fragment key={cursor.index}>
				<Formalities.Text controller={controller} prop="this" />
				<button onClick={() => actions.onRemove(cursor.index)}>X</button>
				<button onClick={() => actions.onInsert(cursor.index + 1, '')}>+</button>
			</React.Fragment>
		)
	}

	function renderBefore(actions: IndexedActions<string>) {
		return (
			<button onClick={() => actions.onInsert(0, '')}>Add New Before</button>
		)
	}

	function renderAfter(actions: IndexedActions<string>) {
		return (
			<button onClick={() => actions.onPush('')}>Add New After</button>
		)
	}

	return (
		<div>
			<h1>Example 7: Indexed</h1>
			<Formalities.Indexed 
				controller={controller} 
				prop="names" 
				renderBefore={renderBefore}
				renderEach={renderChild}
				renderAfter={renderAfter}
			/>

			<h2>Summary</h2>
			<p>{state.names && state.names.join(', ')}</p>
		</div>
	)
}
