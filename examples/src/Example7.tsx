/**
 * An example of repeating fields using Indexed component.
 */

import { forComponentState, Input, Controller, IndexedCursor, IndexedActions } from 'changeling'
import * as React from 'react'

interface MyFormState {
	names?: string[]
}

const INITIAL_STATE: MyFormState = {}

export default class Example7 extends React.Component<{}, MyFormState> {

	public state = INITIAL_STATE

	private controller = forComponentState(this)

	public render() {
		return (
			<div>
				<h1>Example 7: Indexed</h1>
				<Input.Indexed 
					controller={this.controller} 
					prop="names" 
					renderBefore={this.renderBefore}
					renderEach={this.renderChild}
					renderAfter={this.renderAfter}
				/>

				<h2>Summary</h2>
				<p>{this.state.names && this.state.names.join(', ')}</p>
			</div>
		)
	}

	private renderChild = (controller: Controller<string>, cursor: IndexedCursor, actions: IndexedActions<string>) => {
		return (
			<React.Fragment key={cursor.index}>
				<Input.String controller={controller} prop="this" />
				<button onClick={() => actions.onRemove(cursor.index)}>X</button>
				<button onClick={() => actions.onInsert(cursor.index + 1, '')}>+</button>
			</React.Fragment>
		)
	}

	private renderBefore = (actions: IndexedActions<string>) => {
		return (
			<button onClick={() => actions.onInsert(0, '')}>Add New Before</button>
		)
	}

	private renderAfter = (actions: IndexedActions<string>) => {
		return (
			<button onClick={() => actions.onPush('')}>Add New After</button>
		)
	}

}
