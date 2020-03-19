/**
 * An example of how we used to manage simple form state in a React component.
 */

import * as React from 'react'

interface MyFormState {
	name?: string
	age?: number
	address?: string
}

const INITIAL_STATE: MyFormState = {}

export default class ExistingExample extends React.Component<{}, MyFormState> {

	public state = INITIAL_STATE

	public render() {
		return (
			<div>
				<h1>Existing</h1>
				<div>
					<label>Name:</label>
					<input type="text" value={this.state.name || ''} onChange={this.onChangeName} />
				</div>
				<div>
					<label>Age:</label>
					<input type="number" defaultValue={this.state.age !== undefined ? `${this.state.age}` : ''} onBlur={this.onChangeAge} />
				</div>
				<div>
					<label>Address:</label>
					<input type="text" value={this.state.address || ''} onChange={this.onChangeAddress} />
				</div>
				<h2>Output</h2>
				<div>Name: {this.state.name}</div>
				<div>Age: {this.state.age}</div>
				<div>Address: {this.state.address}</div>
			</div>
		)
	}

	private onChangeName = (evt: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			name: evt.target.value,
		})
	}

	private onChangeAge = (evt: React.FocusEvent<HTMLInputElement>) => {
		const age = parseInt(evt.target.value, 10)
		if (isNaN(age)) {
			evt.target.value = this.state.age !== undefined ? `${this.state.age}` : ''
			evt.target.select()
		} else {
			this.setState({
				age,
			})
		}
	}

	private onChangeAddress = (evt: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			address: evt.target.value,
		})
	}

}
