/**
 * An example of using Changeling manually; without the helper React components.
 */

import { forComponentState, Snapshot, withFuncs } from 'formalities-hocs'
import * as React from 'react'

interface MyFormState {
	myStuff?: {
		name?: string
		age?: number
		address?: string
	}
}

const INITIAL_STATE: MyFormState = {}

export default class Example3 extends React.Component<{}, MyFormState> {

	public state = INITIAL_STATE

	private controller = withFuncs(
		() => this.state.myStuff,
		(newStuff) => this.setState({
			myStuff: newStuff,
		})
	)

	public render() {
		const nameSnapshot = this.controller.snapshot('name')
		const ageSnapshot = this.controller.snapshot('age')
		const addressSnapshot = this.controller.snapshot('address')
		return (
			<div>
				<h1>Example 3: Manual</h1>
				<div>
					<label>Name:</label>
					<input type="text" value={nameSnapshot.value || ''} onChange={evt => nameSnapshot.onChange(evt.target.value)} />
				</div>
				<div>
					<label>Age:</label>
					<input type="number" value={ageSnapshot.value !== undefined ? ageSnapshot.value : ''} onChange={evt => {
						const age = parseInt(evt.target.value, 10)
						if (!isNaN(age)) {
							ageSnapshot.onChange(age)
						} else {
							ageSnapshot.onChange(undefined)
						}
					}} />
				</div>
				<div>
					<label>Address:</label>
					<textarea value={addressSnapshot.value || ''} onChange={evt => addressSnapshot.onChange(evt.target.value)} />
				</div>
				<h2>Summary</h2>
				{this.state.myStuff && (
					<>
						<div>Name: {this.state.myStuff.name}</div>
						<div>Age: {this.state.myStuff.age}</div>
						<div>Address: {this.state.myStuff.address}</div>
					</>
				)}
			</div>
		)
	}

}
