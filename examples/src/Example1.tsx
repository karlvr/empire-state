/**
 * An example of using Changeling to manage a simple form state.
 */

import { forComponentState, Input, LazyInput, TextArea } from 'changeling'
import * as React from 'react'

interface MyFormState {
	name?: string
	age?: number
	address?: string
}

const INITIAL_STATE: MyFormState = {}

export default class Example1 extends React.Component<{}, MyFormState> {

	public state = INITIAL_STATE

	private controller = forComponentState(this)

	public render() {
		return (
			<div>
				<h1>Example 1</h1>
				<div>
					<label>Name:</label>
					<Input type="text" controller={this.controller} prop="name" />
				</div>
				<div>
					<label>Age:</label>
					<LazyInput type="text" controller={this.controller} prop="age" convert={this.toNumber} />
				</div>
				<div>
					<label>Address:</label>
					<TextArea type="text" controller={this.controller} prop="address" />
				</div>
				<h2>Summary</h2>
				<div>Name: {this.state.name}</div>
				<div>Age: {this.state.age}</div>
				<div>Address: {this.state.address}</div>
			</div>
		)
	}

	private toNumber(value: string): number | undefined {
		const result = parseInt(value, 10)
		if (isNaN(result)) {
			return undefined
		}
		return result
	}

}
