/**
 * An example of repeating fields using Indexed component.
 */

import { useControllerWithInitialState, Text, Indexed, Controller, IndexedCursor, IndexedActions, useControllerValue } from 'empire-state-forms'
import React from 'react'

export default function Example7a() {

	const controller = useControllerWithInitialState<string[]>([])
	const [state] = useControllerValue(controller)

	function renderChild(controller: Controller<string>, cursor: IndexedCursor, actions: IndexedActions<string>) {
		return (
			<React.Fragment key={cursor.index}>
				<Text controller={controller} prop="this" />
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
			<h1>Example 7a: Indexed with an array controller</h1>
			<Indexed
				controller={controller}
				renderBefore={renderBefore}
				renderEach={renderChild}
				renderAfter={renderAfter}
			/>

			<h2>Summary</h2>
			<p>{state.join(', ')}</p>
		</div>
	)
}
