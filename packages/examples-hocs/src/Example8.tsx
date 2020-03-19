/**
 * An example of using Changeling to manage undefined properties.
 */

import { forComponentProps, forComponentState, Input, Snapshot, wrapComponent } from 'formalities-hocs'
import * as React from 'react'

interface MyFormState {
	myValue?: string
}

const INITIAL_STATE: MyFormState = {}

export default class Example8 extends React.Component<{}, MyFormState> {

	public state = INITIAL_STATE

	private controller = forComponentState(this)

	public render() {
		return (
			<div>
				<h1>Example 8: Undefined</h1>

				<Input.String controller={this.controller} prop="myValue" />
				<WrappedUndefinedSnapshot controller={this.controller} prop="myValue" /> 

				<h2>Summary</h2>
				{this.state.myValue || 'undefined'}
			</div>
		)
	}

}

class UndefinedSnapshot extends React.Component<Snapshot<string | undefined>> {
	
	private controller = forComponentProps(this)

	public render() {
		return (
			<Input.String controller={this.controller} prop="this" />
		)
	}

}

const WrappedUndefinedSnapshot = wrapComponent(UndefinedSnapshot)
